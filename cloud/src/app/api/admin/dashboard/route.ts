import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current date and date 30 days ago
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Fetch stats
    const [
      totalStudents,
      totalCourses,
      activeEnrollments,
      totalRevenue,
      studentsLastMonth,
      coursesLastMonth,
      enrollmentsLastMonth,
      revenueLastMonth,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.course.count({ where: { published: true } }),
      prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
      prisma.purchase.aggregate({
        _sum: { amountCents: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.user.count({
        where: {
          role: 'STUDENT',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.course.count({
        where: {
          published: true,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.enrollment.count({
        where: {
          status: 'ACTIVE',
          enrolledAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.purchase.aggregate({
        _sum: { amountCents: true },
        where: {
          status: 'COMPLETED',
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ])

    // Calculate growth percentages
    const calculateGrowth = (current: number, lastMonth: number) => {
      if (current === 0) return 0
      const previous = current - lastMonth
      if (previous === 0) return 100
      return Math.round((lastMonth / previous) * 100)
    }

    const stats = {
      totalStudents,
      totalCourses,
      activeEnrollments,
      totalRevenue: (totalRevenue._sum.amountCents || 0) / 100, // Convert cents to currency units
      monthlyGrowth: {
        students: calculateGrowth(totalStudents, studentsLastMonth),
        courses: calculateGrowth(totalCourses, coursesLastMonth),
        enrollments: calculateGrowth(activeEnrollments, enrollmentsLastMonth),
        revenue: calculateGrowth(
          (totalRevenue._sum.amountCents || 0) / 100,
          (revenueLastMonth._sum.amountCents || 0) / 100
        ),
      },
    }

    // Get recent enrollments
    const recentEnrollments = await prisma.enrollment.findMany({
      take: 5,
      orderBy: { enrolledAt: 'desc' },
      include: {
        User: { select: { name: true, image: true } },
        Course: { select: { title: true } },
        Purchase: { select: { amountCents: true } },
      },
    })

    // Get top courses
    const topCourses = await prisma.course.findMany({
      take: 5,
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { Enrollment: true } },
      },
    })

    // Mock revenue data for chart (last 6 months)
    const revenueData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [45000, 52000, 48000, 61000, 58000, 67000],
          borderColor: 'rgb(20, 184, 166)',
          backgroundColor: 'rgba(20, 184, 166, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    }

    // Mock enrollment data for doughnut chart
    const enrollmentData = {
      labels: ['Cloud Computing', 'DevOps', 'Security', 'Networking', 'Other'],
      datasets: [
        {
          data: [35, 25, 20, 15, 5],
          backgroundColor: [
            'rgb(20, 184, 166)',
            'rgb(59, 130, 246)',
            'rgb(251, 146, 60)',
            'rgb(34, 197, 94)',
            'rgb(168, 85, 247)',
          ],
          borderWidth: 0,
        },
      ],
    }

    return NextResponse.json({
      stats,
      recentEnrollments: recentEnrollments.map((e) => ({
        id: e.id,
        studentName: e.User.name || 'Unknown',
        avatar: e.User.image || '/default-avatar.png',
        courseName: e.Course.title,
        amount: e.Purchase ? e.Purchase.amountCents / 100 : 0, // Convert cents to currency units
        date: e.enrolledAt,
      })),
      topCourses: topCourses.map((c, index) => ({
        id: c.id,
        title: c.title,
        thumbnail: c.thumbnailUrl || '/default-course.png',
        enrollments: c._count.Enrollment,
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
      })),
      revenueData,
      enrollmentData,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
