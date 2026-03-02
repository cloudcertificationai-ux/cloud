// src/app/api/admin/students/[id]/route.ts
import { NextRequest } from 'next/server'
import { withApiAuth, apiSuccessResponse, apiErrorResponse } from '@/lib/api-security'
import { withRateLimit } from '@/lib/rate-limiter'
import { withCors, ADMIN_API_CORS_CONFIG } from '@/lib/cors'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/students/:id
 * Get detailed information about a specific student
 * 
 * Returns:
 * - User profile information
 * - Enrollment history with course details
 * - Purchase history
 * - Progress statistics
 * - Review history
 */
async function handleGetStudentDetail(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return apiErrorResponse('Student ID is required', 400)
  }

  try {
    // Fetch student with all related data
    const student = await prisma.user.findUnique({
      where: { id },
      include: {
        Profile: true,
        Enrollment: {
          include: {
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
              },
            },
            Purchase: {
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
            enrolledAt: 'desc',
          },
        },
        Purchase: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        Review: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            Enrollment: true,
            Purchase: true,
            Review: true,
            CourseProgress: true,
          },
        },
      },
    })

    if (!student) {
      return apiErrorResponse('Student not found', 404)
    }

    // Calculate progress statistics
    const progressStats = await prisma.courseProgress.groupBy({
      by: ['courseId'],
      where: {
        userId: id,
        completed: true,
      },
      _count: {
        lessonId: true,
      },
    })

    // Get total lessons per course for completion calculation
    const courseIds = student.Enrollment.map((e) => e.courseId)
    const courseLessonCounts = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
      },
      select: {
        id: true,
        Module: {
          select: {
            Lesson: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })

    // Calculate completion percentages
    const completionData = courseLessonCounts.map((course) => {
      const totalLessons = course.Module.reduce(
        (sum, module) => sum + module.Lesson.length,
        0
      )
      const completedLessons =
        progressStats.find((p) => p.courseId === course.id)?._count.lessonId || 0
      const completionPercentage =
        totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

      return {
        courseId: course.id,
        totalLessons,
        completedLessons,
        completionPercentage: Math.round(completionPercentage * 100) / 100,
      }
    })

    // Calculate total time spent
    const totalTimeSpent = await prisma.courseProgress.aggregate({
      where: { userId: id },
      _sum: {
        timeSpent: true,
      },
    })

    // Count completed courses
    const completedCourses = student.enrollments.filter(
      (e) => e.status === 'COMPLETED'
    ).length

    return apiSuccessResponse({
      student: {
        id: student.id,
        email: student.email,
        name: student.name,
        image: student.image,
        role: student.role,
        createdAt: student.createdAt,
        lastLoginAt: student.lastLoginAt,
        profile: student.Profile,
      },
      enrollments: student.Enrollment,
      purchases: student.Purchase,
      reviews: student.Review,
      statistics: {
        totalEnrollments: student._count.Enrollment,
        completedCourses,
        totalPurchases: student._count.Purchase,
        totalReviews: student._count.Review,
        totalTimeSpent: totalTimeSpent._sum.timeSpent || 0,
        courseProgress: completionData,
      },
    })
  } catch (error) {
    console.error('Error fetching student detail:', error)
    return apiErrorResponse('Failed to fetch student details', 500)
  }
}

/**
 * Export GET handler with security middleware
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Apply middleware in order: CORS -> Rate Limiting -> API Auth -> Handler
  return withCors(
    async (req) =>
      withRateLimit(req, async (req) =>
        withApiAuth(req, async (req, apiKey) => {
          console.log(`API request from: ${apiKey.keyName}`)
          return handleGetStudentDetail(req, context)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}
