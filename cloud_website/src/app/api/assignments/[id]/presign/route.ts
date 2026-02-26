// src/app/api/assignments/[id]/presign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assignmentService } from '@/lib/assignment-service';
import prisma from '@/lib/db';

/**
 * POST /api/assignments/[id]/presign
 * Generate presigned upload URL for assignment submission
 * 
 * Requirements:
 * - 11.3: Generate presigned upload URL for assignment files
 * - 10.5: Verify NextAuth authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
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

    const { id: assignmentId } = await params;

    // Parse request body
    const body = await request.json();
    const { fileName } = body;

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json(
        {
          error: true,
          message: 'fileName is required',
          code: 'MISSING_FILE_NAME',
          details: { field: 'fileName' },
        },
        { status: 400 }
      );
    }

    // Generate presigned upload URL
    const result = await assignmentService.generateSubmissionUpload({
      assignmentId,
      userId: user.id,
      fileName,
    });

    return NextResponse.json({
      success: true,
      uploadUrl: result.uploadUrl,
      submissionId: result.submissionId,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate presigned URL';
    
    return NextResponse.json(
      {
        error: true,
        message: errorMessage,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
