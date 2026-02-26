// src/app/api/cron/daily-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MonitoringService } from '@/lib/monitoring';

/**
 * Cron job endpoint for daily statistics aggregation
 * 
 * Requirement 17.5: Aggregate daily statistics for uploads, transcodes, sessions, watch time
 * 
 * This endpoint should be called daily by a cron service (e.g., Vercel Cron, GitHub Actions)
 * 
 * Vercel Cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-stats",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a trusted source (Vercel Cron or authorized service)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          error: true,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Get the date to aggregate (default to yesterday)
    const dateParam = request.nextUrl.searchParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    
    // If no date specified, aggregate yesterday's data
    if (!dateParam) {
      targetDate.setDate(targetDate.getDate() - 1);
    }

    console.log(`[Cron] Aggregating daily statistics for ${targetDate.toISOString().split('T')[0]}`);

    // Aggregate statistics
    const statistics = await MonitoringService.aggregateDailyStatistics(targetDate);

    console.log(`[Cron] Successfully aggregated daily statistics:`, {
      date: targetDate.toISOString().split('T')[0],
      totalUploads: statistics.totalUploads,
      totalTranscodes: statistics.totalTranscodes,
      totalPlaybackSessions: statistics.totalPlaybackSessions,
      totalWatchTime: statistics.totalWatchTime,
    });

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      statistics,
    });
  } catch (error) {
    console.error('[Cron] Failed to aggregate daily statistics:', error);
    
    return NextResponse.json(
      {
        error: true,
        message: 'Failed to aggregate daily statistics',
        code: 'AGGREGATION_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual triggering (admin use)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          error: true,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { date, startDate, endDate } = body;

    // Aggregate for a single date
    if (date) {
      const targetDate = new Date(date);
      const statistics = await MonitoringService.aggregateDailyStatistics(targetDate);

      return NextResponse.json({
        success: true,
        date: targetDate.toISOString().split('T')[0],
        statistics,
      });
    }

    // Aggregate for a date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const results = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const statistics = await MonitoringService.aggregateDailyStatistics(new Date(d));
        results.push({
          date: new Date(d).toISOString().split('T')[0],
          statistics,
        });
      }

      return NextResponse.json({
        success: true,
        count: results.length,
        results,
      });
    }

    return NextResponse.json(
      {
        error: true,
        message: 'Either date or startDate/endDate must be provided',
        code: 'INVALID_REQUEST',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Cron] Failed to aggregate daily statistics:', error);
    
    return NextResponse.json(
      {
        error: true,
        message: 'Failed to aggregate daily statistics',
        code: 'AGGREGATION_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
