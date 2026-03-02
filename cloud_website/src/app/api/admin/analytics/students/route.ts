// src/app/api/admin/analytics/students/route.ts
import { NextRequest } from 'next/server'
import { withApiAuth, apiSuccessResponse, apiErrorResponse } from '@/lib/api-security'
import { withRateLimit } from '@/lib/rate-limiter'
import { withCors, ADMIN_API_CORS_CONFIG } from '@/lib/cors'
import { prisma } from '@/lib/db'

/**
 * GET /api/admin/analytics/students
 * Get student metrics and statistics
 * 
 * Query parameters:
 * - startDate: Start date for filtering (ISO 8601)
 * - endDate: End date for filtering (ISO 8601)
 */
async function handleGetStudentAnalytics(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')

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

    // Total students
    const totalStudents = await prisma.user.count()

    // New students in period
    const newStudents = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Active students (with at least one enrollment)
    const activeStudents = await prisma.user.count({
      where: {
        Enrollment: {
          some: {
            status: 'ACTIVE',
          },
        },
      },
    })

    // Students by role
    const studentsByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    })

    // Students with completed courses
    const studentsWithCompletedCourses = await prisma.user.count({
      where: {
        Enrollment: {
          some: {
            status: 'COMPLETED',
          },
        },
      },
    })

    // Average enrollments per student
    const enrollmentStats = await prisma.enrollment.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
    })

    const avgEnrollmentsPerStudent = enrollmentStats.length > 0
      ? enrollmentStats.reduce((sum, stat) => sum + stat._count.id, 0) / enrollmentStats.length
      : 0

    // Students with purchases
    const studentsWithPurchases = await prisma.user.count({
      where: {
        Purchase: {
          some: {
            status: 'COMPLETED',
          },
        },
      },
    })

    // Top students by enrollment count
    const topStudentsByEnrollments = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        _count: {
          select: {
            Enrollment: true,
          },
        },
      },
      orderBy: {
        Enrollment: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    // Top students by completed courses
    const topStudentsByCompletions = await prisma.user.findMany({
      where: {
        Enrollment: {
          some: {
            status: 'COMPLETED',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        Enrollment: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
          },
        },
      },
      take: 10,
    })

    const topStudentsByCompletionsFormatted = topStudentsByCompletions
      .map((student) => ({
        id: student.id,
        email: student.email,
        name: student.name,
        image: student.image,
        completedCourses: student.Enrollment.length,
      }))
      .sort((a, b) => b.completedCourses - a.completedCourses)

    // Student registration over time
    const studentsOverTime = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group by month
    const registrationsByMonth = groupStudentsByMonth(studentsOverTime)

    // Calculate retention rate (students with multiple enrollments)
    const studentsWithMultipleEnrollments = enrollmentStats.filter(
      (stat) => stat._count.id > 1
    ).length
    const retentionRate = totalStudents > 0
      ? (studentsWithMultipleEnrollments / totalStudents) * 100
      : 0

    // Calculate engagement rate (active students / total students)
    const engagementRate = totalStudents > 0
      ? (activeStudents / totalStudents) * 100
      : 0

    return apiSuccessResponse({
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalStudents,
        newStudents,
        activeStudents,
        studentsWithCompletedCourses,
        studentsWithPurchases,
        avgEnrollmentsPerStudent: Math.round(avgEnrollmentsPerStudent * 100) / 100,
        retentionRate: Math.round(retentionRate * 100) / 100,
        engagementRate: Math.round(engagementRate * 100) / 100,
      },
      byRole: studentsByRole.map((item) => ({
        role: item.role,
        count: item._count.id,
        percentage: Math.round((item._count.id / totalStudents) * 10000) / 100,
      })),
      topStudents: {
        byEnrollments: topStudentsByEnrollments.map((student) => ({
          id: student.id,
          email: student.email,
          name: student.name,
          image: student.image,
          enrollmentCount: student._count.Enrollment,
        })),
        byCompletions: topStudentsByCompletionsFormatted,
      },
      registrationTrend: registrationsByMonth,
    })
  } catch (error) {
    console.error('Error fetching student analytics:', error)
    return apiErrorResponse('Failed to fetch student analytics', 500)
  }
}

/**
 * Helper function to group students by month
 */
function groupStudentsByMonth(
  students: Array<{ createdAt: Date }>
): Array<{ month: string; count: number }> {
  const grouped = new Map<string, number>()

  students.forEach((student) => {
    const date = new Date(student.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    grouped.set(monthKey, (grouped.get(monthKey) || 0) + 1)
  })

  return Array.from(grouped.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
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
          return handleGetStudentAnalytics(req)
        })
      ),
    ADMIN_API_CORS_CONFIG
  )(request)
}
