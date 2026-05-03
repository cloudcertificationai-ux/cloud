// src/app/api/health/route.ts — cloud_website (student app)
// Real health check: probes database, Redis, and R2 config.
// Used by load balancers, uptime monitors, and Vercel health checks.

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getRedisClient } from '@/lib/redis'

const CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
}

async function checkDatabase(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latencyMs?: number; error?: string }> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', latencyMs: Date.now() - start }
  } catch (err) {
    return {
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown DB error',
    }
  }
}

async function checkRedis(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; latencyMs?: number; error?: string }> {
  if (!process.env.REDIS_URL) {
    return { status: 'degraded', error: 'REDIS_URL not configured — running without cache' }
  }
  const start = Date.now()
  try {
    const client = getRedisClient()
    if (!client) return { status: 'degraded', error: 'Redis client not available' }
    const pong = await client.ping()
    if (pong !== 'PONG') throw new Error(`Unexpected ping response: ${pong}`)
    return { status: 'healthy', latencyMs: Date.now() - start }
  } catch (err) {
    return {
      status: 'degraded',                 // degraded, not unhealthy — app works without Redis
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Redis unreachable',
    }
  }
}

function checkR2Config(): { status: 'healthy' | 'degraded'; missing?: string[] } {
  const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_DOMAIN']
  const missing = required.filter((k) => !process.env[k])
  return missing.length === 0
    ? { status: 'healthy' }
    : { status: 'degraded', missing }
}

export async function GET() {
  const [dbCheck, redisCheck] = await Promise.all([checkDatabase(), checkRedis()])
  const r2Check = checkR2Config()

  // Overall status — unhealthy only if DB is down (Redis and R2 degrade gracefully)
  const overallStatus = dbCheck.status === 'unhealthy' ? 'unhealthy' : 'healthy'

  const body = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.round(process.uptime()),
    memory: {
      usedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      totalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    checks: {
      database: dbCheck,
      redis: redisCheck,
      r2: r2Check,
    },
  }

  return NextResponse.json(body, {
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: CACHE_HEADERS,
  })
}

export async function HEAD() {
  // Lightweight liveness probe — just check if the process is up
  try {
    await prisma.$queryRaw`SELECT 1`
    return new Response(null, { status: 200 })
  } catch {
    return new Response(null, { status: 503 })
  }
}
