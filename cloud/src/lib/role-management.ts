// src/lib/role-management.ts
import prisma from '@/lib/db'
import { UserRole } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'

/**
 * Assign a role to a user
 */
export async function assignRole(userId: string, role: UserRole): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    })

    // Create audit log for role assignment
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId,
        action: 'ROLE_ASSIGNED',
        resourceType: 'User',
        resourceId: userId,
        details: {
          newRole: role
        }
      }
    })

    console.log(`Role ${role} assigned to user ${userId}`)
  } catch (error) {
    console.error('Error assigning role:', error)
    throw new Error('Failed to assign role')
  }
}

/**
 * Check if a user has a specific role
 */
export async function hasRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    return user?.role === role
  } catch (error) {
    console.error('Error checking user role:', error)
    return false
  }
}

/**
 * Check if a user is an admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return hasRole(userId, 'ADMIN')
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    return user?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Get all users with a specific role
 */
export async function getUsersByRole(role: UserRole) {
  try {
    return await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Error getting users by role:', error)
    return []
  }
}

/**
 * Promote a user to admin
 */
export async function promoteToAdmin(userId: string, promotedBy?: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' }
    })

    // Create audit log for promotion
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: promotedBy || userId,
        action: 'USER_PROMOTED_TO_ADMIN',
        resourceType: 'User',
        resourceId: userId,
        details: {
          targetUserId: userId,
          promotedBy: promotedBy || 'system'
        }
      }
    })

    console.log(`User ${userId} promoted to ADMIN`)
  } catch (error) {
    console.error('Error promoting user to admin:', error)
    throw new Error('Failed to promote user to admin')
  }
}

/**
 * Demote an admin to student
 */
export async function demoteFromAdmin(userId: string, demotedBy?: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'STUDENT' }
    })

    // Create audit log for demotion
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: demotedBy || userId,
        action: 'ADMIN_DEMOTED',
        resourceType: 'User',
        resourceId: userId,
        details: {
          targetUserId: userId,
          demotedBy: demotedBy || 'system'
        }
      }
    })

    console.log(`User ${userId} demoted from ADMIN`)
  } catch (error) {
    console.error('Error demoting admin:', error)
    throw new Error('Failed to demote admin')
  }
}

/**
 * Verify admin access for API routes
 */
export async function verifyAdminAccess(userId: string): Promise<boolean> {
  const role = await getUserRole(userId)
  return role === 'ADMIN'
}
