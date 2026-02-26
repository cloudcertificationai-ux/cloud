// src/app/api/admin/courses/[id]/route.ts
/**
 * Admin API routes for individual course management
 * GET /api/admin/courses/:id - Get course with full curriculum
 * PUT /api/admin/courses/:id - Update course metadata
 * DELETE /api/admin/courses/:id - Delete course
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, NotFoundError, SuccessResponseBuilder, ValidationError } from '@/lib/api-errors'
import { updateCourseSchema } from '@/lib/validations/course'
import { createId } from '@paralleldrive/cuid2'

/**
 * GET /api/admin/courses/:id
 * Fetch course with all related modules and lessons
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await requireAdmin(request)

    const { id } = await params

    // Fetch course with all related data
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        Category: true,
        Instructor: true,
        Module: {
          orderBy: { order: 'asc' },
          include: {
            Lesson: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: {
            Enrollment: true,
            Review: true,
          },
        },
      },
    })

    if (!course) {
      throw new NotFoundError('Course', id)
    }

    return SuccessResponseBuilder.success(course)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/admin/courses/:id
 * Update course metadata
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
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    })

    if (!existingCourse) {
      throw new NotFoundError('Course', id)
    }

    // Parse and validate request body
    const body = await request.json()
    console.log('Course update request body:', JSON.stringify(body, null, 2))
    
    try {
      const validatedData = updateCourseSchema.parse(body)
      console.log('Validated data:', JSON.stringify(validatedData, null, 2))
    } catch (validationError) {
      console.error('Validation error:', validationError)
      throw validationError
    }
    
    const validatedData = updateCourseSchema.parse(body)

    // Prevent slug changes if course is published
    if (validatedData.slug && validatedData.slug !== existingCourse.slug && existingCourse.published) {
      throw new ValidationError('Cannot change slug of a published course')
    }

    // If slug is being changed, check for uniqueness
    if (validatedData.slug && validatedData.slug !== existingCourse.slug) {
      const slugExists = await prisma.course.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        throw new ValidationError('A course with this slug already exists', {
          slug: ['Slug must be unique'],
        })
      }
    }

    // Transform empty strings to undefined for foreign keys
    const updateData = {
      ...validatedData,
      instructorId: validatedData.instructorId === '' ? undefined : validatedData.instructorId,
      categoryId: validatedData.categoryId === '' ? undefined : validatedData.categoryId,
      thumbnailUrl: validatedData.thumbnailUrl === '' ? null : validatedData.thumbnailUrl,
      summary: validatedData.summary === '' ? null : validatedData.summary,
      description: validatedData.description === '' ? null : validatedData.description,
      level: validatedData.level === '' ? null : validatedData.level,
      updatedAt: new Date(),
    }

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
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
        action: 'COURSE_UPDATED',
        resourceType: 'Course',
        resourceId: id,
        details: {
          changes: validatedData,
        },
      },
    })

    return SuccessResponseBuilder.success(updatedCourse)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/admin/courses/:id
 * Delete course with cascade deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    const { id } = await params

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })

    if (!existingCourse) {
      throw new NotFoundError('Course', id)
    }

    // Delete course (cascade will handle modules, lessons, enrollments, progress)
    await prisma.course.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'COURSE_DELETED',
        resourceType: 'Course',
        resourceId: id,
        details: {
          title: existingCourse.title,
          slug: existingCourse.slug,
        },
      },
    })

    return SuccessResponseBuilder.success({
      message: 'Course deleted successfully',
      id,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
