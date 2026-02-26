// src/lib/api-monitoring.ts
import { NextRequest, NextResponse } from 'next/server';
import { MonitoringService } from '@/lib/monitoring';
import { randomUUID } from 'crypto';
import { track } from '@vercel/analytics/server';

/**
 * API monitoring middleware for error logging and performance tracking
 * 
 * Requirements:
 * - 17.3: Log all 4xx and 5xx responses with context
 * - 17.4: Measure and log response times per endpoint
 */

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomUUID();
}

/**
 * Extract user ID from request (if authenticated)
 */
export function extractUserId(request: NextRequest): string | undefined {
  // Try to get user ID from session cookie or authorization header
  // This is a simplified version - actual implementation depends on auth setup
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Parse JWT or session token to extract user ID
    // For now, return undefined as this requires session parsing
  }
  return undefined;
}

/**
 * Log API error with context
 * 
 * Requirement 17.3: Log all 4xx and 5xx responses
 */
export async function logAPIError(params: {
  requestId: string;
  request: NextRequest;
  statusCode: number;
  error: Error;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const { requestId, request, statusCode, error, userId, metadata } = params;

  // Only log 4xx and 5xx errors
  if (statusCode < 400) {
    return;
  }

  await MonitoringService.logAPIError({
    requestId,
    method: request.method,
    path: new URL(request.url).pathname,
    statusCode,
    error,
    userId,
    metadata: {
      ...metadata,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
    },
  });
}

/**
 * Track API performance
 * 
 * Requirement 17.4: Measure and log response times per endpoint
 */
export async function trackAPIPerformance(params: {
  requestId: string;
  request: NextRequest;
  statusCode: number;
  responseTime: number;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<void> {
  const { requestId, request, statusCode, responseTime, userId, metadata } = params;

  const pathname = new URL(request.url).pathname;

  // Log to database
  await MonitoringService.trackAPIPerformance({
    requestId,
    method: request.method,
    path: pathname,
    statusCode,
    responseTime,
    userId,
    metadata: {
      ...metadata,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
    },
  });

  // Track with Vercel Analytics (Requirement 17.4)
  try {
    await track('api_request', {
      path: pathname,
      method: request.method,
      statusCode: statusCode.toString(),
      responseTime: responseTime.toString(),
      userId: userId || 'anonymous',
    });
  } catch (error) {
    // Don't fail if Vercel Analytics tracking fails
    console.error('Failed to track with Vercel Analytics:', error);
  }
}

/**
 * Wrapper function to monitor API route handlers
 * 
 * Usage:
 * export const POST = withAPIMonitoring(async (request) => {
 *   // Your handler logic
 * });
 */
export function withAPIMonitoring(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    let response: NextResponse;
    let statusCode = 200;

    try {
      // Add request ID to request headers for tracing
      const requestWithId = new Request(request, {
        headers: new Headers(request.headers),
      });
      requestWithId.headers.set('x-request-id', requestId);

      // Execute the handler
      response = await handler(request, context);
      statusCode = response.status;

      // Add request ID to response headers
      response.headers.set('x-request-id', requestId);

      return response;
    } catch (error) {
      // Log error
      statusCode = 500;
      const err = error instanceof Error ? error : new Error('Unknown error');

      await logAPIError({
        requestId,
        request,
        statusCode,
        error: err,
        userId: extractUserId(request),
      });

      // Return error response
      response = NextResponse.json(
        {
          error: true,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          requestId,
        },
        { status: 500 }
      );

      response.headers.set('x-request-id', requestId);
      return response;
    } finally {
      // Track performance
      const responseTime = Date.now() - startTime;

      // Log errors (4xx and 5xx)
      if (statusCode >= 400) {
        await logAPIError({
          requestId,
          request,
          statusCode,
          error: new Error(`HTTP ${statusCode} error`),
          userId: extractUserId(request),
        });
      }

      // Track all requests for performance monitoring
      await trackAPIPerformance({
        requestId,
        request,
        statusCode,
        responseTime,
        userId: extractUserId(request),
      });
    }
  };
}

/**
 * Helper to create error response with logging
 */
export async function createErrorResponse(params: {
  requestId: string;
  request: NextRequest;
  statusCode: number;
  error: Error;
  message: string;
  code: string;
  userId?: string;
  details?: Record<string, any>;
}): Promise<NextResponse> {
  const { requestId, request, statusCode, error, message, code, userId, details } = params;

  // Log the error
  await logAPIError({
    requestId,
    request,
    statusCode,
    error,
    userId,
    metadata: details,
  });

  // Return error response
  const response = NextResponse.json(
    {
      error: true,
      message,
      code,
      requestId,
      details,
    },
    { status: statusCode }
  );

  response.headers.set('x-request-id', requestId);
  return response;
}
