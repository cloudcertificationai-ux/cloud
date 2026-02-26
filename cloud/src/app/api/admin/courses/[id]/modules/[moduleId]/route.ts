// src/app/api/admin/courses/[id]/modules/[moduleId]/route.ts
/**
 * Admin API routes for individual module management
 * PUT /api/admin/courses/:id/modules/:moduleId - Update module
 * DELETE /api/admin/courses/:id/modules/:moduleId - Delete module
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, NotFoundError, SuccessResponseBuilder, ValidationError } from '@/lib/api-errors'
import { updateModuleSchema } from '@/lib/validations/module'
import { createId } from '@paralleldrive/cuid2'

/**
 * PUT /api/admin/courses/:id/modules/:moduleId
 * Update module title (order changes use reorder endpoint)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id: courseId, moduleId } = await params

    // Check if module exists and belongs to the course
    const existingModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId,
      },
      select: {
        id: true,
        title: true,
        order: true,
      },
    })

    if (!existingModule) {
      throw new NotFoundError('Module', moduleId)
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateModuleSchema.parse(body)

    // Prevent order changes (use reorder endpoint instead)
    if ('order' in body) {
      throw new ValidationError('Cannot change module order directly. Use the reorder endpoint instead.')
    }

    // Update module
    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: {
        title: validatedData.title,
      },
      include: {
        Lesson: {
          orderBy: { order: 'asc' },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'MODULE_UPDATED',
        resourceType: 'Module',
        resourceId: moduleId,
        details: {
          courseId,
          changes: validatedData,
        },
      },
    })

    return SuccessResponseBuilder.success(updatedModule)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/courses/:id/modules/:moduleId
 * Delete module with cascade to lessons and reorder remaining modules
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; moduleId: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id: courseId, moduleId } = await params

    // Check if module exists and belongs to the course
    const existingModule = await prisma.module.findFirst({
      where: {
        id: moduleId,
        courseId,
      },
      select: {
        id: true,
        title: true,
        order: true,
      },
    })

    if (!existingModule) {
      throw new NotFoundError('Module', moduleId)
    }

    // Use transaction to delete module and reorder remaining modules
    await prisma.$transaction(async (tx) => {
      // Delete module (cascade will handle lessons)
      await tx.module.delete({
        where: { id: moduleId },
      })

      // Reorder remaining modules to fill the gap
      // Decrement order for all modules with order > deleted module's order
      await tx.module.updateMany({
        where: {
          courseId,
          order: {
            gt: existingModule.order,
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
        action: 'MODULE_DELETED',
        resourceType: 'Module',
        resourceId: moduleId,
        details: {
          courseId,
          title: existingModule.title,
          order: existingModule.order,
        },
      },
    })

    return SuccessResponseBuilder.success({
      message: 'Module deleted successfully',
      id: moduleId,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
