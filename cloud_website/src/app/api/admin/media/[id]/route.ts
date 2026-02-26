// src/app/api/admin/media/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMediaService } from '@/lib/media-service';
import { ErrorResponseBuilder } from '@/lib/api-errors';
import prisma from '@/lib/db';

/**
 * DELETE /api/admin/media/[id]
 * Delete media and cleanup R2 objects
 * Requires instructor or admin role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: mediaId } = await params;

    // Validate media ID
    if (!mediaId) {
      return ErrorResponseBuilder.validationError('Media ID is required');
    }

    // Delete media
    const mediaService = getMediaService();
    await mediaService.deleteMedia(mediaId, user.id);

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    
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
        message: 'Failed to delete media',
        code: 'MEDIA_DELETE_FAILED',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/media/[id]
 * Update media metadata
 * Requires instructor or admin role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: mediaId } = await params;

    // Validate media ID
    if (!mediaId) {
      return ErrorResponseBuilder.validationError('Media ID is required');
    }

    // Parse request body
    const body = await request.json();

    // Validate that at least one field is provided
    if (Object.keys(body).length === 0) {
      return ErrorResponseBuilder.validationError(
        'At least one field must be provided for update'
      );
    }

    // Update media
    const mediaService = getMediaService();
    const updatedMedia = await mediaService.updateMedia(mediaId, body);

    return NextResponse.json({
      success: true,
      data: {
        id: updatedMedia.id,
        originalName: updatedMedia.originalName,
        r2Key: updatedMedia.r2Key,
        manifestUrl: updatedMedia.manifestUrl,
        thumbnails: updatedMedia.thumbnails,
        duration: updatedMedia.duration,
        width: updatedMedia.width,
        height: updatedMedia.height,
        fileSize: updatedMedia.fileSize.toString(),
        mimeType: updatedMedia.mimeType,
        status: updatedMedia.status,
        metadata: updatedMedia.metadata,
        uploadedBy: updatedMedia.uploadedBy,
        createdAt: updatedMedia.createdAt.toISOString(),
        updatedAt: updatedMedia.updatedAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating media:', error);
    
    // Handle specific errors
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        {
          error: true,
          message: 'Media not found',
          code: 'MEDIA_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to update media',
        code: 'MEDIA_UPDATE_FAILED',
      },
      { status: 500 }
    );
  }
}
