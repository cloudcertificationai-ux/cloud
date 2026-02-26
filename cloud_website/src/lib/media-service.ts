// src/lib/media-service.ts
import { prisma } from '@/lib/db';
import { getR2Client } from '@/lib/r2-client';
import { Redis } from 'ioredis';
import { MediaStatus } from '@prisma/client';

/**
 * Allowed MIME types for media uploads
 */
const ALLOWED_MIME_TYPES = [
  // Videos
  'video/mp4',
  'video/quicktime', // MOV
  'video/x-msvideo', // AVI
  // Documents
  'application/pdf',
  // Images
  'image/png',
  'image/jpeg',
  // 3D Models
  'model/gltf-binary', // GLB
  'model/gltf+json', // GLTF
];

/**
 * File size limits by type (in bytes)
 */
const FILE_SIZE_LIMITS: Record<string, number> = {
  video: 5 * 1024 * 1024 * 1024, // 5GB
  document: 100 * 1024 * 1024, // 100MB
  image: 50 * 1024 * 1024, // 50MB (for thumbnails/images)
  model: 50 * 1024 * 1024, // 50MB (for 3D models)
};

/**
 * Presigned URL expiration time (15 minutes)
 */
const PRESIGNED_URL_EXPIRY = 15 * 60; // seconds

/**
 * Redis cache TTL for media metadata (1 hour)
 */
const MEDIA_CACHE_TTL = 60 * 60; // seconds

/**
 * Media service interface
 */
export interface GeneratePresignedUploadParams {
  fileName: string;
  fileType: string;
  fileSize: number;
  userId: string;
}

export interface GeneratePresignedUploadResult {
  uploadUrl: string;
  mediaId: string;
  expiresAt: Date;
}

export interface ListMediaParams {
  userId: string;
  status?: MediaStatus;
  type?: string;
  page: number;
  limit: number;
}

export interface ListMediaResult {
  media: any[];
  total: number;
  page: number;
}

/**
 * MediaService class for managing media lifecycle
 */
class MediaService {
  private redis: Redis | null = null;
  private isRedisConnected: boolean = false;

  constructor() {
    this.initRedis();
  }

