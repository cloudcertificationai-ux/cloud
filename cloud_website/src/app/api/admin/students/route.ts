// src/app/api/admin/students/route.ts
import { NextRequest } from 'next/server'
import { withApiAuth, apiSuccessResponse, apiErrorResponse } from '@/lib/api-security'
import { withRateLimit } from '@/lib/rate-limiter'
import { withCors, ADMIN_API_CORS_CONFIG } from '@/lib/cors'
import { prisma } from '@/lib/db'
import { formatProfileWithTimestamps } from '@/lib/api-response'

/**
 * GET /api/admin/students
 * List all students with pagination and search
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20)
 * - search: Search by name or email
 * - sortBy: Sort field (name, email, createdAt)
 * - sortOrder: Sort order (asc, desc)
 */
async function handleGetStudents(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Parse query parameters
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const search = searchParams.get('search') || ''
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  // Validate parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return apiErrorResponse('Invalid pagination parameters', 400)
  }

  const validSortFields = ['name', 'email', 'createdAt']
  if (!validSortFields.includes(sortBy)) {
    return apiErrorResponse('Invalid sort field', 400)
  }

  const validSortOrders = ['asc', 'desc']
  if (!validSortOrders.includes(sortOrder)) {
    return apiErrorResponse('Invalid sort order', 400)
  }

  try {
    // Build where clause for search
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // Get total count
    const total = await prisma.user.count({ where })

    // Get students with pagination
    const students = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            enrollments: true,
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

    // Format students with timestamps
    const formattedStudents = students.map((student) =>
      formatProfileWithTimestamps({
        ...student,
        updatedAt: student.createdAt, // Use createdAt as fallback for updatedAt
      })
    )

    return apiSuccessResponse({
      students: formattedStudents,
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
    console.error('Error fetching students:', error)
    return apiErrorResponse('Failed to fetch students', 500)
  }
}

/**
 * Export GET handler with security middleware
 */
export async function GET(request: NextRequest) {
  // Apply middleware in order: CORS -> Rate Limiting -> API Auth -> Handler
  return withCors(
    async (req) =>
      withRateLimit(req, async (req) =>
        withApiAuth(req, async (req, apiKey) => {
          console.log(`API request from: ${apiKey.keyName}`)
          return handleGetStudents(req)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}
