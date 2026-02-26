import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { createId } from '@paralleldrive/cuid2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: studentId } = await params

    // Get student details
    const student = await prisma.user.findUnique({
      where: { id: studentId },
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
        CourseProgress: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 10,
        },
        Review: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'STUDENT_DETAIL_VIEWED',
        resourceType: 'User',
        resourceId: studentId,
        details: {
          studentEmail: student.email,
        },
      },
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student details' },
      { status: 500 }
    )
  }
}
