// src/lib/monitoring.ts
import { prisma } from '@/lib/db';

/**
 * Transcode job log entry
 */
export interface TranscodeJobLog {
  mediaId: string;
  jobId: string;
  status: 'started' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  errorMessage?: string;
  errorStack?: string;
  metadata?: Record<string, any>;
}

/**
 * Playback session analytics entry
 */
export interface PlaybackSession {
  userId: string;
  mediaId: string;
  lessonId: string;
  courseId: string;
  sessionId: string;
  startedAt: Date;
  endedAt?: Date;
  watchTime: number; // seconds
  completionRate: number; // percentage (0-100)
  metadata?: Record<string, any>;
}

/**
 * API error log entry
 */
export interface APIErrorLog {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  errorMessage: string;
  errorStack?: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * API performance tracking entry
 */
export interface APIPerformanceLog {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number; // milliseconds
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Daily statistics aggregation
 */
export interface DailyStatistics {
  date: Date;
  totalUploads: number;
  totalTranscodes: number;
  successfulTranscodes: number;
  failedTranscodes: number;
  totalPlaybackSessions: number;
  totalWatchTime: number; // seconds
  averageCompletionRate: number; // percentage
  totalAPIRequests: number;
  totalAPIErrors: number;
  averageResponseTime: number; // milliseconds
}

/**
 * Monitoring service for logging and analytics
 */
export class MonitoringService {
  /**
   * Log transcode job start
   */
  static async logTranscodeStart(params: {
    mediaId: string;
    jobId: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await prisma.transcodeJobLog.create({
        data: {
          mediaId: params.mediaId,
          jobId: params.jobId,
          status: 'started',
          startedAt: new Date(),
          metadata: params.metadata || {},
        },
      });
      console.log(`[Monitoring] Logged transcode start for media ${params.mediaId}`);
    } catch (error) {
      console.error('[Monitoring] Failed to log transcode start:', error);
      // Don't throw - logging failure shouldn't break the main flow
    }
  }

  /**
   * Log transcode job completion
   */
  static async logTranscodeComplete(params: {
    mediaId: string;
    jobId: string;
    duration: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await prisma.transcodeJobLog.updateMany({
        where: {
          mediaId: params.mediaId,
          jobId: params.jobId,
        },
        data: {
          status: 'completed',
          completedAt: new Date(),
          duration: params.duration,
          metadata: params.metadata || {},
        },
      });
      console.log(
        `[Monitoring] Logged transcode completion for media ${params.mediaId} (${params.duration}ms)`
      );
    } catch (error) {
      console.error('[Monitoring] Failed to log transcode completion:', error);
    }
  }

  /**
   * Log transcode job failure
   */
  static async logTranscodeFailed(params: {
    mediaId: string;
    jobId: string;
    duration: number;
    error: Error;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await prisma.transcodeJobLog.updateMany({
        where: {
          mediaId: params.mediaId,
          jobId: params.jobId,
        },
        data: {
          status: 'failed',
          completedAt: new Date(),
          duration: params.duration,
          errorMessage: params.error.message,
          errorStack: params.error.stack,
          metadata: params.metadata || {},
        },
      });
      console.log(
        `[Monitoring] Logged transcode failure for media ${params.mediaId}: ${params.error.message}`
      );
    } catch (error) {
      console.error('[Monitoring] Failed to log transcode failure:', error);
    }
  }

  /**
   * Record playback session analytics
   */
  static async recordPlaybackSession(params: {
    userId: string;
    mediaId: string;
    lessonId: string;
    courseId: string;
    sessionId: string;
    watchTime: number;
    completionRate: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await prisma.playbackSession.upsert({
        where: {
          sessionId: params.sessionId,
        },
        create: {
          userId: params.userId,
          mediaId: params.mediaId,
          lessonId: params.lessonId,
          courseId: params.courseId,
          sessionId: params.sessionId,
          startedAt: new Date(),
          endedAt: new Date(),
          watchTime: params.watchTime,
          completionRate: params.completionRate,
          metadata: params.metadata || {},
        },
        update: {
          endedAt: new Date(),
          watchTime: params.watchTime,
          completionRate: params.completionRate,
          metadata: params.metadata || {},
        },
      });
      console.log(
        `[Monitoring] Recorded playback session ${params.sessionId} (${params.watchTime}s, ${params.completionRate}% complete)`
      );
    } catch (error) {
      console.error('[Monitoring] Failed to record playback session:', error);
    }
  }

