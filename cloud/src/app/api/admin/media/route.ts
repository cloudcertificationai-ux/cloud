import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMediaService } from '@/lib/media-service';
import { ErrorResponseBuilder } from '@/lib/api-errors';
import prisma from '@/lib/db';

/**
 * GET /api/admin/media
 * List all media or get media by ID
 * Requires admin role
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('id');

    // If ID is provided, get single media
    if (mediaId) {
      const mediaService = getMediaService();
      const media = await mediaService.getMedia(mediaId);

      if (!media) {
        return NextResponse.json(
          {
            error: true,
            message: 'Media not found',
            code: 'MEDIA_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const serializedMedia = {
        ...media,
        fileSize: media.fileSize.toString(),
      };

      return NextResponse.json({
        success: true,
        data: {
          media: [serializedMedia],
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Otherwise, list all media with pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;

    if (page < 1) {
      return ErrorResponseBuilder.validationError('page must be >= 1');
    }
    
    if (limit < 1 || limit > 100) {
      return ErrorResponseBuilder.validationError('limit must be between 1 and 100');
    }

    const mediaService = getMediaService();
    const result = await mediaService.listMedia({
      userId: user.id,
      status,
      type,
      page,
      limit,
    });

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
    console.error('Error fetching media:', error);

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to fetch media',
        code: 'MEDIA_FETCH_FAILED',
      },
      { status: 500 }
    );
  }
}
