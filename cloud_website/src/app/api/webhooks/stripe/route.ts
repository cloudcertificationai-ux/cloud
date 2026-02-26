// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/db'
import { dbDataService } from '@/data/db-data-service'
import { SyncService } from '@/lib/sync-service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const purchaseId = session.metadata?.purchaseId
    const courseId = session.metadata?.courseId
    const userId = session.metadata?.userId

    if (!purchaseId || !courseId || !userId) {
      console.error('Missing metadata in checkout session')
      return
    }

    // Update purchase status
    const purchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'COMPLETED',
        providerId: session.payment_intent as string,
      },
    })

    // Create enrollment
    const enrollment = await dbDataService.createEnrollment(
      userId,
      courseId,
      'purchase'
    )

    // Link enrollment to purchase
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        purchaseId: purchase.id,
      },
    })

    // Emit sync event
    await SyncService.emitEnrollmentEvent(
      'enrollment.created' as any,
      enrollment.id,
      enrollment
    ).catch((error) => {
      console.error('Failed to emit enrollment sync event:', error)
    })

    console.log(`Enrollment created for user ${userId} in course ${courseId}`)
  } catch (error) {
    console.error('Error handling checkout completed:', error)
    throw error
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find purchase by payment intent ID
    const purchase = await prisma.purchase.findFirst({
      where: { providerId: paymentIntent.id },
    })

    if (purchase) {
      await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'FAILED',
        },
      })
      console.log(`Payment failed for purchase ${purchase.id}`)
    }
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}
