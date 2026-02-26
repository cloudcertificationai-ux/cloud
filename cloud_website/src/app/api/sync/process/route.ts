// src/app/api/sync/process/route.ts
import { NextRequest } from 'next/server'
import {
  handleApiError,
  AuthenticationError,
  SuccessResponseBuilder,
} from '@/lib/api-errors'
import { SyncService } from '@/lib/sync-service'

/**
 * POST /api/sync/process
 * Manually trigger sync queue processing
 * Should be called by a cron job or background worker
 * Requires internal API key or cron secret
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for internal calls
    const cronSecret = request.headers.get('x-cron-secret')
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret) {
      throw new AuthenticationError('Cron secret not configured')
    }

    if (cronSecret !== expectedSecret) {
      throw new AuthenticationError('Invalid cron secret')
    }

    // Process sync queue
    await SyncService.processQueue()

    // Get updated statistics
    const stats = SyncService.getQueueStats()

    return SuccessResponseBuilder.success({
      message: 'Sync queue processed successfully',
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
