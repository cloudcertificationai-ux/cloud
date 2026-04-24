// src/lib/queue.ts
// Central BullMQ queue registry for all background jobs.
// Queues: transcode, email, sync, analytics
// Workers run as separate processes via scripts/start-workers.ts

import { Queue, QueueOptions } from 'bullmq'
import { Redis } from 'ioredis'

// ─── Job Data Types ───────────────────────────────────────────────────────────

export interface TranscodeJobData {
  mediaId: string
  r2Key: string
}

export type EmailJobType =
  | 'enrollment.confirmation'
  | 'enrollment.reminder'
  | 'welcome'
  | 'course.completed'
  | 'password.reset'
  | 'payment.receipt'
  | 'admin.new_enrollment'

export interface EmailJobData {
  type: EmailJobType
  to: string
  name?: string
  subject?: string
  // Contextual data used by templates
  courseTitle?: string
  courseSlug?: string
  courseThumbnail?: string
  instructorName?: string
  amount?: number
  currency?: string
  paymentMethod?: string
  purchaseId?: string
  enrollmentId?: string
  resetToken?: string
  resetUrl?: string
  loginUrl?: string
}

export type SyncJobType =
  | 'course.published'
  | 'course.updated'
  | 'course.unpublished'
  | 'course.deleted'
  | 'enrollment.created'
  | 'enrollment.updated'
  | 'profile.updated'

export interface SyncJobData {
  type: SyncJobType
  resourceId: string
  resourceType: 'course' | 'enrollment' | 'user'
  slug?: string      // For course revalidation
  userId?: string
  data?: Record<string, unknown>
}

export interface AnalyticsJobData {
  type: 'progress.update' | 'lesson.complete' | 'quiz.submit' | 'page.view'
  userId: string
  courseId: string
  lessonId?: string
  quizId?: string
  progress?: number       // 0–100
  timeSpentSecs?: number
  score?: number
  passed?: boolean
  completedAt?: string    // ISO string
}

// ─── Queue Names ─────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  TRANSCODE: 'transcode',
  EMAIL: 'email',
  SYNC: 'sync',
  ANALYTICS: 'analytics',
} as const

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]

// ─── Job Types Enum (for backward-compat) ────────────────────────────────────

export enum JobType {
  TRANSCODE = 'transcode',
  EMAIL = 'email',
  SYNC = 'sync',
  ANALYTICS = 'analytics',
}

// ─── Redis Connection ─────────────────────────────────────────────────────────

let bullRedis: Redis | null = null

function getBullRedis(): Redis {
  if (bullRedis) return bullRedis

  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  bullRedis = new Redis(url, {
    maxRetriesPerRequest: null, // Required by BullMQ
    enableReadyCheck: false,
    retryStrategy(times) {
      if (times > 10) return null
      return Math.min(times * 500, 5000)
    },
  })

  bullRedis.on('error', (err) => {
    if (err.message.includes('ECONNREFUSED')) {
      console.warn('[bullmq] Redis unavailable — jobs will queue when Redis recovers')
    } else {
      console.error('[bullmq] Redis error:', err.message)
    }
  })

  bullRedis.on('connect', () => {
    console.log('[bullmq] Redis connected')
  })

  return bullRedis
}

// ─── Shared Queue Options ─────────────────────────────────────────────────────

function makeQueueOptions(overrides?: Partial<QueueOptions>): QueueOptions {
  return {
    connection: getBullRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 200, age: 48 * 3600 },
      removeOnFail: { count: 500, age: 7 * 24 * 3600 },
    },
    ...overrides,
  }
}

// ─── Queue Instances ─────────────────────────────────────────────────────────
// Queues are singletons — safe to import from any API route

export const transcodeQueue = new Queue<TranscodeJobData>(
  QUEUE_NAMES.TRANSCODE,
  makeQueueOptions()
)

export const emailQueue = new Queue<EmailJobData>(
  QUEUE_NAMES.EMAIL,
  makeQueueOptions({
    defaultJobOptions: {
      attempts: 5, // Email delivery can take a couple tries
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: { count: 500, age: 7 * 24 * 3600 }, // Keep sent emails 7 days
      removeOnFail: { count: 200, age: 30 * 24 * 3600 }, // Keep failures 30 days
    },
  })
)

export const syncQueue = new Queue<SyncJobData>(
  QUEUE_NAMES.SYNC,
  makeQueueOptions({
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { count: 100, age: 24 * 3600 },
      removeOnFail: { count: 200, age: 7 * 24 * 3600 },
    },
  })
)

export const analyticsQueue = new Queue<AnalyticsJobData>(
  QUEUE_NAMES.ANALYTICS,
  makeQueueOptions({
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'fixed', delay: 2000 },
      removeOnComplete: { count: 50, age: 3600 },   // Short retention — already written to DB
      removeOnFail: { count: 100, age: 24 * 3600 },
    },
  })
)

// ─── Typed Job Helpers ────────────────────────────────────────────────────────

/** Enqueue an email job */
export async function enqueueEmail(
  data: EmailJobData,
  opts?: { delay?: number; priority?: number }
): Promise<string> {
  const job = await emailQueue.add(data.type, data, {
    delay: opts?.delay,
    priority: opts?.priority,
  })
  return job.id ?? ''
}

/** Enqueue a sync/revalidation job */
export async function enqueueSyncJob(data: SyncJobData): Promise<string> {
  // Deduplicate: if a sync for the same resource is already waiting, skip
  const jobId = `${data.type}:${data.resourceId}`
  const job = await syncQueue.add(data.type, data, { jobId })
  return job.id ?? ''
}

/** Enqueue an analytics event */
export async function enqueueAnalytics(data: AnalyticsJobData): Promise<string> {
  const job = await analyticsQueue.add(data.type, data)
  return job.id ?? ''
}

// ─── Health & Stats ───────────────────────────────────────────────────────────

export async function getQueueStats() {
  const [transcodeStats, emailStats, syncStats, analyticsStats] = await Promise.all([
    getQueueCounts(transcodeQueue),
    getQueueCounts(emailQueue),
    getQueueCounts(syncQueue),
    getQueueCounts(analyticsQueue),
  ])

  return {
    transcode: transcodeStats,
    email: emailStats,
    sync: syncStats,
    analytics: analyticsStats,
  }
}

async function getQueueCounts(queue: Queue) {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ])
  return { waiting, active, completed, failed, delayed }
}

export async function isQueueHealthy(): Promise<boolean> {
  try {
    const client = await transcodeQueue.client
    await client.ping()
    return true
  } catch {
    return false
  }
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

export async function closeQueues(): Promise<void> {
  await Promise.allSettled([
    transcodeQueue.close(),
    emailQueue.close(),
    syncQueue.close(),
    analyticsQueue.close(),
  ])

  if (bullRedis) {
    try {
      await bullRedis.quit()
    } catch {
      bullRedis.disconnect()
    }
    bullRedis = null
  }

  console.log('[bullmq] All queues closed')
}
