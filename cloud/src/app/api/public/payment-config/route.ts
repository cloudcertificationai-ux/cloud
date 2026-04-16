// src/app/api/public/payment-config/route.ts
// Public endpoint - returns only public-safe payment config (no secrets)

import { NextResponse } from 'next/server'
import { getPublicPaymentConfig } from '@/lib/settings'

export async function GET() {
  try {
    const config = await getPublicPaymentConfig()
    return NextResponse.json(config, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error fetching payment config:', error)
    return NextResponse.json(
      { stripe: { enabled: false }, paypal: { enabled: false }, razorpay: { enabled: false } },
      { status: 200 }
    )
  }
}
