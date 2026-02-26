import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { progressTracker } from '@/lib/progress-tracker';
import prisma from '@/lib/db';

/**
 * GET /api/lessons/[id]/progress
 * Get current progress for a lesson including last position
 * 
 * Requirements:
 * - 10.4: Return current progress including lastPosition
 * - 10.5: Verify NextAuth authentication
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params as per Next.js 15+ requirements
    const { id: lessonId } = await params;

    // Verify NextAuth authentication
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

    // Get lesson to verify it exists and get course info
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        {
          error: true,
          message: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    const courseId = lesson.module.course.id;

    // Verify user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (!enrollment || enrollment.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: true,
          message: 'You must be enrolled in this course to access progress',
          code: 'NOT_ENROLLED',
        },
        { status: 403 }
      );
    }

    // Get progress using ProgressTracker
    const progress = await progressTracker.getProgress(user.id, lessonId);

    return NextResponse.json({
      success: true,
      progress: {
        watchedSec: progress.watchedSec,
        lastPosition: progress.lastPosition,
        completionPercentage: progress.completionPercentage,
        isCompleted: progress.isCompleted,
      },
    });
  } catch (error) {
    console.error('Error fetching lesson progress:', error);

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to fetch lesson progress',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
