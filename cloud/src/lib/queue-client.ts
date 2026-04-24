// src/lib/queue-client.ts (admin panel)
// BullMQ Queue client for the admin panel.
// The admin panel is a producer — it adds jobs but doesn't run workers.
// Workers run in the cloud_website project (scripts/start-workers.ts).

import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

// ─── Job Data Types (mirrored from cloud_website) ────────────────────────────
// Kept minimal — only what the admin panel actually produces

export interface SyncJobData {
  type:
    | 'course.published'
    | 'course.updated'
    | 'course.unpublished'
    | 'course.deleted'
    | 'enrollment.created'
    | 'enrollment.updated'
    | 'profile.updated'
  resourceId: string
  resourceType: 'course' | 'enrollment' | 'user'
  slug?: string
  userId?: string
  data?: Record<string, unknown>
}

export interface EmailJobData {
  type:
    | 'enrollment.confirmation'
    | 'welcome'
    | 'course.completed'
    | 'payment.receipt'
    | 'admin.new_enrollment'
  to: string
  name?: string
  subject?: string
  courseTitle?: string
  courseSlug?: string
  instructorName?: string
  amount?: number
  currency?: string
  paymentMethod?: string
  purchaseId?: string
  enrollmentId?: string
}

// ─── Queue Names ──────────────────────────────────────────────────────────────

const QUEUE_NAMES = {
  EMAIL: 'email',
  SYNC: 'sync',
  TRANSCODE: 'transcode',
  ANALYTICS: 'analytics',
} as const

// ─── Redis Connection ─────────────────────────────────────────────────────────

let adminBullRedis: Redis | null = null

function getAdminRedis(): Redis {
  if (adminBullRedis) return adminBullRedis

  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  adminBullRedis = new Redis(url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => (times > 5 ? null : Math.min(times * 500, 5000)),
  })

  adminBullRedis.on('error', (err) => {
    if (err.message.includes('ECONNREFUSED')) {
      // Redis not running — jobs won't be queued
    } else {
      console.error('[admin queue-client] Redis error:', err.message)
    }
  })

  return adminBullRedis
}

// ─── Queue Instances ─────────────────────────────────────────────────────────

function getQueue<T>(name: string): Queue<T> {
  return new Queue<T>(name, {
    connection: getAdminRedis(),
  })
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Notify website workers that a course changed (triggers ISR revalidation)
 */
export async function notifyCourseChanged(
  action: SyncJobData['type'],
  courseId: string,
  slug?: string
): Promise<void> {
  try {
    const queue = getQueue<SyncJobData>(QUEUE_NAMES.SYNC)
    const jobId = `${action}:${courseId}` // Dedup key

    await queue.add(action, {
      type: action,
      resourceId: courseId,
      resourceType: 'course',
      slug,
    }, { jobId })

    await queue.close()
  } catch (err) {
    // Non-fatal — don't break the admin panel action
    console.error('[admin queue-client] Failed to queue sync job:', (err as Error).message)
  }
}

/**
 * Queue an email job from the admin panel
 * (e.g. notify admin of new enrollment, send bulk emails)
 */
export async function queueEmail(data: EmailJobData): Promise<string | null> {
  try {
    const queue = getQueue<EmailJobData>(QUEUE_NAMES.EMAIL)
    const job = await queue.add(data.type, data)
    await queue.close()
    return job.id ?? null
  } catch (err) {
    console.error('[admin queue-client] Failed to queue email:', (err as Error).message)
    return null
  }
}

// ─── Queue Stats (for Bull Board) ─────────────────────────────────────────────

export async function getAllQueueStats() {
  const queueNames = Object.values(QUEUE_NAMES)
  const stats: Record<string, {
    waiting: number; active: number; completed: number; failed: number; delayed: number
  }> = {}

  const redis = getAdminRedis()

  for (const name of queueNames) {
    try {
      const queue = new Queue(name, { connection: redis })
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ])
      stats[name] = { waiting, active, completed, failed, delayed }
      await queue.close()
    } catch {
      stats[name] = { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
    }
  }

  return stats
}

export async function getRecentJobs(queueName: string, limit = 20) {
  try {
    const redis = getAdminRedis()
    const queue = new Queue(queueName, { connection: redis })

    const [completed, failed, active, waiting] = await Promise.all([
      queue.getCompleted(0, limit - 1),
      queue.getFailed(0, Math.floor(limit / 2) - 1),
      queue.getActive(0, 5),
      queue.getWaiting(0, 5),
    ])

    await queue.close()

    return {
      completed: completed.map(j => ({
        id: j.id,
        name: j.name,
        data: j.data,
        returnvalue: j.returnvalue,
        finishedOn: j.finishedOn,
        processedOn: j.processedOn,
        status: 'completed',
      })),
      failed: failed.map(j => ({
        id: j.id,
        name: j.name,
        data: j.data,
        failedReason: j.failedReason,
        finishedOn: j.finishedOn,
        attemptsMade: j.attemptsMade,
        status: 'failed',
      })),
      active: active.map(j => ({
        id: j.id,
        name: j.name,
        data: j.data,
        processedOn: j.processedOn,
        status: 'active',
      })),
      waiting: waiting.map(j => ({
        id: j.id,
        name: j.name,
        data: j.data,
        timestamp: j.timestamp,
        status: 'waiting',
      })),
    }
  } catch {
    return { completed: [], failed: [], active: [], waiting: [] }
  }
}

export async function retryFailedJob(queueName: string, jobId: string): Promise<boolean> {
  try {
    const redis = getAdminRedis()
    const queue = new Queue(queueName, { connection: redis })
    const job = await queue.getJob(jobId)
    if (job) {
      await job.retry()
      await queue.close()
      return true
    }
    return false
  } catch {
    return false
  }
}
