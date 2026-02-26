// src/app/api/admin/courses/[id]/publish/route.ts
/**
 * Admin API route for publishing courses
 * PUT /api/admin/courses/:id/publish - Publish a course
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, NotFoundError, ValidationError, SuccessResponseBuilder } from '@/lib/api-errors'
import { createId } from '@paralleldrive/cuid2'

/**
 * PUT /api/admin/courses/:id/publish
 * Set published field to true
 * Validate course has required content (at least one module and lesson)
 * Update updatedAt timestamp
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id } = await params

    // Check if course exists and fetch with modules and lessons
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        Module: {
          include: {
            Lesson: true,
          },
        },
      },
    })

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    // Validate course has required content
    if (course.Module.length === 0) {
      throw new ValidationError('Cannot publish course without at least one module', {
        modules: ['Course must have at least one module'],
      })
    }

    const totalLessons = course.Module.reduce((sum, module) => sum + module.Lesson.length, 0)
    if (totalLessons === 0) {
      throw new ValidationError('Cannot publish course without at least one lesson', {
        lessons: ['Course must have at least one lesson'],
      })
    }

    // Update course to published
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        published: true,
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
        action: 'COURSE_PUBLISHED',
        resourceType: 'Course',
        resourceId: id,
        details: {
          title: updatedCourse.title,
          slug: updatedCourse.slug,
        },
      },
    })

    return SuccessResponseBuilder.success({
      message: 'Course published successfully',
      course: updatedCourse,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
