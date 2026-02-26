/**
 * useMediaUpload Hook
 * 
 * Custom React hook for handling media file uploads to Cloudflare R2.
 * Manages upload state, progress tracking, and error handling with retry logic.
 */

import { useState, useCallback } from 'react';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  publicUrl: string;
  key: string;
}

export interface UploadError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

interface UseMediaUploadReturn {
  upload: (file: File, courseId: string) => Promise<UploadResult>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: UploadError | null;
  reset: () => void;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Custom hook for media file uploads
 */
export function useMediaUpload(): UseMediaUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<UploadError | null>(null);

  /**
   * Reset upload state
   */
  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(null);
    setError(null);
  }, []);

  /**
   * Request presigned upload URL from API
   */
  const requestUploadUrl = async (
    file: File,
    courseId: string
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> => {
    const response = await fetch('/api/admin/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        fileSize: file.size,
        courseId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw {
        code: errorData.error?.code || 'UPLOAD_URL_ERROR',
        message: errorData.error?.message || 'Failed to get upload URL',
        details: errorData.error?.details,
      };
    }

    return response.json();
  };

  /**
   * Upload file to R2 using presigned URL
   */
  const uploadToR2 = async (
    file: File,
    uploadUrl: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progressData: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
          };
          onProgress(progressData);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject({
            code: 'R2_UPLOAD_ERROR',
            message: `Upload failed with status ${xhr.status}`,
          });
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject({
          code: 'NETWORK_ERROR',
          message: 'Network error during upload',
        });
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        reject({
          code: 'UPLOAD_TIMEOUT',
          message: 'Upload timed out',
        });
      });

      // Configure and send request
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 300000; // 5 minutes
      xhr.send(file);
    });
  };

  /**
   * Upload file with retry logic
   */
  const uploadWithRetry = async (
    file: File,
    uploadUrl: string,
    attempt: number = 1
  ): Promise<void> => {
    try {
      await uploadToR2(file, uploadUrl, setProgress);
    } catch (err) {
      const uploadError = err as UploadError;

      // Retry on network errors or timeouts
      if (
        attempt < MAX_RETRY_ATTEMPTS &&
        (uploadError.code === 'NETWORK_ERROR' || uploadError.code === 'UPLOAD_TIMEOUT')
      ) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));

        // Retry upload
        return uploadWithRetry(file, uploadUrl, attempt + 1);
      }

      // Max retries reached or non-retryable error
      throw uploadError;
    }
  };

  /**
   * Main upload function
   */
  const upload = useCallback(
    async (file: File, courseId: string): Promise<UploadResult> => {
      // Reset state
      setIsUploading(true);
      setProgress(null);
      setError(null);

      try {
        // Step 1: Request presigned upload URL
        const { uploadUrl, publicUrl, key } = await requestUploadUrl(file, courseId);

        // Step 2: Upload file to R2 with retry logic
        await uploadWithRetry(file, uploadUrl);

        // Step 3: Return public URL
        setIsUploading(false);
        return { publicUrl, key };
      } catch (err) {
        const uploadError = err as UploadError;
        setError(uploadError);
        setIsUploading(false);
        throw uploadError;
      }
    },
    []
  );

  return {
    upload,
    isUploading,
    progress,
    error,
    reset,
  };
}
