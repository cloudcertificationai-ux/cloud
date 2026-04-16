// src/app/api/webhooks/paypal/route.ts
// Handle PayPal webhook events

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { dbDataService } from '@/data/db-data-service'
import { getPaymentConfig } from '@/lib/site-settings'
import { SyncService } from '@/lib/sync-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const eventType = body.event_type

    console.log('PayPal webhook received:', eventType)

    switch (eventType) {
      case 'CHECKOUT.ORDER.APPROVED':
      case 'PAYMENT.CAPTURE.COMPLETED': {
        await handlePaymentCompleted(body)
        break
      }
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REVERSED': {
        await handlePaymentFailed(body)
        break
      }
      default:
        console.log('Unhandled PayPal webhook event:', eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handlePaymentCompleted(event: any) {
  try {
    const orderId = event.resource?.id || event.resource?.supplementary_data?.related_ids?.order_id

    if (!orderId) {
      console.error('No order ID in PayPal webhook event')
      return
    }

    // Find purchase by PayPal order ID
    const purchase = await prisma.purchase.findFirst({
      where: { providerId: orderId, provider: 'paypal' },
      include: { Course: true, User: true },
    })

    if (!purchase) {
      console.error('Purchase not found for PayPal order:', orderId)
      return
    }

    if (purchase.status === 'COMPLETED') {
      console.log('Purchase already completed:', purchase.id)
      return
    }

    // Mark purchase as completed
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'COMPLETED' },
    })

    // Create enrollment if not already enrolled
    const existingEnrollment = await dbDataService.checkEnrollment(purchase.userId, purchase.courseId)
    if (!existingEnrollment) {
      const enrollment = await prisma.enrollment.create({
        data: {
          User: { connect: { id: purchase.userId } },
          Course: { connect: { id: purchase.courseId } },
          source: 'paypal',
          status: 'ACTIVE',
          Purchase: { connect: { id: purchase.id } },
        },
      })

      await SyncService.emitEnrollmentEvent('enrollment.created' as any, enrollment.id, enrollment).catch(console.error)
      console.log('Enrollment created via PayPal webhook:', enrollment.id)
    }
  } catch (error) {
    console.error('Error handling PayPal payment completed:', error)
  }
}

async function handlePaymentFailed(event: any) {
  try {
    const orderId = event.resource?.id

    if (!orderId) return

    const purchase = await prisma.purchase.findFirst({
      where: { providerId: orderId, provider: 'paypal' },
    })

    if (!purchase) return

    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { status: 'FAILED' },
    })

    console.log('Purchase marked as failed:', purchase.id)
  } catch (error) {
    console.error('Error handling PayPal payment failed:', error)
  }
}
