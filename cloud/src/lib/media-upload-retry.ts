import { retryWithBackoff, RetryConfig } from './api-retry'

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void

/**
 * Media upload configuration
 */
export interface MediaUploadConfig extends RetryConfig {
  onProgress?: UploadProgressCallback
  onRetryAttempt?: (attempt: number, error: any) => void
}

/**
 * Upload file with retry logic and progress tracking
 */
export async function uploadFileWithRetry(
  file: File,
  uploadUrl: string,
  config: MediaUploadConfig = {}
): Promise<Response> {
  const { onProgress, onRetryAttempt, ...retryConfig } = config

  return retryWithBackoff(
    async () => {
      return new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Track upload progress
        if (onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100
              onProgress(progress)
            }
          })
        }

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.response, {
              status: xhr.status,
              statusText: xhr.statusText,
            }))
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        })

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'))
        })

        // Send request
        xhr.open('PUT', uploadUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })
    },
    {
      ...retryConfig,
      onRetry: (error, attempt, delay) => {
        console.warn(`Upload retry attempt ${attempt} after ${delay}ms`)
        onRetryAttempt?.(attempt, error)
        retryConfig.onRetry?.(error, attempt, delay)
      },
    }
  )
}

/**
 * Get presigned URL and upload file with retry
 */
export async function uploadMediaWithRetry(
  file: File,
  getPresignedUrlFn: () => Promise<{ uploadUrl: string; finalUrl: string }>,
  config: MediaUploadConfig = {}
): Promise<string> {
  // Get presigned URL with retry
  const { uploadUrl, finalUrl } = await retryWithBackoff(
    getPresignedUrlFn,
    config
  )

  // Upload file with retry
  await uploadFileWithRetry(file, uploadUrl, config)

  return finalUrl
}

/**
 * Batch upload multiple files with retry
 */
export async function batchUploadWithRetry(
  files: File[],
  getPresignedUrlFn: (file: File) => Promise<{ uploadUrl: string; finalUrl: string }>,
  config: MediaUploadConfig = {}
): Promise<string[]> {
  const uploadPromises = files.map((file) =>
    uploadMediaWithRetry(file, () => getPresignedUrlFn(file), config)
  )

  return Promise.all(uploadPromises)
}

/**
 * Upload with automatic retry on failure
 */
export class MediaUploader {
  private config: MediaUploadConfig

  constructor(config: MediaUploadConfig = {}) {
    this.config = {
      maxAttempts: 3,
      initialDelay: 1000,
      ...config,
    }
  }

  async upload(
    file: File,
    getPresignedUrlFn: () => Promise<{ uploadUrl: string; finalUrl: string }>
  ): Promise<string> {
    return uploadMediaWithRetry(file, getPresignedUrlFn, this.config)
  }

  async uploadBatch(
    files: File[],
    getPresignedUrlFn: (file: File) => Promise<{ uploadUrl: string; finalUrl: string }>
  ): Promise<string[]> {
    return batchUploadWithRetry(files, getPresignedUrlFn, this.config)
  }
}

export default MediaUploader
