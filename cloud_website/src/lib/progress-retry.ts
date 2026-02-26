import { retryWithBackoff, RetryConfig } from './api-retry'

/**
 * Progress update data
 */
export interface ProgressUpdate {
  lessonId: string
  completed?: boolean
  timeSpent?: number
  lastPosition?: number
}

/**
 * Save progress with retry logic
 */
export async function saveProgressWithRetry(
  courseSlug: string,
  update: ProgressUpdate,
  config: RetryConfig = {}
): Promise<void> {
  await retryWithBackoff(
    async () => {
      const response = await fetch(`/api/courses/${courseSlug}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      })

      if (!response.ok) {
        throw new Error(`Failed to save progress: ${response.statusText}`)
      }

      return response.json()
    },
    {
      maxAttempts: 3,
      initialDelay: 500,
      ...config,
      onRetry: (error, attempt, delay) => {
        console.warn(
          `Progress save retry attempt ${attempt} after ${delay}ms`,
          error
        )
        config.onRetry?.(error, attempt, delay)
      },
    }
  )
}

/**
 * Batch save multiple progress updates with retry
 */
export async function batchSaveProgressWithRetry(
  courseSlug: string,
  updates: ProgressUpdate[],
  config: RetryConfig = {}
): Promise<void> {
  await retryWithBackoff(
    async () => {
      const response = await fetch(`/api/courses/${courseSlug}/progress/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ updates }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save progress batch: ${response.statusText}`)
      }

      return response.json()
    },
    {
      maxAttempts: 3,
      initialDelay: 500,
      ...config,
    }
  )
}

/**
 * Progress tracker with automatic retry and queuing
 */
export class ProgressTracker {
  private courseSlug: string
  private queue: ProgressUpdate[] = []
  private isSaving: boolean = false
  private saveInterval: NodeJS.Timeout | null = null
  private config: RetryConfig

  constructor(courseSlug: string, config: RetryConfig = {}) {
    this.courseSlug = courseSlug
    this.config = {
      maxAttempts: 3,
      initialDelay: 500,
      ...config,
    }
  }

  /**
   * Queue a progress update
   */
  queueUpdate(update: ProgressUpdate): void {
    // Check if update for same lesson exists in queue
    const existingIndex = this.queue.findIndex(
      (u) => u.lessonId === update.lessonId
    )

    if (existingIndex >= 0) {
      // Merge with existing update
      this.queue[existingIndex] = {
        ...this.queue[existingIndex],
        ...update,
      }
    } else {
      // Add new update
      this.queue.push(update)
    }
  }

  /**
   * Start auto-save interval
   */
  startAutoSave(intervalMs: number = 30000): void {
    if (this.saveInterval) {
      return
    }

    this.saveInterval = setInterval(() => {
      this.flush()
    }, intervalMs)
  }

  /**
   * Stop auto-save interval
   */
  stopAutoSave(): void {
    if (this.saveInterval) {
      clearInterval(this.saveInterval)
      this.saveInterval = null
    }
  }

  /**
   * Flush queued updates
   */
  async flush(): Promise<void> {
    if (this.isSaving || this.queue.length === 0) {
      return
    }

    this.isSaving = true
    const updates = [...this.queue]
    this.queue = []

    try {
      if (updates.length === 1) {
        await saveProgressWithRetry(this.courseSlug, updates[0], this.config)
      } else {
        await batchSaveProgressWithRetry(this.courseSlug, updates, this.config)
      }
    } catch (error) {
      console.error('Failed to save progress after retries:', error)
      // Re-queue failed updates
      this.queue.push(...updates)
    } finally {
      this.isSaving = false
    }
  }

  /**
   * Save immediately without queuing
   */
  async saveImmediate(update: ProgressUpdate): Promise<void> {
    await saveProgressWithRetry(this.courseSlug, update, this.config)
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopAutoSave()
    this.flush()
  }
}

export default ProgressTracker
