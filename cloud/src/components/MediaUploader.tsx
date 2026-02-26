'use client';

/**
 * MediaUploader Component
 * 
 * Component for uploading media files to the VOD Media System.
 * Supports drag-and-drop, file validation, progress tracking, and transcoding status.
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6
 */

import React, { useCallback, useState, useRef } from 'react';
import { 
  ArrowUpTrayIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Allowed file types per requirement 1.2
const ALLOWED_FILE_TYPES = [
  'video/mp4',
  'video/quicktime', // MOV
  'video/x-msvideo', // AVI
  'application/pdf',
  'image/png',
  'image/jpeg',
  'model/gltf-binary', // GLB
  'model/gltf+json', // GLTF
];

// File size limits per requirement 1.3 (in bytes)
const FILE_SIZE_LIMITS: Record<string, number> = {
  video: 5 * 1024 * 1024 * 1024, // 5GB
  document: 100 * 1024 * 1024, // 100MB
  model: 50 * 1024 * 1024, // 50MB
  image: 50 * 1024 * 1024, // 50MB
};

interface MediaUploaderProps {
  onUploadComplete?: (mediaId: string, media: MediaInfo) => void;
  onUploadError?: (error: UploadError) => void;
  className?: string;
}

interface MediaInfo {
  id: string;
  originalName: string;
  status: 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';
  mimeType: string;
  thumbnails?: string[];
}

interface UploadError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

type UploadState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export function MediaUploader({
  onUploadComplete,
  onUploadError,
  className = '',
}: MediaUploaderProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<UploadError | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Get file type category for size limit validation
   */
  const getFileCategory = (mimeType: string): string => {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('model/')) return 'model';
    return 'document';
  };

  /**
   * Validate file type and size (Requirement 14.2)
   */
  const validateFile = (file: File): { valid: boolean; error?: UploadError } => {
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: {
          code: 'INVALID_FILE_TYPE',
          message: `File type ${file.type} is not allowed. Allowed types: MP4, MOV, AVI, PDF, PNG, JPG, GLB, GLTF`,
        },
      };
    }

    // Validate file size
    const category = getFileCategory(file.type);
    const maxSize = FILE_SIZE_LIMITS[category];
    
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        valid: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `File size exceeds ${maxSizeMB}MB limit for ${category} files`,
        },
      };
    }

    return { valid: true };
  };

  /**
   * Poll media status for transcoding progress (Requirement 14.6)
   */
  const pollMediaStatus = useCallback(async (mediaId: string) => {
    try {
      const response = await fetch(`/api/admin/media?id=${mediaId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch media status');
      }

      const data = await response.json();
      const media = data.data?.media?.[0];

      if (media) {
        setMediaInfo({
          id: media.id,
          originalName: media.originalName,
          status: media.status,
          mimeType: media.mimeType,
          thumbnails: media.thumbnails,
        });

        // Stop polling if status is final
        if (media.status === 'READY' || media.status === 'FAILED') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          if (media.status === 'READY') {
            setState('success');
            onUploadComplete?.(mediaId, media);
          } else {
            setState('error');
            setError({
              code: 'TRANSCODE_FAILED',
              message: 'Video transcoding failed. Please try uploading again.',
            });
            onUploadError?.({
              code: 'TRANSCODE_FAILED',
              message: 'Video transcoding failed',
            });
          }
        }
      }
    } catch (err) {
      console.error('Error polling media status:', err);
    }
  }, [onUploadComplete, onUploadError]);

  /**
   * Start polling for transcoding status
   */
  const startPolling = useCallback((mediaId: string) => {
    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(() => {
      pollMediaStatus(mediaId);
    }, 3000);

    // Initial poll
    pollMediaStatus(mediaId);
  }, [pollMediaStatus]);

  /**
   * Upload file to R2 with progress tracking (Requirement 14.3)
   */
  const uploadToR2 = async (file: File, uploadUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100);
          setProgress(percentage);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.timeout = 300000; // 5 minutes
      xhr.send(file);
    });
  };

  /**
   * Handle file upload (Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6)
   */
  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid && validation.error) {
      setError(validation.error);
      setState('error');
      onUploadError?.(validation.error);
      return;
    }

    setSelectedFile(file);
    setState('uploading');
    setProgress(0);
    setError(null);

    try {
      // Step 1: Request presigned URL
      const presignResponse = await fetch('/api/admin/media/presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json();
        throw new Error(errorData.message || 'Failed to get upload URL');
      }

      const presignData = await presignResponse.json();
      const { uploadUrl, mediaId } = presignData.data;

      // Step 2: Upload to R2
      await uploadToR2(file, uploadUrl);

      // Step 3: Notify completion
      const completeResponse = await fetch('/api/admin/media/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ mediaId }),
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.message || 'Failed to complete upload');
      }

      const completeData = await completeResponse.json();
      const media = completeData.data;

      setMediaInfo({
        id: media.id,
        originalName: media.originalName,
        status: media.status,
        mimeType: media.mimeType,
      });

      // If video, start polling for transcoding status
      if (file.type.startsWith('video/')) {
        setState('processing');
        startPolling(mediaId);
      } else {
        setState('success');
        onUploadComplete?.(mediaId, media);
      }
    } catch (err) {
      const uploadError: UploadError = {
        code: 'UPLOAD_FAILED',
        message: err instanceof Error ? err.message : 'Upload failed',
      };
      setError(uploadError);
      setState('error');
      onUploadError?.(uploadError);
    }
  }, [onUploadComplete, onUploadError, startPolling]);

  /**
   * Handle drag events (Requirement 14.1)
   */
  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  /**
   * Handle file input change
   */
  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  /**
   * Handle click to open file picker
   */
  const handleClick = useCallback(() => {
    if (state === 'idle' || state === 'error') {
      fileInputRef.current?.click();
    }
  }, [state]);

  /**
   * Handle retry (Requirement 14.5)
   */
  const handleRetry = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setState('idle');
    setError(null);
    setProgress(0);
    setMediaInfo(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Handle clear/upload another
   */
  const handleClear = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setState('idle');
    setError(null);
    setProgress(0);
    setMediaInfo(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Media
      </label>

      {/* Upload Area (Requirement 14.1) */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
          ${state === 'uploading' || state === 'processing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
          ${state === 'error' ? 'border-red-300 bg-red-50' : ''}
          ${state === 'success' ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={handleInputChange}
          disabled={state === 'uploading' || state === 'processing' || state === 'success'}
        />

        {/* Idle State */}
        {state === 'idle' && (
          <div className="text-center">
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop a file here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supported: MP4, MOV, AVI, PDF, PNG, JPG, GLB, GLTF
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Max size: 5GB (videos), 100MB (documents), 50MB (3D models/images)
            </p>
          </div>
        )}

        {/* Uploading State (Requirement 14.3) */}
        {state === 'uploading' && (
          <div className="text-center" role="status" aria-live="polite" aria-atomic="true">
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                  role="progressbar"
                  aria-valuenow={progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                />
              </div>
            </div>
            <p className="text-sm text-gray-700 font-medium">
              Uploading {selectedFile?.name}...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {progress}% complete
            </p>
          </div>
        )}

        {/* Processing State (Requirement 14.6) */}
        {state === 'processing' && (
          <div className="text-center" role="status" aria-live="polite" aria-atomic="true">
            <ClockIcon className="mx-auto h-12 w-12 text-blue-500 animate-pulse" aria-hidden="true" />
            <p className="mt-2 text-sm text-blue-600 font-medium">
              Processing video...
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Transcoding to HLS format. This may take several minutes.
            </p>
            {mediaInfo && (
              <div className="mt-3 text-xs text-gray-600">
                <p>File: {mediaInfo.originalName}</p>
                <p>Status: {mediaInfo.status}</p>
              </div>
            )}
          </div>
        )}

        {/* Success State (Requirement 14.4) */}
        {state === 'success' && mediaInfo && (
          <div className="text-center" role="status" aria-live="polite" aria-atomic="true">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" aria-hidden="true" />
            <p className="mt-2 text-sm text-green-600 font-medium">
              Upload successful!
            </p>
            <div className="mt-3 text-xs text-gray-600">
              <p className="font-medium">{mediaInfo.originalName}</p>
              <p className="mt-1">Media ID: {mediaInfo.id}</p>
              {mediaInfo.status === 'READY' && (
                <p className="mt-1 text-green-600">✓ Ready for use</p>
              )}
            </div>
            {/* Thumbnail Preview (Requirement 14.4) */}
            {mediaInfo.thumbnails && mediaInfo.thumbnails.length > 0 && (
              <div className="mt-4">
                <img
                  src={mediaInfo.thumbnails[0]}
                  alt="Video thumbnail"
                  className="mx-auto h-24 w-auto rounded border border-gray-200"
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="mt-4 text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Upload another file
            </button>
          </div>
        )}

        {/* Error State (Requirement 14.5) */}
        {state === 'error' && error && (
          <div className="text-center" role="alert" aria-live="assertive" aria-atomic="true">
            <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500" aria-hidden="true" />
            <p className="mt-2 text-sm text-red-600 font-medium">
              {error.message}
            </p>
            {error.details && (
              <div className="mt-2 text-xs text-red-500">
                {Object.entries(error.details).map(([key, messages]) => (
                  <div key={key}>
                    {messages.map((msg, idx) => (
                      <p key={idx}>{msg}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              aria-label="Retry file upload"
            >
              Retry Upload
            </button>
          </div>
        )}
      </div>

      {/* Helper Text */}
      {state === 'idle' && (
        <p className="mt-2 text-xs text-gray-500">
          Files are uploaded directly to Cloudflare R2. Videos are automatically transcoded to HLS format.
        </p>
      )}
    </div>
  );
}
