import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePlaybackToken } from '@/lib/playback-service';
import { getRateLimiter } from '@/lib/rate-limiter';
import {
  logExcessiveTokenRequests,
  logUnauthorizedAccess,
  extractRequestMetadata,
} from '@/lib/security-logger';
import prisma from '@/lib/db';

/**
 * POST /api/media/[id]/playback-token
 * Generate a signed playback token for a media resource
 * 
 * Requirements:
 * - 10.1: Verify enrollment and return signed URL
 * - 10.5: Verify NextAuth authentication
 * - 16.3: Rate limit to 60 requests per minute per user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as per Next.js 15+ requirements
    const { id: mediaId } = await params;

    // Extract request metadata for security logging
    const requestMetadata = extractRequestMetadata(request);

    // Verify NextAuth authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: true,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: true,
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Apply rate limiting (Requirement 16.3: 60 requests per minute per user)
    const rateLimiter = getRateLimiter();
    const url = new URL(request.url);
    const rateLimitStatus = await rateLimiter.checkRateLimit(
      `user:${user.id}`,
      url.pathname
    );

    if (!rateLimitStatus.allowed) {
      // Log excessive token requests (Requirement 16.5)
      await logExcessiveTokenRequests(user.id, {
        requestCount: rateLimitStatus.limit + 1,
        timeWindow: 60000, // 1 minute
        ...requestMetadata,
      });

      return NextResponse.json(
        {
          error: true,
          message: 'Rate limit exceeded. Too many playback token requests.',
          code: 'RATE_LIMIT_EXCEEDED',
          details: {
            retryAfter: Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000),
          },
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitStatus.limit.toString(),
            'X-RateLimit-Remaining': rateLimitStatus.remaining.toString(),
            'X-RateLimit-Reset': rateLimitStatus.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitStatus.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Parse request body to get lessonId
    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        {
          error: true,
          message: 'lessonId is required',
          code: 'MISSING_LESSON_ID',
          details: { field: 'lessonId' },
        },
        { status: 400 }
      );
    }

    // Generate playback token (includes enrollment verification)
    const result = await generatePlaybackToken({
      mediaId,
      userId: user.id,
      lessonId,
    });

    const response = NextResponse.json({
      success: true,
      signedUrl: result.signedUrl,
      expiresAt: result.expiresAt.toISOString(),
    });

    // Add rate limit headers to successful response
    response.headers.set('X-RateLimit-Limit', rateLimitStatus.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitStatus.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitStatus.resetTime.toString());

    return response;
  } catch (error) {
    console.error('Error generating playback token:', error);

    // Extract request metadata for security logging
    const requestMetadata = extractRequestMetadata(request);
    const session = await getServerSession(authOptions);
    const user = session?.user?.email 
      ? await prisma.user.findUnique({ where: { email: session.user.email } })
      : null;

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'Lesson not found') {
        return NextResponse.json(
          {
            error: true,
            message: 'Lesson not found',
            code: 'LESSON_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      if (error.message === 'Media not found for lesson') {
        return NextResponse.json(
          {
            error: true,
            message: 'Media not found for lesson',
            code: 'MEDIA_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      if (error.message === 'Media ID does not match lesson') {
        return NextResponse.json(
          {
            error: true,
            message: 'Media ID does not match lesson',
            code: 'MEDIA_MISMATCH',
          },
          { status: 400 }
        );
      }

      if (error.message === 'User is not enrolled in this course') {
        // Log unauthorized access attempt (Requirement 16.5)
        const { id: mediaId } = await params;
        const body = await request.json().catch(() => ({}));
        
        await logUnauthorizedAccess(user?.id, {
          mediaId,
          lessonId: body.lessonId,
          reason: 'User not enrolled in course',
          ...requestMetadata,
        });

        return NextResponse.json(
          {
            error: true,
            message: 'You must be enrolled in this course to access this content',
            code: 'NOT_ENROLLED',
          },
          { status: 403 }
        );
      }

      if (error.message === 'Media is not ready for playback') {
        return NextResponse.json(
          {
            error: true,
            message: 'Media is still processing. Please try again later.',
            code: 'MEDIA_NOT_READY',
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to generate playback token',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
