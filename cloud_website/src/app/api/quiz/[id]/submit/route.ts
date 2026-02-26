// src/app/api/quiz/[id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { quizService } from '@/lib/quiz-service';
import prisma from '@/lib/db';

/**
 * POST /api/quiz/[id]/submit
 * Submit quiz answers and receive grading results
 * 
 * Requirements:
 * - 11.1: Validate answers, calculate score, and return results
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

    const { id: quizId } = await params;

    // Parse submitted answers
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        {
          error: true,
          message: 'Answers are required',
          code: 'MISSING_ANSWERS',
          details: { field: 'answers' },
        },
        { status: 400 }
      );
    }

    // Submit quiz and get results
    const result = await quizService.submitQuiz({
      quizId,
      userId: user.id,
      answers,
    });

    // Return score, passed status, and results
    return NextResponse.json({
      success: true,
      attemptId: result.attemptId,
      score: result.score,
      passed: result.passed,
      results: result.results,
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit quiz';
    
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
