// src/lib/redis.ts
// Unified Redis client singleton for caching (separate from BullMQ connection)
// Supports graceful degradation — app works fine if Redis is unavailable

import { Redis } from 'ioredis'

let cacheClient: Redis | null = null
let isConnected = false

/**
 * Get the shared Redis client for caching.
 * Returns null if REDIS_URL is not set or connection fails.
 */
export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) return null

  if (cacheClient) return cacheClient

  try {
    cacheClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 5000,
      commandTimeout: 3000,
      retryStrategy(times) {
        if (times > 5) return null // Stop retrying after 5 attempts
        return Math.min(times * 200, 2000)
      },
    })

    cacheClient.on('connect', () => {
      isConnected = true
      console.log('[redis] Cache client connected')
    })

    cacheClient.on('ready', () => {
      isConnected = true
    })

    cacheClient.on('error', (err) => {
      isConnected = false
      // Only log once per error type to avoid log spam
      if (err.message.includes('ECONNREFUSED')) {
        console.warn('[redis] Cache unavailable — running without Redis cache')
      } else {
        console.error('[redis] Cache error:', err.message)
      }
    })

    cacheClient.on('close', () => {
      isConnected = false
    })

    // Kick off connection in background — don't await
    cacheClient.connect().catch(() => {
      // Error already handled by 'error' event above
    })
  } catch {
    cacheClient = null
  }

  return cacheClient
}

/**
 * Check if Redis is currently reachable
 */
export function isRedisConnected(): boolean {
  return isConnected
}

// ─── Typed cache helpers ─────────────────────────────────────────────────────

/**
 * Get a JSON-serialized value from Redis
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) return null

  try {
    const raw = await client.get(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/**
 * Set a JSON-serialized value in Redis with optional TTL (seconds)
 */
export async function redisSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    const serialized = JSON.stringify(value)
    if (ttlSeconds) {
      await client.setex(key, ttlSeconds, serialized)
    } else {
      await client.set(key, serialized)
    }
  } catch {
    // Non-fatal — just miss the cache
  }
}

/**
 * Delete a key from Redis
 */
export async function redisDel(...keys: string[]): Promise<void> {
  const client = getRedisClient()
  if (!client || keys.length === 0) return

  try {
    await client.del(...keys)
  } catch {
    // Non-fatal
  }
}

/**
 * Delete all Redis keys matching a pattern (uses SCAN — production-safe)
 */
export async function redisDelPattern(pattern: string): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0

  let cursor = '0'
  let deleted = 0

  try {
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', '100')
      cursor = nextCursor
      if (keys.length > 0) {
        await client.del(...keys)
        deleted += keys.length
      }
    } while (cursor !== '0')
  } catch {
    // Non-fatal
  }

  return deleted
}

/**
 * Increment a counter atomically in Redis
 */
export async function redisIncr(key: string, ttlSeconds?: number): Promise<number> {
  const client = getRedisClient()
  if (!client) return 0

  try {
    const val = await client.incr(key)
    if (ttlSeconds && val === 1) {
      // Set TTL only on first increment
      await client.expire(key, ttlSeconds)
    }
    return val
  } catch {
    return 0
  }
}

/**
 * Add to a Redis sorted set (useful for rate limiting and leaderboards)
 */
export async function redisZadd(key: string, score: number, member: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.zadd(key, score, member)
  } catch {
    // Non-fatal
  }
}

/**
 * Publish a message to a Redis channel (Pub/Sub)
 */
export async function redisPublish(channel: string, message: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.publish(channel, message)
  } catch {
    // Non-fatal
  }
}

/**
 * Close the Redis cache connection gracefully
 */
export async function closeRedisClient(): Promise<void> {
  if (cacheClient) {
    try {
      await cacheClient.quit()
    } catch {
      cacheClient.disconnect()
    }
    cacheClient = null
    isConnected = false
  }
}
