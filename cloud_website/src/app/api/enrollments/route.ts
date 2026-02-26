// src/app/api/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbDataService } from '@/data/db-data-service'
import { clearEnrollmentIntent } from '@/lib/enrollment-intent'
import prisma from '@/lib/db'
import { createApiResponse, formatEnrollmentWithTimestamps } from '@/lib/api-response'
import { SyncService } from '@/lib/sync-service'
import { logApiRequest } from '@/lib/audit-logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { courseId, courseSlug } = body

    // Validate courseId
    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json(
        { error: 'Valid course ID is required' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)
    
    // If user is not authenticated, return error
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          requiresAuth: true,
          redirectTo: `/auth/signin?callbackUrl=/courses/${courseSlug || courseId}`
        },
        { status: 401 }
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

    // Check if already enrolled
    const existingEnrollment = await dbDataService.checkEnrollment(
      user.id,
      courseId
    )

    if (existingEnrollment) {
      // Clear enrollment intent since user is already enrolled
      await clearEnrollmentIntent()
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      )
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // If course is paid, create pending purchase
    if (course.priceCents > 0) {
      const purchase = await prisma.purchase.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amountCents: course.priceCents,
          currency: course.currency,
          provider: 'stripe',
          status: 'PENDING',
        },
      })

      // Clear enrollment intent - will be handled by payment webhook
      await clearEnrollmentIntent()

      return NextResponse.json({
        requiresPayment: true,
        purchaseId: purchase.id,
        amount: course.priceCents,
        currency: course.currency,
      })
    }

    // Free course - create enrollment immediately
    const enrollment = await dbDataService.createEnrollment(
      user.id,
      courseId,
      'free'
    )

    // Clear enrollment intent after successful enrollment
    await clearEnrollmentIntent()

    // Emit sync event for enrollment creation
    await SyncService.emitEnrollmentEvent(
      'enrollment.created' as any,
      enrollment.id,
      enrollment
    ).catch((error) => {
      console.error('Failed to emit enrollment sync event:', error)
    })

    // Log enrollment creation for audit trail
    await logApiRequest(
      request,
      user.id,
      'enrollment_created',
      'enrollment',
      enrollment.id,
      {
        courseId,
        source: 'free',
      }
    ).catch((error) => {
      console.error('Failed to log enrollment creation:', error)
    })

    // Format enrollment with timestamps
    const formattedEnrollment = formatEnrollmentWithTimestamps(enrollment)

    return createApiResponse({
      success: true,
      enrollment: formattedEnrollment,
    })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Failed to process enrollment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const enrollments = await dbDataService.getUserEnrollments(user.id)

    // Format enrollments with timestamps
    const formattedEnrollments = enrollments.map(formatEnrollmentWithTimestamps)

    return createApiResponse(formattedEnrollments)
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    )
  }
}
