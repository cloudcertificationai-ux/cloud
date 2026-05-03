// src/app/api/health/route.ts — cloud (admin panel)
// Real health check: probes database and Redis.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

const CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Health-Check': 'true',
}

async function checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; latencyMs?: number; error?: string }> {
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

async function checkRedis(): Promise<{ status: 'healthy' | 'degraded'; latencyMs?: number; error?: string }> {
  if (!process.env.REDIS_URL) {
    return { status: 'degraded', error: 'REDIS_URL not set' }
  }
  const start = Date.now()
  try {
    // Lazy import to avoid breaking the route if ioredis isn't available at edge
    const { Redis } = await import('ioredis')
    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      commandTimeout: 2000,
      lazyConnect: true,
    })
    await client.connect()
    const pong = await client.ping()
    await client.quit()
    if (pong !== 'PONG') throw new Error(`Unexpected PING response: ${pong}`)
    return { status: 'healthy', latencyMs: Date.now() - start }
  } catch (err) {
    return {
      status: 'degraded',
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Redis unreachable',
    }
  }
}

export async function GET(_request: NextRequest) {
  const [dbCheck, redisCheck] = await Promise.all([checkDatabase(), checkRedis()])

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
    },
  }

  return NextResponse.json(body, {
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: CACHE_HEADERS,
  })
}
