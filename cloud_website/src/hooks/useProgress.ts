// src/hooks/useProgress.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface ProgressUpdate {
  lessonId: string;
  completed: boolean;
  timeSpent?: number;
  lastPosition?: number;
}

interface UseProgressOptions {
  courseId: string;
  autoSaveInterval?: number; // in milliseconds, default 30000 (30 seconds)
}

interface UseProgressReturn {
  updateProgress: (update: ProgressUpdate) => Promise<void>;
  isSaving: boolean;
  error: string | null;
  lastSaved: Date | null;
}

/**
 * Hook for tracking lesson progress with auto-save functionality
 * Requirements: 11.1, 11.2, 11.3, 11.5
 */
export function useProgress({ 
  courseId, 
  autoSaveInterval = 30000 
}: UseProgressOptions): UseProgressReturn {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Store pending updates
  const pendingUpdatesRef = useRef<Map<string, ProgressUpdate>>(new Map());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const saveInProgressRef = useRef(false);

  // Save progress to API
  const saveProgress = useCallback(async (updates: ProgressUpdate[]) => {
    if (!session?.user || updates.length === 0 || saveInProgressRef.current) {
      return;
    }

    saveInProgressRef.current = true;
    setIsSaving(true);
    setError(null);

    try {
      // Save each update
      for (const update of updates) {
        const response = await fetch('/api/progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId,
            ...update,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save progress');
        }
      }

      setLastSaved(new Date());
      
      // Clear saved updates from pending
      updates.forEach(update => {
        pendingUpdatesRef.current.delete(update.lessonId);
      });
    } catch (err) {
      console.error('Error saving progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to save progress');
      
      // Retry logic: keep updates in pending for next auto-save
      throw err;
    } finally {
      setIsSaving(false);
      saveInProgressRef.current = false;
    }
  }, [courseId, session]);

  // Auto-save timer
  useEffect(() => {
    if (!session?.user) return;

    const startAutoSave = () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setInterval(() => {
        const updates = Array.from(pendingUpdatesRef.current.values());
        if (updates.length > 0) {
          saveProgress(updates).catch(err => {
            console.error('Auto-save failed:', err);
          });
        }
      }, autoSaveInterval);
    };

    startAutoSave();

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveInterval, saveProgress, session]);

  // Save on unmount
  useEffect(() => {
    return () => {
      const updates = Array.from(pendingUpdatesRef.current.values());
      if (updates.length > 0) {
        // Use navigator.sendBeacon for reliable save on page unload
        const data = JSON.stringify({
          courseId,
          updates,
        });
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/progress/batch', data);
        }
      }
    };
  }, [courseId]);

  // Update progress (adds to pending queue)
  const updateProgress = useCallback(async (update: ProgressUpdate) => {
    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    // Add to pending updates
    pendingUpdatesRef.current.set(update.lessonId, update);

    // If marked as completed, save immediately
    if (update.completed) {
      await saveProgress([update]);
    }
  }, [session, saveProgress]);

  return {
    updateProgress,
    isSaving,
    error,
    lastSaved,
  };
}
