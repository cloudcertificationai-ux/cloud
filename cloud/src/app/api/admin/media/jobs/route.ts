import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import prisma from '@/lib/db';

// Initialize queue connection
let transcodeQueue: Queue | null = null;

function getTranscodeQueue(): Queue {
  if (!transcodeQueue) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    transcodeQueue = new Queue('transcode', { connection });
  }
  return transcodeQueue;
}

/**
 * GET /api/admin/media/jobs?mediaId=xxx
 * Get job status for a media item
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');

    if (!mediaId) {
      return NextResponse.json({ error: 'Missing mediaId parameter' }, { status: 400 });
    }

    // Get media status from database
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        status: true,
        originalName: true,
        manifestUrl: true,
        thumbnails: true,
      },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // If already ready or failed, return immediately
    if (media.status === 'READY' || media.status === 'FAILED') {
      return NextResponse.json({
        mediaId: media.id,
        status: media.status,
        fileName: media.originalName,
        manifestUrl: media.manifestUrl,
        thumbnails: media.thumbnails,
      });
    }

    // Check job status in queue
    try {
      const queue = getTranscodeQueue();
      const jobs = await queue.getJobs(['active', 'waiting', 'completed', 'failed']);
      const job = jobs.find((j) => j.data.mediaId === mediaId);

      if (job) {
        const state = await job.getState();
        const progress = job.progress || 0;

        return NextResponse.json({
          mediaId: media.id,
          status: media.status,
          fileName: media.originalName,
          jobId: job.id,
          jobState: state,
          progress: typeof progress === 'number' ? progress : 0,
          manifestUrl: media.manifestUrl,
          thumbnails: media.thumbnails,
        });
      }
    } catch (queueError) {
      console.error('Queue error:', queueError);
      // Continue with database status if queue check fails
    }

    // Return database status
    return NextResponse.json({
      mediaId: media.id,
      status: media.status,
      fileName: media.originalName,
      manifestUrl: media.manifestUrl,
      thumbnails: media.thumbnails,
    });
  } catch (error) {
    console.error('Job status error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
