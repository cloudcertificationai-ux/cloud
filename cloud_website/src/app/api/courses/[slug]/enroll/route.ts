// src/app/api/courses/[slug]/enroll/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbDataService } from '@/data/db-data-service'
import prisma from '@/lib/db'
import { createApiResponse } from '@/lib/api-response'
import { SyncService } from '@/lib/sync-service'
import { logApiRequest } from '@/lib/audit-logger'

/**
 * POST /api/courses/:slug/enroll
 * Enroll a user in a course by slug
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { purchaseId } = body

    // Verify user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          requiresAuth: true,
          redirectTo: `/auth/signin?callbackUrl=/courses/${slug}`
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

    // Get course by slug
    const course = await prisma.course.findUnique({
      where: { slug },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await dbDataService.checkEnrollment(
      user.id,
      course.id
    )

    if (existingEnrollment) {
      return NextResponse.json(
        { 
          error: 'Already enrolled in this course',
          enrollment: existingEnrollment
        },
        { status: 400 }
      )
    }

    // If course is paid, verify purchase or create pending purchase
    if (course.priceCents > 0) {
      if (purchaseId) {
        // Verify purchase exists and belongs to user
        const purchase = await prisma.purchase.findUnique({
          where: { id: purchaseId },
        })

        if (!purchase) {
          return NextResponse.json(
            { error: 'Purchase not found' },
            { status: 404 }
          )
        }

        if (purchase.userId !== user.id) {
          return NextResponse.json(
            { error: 'Purchase does not belong to user' },
            { status: 403 }
          )
        }

        if (purchase.courseId !== course.id) {
          return NextResponse.json(
            { error: 'Purchase is for a different course' },
            { status: 400 }
          )
        }

        if (purchase.status !== 'COMPLETED') {
          return NextResponse.json(
            { error: 'Purchase is not completed' },
            { status: 400 }
          )
        }

        // Create enrollment linked to purchase
        const enrollment = await prisma.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id,
            source: 'purchase',
            status: 'ACTIVE',
            purchaseId: purchase.id,
          },
          include: {
            course: true,
          },
        })

        // Emit sync event
        await SyncService.emitEnrollmentEvent(
          'enrollment.created' as any,
          enrollment.id,
          enrollment
        ).catch((error) => {
          console.error('Failed to emit enrollment sync event:', error)
        })

        // Log enrollment creation
        await logApiRequest(
          request,
          user.id,
          'enrollment_created',
          'enrollment',
          enrollment.id,
          {
            courseId: course.id,
            courseSlug: slug,
            source: 'purchase',
            purchaseId,
          }
        ).catch((error) => {
          console.error('Failed to log enrollment creation:', error)
        })

        return createApiResponse({
          success: true,
          enrollment,
        })
      } else {
        // Create pending purchase
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

        return NextResponse.json({
          requiresPayment: true,
          purchaseId: purchase.id,
          amount: course.priceCents,
          currency: course.currency,
        })
      }
    }

    // Free course - create enrollment immediately with status ACTIVE
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        source: 'free',
        status: 'ACTIVE',
      },
      include: {
        course: true,
      },
    })

    // Emit sync event
    await SyncService.emitEnrollmentEvent(
      'enrollment.created' as any,
      enrollment.id,
      enrollment
    ).catch((error) => {
      console.error('Failed to emit enrollment sync event:', error)
    })

    // Log enrollment creation
    await logApiRequest(
      request,
      user.id,
      'enrollment_created',
      'enrollment',
      enrollment.id,
      {
        courseId: course.id,
        courseSlug: slug,
        source: 'free',
      }
    ).catch((error) => {
      console.error('Failed to log enrollment creation:', error)
    })

    return createApiResponse({
      success: true,
      enrollment,
    })
  } catch (error) {
    console.error('Enrollment error:', error)
    return NextResponse.json(
      { error: 'Failed to process enrollment' },
      { status: 500 }
    )
  }
}
