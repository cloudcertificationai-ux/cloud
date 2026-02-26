// src/app/api/webhooks/enrollment-changed/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  handleApiError,
  ValidationError,
  AuthenticationError,
  SuccessResponseBuilder,
} from '@/lib/api-errors'
import { SyncEvent, SyncEventType, logSyncEvent } from '@/lib/sync-service'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex')

    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer)
  } catch (error) {
    return false
  }
}

/**
 * POST /api/webhooks/enrollment-changed
 * Webhook endpoint for enrollment synchronization events
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET not configured')
      throw new AuthenticationError('Webhook authentication not configured')
    }

    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature')
    if (!signature) {
      throw new AuthenticationError('Missing webhook signature')
    }

    const rawBody = await request.text()
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret)

    if (!isValid) {
      throw new AuthenticationError('Invalid webhook signature')
    }

    // Parse webhook payload
    let event: SyncEvent
    try {
      event = JSON.parse(rawBody)
    } catch (error) {
      throw new ValidationError('Invalid JSON payload')
    }

    // Validate event structure
    if (!event.type || !event.resourceId || !event.data) {
      throw new ValidationError('Invalid event structure', {
        type: event.type ? [] : ['Event type is required'],
        resourceId: event.resourceId ? [] : ['Resource ID is required'],
        data: event.data ? [] : ['Event data is required'],
      })
    }

    // Validate event type
    const validTypes = [
      SyncEventType.ENROLLMENT_CREATED,
      SyncEventType.ENROLLMENT_UPDATED,
      SyncEventType.ENROLLMENT_DELETED,
    ]

    if (!validTypes.includes(event.type)) {
      throw new ValidationError(`Invalid event type: ${event.type}`)
    }

    // Process enrollment event
    await processEnrollmentEvent(event)

    // Log successful sync
    await logSyncEvent(event, true)

    return SuccessResponseBuilder.success({
      message: 'Enrollment event processed successfully',
      eventId: event.id,
      eventType: event.type,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Process enrollment sync event
 */
async function processEnrollmentEvent(event: SyncEvent): Promise<void> {
  const { type, resourceId, data } = event

  switch (type) {
    case SyncEventType.ENROLLMENT_CREATED:
      await handleEnrollmentCreated(resourceId, data)
      break

    case SyncEventType.ENROLLMENT_UPDATED:
      await handleEnrollmentUpdated(resourceId, data)
      break

    case SyncEventType.ENROLLMENT_DELETED:
      await handleEnrollmentDeleted(resourceId, data)
      break

    default:
      throw new ValidationError(`Unsupported event type: ${type}`)
  }
}

/**
 * Handle enrollment created event
 */
async function handleEnrollmentCreated(
  enrollmentId: string,
  data: any
): Promise<void> {
  // Check if enrollment already exists
  const existing = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  })

  if (existing) {
    console.log(`Enrollment ${enrollmentId} already exists, updating instead`)
    await handleEnrollmentUpdated(enrollmentId, data)
    return
  }

  // Create enrollment record
  await prisma.enrollment.create({
    data: {
      id: enrollmentId,
      userId: data.userId,
      courseId: data.courseId,
      enrolledAt: new Date(data.enrolledAt),
      lastAccessedAt: data.lastAccessedAt ? new Date(data.lastAccessedAt) : null,
      completionPercentage: data.completionPercentage || 0,
      status: data.status || 'ACTIVE',
      source: data.source || 'admin',
      purchaseId: data.purchaseId || null,
    },
  })

  console.log(`Enrollment ${enrollmentId} created successfully`)
}

/**
 * Handle enrollment updated event
 */
async function handleEnrollmentUpdated(
  enrollmentId: string,
  data: any
): Promise<void> {
  // Update enrollment record
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      lastAccessedAt: data.lastAccessedAt ? new Date(data.lastAccessedAt) : undefined,
      completionPercentage: data.completionPercentage,
      status: data.status,
    },
  })

  console.log(`Enrollment ${enrollmentId} updated successfully`)
}

/**
 * Handle enrollment deleted event
 */
async function handleEnrollmentDeleted(
  enrollmentId: string,
  data: any
): Promise<void> {
  // Delete enrollment record
  await prisma.enrollment.delete({
    where: { id: enrollmentId },
  })

  console.log(`Enrollment ${enrollmentId} deleted successfully`)
}
