// src/app/api/payment-config/route.ts
// Returns active payment gateways + public keys (no secrets)

import { NextResponse } from 'next/server'
import { getPublicPaymentConfig } from '@/lib/site-settings'
import { ensureDatabaseTables } from '@/lib/db-init'

export async function GET() {
  try {
    await ensureDatabaseTables()
    const config = await getPublicPaymentConfig()
    return NextResponse.json(config, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('Error fetching payment config:', error)
    // Return safe defaults if DB is unavailable
    return NextResponse.json({
      stripe: { enabled: false, publishableKey: '' },
      paypal: { enabled: false, clientId: '', mode: 'sandbox' },
      razorpay: { enabled: false, keyId: '' },
    })
  }
}
