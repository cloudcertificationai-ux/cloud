// src/lib/sync-monitor.ts
import { prisma } from './db'
import { SyncEvent } from './sync-service'

/**
 * Sync failure record
 */
export interface SyncFailure {
  id: string
  eventId: string
  eventType: string
  resourceId: string
  resourceType: string
  error: string
  attempts: number
  firstFailedAt: Date
  lastFailedAt: Date
  resolved: boolean
  resolvedAt?: Date
}

/**
 * Sync monitoring service
 */
export class SyncMonitor {
  /**
   * Log a sync failure
   */
  static async logFailure(event: SyncEvent, error: string): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: 'sync.failure',
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          details: {
            eventId: event.id,
            eventType: event.type,
            error,
            attempts: event.retryCount,
            timestamp: event.timestamp,
          },
        },
      })

      console.error('Sync failure logged:', {
        eventId: event.id,
        eventType: event.type,
        resourceId: event.resourceId,
        error,
        attempts: event.retryCount,
      })
    } catch (logError) {
      console.error('Failed to log sync failure:', logError)
    }
  }

  /**
   * Log a sync success after recovery
   */
  static async logRecovery(event: SyncEvent): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: 'sync.recovery',
          resourceType: event.resourceType,
          resourceId: event.resourceId,
          details: {
            eventId: event.id,
            eventType: event.type,
            attempts: event.retryCount,
            timestamp: event.timestamp,
          },
        },
      })

      console.log('Sync recovery logged:', {
        eventId: event.id,
        eventType: event.type,
        resourceId: event.resourceId,
        attempts: event.retryCount,
      })
    } catch (logError) {
      console.error('Failed to log sync recovery:', logError)
    }
  }

  /**
   * Get recent sync failures
   */
  static async getRecentFailures(limit: number = 50): Promise<any[]> {
    try {
      const failures = await prisma.auditLog.findMany({
        where: {
          action: 'sync.failure',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      })

      return failures
    } catch (error) {
      console.error('Failed to fetch sync failures:', error)
      return []
    }
  }

  /**
   * Get sync failure statistics
   */
  static async getFailureStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalFailures: number
    failuresByType: Record<string, number>
    failuresByResource: Record<string, number>
    averageRetries: number
  }> {
    try {
      const where: any = {
        action: 'sync.failure',
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }

      const failures = await prisma.auditLog.findMany({
        where,
        select: {
          details: true,
        },
      })

      const failuresByType: Record<string, number> = {}
      const failuresByResource: Record<string, number> = {}
      let totalRetries = 0

      failures.forEach((failure) => {
        const details = failure.details as any
        const eventType = details?.eventType || 'unknown'
        const resourceType = details?.resourceType || 'unknown'
        const attempts = details?.attempts || 0

        failuresByType[eventType] = (failuresByType[eventType] || 0) + 1
        failuresByResource[resourceType] = (failuresByResource[resourceType] || 0) + 1
        totalRetries += attempts
      })

      return {
        totalFailures: failures.length,
        failuresByType,
        failuresByResource,
        averageRetries: failures.length > 0 ? totalRetries / failures.length : 0,
      }
    } catch (error) {
      console.error('Failed to get failure stats:', error)
      return {
        totalFailures: 0,
        failuresByType: {},
        failuresByResource: {},
        averageRetries: 0,
      }
    }
  }

  /**
   * Alert on critical sync failures
   * This should be integrated with your alerting system (e.g., Sentry, PagerDuty)
   */
  static async alertOnCriticalFailure(event: SyncEvent, error: string): Promise<void> {
    // Log to console (in production, send to alerting service)
    console.error('CRITICAL SYNC FAILURE:', {
      eventId: event.id,
      eventType: event.type,
      resourceId: event.resourceId,
      resourceType: event.resourceType,
      error,
      attempts: event.retryCount,
      timestamp: event.timestamp,
    })

    // Log to audit log with high priority
    await this.logFailure(event, error)

    // TODO: Integrate with alerting service
    // Example: await sendToSentry(event, error)
    // Example: await sendToPagerDuty(event, error)
    // Example: await sendToSlack(event, error)
  }

  /**
   * Check sync health
   * Returns health status based on recent failures
   */
  static async checkSyncHealth(): Promise<{
    healthy: boolean
    failureRate: number
    recentFailures: number
    message: string
  }> {
    try {
      // Check failures in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

      const recentFailures = await prisma.auditLog.count({
        where: {
          action: 'sync.failure',
          createdAt: {
            gte: oneHourAgo,
          },
        },
      })

      const recentSuccesses = await prisma.auditLog.count({
        where: {
          action: {
            in: ['sync.enrollment.created', 'sync.enrollment.updated', 'sync.profile.updated'],
          },
          createdAt: {
            gte: oneHourAgo,
          },
        },
      })

      const total = recentFailures + recentSuccesses
      const failureRate = total > 0 ? recentFailures / total : 0

      // Consider unhealthy if failure rate > 10% or more than 10 failures in last hour
      const healthy = failureRate <= 0.1 && recentFailures <= 10

      return {
        healthy,
        failureRate,
        recentFailures,
        message: healthy
          ? 'Sync system is healthy'
          : `Sync system degraded: ${recentFailures} failures in last hour (${(failureRate * 100).toFixed(1)}% failure rate)`,
      }
    } catch (error) {
      console.error('Failed to check sync health:', error)
      return {
        healthy: false,
        failureRate: 1,
        recentFailures: 0,
        message: 'Unable to determine sync health',
      }
    }
  }
}

/**
 * Exponential backoff calculator
 */
export function calculateBackoff(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000
): number {
  const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs)
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay
  return Math.floor(delay + jitter)
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxAttempts - 1) {
        const delay = calculateBackoff(attempt, baseDelayMs)
        console.log(`Retry attempt ${attempt + 1}/${maxAttempts} after ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Retry failed')
}
