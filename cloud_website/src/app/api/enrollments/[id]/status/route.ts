// src/app/api/enrollments/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { createApiResponse } from '@/lib/api-response'
import { SyncService } from '@/lib/sync-service'
import { logApiRequest } from '@/lib/audit-logger'

/**
 * PUT /api/enrollments/:id/status
 * Update enrollment status (CANCELLED, REFUNDED, COMPLETED)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status
    const validStatuses = ['CANCELLED', 'REFUNDED', 'COMPLETED', 'ACTIVE']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status',
          validStatuses 
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: true,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      )
    }

    // Check if user owns this enrollment or is admin
    if (enrollment.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to update this enrollment' },
        { status: 403 }
      )
    }

    // Update enrollment status
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        status,
      },
      include: {
        course: true,
      },
    })

    // Emit sync event for enrollment status change
    await SyncService.emitEnrollmentEvent(
      'enrollment.updated' as any,
      updatedEnrollment.id,
      updatedEnrollment
    ).catch((error) => {
      console.error('Failed to emit enrollment sync event:', error)
    })

    // Log enrollment status change
    await logApiRequest(
      request,
      user.id,
      'enrollment_status_updated',
      'enrollment',
      enrollment.id,
      {
        courseId: enrollment.courseId,
        courseSlug: enrollment.course.slug,
        oldStatus: enrollment.status,
        newStatus: status,
      }
    ).catch((error) => {
      console.error('Failed to log enrollment status update:', error)
    })

    return createApiResponse({
      success: true,
      enrollment: updatedEnrollment,
      message: `Enrollment status updated to ${status}`,
    })
  } catch (error) {
    console.error('Error updating enrollment status:', error)
    return NextResponse.json(
      { error: 'Failed to update enrollment status' },
      { status: 500 }
    )
  }
}
