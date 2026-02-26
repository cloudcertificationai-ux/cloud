// src/app/api/sync/health/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  handleApiError,
  AuthorizationError,
  SuccessResponseBuilder,
} from '@/lib/api-errors'
import { SyncMonitor } from '@/lib/sync-monitor'
import { SyncService } from '@/lib/sync-service'

/**
 * GET /api/sync/health
 * Get synchronization system health status
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new AuthorizationError('Authentication required')
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      throw new AuthorizationError('Admin access required')
    }

    // Get health status
    const health = await SyncMonitor.checkSyncHealth()

    // Get queue statistics
    const queueStats = SyncService.getQueueStats()

    // Get recent failures
    const recentFailures = await SyncMonitor.getRecentFailures(10)

    // Get failure statistics
    const failureStats = await SyncMonitor.getFailureStats(
      new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    )

    return SuccessResponseBuilder.success({
      health,
      queue: queueStats,
      recentFailures,
      failureStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
