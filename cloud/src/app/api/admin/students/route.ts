import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { createId } from '@paralleldrive/cuid2'

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build where clause for search
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
          role: 'STUDENT' as const, // Only show students, not admins
        }
      : {
          role: 'STUDENT' as const,
        }

    // Get total count
    const total = await prisma.user.count({ where })

    // Get students with pagination
    const students = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
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
            Enrollment: true,
            Purchase: true,
          },
        },
      },
    })

    // Calculate total pages
    const totalPages = Math.ceil(total / limit)

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'STUDENTS_LIST_VIEWED',
        resourceType: 'User',
        resourceId: session.user.id,
        details: {
          page,
          limit,
          search,
          total,
        },
      },
    })

    return NextResponse.json({
      students,
      total,
      page,
      totalPages,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}