  /**
   * Log API error
   */
  static async logAPIError(params: {
    requestId: string;
    method: string;
    path: string;
    statusCode: number;
    error: Error;
    userId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await prisma.aPIErrorLog.create({
        data: {
          requestId: params.requestId,
          method: params.method,
          path: params.path,
          statusCode: params.statusCode,
          errorMessage: params.error.message,
          errorStack: params.error.stack,
          userId: params.userId,
          timestamp: new Date(),
          metadata: params.metadata || {},
        },
      });
      console.log(
        `[Monitoring] Logged API error: ${params.method} ${params.path} - ${params.statusCode} - ${params.error.message}`
      );
    } catch (error) {
      console.error('[Monitoring] Failed to log API error:', error);
    }
  }

  /**
   * Track API performance
   */
  static async trackAPIPerformance(params: {
    requestId: string;
    method: string;
    path: string;
    statusCode: number;
    responseTime: number;
    userId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await prisma.aPIPerformanceLog.create({
        data: {
          requestId: params.requestId,
          method: params.method,
          path: params.path,
          statusCode: params.statusCode,
          responseTime: params.responseTime,
          userId: params.userId,
          timestamp: new Date(),
          metadata: params.metadata || {},
        },
      });
      console.log(
        `[Monitoring] Tracked API performance: ${params.method} ${params.path} - ${params.responseTime}ms`
      );
    } catch (error) {
      console.error('[Monitoring] Failed to track API performance:', error);
    }
  }

  /**
   * Aggregate daily statistics
   */
  static async aggregateDailyStatistics(date: Date): Promise<DailyStatistics> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      // Count uploads (media created)
      const totalUploads = await prisma.media.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      // Count transcode jobs
      const transcodeJobs = await prisma.transcodeJobLog.findMany({
        where: {
          startedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const totalTranscodes = transcodeJobs.length;
      const successfulTranscodes = transcodeJobs.filter(
        (job) => job.status === 'completed'
      ).length;
      const failedTranscodes = transcodeJobs.filter(
        (job) => job.status === 'failed'
      ).length;

      // Count playback sessions
      const playbackSessions = await prisma.playbackSession.findMany({
        where: {
          startedAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const totalPlaybackSessions = playbackSessions.length;
      const totalWatchTime = playbackSessions.reduce(
        (sum, session) => sum + session.watchTime,
        0
      );
      const averageCompletionRate =
        totalPlaybackSessions > 0
          ? playbackSessions.reduce(
              (sum, session) => sum + session.completionRate,
              0
            ) / totalPlaybackSessions
          : 0;

      // Count API requests and errors
      const apiPerformanceLogs = await prisma.aPIPerformanceLog.count({
        where: {
          timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const apiErrorLogs = await prisma.aPIErrorLog.count({
        where: {
          timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      // Calculate average response time
      const performanceLogs = await prisma.aPIPerformanceLog.findMany({
        where: {
          timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: {
          responseTime: true,
        },
      });

      const averageResponseTime =
        performanceLogs.length > 0
          ? performanceLogs.reduce((sum, log) => sum + log.responseTime, 0) /
            performanceLogs.length
          : 0;

      const statistics: DailyStatistics = {
        date,
        totalUploads,
        totalTranscodes,
        successfulTranscodes,
        failedTranscodes,
        totalPlaybackSessions,
        totalWatchTime,
        averageCompletionRate,
        totalAPIRequests: apiPerformanceLogs,
        totalAPIErrors: apiErrorLogs,
        averageResponseTime,
      };

      // Store aggregated statistics
      await prisma.dailyStatistics.upsert({
        where: {
          date: startOfDay,
        },
        create: {
          date: startOfDay,
          totalUploads: statistics.totalUploads,
          totalTranscodes: statistics.totalTranscodes,
          successfulTranscodes: statistics.successfulTranscodes,
          failedTranscodes: statistics.failedTranscodes,
          totalPlaybackSessions: statistics.totalPlaybackSessions,
          totalWatchTime: statistics.totalWatchTime,
          averageCompletionRate: statistics.averageCompletionRate,
          totalAPIRequests: statistics.totalAPIRequests,
          totalAPIErrors: statistics.totalAPIErrors,
          averageResponseTime: statistics.averageResponseTime,
        },
        update: {
          totalUploads: statistics.totalUploads,
          totalTranscodes: statistics.totalTranscodes,
          successfulTranscodes: statistics.successfulTranscodes,
          failedTranscodes: statistics.failedTranscodes,
          totalPlaybackSessions: statistics.totalPlaybackSessions,
          totalWatchTime: statistics.totalWatchTime,
          averageCompletionRate: statistics.averageCompletionRate,
          totalAPIRequests: statistics.totalAPIRequests,
          totalAPIErrors: statistics.totalAPIErrors,
          averageResponseTime: statistics.averageResponseTime,
        },
      });

      console.log(
        `[Monitoring] Aggregated daily statistics for ${date.toISOString().split('T')[0]}`
      );

      return statistics;
    } catch (error) {
      console.error('[Monitoring] Failed to aggregate daily statistics:', error);
      throw error;
    }
  }
}
