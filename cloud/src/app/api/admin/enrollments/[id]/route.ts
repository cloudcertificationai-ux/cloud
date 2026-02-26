import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { createId } from '@paralleldrive/cuid2'

export async function DELETE(
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

    const { id: enrollmentId } = await params

    // Get enrollment details before deleting
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
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
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: session.user.id,
        action: 'ENROLLMENT_DELETED',
        resourceType: 'Enrollment',
        resourceId: enrollmentId,
        details: {
          studentId: enrollment.userId,
          studentEmail: enrollment.User.email,
          courseId: enrollment.courseId,
          courseTitle: enrollment.Course.title,
        },
      },
    })

    return NextResponse.json({
      message: 'Enrollment deleted successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to delete enrollment' },
      { status: 500 }
    )
  }
}
