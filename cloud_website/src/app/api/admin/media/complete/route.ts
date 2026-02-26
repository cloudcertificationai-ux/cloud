// src/app/api/admin/media/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMediaService } from '@/lib/media-service';
import { ErrorResponseBuilder } from '@/lib/api-errors';
import prisma from '@/lib/db';

/**
 * POST /api/admin/media/complete
 * Notify completion of media upload and trigger transcoding
 * Requires instructor or admin role
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return ErrorResponseBuilder.authenticationError();
    }

    // Get user and verify role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR')) {
      return ErrorResponseBuilder.authorizationError(
        'Admin or Instructor access required'
      );
    }

    // Parse request body
    const body = await request.json();
    const { mediaId } = body;

    // Validate required fields
    if (!mediaId) {
      return ErrorResponseBuilder.validationError(
        'Missing required field: mediaId'
      );
    }

    // Complete upload
    const mediaService = getMediaService();
    const media = await mediaService.completeUpload({
      mediaId,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: media.id,
        originalName: media.originalName,
        r2Key: media.r2Key,
        status: media.status,
        mimeType: media.mimeType,
        fileSize: media.fileSize.toString(),
        createdAt: media.createdAt.toISOString(),
        updatedAt: media.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error completing media upload:', error);
    
    // Handle specific errors from MediaService
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          error: true,
          message: error.message,
          code: 'MEDIA_NOT_FOUND',
        },
        { status: 404 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return ErrorResponseBuilder.authorizationError(error.message);
    }

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to complete media upload',
        code: 'UPLOAD_COMPLETION_FAILED',
      },
      { status: 500 }
    );
  }
}
