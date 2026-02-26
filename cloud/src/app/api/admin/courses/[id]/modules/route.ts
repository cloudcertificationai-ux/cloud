// src/app/api/admin/courses/[id]/modules/route.ts
/**
 * Admin API routes for module management
 * POST /api/admin/courses/:id/modules - Create new module
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, NotFoundError, SuccessResponseBuilder } from '@/lib/api-errors'
import { createModuleSchema } from '@/lib/validations/module'
import { createId } from '@paralleldrive/cuid2'

/**
 * POST /api/admin/courses/:id/modules
 * Create a new module with auto-incremented order
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id: courseId } = await params

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true },
    })

    if (!course) {
      throw new NotFoundError('Course', courseId)
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createModuleSchema.parse(body)

    // Get the maximum order value for modules in this course
    const maxOrderModule = await prisma.module.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    // Auto-increment order (start from 0 if no modules exist)
    const nextOrder = maxOrderModule ? maxOrderModule.order + 1 : 0

    // Create module
    const module = await prisma.module.create({
      data: {
        id: createId(),
        title: validatedData.title,
        order: nextOrder,
        Course: {
          connect: { id: courseId }
        },
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
        action: 'MODULE_CREATED',
        resourceType: 'Module',
        resourceId: module.id,
        details: {
          courseId,
          title: module.title,
          order: module.order,
        },
      },
    })

    return SuccessResponseBuilder.created(module)
  } catch (error) {
    return handleApiError(error)
  }
}
