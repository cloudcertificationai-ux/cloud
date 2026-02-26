import { useState, useEffect, useCallback } from 'react';

export interface MediaJobStatus {
  mediaId: string;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
  fileName: string;
  jobId?: string;
  jobState?: string;
  progress?: number;
  manifestUrl?: string | null;
  thumbnails?: any;
  error?: string;
}

interface UseMediaJobStatusOptions {
  mediaId: string | null;
  enabled?: boolean;
  pollInterval?: number;
  onComplete?: (data: MediaJobStatus) => void;
  onError?: (error: string) => void;
}

export function useMediaJobStatus({
  mediaId,
  enabled = true,
  pollInterval = 3000,
  onComplete,
  onError,
}: UseMediaJobStatusOptions) {
  const [data, setData] = useState<MediaJobStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!mediaId || !enabled) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/media/jobs?mediaId=${mediaId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch job status');
      }

      const jobData: MediaJobStatus = await response.json();
      setData(jobData);
      setError(null);

      // Call onComplete if status is READY or FAILED
      if ((jobData.status === 'READY' || jobData.status === 'FAILED') && onComplete) {
        onComplete(jobData);
      }

      if (jobData.status === 'FAILED' && onError) {
        onError(jobData.error || 'Processing failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [mediaId, enabled, onComplete, onError]);

  useEffect(() => {
    if (!mediaId || !enabled) return;

    // Initial fetch
    fetchStatus();

    // Only poll if status is PROCESSING
    if (data?.status === 'PROCESSING' || !data) {
      const interval = setInterval(fetchStatus, pollInterval);
      return () => clearInterval(interval);
    }
  }, [mediaId, enabled, pollInterval, data?.status, fetchStatus]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStatus,
  };
}
