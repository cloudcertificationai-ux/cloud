// src/workers/transcode-worker.ts
import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { TranscodeJobData } from '@/lib/queue';
import { getR2Client } from '@/lib/r2-client';
import { prisma } from '@/lib/db';
import { MediaStatus } from '@prisma/client';
import { MonitoringService } from '@/lib/monitoring';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { getCacheHeaders } from '@/lib/cdn-cache';

const execAsync = promisify(exec);

/**
 * Transcode configuration
 */
const TRANSCODE_CONFIG = {
  variants: [
    {
      name: '1080p',
      resolution: '1920x1080',
      videoBitrate: '3000k',
      audioBitrate: '128k',
    },
    {
      name: '720p',
      resolution: '1280x720',
      videoBitrate: '1500k',
      audioBitrate: '128k',
    },
    {
      name: '480p',
      resolution: '854x480',
      videoBitrate: '700k',
      audioBitrate: '96k',
    },
  ],
  thumbnailCount: 5,
  thumbnailWidth: 320,
  segmentDuration: 6, // HLS segment duration in seconds
};

/**
 * Video metadata interface
 */
interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
}

/**
 * Transcode result interface
 */
interface TranscodeResult {
  manifestUrl: string;
  thumbnails: string[];
  duration: number;
  width: number;
  height: number;
}

/**
 * TranscodeWorker class handles video transcoding operations
 */
