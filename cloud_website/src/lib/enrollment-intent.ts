// src/lib/enrollment-intent.ts
import { cookies } from 'next/headers'

const ENROLLMENT_INTENT_COOKIE = 'enrollment_intent'
const COOKIE_MAX_AGE = 60 * 60 // 1 hour

export interface EnrollmentIntent {
  courseId: string
  courseSlug: string
  timestamp: number
}

/**
 * Store enrollment intent in a cookie before redirecting to login
 * @param courseId - The ID of the course the user wants to enroll in
 * @param courseSlug - The slug of the course for redirect purposes
 */
export async function setEnrollmentIntent(courseId: string, courseSlug: string): Promise<void> {
  const intent: EnrollmentIntent = {
    courseId,
    courseSlug,
    timestamp: Date.now()
  }

  const cookieStore = await cookies()
  cookieStore.set(ENROLLMENT_INTENT_COOKIE, JSON.stringify(intent), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  })
}

/**
 * Retrieve enrollment intent from cookie
 * @returns EnrollmentIntent object if exists and valid, null otherwise
 */
export async function getEnrollmentIntent(): Promise<EnrollmentIntent | null> {
  const cookieStore = await cookies()
  const intentCookie = cookieStore.get(ENROLLMENT_INTENT_COOKIE)

  if (!intentCookie?.value) {
    return null
  }

  try {
    const intent: EnrollmentIntent = JSON.parse(intentCookie.value)
    
    // Check if intent is still valid (not expired)
    const now = Date.now()
    const age = now - intent.timestamp
    
    if (age > COOKIE_MAX_AGE * 1000) {
      // Intent has expired, clear it
      await clearEnrollmentIntent()
      return null
    }
    
    return intent
  } catch (error) {
    console.error('Failed to parse enrollment intent:', error)
    await clearEnrollmentIntent()
    return null
  }
}

/**
 * Clear enrollment intent cookie
 */
export async function clearEnrollmentIntent(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ENROLLMENT_INTENT_COOKIE)
}

/**
 * Check if there's a pending enrollment intent and return it
 * This is typically called after successful authentication
 */
export async function hasPendingEnrollmentIntent(): Promise<boolean> {
  const intent = await getEnrollmentIntent()
  return intent !== null
}
