// src/app/api/payment-config/route.ts
// Returns active payment gateways + public keys (no secrets).
// Cached in Redis for 5 minutes — invalidated when admin saves payment settings.

import { NextResponse } from 'next/server'
import { getPublicPaymentConfig } from '@/lib/site-settings'
import { ensureDatabaseTables } from '@/lib/db-init'
import { redisGet, redisSet } from '@/lib/redis'

const CACHE_KEY = 'payment_config:public'
const CACHE_TTL = 300 // 5 minutes

const SAFE_DEFAULTS = {
  stripe: { enabled: false, publishableKey: '' },
  paypal: { enabled: false, clientId: '', mode: 'sandbox' as const },
  razorpay: { enabled: false, keyId: '' },
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await ensureDatabaseTables()

    // L1 check: Redis cache (avoid hitting DB on every page load)
    const cached = await redisGet<typeof SAFE_DEFAULTS>(CACHE_KEY)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-Cache': 'HIT',
        },
      })
    }

    // Cache miss — fetch from DB
    const config = await getPublicPaymentConfig()
    await redisSet(CACHE_KEY, config, CACHE_TTL)

    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Error fetching payment config:', error)
    return NextResponse.json(SAFE_DEFAULTS, {
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
