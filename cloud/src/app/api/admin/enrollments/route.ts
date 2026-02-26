import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { createId } from '@paralleldrive/cuid2'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { studentId, courseId } = body

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Student ID and Course ID are required' },
        { status: 400 }
      )
    }

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId: courseId,
        },
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this course' },
        { status: 400 }
      )
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        id: createId(),
        User: { connect: { id: studentId } },
        Course: { connect: { id: courseId } },
        source: 'admin',
        status: 'ACTIVE',
      },
      include: {
        Course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        User: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'ENROLLMENT_CREATED',
        resourceType: 'Enrollment',
        resourceId: enrollment.id,
        details: {
          studentId,
          courseId,
          studentEmail: enrollment.User.email,
          courseTitle: enrollment.Course.title,
        },
      },
    })

    return NextResponse.json({
      enrollment,
      message: 'Enrollment created successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}
