// src/lib/api-utils.ts
/**
 * API utility functions for course management
 * Provides common helpers for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AuthenticationError, AuthorizationError } from '@/lib/api-errors'

/**
 * Verify user is authenticated
 */
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    throw new AuthenticationError('Authentication required')
  }

  return session
}

/**
 * Verify user has admin role
 */
export async function requireAdmin(request: NextRequest) {
  const session = await requireAuth(request)

  if (session.user.role !== 'ADMIN') {
    throw new AuthorizationError('Admin access required')
  }

  return session
}

/**
 * Parse JSON body from request
 */
export async function parseRequestBody<T = any>(request: NextRequest): Promise<T> {
  try {
    const body = await request.json()
    return body as T
  } catch (error) {
    throw new Error('Invalid JSON in request body')
  }
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(request: NextRequest, param: string): string | null {
  const { searchParams } = new URL(request.url)
  return searchParams.get(param)
}

/**
 * Get all query parameters as object
 */
export function getQueryParams(request: NextRequest): Record<string, string> {
  const { searchParams } = new URL(request.url)
  const params: Record<string, string> = {}

  searchParams.forEach((value, key) => {
    params[key] = value
  })

  return params
}

/**
 * Parse pagination parameters from query string
 */
export function getPaginationParams(request: NextRequest) {
  const page = parseInt(getQueryParam(request, 'page') || '1', 10)
  const limit = parseInt(getQueryParam(request, 'limit') || '20', 10)

  return {
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)), // Max 100 items per page
    skip: (Math.max(1, page) - 1) * Math.min(100, Math.max(1, limit)),
  }
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) {
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  }
}

/**
 * Validate required fields in object
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter((field) => !data[field])

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
  }
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Generate cache headers for response
 */
export function getCacheHeaders(maxAge: number = 60) {
  return {
    'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
  }
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: NextResponse, origin?: string) {
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

/**
 * Handle OPTIONS request for CORS
 */
export function handleOptionsRequest() {
  const response = new NextResponse(null, { status: 204 })
  return addCorsHeaders(response)
}

/**
 * Extract route parameters from pathname
 * Example: /api/courses/[id] -> { id: '123' }
 */
export function getRouteParams(pathname: string, pattern: string): Record<string, string> {
  const patternParts = pattern.split('/')
  const pathnameParts = pathname.split('/')

  const params: Record<string, string> = {}

  patternParts.forEach((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const paramName = part.slice(1, -1)
      params[paramName] = pathnameParts[index]
    }
  })

  return params
}

/**
 * Log API request for debugging
 */
export function logApiRequest(request: NextRequest, context?: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${request.method} ${request.url}`, context || '')
  }
}

/**
 * Measure API execution time
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    console.log(`[Performance] ${label}: ${duration}ms`)
    return result
  } catch (error) {
    const duration = Date.now() - start
    console.error(`[Performance] ${label} failed after ${duration}ms`)
    throw error
  }
}
