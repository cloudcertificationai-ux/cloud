// src/app/api/payments/razorpay/route.ts
// Create a Razorpay order for course purchase

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { getPaymentConfig } from '@/lib/site-settings'
import crypto from 'crypto'

/**
 * POST /api/payments/razorpay
 * Creates a Razorpay order
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { purchaseId } = body

    if (!purchaseId) {
      return NextResponse.json({ error: 'purchaseId is required' }, { status: 400 })
    }

    // Get config from DB
    const config = await getPaymentConfig()
    if (!config.razorpay.enabled) {
      return NextResponse.json({ error: 'Razorpay is not enabled' }, { status: 400 })
    }

    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      return NextResponse.json({ error: 'Razorpay credentials not configured' }, { status: 500 })
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

    // Create Razorpay order via REST API
    const credentials = Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString('base64')

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: purchase.amountCents, // Amount in paise (smallest currency unit)
        currency: purchase.currency.toUpperCase(),
        receipt: purchaseId,
        notes: {
          purchaseId,
          courseId: purchase.courseId,
          userId: purchase.userId,
          courseTitle: purchase.Course.title,
        },
      }),
    })

    if (!razorpayResponse.ok) {
      const err = await razorpayResponse.json()
      console.error('Razorpay order creation failed:', err)
      throw new Error(err.error?.description || 'Failed to create Razorpay order')
    }

    const order = await razorpayResponse.json()

    // Update purchase with Razorpay order ID
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        provider: 'razorpay',
        providerId: order.id,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: config.razorpay.keyId,
      courseName: purchase.Course.title,
      userEmail: purchase.User.email,
      userName: purchase.User.name,
    })
  } catch (error) {
    console.error('Razorpay order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Razorpay order' },
      { status: 500 }
    )
  }
}