  /**
   * Initialize Redis connection for caching
   */
  private initRedis() {
    try {
      const redisUrl = process.env.REDIS_URL;
      if (!redisUrl) {
        console.warn('REDIS_URL not configured, caching disabled');
        return;
      }

      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 100, 3000);
        },
        lazyConnect: true,
      });

      this.redis.on('connect', () => {
        this.isRedisConnected = true;
        console.log('Redis connected for media caching');
      });

      this.redis.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.isRedisConnected = false;
      });

      this.redis.connect().catch((error) => {
        console.error('Failed to connect to Redis:', error);
        this.isRedisConnected = false;
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.isRedisConnected = false;
    }
  }

  /**
   * Validate file type against allowed types
   */
  private validateFileType(mimeType: string): void {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw new Error(
        `Invalid file type: ${mimeType}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }
  }

  /**
   * Validate file size against limits
   */
  private validateFileSize(mimeType: string, fileSize: number): void {
    let limit: number;

    if (mimeType.startsWith('video/')) {
      limit = FILE_SIZE_LIMITS.video;
    } else if (mimeType === 'application/pdf') {
      limit = FILE_SIZE_LIMITS.document;
    } else if (mimeType.startsWith('image/')) {
      limit = FILE_SIZE_LIMITS.image;
    } else if (mimeType.startsWith('model/')) {
      limit = FILE_SIZE_LIMITS.model;
    } else {
      throw new Error(`Unknown file type category: ${mimeType}`);
    }

    if (fileSize > limit) {
      const limitMB = Math.round(limit / (1024 * 1024));
      const sizeMB = Math.round(fileSize / (1024 * 1024));
      throw new Error(
        `File size ${sizeMB}MB exceeds limit of ${limitMB}MB for ${mimeType}`
      );
    }
  }

  /**
   * Get R2 client instance (lazy-loaded)
   */
  private getR2Client() {
    return getR2Client();
  }

  /**
   * Generate presigned upload URL
   */
  async generatePresignedUpload(
    params: GeneratePresignedUploadParams
  ): Promise<GeneratePresignedUploadResult> {
    const { fileName, fileType, fileSize, userId } = params;

    // Validate file type
    this.validateFileType(fileType);

    // Validate file size
    this.validateFileSize(fileType, fileSize);

    // Create Media record with UPLOADED status
    const media = await prisma.media.create({
      data: {
        originalName: fileName,
        r2Key: '', // Will be set after upload
        fileSize: BigInt(fileSize),
        mimeType: fileType,
        status: MediaStatus.UPLOADED,
        uploadedBy: userId,
        metadata: {},
        thumbnails: [],
      },
    });

    // Generate R2 key with media ID
    const r2Key = `media/${media.id}/${fileName}`;

    // Update media record with R2 key
    await prisma.media.update({
      where: { id: media.id },
      data: { r2Key },
    });

    // Generate presigned URL
    const r2Client = this.getR2Client();
    const uploadUrl = await r2Client.generatePresignedPut({
      key: r2Key,
      contentType: fileType,
      expiresIn: PRESIGNED_URL_EXPIRY,
    });

    const expiresAt = new Date(Date.now() + PRESIGNED_URL_EXPIRY * 1000);

    return {
      uploadUrl,
      mediaId: media.id,
      expiresAt,
    };
  }

  /**
   * Complete upload and enqueue transcode job for videos
   */
  async completeUpload(params: { mediaId: string; userId: string }): Promise<any> {
    const { mediaId, userId } = params;

    // Verify media exists and belongs to user
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new Error(`Media not found: ${mediaId}`);
    }

    if (media.uploadedBy !== userId) {
      throw new Error('Unauthorized: Media does not belong to user');
    }

    // For video files, enqueue transcoding job
    if (media.mimeType.startsWith('video/')) {
      // Update status to PROCESSING
      const updatedMedia = await prisma.media.update({
        where: { id: mediaId },
        data: { status: MediaStatus.PROCESSING },
      });

      // TODO: Enqueue transcode job (will be implemented in Task 4)
      // For now, we'll just update the status
      // await transcodeService.enqueueTranscode(mediaId);

      return updatedMedia;
    }

    // For non-video files, mark as READY immediately
    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: { status: MediaStatus.READY },
    });

    return updatedMedia;
  }

  /**
   * Get media by ID with Redis caching and R2 fallback
   */
  async getMedia(mediaId: string): Promise<any | null> {
    // Try to get from cache first
    if (this.redis && this.isRedisConnected) {
      try {
        const cached = await this.redis.get(`media:${mediaId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (error) {
        console.error('Redis get error:', error);
      }
    }

    // Fetch from database
    let media;
    try {
      media = await prisma.media.findUnique({
        where: { id: mediaId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      // If database fails, try to return cached data even if expired
      if (this.redis && this.isRedisConnected) {
        try {
          const cached = await this.redis.get(`media:${mediaId}:backup`);
          if (cached) {
            console.warn('Database unavailable, returning backup cache');
            return JSON.parse(cached);
          }
        } catch (cacheError) {
          console.error('Failed to retrieve backup cache:', cacheError);
        }
      }
      throw error;
    }

    if (!media) {
      return null;
    }

    // Cache the result (both regular and backup)
    if (this.redis && this.isRedisConnected) {
      try {
        await this.redis.setex(
          `media:${mediaId}`,
          MEDIA_CACHE_TTL,
          JSON.stringify(media)
        );
        // Store backup cache with longer TTL for R2 unavailability fallback
        await this.redis.setex(
          `media:${mediaId}:backup`,
          MEDIA_CACHE_TTL * 24, // 24 hours
          JSON.stringify(media)
        );
      } catch (error) {
        console.error('Redis set error:', error);
      }
    }

    return media;
  }

  /**
   * List media with pagination and filtering
   */
  async listMedia(params: ListMediaParams): Promise<ListMediaResult> {
    const { userId, status, type, page, limit } = params;

    // Build where clause
    const where: any = {
      uploadedBy: userId,
    };

    if (status) {
      where.status = status;
    }

    if (type) {
      where.mimeType = {
        startsWith: type,
      };
    }

    // Get total count
    const total = await prisma.media.count({ where });

    // Get paginated results
    const media = await prisma.media.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      media,
      total,
      page,
    };
  }

  /**
   * Delete media and cleanup R2 objects
   */
  async deleteMedia(mediaId: string, userId: string): Promise<void> {
    // Verify media exists and belongs to user
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new Error(`Media not found: ${mediaId}`);
    }

    if (media.uploadedBy !== userId) {
      throw new Error('Unauthorized: Media does not belong to user');
    }

    // Delete from R2
    const r2Client = this.getR2Client();
    
    try {
      // Delete all objects with the media prefix
      const objects = await r2Client.listObjects(`media/${mediaId}/`);
      
      for (const obj of objects) {
        await r2Client.deleteObject(obj.key);
      }
    } catch (error) {
      console.error('Error deleting R2 objects:', error);
      // Continue with database deletion even if R2 cleanup fails
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: mediaId },
    });

    // Invalidate cache
    if (this.redis && this.isRedisConnected) {
      try {
        await this.redis.del(`media:${mediaId}`);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    }
  }

  /**
   * Update media metadata
   */
  async updateMedia(mediaId: string, metadata: Partial<any>): Promise<any> {
    // Only allow updating specific fields
    const allowedFields = [
      'originalName',
      'manifestUrl',
      'thumbnails',
      'duration',
      'width',
      'height',
      'status',
      'metadata',
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (field in metadata) {
        updateData[field] = metadata[field];
      }
    }

    // Update in database
    const updatedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: updateData,
    });

    // Invalidate cache
    if (this.redis && this.isRedisConnected) {
      try {
        await this.redis.del(`media:${mediaId}`);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    }

    return updatedMedia;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.isRedisConnected = false;
    }
  }
}

// Singleton instance
let mediaServiceInstance: MediaService | null = null;

/**
 * Get MediaService singleton instance
 */
export function getMediaService(): MediaService {
  if (!mediaServiceInstance) {
    mediaServiceInstance = new MediaService();
  }
  return mediaServiceInstance;
}

/**
 * Export MediaService class for testing
 */
export { MediaService };
