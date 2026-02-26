// src/lib/sync-service.ts
import { prisma } from './db'
import { ApiError, ApiErrorCode, DatabaseError } from './api-errors'

/**
 * Sync event types
 */
export enum SyncEventType {
  ENROLLMENT_CREATED = 'enrollment.created',
  ENROLLMENT_UPDATED = 'enrollment.updated',
  ENROLLMENT_DELETED = 'enrollment.deleted',
  PROFILE_UPDATED = 'profile.updated',
  PROGRESS_UPDATED = 'progress.updated',
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
}

/**
 * Sync event payload
 */
export interface SyncEvent {
  id: string
  type: SyncEventType
  resourceId: string
  resourceType: string
  data: any
  timestamp: Date
  retryCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

/**
 * Sync queue item
 */
interface SyncQueueItem {
  id: string
  event: SyncEvent
  attempts: number
  nextRetryAt: Date
}

/**
 * Sync configuration
 */
export const SYNC_CONFIG = {
  // Maximum retry attempts for failed sync operations
  MAX_RETRY_ATTEMPTS: 3,
  // Initial retry delay in milliseconds
  INITIAL_RETRY_DELAY_MS: 1000,
  // Maximum retry delay in milliseconds (exponential backoff cap)
  MAX_RETRY_DELAY_MS: 30000,
  // Webhook timeout in milliseconds
  WEBHOOK_TIMEOUT_MS: 10000,
  // Batch size for processing queued items
  BATCH_SIZE: 10,
}

/**
 * In-memory sync queue (in production, use Redis or a message queue)
 */
class SyncQueue {
  private queue: Map<string, SyncQueueItem> = new Map()
  private processing: Set<string> = new Set()

  /**
   * Add event to sync queue
   */
  add(event: SyncEvent): void {
    const item: SyncQueueItem = {
      id: event.id,
      event,
      attempts: 0,
      nextRetryAt: new Date(),
    }
    this.queue.set(event.id, item)
  }

  /**
   * Get next batch of items to process
   */
  getNextBatch(batchSize: number = SYNC_CONFIG.BATCH_SIZE): SyncQueueItem[] {
    const now = new Date()
    const items: SyncQueueItem[] = []

    for (const [id, item] of this.queue.entries()) {
      // Skip if already processing
      if (this.processing.has(id)) {
        continue
      }

      // Skip if not ready for retry
      if (item.nextRetryAt > now) {
        continue
      }

      // Skip if max retries exceeded
      if (item.attempts >= SYNC_CONFIG.MAX_RETRY_ATTEMPTS) {
        continue
      }

      items.push(item)

      if (items.length >= batchSize) {
        break
      }
    }

    // Mark items as processing
    items.forEach((item) => this.processing.add(item.id))

    return items
  }

  /**
   * Mark item as completed and remove from queue
   */
  complete(id: string): void {
    this.queue.delete(id)
    this.processing.delete(id)
  }

  /**
   * Mark item as failed and schedule retry
   */
  fail(id: string, error: string): void {
    const item = this.queue.get(id)
    if (!item) {
      return
    }

    item.attempts++
    item.event.error = error
    item.event.status = 'failed'

    // Calculate exponential backoff delay
    const delay = Math.min(
      SYNC_CONFIG.INITIAL_RETRY_DELAY_MS * Math.pow(2, item.attempts),
      SYNC_CONFIG.MAX_RETRY_DELAY_MS
    )

    item.nextRetryAt = new Date(Date.now() + delay)
    this.processing.delete(id)

    // If max retries exceeded, log and remove
    if (item.attempts >= SYNC_CONFIG.MAX_RETRY_ATTEMPTS) {
      console.error(`Sync event ${id} failed after ${item.attempts} attempts:`, error)
      this.queue.delete(id)
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number
    processing: number
    pending: number
    failed: number
  } {
    let failed = 0
    for (const item of this.queue.values()) {
      if (item.attempts >= SYNC_CONFIG.MAX_RETRY_ATTEMPTS) {
        failed++
      }
    }

    return {
      total: this.queue.size,
      processing: this.processing.size,
      pending: this.queue.size - this.processing.size - failed,
      failed,
    }
  }
}

/**
 * Global sync queue instance
 */
const syncQueue = new SyncQueue()

/**
 * Synchronization service
 */
export class SyncService {
  /**
   * Emit a sync event for enrollment changes
   */
  static async emitEnrollmentEvent(
    type: SyncEventType,
    enrollmentId: string,
    data?: any
  ): Promise<void> {
    try {
      // Fetch enrollment data if not provided
      let enrollmentData = data
      if (!enrollmentData) {
        const enrollment = await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        })

        if (!enrollment) {
          throw new DatabaseError(`Enrollment ${enrollmentId} not found`)
        }

        enrollmentData = enrollment
      }

      const event: SyncEvent = {
        id: `${type}-${enrollmentId}-${Date.now()}`,
        type,
        resourceId: enrollmentId,
        resourceType: 'enrollment',
        data: enrollmentData,
        timestamp: new Date(),
        retryCount: 0,
        status: 'pending',
      }

      // Add to sync queue
      syncQueue.add(event)

      // Trigger webhook notification (async, non-blocking)
      this.triggerWebhook(event).catch((error) => {
        console.error('Webhook trigger failed:', error)
        syncQueue.fail(event.id, error.message)
      })
    } catch (error) {
      console.error('Failed to emit enrollment event:', error)
      throw error
    }
  }

