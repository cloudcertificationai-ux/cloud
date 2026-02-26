// src/app/api/admin/analytics/progress/route.ts
import { NextRequest } from 'next/server'
import { withApiAuth, apiSuccessResponse, apiErrorResponse } from '@/lib/api-security'
import { withRateLimit } from '@/lib/rate-limiter'
import { withCors, ADMIN_API_CORS_CONFIG } from '@/lib/cors'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/analytics/progress
 * Get course completion rates and progress statistics
 * 
 * Query parameters:
 * - courseId: Filter by specific course (optional)
 */
async function handleGetProgressAnalytics(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const courseId = searchParams.get('courseId') || undefined

  try {
    // Build where clause
    const where = courseId ? { courseId } : {}

    // Total enrollments
    const totalEnrollments = await prisma.enrollment.count({ where })

    // Enrollments by status
    const enrollmentsByStatus = await prisma.enrollment.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    })

    // Calculate completion rate
    const completedEnrollments = enrollmentsByStatus.find(
      (item) => item.status === 'COMPLETED'
    )?._count.id || 0
    const completionRate = totalEnrollments > 0
      ? (completedEnrollments / totalEnrollments) * 100
      : 0

    // Average completion percentage across all enrollments
    const avgCompletionPercentage = await prisma.enrollment.aggregate({
      where,
      _avg: {
        completionPercentage: true,
      },
    })

    // Get completion distribution (0-25%, 25-50%, 50-75%, 75-100%)
    const completionDistribution = await getCompletionDistribution(where)

    // Get average time spent per course
    const timeSpentStats = await prisma.courseProgress.groupBy({
      by: ['courseId'],
      where: courseId ? { courseId } : {},
      _sum: {
        timeSpent: true,
      },
      _count: {
        userId: true,
      },
    })

    // Fetch course details for time spent stats
    const courseIds = timeSpentStats.map((stat) => stat.courseId)
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })

    const timeSpentByCourse = timeSpentStats.map((stat) => {
      const course = courses.find((c) => c.id === stat.courseId)
      const avgTimeSpent = stat._count.userId > 0
        ? (stat._sum.timeSpent || 0) / stat._count.userId
        : 0

      return {
        courseId: stat.courseId,
        courseTitle: course?.title || 'Unknown',
        courseSlug: course?.slug || '',
        totalTimeSpent: stat._sum.timeSpent || 0,
        avgTimeSpent: Math.round(avgTimeSpent),
        studentCount: stat._count.userId,
      }
    }).sort((a, b) => b.totalTimeSpent - a.totalTimeSpent)

    // Get courses with highest completion rates
    const courseCompletionRates = await getCourseCompletionRates()

    // Get most active courses (by recent progress updates)
    const recentProgressUpdates = await prisma.courseProgress.groupBy({
      by: ['courseId'],
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    const activeCourseIds = recentProgressUpdates.map((item) => item.courseId)
    const activeCourses = await prisma.course.findMany({
      where: {
        id: { in: activeCourseIds },
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })

    const mostActiveCourses = recentProgressUpdates.map((item) => {
      const course = activeCourses.find((c) => c.id === item.courseId)
      return {
        courseId: item.courseId,
        courseTitle: course?.title || 'Unknown',
        courseSlug: course?.slug || '',
        recentActivityCount: item._count.id,
      }
    })

    return apiSuccessResponse({
      summary: {
        totalEnrollments,
        completedEnrollments,
        completionRate: Math.round(completionRate * 100) / 100,
        avgCompletionPercentage: Math.round((avgCompletionPercentage._avg.completionPercentage || 0) * 100) / 100,
      },
      enrollmentsByStatus: enrollmentsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
        percentage: Math.round((item._count.id / totalEnrollments) * 10000) / 100,
      })),
      completionDistribution,
      timeSpentByCourse: timeSpentByCourse.slice(0, 10), // Top 10
      courseCompletionRates: courseCompletionRates.slice(0, 10), // Top 10
      mostActiveCourses,
    })
  } catch (error) {
    console.error('Error fetching progress analytics:', error)
    return apiErrorResponse('Failed to fetch progress analytics', 500)
  }
}

/**
 * Helper function to get completion distribution
 */
async function getCompletionDistribution(where: any) {
  const enrollments = await prisma.enrollment.findMany({
    where,
    select: {
      completionPercentage: true,
    },
  })

  const distribution = {
    '0-25': 0,
    '25-50': 0,
    '50-75': 0,
    '75-100': 0,
  }

  enrollments.forEach((enrollment) => {
    const percentage = enrollment.completionPercentage
    if (percentage < 25) {
      distribution['0-25']++
    } else if (percentage < 50) {
      distribution['25-50']++
    } else if (percentage < 75) {
      distribution['50-75']++
    } else {
      distribution['75-100']++
    }
  })

  return Object.entries(distribution).map(([range, count]) => ({
    range,
    count,
    percentage: enrollments.length > 0
      ? Math.round((count / enrollments.length) * 10000) / 100
      : 0,
  }))
}

/**
 * Helper function to get course completion rates
 */
async function getCourseCompletionRates() {
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      enrollments: {
        select: {
          status: true,
        },
      },
    },
  })

  return courses
    .map((course) => {
      const totalEnrollments = course.enrollments.length
      const completedEnrollments = course.enrollments.filter(
        (e) => e.status === 'COMPLETED'
      ).length
      const completionRate = totalEnrollments > 0
        ? (completedEnrollments / totalEnrollments) * 100
        : 0

      return {
        courseId: course.id,
        courseTitle: course.title,
        courseSlug: course.slug,
        totalEnrollments,
        completedEnrollments,
        completionRate: Math.round(completionRate * 100) / 100,
      }
    })
    .filter((course) => course.totalEnrollments > 0) // Only include courses with enrollments
    .sort((a, b) => b.completionRate - a.completionRate)
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
          return handleGetProgressAnalytics(req)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}
