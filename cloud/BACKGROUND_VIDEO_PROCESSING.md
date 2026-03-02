# Background Video Processing

## Overview

Video processing now runs in the background using BullMQ job queues. Users can continue working while videos are being transcoded to HLS format.

## What Changed

### 1. Dashboard API Fix
Fixed Prisma relation names in `/api/admin/dashboard`:
- Changed `user` → `User`
- Changed `course` → `Course`  
- Changed `purchase` → `Purchase`

### 2. Background Job System
- Videos are queued for processing instead of blocking the upload
- Job status can be polled via API
- Progress updates available during processing

### 3. New API Endpoint
**GET** `/api/admin/media/jobs?mediaId={id}`

Returns job status:
```json
{
  "mediaId": "xxx",
  "status": "PROCESSING",
  "fileName": "video.mp4",
  "jobId": "123",
  "jobState": "active",
  "progress": 45,
  "manifestUrl": null,
  "thumbnails": []
}
```

Status values:
- `UPLOADED` - File uploaded, not yet processing
- `PROCESSING` - Currently transcoding
- `READY` - Processing complete, ready to use
- `FAILED` - Processing failed

## Usage

### In React Components

```tsx
import { MediaProcessingStatus } from '@/components/MediaProcessingStatus';

function MyComponent() {
  const [mediaId, setMediaId] = useState<string | null>(null);

  return (
    <div>
      {mediaId && (
        <MediaProcessingStatus
          mediaId={mediaId}
          fileName="my-video.mp4"
          onComplete={() => {
            console.log('Processing complete!');
            // Refresh your media list or update UI
          }}
        />
      )}
    </div>
  );
}
```

### Using the Hook Directly

```tsx
import { useMediaJobStatus } from '@/hooks/useMediaJobStatus';

function MyComponent() {
  const { data, isLoading, error, refetch } = useMediaJobStatus({
    mediaId: 'media-id-here',
    enabled: true,
    pollInterval: 3000, // Poll every 3 seconds
    onComplete: (data) => {
      console.log('Done!', data);
    },
    onError: (error) => {
      console.error('Failed:', error);
    },
  });

  return (
    <div>
      {data?.status === 'PROCESSING' && (
        <p>Progress: {data.progress}%</p>
      )}
    </div>
  );
}
```

## Benefits

1. **Non-blocking**: Users can continue working while videos process
2. **Progress tracking**: Real-time progress updates
3. **Resilient**: Jobs retry automatically on failure
4. **Scalable**: Multiple videos can process simultaneously

## Requirements

- Redis server running (for BullMQ)
- Transcode worker running (see `anywheredoor/src/workers/transcode-worker.ts`)
- Environment variable: `REDIS_URL` (defaults to `redis://localhost:6379`)

## Starting the Worker

In the student app directory:

```bash
cd anywheredoor
npm run worker:transcode
```

Or manually:
```bash
cd anywheredoor
npx tsx src/workers/transcode-worker.ts
```

## Monitoring

Check job status:
- Via API: `GET /api/admin/media/jobs?mediaId={id}`
- Via database: Check `Media.status` and `TranscodeJobLog` table
- Via Redis: Use Redis CLI or BullMQ dashboard

## Troubleshooting

### Jobs not processing
1. Check Redis is running: `redis-cli ping`
2. Check worker is running
3. Check logs in `TranscodeJobLog` table

### Stuck in PROCESSING
1. Check worker logs
2. Manually retry: Delete and re-upload
3. Check Redis queue: `redis-cli KEYS "bull:transcode:*"`

### Progress not updating
1. Check polling interval (default 3s)
2. Verify API endpoint is accessible
3. Check browser console for errors
