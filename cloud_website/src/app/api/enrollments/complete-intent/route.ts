// src/app/api/enrollments/complete-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getEnrollmentIntent, clearEnrollmentIntent } from '@/lib/enrollment-intent'
import { dbDataService } from '@/data/db-data-service'
import prisma from '@/lib/db'

/**
 * Complete a pending enrollment intent after user authentication
 * This endpoint is called after successful login to check if there's a pending enrollment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check for pending enrollment intent
    const intent = await getEnrollmentIntent()
    
    if (!intent) {
      return NextResponse.json({
        success: false,
        message: 'No pending enrollment intent found'
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      await clearEnrollmentIntent()
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await dbDataService.checkEnrollment(
      user.id,
      intent.courseId
    )

    if (existingEnrollment) {
      await clearEnrollmentIntent()
      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        enrollment: existingEnrollment,
        redirectTo: `/courses/${intent.courseSlug}`
      })
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: intent.courseId },
    })

    if (!course) {
      await clearEnrollmentIntent()
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // If course is paid, create pending purchase and redirect to payment
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

      // Don't clear intent yet - will be cleared after payment
      return NextResponse.json({
        success: true,
        requiresPayment: true,
        purchaseId: purchase.id,
        amount: course.priceCents,
        currency: course.currency,
        redirectTo: `/courses/${intent.courseSlug}?payment=required&purchaseId=${purchase.id}`
      })
    }

    // Free course - create enrollment immediately
    const enrollment = await dbDataService.createEnrollment(
      user.id,
      intent.courseId,
      'free'
    )

    // Clear the enrollment intent
    await clearEnrollmentIntent()

    return NextResponse.json({
      success: true,
      enrollment,
      redirectTo: `/dashboard?enrolled=${course.slug}`
    })
  } catch (error) {
    console.error('Error completing enrollment intent:', error)
    return NextResponse.json(
      { error: 'Failed to complete enrollment' },
      { status: 500 }
    )
  }
}

/**
 * Check if there's a pending enrollment intent
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ hasPendingIntent: false })
    }

    const intent = await getEnrollmentIntent()
    
    return NextResponse.json({
      hasPendingIntent: !!intent,
      intent: intent || null
    })
  } catch (error) {
    console.error('Error checking enrollment intent:', error)
    return NextResponse.json(
      { error: 'Failed to check enrollment intent' },
      { status: 500 }
    )
  }
}
