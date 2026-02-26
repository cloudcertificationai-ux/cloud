// src/app/api/admin/courses/[id]/unfeature/route.ts
/**
 * Admin API route for unfeaturing courses
 * PUT /api/admin/courses/:id/unfeature - Unfeature a course
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, NotFoundError, SuccessResponseBuilder } from '@/lib/api-errors'
import { createId } from '@paralleldrive/cuid2'

/**
 * PUT /api/admin/courses/:id/unfeature
 * Set featured field to false
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id } = await params

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        featured: true,
      },
    })

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    // Update course to unfeatured
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        featured: false,
        updatedAt: new Date(),
      },
      include: {
        Category: true,
        Instructor: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'COURSE_UNFEATURED',
        resourceType: 'Course',
        resourceId: id,
        details: {
          title: updatedCourse.title,
          slug: updatedCourse.slug,
        },
      },
    })

    return SuccessResponseBuilder.success({
      message: 'Course unfeatured successfully',
      course: updatedCourse,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
