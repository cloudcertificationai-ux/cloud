// src/app/api/webhooks/profile-updated/route.ts
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
 * POST /api/webhooks/profile-updated
 * Webhook endpoint for profile synchronization events
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
      SyncEventType.PROFILE_UPDATED,
      SyncEventType.USER_CREATED,
      SyncEventType.USER_UPDATED,
    ]

    if (!validTypes.includes(event.type)) {
      throw new ValidationError(`Invalid event type: ${event.type}`)
    }

    // Process profile event
    await processProfileEvent(event)

    // Log successful sync
    await logSyncEvent(event, true)

    return SuccessResponseBuilder.success({
      message: 'Profile event processed successfully',
      eventId: event.id,
      eventType: event.type,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Process profile sync event
 */
async function processProfileEvent(event: SyncEvent): Promise<void> {
  const { type, resourceId, data } = event

  switch (type) {
    case SyncEventType.PROFILE_UPDATED:
    case SyncEventType.USER_UPDATED:
      await handleProfileUpdated(resourceId, data)
      break

    case SyncEventType.USER_CREATED:
      await handleUserCreated(resourceId, data)
      break

    default:
      throw new ValidationError(`Unsupported event type: ${type}`)
  }
}

/**
 * Handle user created event
 */
async function handleUserCreated(userId: string, data: any): Promise<void> {
  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (existing) {
    console.log(`User ${userId} already exists, updating instead`)
    await handleProfileUpdated(userId, data)
    return
  }

  // Create user record
  await prisma.user.create({
    data: {
      id: userId,
      email: data.email,
      name: data.name || null,
      image: data.image || null,
      emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
      role: data.role || 'STUDENT',
      lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : null,
    },
  })

  // Create profile if provided
  if (data.profile) {
    await prisma.profile.create({
      data: {
        userId,
        bio: data.profile.bio || null,
        location: data.profile.location || null,
        timezone: data.profile.timezone || null,
        phone: data.profile.phone || null,
      },
    })
  }

  console.log(`User ${userId} created successfully`)
}

/**
 * Handle profile updated event
 */
async function handleProfileUpdated(userId: string, data: any): Promise<void> {
  // Update user record
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: data.email,
      name: data.name || null,
      image: data.image || null,
      emailVerified: data.emailVerified ? new Date(data.emailVerified) : undefined,
      role: data.role,
      lastLoginAt: data.lastLoginAt ? new Date(data.lastLoginAt) : undefined,
    },
  })

  // Update or create profile
  if (data.profile) {
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    })

    if (existingProfile) {
      await prisma.profile.update({
        where: { userId },
        data: {
          bio: data.profile.bio || null,
          location: data.profile.location || null,
          timezone: data.profile.timezone || null,
          phone: data.profile.phone || null,
        },
      })
    } else {
      await prisma.profile.create({
        data: {
          userId,
          bio: data.profile.bio || null,
          location: data.profile.location || null,
          timezone: data.profile.timezone || null,
          phone: data.profile.phone || null,
        },
      })
    }
  }

  console.log(`Profile for user ${userId} updated successfully`)
}
