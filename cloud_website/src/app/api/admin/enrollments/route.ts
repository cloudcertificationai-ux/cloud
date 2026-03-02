// src/app/api/admin/enrollments/route.ts
import { NextRequest } from 'next/server'
import { withApiAuth, apiSuccessResponse, apiErrorResponse } from '@/lib/api-security'
import { withRateLimit } from '@/lib/rate-limiter'
import { withCors, ADMIN_API_CORS_CONFIG } from '@/lib/cors'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/enrollments
 * List all enrollments with filtering
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - userId: Filter by user ID
 * - courseId: Filter by course ID
 * - status: Filter by enrollment status (ACTIVE, COMPLETED, CANCELLED, REFUNDED)
 * - sortBy: Sort field (enrolledAt, lastAccessedAt, completionPercentage)
 * - sortOrder: Sort order (asc, desc)
 */
async function handleGetEnrollments(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Parse query parameters
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const userId = searchParams.get('userId') || undefined
  const courseId = searchParams.get('courseId') || undefined
  const status = searchParams.get('status') || undefined
  const sortBy = searchParams.get('sortBy') || 'enrolledAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  // Validate parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return apiErrorResponse('Invalid pagination parameters', 400)
  }

  const validSortFields = ['enrolledAt', 'lastAccessedAt', 'completionPercentage']
  if (!validSortFields.includes(sortBy)) {
    return apiErrorResponse('Invalid sort field', 400)
  }

  const validSortOrders = ['asc', 'desc']
  if (!validSortOrders.includes(sortOrder)) {
    return apiErrorResponse('Invalid sort order', 400)
  }

  const validStatuses = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'REFUNDED']
  if (status && !validStatuses.includes(status)) {
    return apiErrorResponse('Invalid status', 400)
  }

  try {
    // Build where clause
    const where: any = {}
    if (userId) where.userId = userId
    if (courseId) where.courseId = courseId
    if (status) where.status = status

    // Get total count
    const total = await prisma.enrollment.count({ where })

    // Get enrollments with pagination
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        Course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            priceCents: true,
            currency: true,
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        purchase: {
          select: {
            id: true,
            amountCents: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return apiSuccessResponse({
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return apiErrorResponse('Failed to fetch enrollments', 500)
  }
}

/**
 * POST /api/admin/enrollments
 * Create a new enrollment (admin-initiated)
 * 
 * Request body:
 * - userId: User ID (required)
 * - courseId: Course ID (required)
 * - source: Enrollment source (default: 'admin')
 * - status: Initial status (default: 'ACTIVE')
 */
async function handleCreateEnrollment(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, courseId, source = 'admin', status = 'ACTIVE' } = body

    // Validate required fields
    if (!userId || !courseId) {
      return apiErrorResponse('userId and courseId are required', 400)
    }

    // Validate status
    const validStatuses = ['ACTIVE', 'COMPLETED', 'CANCELLED', 'REFUNDED']
    if (!validStatuses.includes(status)) {
      return apiErrorResponse('Invalid status', 400)
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return apiErrorResponse('User not found', 404)
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return apiErrorResponse('Course not found', 404)
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    if (existingEnrollment) {
      return apiErrorResponse('User is already enrolled in this course', 400)
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        User: {
          connect: { id: userId }
        },
        Course: {
          connect: { id: courseId }
        },
        source,
        status,
        enrolledAt: new Date(),
        completionPercentage: 0,
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        Course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            instructor: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'ENROLLMENT_CREATED',
        resourceType: 'Enrollment',
        resourceId: enrollment.id,
        details: {
          userId,
          courseId,
          source,
          status,
        },
      },
    })

    return apiSuccessResponse(enrollment, 201)
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return apiErrorResponse('Failed to create enrollment', 500)
  }
}

/**
 * Export GET handler with security middleware
 */
export async function GET(request: NextRequest) {
  return withCors(
    async (req) =>
      withRateLimit(req, async (req) =>
        withApiAuth(req, async (req, apiKey) => {
          console.log(`API request from: ${apiKey.keyName}`)
          return handleGetEnrollments(req)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}

/**
 * Export POST handler with security middleware
 */
export async function POST(request: NextRequest) {
  return withCors(
    async (req) =>
      withRateLimit(req, async (req) =>
        withApiAuth(req, async (req, apiKey) => {
          console.log(`API request from: ${apiKey.keyName}`)
          return handleCreateEnrollment(req)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}
