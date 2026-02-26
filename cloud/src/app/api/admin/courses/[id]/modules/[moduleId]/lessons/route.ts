// src/app/api/admin/courses/[id]/modules/[moduleId]/lessons/route.ts
/**
 * Admin API routes for lesson management
 * POST /api/admin/courses/:id/modules/:moduleId/lessons - Create new lesson
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, NotFoundError, SuccessResponseBuilder } from '@/lib/api-errors'
import { createLessonSchema, validateLessonContent, validateLessonKind, mapTypeToKind } from '@/lib/validations/lesson'
import { createId } from '@paralleldrive/cuid2'

/**
 * POST /api/admin/courses/:id/modules/:moduleId/lessons
 * Create a new lesson with auto-incremented order within module
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id: courseId, moduleId } = await params

    // Check if module exists and belongs to the course
    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId,
      },
      select: {
        id: true,
        title: true,
        courseId: true,
      },
    })

    if (!module) {
      throw new NotFoundError('Module', moduleId)
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createLessonSchema.parse(body)

    // Get the maximum order value for lessons in this module
    const maxOrderLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    // Auto-increment order (start from 0 if no lessons exist)
    const nextOrder = maxOrderLesson ? maxOrderLesson.order + 1 : 0

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        id: createId(),
        title: validatedData.title,
        content: validatedData.content,
        videoUrl: validatedData.videoUrl,
        duration: validatedData.duration,
        order: nextOrder,
        moduleId,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'LESSON_CREATED',
        resourceType: 'Lesson',
        resourceId: lesson.id,
        details: {
          courseId,
          moduleId,
          title: lesson.title,
          order: lesson.order,
        },
      },
    })

    return SuccessResponseBuilder.created(lesson)
  } catch (error) {
    return handleApiError(error)
  }
}
