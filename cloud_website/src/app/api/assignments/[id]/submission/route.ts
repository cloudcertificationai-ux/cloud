// src/app/api/assignments/[id]/submission/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { assignmentService } from '@/lib/assignment-service';
import prisma from '@/lib/db';

/**
 * GET /api/assignments/[id]/submission
 * Retrieve assignment submission with grading status
 * 
 * Requirements:
 * - 11.5: Return submission with grading status
 * - 10.5: Verify NextAuth authentication
 */
export async function GET(
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

    // Get submission by assignment and user
    const submission = await assignmentService.getSubmissionByAssignment(
      assignmentId,
      user.id
    );

    if (!submission) {
      return NextResponse.json(
        {
          error: true,
          message: 'No submission found for this assignment',
          code: 'SUBMISSION_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Type assertion for included relations
    const submissionWithRelations = submission as typeof submission & {
      assignment: { id: string; title: string; description: string; dueDate: Date; maxMarks: number };
      grader: { id: string; name: string; email: string } | null;
    };

    return NextResponse.json({
      success: true,
      submission: {
        id: submissionWithRelations.id,
        assignmentId: submissionWithRelations.assignmentId,
        userId: submissionWithRelations.userId,
        fileName: submissionWithRelations.fileName,
        submittedAt: submissionWithRelations.submittedAt,
        isLate: submissionWithRelations.isLate,
        marks: submissionWithRelations.marks,
        feedback: submissionWithRelations.feedback,
        gradedAt: submissionWithRelations.gradedAt,
        gradedBy: submissionWithRelations.gradedBy,
        assignment: submissionWithRelations.assignment ? {
          id: submissionWithRelations.assignment.id,
          title: submissionWithRelations.assignment.title,
          description: submissionWithRelations.assignment.description,
          dueDate: submissionWithRelations.assignment.dueDate,
          maxMarks: submissionWithRelations.assignment.maxMarks,
        } : null,
        grader: submissionWithRelations.grader ? {
          id: submissionWithRelations.grader.id,
          name: submissionWithRelations.grader.name,
          email: submissionWithRelations.grader.email,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error retrieving submission:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve submission';
    
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
