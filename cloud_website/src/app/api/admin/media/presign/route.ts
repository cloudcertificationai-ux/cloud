// src/app/api/admin/media/presign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getMediaService } from '@/lib/media-service';
import { ErrorResponseBuilder } from '@/lib/api-errors';
import prisma from '@/lib/db';

/**
 * POST /api/admin/media/presign
 * Generate presigned upload URL for media files
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
    const { fileName, fileType, fileSize } = body;

    // Validate required fields
    if (!fileName || !fileType || !fileSize) {
      return ErrorResponseBuilder.validationError(
        'Missing required fields: fileName, fileType, fileSize'
      );
    }

    // Validate file size is a number
    const fileSizeNum = Number(fileSize);
    if (isNaN(fileSizeNum) || fileSizeNum <= 0) {
      return ErrorResponseBuilder.validationError(
        'fileSize must be a positive number'
      );
    }

    // Generate presigned upload URL
    const mediaService = getMediaService();
    const result = await mediaService.generatePresignedUpload({
      fileName,
      fileType,
      fileSize: fileSizeNum,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: result.uploadUrl,
        mediaId: result.mediaId,
        expiresAt: result.expiresAt.toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    
    // Handle validation errors from MediaService
    if (error instanceof Error && error.message.includes('Invalid file type')) {
      return ErrorResponseBuilder.validationError(error.message);
    }
    
    if (error instanceof Error && error.message.includes('exceeds limit')) {
      return ErrorResponseBuilder.validationError(error.message);
    }

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to generate presigned URL',
        code: 'PRESIGN_GENERATION_FAILED',
      },
      { status: 500 }
    );
  }
}
