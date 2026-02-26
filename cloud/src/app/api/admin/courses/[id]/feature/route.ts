// src/app/api/admin/courses/[id]/feature/route.ts
/**
 * Admin API route for featuring courses
 * PUT /api/admin/courses/:id/feature - Feature a course
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, NotFoundError, ValidationError, SuccessResponseBuilder } from '@/lib/api-errors'
import { createId } from '@paralleldrive/cuid2'

/**
 * PUT /api/admin/courses/:id/feature
 * Set featured field to true
 * Require course to be published
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
        published: true,
        featured: true,
      },
    })

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    // Validate course is published
    if (!course.published) {
      throw new ValidationError('Cannot feature an unpublished course', {
        published: ['Course must be published before it can be featured'],
      })
    }

    // Update course to featured
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        featured: true,
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
        action: 'COURSE_FEATURED',
        resourceType: 'Course',
        resourceId: id,
        details: {
          title: updatedCourse.title,
          slug: updatedCourse.slug,
        },
      },
    })

    return SuccessResponseBuilder.success({
      message: 'Course featured successfully',
      course: updatedCourse,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
