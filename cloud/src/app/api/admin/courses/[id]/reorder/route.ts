// src/app/api/admin/courses/[id]/reorder/route.ts
/**
 * Admin API route for curriculum reordering
 * PUT /api/admin/courses/:id/reorder - Reorder modules and lessons
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, NotFoundError, SuccessResponseBuilder, ValidationError } from '@/lib/api-errors'
import { reorderRequestSchema, type ReorderOperation } from '@/lib/validations/reorder'
import { createId } from '@paralleldrive/cuid2'

/**
 * PUT /api/admin/courses/:id/reorder
 * Accept array of reorder operations and update order fields in batch transaction
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id: courseId } = await params

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    })

    if (!existingCourse) {
      throw new NotFoundError('Course', courseId)
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = reorderRequestSchema.parse(body)

    // Separate module and lesson operations
    const moduleOperations = validatedData.operations.filter((op) => op.type === 'module')
    const lessonOperations = validatedData.operations.filter((op) => op.type === 'lesson')

    // Validate that all modules belong to this course
    if (moduleOperations.length > 0) {
      const moduleIds = moduleOperations.map((op) => op.id)
      const modules = await prisma.module.findMany({
        where: {
          id: { in: moduleIds },
          courseId,
        },
        select: { id: true },
      })

      if (modules.length !== moduleIds.length) {
        throw new ValidationError('One or more modules do not belong to this course')
      }
    }

    // Validate that all lessons exist and their target modules belong to this course
    if (lessonOperations.length > 0) {
      const lessonIds = lessonOperations.map((op) => op.id)
      const lessons = await prisma.lesson.findMany({
        where: { id: { in: lessonIds } },
        select: { id: true, moduleId: true },
      })

      if (lessons.length !== lessonIds.length) {
        throw new ValidationError('One or more lessons do not exist')
      }

      // Get all target module IDs from lesson operations
      const targetModuleIds = Array.from(new Set(lessonOperations.map((op) => op.moduleId!)))
      const targetModules = await prisma.module.findMany({
        where: {
          id: { in: targetModuleIds },
          courseId,
        },
        select: { id: true },
      })

      if (targetModules.length !== targetModuleIds.length) {
        throw new ValidationError('One or more target modules do not belong to this course')
      }
    }

    // Execute all updates in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update module orders
      for (const operation of moduleOperations) {
        await tx.module.update({
          where: { id: operation.id },
          data: { order: operation.order },
        })
      }

      // Update lesson orders and moduleIds (for lessons moved between modules)
      for (const operation of lessonOperations) {
        await tx.lesson.update({
          where: { id: operation.id },
          data: {
            order: operation.order,
            moduleId: operation.moduleId!,
          },
        })
      }

      // Fetch updated curriculum
      const updatedCourse = await tx.course.findUnique({
        where: { id: courseId },
        include: {
          Module: {
            orderBy: { order: 'asc' },
            include: {
              Lesson: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      })

      return updatedCourse
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'CURRICULUM_REORDERED',
        resourceType: 'Course',
        resourceId: courseId,
        details: {
          moduleOperations: moduleOperations.length,
          lessonOperations: lessonOperations.length,
          operations: validatedData.operations,
        },
      },
    })

    return SuccessResponseBuilder.success({
      message: 'Curriculum reordered successfully',
      course: result,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
