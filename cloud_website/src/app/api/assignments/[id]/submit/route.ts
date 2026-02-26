// src/app/api/assignments/[id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assignmentService } from '@/lib/assignment-service';
import prisma from '@/lib/db';

/**
 * POST /api/assignments/[id]/submit
 * Submit an assignment (confirm upload completion)
 * 
 * Requirements:
 * - 11.4: Create AssignmentSubmission record
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
    const { submissionId } = body;

    if (!submissionId || typeof submissionId !== 'string') {
      return NextResponse.json(
        {
          error: true,
          message: 'submissionId is required',
          code: 'MISSING_SUBMISSION_ID',
          details: { field: 'submissionId' },
        },
        { status: 400 }
      );
    }

    // Submit assignment
    const submission = await assignmentService.submitAssignment({
      submissionId,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        assignmentId: submission.assignmentId,
        userId: submission.userId,
        fileName: submission.fileName,
        submittedAt: submission.submittedAt,
        isLate: submission.isLate,
        marks: submission.marks,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt,
      },
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit assignment';
    
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
