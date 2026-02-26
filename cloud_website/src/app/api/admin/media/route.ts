// src/app/api/admin/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMediaService } from '@/lib/media-service';
import { ErrorResponseBuilder } from '@/lib/api-errors';
import prisma from '@/lib/db';
import { MediaStatus } from '@prisma/client';

/**
 * GET /api/admin/media
 * List media with pagination and filtering
 * Requires instructor or admin role
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as MediaStatus | null;
    const type = searchParams.get('type') || undefined;

    // Validate pagination parameters
    if (page < 1) {
      return ErrorResponseBuilder.validationError('page must be >= 1');
    }
    
    if (limit < 1 || limit > 100) {
      return ErrorResponseBuilder.validationError('limit must be between 1 and 100');
    }

    // Validate status if provided
    if (status && !['UPLOADED', 'PROCESSING', 'READY', 'FAILED'].includes(status)) {
      return ErrorResponseBuilder.validationError(
        'status must be one of: UPLOADED, PROCESSING, READY, FAILED'
      );
    }

    // List media
    const mediaService = getMediaService();
    const result = await mediaService.listMedia({
      userId: user.id,
      status: status || undefined,
      type,
      page,
      limit,
    });

    // Format media items for response
    const formattedMedia = result.media.map((media: any) => ({
      id: media.id,
      originalName: media.originalName,
      r2Key: media.r2Key,
      manifestUrl: media.manifestUrl,
      thumbnails: media.thumbnails,
      duration: media.duration,
      width: media.width,
      height: media.height,
      fileSize: media.fileSize.toString(),
      mimeType: media.mimeType,
      status: media.status,
      metadata: media.metadata,
      uploadedBy: media.uploadedBy,
      user: media.user ? {
        id: media.user.id,
        name: media.user.name,
        email: media.user.email,
      } : null,
      createdAt: media.createdAt.toISOString(),
      updatedAt: media.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedMedia,
      pagination: {
        total: result.total,
        page: result.page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error listing media:', error);

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to list media',
        code: 'MEDIA_LIST_FAILED',
      },
      { status: 500 }
    );
  }
}
