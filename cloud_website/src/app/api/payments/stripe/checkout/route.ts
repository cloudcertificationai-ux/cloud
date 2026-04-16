// src/app/api/payments/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import Stripe from 'stripe'
import { getPaymentConfig } from '@/lib/site-settings'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { purchaseId } = body

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID is required' }, { status: 400 })
    }

    // Load Stripe config from DB (falls back to env vars)
    const config = await getPaymentConfig()

    if (!config.stripe.enabled) {
      return NextResponse.json({ error: 'Stripe payment is not enabled' }, { status: 400 })
    }

    const stripeSecretKey = config.stripe.secretKey
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe secret key not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-01-28.clover' })

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

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: purchase.currency.toLowerCase(),
            product_data: {
              name: purchase.Course.title,
              description: purchase.Course.summary || undefined,
            },
            unit_amount: purchase.amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/courses/${purchase.Course.slug}/learn?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/courses/${purchase.Course.slug}?payment=cancelled`,
      client_reference_id: purchaseId,
      customer_email: purchase.User.email || undefined,
      metadata: {
        purchaseId: purchase.id,
        courseId: purchase.courseId,
        userId: purchase.userId,
      },
    })

    // Update purchase with Stripe session ID and set provider
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        provider: 'stripe',
        providerId: checkoutSession.id,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
