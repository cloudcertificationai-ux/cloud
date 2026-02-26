#!/usr/bin/env tsx
// scripts/start-transcode-worker.ts
import { createTranscodeWorker } from '../src/workers/transcode-worker';

console.log('Starting transcode worker...');
console.log('Environment:', {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID ? '***' : 'NOT SET',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'NOT SET',
});

const worker = createTranscodeWorker();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await worker.close();
  process.exit(0);
});

console.log('Transcode worker is running. Press Ctrl+C to stop.');
