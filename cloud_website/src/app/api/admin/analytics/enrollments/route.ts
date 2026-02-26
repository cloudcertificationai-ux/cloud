// src/app/api/admin/analytics/enrollments/route.ts
import { NextRequest } from 'next/server'
import { withApiAuth, apiSuccessResponse, apiErrorResponse } from '@/lib/api-security'
import { withRateLimit } from '@/lib/rate-limiter'
import { withCors, ADMIN_API_CORS_CONFIG } from '@/lib/cors'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/analytics/enrollments
 * Get enrollment statistics and trends
 * 
 * Query parameters:
 * - startDate: Start date for filtering (ISO 8601)
 * - endDate: End date for filtering (ISO 8601)
 * - groupBy: Group results by (day, week, month, year)
 */
async function handleGetEnrollmentAnalytics(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')
  const groupBy = searchParams.get('groupBy') || 'month'

  // Validate groupBy parameter
  const validGroupBy = ['day', 'week', 'month', 'year']
  if (!validGroupBy.includes(groupBy)) {
    return apiErrorResponse('Invalid groupBy parameter', 400)
  }

  try {
    // Parse dates
    const startDate = startDateParam ? new Date(startDateParam) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Default: 1 year ago
    const endDate = endDateParam ? new Date(endDateParam) : new Date()

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return apiErrorResponse('Invalid date format', 400)
    }

    if (startDate > endDate) {
      return apiErrorResponse('Start date must be before end date', 400)
    }

    // Build where clause for date filtering
    const where = {
      enrolledAt: {
        gte: startDate,
        lte: endDate,
      },
    }

    // Get total enrollments in period
    const totalEnrollments = await prisma.enrollment.count({ where })

    // Get enrollments by status
    const enrollmentsByStatus = await prisma.enrollment.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    })

    // Get enrollments by source
    const enrollmentsBySource = await prisma.enrollment.groupBy({
      by: ['source'],
      where,
      _count: {
        id: true,
      },
    })

    // Get enrollments over time
    const enrollmentsOverTime = await prisma.enrollment.findMany({
      where,
      select: {
        enrolledAt: true,
        status: true,
      },
      orderBy: {
        enrolledAt: 'asc',
      },
    })

    // Group enrollments by time period
    const timeSeriesData = groupEnrollmentsByPeriod(enrollmentsOverTime, groupBy)

    // Get top courses by enrollment count
    const topCourses = await prisma.enrollment.groupBy({
      by: ['courseId'],
      where,
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

    // Fetch course details for top courses
    const courseIds = topCourses.map((c) => c.courseId)
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
      },
    })

    const topCoursesWithDetails = topCourses.map((tc) => {
      const course = courses.find((c) => c.id === tc.courseId)
      return {
        courseId: tc.courseId,
        courseTitle: course?.title || 'Unknown',
        courseSlug: course?.slug || '',
        thumbnailUrl: course?.thumbnailUrl || '',
        enrollmentCount: tc._count.id,
      }
    })

    // Calculate growth rate
    const midPoint = new Date((startDate.getTime() + endDate.getTime()) / 2)
    const firstHalfCount = await prisma.enrollment.count({
      where: {
        enrolledAt: {
          gte: startDate,
          lt: midPoint,
        },
      },
    })
    const secondHalfCount = await prisma.enrollment.count({
      where: {
        enrolledAt: {
          gte: midPoint,
          lte: endDate,
        },
      },
    })

    const growthRate = firstHalfCount > 0
      ? ((secondHalfCount - firstHalfCount) / firstHalfCount) * 100
      : 0

    return apiSuccessResponse({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        groupBy,
      },
      summary: {
        totalEnrollments,
        growthRate: Math.round(growthRate * 100) / 100,
      },
      byStatus: enrollmentsByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
        percentage: Math.round((item._count.id / totalEnrollments) * 10000) / 100,
      })),
      bySource: enrollmentsBySource.map((item) => ({
        source: item.source,
        count: item._count.id,
        percentage: Math.round((item._count.id / totalEnrollments) * 10000) / 100,
      })),
      timeSeries: timeSeriesData,
      topCourses: topCoursesWithDetails,
    })
  } catch (error) {
    console.error('Error fetching enrollment analytics:', error)
    return apiErrorResponse('Failed to fetch enrollment analytics', 500)
  }
}

/**
 * Helper function to group enrollments by time period
 */
function groupEnrollmentsByPeriod(
  enrollments: Array<{ enrolledAt: Date; status: string }>,
  groupBy: string
): Array<{ period: string; count: number; active: number; completed: number }> {
  const grouped = new Map<string, { count: number; active: number; completed: number }>()

  enrollments.forEach((enrollment) => {
    const date = new Date(enrollment.enrolledAt)
    let periodKey: string

    switch (groupBy) {
      case 'day':
        periodKey = date.toISOString().split('T')[0]
        break
      case 'week':
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() - date.getDay())
        periodKey = weekStart.toISOString().split('T')[0]
        break
      case 'month':
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        periodKey = date.getFullYear().toString()
        break
      default:
        periodKey = date.toISOString().split('T')[0]
    }

    if (!grouped.has(periodKey)) {
      grouped.set(periodKey, { count: 0, active: 0, completed: 0 })
    }

    const stats = grouped.get(periodKey)!
    stats.count++
    if (enrollment.status === 'ACTIVE') stats.active++
    if (enrollment.status === 'COMPLETED') stats.completed++
  })

  return Array.from(grouped.entries())
    .map(([period, stats]) => ({
      period,
      ...stats,
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
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
          return handleGetEnrollmentAnalytics(req)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}