  /**
   * Emit a sync event for profile changes
   */
  static async emitProfileEvent(userId: string, data?: any): Promise<void> {
    try {
      // Fetch user and profile data if not provided
      let profileData = data
      if (!profileData) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
          },
        })

        if (!user) {
          throw new DatabaseError(`User ${userId} not found`)
        }

        profileData = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          profile: user.profile,
          updatedAt: user.updatedAt,
        }
      }

      const event: SyncEvent = {
        id: `profile.updated-${userId}-${Date.now()}`,
        type: SyncEventType.PROFILE_UPDATED,
        resourceId: userId,
        resourceType: 'user',
        data: profileData,
        timestamp: new Date(),
        retryCount: 0,
        status: 'pending',
      }

      // Add to sync queue
      syncQueue.add(event)

      // Trigger webhook notification (async, non-blocking)
      this.triggerWebhook(event).catch((error) => {
        console.error('Webhook trigger failed:', error)
        syncQueue.fail(event.id, error.message)
      })
    } catch (error) {
      console.error('Failed to emit profile event:', error)
      throw error
    }
  }

  /**
   * Emit a sync event for progress updates
   */
  static async emitProgressEvent(
    userId: string,
    courseId: string,
    data?: any
  ): Promise<void> {
    try {
      // Fetch progress data if not provided
      let progressData = data
      if (!progressData) {
        const progress = await prisma.courseProgress.findMany({
          where: {
            userId,
            courseId,
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        })

        progressData = {
          userId,
          courseId,
          progress,
          timestamp: new Date(),
        }
      }

      const event: SyncEvent = {
        id: `progress.updated-${userId}-${courseId}-${Date.now()}`,
        type: SyncEventType.PROGRESS_UPDATED,
        resourceId: `${userId}-${courseId}`,
        resourceType: 'progress',
        data: progressData,
        timestamp: new Date(),
        retryCount: 0,
        status: 'pending',
      }

      // Add to sync queue
      syncQueue.add(event)

      // Trigger webhook notification (async, non-blocking)
      this.triggerWebhook(event).catch((error) => {
        console.error('Webhook trigger failed:', error)
        syncQueue.fail(event.id, error.message)
      })
    } catch (error) {
      console.error('Failed to emit progress event:', error)
      throw error
    }
  }

  /**
   * Trigger webhook notification for sync event
   */
  private static async triggerWebhook(event: SyncEvent): Promise<void> {
    // Get webhook URLs from environment
    const webhookUrls = process.env.SYNC_WEBHOOK_URLS?.split(',') || []

    if (webhookUrls.length === 0) {
      // No webhooks configured, mark as completed
      syncQueue.complete(event.id)
      return
    }

    // Send webhook to all configured URLs
    const promises = webhookUrls.map(async (url) => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(
          () => controller.abort(),
          SYNC_CONFIG.WEBHOOK_TIMEOUT_MS
        )

        const response = await fetch(url.trim(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Sync-Event-Id': event.id,
            'X-Sync-Event-Type': event.type,
          },
          body: JSON.stringify(event),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Webhook failed with status ${response.status}`)
        }
      } catch (error) {
        console.error(`Webhook to ${url} failed:`, error)
        throw error
      }
    })

    try {
      await Promise.all(promises)
      syncQueue.complete(event.id)
    } catch (error) {
      throw error
    }
  }

  /**
   * Process queued sync events
   * Should be called periodically (e.g., via cron job or background worker)
   */
  static async processQueue(): Promise<void> {
    const items = syncQueue.getNextBatch()

    if (items.length === 0) {
      return
    }

    console.log(`Processing ${items.length} queued sync events`)

    for (const item of items) {
      try {
        await this.triggerWebhook(item.event)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        syncQueue.fail(item.id, errorMessage)
      }
    }
  }

  /**
   * Get sync queue statistics
   */
  static getQueueStats() {
    return syncQueue.getStats()
  }

  /**
   * Sync enrollment data immediately (for critical operations)
   */
  static async syncEnrollmentNow(enrollmentId: string): Promise<void> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    if (!enrollment) {
      throw new DatabaseError(`Enrollment ${enrollmentId} not found`)
    }

    const event: SyncEvent = {
      id: `sync-now-${enrollmentId}-${Date.now()}`,
      type: SyncEventType.ENROLLMENT_UPDATED,
      resourceId: enrollmentId,
      resourceType: 'enrollment',
      data: enrollment,
      timestamp: new Date(),
      retryCount: 0,
      status: 'processing',
    }

    // Trigger webhook immediately (blocking)
    await this.triggerWebhook(event)
  }

  /**
   * Sync profile data immediately (for critical operations)
   */
  static async syncProfileNow(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    })

    if (!user) {
      throw new DatabaseError(`User ${userId} not found`)
    }

    const event: SyncEvent = {
      id: `sync-now-profile-${userId}-${Date.now()}`,
      type: SyncEventType.PROFILE_UPDATED,
      resourceId: userId,
      resourceType: 'user',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        profile: user.profile,
        updatedAt: user.updatedAt,
      },
      timestamp: new Date(),
      retryCount: 0,
      status: 'processing',
    }

    // Trigger webhook immediately (blocking)
    await this.triggerWebhook(event)
  }
}

/**
 * Helper function to log sync events to audit log
 */
export async function logSyncEvent(
  event: SyncEvent,
  success: boolean,
  error?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: `sync.${event.type}`,
        resourceType: event.resourceType,
        resourceId: event.resourceId,
        details: {
          eventId: event.id,
          success,
          error,
          timestamp: event.timestamp,
        },
      },
    })
  } catch (error) {
    console.error('Failed to log sync event:', error)
  }
}
