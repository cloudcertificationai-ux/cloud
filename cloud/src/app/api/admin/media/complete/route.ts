import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMediaService } from '@/lib/media-service';
import { ErrorResponseBuilder } from '@/lib/api-errors';
import prisma from '@/lib/db';

/**
 * POST /api/admin/media/complete
 * Mark media upload as complete
 * Requires admin role
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return ErrorResponseBuilder.authenticationError();
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return ErrorResponseBuilder.authorizationError(
        'Admin access required'
      );
    }

    const body = await request.json();
    const { mediaId } = body;

    if (!mediaId) {
      return ErrorResponseBuilder.validationError(
        'Missing required field: mediaId'
      );
    }

    const mediaService = getMediaService();
    const media = await mediaService.completeUpload({
      mediaId,
      userId: user.id,
    });

    // Convert BigInt to string for JSON serialization
    const serializedMedia = {
      ...media,
      fileSize: media.fileSize.toString(),
    };

    return NextResponse.json({
      success: true,
      data: serializedMedia,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error completing upload:', error);
    
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
        message: 'Failed to complete upload',
        code: 'UPLOAD_COMPLETION_FAILED',
      },
      { status: 500 }
    );
  }
}
