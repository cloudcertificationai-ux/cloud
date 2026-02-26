// src/lib/queue.ts
import { Queue, QueueOptions } from 'bullmq';
import { Redis } from 'ioredis';

/**
 * Job data for transcode jobs
 */
export interface TranscodeJobData {
  mediaId: string;
  r2Key: string;
}

/**
 * Job types enum for type safety
 */
export enum JobType {
  TRANSCODE = 'transcode',
}

/**
 * Redis connection for BullMQ
 */
let redisConnection: Redis | null = null;

/**
 * Get or create Redis connection for BullMQ
 */
function getRedisConnection(): Redis {
  if (!redisConnection) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    redisConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // BullMQ requires this
      enableReadyCheck: false,
    });

    redisConnection.on('error', (error) => {
      console.error('BullMQ Redis connection error:', error);
    });

    redisConnection.on('connect', () => {
      console.log('BullMQ Redis connected');
    });
  }

  return redisConnection;
}

/**
 * Queue options with retry configuration
 */
const queueOptions: QueueOptions = {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 seconds
    },
    removeOnComplete: {
      count: 100, // Keep last 100 completed jobs
      age: 24 * 3600, // Keep for 24 hours
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs for debugging
      age: 7 * 24 * 3600, // Keep for 7 days
    },
  },
};

/**
 * Transcode queue instance
 */
export const transcodeQueue = new Queue<TranscodeJobData>(
  JobType.TRANSCODE,
  queueOptions
);

/**
 * Close all queue connections gracefully
 */
export async function closeQueues(): Promise<void> {
  try {
    await transcodeQueue.close();
    if (redisConnection) {
      await redisConnection.quit();
      redisConnection = null;
    }
    console.log('BullMQ queues closed');
  } catch (error) {
    console.error('Error closing BullMQ queues:', error);
  }
}

/**
 * Health check for queue system
 */
export async function isQueueHealthy(): Promise<boolean> {
  try {
    const client = await transcodeQueue.client;
    await client.ping();
    return true;
  } catch (error) {
    console.error('Queue health check failed:', error);
    return false;
  }
}
