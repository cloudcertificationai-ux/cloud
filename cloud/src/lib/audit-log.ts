// src/lib/audit-log.ts
import { createId } from '@paralleldrive/cuid2'
import prisma from '@/lib/db'

export interface CreateAuditLogParams {
  userId: string
  action: string
  resourceType: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Create an audit log entry with auto-generated ID
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        id: createId(),
        userId: params.userId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        details: params.details,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit log failures shouldn't break the main operation
  }
}
