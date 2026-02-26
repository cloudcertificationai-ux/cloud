// src/app/api/courses/[slug]/access/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbDataService } from '@/data/db-data-service'
import prisma from '@/lib/db'
import { createApiResponse } from '@/lib/api-response'

/**
 * GET /api/courses/:slug/access
 * Check if user has access to a course
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get course by slug
    const course = await prisma.course.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return createApiResponse({
        hasAccess: false,
        reason: 'not_authenticated',
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
        },
      })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return createApiResponse({
        hasAccess: false,
        reason: 'user_not_found',
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
        },
      })
    }

    // Check if user has active enrollment
    const enrollment = await dbDataService.checkEnrollment(user.id, course.id)

    if (!enrollment) {
      return createApiResponse({
        hasAccess: false,
        reason: 'not_enrolled',
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
        },
      })
    }

    // Check enrollment status
    if (enrollment.status !== 'ACTIVE') {
      return createApiResponse({
        hasAccess: false,
        reason: 'enrollment_not_active',
        enrollmentStatus: enrollment.status,
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
        },
        enrollment: {
          id: enrollment.id,
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
          completionPercentage: enrollment.completionPercentage,
        },
      })
    }

    // User has active enrollment
    return createApiResponse({
      hasAccess: true,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
      },
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        completionPercentage: enrollment.completionPercentage,
        source: enrollment.source,
      },
    })
  } catch (error) {
    console.error('Access check error:', error)
    return NextResponse.json(
      { error: 'Failed to check course access' },
      { status: 500 }
    )
  }
}
