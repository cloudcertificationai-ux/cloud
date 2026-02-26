// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbDataService } from '@/data/db-data-service'
import prisma from '@/lib/db'
import { checkAndUpdateCourseCompletion } from '@/lib/course-completion'
import { createApiResponse, formatProgressWithTimestamps } from '@/lib/api-response'
import { SyncService } from '@/lib/sync-service'
import { logApiRequest } from '@/lib/audit-logger'
import { progressTracker } from '@/lib/progress-tracker'

/**
 * POST /api/progress
 * Update lesson progress for a user
 * 
 * Requirements:
 * - 10.3: Parse heartbeat data and update progress
 * - 10.5: Verify NextAuth authentication
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: true,
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { courseId, lessonId, completed, timeSpent, lastPosition, currentPosition, duration, sessionId } = body

    // Validate required fields
    if (!lessonId) {
      return NextResponse.json(
        {
          error: true,
          message: 'lessonId is required',
          code: 'MISSING_LESSON_ID',
          details: { field: 'lessonId' },
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: true,
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    // Get lesson to find courseId if not provided
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    })

    if (!lesson) {
      return NextResponse.json(
        {
          error: true,
          message: 'Lesson not found',
          code: 'LESSON_NOT_FOUND',
        },
        { status: 404 }
      )
    }

    const actualCourseId = courseId || lesson.module.courseId

    // Check if user is enrolled in the course
    const enrollment = await dbDataService.checkEnrollment(user.id, actualCourseId)
    
    if (!enrollment) {
      return NextResponse.json(
        {
          error: true,
          message: 'Not enrolled in this course',
          code: 'NOT_ENROLLED',
        },
        { status: 403 }
      )
    }

    let progressResult

    // Use new ProgressTracker if currentPosition and duration are provided (heartbeat mode)
    if (currentPosition !== undefined && duration !== undefined) {
      progressResult = await progressTracker.updateProgress({
        userId: user.id,
        lessonId,
        currentPosition,
        duration,
        sessionId, // Pass sessionId for analytics tracking (Requirement 17.2)
      })
    } else {
      // Legacy mode: use existing progress update logic
      const progress = await dbDataService.updateLessonProgress(
        user.id,
        actualCourseId,
        lessonId,
        completed ?? false,
        timeSpent
      )

      // Update last position if provided
      if (lastPosition !== undefined) {
        await prisma.courseProgress.update({
          where: {
            userId_lessonId: { userId: user.id, lessonId },
          },
          data: {
            lastPosition,
          },
        })
      }

      progressResult = {
        watchedSec: progress.watchedSec || 0,
        lastPosition: (lastPosition ?? progress.lastPosition) || 0,
        completionPercentage: 0,
        isCompleted: progress.completed,
      }
    }

    // Update enrollment's lastAccessedAt
    await prisma.enrollment.update({
      where: {
        userId_courseId: { userId: user.id, courseId: actualCourseId },
      },
      data: {
        lastAccessedAt: new Date(),
      },
    })

    // Check and update course completion status
    const completionStatus = await checkAndUpdateCourseCompletion(user.id, actualCourseId)

    // Emit sync event for progress update
    await SyncService.emitProgressEvent(user.id, actualCourseId).catch((error) => {
      console.error('Failed to emit progress sync event:', error)
    })

    // Log progress update for audit trail
    await logApiRequest(
      request,
      user.id,
      progressResult.isCompleted ? 'lesson_completed' : 'lesson_progress_updated',
      'lesson',
      lessonId,
      {
        courseId: actualCourseId,
        completed: progressResult.isCompleted,
        watchedSec: progressResult.watchedSec,
        completionPercentage: completionStatus?.completionPercentage,
      }
    ).catch((error) => {
      console.error('Failed to log progress update:', error)
    })

    return NextResponse.json({
      success: true,
      progress: {
        watchedSec: progressResult.watchedSec,
        lastPosition: progressResult.lastPosition,
        completionPercentage: progressResult.completionPercentage,
        isCompleted: progressResult.isCompleted,
      },
      completionStatus,
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      {
        error: true,
        message: 'Failed to update progress',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}
