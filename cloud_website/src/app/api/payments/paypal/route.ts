// src/app/api/payments/paypal/route.ts
// Create PayPal order for course purchase

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { getPaymentConfig } from '@/lib/site-settings'

/**
 * Get a PayPal access token using client credentials
 */
async function getPayPalToken(clientId: string, clientSecret: string, mode: string): Promise<string> {
  const baseUrl = mode === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`PayPal auth failed: ${err}`)
  }

  const data = await response.json()
  return data.access_token
}

/**
 * POST /api/payments/paypal
 * Creates a PayPal order and returns the order ID + approval URL
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

    // Get payment config from DB
    const config = await getPaymentConfig()
    if (!config.paypal.enabled) {
      return NextResponse.json({ error: 'PayPal is not enabled' }, { status: 400 })
    }

    if (!config.paypal.clientId || !config.paypal.clientSecret) {
      return NextResponse.json({ error: 'PayPal credentials not configured' }, { status: 500 })
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

    const baseUrl = config.paypal.mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com'

    // Get PayPal access token
    const accessToken = await getPayPalToken(
      config.paypal.clientId,
      config.paypal.clientSecret,
      config.paypal.mode
    )

    // Convert amount from cents
    const amount = (purchase.amountCents / 100).toFixed(2)
    const currency = purchase.currency.toUpperCase()

    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    // Create PayPal order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': purchaseId, // Idempotency key
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: purchaseId,
            description: purchase.Course.title,
            amount: {
              currency_code: currency === 'INR' ? 'USD' : currency, // PayPal sandbox may not support INR
              value: amount,
            },
            custom_id: purchaseId,
          },
        ],
        application_context: {
          brand_name: 'Cloud Certification',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${appUrl}/courses/${purchase.Course.slug}/learn?payment=success&provider=paypal&purchaseId=${purchaseId}`,
          cancel_url: `${appUrl}/courses/${purchase.Course.slug}?payment=cancelled`,
        },
      }),
    })

    if (!orderResponse.ok) {
      const err = await orderResponse.json()
      console.error('PayPal order creation failed:', err)
      throw new Error(err.message || 'Failed to create PayPal order')
    }

    const order = await orderResponse.json()

    // Update purchase with PayPal order ID
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        provider: 'paypal',
        providerId: order.id,
      },
    })

    // Find the approval URL
    const approvalUrl = order.links?.find((l: any) => l.rel === 'approve')?.href

    return NextResponse.json({
      orderId: order.id,
      approvalUrl,
    })
  } catch (error) {
    console.error('PayPal order error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
