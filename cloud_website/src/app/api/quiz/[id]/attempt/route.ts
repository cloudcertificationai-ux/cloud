// src/app/api/quiz/[id]/attempt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { quizService } from '@/lib/quiz-service';
import prisma from '@/lib/db';

/**
 * GET /api/quiz/[id]/attempt
 * Retrieve the most recent quiz attempt with results
 * 
 * Requirements:
 * - 11.2: Return most recent attempt with results
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

    const { id: quizId } = await params;

    // Find the most recent attempt for this user and quiz
    const mostRecentAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId: user.id,
      },
      orderBy: {
        submittedAt: 'desc',
      },
    });

    if (!mostRecentAttempt) {
      return NextResponse.json(
        {
          error: true,
          message: 'No quiz attempt found',
          code: 'ATTEMPT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Get attempt with results
    const attempt = await quizService.getAttempt(mostRecentAttempt.id, user.id);

    return NextResponse.json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.error('Error retrieving quiz attempt:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve quiz attempt';
    
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
