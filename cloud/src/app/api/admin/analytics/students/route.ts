import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build date filter
    const dateFilter = startDate && endDate
      ? {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }
      : {}

    // Get total students
    const totalStudents = await prisma.user.count({
      where: {
        role: 'STUDENT',
        ...dateFilter,
      },
    })

    // Get active students (logged in within last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const activeStudents = await prisma.user.count({
      where: {
        role: 'STUDENT',
        lastLoginAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    // Get new students this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const newStudentsThisMonth = await prisma.user.count({
      where: {
        role: 'STUDENT',
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    // Get students with enrollments
    const studentsWithEnrollments = await prisma.user.count({
      where: {
        role: 'STUDENT',
        Enrollment: {
          some: {},
        },
      },
    })

    // Get students with purchases
    const studentsWithPurchases = await prisma.user.count({
      where: {
        role: 'STUDENT',
        Purchase: {
          some: {
            status: 'COMPLETED',
          },
        },
      },
    })

    // Get growth data (last 12 months)
    const growthData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      date.setDate(1)
      date.setHours(0, 0, 0, 0)

      const nextMonth = new Date(date)
      nextMonth.setMonth(nextMonth.getMonth() + 1)

      const count = await prisma.user.count({
        where: {
          role: 'STUDENT',
          createdAt: {
            gte: date,
            lt: nextMonth,
          },
        },
      })

      growthData.push({
        month: date.toISOString().slice(0, 7), // YYYY-MM format
        count,
      })
    }

    return NextResponse.json({
      totalStudents,
      activeStudents,
      newStudentsThisMonth,
      studentsWithEnrollments,
      studentsWithPurchases,
      growthData,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching student analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student analytics' },
      { status: 500 }
    )
  }
}
