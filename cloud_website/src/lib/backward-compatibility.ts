/**
 * Backward Compatibility Utilities for VOD Media System
 * 
 * This module provides utilities to ensure backward compatibility
 * with legacy lesson data during the transition to the new VOD system.
 * 
 * Requirements:
 * - 20.1: Set kind=VIDEO for lessons with videoUrl
 * - 20.2: Set kind=ARTICLE for lessons without videoUrl
 * - 20.3: Check both videoUrl and mediaId fields
 * - 20.4: Serve videoUrl directly if mediaId is null
 * - 20.5: Unified completion calculation for all lesson types
 */

import { Lesson } from '@prisma/client';

/**
 * Get the video source URL for a lesson, supporting both legacy and new formats
 * 
 * Requirements 20.3, 20.4: Support both videoUrl and mediaId fields
 * 
 * @param lesson - The lesson object with potential videoUrl and media fields
 * @returns The video URL to use for playback, or null if no video available
 */
export function getVideoSourceUrl(lesson: {
  videoUrl?: string | null;
  media?: { manifestUrl?: string | null } | null;
}): string | null {
  // Priority 1: Use new HLS manifest URL if available
  if (lesson.media?.manifestUrl) {
    return lesson.media.manifestUrl;
  }

  // Priority 2: Fall back to legacy videoUrl
  if (lesson.videoUrl) {
    return lesson.videoUrl;
  }

  // No video source available
  return null;
}

/**
 * Determine if a lesson has video content (legacy or new format)
 * 
 * @param lesson - The lesson object to check
 * @returns True if the lesson has video content in any format
 */
export function hasVideoContent(lesson: {
  videoUrl?: string | null;
  mediaId?: string | null;
  media?: { manifestUrl?: string | null } | null;
}): boolean {
  return !!(lesson.videoUrl || lesson.mediaId || lesson.media?.manifestUrl);
}

/**
 * Get the appropriate lesson kind based on legacy data
 * 
 * Requirements 20.1, 20.2: Determine kind from videoUrl presence
 * 
 * This is used by the migration script to set the kind field
 * for existing lessons that don't have it set.
 * 
 * @param lesson - The lesson object with potential videoUrl
 * @returns The appropriate LessonKind value
 */
export function inferLessonKind(lesson: {
  videoUrl?: string | null;
  kind?: string | null;
}): 'VIDEO' | 'ARTICLE' {
  // If kind is already set, use it
  if (lesson.kind) {
    return lesson.kind as 'VIDEO' | 'ARTICLE';
  }

  // Requirement 20.1: Lessons with videoUrl should be VIDEO
  if (lesson.videoUrl) {
    return 'VIDEO';
  }

  // Requirement 20.2: Lessons without videoUrl should be ARTICLE
  return 'ARTICLE';
}

/**
 * Check if a lesson is using legacy video format
 * 
 * @param lesson - The lesson object to check
 * @returns True if the lesson uses legacy videoUrl without mediaId
 */
export function isLegacyVideoLesson(lesson: {
  videoUrl?: string | null;
  mediaId?: string | null;
}): boolean {
  return !!(lesson.videoUrl && !lesson.mediaId);
}

/**
 * Validate that lesson completion tracking works for all lesson types
 * 
 * Requirement 20.5: Unified completion calculation
 * 
 * This function documents the completion tracking behavior:
 * - VIDEO lessons (legacy or new): Completed via 90% watch threshold
 * - ARTICLE lessons: Completed via manual mark complete
 * - QUIZ/MCQ lessons: Completed when quiz is passed
 * - ASSIGNMENT lessons: Completed when submission is graded
 * 
 * All lesson types contribute equally to course completion percentage.
 * 
 * @returns Documentation object describing completion behavior
 */
export function getCompletionTrackingInfo() {
  return {
    VIDEO: {
      legacy: {
        field: 'videoUrl',
        completionMethod: '90% watch threshold via heartbeat',
        tracked: true,
      },
      new: {
        field: 'mediaId',
        completionMethod: '90% watch threshold via heartbeat',
        tracked: true,
      },
    },
    ARTICLE: {
      completionMethod: 'Manual mark complete after reading',
      tracked: true,
    },
    QUIZ: {
      completionMethod: 'Auto-complete when quiz is passed',
      tracked: true,
    },
    MCQ: {
      completionMethod: 'Auto-complete when quiz is passed',
      tracked: true,
    },
    ASSIGNMENT: {
      completionMethod: 'Auto-complete when submission is graded',
      tracked: true,
    },
    AR: {
      completionMethod: 'Manual mark complete (placeholder)',
      tracked: true,
    },
    LIVE: {
      completionMethod: 'Manual mark complete (placeholder)',
      tracked: true,
    },
    courseCompletion: {
      formula: '(completedLessons / totalLessons) * 100',
      note: 'All lesson types contribute equally regardless of kind or legacy status',
    },
  };
}

/**
 * Migration helper: Get lessons that need kind field migration
 * 
 * This is used by the migration script to identify lessons
 * that need their kind field updated.
 * 
 * @param lessons - Array of lessons to check
 * @returns Object with lessons needing VIDEO and ARTICLE kind assignment
 */
export function getLessonsNeedingMigration(lessons: Array<{
  id: string;
  videoUrl?: string | null;
  kind?: string | null;
}>) {
  const needsVideoKind = lessons.filter(
    lesson => lesson.videoUrl && lesson.kind !== 'VIDEO'
  );

  const needsArticleKind = lessons.filter(
    lesson => !lesson.videoUrl && lesson.kind !== 'ARTICLE'
  );

  return {
    needsVideoKind,
    needsArticleKind,
    totalNeedingMigration: needsVideoKind.length + needsArticleKind.length,
  };
}

