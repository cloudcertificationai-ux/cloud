# BullMQ Queue Testing Guide

## Overview

The BullMQ queue system (`queue.ts` and `transcode-service.ts`) uses ESM modules that cannot be tested with Jest due to module resolution issues. This document provides guidance for testing the queue system.

## Manual Testing

### Prerequisites

1. Ensure Redis is running:
   ```bash
   # Using Docker
   docker run -d -p 6379:6379 redis:latest
   
   # Or using local Redis
   redis-server
   ```

2. Set the `REDIS_URL` environment variable:
   ```bash
   export REDIS_URL=redis://localhost:6379
   ```

### Testing Queue Configuration

Create a test script `test-queue.ts`:

```typescript
import { transcodeQueue, JobType, isQueueHealthy, closeQueues } from './queue';

async function testQueue() {
  console.log('Testing BullMQ Queue Configuration...\n');

  // Test 1: Queue name
  console.log('✓ Queue name:', transcodeQueue.name);
  console.log('✓ Expected:', JobType.TRANSCODE);
  console.log('✓ Match:', transcodeQueue.name === JobType.TRANSCODE);

  // Test 2: Retry configuration
  const opts = transcodeQueue.opts.defaultJobOptions;
  console.log('\n✓ Retry attempts:', opts?.attempts);
  console.log('✓ Backoff type:', opts?.backoff?.type);
  console.log('✓ Backoff delay:', opts?.backoff?.delay);

  // Test 3: Health check
  const healthy = await isQueueHealthy();
  console.log('\n✓ Queue healthy:', healthy);

  await closeQueues();
  console.log('\n✓ Queue closed successfully');
}

testQueue().catch(console.error);
```

Run with:
```bash
npx tsx src/lib/test-queue.ts
```

### Testing TranscodeService

Create a test script `test-transcode-service.ts`:

```typescript
import { transcodeService } from './transcode-service';
import { closeQueues } from './queue';

async function testTranscodeService() {
  console.log('Testing TranscodeService...\n');

  try {
    // Test 1: Enqueue a job
    const mediaId = 'test-media-123';
    const r2Key = 'media/test-media-123/source.mp4';
    
    console.log('Enqueueing transcode job...');
    const jobId = await transcodeService.enqueueTranscode(mediaId, r2Key);
    console.log('✓ Job enqueued:', jobId);

    // Test 2: Get job status
    console.log('\nGetting job status...');
    const status = await transcodeService.getJobStatus(jobId);
    console.log('✓ Job status:', status.status);
    console.log('✓ Job progress:', status.progress);

    // Test 3: Get queue stats
    console.log('\nGetting queue stats...');
    const stats = await transcodeService.getQueueStats();
    console.log('✓ Waiting:', stats.waiting);
    console.log('✓ Active:', stats.active);
    console.log('✓ Completed:', stats.completed);
    console.log('✓ Failed:', stats.failed);

    // Test 4: Cancel job
    console.log('\nCancelling job...');
    const cancelled = await transcodeService.cancelJob(jobId);
    console.log('✓ Job cancelled:', cancelled);

    // Verify cancellation
    const statusAfter = await transcodeService.getJobStatus(jobId);
    console.log('✓ Status after cancel:', statusAfter.status);

  } catch (error) {
    console.error('✗ Error:', error);
  } finally {
    await closeQueues();
    console.log('\n✓ Cleanup complete');
  }
}

testTranscodeService().catch(console.error);
```

Run with:
```bash
npx tsx src/lib/test-transcode-service.ts
```

## Integration Testing

For integration tests with the full transcode worker, see the worker implementation in Task 5.

## Expected Behavior

### Queue Configuration
- Queue name should be "transcode"
- Retry attempts should be 3
- Backoff should be exponential with 2000ms initial delay
- Health check should return true when Redis is available

### TranscodeService
- `enqueueTranscode()` should return a job ID
- Job ID should be in format `transcode-{mediaId}` for idempotency
- `getJobStatus()` should return job state and progress
- `getQueueStats()` should return counts for all job states
- `cancelJob()` should remove the job from the queue

## Troubleshooting

### Redis Connection Issues
- Ensure Redis is running on the configured port
- Check `REDIS_URL` environment variable
- Verify network connectivity to Redis

### BullMQ Module Issues
- BullMQ requires `maxRetriesPerRequest: null` for Redis connection
- Ensure `ioredis` and `bullmq` packages are installed
- Check for version compatibility between packages

## Production Considerations

1. **Redis Configuration**: Use a production-ready Redis instance (e.g., AWS ElastiCache, Redis Cloud)
2. **Queue Monitoring**: Implement monitoring for queue depth and job failures
3. **Error Handling**: Ensure proper error logging and alerting for failed jobs
4. **Scaling**: Consider running multiple worker instances for high throughput
5. **Job Retention**: Configure appropriate retention policies for completed/failed jobs
