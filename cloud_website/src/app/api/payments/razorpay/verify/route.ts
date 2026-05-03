// src/app/api/payments/razorpay/verify/route.ts
// Verify Razorpay payment signature and complete enrollment

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { dbDataService } from '@/data/db-data-service'
import { getPaymentConfig } from '@/lib/site-settings'
import { SyncService, SyncEventType } from '@/lib/sync-service'
import { enqueueEmail } from '@/lib/queue'
import crypto from 'crypto'

/**
 * POST /api/payments/razorpay/verify
 * Verifies Razorpay payment signature and creates enrollment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, purchaseId } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !purchaseId) {
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 })
    }

    // Get config from DB
    const config = await getPaymentConfig()
    if (!config.razorpay.enabled || !config.razorpay.keySecret) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 400 })
    }

    // Verify signature: HMAC SHA256 of "orderId|paymentId"
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
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
        provider: 'razorpay',
        providerId: razorpay_payment_id,
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
          source: 'razorpay',
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
          amount: purchase.amountCents ? Number(purchase.amountCents) / 100 : 0,
          currency: 'inr',
          paymentMethod: 'Razorpay',
          purchaseId: purchase.id,
        }),
      ])
    }

    return NextResponse.json({ success: true, courseSlug: purchase.Course.slug })
  } catch (error) {
    console.error('Razorpay verify error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    )
  }
}
