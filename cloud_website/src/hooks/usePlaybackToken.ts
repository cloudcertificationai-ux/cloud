/**
 * Hook for fetching playback tokens with retry logic
 */

import { useState, useCallback } from 'react';
import { retryWithBackoff, PLAYBACK_TOKEN_RETRY_CONFIG, RetryError } from '@/lib/retry-utils';

interface PlaybackTokenResponse {
  signedUrl: string;
  expiresAt: string;
}

interface UsePlaybackTokenResult {
  fetchToken: (mediaId: string, lessonId: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
}

export function usePlaybackToken(): UsePlaybackTokenResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchToken = useCallback(async (mediaId: string, lessonId: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setRetryCount(0);

    try {
      const signedUrl = await retryWithBackoff<string>(
        async () => {
          const response = await fetch(`/api/media/${mediaId}/playback-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ lessonId }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message || `Failed to fetch playback token: ${response.status}`
            );
          }

          const data: PlaybackTokenResponse = await response.json();
          return data.signedUrl;
        },
        {
          ...PLAYBACK_TOKEN_RETRY_CONFIG,
          onRetry: (attempt, error) => {
            console.warn(`Playback token request failed (attempt ${attempt}):`, error.message);
            setRetryCount(attempt);
          },
        }
      );

      setIsLoading(false);
      return signedUrl;
    } catch (err) {
      setIsLoading(false);

      if (err instanceof RetryError) {
        const errorMessage = `Failed to load video after ${err.attempts} attempts. Please check your connection and try again.`;
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      const errorMessage = err instanceof Error ? err.message : 'Failed to load video';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    fetchToken,
    isLoading,
    error,
    retryCount,
  };
}
