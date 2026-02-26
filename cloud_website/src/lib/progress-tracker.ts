// src/lib/progress-tracker.ts
import { prisma } from '@/lib/db';
import { MonitoringService } from '@/lib/monitoring';
import { randomUUID } from 'crypto';

/**
 * ProgressTracker handles video progress tracking with heartbeat data
 * 
 * Requirements:
 * - 4.2: Update progress with heartbeat data
 * - 4.3: Calculate watched seconds by comparing positions
 * - 4.4: Detect 90% completion threshold
 * - 4.5: Calculate overall course completion
 * - 4.6: Retrieve current progress state
 */

interface UpdateProgressParams {
  userId: string;
  lessonId: string;
  currentPosition: number; // seconds
  duration: number; // seconds
  sessionId?: string; // Optional session ID for analytics tracking
}

interface ProgressResult {
  watchedSec: number;
  lastPosition: number;
  completionPercentage: number;
  isCompleted: boolean;
}

export class ProgressTracker {
  /**
   * Update progress from heartbeat data
   * 
   * Requirement 4.2: Receive heartbeat signals and update CourseProgress
   * Requirement 4.3: Calculate watched seconds by comparing positions
   * Requirement 4.4: Mark complete when 90% threshold reached
   * Requirement 17.2: Record playback session analytics
   */
  async updateProgress(params: UpdateProgressParams): Promise<ProgressResult> {
    const { userId, lessonId, currentPosition, duration, sessionId } = params;

    // Validate inputs
    if (currentPosition < 0 || duration <= 0) {
      throw new Error('Invalid position or duration');
    }

    // Get the lesson to find courseId and mediaId
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const courseId = lesson.module.courseId;

    // Get existing progress
    const existingProgress = await prisma.courseProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    // Calculate watched seconds increment
    let watchedSecIncrement = 0;
    if (existingProgress) {
      const lastPos = existingProgress.lastPosition;
      // Only count forward progress (ignore seeks backward)
      if (currentPosition > lastPos) {
        watchedSecIncrement = Math.min(
          currentPosition - lastPos,
          duration - existingProgress.watchedSec
        );
      }
    } else {
      // First heartbeat - count from 0 to current position
      watchedSecIncrement = Math.min(currentPosition, duration);
    }

    const newWatchedSec = (existingProgress?.watchedSec || 0) + watchedSecIncrement;
    const completionPercentage = duration > 0 ? (newWatchedSec / duration) * 100 : 0;
    
    // Requirement 4.4: Check 90% completion threshold
    const isCompleted = completionPercentage >= 90;

    // Update or create progress record
    const updatedProgress = await prisma.courseProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        watchedSec: newWatchedSec,
        lastPosition: currentPosition,
        completed: isCompleted || existingProgress?.completed || false,
        completedAt: isCompleted && !existingProgress?.completed ? new Date() : existingProgress?.completedAt,
        updatedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        lessonId,
        watchedSec: newWatchedSec,
        lastPosition: currentPosition,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Requirement 17.2: Record playback session analytics
    if (sessionId && lesson.mediaId) {
      await MonitoringService.recordPlaybackSession({
        userId,
        mediaId: lesson.mediaId,
        lessonId,
        courseId,
        sessionId,
        watchTime: newWatchedSec,
        completionRate: completionPercentage,
        metadata: {
          duration,
          currentPosition,
          isCompleted,
        },
      });
    }

    return {
      watchedSec: updatedProgress.watchedSec,
      lastPosition: updatedProgress.lastPosition,
      completionPercentage,
      isCompleted: updatedProgress.completed,
    };
  }

  /**
   * Get current progress for a lesson
   * 
   * Requirement 4.6: Provide last saved playback position
   */
  async getProgress(userId: string, lessonId: string): Promise<ProgressResult> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const progress = await prisma.courseProgress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    if (!progress) {
      return {
        watchedSec: 0,
        lastPosition: 0,
        completionPercentage: 0,
        isCompleted: false,
      };
    }

    const duration = lesson.duration || 1;
    const completionPercentage = (progress.watchedSec / duration) * 100;

    return {
      watchedSec: progress.watchedSec,
      lastPosition: progress.lastPosition,
      completionPercentage,
      isCompleted: progress.completed,
    };
  }

  /**
   * Mark a lesson as complete
   * 
   * Used for non-video lessons (quizzes, assignments)
   */
  async markComplete(userId: string, lessonId: string): Promise<void> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const courseId = lesson.module.courseId;

    await prisma.courseProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        courseId,
        lessonId,
        completed: true,
        completedAt: new Date(),
        watchedSec: 0,
        lastPosition: 0,
      },
    });
  }

  /**
   * Calculate overall course completion percentage
   * 
   * Requirement 4.5: Update course completion when lesson marked complete
   */
  async calculateCourseCompletion(userId: string, courseId: string): Promise<number> {
    // Get all lessons in the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      throw new Error('Course not found');
    }

    // Count total lessons
    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );

    if (totalLessons === 0) {
      return 0;
    }

    // Get completed lessons count
    const completedCount = await prisma.courseProgress.count({
      where: {
        userId,
        courseId,
        completed: true,
      },
    });

    const completionPercentage = (completedCount / totalLessons) * 100;

    // Update enrollment completion percentage
    await prisma.enrollment.updateMany({
      where: {
        userId,
        courseId,
      },
      data: {
        completionPercentage,
      },
    });

    return completionPercentage;
  }
}

// Export singleton instance
export const progressTracker = new ProgressTracker();
