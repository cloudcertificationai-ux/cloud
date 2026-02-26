// src/lib/security-logger.ts
import prisma from '@/lib/db';

/**
 * Security event types for the VOD Media System
 * Requirement 16.5: Log security events for audit review
 */
export enum SecurityEventType {
  SIGNATURE_TAMPERING = 'SIGNATURE_TAMPERING',
  EXCESSIVE_TOKEN_REQUESTS = 'EXCESSIVE_TOKEN_REQUESTS',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  EXPIRED_TOKEN = 'EXPIRED_TOKEN',
  USER_ID_MISMATCH = 'USER_ID_MISMATCH',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Security event context
 */
export interface SecurityEventContext {
  userId?: string;
  mediaId?: string;
  lessonId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestUrl?: string;
  errorMessage?: string;
  attemptedAction?: string;
  [key: string]: any;
}

/**
 * Log a security event to the database
 * 
 * @param eventType - Type of security event
 * @param context - Additional context about the event
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  context: SecurityEventContext
): Promise<void> {
  try {
    // Log to console for immediate visibility
    console.warn('[SECURITY EVENT]', {
      type: eventType,
      timestamp: new Date().toISOString(),
      ...context,
    });

    // Store in database for audit trail
    await prisma.auditLog.create({
      data: {
        action: eventType,
        userId: context.userId || null,
        resourceType: 'security_event',
        resourceId: context.mediaId || context.lessonId || null,
        details: {
          eventType,
          timestamp: new Date().toISOString(),
          ...context,
        },
        ipAddress: context.ipAddress || null,
        userAgent: context.userAgent || null,
      },
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break the application
    console.error('Failed to log security event:', error);
  }
}

/**
 * Log signature tampering attempt
 * Requirement 16.5: Log signature tampering attempts
 */
export async function logSignatureTampering(
  userId: string | undefined,
  context: {
    url: string;
    providedSignature?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  await logSecurityEvent(SecurityEventType.SIGNATURE_TAMPERING, {
    userId,
    requestUrl: context.url,
    providedSignature: context.providedSignature,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    errorMessage: 'Invalid or tampered signature detected',
  });
}

/**
 * Log excessive token requests
 * Requirement 16.5: Log excessive token requests
 */
export async function logExcessiveTokenRequests(
  userId: string,
  context: {
    requestCount: number;
    timeWindow: number;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  await logSecurityEvent(SecurityEventType.EXCESSIVE_TOKEN_REQUESTS, {
    userId,
    requestCount: context.requestCount,
    timeWindowMs: context.timeWindow,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    errorMessage: `User exceeded rate limit with ${context.requestCount} requests`,
  });
}

/**
 * Log unauthorized access attempt
 * Requirement 16.5: Log unauthorized access attempts
 */
export async function logUnauthorizedAccess(
  userId: string | undefined,
  context: {
    mediaId?: string;
    lessonId?: string;
    courseId?: string;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  await logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
    userId,
    mediaId: context.mediaId,
    lessonId: context.lessonId,
    courseId: context.courseId,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    errorMessage: context.reason,
    attemptedAction: 'access_media',
  });
}

/**
 * Log invalid signature attempt
 */
export async function logInvalidSignature(
  userId: string | undefined,
  context: {
    url: string;
    reason: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  await logSecurityEvent(SecurityEventType.INVALID_SIGNATURE, {
    userId,
    requestUrl: context.url,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    errorMessage: context.reason,
  });
}

/**
 * Log expired token usage attempt
 */
export async function logExpiredToken(
  userId: string | undefined,
  context: {
    url: string;
    expirationTime: number;
    currentTime: number;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  await logSecurityEvent(SecurityEventType.EXPIRED_TOKEN, {
    userId,
    requestUrl: context.url,
    expirationTime: new Date(context.expirationTime * 1000).toISOString(),
    currentTime: new Date(context.currentTime * 1000).toISOString(),
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    errorMessage: 'Attempted to use expired token',
  });
}

/**
 * Log user ID mismatch in signed URL
 */
export async function logUserIdMismatch(
  actualUserId: string,
  context: {
    expectedUserId: string;
    url: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  await logSecurityEvent(SecurityEventType.USER_ID_MISMATCH, {
    userId: actualUserId,
    expectedUserId: context.expectedUserId,
    requestUrl: context.url,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    errorMessage: 'User ID in token does not match requesting user',
  });
}

/**
 * Log rate limit exceeded event
 */
export async function logRateLimitExceeded(
  userId: string,
  context: {
    endpoint: string;
    limit: number;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  await logSecurityEvent(SecurityEventType.RATE_LIMIT_EXCEEDED, {
    userId,
    endpoint: context.endpoint,
    limit: context.limit,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
    errorMessage: `Rate limit of ${context.limit} requests exceeded`,
  });
}

/**
 * Extract request metadata for logging
 */
export function extractRequestMetadata(request: Request): {
  ipAddress: string;
  userAgent: string;
} {
  const headers = request.headers;
  
  const ipAddress = 
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown';
  
  const userAgent = headers.get('user-agent') || 'unknown';
  
  return { ipAddress, userAgent };
}
