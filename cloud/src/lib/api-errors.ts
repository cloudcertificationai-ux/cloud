// src/lib/api-errors.ts
/**
 * Error handling utilities for API routes
 * Provides standardized error responses and error classes
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Standard API error codes
 */
export enum ApiErrorCode {
  // Authentication & Authorization (401, 403)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_API_KEY = 'INVALID_API_KEY',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_PARAMETER = 'INVALID_PARAMETER',

  // Resource Errors (404, 409)
  NOT_FOUND = 'NOT_FOUND',
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',
  LESSON_NOT_FOUND = 'LESSON_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  SLUG_ALREADY_EXISTS = 'SLUG_ALREADY_EXISTS',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Server Errors (500, 503)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Business Logic Errors (400, 422)
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INVALID_STATE = 'INVALID_STATE',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  COURSE_ALREADY_PUBLISHED = 'COURSE_ALREADY_PUBLISHED',
  COURSE_NOT_PUBLISHED = 'COURSE_NOT_PUBLISHED',
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
    timestamp: string
  }
}

/**
 * API Error class with structured error information
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode
  public readonly statusCode: number
  public readonly details?: any
  public readonly timestamp: Date

  constructor(message: string, code: ApiErrorCode, statusCode: number, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date()

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }

  /**
   * Convert error to JSON response format
   */
  toJSON(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp.toISOString(),
      },
    }
  }

  /**
   * Convert error to NextResponse
   */
  toResponse(): NextResponse {
    return NextResponse.json(this.toJSON(), { status: this.statusCode })
  }
}

/**
 * Validation error with field-specific details
 */
export class ValidationError extends ApiError {
  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, ApiErrorCode.VALIDATION_ERROR, 400, fields ? { fields } : undefined)
    this.name = 'ValidationError'
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(message, ApiErrorCode.UNAUTHORIZED, 401, details)
    this.name = 'AuthenticationError'
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions', details?: any) {
    super(message, ApiErrorCode.FORBIDDEN, 403, details)
    this.name = 'AuthorizationError'
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends ApiError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    const code =
      resource === 'Course'
        ? ApiErrorCode.COURSE_NOT_FOUND
        : resource === 'Module'
          ? ApiErrorCode.MODULE_NOT_FOUND
          : resource === 'Lesson'
            ? ApiErrorCode.LESSON_NOT_FOUND
            : ApiErrorCode.RESOURCE_NOT_FOUND
    super(message, code, 404, { resource, identifier })
    this.name = 'NotFoundError'
  }
}

/**
 * Resource conflict error
 */
export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, ApiErrorCode.CONFLICT, 409, details)
    this.name = 'ConflictError'
  }
}

/**
 * Slug already exists error
 */
export class SlugExistsError extends ApiError {
  constructor(slug: string) {
    super(`A course with slug '${slug}' already exists`, ApiErrorCode.SLUG_ALREADY_EXISTS, 409, { slug })
    this.name = 'SlugExistsError'
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends ApiError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', ApiErrorCode.RATE_LIMIT_EXCEEDED, 429, retryAfter ? { retryAfter } : undefined)
    this.name = 'RateLimitError'
  }

  toResponse(): NextResponse {
    const response = super.toResponse()
    if (this.details?.retryAfter) {
      response.headers.set('Retry-After', this.details.retryAfter.toString())
    }
    return response
  }
}

/**
 * Internal server error
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, ApiErrorCode.INTERNAL_SERVER_ERROR, 500, details)
    this.name = 'InternalServerError'
  }
}

/**
 * Database error
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, ApiErrorCode.DATABASE_ERROR, 500, details)
    this.name = 'DatabaseError'
  }
}

/**
 * Service unavailable error
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service temporarily unavailable', retryAfter?: number) {
    super(message, ApiErrorCode.SERVICE_UNAVAILABLE, 503, retryAfter ? { retryAfter } : undefined)
    this.name = 'ServiceUnavailableError'
  }

  toResponse(): NextResponse {
    const response = super.toResponse()
    if (this.details?.retryAfter) {
      response.headers.set('Retry-After', this.details.retryAfter.toString())
    }
    return response
  }
}

/**
 * Error response builder
 */
