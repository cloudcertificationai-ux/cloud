// src/lib/cors.ts
import { NextRequest, NextResponse } from 'next/server'

/**
 * CORS configuration
 */
export interface CorsConfig {
  allowedOrigins: string[]
  allowedMethods: string[]
  allowedHeaders: string[]
  exposedHeaders: string[]
  credentials: boolean
  maxAge: number
}

/**
 * Default CORS configuration
 */
export const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    process.env.ADMIN_PANEL_URL || 'http://localhost:3001',
    // Add production URLs from environment
    ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
  ].filter(Boolean),
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Signature',
    'X-Timestamp',
    'X-Requested-With',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null, config: CorsConfig): boolean {
  if (!origin) {
    return false
  }

  // Check exact match
  if (config.allowedOrigins.includes(origin)) {
    return true
  }

  // Check wildcard patterns
  for (const allowedOrigin of config.allowedOrigins) {
    if (allowedOrigin === '*') {
      return true
    }

    // Support wildcard subdomains (e.g., *.example.com)
    if (allowedOrigin.startsWith('*.')) {
      const domain = allowedOrigin.slice(2)
      if (origin.endsWith(domain)) {
        return true
      }
    }
  }

  return false
}

/**
 * Apply CORS headers to response
 */
export function applyCorsHeaders(
  request: NextRequest,
  response: NextResponse,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): NextResponse {
  const origin = request.headers.get('origin')

  // Check if origin is allowed
  if (origin && isOriginAllowed(origin, config)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }

  // Set credentials header
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  // Set allowed methods
  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '))

  // Set allowed headers
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '))

  // Set exposed headers
  if (config.exposedHeaders.length > 0) {
    response.headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '))
  }

  // Set max age for preflight cache
  response.headers.set('Access-Control-Max-Age', config.maxAge.toString())

  return response
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(
  request: NextRequest,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): NextResponse | null {
  // Only handle OPTIONS requests
  if (request.method !== 'OPTIONS') {
    return null
  }

  const origin = request.headers.get('origin')

  // Check if origin is allowed
  if (!origin || !isOriginAllowed(origin, config)) {
    return new NextResponse(null, {
      status: 403,
      statusText: 'Forbidden',
    })
  }

  // Create preflight response
  const response = new NextResponse(null, {
    status: 204,
    statusText: 'No Content',
  })

  // Apply CORS headers
  return applyCorsHeaders(request, response, config)
}

/**
 * Middleware wrapper to add CORS support
 */
export function withCors(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    const preflightResponse = handleCorsPreflightRequest(request, config)
    if (preflightResponse) {
      return preflightResponse
    }

    // Check origin for non-preflight requests
    const origin = request.headers.get('origin')
    if (origin && !isOriginAllowed(origin, config)) {
      return new NextResponse(
        JSON.stringify({
          error: 'CORS policy violation',
          message: 'Origin not allowed',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Process request
    const response = await handler(request)

    // Apply CORS headers to response
    return applyCorsHeaders(request, response, config)
  }
}

/**
 * Create custom CORS configuration
 */
export function createCorsConfig(overrides: Partial<CorsConfig>): CorsConfig {
  return {
    ...DEFAULT_CORS_CONFIG,
    ...overrides,
  }
}

/**
 * CORS configuration for API routes
 */
export const API_CORS_CONFIG = createCorsConfig({
  allowedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    process.env.ADMIN_PANEL_URL || 'http://localhost:3001',
    ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
  ].filter(Boolean),
})

/**
 * CORS configuration for admin API routes (more restrictive)
 */
export const ADMIN_API_CORS_CONFIG = createCorsConfig({
  allowedOrigins: [
    process.env.ADMIN_PANEL_URL || 'http://localhost:3001',
    ...(process.env.ADMIN_ALLOWED_ORIGINS?.split(',') || []),
  ].filter(Boolean),
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
})

/**
 * CORS configuration for public API routes (more permissive)
 */
export const PUBLIC_API_CORS_CONFIG = createCorsConfig({
  allowedOrigins: ['*'],
  credentials: false,
})
