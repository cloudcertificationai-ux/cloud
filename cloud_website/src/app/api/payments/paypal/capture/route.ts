// src/app/api/payments/paypal/capture/route.ts
// Capture a PayPal payment after user approves it

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { dbDataService } from '@/data/db-data-service'
import { getPaymentConfig } from '@/lib/site-settings'
import { SyncService, SyncEventType } from '@/lib/sync-service'
import { enqueueEmail } from '@/lib/queue'

async function getPayPalToken(clientId: string, clientSecret: string, mode: string): Promise<string> {
  const baseUrl = mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  })
  if (!response.ok) throw new Error('PayPal auth failed')
  const data = await response.json()
  return data.access_token
}

/**
 * POST /api/payments/paypal/capture
 * Capture approved PayPal payment and enroll user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, purchaseId } = body

    if (!orderId || !purchaseId) {
      return NextResponse.json({ error: 'orderId and purchaseId are required' }, { status: 400 })
    }

    const config = await getPaymentConfig()
    if (!config.paypal.enabled || !config.paypal.clientId || !config.paypal.clientSecret) {
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 400 })
    }

    const baseUrl = config.paypal.mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    const accessToken = await getPayPalToken(config.paypal.clientId, config.paypal.clientSecret, config.paypal.mode)

    // Capture the payment
    const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!captureResponse.ok) {
      const err = await captureResponse.json()
      console.error('PayPal capture failed:', err)
      throw new Error(err.message || 'Failed to capture PayPal payment')
    }

    const captureData = await captureResponse.json()
    const captureStatus = captureData.status

    if (captureStatus !== 'COMPLETED') {
      return NextResponse.json({ error: `Payment not completed: ${captureStatus}` }, { status: 400 })
    }

    // Get purchase details
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { Course: true, User: true },
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    if (purchase.User.email !== session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Mark purchase as completed
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'COMPLETED',
        provider: 'paypal',
        providerId: orderId,
      },
    })

    // Create enrollment
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const existingEnrollment = await dbDataService.checkEnrollment(user.id, purchase.courseId)
    if (!existingEnrollment) {
      const enrollment = await prisma.enrollment.create({
        data: {
          User: { connect: { id: user.id } },
          Course: { connect: { id: purchase.courseId } },
          source: 'paypal',
          status: 'ACTIVE',
          Purchase: { connect: { id: purchase.id } },
        },
      })

      await SyncService.emitEnrollmentEvent(SyncEventType.ENROLLMENT_CREATED, enrollment.id).catch(console.error)

      // Queue enrollment confirmation + payment receipt emails
      await Promise.allSettled([
        enqueueEmail({
          type: 'enrollment.confirmation',
          to: user.email!,
          name: user.name || undefined,
          courseTitle: purchase.Course.title,
          courseSlug: purchase.Course.slug,
        }),
        enqueueEmail({
          type: 'payment.receipt',
          to: user.email!,
          name: user.name || undefined,
          courseTitle: purchase.Course.title,
          courseSlug: purchase.Course.slug,
          amount: purchase.amount ? Number(purchase.amount) : 0,
          currency: 'usd',
          paymentMethod: 'PayPal',
          purchaseId: purchase.id,
        }),
      ])
    }

    return NextResponse.json({ success: true, courseSlug: purchase.Course.slug })
  } catch (error) {
    console.error('PayPal capture error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture payment' },
      { status: 500 }
    )
  }
}
