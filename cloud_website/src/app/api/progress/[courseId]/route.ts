// src/app/api/progress/[courseId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbDataService } from '@/data/db-data-service'
import prisma from '@/lib/db'

/**
 * GET /api/progress/:courseId
 * Get course progress for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { courseId } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is enrolled in the course
    const enrollment = await dbDataService.checkEnrollment(user.id, courseId)
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Get course progress
    const courseProgress = await dbDataService.getCourseProgress(user.id, courseId)

    if (!courseProgress) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Get detailed progress for each lesson
    const detailedProgress = await prisma.courseProgress.findMany({
      where: {
        userId: user.id,
        courseId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    // Find the last accessed lesson
    const lastAccessedLesson = detailedProgress.length > 0 
      ? detailedProgress[0].lessonId 
      : null

    // Calculate total time spent across all lessons
    const totalTimeSpent = detailedProgress.reduce(
      (sum, progress) => sum + (progress.timeSpent || 0),
      0
    )

    return NextResponse.json({
      ...courseProgress,
      lastAccessedLesson,
      timeSpent: totalTimeSpent,
      detailedProgress,
      enrollment: {
        enrolledAt: enrollment.enrolledAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        status: enrollment.status,
      },
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