class TranscodeWorker {
  private r2Client = getR2Client();
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'transcode-worker');
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Process a transcode job
   */
  async processTranscode(job: Job<TranscodeJobData>): Promise<TranscodeResult> {
    const { mediaId, r2Key } = job.data;
    const startTime = Date.now();

    console.log(`[Transcode] Starting job for media ${mediaId}`);

    // Log transcode job start (Requirement 17.1)
    await MonitoringService.logTranscodeStart({
      mediaId,
      jobId: job.id || 'unknown',
      metadata: { r2Key },
    });

    try {
      // Update media status to PROCESSING
      await prisma.media.update({
        where: { id: mediaId },
        data: { status: MediaStatus.PROCESSING },
      });

      await job.updateProgress(10);

      // Step 1: Download source video from R2
      console.log(`[Transcode] Downloading source video: ${r2Key}`);
      const localSourcePath = await this.downloadSource(r2Key, mediaId);
      await job.updateProgress(20);

      // Step 2: Extract video metadata
      console.log(`[Transcode] Extracting metadata`);
      const metadata = await this.extractMetadata(localSourcePath);
      await job.updateProgress(30);

      // Step 3: Get watermark text if enabled (Requirement 16.4)
      let watermarkText: string | undefined;
      const watermarkEnabled = process.env.ENABLE_VIDEO_WATERMARKING === 'true';
      
      if (watermarkEnabled) {
        // Get the user who uploaded the media
        const media = await prisma.media.findUnique({
          where: { id: mediaId },
          include: {
            user: {
              select: { email: true },
            },
          },
        });
        
        if (media?.user?.email) {
          watermarkText = media.user.email;
          console.log(`[Transcode] Watermarking enabled for user: ${watermarkText}`);
        }
      }

      // Step 4: Generate HLS variants (with optional watermark)
      console.log(`[Transcode] Generating HLS variants`);
      const hlsOutput = await this.generateHLS(localSourcePath, mediaId, watermarkText);
      await job.updateProgress(60);

      // Step 5: Generate thumbnails
      console.log(`[Transcode] Generating thumbnails`);
      const thumbnails = await this.generateThumbnails(
        localSourcePath,
        mediaId,
        metadata.duration
      );
      await job.updateProgress(80);

      // Step 6: Upload all outputs to R2
      console.log(`[Transcode] Uploading outputs to R2`);
      await this.uploadOutputsToR2(mediaId, hlsOutput, thumbnails);
      await job.updateProgress(90);

      // Step 7: Update Media record with results
      const manifestUrl = this.r2Client.getPublicUrl(
        `media/${mediaId}/master.m3u8`
      );
      const thumbnailUrls = thumbnails.map((_, index) =>
        this.r2Client.getPublicUrl(`media/${mediaId}/thumb_${index}.jpg`)
      );

      await prisma.media.update({
        where: { id: mediaId },
        data: {
          status: MediaStatus.READY,
          manifestUrl,
          thumbnails: thumbnailUrls,
          duration: Math.round(metadata.duration),
          width: metadata.width,
          height: metadata.height,
          metadata: {
            codec: metadata.codec,
            bitrate: metadata.bitrate,
            watermarked: watermarkEnabled,
          },
        },
      });

      // Cleanup local files
      await this.cleanup(mediaId);

      const duration = Date.now() - startTime;
      console.log(
        `[Transcode] Completed job for media ${mediaId} in ${duration}ms`
      );

      // Log transcode job completion (Requirement 17.1)
      await MonitoringService.logTranscodeComplete({
        mediaId,
        jobId: job.id || 'unknown',
        duration,
        metadata: {
          manifestUrl,
          thumbnailCount: thumbnailUrls.length,
          videoDuration: Math.round(metadata.duration),
          resolution: `${metadata.width}x${metadata.height}`,
        },
      });

      await job.updateProgress(100);

      return {
        manifestUrl,
        thumbnails: thumbnailUrls,
        duration: Math.round(metadata.duration),
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      console.error(`[Transcode] Failed job for media ${mediaId}:`, error);

      const duration = Date.now() - startTime;

      // Log transcode job failure (Requirement 17.1)
      await MonitoringService.logTranscodeFailed({
        mediaId,
        jobId: job.id || 'unknown',
        duration,
        error: error instanceof Error ? error : new Error('Unknown error'),
        metadata: { r2Key },
      });

      // Update media status to FAILED
      await prisma.media.update({
        where: { id: mediaId },
        data: {
          status: MediaStatus.FAILED,
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            failedAt: new Date().toISOString(),
          },
        },
      });

      // Cleanup local files
      await this.cleanup(mediaId);

      throw error;
    }
  }

  /**
   * Download source video from R2
   */
  private async downloadSource(r2Key: string, mediaId: string): Promise<string> {
    const localPath = path.join(this.tempDir, `${mediaId}_source.mp4`);

    try {
      const { body } = await this.r2Client.getObject(r2Key);
      const writeStream = fs.createWriteStream(localPath);

      // Convert ReadableStream to Node.js Readable
      const nodeStream = Readable.fromWeb(body as any);
      await pipeline(nodeStream, writeStream);

      console.log(`[Transcode] Downloaded source to ${localPath}`);
      return localPath;
    } catch (error) {
      console.error(`[Transcode] Failed to download source:`, error);
      throw new Error(
        `Failed to download source video: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract video metadata using ffprobe
   */
  private async extractMetadata(inputPath: string): Promise<VideoMetadata> {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v quiet -print_format json -show_format -show_streams "${inputPath}"`
      );

      const data = JSON.parse(stdout);
      const videoStream = data.streams.find(
        (s: any) => s.codec_type === 'video'
      );

      if (!videoStream) {
        throw new Error('No video stream found');
      }

      return {
        duration: parseFloat(data.format.duration),
        width: videoStream.width,
        height: videoStream.height,
        codec: videoStream.codec_name,
        bitrate: parseInt(data.format.bit_rate) || 0,
      };
    } catch (error) {
      console.error(`[Transcode] Failed to extract metadata:`, error);
      throw new Error(
        `Failed to extract metadata: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate HLS variants using ffmpeg
   */
  private async generateHLS(
    inputPath: string,
    mediaId: string,
    watermarkText?: string
  ): Promise<{
    masterManifest: string;
    variants: Array<{
      resolution: string;
      playlist: string;
      segments: string[];
    }>;
  }> {
    const outputDir = path.join(this.tempDir, mediaId);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const variants: Array<{
      resolution: string;
      playlist: string;
      segments: string[];
    }> = [];

    // Generate each variant
    for (const variant of TRANSCODE_CONFIG.variants) {
      const variantDir = path.join(outputDir, variant.name);
      if (!fs.existsSync(variantDir)) {
        fs.mkdirSync(variantDir, { recursive: true });
      }

      const playlistPath = path.join(variantDir, 'playlist.m3u8');
      const segmentPattern = path.join(variantDir, 'segment_%03d.ts');

      console.log(`[Transcode] Generating ${variant.name} variant`);

      // Build video filter chain
      let videoFilter = `scale=${variant.resolution}:force_original_aspect_ratio=decrease`;
      
      // Add watermark if enabled (Requirement 16.4)
      if (watermarkText) {
        // Escape special characters for ffmpeg drawtext filter
        const escapedText = watermarkText
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/:/g, '\\:');
        
        // Add text overlay in bottom-right corner with semi-transparent background
        videoFilter += `,drawtext=text='${escapedText}':fontsize=16:fontcolor=white@0.7:x=w-tw-10:y=h-th-10:box=1:boxcolor=black@0.5:boxborderw=5`;
      }

      // ffmpeg command to generate HLS variant
      const ffmpegCmd = [
        'ffmpeg',
        '-i', `"${inputPath}"`,
        '-vf', `"${videoFilter}"`,
        '-c:v', 'libx264',
        '-b:v', variant.videoBitrate,
        '-c:a', 'aac',
        '-b:a', variant.audioBitrate,
        '-hls_time', TRANSCODE_CONFIG.segmentDuration.toString(),
        '-hls_playlist_type', 'vod',
        '-hls_segment_filename', `"${segmentPattern}"`,
        '-f', 'hls',
        `"${playlistPath}"`
      ].join(' ');

      await execAsync(ffmpegCmd);

      // Get list of generated segments
      const segments = fs
        .readdirSync(variantDir)
        .filter((file) => file.endsWith('.ts'))
        .map((file) => path.join(variantDir, file));

      variants.push({
        resolution: variant.resolution,
        playlist: playlistPath,
        segments,
      });

      console.log(
        `[Transcode] Generated ${variant.name} with ${segments.length} segments`
      );
    }

    // Generate master manifest
    const masterManifestPath = path.join(outputDir, 'master.m3u8');
    const masterContent = this.generateMasterManifest(variants);
    fs.writeFileSync(masterManifestPath, masterContent);

    console.log(`[Transcode] Generated master manifest`);

    return {
      masterManifest: masterManifestPath,
      variants,
    };
  }

  /**
   * Generate master HLS manifest
   */
  private generateMasterManifest(
    variants: Array<{ resolution: string; playlist: string }>
  ): string {
    let content = '#EXTM3U\n#EXT-X-VERSION:3\n\n';

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const config = TRANSCODE_CONFIG.variants[i];
      const [width, height] = variant.resolution.split('x');
      const bandwidth = parseInt(config.videoBitrate) * 1000; // Convert to bps

      content += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${width}x${height}\n`;
      content += `${config.name}/playlist.m3u8\n\n`;
    }

    return content;
  }

  /**
   * Generate thumbnails at specified positions
   */
  private async generateThumbnails(
    inputPath: string,
    mediaId: string,
    duration: number
  ): Promise<string[]> {
    const outputDir = path.join(this.tempDir, mediaId, 'thumbnails');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const thumbnails: string[] = [];
    const positions = [0, 0.25, 0.5, 0.75, 1.0]; // 0%, 25%, 50%, 75%, 100%

    for (let i = 0; i < positions.length; i++) {
      const position = positions[i];
      const timestamp = position === 1.0 ? duration - 1 : duration * position;
      const outputPath = path.join(outputDir, `thumb_${i}.jpg`);

      console.log(
        `[Transcode] Generating thumbnail ${i + 1}/${positions.length} at ${timestamp.toFixed(2)}s`
      );

      const ffmpegCmd = [
        'ffmpeg',
        '-ss', timestamp.toString(),
        '-i', `"${inputPath}"`,
        '-vframes', '1',
        '-vf', `scale=${TRANSCODE_CONFIG.thumbnailWidth}:-1`,
        '-q:v', '2',
        `"${outputPath}"`
      ].join(' ');

      await execAsync(ffmpegCmd);
      thumbnails.push(outputPath);
    }

    console.log(`[Transcode] Generated ${thumbnails.length} thumbnails`);
    return thumbnails;
  }

  /**
   * Upload all outputs to R2
   */
  private async uploadOutputsToR2(
    mediaId: string,
    hlsOutput: {
      masterManifest: string;
      variants: Array<{
        resolution: string;
        playlist: string;
        segments: string[];
      }>;
    },
    thumbnails: string[]
  ): Promise<void> {
    // Upload master manifest with 5-minute cache
    const masterManifestKey = `media/${mediaId}/master.m3u8`;
    const masterCacheHeaders = getCacheHeaders(masterManifestKey);
    await this.uploadFile(
      hlsOutput.masterManifest,
      masterManifestKey,
      'application/vnd.apple.mpegurl',
      masterCacheHeaders?.['Cache-Control']
    );

    // Upload each variant
    for (const variant of hlsOutput.variants) {
      const variantName = path.basename(path.dirname(variant.playlist));

      // Upload variant playlist with 5-minute cache
      const playlistKey = `media/${mediaId}/${variantName}/playlist.m3u8`;
      const playlistCacheHeaders = getCacheHeaders(playlistKey);
      await this.uploadFile(
        variant.playlist,
        playlistKey,
        'application/vnd.apple.mpegurl',
        playlistCacheHeaders?.['Cache-Control']
      );

      // Upload variant segments with 1-year immutable cache
      for (const segment of variant.segments) {
        const segmentName = path.basename(segment);
        const segmentKey = `media/${mediaId}/${variantName}/${segmentName}`;
        const segmentCacheHeaders = getCacheHeaders(segmentKey);
        await this.uploadFile(
          segment,
          segmentKey,
          'video/mp2t',
          segmentCacheHeaders?.['Cache-Control']
        );
      }
    }

    // Upload thumbnails with 1-year immutable cache
    for (let i = 0; i < thumbnails.length; i++) {
      const thumbKey = `media/${mediaId}/thumb_${i}.jpg`;
      const thumbCacheHeaders = getCacheHeaders(thumbKey);
      await this.uploadFile(
        thumbnails[i],
        thumbKey,
        'image/jpeg',
        thumbCacheHeaders?.['Cache-Control']
      );
    }

    console.log(`[Transcode] Uploaded all outputs to R2 with CDN cache headers`);
  }

  /**
   * Upload a single file to R2
   */
  private async uploadFile(
    localPath: string,
    r2Key: string,
    contentType: string,
    cacheControl?: string
  ): Promise<void> {
    const fileBuffer = fs.readFileSync(localPath);
    await this.r2Client.putObject({
      key: r2Key,
      body: fileBuffer,
      contentType,
      cacheControl,
    });
  }

  /**
   * Cleanup local files
   */
  private async cleanup(mediaId: string): Promise<void> {
    try {
      const sourcePath = path.join(this.tempDir, `${mediaId}_source.mp4`);
      const outputDir = path.join(this.tempDir, mediaId);

      if (fs.existsSync(sourcePath)) {
        fs.unlinkSync(sourcePath);
      }

      if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true, force: true });
      }

      console.log(`[Transcode] Cleaned up local files for ${mediaId}`);
    } catch (error) {
      console.error(`[Transcode] Cleanup failed:`, error);
      // Don't throw - cleanup failure shouldn't fail the job
    }
  }
}

/**
 * Create and start the transcode worker
 */
export function createTranscodeWorker(): Worker<TranscodeJobData, TranscodeResult> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  const worker = new Worker<TranscodeJobData, TranscodeResult>(
    'transcode',
    async (job) => {
      const transcoder = new TranscodeWorker();
      return transcoder.processTranscode(job);
    },
    {
      connection: redisConnection,
      concurrency: 1, // Process one job at a time
      limiter: {
        max: 10, // Max 10 jobs
        duration: 60000, // Per minute
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err);
  });

  worker.on('error', (err) => {
    console.error('[Worker] Worker error:', err);
  });

  console.log('[Worker] Transcode worker started');

  return worker;
}

/**
 * Main entry point for running the worker as a standalone process
 */
if (require.main === module) {
  const worker = createTranscodeWorker();

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Worker] SIGTERM received, shutting down gracefully...');
    await worker.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[Worker] SIGINT received, shutting down gracefully...');
    await worker.close();
    process.exit(0);
  });
}

