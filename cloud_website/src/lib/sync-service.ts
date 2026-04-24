// src/lib/sync-service.ts
// Sync service — now backed by BullMQ instead of in-memory Map.
// Events survive server restarts and are retried automatically.
// The actual work (revalidation, cache clearing) runs in sync-worker.ts.

import { syncQueue, enqueueSyncJob, type SyncJobData, type SyncJobType } from './queue'
import { prisma } from './db'

// Re-export for backward compat with any code that imports SyncEventType
export enum SyncEventType {
  ENROLLMENT_CREATED = 'enrollment.created',
  ENROLLMENT_UPDATED = 'enrollment.updated',
  ENROLLMENT_DELETED = 'enrollment.deleted',
  PROFILE_UPDATED = 'profile.updated',
  PROGRESS_UPDATED = 'progress.updated',
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
}

export interface SyncEvent {
  id: string
  type: SyncEventType
  resourceId: string
  resourceType: string
  data: unknown
  timestamp: Date
  retryCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

// ─── SyncService ──────────────────────────────────────────────────────────────

export class SyncService {
  /**
   * Emit a sync event when enrollment is created/updated/deleted.
   * Queues a BullMQ job — survives restarts, auto-retried on failure.
   */
  static async emitEnrollmentEvent(
    type: SyncEventType,
    enrollmentId: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      let resourceData = data
      let userId: string | undefined

      if (!resourceData) {
        const enrollment = await prisma.enrollment.findUnique({
          where: { id: enrollmentId },
          include: {
            User: { select: { id: true, email: true, name: true } },
            Course: { select: { id: true, title: true, slug: true } },
          },
        })
        if (enrollment) {
          resourceData = enrollment as unknown as Record<string, unknown>
          userId = enrollment.userId
        }
      }

      const syncType: SyncJobType =
        type === SyncEventType.ENROLLMENT_CREATED
          ? 'enrollment.created'
          : 'enrollment.updated'

      await enqueueSyncJob({
        type: syncType,
        resourceId: enrollmentId,
        resourceType: 'enrollment',
        userId,
        data: resourceData,
      })
    } catch (err) {
      console.error('[sync-service] Failed to queue enrollment event:', (err as Error).message)
      // Non-fatal — don't block the calling request
    }
  }

  /**
   * Emit a sync event when a user profile changes.
   */
  static async emitProfileEvent(userId: string, data?: Record<string, unknown>): Promise<void> {
    try {
      let profileData = data

      if (!profileData) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { Profile: true },
        })
        if (user) {
          profileData = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            profile: user.Profile,
            updatedAt: user.updatedAt,
          } as unknown as Record<string, unknown>
        }
      }

      await enqueueSyncJob({
        type: 'profile.updated',
        resourceId: userId,
        resourceType: 'user',
        userId,
        data: profileData,
      })
    } catch (err) {
      console.error('[sync-service] Failed to queue profile event:', (err as Error).message)
    }
  }

  /**
   * Emit a sync event for progress updates (low-priority, batched by analytics worker).
   */
  static async emitProgressEvent(
    userId: string,
    courseId: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    // Progress updates go directly to the analytics queue for batching —
    // the sync queue would be overkill for every heartbeat
    try {
      const { enqueueAnalytics } = await import('./queue')
      await enqueueAnalytics({
        type: 'progress.update',
        userId,
        courseId,
        ...(data as object),
      })
    } catch (err) {
      console.error('[sync-service] Failed to queue progress event:', (err as Error).message)
    }
  }

  /**
   * Emit a sync event when a course is published/updated in the admin panel.
   * This triggers ISR revalidation on the website.
   */
  static async emitCourseEvent(
    type: 'course.published' | 'course.updated' | 'course.unpublished' | 'course.deleted',
    courseId: string,
    slug?: string
  ): Promise<void> {
    try {
      await enqueueSyncJob({
        type,
        resourceId: courseId,
        resourceType: 'course',
        slug,
      })
    } catch (err) {
      console.error('[sync-service] Failed to queue course event:', (err as Error).message)
    }
  }

  /**
   * Get live queue statistics from BullMQ.
   */
  static async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      syncQueue.getWaitingCount(),
      syncQueue.getActiveCount(),
      syncQueue.getCompletedCount(),
      syncQueue.getFailedCount(),
    ])
    return { waiting, active, completed, failed, total: waiting + active }
  }

  /**
   * Process queue manually (for backward compatibility — BullMQ handles this automatically).
   * @deprecated Workers process the queue automatically via BullMQ
   */
  static async processQueue(): Promise<void> {
    console.warn('[sync-service] processQueue() is deprecated — BullMQ workers handle this automatically')
  }

  /**
   * Sync enrollment immediately (critical path — still queued but with high priority).
   */
  static async syncEnrollmentNow(enrollmentId: string): Promise<void> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        User: { select: { id: true, email: true, name: true } },
        Course: { select: { id: true, title: true, slug: true } },
      },
    })

    if (!enrollment) throw new Error(`Enrollment ${enrollmentId} not found`)

    const job = await syncQueue.add(
      'enrollment.updated',
      {
        type: 'enrollment.updated',
        resourceId: enrollmentId,
        resourceType: 'enrollment',
        userId: enrollment.userId,
        data: enrollment as unknown as Record<string, unknown>,
      } satisfies SyncJobData,
      { priority: 1 } // Highest priority
    )

    console.log(`[sync-service] High-priority sync job queued: ${job.id}`)
  }

  /**
   * Sync profile immediately (critical path).
   */
  static async syncProfileNow(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { Profile: true },
    })

    if (!user) throw new Error(`User ${userId} not found`)

    await syncQueue.add(
      'profile.updated',
      {
        type: 'profile.updated',
        resourceId: userId,
        resourceType: 'user',
        userId,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          profile: user.Profile,
        } as unknown as Record<string, unknown>,
      } satisfies SyncJobData,
      { priority: 1 }
    )
  }
}

/**
 * Helper for audit log entries — unchanged API
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
  } catch (err) {
    console.error('[sync-service] Failed to log sync event:', (err as Error).message)
  }
}
