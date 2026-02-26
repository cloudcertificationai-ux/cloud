// src/lib/transcode-service.ts
import { Job } from 'bullmq';
import { transcodeQueue, TranscodeJobData } from '@/lib/queue';

/**
 * Job status types
 */
export type JobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'unknown';

/**
 * Job status response
 */
export interface JobStatusResponse {
  status: JobStatus;
  progress: number;
  error?: string;
  result?: any;
}

/**
 * TranscodeService handles video transcoding job management
 */
class TranscodeService {
  /**
   * Enqueue a transcoding job for a media file
   * 
   * @param mediaId - The ID of the media record
   * @param r2Key - The R2 storage key for the source video
   * @returns The job ID
   */
  async enqueueTranscode(mediaId: string, r2Key: string): Promise<string> {
    try {
      const jobData: TranscodeJobData = {
        mediaId,
        r2Key,
      };

      const job = await transcodeQueue.add('transcode-video', jobData, {
        jobId: `transcode-${mediaId}`, // Use media ID for idempotency
        priority: 1, // Default priority
      });

      console.log(`Transcode job enqueued: ${job.id} for media ${mediaId}`);
      return job.id!;
    } catch (error) {
      console.error('Failed to enqueue transcode job:', error);
      throw new Error(`Failed to enqueue transcode job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the status of a transcoding job
   * 
   * @param jobId - The job ID
   * @returns Job status information
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    try {
      const job = await transcodeQueue.getJob(jobId);

      if (!job) {
        return {
          status: 'unknown',
          progress: 0,
          error: 'Job not found',
        };
      }

      const state = await job.getState();
      const progress = job.progress as number || 0;

      // Map BullMQ states to our JobStatus type
      let status: JobStatus;
      switch (state) {
        case 'waiting':
        case 'waiting-children':
          status = 'waiting';
          break;
        case 'active':
          status = 'active';
          break;
        case 'completed':
          status = 'completed';
          break;
        case 'failed':
          status = 'failed';
          break;
        case 'delayed':
          status = 'delayed';
          break;
        default:
          status = 'unknown';
      }

      const response: JobStatusResponse = {
        status,
        progress,
      };

      // Include error if job failed
      if (state === 'failed' && job.failedReason) {
        response.error = job.failedReason;
      }

      // Include result if job completed
      if (state === 'completed' && job.returnvalue) {
        response.result = job.returnvalue;
      }

      return response;
    } catch (error) {
      console.error('Failed to get job status:', error);
      return {
        status: 'unknown',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all jobs for a specific media ID
   * 
   * @param mediaId - The media ID
   * @returns Array of job statuses
   */
  async getMediaJobs(mediaId: string): Promise<JobStatusResponse[]> {
    try {
      const jobId = `transcode-${mediaId}`;
      const status = await this.getJobStatus(jobId);
      return [status];
    } catch (error) {
      console.error('Failed to get media jobs:', error);
      return [];
    }
  }

  /**
   * Cancel a transcoding job
   * 
   * @param jobId - The job ID to cancel
   * @returns True if cancelled successfully
   */
  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const job = await transcodeQueue.getJob(jobId);
      if (!job) {
        return false;
      }

      await job.remove();
      console.log(`Transcode job cancelled: ${jobId}`);
      return true;
    } catch (error) {
      console.error('Failed to cancel job:', error);
      return false;
    }
  }

  /**
   * Retry a failed transcoding job
   * 
   * @param jobId - The job ID to retry
   * @returns True if retried successfully
   */
  async retryJob(jobId: string): Promise<boolean> {
    try {
      const job = await transcodeQueue.getJob(jobId);
      if (!job) {
        return false;
      }

      const state = await job.getState();
      if (state !== 'failed') {
        console.warn(`Cannot retry job ${jobId} in state ${state}`);
        return false;
      }

      await job.retry();
      console.log(`Transcode job retried: ${jobId}`);
      return true;
    } catch (error) {
      console.error('Failed to retry job:', error);
      return false;
    }
  }

  /**
   * Get queue statistics
   * 
   * @returns Queue statistics
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        transcodeQueue.getWaitingCount(),
        transcodeQueue.getActiveCount(),
        transcodeQueue.getCompletedCount(),
        transcodeQueue.getFailedCount(),
        transcodeQueue.getDelayedCount(),
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        delayed,
      };
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
      };
    }
  }
}

// Export singleton instance
export const transcodeService = new TranscodeService();
