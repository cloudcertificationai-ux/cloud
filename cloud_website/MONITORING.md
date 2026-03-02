# Monitoring and Analytics System

This document describes the monitoring and analytics system for the VOD Media System.

## Overview

The monitoring system tracks:
- Transcode job execution (start, completion, failures)
- Playback session analytics (watch time, completion rates)
- API errors (4xx and 5xx responses)
- API performance (response times)
- Daily statistics aggregation

## Components

### 1. MonitoringService (`src/lib/monitoring.ts`)

Core service for logging and analytics operations.

**Methods:**
- `logTranscodeStart()` - Log when a transcode job starts
- `logTranscodeComplete()` - Log successful transcode completion
- `logTranscodeFailed()` - Log transcode failures with error details
- `recordPlaybackSession()` - Record playback session analytics
- `logAPIError()` - Log API errors (4xx/5xx)
- `trackAPIPerformance()` - Track API response times
- `aggregateDailyStatistics()` - Aggregate daily statistics

### 2. API Monitoring Middleware (`src/lib/api-monitoring.ts`)

Middleware for automatic API monitoring.

**Features:**
- Automatic request ID generation
- Error logging for 4xx/5xx responses
- Performance tracking for all requests
- Vercel Analytics integration

**Usage:**
```typescript
import { withAPIMonitoring } from '@/lib/api-monitoring';

export const POST = withAPIMonitoring(async (request) => {
  // Your handler logic
});
```

### 3. Database Models

**TranscodeJobLog:**
- Tracks transcode job lifecycle
- Stores duration, status, error details

**PlaybackSession:**
- Records watch time per session
- Tracks completion rates
- Links to user, media, lesson, course

**APIErrorLog:**
- Logs all 4xx and 5xx errors
- Includes request context and stack traces

**APIPerformanceLog:**
- Tracks response times per endpoint
- Enables performance analysis

**DailyStatistics:**
- Aggregated daily metrics
- Stores upload counts, transcode stats, watch time, API metrics

## Daily Statistics Aggregation

### Automated Execution

#### Option 1: Vercel Cron (Recommended for Vercel deployments)

Configured in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/daily-stats",
    "schedule": "0 0 * * *"
  }]
}
```

Set the `CRON_SECRET` environment variable for authentication.

#### Option 2: GitHub Actions

Workflow file: `.github/workflows/daily-stats.yml`

Runs daily at midnight UTC. Can also be triggered manually with a specific date.

Required secrets:
- `DATABASE_URL`
- `REDIS_URL`

#### Option 3: System Cron

Add to crontab:
```bash
0 0 * * * cd /path/to/anywheredoor && npm run aggregate-stats
```

### Manual Execution

#### Via npm script:
```bash
# Aggregate yesterday's stats
npm run aggregate-stats

# Aggregate specific date
npm run aggregate-stats 2024-02-14

# Aggregate date range
npm run aggregate-stats --range 2024-02-01 2024-02-14
```

#### Via API endpoint:
```bash
# Aggregate yesterday
curl -X GET https://your-domain.com/api/cron/daily-stats \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Aggregate specific date
curl -X POST https://your-domain.com/api/cron/daily-stats \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-02-14"}'

# Aggregate date range
curl -X POST https://your-domain.com/api/cron/daily-stats \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2024-02-01", "endDate": "2024-02-14"}'
```

## Environment Variables

Add to `.env`:
```bash
# Optional: Secret for authenticating cron requests
CRON_SECRET=your-secret-key-here
```

## Metrics Collected

### Transcode Metrics
- Total transcode jobs
- Successful transcodes
- Failed transcodes
- Average transcode duration
- Error details for failures

### Playback Metrics
- Total playback sessions
- Total watch time (seconds)
- Average completion rate (%)
- Per-user, per-media, per-course analytics

### API Metrics
- Total API requests
- Total API errors (4xx/5xx)
- Average response time (ms)
- Per-endpoint performance
- Error rates by endpoint

### Upload Metrics
- Total media uploads
- Upload success/failure rates

## Querying Statistics

### Get daily statistics:
```typescript
import { prisma } from '@/lib/db';

const stats = await prisma.dailyStatistics.findUnique({
  where: { date: new Date('2024-02-14') }
});
```

### Get date range:
```typescript
const stats = await prisma.dailyStatistics.findMany({
  where: {
    date: {
      gte: new Date('2024-02-01'),
      lte: new Date('2024-02-14')
    }
  },
  orderBy: { date: 'asc' }
});
```

### Get playback sessions for a user:
```typescript
const sessions = await prisma.playbackSession.findMany({
  where: { userId: 'user-id' },
  orderBy: { startedAt: 'desc' }
});
```

### Get API errors:
```typescript
const errors = await prisma.aPIErrorLog.findMany({
  where: {
    statusCode: { gte: 500 },
    timestamp: { gte: new Date('2024-02-14') }
  },
  orderBy: { timestamp: 'desc' }
});
```

## Vercel Analytics Integration

API performance is automatically tracked with Vercel Analytics when available.

Events tracked:
- `api_request` - All API requests with path, method, status, response time

## Best Practices

1. **Run aggregation daily** - Don't let data accumulate without aggregation
2. **Monitor aggregation failures** - Set up alerts for failed aggregations
3. **Archive old logs** - Consider archiving detailed logs after aggregation
4. **Use request IDs** - Always include request IDs for tracing
5. **Don't block on logging** - Logging failures shouldn't break main flows

## Troubleshooting

### Aggregation fails with timeout
- Increase database connection timeout
- Run aggregation during low-traffic periods
- Consider archiving old detailed logs

### Missing statistics
- Check that cron job is running
- Verify database connectivity
- Check for errors in cron job logs

### High API error rates
- Query `APIErrorLog` table for details
- Group by endpoint to identify problem areas
- Check error messages and stack traces

## Future Enhancements

- Real-time dashboards
- Alerting for anomalies
- Automated report generation
- Data retention policies
- Performance trend analysis
