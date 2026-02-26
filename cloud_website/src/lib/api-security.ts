// src/lib/api-security.ts
import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKey } from './api-keys'

/**
 * Configuration for API security
 */
export const API_SECURITY_CONFIG = {
  // Maximum age of a request timestamp (5 minutes)
  MAX_TIMESTAMP_AGE_MS: 5 * 60 * 1000,
  // Header names
  HEADERS: {
    API_KEY: 'x-api-key',
    SIGNATURE: 'x-signature',
    TIMESTAMP: 'x-timestamp',
    RATE_LIMIT_REMAINING: 'x-ratelimit-remaining',
    RATE_LIMIT_LIMIT: 'x-ratelimit-limit',
    RATE_LIMIT_RESET: 'x-ratelimit-reset',
  },
}

/**
 * Generate HMAC signature for a request
 * @param method - HTTP method (GET, POST, etc.)
 * @param path - Request path
 * @param timestamp - Unix timestamp in milliseconds
 * @param body - Request body (for POST/PUT/PATCH)
 * @param secret - API secret for signing
 * @returns HMAC signature as hex string
 */
export function generateSignature(
  method: string,
  path: string,
  timestamp: number,
  body: string | null,
  secret: string
): string {
  // Create string to sign: METHOD|PATH|TIMESTAMP|BODY
  const stringToSign = [
    method.toUpperCase(),
    path,
    timestamp.toString(),
    body || '',
  ].join('|')

  // Generate HMAC-SHA256 signature
  const hmac = createHmac('sha256', secret)
  hmac.update(stringToSign)
  return hmac.digest('hex')
}

/**
 * Verify HMAC signature for a request
 * @param signature - Signature to verify
 * @param method - HTTP method
 * @param path - Request path
 * @param timestamp - Unix timestamp
 * @param body - Request body
 * @param secret - API secret
 * @returns True if signature is valid
 */
export function verifySignature(
  signature: string,
  method: string,
  path: string,
  timestamp: number,
  body: string | null,
  secret: string
): boolean {
  const expectedSignature = generateSignature(method, path, timestamp, body, secret)
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')
    
    if (signatureBuffer.length !== expectedBuffer.length) {
      return false
    }
    
    return timingSafeEqual(signatureBuffer, expectedBuffer)
  } catch (error) {
    return false
  }
}

/**
 * Verify request timestamp to prevent replay attacks
 * @param timestamp - Unix timestamp in milliseconds
 * @returns True if timestamp is within acceptable range
 */
export function verifyTimestamp(timestamp: number): boolean {
  const now = Date.now()
  const age = Math.abs(now - timestamp)
  return age <= API_SECURITY_CONFIG.MAX_TIMESTAMP_AGE_MS
}

/**
 * Extract and validate API authentication from request
 * @param request - Next.js request object
 * @returns Validation result with API key record or error
 */
export async function validateApiRequest(
  request: NextRequest
): Promise<
  | { valid: true; apiKey: { id: string; keyName: string; apiSecret: string } }
  | { valid: false; error: string; statusCode: number }
> {
  const { HEADERS } = API_SECURITY_CONFIG

  // Extract headers
  const apiKey = request.headers.get(HEADERS.API_KEY)
  const signature = request.headers.get(HEADERS.SIGNATURE)
  const timestampHeader = request.headers.get(HEADERS.TIMESTAMP)

  // Validate required headers
  if (!apiKey) {
    return {
      valid: false,
      error: 'Missing API key',
      statusCode: 401,
    }
  }

  if (!signature) {
    return {
      valid: false,
      error: 'Missing request signature',
      statusCode: 401,
    }
  }

  if (!timestampHeader) {
    return {
      valid: false,
      error: 'Missing timestamp',
      statusCode: 401,
    }
  }

  // Parse timestamp
  const timestamp = parseInt(timestampHeader, 10)
  if (isNaN(timestamp)) {
    return {
      valid: false,
      error: 'Invalid timestamp format',
      statusCode: 400,
    }
  }

  // Verify timestamp (prevent replay attacks)
  if (!verifyTimestamp(timestamp)) {
    return {
      valid: false,
      error: 'Request timestamp expired or invalid',
      statusCode: 401,
    }
  }

  // Verify API key
  const apiKeyRecord = await verifyApiKey(apiKey)
  if (!apiKeyRecord) {
    return {
      valid: false,
      error: 'Invalid or expired API key',
      statusCode: 401,
    }
  }

  // Get request body for signature verification
  let body: string | null = null
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      // Clone request to read body without consuming it
      const clonedRequest = request.clone()
      const bodyText = await clonedRequest.text()
      body = bodyText || null
    } catch (error) {
      // If body can't be read, use null
      body = null
    }
  }

  // Get path without query string for signature
  const url = new URL(request.url)
  const path = url.pathname

  // Verify signature
  const isValidSignature = verifySignature(
    signature,
    request.method,
    path,
    timestamp,
    body,
    apiKeyRecord.apiSecret
  )

  if (!isValidSignature) {
    return {
      valid: false,
      error: 'Invalid request signature',
      statusCode: 401,
    }
  }

  return {
    valid: true,
    apiKey: {
      id: apiKeyRecord.id,
      keyName: apiKeyRecord.keyName,
      apiSecret: apiKeyRecord.apiSecret,
    },
  }
}

/**
 * Middleware to validate API requests
 * Use this in API routes that require authentication
 */
export async function withApiAuth(
  request: NextRequest,
  handler: (
    request: NextRequest,
    apiKey: { id: string; keyName: string }
  ) => Promise<NextResponse>
): Promise<NextResponse> {
  const validation = await validateApiRequest(request)

  if (!validation.valid) {
    // Explicitly handle the error case
    const errorResult = validation as { valid: false; error: string; statusCode: number }
    return NextResponse.json(
      {
        error: errorResult.error,
        timestamp: new Date().toISOString(),
      },
      { status: errorResult.statusCode }
    )
  }

  // Explicitly handle the success case
  const successResult = validation as { valid: true; apiKey: { id: string; keyName: string; apiSecret: string } }
  return handler(request, {
    id: successResult.apiKey.id,
    keyName: successResult.apiKey.keyName,
  })
}

/**
 * Client-side helper to sign requests
 * Use this in the admin panel to sign outgoing requests
 */
export function signRequest(
  method: string,
  path: string,
  apiKey: string,
  apiSecret: string,
  body?: any
): {
  headers: {
    'x-api-key': string
    'x-signature': string
    'x-timestamp': string
  }
} {
  const timestamp = Date.now()
  const bodyString = body ? JSON.stringify(body) : null
  const signature = generateSignature(method, path, timestamp, bodyString, apiSecret)

  return {
    headers: {
      'x-api-key': apiKey,
      'x-signature': signature,
      'x-timestamp': timestamp.toString(),
    },
  }
}

/**
 * Error response helper for API routes
 */
export function apiErrorResponse(
  error: string,
  statusCode: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error,
      details,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}

/**
 * Success response helper for API routes
 */
export function apiSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  )
}
