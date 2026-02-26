// src/app/api/payments/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover',
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { purchaseId } = body

    if (!purchaseId) {
      return NextResponse.json(
        { error: 'Purchase ID is required' },
        { status: 400 }
      )
    }

    // Get purchase details
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        course: true,
        user: true,
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase not found' },
        { status: 404 }
      )
    }

    // Verify purchase belongs to current user
    if (purchase.user.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: purchase.currency.toLowerCase(),
            product_data: {
              name: purchase.course.title,
              description: purchase.course.summary || undefined,
            },
            unit_amount: purchase.amountCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/courses/${purchase.course.slug}/learn?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/courses/${purchase.course.slug}?payment=cancelled`,
      client_reference_id: purchaseId,
      customer_email: purchase.user.email || undefined,
      metadata: {
        purchaseId: purchase.id,
        courseId: purchase.courseId,
        userId: purchase.userId,
      },
    })

    // Update purchase with Stripe session ID
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        providerId: checkoutSession.id,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
