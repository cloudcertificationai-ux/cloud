import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * GET /api/lessons/[id]
 * Fetch lesson with related resources based on kind
 * 
 * Requirements:
 * - 10.2: Return lesson details with media/quiz/assignment data
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

    // Fetch lesson with related resources based on kind
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        media: {
          select: {
            id: true,
            originalName: true,
            manifestUrl: true,
            thumbnails: true,
            duration: true,
            width: true,
            height: true,
            status: true,
            mimeType: true,
          },
        },
        quiz: {
          include: {
            questions: {
              select: {
                id: true,
                text: true,
                type: true,
                options: true,
                explanation: true,
                points: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        assignment: {
          select: {
            id: true,
            title: true,
            description: true,
            dueDate: true,
            maxMarks: true,
            requirements: true,
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

    // Verify user is enrolled in the course
    const courseId = lesson.module.course.id;
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
          message: 'You must be enrolled in this course to access this lesson',
          code: 'NOT_ENROLLED',
        },
        { status: 403 }
      );
    }

    // Return lesson with appropriate resources based on kind
    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        videoUrl: lesson.videoUrl, // Legacy support
        duration: lesson.duration,
        order: lesson.order,
        kind: lesson.kind,
        moduleId: lesson.moduleId,
        module: {
          id: lesson.module.id,
          title: lesson.module.title,
          course: lesson.module.course,
        },
        // Include resources based on lesson kind
        media: lesson.media,
        quiz: lesson.quiz,
        assignment: lesson.assignment,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);

    return NextResponse.json(
      {
        error: true,
        message: 'Failed to fetch lesson',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
