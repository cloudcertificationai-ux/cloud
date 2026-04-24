// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/db'
import { dbDataService } from '@/data/db-data-service'
import { SyncService, SyncEventType } from '@/lib/sync-service'
import { getPaymentConfig } from '@/lib/site-settings'
import { enqueueEmail } from '@/lib/queue'

export async function POST(request: NextRequest) {
  try {
    // Load stripe config from DB (fallback to env vars)
    const config = await getPaymentConfig()
    const stripeSecretKey = config.stripe.secretKey || process.env.STRIPE_SECRET_KEY || ''
    const webhookSecret = config.stripe.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || ''

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-01-28.clover' })

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
      SyncEventType.ENROLLMENT_CREATED,
      enrollment.id
    ).catch((error) => {
      console.error('Failed to emit enrollment sync event:', error)
    })

    // Queue confirmation + receipt emails
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { title: true, slug: true },
    })
    if (user?.email && course) {
      await Promise.allSettled([
        enqueueEmail({
          type: 'enrollment.confirmation',
          to: user.email,
          name: user.name || undefined,
          courseTitle: course.title,
          courseSlug: course.slug,
        }),
        enqueueEmail({
          type: 'payment.receipt',
          to: user.email,
          name: user.name || undefined,
          courseTitle: course.title,
          courseSlug: course.slug,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          paymentMethod: 'Stripe',
          purchaseId: purchase.id,
        }),
      ])
    }

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
