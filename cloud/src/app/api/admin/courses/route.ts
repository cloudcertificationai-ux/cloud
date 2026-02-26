// src/app/api/admin/courses/route.ts
/**
 * Admin API routes for course management
 * POST /api/admin/courses - Create new course
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/api-utils'
import { handleApiError, SuccessResponseBuilder, SlugExistsError } from '@/lib/api-errors'
import { createCourseSchema, generateSlug } from '@/lib/validations/course'
import { Prisma } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

/**
 * POST /api/admin/courses
 * Create a new course
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireAdmin(request)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createCourseSchema.parse(body)

    // Generate slug if not provided
    const slug = validatedData.slug || generateSlug(validatedData.title)

    // Check if slug already exists
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    })

    if (existingCourse) {
      throw new SlugExistsError(slug)
    }

    // Create course with default values
    const course = await prisma.course.create({
      data: {
        id: createId(),
        title: validatedData.title,
        slug,
        summary: validatedData.summary,
        description: validatedData.description,
        priceCents: validatedData.priceCents,
        currency: validatedData.currency || 'INR',
        level: validatedData.level,
        durationMin: validatedData.durationMin,
        thumbnailUrl: validatedData.thumbnailUrl,
        ...(validatedData.categoryId && {
          Category: { connect: { id: validatedData.categoryId } }
        }),
        ...(validatedData.instructorId && {
          Instructor: { connect: { id: validatedData.instructorId } }
        }),
        published: false, // Default to unpublished
        featured: false,
        rating: 0,
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
        action: 'COURSE_CREATED',
        resourceType: 'Course',
        resourceId: course.id,
        details: {
          title: course.title,
          slug: course.slug,
        },
      },
    })

    return SuccessResponseBuilder.created(course)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * GET /api/admin/courses
 * List all courses with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const published = searchParams.get('published')
    const featured = searchParams.get('featured')
    const categoryId = searchParams.get('categoryId')
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.CourseWhereInput = {}
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (published !== null && published !== undefined && published !== '') {
      where.published = published === 'true'
    }
    
    if (featured !== null && featured !== undefined && featured !== '') {
      where.featured = featured === 'true'
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Fetch courses with pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          Category: true,
          Instructor: true,
          _count: {
            select: {
              Module: true,
              Enrollment: true,
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ])

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
