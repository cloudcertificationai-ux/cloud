// src/workers/analytics-worker.ts
// BullMQ worker that batches analytics/progress writes to the database.
//
// Instead of every lesson heartbeat (every 30s) writing directly to Postgres,
// progress events are queued and this worker batches them every few seconds —
// one DB upsert per user/course pair instead of dozens per minute.

import { Worker, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { QUEUE_NAMES, type AnalyticsJobData } from '../lib/queue'

// ─── DB Client (lazy import to avoid Next.js edge issues) ─────────────────────

async function getDb() {
  const { prisma } = await import('../lib/db')
  return prisma
}

// ─── Batch Buffer ─────────────────────────────────────────────────────────────
// Accumulates progress.update events and flushes them every FLUSH_INTERVAL ms.
// This avoids a DB write for every single heartbeat.

const FLUSH_INTERVAL_MS = 5_000 // Flush every 5 seconds
const progressBuffer = new Map<string, AnalyticsJobData>()
let flushTimer: ReturnType<typeof setInterval> | null = null

function bufferKey(data: AnalyticsJobData): string {
  return `${data.userId}:${data.courseId}:${data.lessonId || 'none'}`
}

async function flushProgressBuffer(): Promise<void> {
  if (progressBuffer.size === 0) return

  const items = [...progressBuffer.values()]
  progressBuffer.clear()

  const prisma = await getDb()

  try {
    // Group by userId+courseId — take the latest progress per lesson
    const updates = items.filter((i) => i.type === 'progress.update')

    if (updates.length > 0) {
      await Promise.allSettled(
        updates.map((item) =>
          prisma.courseProgress.upsert({
            where: {
              userId_courseId_lessonId: {
                userId: item.userId,
                courseId: item.courseId,
                lessonId: item.lessonId || '',
              },
            },
            update: {
              progress: item.progress,
              timeSpentSecs: { increment: item.timeSpentSecs || 0 },
              updatedAt: new Date(),
            },
            create: {
              userId: item.userId,
              courseId: item.courseId,
              lessonId: item.lessonId || '',
              progress: item.progress || 0,
              timeSpentSecs: item.timeSpentSecs || 0,
            },
          }).catch((err: Error) => {
            // Ignore "relation not found" — schema mismatch, non-fatal
            if (!err.message.includes('CourseProgress')) {
              console.error('[analytics-worker] Progress upsert failed:', err.message)
            }
          })
        )
      )
      console.log(`[analytics-worker] Flushed ${updates.length} progress updates`)
    }
  } catch (err) {
    console.error('[analytics-worker] Flush failed:', (err as Error).message)
  }
}

// ─── Job Handler ─────────────────────────────────────────────────────────────

async function processAnalytics(job: Job<AnalyticsJobData>): Promise<void> {
  const data = job.data
  const prisma = await getDb()

  switch (data.type) {
    case 'progress.update': {
      // Buffer instead of writing immediately
      progressBuffer.set(bufferKey(data), data)
      break
    }

    case 'lesson.complete': {
      // Lesson completions are important — write immediately
      await prisma.courseProgress.upsert({
        where: {
          userId_courseId_lessonId: {
            userId: data.userId,
            courseId: data.courseId,
            lessonId: data.lessonId || '',
          },
        },
        update: {
          progress: 100,
          completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
          updatedAt: new Date(),
        },
        create: {
          userId: data.userId,
          courseId: data.courseId,
          lessonId: data.lessonId || '',
          progress: 100,
          completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
        },
      }).catch((err: Error) => {
        if (!err.message.includes('CourseProgress')) {
          throw err
        }
      })

      // Check if course is now 100% complete
      await checkCourseCompletion(data.userId, data.courseId)
      break
    }

    case 'quiz.submit': {
      // Write quiz result immediately
      await prisma.quizAttempt.create({
        data: {
          userId: data.userId,
          quizId: data.quizId || '',
          score: data.score || 0,
          passed: data.passed || false,
          completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
        },
      }).catch((err: Error) => {
        // QuizAttempt may not exist in all schema versions
        console.warn('[analytics-worker] Quiz attempt write skipped:', err.message)
      })
      break
    }

    case 'page.view': {
      // Fire-and-forget page views — use Redis incr for speed
      const { redisIncr } = await import('../lib/redis')
      const today = new Date().toISOString().slice(0, 10)
      await redisIncr(`pv:${data.courseId}:${today}`, 86400) // Expire after 24h
      break
    }
  }
}

// ─── Course Completion Check ──────────────────────────────────────────────────

async function checkCourseCompletion(userId: string, courseId: string): Promise<void> {
  const prisma = await getDb()

  try {
    // Count total lessons vs completed lessons
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({ where: { Module: { courseId } } }),
      prisma.courseProgress.count({
        where: { userId, courseId, progress: 100 },
      }),
    ])

    if (totalLessons > 0 && completedLessons >= totalLessons) {
      // Mark enrollment as completed
      await prisma.enrollment.updateMany({
        where: { userId, courseId, status: { not: 'COMPLETED' } },
        data: { status: 'COMPLETED', completedAt: new Date() },
      })

      // Trigger completion email via the email queue
      const { enqueueEmail } = await import('../lib/queue')
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      })
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true, slug: true },
      })

      if (user?.email && course) {
        await enqueueEmail({
          type: 'course.completed',
          to: user.email,
          name: user.name || undefined,
          courseTitle: course.title,
          courseSlug: course.slug,
        })
        console.log(`[analytics-worker] Course completion detected for user ${userId}, email queued`)
      }
    }
  } catch (err) {
    console.error('[analytics-worker] Completion check failed:', (err as Error).message)
  }
}

// ─── Worker Factory ───────────────────────────────────────────────────────────

export function createAnalyticsWorker(): Worker<AnalyticsJobData> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })

  // Start the flush interval for buffered progress updates
  flushTimer = setInterval(flushProgressBuffer, FLUSH_INTERVAL_MS)

  const worker = new Worker<AnalyticsJobData>(
    QUEUE_NAMES.ANALYTICS,
    processAnalytics,
    {
      connection,
      concurrency: 20, // Analytics jobs are fast DB writes
      limiter: {
        max: 200,
        duration: 1000,
      },
    }
  )

  worker.on('failed', (job, err) => {
    // Analytics failures are non-critical — just log
    console.warn(`[analytics-worker] Job ${job?.id} (${job?.data?.type}) failed: ${err.message}`)
  })

  worker.on('error', (err) => {
    console.error('[analytics-worker] Worker error:', err.message)
  })

  // Clean up flush timer on worker close
  const originalClose = worker.close.bind(worker)
  worker.close = async (force?: boolean) => {
    if (flushTimer) {
      clearInterval(flushTimer)
      flushTimer = null
    }
    // Final flush before shutdown
    await flushProgressBuffer()
    return originalClose(force)
  }

  return worker
}
