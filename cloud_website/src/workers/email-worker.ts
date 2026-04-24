// src/workers/email-worker.ts
// BullMQ worker that processes all outgoing emails from the email queue.
// Run as a standalone process: scripts/start-workers.ts

import { Worker, Job } from 'bullmq'
import { Redis } from 'ioredis'
import { QUEUE_NAMES, type EmailJobData } from '../lib/queue'
import { sendEmail } from '../lib/email-service'
import {
  welcomeTemplate,
  enrollmentConfirmationTemplate,
  paymentReceiptTemplate,
  courseCompletionTemplate,
  passwordResetTemplate,
  adminNewEnrollmentTemplate,
} from '../lib/email-templates'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildPayload(data: EmailJobData) {
  switch (data.type) {
    case 'welcome':
      return welcomeTemplate(data.name || 'there')

    case 'enrollment.confirmation':
      return enrollmentConfirmationTemplate({
        name: data.name || 'Student',
        courseTitle: data.courseTitle || 'Your Course',
        courseSlug: data.courseSlug || '',
        instructorName: data.instructorName,
        courseThumbnail: data.courseThumbnail,
      })

    case 'payment.receipt':
      return paymentReceiptTemplate({
        name: data.name || 'Student',
        courseTitle: data.courseTitle || 'Your Course',
        courseSlug: data.courseSlug || '',
        amount: data.amount || 0,
        currency: data.currency || 'usd',
        paymentMethod: data.paymentMethod || 'Card',
        purchaseId: data.purchaseId || '',
      })

    case 'course.completed':
      return courseCompletionTemplate({
        name: data.name || 'Student',
        courseTitle: data.courseTitle || 'Your Course',
        courseSlug: data.courseSlug || '',
      })

    case 'password.reset':
      return passwordResetTemplate(
        data.name || 'there',
        data.resetUrl || `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset`
      )

    case 'admin.new_enrollment':
      return adminNewEnrollmentTemplate({
        studentName: data.name || 'Unknown',
        studentEmail: data.to as string,
        courseTitle: data.courseTitle || 'Unknown Course',
        amount: data.amount,
        currency: data.currency,
      })

    case 'enrollment.reminder':
      return {
        subject: data.subject || `Continue learning: ${data.courseTitle}`,
        html: `<p>Hi ${data.name}, you haven't continued "${data.courseTitle}" in a while. Pick up where you left off!</p>`,
        text: `Hi ${data.name}, continue learning "${data.courseTitle}" at: ${process.env.NEXT_PUBLIC_APP_URL}/courses/${data.courseSlug}/learn`,
      }

    default:
      throw new Error(`Unknown email type: ${(data as EmailJobData).type}`)
  }
}

// ─── Worker Factory ───────────────────────────────────────────────────────────

export function createEmailWorker(): Worker<EmailJobData> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })

  const worker = new Worker<EmailJobData>(
    QUEUE_NAMES.EMAIL,
    async (job: Job<EmailJobData>) => {
      const data = job.data
      console.log(`[email-worker] Processing job ${job.id}: ${data.type} → ${data.to}`)

      try {
        const { subject, html, text } = buildPayload(data)

        const result = await sendEmail({
          to: data.to,
          subject: data.subject || subject,
          html,
          text,
        })

        if (!result.success) {
          throw new Error(result.error || 'Email send returned failure')
        }

        console.log(`[email-worker] ✓ Sent ${data.type} to ${data.to} via ${result.provider} (id: ${result.id})`)
        return { emailId: result.id, provider: result.provider }
      } catch (err) {
        const msg = (err as Error).message
        console.error(`[email-worker] ✗ Failed ${data.type} to ${data.to}: ${msg}`)
        throw err // Let BullMQ retry
      }
    },
    {
      connection,
      concurrency: 10, // Send up to 10 emails in parallel
      limiter: {
        max: 50,        // Max 50 emails per second (respect provider limits)
        duration: 1000,
      },
    }
  )

  worker.on('completed', (job) => {
    console.log(`[email-worker] Job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`[email-worker] Job ${job?.id} failed after ${job?.attemptsMade} attempts: ${err.message}`)
  })

  worker.on('error', (err) => {
    console.error('[email-worker] Worker error:', err.message)
  })

  return worker
}