export class ErrorResponseBuilder {
  /**
   * Create a standardized error response
   */
  static createErrorResponse(message: string, code: ApiErrorCode, statusCode: number, details?: any): NextResponse {
    return NextResponse.json(
      {
        error: {
          code,
          message,
          details,
          timestamp: new Date().toISOString(),
        },
      },
      { status: statusCode }
    )
  }

  /**
   * Create validation error response
   */
  static validationError(message: string, fields?: Record<string, string[]>): NextResponse {
    return new ValidationError(message, fields).toResponse()
  }

  /**
   * Create authentication error response
   */
  static authenticationError(message?: string): NextResponse {
    return new AuthenticationError(message).toResponse()
  }

  /**
   * Create authorization error response
   */
  static authorizationError(message?: string): NextResponse {
    return new AuthorizationError(message).toResponse()
  }

  /**
   * Create not found error response
   */
  static notFoundError(resource: string, identifier?: string): NextResponse {
    return new NotFoundError(resource, identifier).toResponse()
  }

  /**
   * Create conflict error response
   */
  static conflictError(message: string, details?: any): NextResponse {
    return new ConflictError(message, details).toResponse()
  }

  /**
   * Create slug exists error response
   */
  static slugExistsError(slug: string): NextResponse {
    return new SlugExistsError(slug).toResponse()
  }

  /**
   * Create rate limit error response
   */
  static rateLimitError(retryAfter?: number): NextResponse {
    return new RateLimitError(retryAfter).toResponse()
  }

  /**
   * Create internal server error response
   */
  static internalServerError(message?: string): NextResponse {
    return new InternalServerError(message).toResponse()
  }

  /**
   * Create database error response
   */
  static databaseError(message?: string): NextResponse {
    return new DatabaseError(message).toResponse()
  }

  /**
   * Create service unavailable error response
   */
  static serviceUnavailableError(message?: string, retryAfter?: number): NextResponse {
    return new ServiceUnavailableError(message, retryAfter).toResponse()
  }
}

/**
 * Error handler middleware
 * Catches and formats errors in API routes
 */
export function handleApiError(error: unknown): NextResponse {
  // Log error for monitoring
  console.error('API Error:', error)

  // Handle known ApiError instances
  if (error instanceof ApiError) {
    return error.toResponse()
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fields: Record<string, string[]> = {}
    error.errors.forEach((err) => {
      const path = err.path.join('.')
      if (!fields[path]) {
        fields[path] = []
      }
      fields[path].push(err.message)
    })
    return new ValidationError('Validation failed', fields).toResponse()
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any

    // Prisma unique constraint violation
    if (prismaError.code === 'P2002') {
      const fields = prismaError.meta?.target as string[] | undefined
      if (fields?.includes('slug')) {
        return new SlugExistsError('unknown').toResponse()
      }
      return new ConflictError('A record with this value already exists', { fields }).toResponse()
    }

    // Prisma record not found
    if (prismaError.code === 'P2025') {
      return new NotFoundError('Record').toResponse()
    }

    // Prisma foreign key constraint violation
    if (prismaError.code === 'P2003') {
      return new ValidationError('Invalid reference to related record').toResponse()
    }

    // Other Prisma errors
    return new DatabaseError('Database operation failed').toResponse()
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return new InternalServerError(
      process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    ).toResponse()
  }

  // Handle unknown errors
  return new InternalServerError('An unexpected error occurred').toResponse()
}

/**
 * Async error handler wrapper for API routes
 * Automatically catches and formats errors
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * HTTP status code constants
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

/**
 * Success response builder
 */
export class SuccessResponseBuilder {
  /**
   * Create a standardized success response
   */
  static success<T>(data: T, statusCode: number = HttpStatus.OK): NextResponse {
    return NextResponse.json(
      {
        data,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    )
  }

  /**
   * Create a created response (201)
   */
  static created<T>(data: T): NextResponse {
    return this.success(data, HttpStatus.CREATED)
  }

  /**
   * Create a no content response (204)
   */
  static noContent(): NextResponse {
    return new NextResponse(null, { status: HttpStatus.NO_CONTENT })
  }
}
