/**
 * Structured error response utilities for API endpoints
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export interface ErrorResponse {
  error: true;
  message: string;
  code: string;
  details?: Record<string, any>;
  requestId: string;
}

export interface ErrorDetails {
  field?: string;
  constraint?: string;
  retryAfter?: number;
  [key: string]: any;
}

/**
 * Error codes for different error types
 */
export const ErrorCodes = {
  // Validation errors (400)
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  INVALID_FILE_SIZE: 'INVALID_FILE_SIZE',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_REQUEST_BODY: 'INVALID_REQUEST_BODY',
  INVALID_LESSON_KIND: 'INVALID_LESSON_KIND',
  INVALID_QUESTION_TYPE: 'INVALID_QUESTION_TYPE',

  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_SESSION: 'INVALID_SESSION',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',

  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  NOT_ENROLLED: 'NOT_ENROLLED',

  // Not found errors (404)
  MEDIA_NOT_FOUND: 'MEDIA_NOT_FOUND',
  LESSON_NOT_FOUND: 'LESSON_NOT_FOUND',
  QUIZ_NOT_FOUND: 'QUIZ_NOT_FOUND',
  ASSIGNMENT_NOT_FOUND: 'ASSIGNMENT_NOT_FOUND',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',

  // Conflict errors (409)
  DUPLICATE_SUBMISSION: 'DUPLICATE_SUBMISSION',
  ALREADY_SUBMITTED: 'ALREADY_SUBMITTED',
  ALREADY_PROCESSING: 'ALREADY_PROCESSING',

  // Rate limit errors (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  TRANSCODE_ERROR: 'TRANSCODE_ERROR',

  // Service unavailable (503)
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  R2_UNAVAILABLE: 'R2_UNAVAILABLE',
  REDIS_UNAVAILABLE: 'REDIS_UNAVAILABLE',
} as const;

/**
 * Create a structured error response
 */
export function createErrorResponse(
  message: string,
  code: string,
  statusCode: number,
  details?: ErrorDetails,
  requestId?: string
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    error: true,
    message,
    code,
    requestId: requestId || randomUUID(),
  };

  if (details && Object.keys(details).length > 0) {
    errorResponse.details = details;
  }

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Validation error (400)
 */
export function validationError(
  message: string,
  code: string = ErrorCodes.INVALID_REQUEST_BODY,
  details?: ErrorDetails
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, code, 400, details);
}

/**
 * Authentication error (401)
 */
export function authenticationError(
  message: string = 'Authentication required',
  code: string = ErrorCodes.UNAUTHORIZED,
  details?: ErrorDetails,
  requestId?: string
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, code, 401, details, requestId);
}

/**
 * Authorization error (403)
 */
export function authorizationError(
  message: string = 'Insufficient permissions',
  code: string = ErrorCodes.FORBIDDEN,
  details?: ErrorDetails,
  requestId?: string
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, code, 403, details, requestId);
}

/**
 * Not found error (404)
 */
export function notFoundError(
  message: string,
  code: string = ErrorCodes.RESOURCE_NOT_FOUND,
  details?: ErrorDetails,
  requestId?: string
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, code, 404, details, requestId);
}

/**
 * Conflict error (409)
 */
export function conflictError(
  message: string,
  code: string,
  details?: ErrorDetails
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, code, 409, details);
}

/**
 * Rate limit error (429)
 */
export function rateLimitError(
  message: string = 'Rate limit exceeded',
  retryAfter: number,
  details?: ErrorDetails
): NextResponse<ErrorResponse> {
  const errorDetails = {
    ...details,
    retryAfter,
  };

  const response = createErrorResponse(
    message,
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    429,
    errorDetails
  );

  // Add Retry-After header
  response.headers.set('Retry-After', retryAfter.toString());

  return response;
}

/**
 * Internal server error (500)
 */
export function internalServerError(
  message: string = 'An internal error occurred',
  code: string = ErrorCodes.INTERNAL_SERVER_ERROR,
  details?: ErrorDetails,
  requestId?: string
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, code, 500, details, requestId);
}

/**
 * Service unavailable error (503)
 */
export function serviceUnavailableError(
  message: string = 'Service temporarily unavailable',
  code: string = ErrorCodes.SERVICE_UNAVAILABLE,
  details?: ErrorDetails
): NextResponse<ErrorResponse> {
  return createErrorResponse(message, code, 503, details);
}

/**
 * Handle unknown errors and convert to structured response
 */
export function handleError(
  error: unknown,
  requestId?: string
): NextResponse<ErrorResponse> {
  console.error('API Error:', error);

  // Handle known error types
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('not found')) {
      return notFoundError(error.message, ErrorCodes.RESOURCE_NOT_FOUND, undefined, requestId);
    }

    if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
      return authenticationError(error.message, ErrorCodes.UNAUTHORIZED, undefined, requestId);
    }

    if (error.message.includes('forbidden') || error.message.includes('permission')) {
      return authorizationError(error.message, ErrorCodes.FORBIDDEN, undefined, requestId);
    }

    // Generic error
    return internalServerError(
      'An unexpected error occurred',
      ErrorCodes.INTERNAL_SERVER_ERROR,
      { originalError: error.message },
      requestId
    );
  }

  // Unknown error type
  return internalServerError(
    'An unexpected error occurred',
    ErrorCodes.INTERNAL_SERVER_ERROR,
    undefined,
    requestId
  );
}

/**
 * Wrap API handler with error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ErrorResponse>> {
  const requestId = randomUUID();

  return handler().catch((error) => {
    return handleError(error, requestId);
  });
}
