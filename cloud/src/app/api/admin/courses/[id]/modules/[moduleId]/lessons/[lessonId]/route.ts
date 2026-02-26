// src/app/api/admin/courses/[id]/modules/[moduleId]/lessons/[lessonId]/route.ts
/**
 * Admin API routes for individual lesson management
 * PUT /api/admin/courses/:id/modules/:moduleId/lessons/:lessonId - Update lesson
 * DELETE /api/admin/courses/:id/modules/:moduleId/lessons/:lessonId - Delete lesson
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, NotFoundError, SuccessResponseBuilder, ValidationError } from '@/lib/api-errors'
import { updateLessonSchema, validateLessonContent, validateLessonKind, mapTypeToKind } from '@/lib/validations/lesson'
import { createId } from '@paralleldrive/cuid2'

/**
 * PUT /api/admin/courses/:id/modules/:moduleId/lessons/:lessonId
 * Update lesson content and metadata
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id: courseId, moduleId, lessonId } = await params

    // Check if lesson exists and belongs to the module
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
      },
      include: {
        Module: {
          select: {
            courseId: true,
          },
        },
      },
    })

    if (!existingLesson) {
      throw new NotFoundError('Lesson', lessonId)
    }

    // Verify the module belongs to the course
    if (existingLesson.Module.courseId !== courseId) {
      throw new NotFoundError('Lesson', lessonId)
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateLessonSchema.parse(body)

    // Prevent order changes (use reorder endpoint instead)
    if ('order' in body) {
      throw new ValidationError('Cannot change lesson order directly. Use the reorder endpoint instead.')
    }

    // Update lesson
    const updatedLesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.content !== undefined && { content: validatedData.content }),
        ...(validatedData.videoUrl !== undefined && { videoUrl: validatedData.videoUrl }),
        ...(validatedData.duration !== undefined && { duration: validatedData.duration }),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'LESSON_UPDATED',
        resourceType: 'Lesson',
        resourceId: lessonId,
        details: {
          courseId,
          moduleId,
          changes: validatedData,
        },
      },
    })

    return SuccessResponseBuilder.success(updatedLesson)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/courses/:id/modules/:moduleId/lessons/:lessonId
 * Delete lesson and reorder remaining lessons in module
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string; lessonId: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id: courseId, moduleId, lessonId } = await params

    // Check if lesson exists and belongs to the module
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        moduleId,
      },
      include: {
        Module: {
          select: {
            courseId: true,
          },
        },
      },
    })

    if (!existingLesson) {
      throw new NotFoundError('Lesson', lessonId)
    }

    // Verify the module belongs to the course
    if (existingLesson.Module.courseId !== courseId) {
      throw new NotFoundError('Lesson', lessonId)
    }

    // Use transaction to delete lesson and reorder remaining lessons
    await prisma.$transaction(async (tx) => {
      // Delete lesson
      await tx.lesson.delete({
        where: { id: lessonId },
      })

      // Reorder remaining lessons in the module to fill the gap
      // Decrement order for all lessons with order > deleted lesson's order
      await tx.lesson.updateMany({
        where: {
          moduleId,
          order: {
            gt: existingLesson.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      })
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'LESSON_DELETED',
        resourceType: 'Lesson',
        resourceId: lessonId,
        details: {
          courseId,
          moduleId,
          title: existingLesson.title,
          order: existingLesson.order,
        },
      },
    })

    return SuccessResponseBuilder.success({
      message: 'Lesson deleted successfully',
      id: lessonId,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
