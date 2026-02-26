// src/hooks/useCourseProgress.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  completionPercentage: number;
  lastAccessedLesson: string | null;
  detailedProgress: Array<{
    lessonId: string;
    completed: boolean;
    timeSpent: number;
    lastPosition: number;
  }>;
}

interface UseProgressReturn {
  progress: CourseProgress | null;
  loading: boolean;
  error: string | null;
  updateProgress: (lessonId: string, completed: boolean, timeSpent?: number, lastPosition?: number) => Promise<void>;
  refreshProgress: () => Promise<void>;
  isLessonCompleted: (lessonId: string) => boolean;
  getLessonProgress: (lessonId: string) => { completed: boolean; timeSpent: number; lastPosition: number } | null;
}

export function useCourseProgress(courseId: string): UseProgressReturn {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!session?.user || !courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/progress/${courseId}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Not enrolled in this course');
        }
        throw new Error('Failed to fetch progress');
      }

      const data = await response.json();
      setProgress(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, session]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const updateProgress = useCallback(async (
    lessonId: string,
    completed: boolean,
    timeSpent?: number,
    lastPosition?: number
  ) => {
    if (!session?.user || !courseId) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          lessonId,
          completed,
          timeSpent,
          lastPosition,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update progress');
      }

      const data = await response.json();
      
      // Update local state with new progress
      if (data.courseProgress) {
        setProgress(prev => ({
          ...data.courseProgress,
          lastAccessedLesson: lessonId,
          detailedProgress: prev?.detailedProgress || [],
        }));
      }

      return data;
    } catch (err) {
      console.error('Error updating progress:', err);
      throw err;
    }
  }, [courseId, session]);

  const refreshProgress = useCallback(async () => {
    await fetchProgress();
  }, [fetchProgress]);

  const isLessonCompleted = useCallback((lessonId: string): boolean => {
    if (!progress?.detailedProgress) return false;
    const lessonProgress = progress.detailedProgress.find(p => p.lessonId === lessonId);
    return lessonProgress?.completed || false;
  }, [progress]);

  const getLessonProgress = useCallback((lessonId: string) => {
    if (!progress?.detailedProgress) return null;
    const lessonProgress = progress.detailedProgress.find(p => p.lessonId === lessonId);
    return lessonProgress || null;
  }, [progress]);

  return {
    progress,
    loading,
    error,
    updateProgress,
    refreshProgress,
    isLessonCompleted,
    getLessonProgress,
  };
}
