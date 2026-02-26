// src/app/api/courses/[slug]/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbDataService } from '@/data/db-data-service'
import prisma from '@/lib/db'
import { checkAndUpdateCourseCompletion } from '@/lib/course-completion'
import { createApiResponse, formatProgressWithTimestamps } from '@/lib/api-response'
import { SyncService } from '@/lib/sync-service'
import { logApiRequest } from '@/lib/audit-logger'

/**
 * POST /api/courses/:slug/progress
 * Update lesson progress for a user in a specific course
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { lessonId, completed, timeSpent, lastPosition } = body

    // Validate required fields
    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get course by slug
    const course = await prisma.course.findUnique({
      where: { slug },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user is enrolled in the course
    const enrollment = await dbDataService.checkEnrollment(user.id, course.id)
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Check if enrollment is active
    if (enrollment.status !== 'ACTIVE') {
      return NextResponse.json(
        { 
          error: 'Enrollment is not active',
          status: enrollment.status
        },
        { status: 403 }
      )
    }

    // Update or create CourseProgress record
    const progress = await prisma.courseProgress.upsert({
      where: {
        userId_lessonId: { 
          userId: user.id, 
          lessonId 
        },
      },
      update: {
        completed: completed ?? false,
        ...(timeSpent !== undefined && { timeSpent }),
        ...(lastPosition !== undefined && { lastPosition }),
        timestamp: new Date(),
      },
      create: {
        userId: user.id,
        courseId: course.id,
        lessonId,
        completed: completed ?? false,
        timeSpent: timeSpent ?? 0,
        lastPosition: lastPosition ?? 0,
      },
    })

    // Update lastAccessedAt in Enrollment
    await prisma.enrollment.update({
      where: {
        userId_courseId: { userId: user.id, courseId: course.id },
      },
      data: {
        lastAccessedAt: new Date(),
      },
    })

    // Recalculate completionPercentage
    const completionStatus = await checkAndUpdateCourseCompletion(user.id, course.id)

    // Emit sync event for progress update
    await SyncService.emitProgressEvent(user.id, course.id).catch((error) => {
      console.error('Failed to emit progress sync event:', error)
    })

    // Log progress update for audit trail
    await logApiRequest(
      request,
      user.id,
      completed ? 'lesson_completed' : 'lesson_progress_updated',
      'lesson',
      lessonId,
      {
        courseId: course.id,
        courseSlug: slug,
        completed,
        timeSpent,
        lastPosition,
        completionPercentage: completionStatus?.completionPercentage,
      }
    ).catch((error) => {
      console.error('Failed to log progress update:', error)
    })

    return createApiResponse({
      success: true,
      progress: formatProgressWithTimestamps(progress),
      completionStatus,
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/courses/:slug/progress
 * Get user's progress for all lessons in a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get course by slug
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user is enrolled
    const enrollment = await dbDataService.checkEnrollment(user.id, course.id)
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    // Get all progress records for this course
    const progressRecords = await prisma.courseProgress.findMany({
      where: { 
        userId: user.id, 
        courseId: course.id 
      },
    })

    // Create a map of lessonId to progress
    const progressMap = new Map(
      progressRecords.map(p => [p.lessonId, p])
    )

    // Find last accessed lesson (most recent timestamp)
    const lastAccessedProgress = progressRecords.reduce((latest, current) => {
      if (!latest || current.timestamp > latest.timestamp) {
        return current
      }
      return latest
    }, null as typeof progressRecords[0] | null)

    // Calculate total and completed lessons
    const totalLessons = course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    )
    const completedLessons = progressRecords.filter(p => p.completed).length

    // Build progress response with lesson details
    const progressByLesson = course.modules.flatMap(module =>
      module.lessons.map(lesson => {
        const progress = progressMap.get(lesson.id)
        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          moduleId: module.id,
          moduleTitle: module.title,
          order: lesson.order,
          completed: progress?.completed ?? false,
          timeSpent: progress?.timeSpent ?? 0,
          lastPosition: progress?.lastPosition ?? 0,
          timestamp: progress?.timestamp ?? null,
        }
      })
    )

    return createApiResponse({
      courseId: course.id,
      courseTitle: course.title,
      courseSlug: course.slug,
      totalLessons,
      completedLessons,
      completionPercentage: enrollment.completionPercentage,
      lastAccessedLesson: lastAccessedProgress ? {
        lessonId: lastAccessedProgress.lessonId,
        timestamp: lastAccessedProgress.timestamp,
      } : null,
      progress: progressByLesson,
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}
