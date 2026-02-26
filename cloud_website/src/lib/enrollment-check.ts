// src/lib/enrollment-check.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbDataService } from '@/data/db-data-service'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'
import { createAuditLog } from '@/lib/audit-logger'
import { headers } from 'next/headers'

/**
 * Verifies if the current user has an active enrollment for the specified course
 * @param courseId - The ID of the course to check enrollment for
 * @returns Object containing enrollment status and user information
 */
export async function checkCourseEnrollment(courseId: string) {
  const session = await getServerSession(authOptions)
  
  // User is not authenticated
  if (!session?.user?.email) {
    return {
      hasAccess: false,
      isAuthenticated: false,
      enrollment: null,
      user: null,
      reason: 'not_authenticated'
    }
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return {
      hasAccess: false,
      isAuthenticated: true,
      enrollment: null,
      user: null,
      reason: 'user_not_found'
    }
  }

  // Check for active enrollment
  const enrollment = await dbDataService.checkEnrollment(user.id, courseId)

  if (!enrollment) {
    return {
      hasAccess: false,
      isAuthenticated: true,
      enrollment: null,
      user,
      reason: 'not_enrolled'
    }
  }

  // Check if enrollment is active
  if (enrollment.status !== 'ACTIVE') {
    return {
      hasAccess: false,
      isAuthenticated: true,
      enrollment,
      user,
      reason: 'enrollment_inactive'
    }
  }

  // Update last accessed time
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { lastAccessedAt: new Date() }
  })

  // Log course access for audit trail
  try {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0].trim() || 
                      headersList.get('x-real-ip') || 
                      undefined
    const userAgent = headersList.get('user-agent') || undefined

    await createAuditLog({
      userId: user.id,
      action: 'course_access',
      resourceType: 'course',
      resourceId: courseId,
      details: {
        enrollmentId: enrollment.id,
      },
      ipAddress,
      userAgent,
    })
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('Failed to log course access:', error)
  }

  return {
    hasAccess: true,
    isAuthenticated: true,
    enrollment,
    user,
    reason: null
  }
}

/**
 * Middleware function to protect course content pages
 * Redirects to appropriate page if user doesn't have access
 * @param courseId - The ID of the course to check enrollment for
 * @param courseSlug - The slug of the course for redirect purposes
 */
export async function requireCourseEnrollment(courseId: string, courseSlug: string) {
  const accessCheck = await checkCourseEnrollment(courseId)

  if (!accessCheck.hasAccess) {
    if (!accessCheck.isAuthenticated) {
      // Redirect to login with return URL
      redirect(`/auth/signin?callbackUrl=/courses/${courseSlug}`)
    } else if (accessCheck.reason === 'not_enrolled') {
      // Redirect to course page with enrollment prompt
      redirect(`/courses/${courseSlug}?enroll=true`)
    } else if (accessCheck.reason === 'enrollment_inactive') {
      // Redirect to course page with inactive enrollment message
      redirect(`/courses/${courseSlug}?status=inactive`)
    } else {
      // Generic error - redirect to course page
      redirect(`/courses/${courseSlug}`)
    }
  }

  return accessCheck
}

/**
 * Check if user is enrolled in a course (for UI display purposes)
 * Does not redirect, just returns enrollment status
 * @param courseId - The ID of the course to check enrollment for
 * @returns Enrollment object if enrolled, null otherwise
 */
export async function getUserCourseEnrollment(courseId: string) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return null
  }

  return await dbDataService.checkEnrollment(user.id, courseId)
}
