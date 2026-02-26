// src/lib/session-utils.ts
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import prisma from './db'

/**
 * Session configuration constants
 */
export const SESSION_CONFIG = {
  MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
  INACTIVITY_TIMEOUT: 2 * 60 * 60, // 2 hours in seconds
} as const

/**
 * Validates if a session is still active based on inactivity timeout
 * @param sessionId - The session ID to validate
 * @returns true if session is valid, false if expired due to inactivity
 */
export async function validateSessionActivity(sessionId: string): Promise<boolean> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { lastActivity: true, expires: true }
    })

    if (!session) {
      return false
    }

    // Check if session has expired
    if (session.expires < new Date()) {
      return false
    }

    // Check inactivity timeout
    const inactivityThreshold = new Date(Date.now() - SESSION_CONFIG.INACTIVITY_TIMEOUT * 1000)
    if (session.lastActivity < inactivityThreshold) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating session activity:', error)
    return false
  }
}

/**
 * Updates the lastActivity timestamp for a session
 * @param sessionToken - The session token to update
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
  try {
    await prisma.session.update({
      where: { sessionToken },
      data: { lastActivity: new Date() }
    })
  } catch (error) {
    console.error('Error updating session activity:', error)
  }
}

/**
 * Validates the current session and checks for inactivity
 * @returns Session data if valid, null if invalid or inactive
 */
export async function validateCurrentSession() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Get the most recent session for this user
  const dbSession = await prisma.session.findFirst({
    where: { userId: session.user.id },
    orderBy: { lastActivity: 'desc' }
  })

  if (!dbSession) {
    return null
  }

  // Validate session activity
  const isValid = await validateSessionActivity(dbSession.id)
  
  if (!isValid) {
    // Session is invalid due to inactivity or expiration
    return null
  }

  return session
}

/**
 * Invalidates all sessions for a user (used during logout)
 * @param userId - The user ID whose sessions should be invalidated
 */
export async function invalidateUserSessions(userId: string): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: { userId }
    })
  } catch (error) {
    console.error('Error invalidating user sessions:', error)
    throw error
  }
}

/**
 * Cleans up expired sessions from the database
 * This should be run periodically (e.g., via a cron job)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    })
    return result.count
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error)
    return 0
  }
}
