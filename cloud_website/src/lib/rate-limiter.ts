// src/lib/rate-limiter.ts
import { Redis } from 'ioredis'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limit configuration per endpoint
 */
export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  // API endpoints
  '/api/admin/students': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  '/api/admin/enrollments': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50,
  },
  '/api/admin/analytics': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  '/api/enrollments': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
  },
  '/api/profile': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  '/api/progress': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  // VOD Media System - Playback token rate limiting (Requirement 16.3)
  '/api/media/playback-token': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute per user
  },
  // Default for all other API routes
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
}

/**
 * Rate limiter class using Redis
 */
export class RateLimiter {
  private redis: Redis | null = null
  private isConnected: boolean = false

  constructor() {
    this.initRedis()
  }

  /**
   * Initialize Redis connection
   */
  private initRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) {
            return null // Stop retrying
          }
          return Math.min(times * 100, 3000) // Exponential backoff
        },
        lazyConnect: true,
      })

      this.redis.on('connect', () => {
        this.isConnected = true
        console.log('Redis connected for rate limiting')
      })

      this.redis.on('error', (error) => {
        console.error('Redis connection error:', error)
        this.isConnected = false
      })

      // Attempt to connect
      this.redis.connect().catch((error) => {
        console.error('Failed to connect to Redis:', error)
        this.isConnected = false
      })
    } catch (error) {
      console.error('Failed to initialize Redis:', error)
      this.isConnected = false
    }
  }

  /**
   * Check if rate limit is exceeded
   * @param identifier - Unique identifier (IP address, API key, user ID)
   * @param endpoint - API endpoint path
   * @returns Rate limit status
   */
  async checkRateLimit(
    identifier: string,
    endpoint: string
  ): Promise<{
    allowed: boolean
    remaining: number
    limit: number
    resetTime: number
  }> {
    // If Redis is not connected, allow the request (fail open)
    if (!this.redis || !this.isConnected) {
      console.warn('Redis not available, rate limiting disabled')
      return {
        allowed: true,
        remaining: 999,
        limit: 1000,
        resetTime: Date.now() + 60000,
      }
    }

    // Get rate limit config for endpoint
    const config = this.getRateLimitConfig(endpoint)
    
    // Normalize endpoint for pattern matching (remove dynamic segments)
    const normalizedEndpoint = this.normalizeEndpoint(endpoint)
    const key = `ratelimit:${normalizedEndpoint}:${identifier}`

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = this.redis.pipeline()
      
      // Increment counter
      pipeline.incr(key)
      
      // Get TTL
      pipeline.ttl(key)
      
      const results = await pipeline.exec()
      
      if (!results) {
        throw new Error('Pipeline execution failed')
      }

      const count = results[0][1] as number
      const ttl = results[1][1] as number

      // Set expiration if this is the first request in the window
      if (ttl === -1) {
        await this.redis.pexpire(key, config.windowMs)
      }

      const remaining = Math.max(0, config.maxRequests - count)
      const resetTime = ttl > 0 ? Date.now() + ttl * 1000 : Date.now() + config.windowMs

      return {
        allowed: count <= config.maxRequests,
        remaining,
        limit: config.maxRequests,
        resetTime,
      }
    } catch (error) {
      console.error('Rate limit check error:', error)
      // Fail open - allow request if Redis fails
      return {
        allowed: true,
        remaining: 999,
        limit: 1000,
        resetTime: Date.now() + 60000,
      }
    }
  }

  /**
   * Normalize endpoint path for rate limiting
   * Removes dynamic segments like IDs to match rate limit patterns
   */
  private normalizeEndpoint(endpoint: string): string {
    // Replace dynamic segments with placeholders
    // e.g., /api/media/123/playback-token -> /api/media/playback-token
    return endpoint.replace(/\/[a-f0-9-]{20,}/gi, '')
  }

  /**
   * Get rate limit configuration for an endpoint
   */
  private getRateLimitConfig(endpoint: string): RateLimitConfig {
    // Try exact match first
    if (RATE_LIMIT_CONFIGS[endpoint]) {
      return RATE_LIMIT_CONFIGS[endpoint]
    }

    // Try prefix match
    for (const [pattern, config] of Object.entries(RATE_LIMIT_CONFIGS)) {
      if (pattern !== 'default' && endpoint.startsWith(pattern)) {
        return config
      }
    }

    // Return default
    return RATE_LIMIT_CONFIGS.default
  }

  /**
   * Reset rate limit for an identifier
   * Useful for testing or manual intervention
   */
  async resetRateLimit(identifier: string, endpoint: string): Promise<void> {
    if (!this.redis || !this.isConnected) {
      return
    }

    const key = `ratelimit:${endpoint}:${identifier}`
    try {
      await this.redis.del(key)
    } catch (error) {
      console.error('Failed to reset rate limit:', error)
    }
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit()
      this.isConnected = false
    }
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null

/**
 * Get rate limiter singleton instance
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter()
  }
  return rateLimiterInstance
}

/**
 * Middleware to apply rate limiting to API routes
 */
export async function withRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const rateLimiter = getRateLimiter()
  
  // Get identifier (prefer API key, fallback to IP)
  const apiKey = request.headers.get('x-api-key')
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  const identifier = apiKey || ip

  // Get endpoint path
  const url = new URL(request.url)
  const endpoint = url.pathname

  // Check rate limit
  const rateLimitStatus = await rateLimiter.checkRateLimit(identifier, endpoint)

  // Add rate limit headers to response
  const addRateLimitHeaders = (response: NextResponse): NextResponse => {
    response.headers.set('X-RateLimit-Limit', rateLimitStatus.limit.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitStatus.remaining.toString())
    response.headers.set('X-RateLimit-Reset', rateLimitStatus.resetTime.toString())
    return response
  }

  // If rate limit exceeded, return 429
  if (!rateLimitStatus.allowed) {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again after ${new Date(rateLimitStatus.resetTime).toISOString()}`,
        retryAfter: Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000),
      },
      { status: 429 }
    )
    return addRateLimitHeaders(response)
  }

  // Process request and add rate limit headers
  const response = await handler(request)
  return addRateLimitHeaders(response)
}

/**
 * Helper to extract identifier from request
 */
export function getRequestIdentifier(request: NextRequest): string {
  // Prefer API key for authenticated requests
  const apiKey = request.headers.get('x-api-key')
  if (apiKey) {
    return `apikey:${apiKey}`
  }

  // Fallback to IP address
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') ||
             'unknown'
  
  return `ip:${ip}`
}
