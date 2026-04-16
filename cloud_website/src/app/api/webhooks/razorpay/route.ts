// src/app/api/webhooks/razorpay/route.ts
// Handle Razorpay webhook events with signature verification

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { dbDataService } from '@/data/db-data-service'
import { getPaymentConfig } from '@/lib/site-settings'
import { SyncService } from '@/lib/sync-service'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const config = await getPaymentConfig()
    if (config.razorpay.webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.webhookSecret)
        .update(body)
        .digest('hex')

      if (expectedSignature !== signature) {
        console.error('Invalid Razorpay webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    const eventType = event.event

    console.log('Razorpay webhook received:', eventType)

    switch (eventType) {
      case 'payment.captured': {
        await handlePaymentCaptured(event)
        break
      }
      case 'payment.failed': {
        await handlePaymentFailed(event)
        break
      }
      case 'order.paid': {
        await handleOrderPaid(event)
        break
      }
      default:
        console.log('Unhandled Razorpay webhook event:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleOrderPaid(event: any) {
  try {
    const orderId = event.payload?.order?.entity?.id
    const paymentId = event.payload?.payment?.entity?.id

    if (!orderId) return

    // Find purchase by Razorpay order ID
    const purchase = await prisma.purchase.findFirst({
      where: { providerId: { in: [orderId, paymentId].filter(Boolean) }, provider: 'razorpay' },
      include: { Course: true },
    })

    if (!purchase || purchase.status === 'COMPLETED') return

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'COMPLETED', providerId: paymentId || orderId },
    })

    const existingEnrollment = await dbDataService.checkEnrollment(purchase.userId, purchase.courseId)
    if (!existingEnrollment) {
      const enrollment = await prisma.enrollment.create({
        data: {
          User: { connect: { id: purchase.userId } },
          Course: { connect: { id: purchase.courseId } },
          source: 'razorpay',
          status: 'ACTIVE',
          Purchase: { connect: { id: purchase.id } },
        },
      })
      await SyncService.emitEnrollmentEvent('enrollment.created' as any, enrollment.id, enrollment).catch(console.error)
    }
  } catch (error) {
    console.error('Error handling Razorpay order.paid:', error)
  }
}

async function handlePaymentCaptured(event: any) {
  try {
    const payment = event.payload?.payment?.entity
    const orderId = payment?.order_id
    const paymentId = payment?.id

    if (!orderId) return

    const purchase = await prisma.purchase.findFirst({
      where: { providerId: orderId, provider: 'razorpay' },
    })

    if (!purchase || purchase.status === 'COMPLETED') return

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'COMPLETED', providerId: paymentId || orderId },
    })

    const existingEnrollment = await dbDataService.checkEnrollment(purchase.userId, purchase.courseId)
    if (!existingEnrollment) {
      const enrollment = await prisma.enrollment.create({
        data: {
          User: { connect: { id: purchase.userId } },
          Course: { connect: { id: purchase.courseId } },
          source: 'razorpay',
          status: 'ACTIVE',
          Purchase: { connect: { id: purchase.id } },
        },
      })
      await SyncService.emitEnrollmentEvent('enrollment.created' as any, enrollment.id, enrollment).catch(console.error)
    }
  } catch (error) {
    console.error('Error handling Razorpay payment.captured:', error)
  }
}

async function handlePaymentFailed(event: any) {
  try {
    const payment = event.payload?.payment?.entity
    const orderId = payment?.order_id

    if (!orderId) return

    const purchase = await prisma.purchase.findFirst({
      where: { providerId: orderId, provider: 'razorpay' },
    })

    if (!purchase) return

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'FAILED' },
    })
  } catch (error) {
    console.error('Error handling Razorpay payment.failed:', error)
  }
}
