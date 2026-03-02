// src/app/api/admin/enrollments/[id]/route.ts
import { NextRequest } from 'next/server'
import { withApiAuth, apiSuccessResponse, apiErrorResponse } from '@/lib/api-security'
import { withRateLimit } from '@/lib/rate-limiter'
import { withCors, ADMIN_API_CORS_CONFIG } from '@/lib/cors'
import { prisma } from '@/lib/db'

/**
 * DELETE /api/admin/enrollments/:id
 * Remove an enrollment
 * 
 * This will:
 * - Delete the enrollment record
 * - Optionally delete associated progress data
 * - Log the action in audit log
 */
async function handleDeleteEnrollment(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return apiErrorResponse('Enrollment ID is required', 400)
  }

  try {
    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        Course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!enrollment) {
      return apiErrorResponse('Enrollment not found', 404)
    }

    // Delete associated progress data
    await prisma.courseProgress.deleteMany({
      where: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
      },
    })

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'ENROLLMENT_DELETED',
        resourceType: 'Enrollment',
        resourceId: id,
        details: {
          userId: enrollment.userId,
          userEmail: enrollment.User.email,
          userName: enrollment.User.name,
          courseId: enrollment.courseId,
          courseTitle: enrollment.Course.title,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
        },
      },
    })

    return apiSuccessResponse({
      message: 'Enrollment deleted successfully',
      deletedEnrollment: {
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
      },
    })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return apiErrorResponse('Failed to delete enrollment', 500)
  }
}

/**
 * GET /api/admin/enrollments/:id
 * Get detailed information about a specific enrollment
 */
async function handleGetEnrollmentDetail(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return apiErrorResponse('Enrollment ID is required', 400)
  }

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
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
            Instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            Module: {
              select: {
                id: true,
                title: true,
                Lesson: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        Purchase: {
          select: {
            id: true,
            amountCents: true,
            currency: true,
            status: true,
            provider: true,
            providerId: true,
            createdAt: true,
          },
        },
      },
    })

    if (!enrollment) {
      return apiErrorResponse('Enrollment not found', 404)
    }

    // Get progress data
    const progress = await prisma.courseProgress.findMany({
      where: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })

    // Calculate statistics
    const totalLessons = enrollment.Course.Module.reduce(
      (sum, module) => sum + module.Lesson.length,
      0
    )
    const completedLessons = progress.filter((p) => p.completed).length
    const totalTimeSpent = progress.reduce((sum, p) => sum + p.timeSpent, 0)

    return apiSuccessResponse({
      enrollment,
      progress: {
        totalLessons,
        completedLessons,
        completionPercentage: enrollment.completionPercentage,
        totalTimeSpent,
        lessonProgress: progress,
      },
    })
  } catch (error) {
    console.error('Error fetching enrollment detail:', error)
    return apiErrorResponse('Failed to fetch enrollment details', 500)
  }
}

/**
 * Export GET handler with security middleware
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withCors(
    async (req) =>
      withRateLimit(req, async (req) =>
        withApiAuth(req, async (req, apiKey) => {
          console.log(`API request from: ${apiKey.keyName}`)
          return handleGetEnrollmentDetail(req, context)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}

/**
 * Export DELETE handler with security middleware
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withCors(
    async (req) =>
      withRateLimit(req, async (req) =>
        withApiAuth(req, async (req, apiKey) => {
          console.log(`API request from: ${apiKey.keyName}`)
          return handleDeleteEnrollment(req, context)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}
