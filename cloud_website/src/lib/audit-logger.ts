// src/lib/audit-logger.ts
import { prisma } from './db'
import { NextRequest } from 'next/server'

export interface AuditLogEntry {
  userId?: string
  action: string
  resourceType: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export interface AuditLogQuery {
  userId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        details: entry.details as any,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging should not break the main flow
  }
}

/**
 * Extract IP address from request
 */
export function getIpAddress(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  return undefined
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined
}

/**
 * Log an API request
 */
export async function logApiRequest(
  request: NextRequest,
  userId?: string,
  action?: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  const ipAddress = getIpAddress(request)
  const userAgent = getUserAgent(request)
  
  await createAuditLog({
    userId,
    action: action || `${request.method} ${request.nextUrl.pathname}`,
    resourceType: resourceType || 'api',
    resourceId,
    details,
    ipAddress,
    userAgent,
  })
}

/**
 * Log course access
 */
export async function logCourseAccess(
  userId: string,
  courseId: string,
  request: NextRequest
): Promise<void> {
  const ipAddress = getIpAddress(request)
  const userAgent = getUserAgent(request)
  
  await createAuditLog({
    userId,
    action: 'course_access',
    resourceType: 'course',
    resourceId: courseId,
    ipAddress,
    userAgent,
  })
}

/**
 * Log admin action
 */
export async function logAdminAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>,
  request?: NextRequest
): Promise<void> {
  const ipAddress = request ? getIpAddress(request) : undefined
  const userAgent = request ? getUserAgent(request) : undefined
  
  await createAuditLog({
    userId,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress,
    userAgent,
  })
}

/**
 * Query audit logs with filtering
 */
export async function queryAuditLogs(query: AuditLogQuery) {
  const where: any = {}
  
  if (query.userId) {
    where.userId = query.userId
  }
  
  if (query.action) {
    where.action = {
      contains: query.action,
      mode: 'insensitive',
    }
  }
  
  if (query.resourceType) {
    where.resourceType = query.resourceType
  }
  
  if (query.resourceId) {
    where.resourceId = query.resourceId
  }
  
  if (query.startDate || query.endDate) {
    where.createdAt = {}
    if (query.startDate) {
      where.createdAt.gte = query.startDate
    }
    if (query.endDate) {
      where.createdAt.lte = query.endDate
    }
  }
  
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: query.limit || 50,
      skip: query.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ])
  
  return {
    logs,
    total,
    limit: query.limit || 50,
    offset: query.offset || 0,
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  return queryAuditLogs({ userId, limit, offset })
}

/**
 * Get audit logs for a specific resource
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 50,
  offset: number = 0
) {
  return queryAuditLogs({ resourceType, resourceId, limit, offset })
}
