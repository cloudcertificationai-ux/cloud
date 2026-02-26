// src/app/api/sync/status/route.ts
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  handleApiError,
  AuthorizationError,
  SuccessResponseBuilder,
} from '@/lib/api-errors'
import { SyncService } from '@/lib/sync-service'

/**
 * GET /api/sync/status
 * Get synchronization queue statistics
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

    // Get queue statistics
    const stats = SyncService.getQueueStats()

    return SuccessResponseBuilder.success({
      queue: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
