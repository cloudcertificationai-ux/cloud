// src/workers/sync-worker.ts
// BullMQ worker that processes sync events between admin panel and website.
// Triggers Next.js on-demand revalidation so pages refresh without a full redeploy.
//
// When a course is published/updated in the admin panel:
//   admin → syncQueue → this worker → POST /api/revalidate → ISR rebuild

import { Worker, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { QUEUE_NAMES, type SyncJobData } from '../lib/queue'

// ─── Revalidation ─────────────────────────────────────────────────────────────

async function revalidatePaths(paths: string[]): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const secret = process.env.REVALIDATION_SECRET

  if (!secret) {
    console.warn('[sync-worker] REVALIDATION_SECRET not set — skipping revalidation')
    return
  }

  await fetch(`${baseUrl}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ paths }),
    signal: AbortSignal.timeout(10_000),
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Revalidation failed ${res.status}: ${body}`)
    }
  })
}

// ─── Job Handler ─────────────────────────────────────────────────────────────

async function processSync(job: Job<SyncJobData>): Promise<void> {
  const { type, resourceId, slug } = job.data

  console.log(`[sync-worker] Processing ${type} for ${resourceId}`)

  switch (type) {
    case 'course.published':
    case 'course.updated': {
      const paths = [
        '/courses',          // Course listing
        '/courses/[slug]',   // ISR tag for all course pages
      ]
      if (slug) {
        paths.push(`/courses/${slug}`)
        paths.push(`/courses/${slug}/learn`)
      }
      await revalidatePaths(paths)
      console.log(`[sync-worker] ✓ Revalidated course pages for "${slug || resourceId}"`)
      break
    }

    case 'course.unpublished':
    case 'course.deleted': {
      const paths = ['/courses']
      if (slug) {
        paths.push(`/courses/${slug}`)
      }
      await revalidatePaths(paths)
      console.log(`[sync-worker] ✓ Revalidated after course removal: "${slug || resourceId}"`)
      break
    }

    case 'enrollment.created':
    case 'enrollment.updated': {
      // Revalidate user's dashboard / enrollment list
      // These are user-specific so we just invalidate Redis cache for the user
      const { userId } = job.data
      if (userId) {
        // Import Redis lazily to avoid circular deps
        const { redisDel } = await import('../lib/redis')
        await redisDel(
          `enrollments:${userId}`,
          `enrollment:check:${userId}:*`,
        )
        console.log(`[sync-worker] ✓ Cleared enrollment cache for user ${userId}`)
      }
      break
    }

    case 'profile.updated': {
      const { userId } = job.data
      if (userId) {
        const { redisDel } = await import('../lib/redis')
        await redisDel(`profile:${userId}`, `user:${userId}`)
        console.log(`[sync-worker] ✓ Cleared profile cache for user ${userId}`)
      }
      break
    }

    default:
      console.warn(`[sync-worker] Unknown sync type: ${type}`)
  }
}

// ─── Worker Factory ───────────────────────────────────────────────────────────

export function createSyncWorker(): Worker<SyncJobData> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })

  const worker = new Worker<SyncJobData>(
    QUEUE_NAMES.SYNC,
    processSync,
    {
      connection,
      concurrency: 5, // Sync jobs are lightweight
      limiter: {
        max: 20,
        duration: 1000,
      },
    }
  )

  worker.on('completed', (job) => {
    console.log(`[sync-worker] Job ${job.id} (${job.data.type}) completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[sync-worker] Job ${job?.id} (${job?.data?.type}) failed: ${err.message}`)
  })

  worker.on('error', (err) => {
    console.error('[sync-worker] Worker error:', err.message)
  })

  return worker
}
