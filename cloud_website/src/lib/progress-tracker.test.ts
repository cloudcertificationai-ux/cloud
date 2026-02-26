// src/lib/progress-tracker.test.ts
import { ProgressTracker } from './progress-tracker';
import { prisma } from './db';

// Mock Prisma
jest.mock('./db', () => ({
  prisma: {
    lesson: {
      findUnique: jest.fn(),
    },
    courseProgress: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    course: {
      findUnique: jest.fn(),
    },
    enrollment: {
      updateMany: jest.fn(),
    },
  },
}));

describe('ProgressTracker', () => {
  let tracker: ProgressTracker;

  beforeEach(() => {
    tracker = new ProgressTracker();
    jest.clearAllMocks();
  });

  describe('updateProgress', () => {
    it('should create new progress record on first heartbeat', async () => {
      const mockLesson = {
        id: 'lesson-1',
        duration: 100,
        module: { courseId: 'course-1' },
      };

      (prisma.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (prisma.courseProgress.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.courseProgress.upsert as jest.Mock).mockResolvedValue({
        watchedSec: 10,
        lastPosition: 10,
        completed: false,
        completedAt: null,
      });

      const result = await tracker.updateProgress({
        userId: 'user-1',
        lessonId: 'lesson-1',
        currentPosition: 10,
        duration: 100,
      });

      expect(result.watchedSec).toBe(10);
      expect(result.lastPosition).toBe(10);
      expect(result.completionPercentage).toBe(10);
      expect(result.isCompleted).toBe(false);
    });

    it('should calculate watched seconds from forward progress', async () => {
      const mockLesson = {
        id: 'lesson-1',
        duration: 100,
        module: { courseId: 'course-1' },
      };

      const existingProgress = {
        watchedSec: 20,
        lastPosition: 20,
        completed: false,
        completedAt: null,
      };

      (prisma.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (prisma.courseProgress.findUnique as jest.Mock).mockResolvedValue(existingProgress);
      (prisma.courseProgress.upsert as jest.Mock).mockResolvedValue({
        watchedSec: 30,
        lastPosition: 30,
        completed: false,
        completedAt: null,
      });

      const result = await tracker.updateProgress({
        userId: 'user-1',
        lessonId: 'lesson-1',
        currentPosition: 30,
        duration: 100,
      });

      expect(result.watchedSec).toBe(30);
      expect(result.completionPercentage).toBe(30);
    });

    it('should mark lesson complete at 90% threshold', async () => {
      const mockLesson = {
        id: 'lesson-1',
        duration: 100,
        module: { courseId: 'course-1' },
      };

      const existingProgress = {
        watchedSec: 85,
        lastPosition: 85,
        completed: false,
        completedAt: null,
      };

      (prisma.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (prisma.courseProgress.findUnique as jest.Mock).mockResolvedValue(existingProgress);
      (prisma.courseProgress.upsert as jest.Mock).mockResolvedValue({
        watchedSec: 90,
        lastPosition: 90,
        completed: true,
        completedAt: new Date(),
      });

      const result = await tracker.updateProgress({
        userId: 'user-1',
        lessonId: 'lesson-1',
        currentPosition: 90,
        duration: 100,
      });

      expect(result.isCompleted).toBe(true);
      expect(result.completionPercentage).toBe(90);
    });

    it('should ignore backward seeks', async () => {
      const mockLesson = {
        id: 'lesson-1',
        duration: 100,
        module: { courseId: 'course-1' },
      };

      const existingProgress = {
        watchedSec: 50,
        lastPosition: 50,
        completed: false,
        completedAt: null,
      };

      (prisma.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (prisma.courseProgress.findUnique as jest.Mock).mockResolvedValue(existingProgress);
      (prisma.courseProgress.upsert as jest.Mock).mockResolvedValue({
        watchedSec: 50, // No change
        lastPosition: 30, // Seeked backward
        completed: false,
        completedAt: null,
      });

      const result = await tracker.updateProgress({
        userId: 'user-1',
        lessonId: 'lesson-1',
        currentPosition: 30, // Backward seek
        duration: 100,
      });

      expect(result.watchedSec).toBe(50); // Should not decrease
    });
  });

  describe('getProgress', () => {
    it('should return zero progress for new lesson', async () => {
      (prisma.lesson.findUnique as jest.Mock).mockResolvedValue({
        id: 'lesson-1',
        duration: 100,
      });
      (prisma.courseProgress.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await tracker.getProgress('user-1', 'lesson-1');

      expect(result.watchedSec).toBe(0);
      expect(result.lastPosition).toBe(0);
      expect(result.completionPercentage).toBe(0);
      expect(result.isCompleted).toBe(false);
    });

    it('should return existing progress', async () => {
      (prisma.lesson.findUnique as jest.Mock).mockResolvedValue({
        id: 'lesson-1',
        duration: 100,
      });
      (prisma.courseProgress.findUnique as jest.Mock).mockResolvedValue({
        watchedSec: 45,
        lastPosition: 50,
        completed: false,
      });

      const result = await tracker.getProgress('user-1', 'lesson-1');

      expect(result.watchedSec).toBe(45);
      expect(result.lastPosition).toBe(50);
      expect(result.completionPercentage).toBe(45);
      expect(result.isCompleted).toBe(false);
    });
  });

  describe('markComplete', () => {
    it('should mark lesson as complete', async () => {
      const mockLesson = {
        id: 'lesson-1',
        module: { courseId: 'course-1' },
      };

      (prisma.lesson.findUnique as jest.Mock).mockResolvedValue(mockLesson);
      (prisma.courseProgress.upsert as jest.Mock).mockResolvedValue({
        completed: true,
        completedAt: new Date(),
      });

      await tracker.markComplete('user-1', 'lesson-1');

      expect(prisma.courseProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId_lessonId: { userId: 'user-1', lessonId: 'lesson-1' },
          },
          update: expect.objectContaining({
            completed: true,
          }),
        })
      );
    });
  });

  describe('calculateCourseCompletion', () => {
    it('should calculate completion percentage correctly', async () => {
      const mockCourse = {
        id: 'course-1',
        modules: [
          {
            lessons: [{ id: 'l1' }, { id: 'l2' }, { id: 'l3' }],
          },
          {
            lessons: [{ id: 'l4' }, { id: 'l5' }],
          },
        ],
      };

      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (prisma.courseProgress.count as jest.Mock).mockResolvedValue(3); // 3 completed
      (prisma.enrollment.updateMany as jest.Mock).mockResolvedValue({});

      const result = await tracker.calculateCourseCompletion('user-1', 'course-1');

      expect(result).toBe(60); // 3/5 * 100 = 60%
      expect(prisma.enrollment.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          courseId: 'course-1',
        },
        data: {
          completionPercentage: 60,
        },
      });
    });

    it('should return 0 for course with no lessons', async () => {
      const mockCourse = {
        id: 'course-1',
        modules: [],
      };

      (prisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

      const result = await tracker.calculateCourseCompletion('user-1', 'course-1');

      expect(result).toBe(0);
    });
  });
});
