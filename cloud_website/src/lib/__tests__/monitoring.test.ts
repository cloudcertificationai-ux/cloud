// src/lib/__tests__/monitoring.test.ts
import { MonitoringService } from '../monitoring';
import { prisma } from '../db';

// Mock Prisma
jest.mock('../db', () => ({
  prisma: {
    transcodeJobLog: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findMany: jest.fn(),
    },
    playbackSession: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    aPIErrorLog: {
      create: jest.fn(),
      count: jest.fn(),
    },
    aPIPerformanceLog: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    media: {
      count: jest.fn(),
    },
    dailyStatistics: {
      upsert: jest.fn(),
    },
  },
}));

describe('MonitoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logTranscodeStart', () => {
    it('should log transcode job start', async () => {
      const mockCreate = prisma.transcodeJobLog.create as jest.Mock;
      mockCreate.mockResolvedValue({});

      await MonitoringService.logTranscodeStart({
        mediaId: 'media-123',
        jobId: 'job-456',
        metadata: { r2Key: 'test-key' },
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          mediaId: 'media-123',
          jobId: 'job-456',
          status: 'started',
          metadata: { r2Key: 'test-key' },
        }),
      });
    });

    it('should not throw on logging failure', async () => {
      const mockCreate = prisma.transcodeJobLog.create as jest.Mock;
      mockCreate.mockRejectedValue(new Error('Database error'));

      await expect(
        MonitoringService.logTranscodeStart({
          mediaId: 'media-123',
          jobId: 'job-456',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('recordPlaybackSession', () => {
    it('should record playback session analytics', async () => {
      const mockUpsert = prisma.playbackSession.upsert as jest.Mock;
      mockUpsert.mockResolvedValue({});

      await MonitoringService.recordPlaybackSession({
        userId: 'user-123',
        mediaId: 'media-456',
        lessonId: 'lesson-789',
        courseId: 'course-012',
        sessionId: 'session-345',
        watchTime: 120,
        completionRate: 75,
      });

      expect(mockUpsert).toHaveBeenCalledWith({
        where: { sessionId: 'session-345' },
        create: expect.objectContaining({
          userId: 'user-123',
          mediaId: 'media-456',
          watchTime: 120,
          completionRate: 75,
        }),
        update: expect.objectContaining({
          watchTime: 120,
          completionRate: 75,
        }),
      });
    });
  });

  describe('logAPIError', () => {
    it('should log API errors', async () => {
      const mockCreate = prisma.aPIErrorLog.create as jest.Mock;
      mockCreate.mockResolvedValue({});

      const error = new Error('Test error');
      await MonitoringService.logAPIError({
        requestId: 'req-123',
        method: 'POST',
        path: '/api/test',
        statusCode: 500,
        error,
        userId: 'user-123',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          requestId: 'req-123',
          method: 'POST',
          path: '/api/test',
          statusCode: 500,
          errorMessage: 'Test error',
          userId: 'user-123',
        }),
      });
    });
  });

  describe('trackAPIPerformance', () => {
    it('should track API performance', async () => {
      const mockCreate = prisma.aPIPerformanceLog.create as jest.Mock;
      mockCreate.mockResolvedValue({});

      await MonitoringService.trackAPIPerformance({
        requestId: 'req-123',
        method: 'GET',
        path: '/api/test',
        statusCode: 200,
        responseTime: 150,
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          requestId: 'req-123',
          method: 'GET',
          path: '/api/test',
          statusCode: 200,
          responseTime: 150,
        }),
      });
    });
  });

  describe('aggregateDailyStatistics', () => {
    it('should aggregate daily statistics', async () => {
      const testDate = new Date('2024-02-14');
      
      // Mock all the queries
      (prisma.media.count as jest.Mock).mockResolvedValue(10);
      (prisma.transcodeJobLog.findMany as jest.Mock).mockResolvedValue([
        { status: 'completed' },
        { status: 'completed' },
        { status: 'failed' },
      ]);
      (prisma.playbackSession.findMany as jest.Mock).mockResolvedValue([
        { watchTime: 100, completionRate: 80 },
        { watchTime: 200, completionRate: 90 },
      ]);
      (prisma.aPIPerformanceLog.count as jest.Mock).mockResolvedValue(1000);
      (prisma.aPIErrorLog.count as jest.Mock).mockResolvedValue(50);
      (prisma.aPIPerformanceLog.findMany as jest.Mock).mockResolvedValue([
        { responseTime: 100 },
        { responseTime: 200 },
      ]);
      (prisma.dailyStatistics.upsert as jest.Mock).mockResolvedValue({});

      const stats = await MonitoringService.aggregateDailyStatistics(testDate);

      expect(stats).toEqual({
        date: testDate,
        totalUploads: 10,
        totalTranscodes: 3,
        successfulTranscodes: 2,
        failedTranscodes: 1,
        totalPlaybackSessions: 2,
        totalWatchTime: 300,
        averageCompletionRate: 85,
        totalAPIRequests: 1000,
        totalAPIErrors: 50,
        averageResponseTime: 150,
      });

      expect(prisma.dailyStatistics.upsert).toHaveBeenCalled();
    });
  });
});
