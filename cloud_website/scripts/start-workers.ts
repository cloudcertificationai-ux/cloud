#!/usr/bin/env tsx
// scripts/start-workers.ts
// Master entry point — starts ALL background workers in a single process.
// Run: npx tsx scripts/start-workers.ts
// Or add to package.json: "workers": "tsx scripts/start-workers.ts"

import 'dotenv/config'
import { createTranscodeWorker } from '../src/workers/transcode-worker'
import { createEmailWorker } from '../src/workers/email-worker'
import { createSyncWorker } from '../src/workers/sync-worker'
import { createAnalyticsWorker } from '../src/workers/analytics-worker'

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('  Cloud Certification — Background Workers')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV || 'development',
  REDIS_URL: process.env.REDIS_URL ? process.env.REDIS_URL.replace(/:\/\/.*@/, '://***@') : 'redis://localhost:6379',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'NOT SET',
  RESEND_API_KEY: process.env.RESEND_API_KEY ? '***set***' : 'NOT SET (emails will log to console)',
  SMTP_HOST: process.env.SMTP_HOST || 'NOT SET',
})
console.log('')

// ─── Start all workers ────────────────────────────────────────────────────────

const workers = [
  { name: 'transcode', instance: createTranscodeWorker() },
  { name: 'email',     instance: createEmailWorker() },
  { name: 'sync',      instance: createSyncWorker() },
  { name: 'analytics', instance: createAnalyticsWorker() },
]

workers.forEach(({ name }) => {
  console.log(`  ✓ ${name} worker started`)
})

console.log('')
console.log('All workers running. Press Ctrl+C to stop.')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

async function shutdown(signal: string) {
  console.log(`\n${signal} received — shutting down gracefully...`)

  await Promise.allSettled(
    workers.map(async ({ name, instance }) => {
      try {
        await instance.close()
        console.log(`  ✓ ${name} worker stopped`)
      } catch (err) {
        console.error(`  ✗ ${name} worker error during shutdown:`, (err as Error).message)
      }
    })
  )

  console.log('All workers stopped. Goodbye.')
  process.exit(0)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

// Keep process alive
process.on('uncaughtException', (err) => {
  console.error('[workers] Uncaught exception:', err)
  // Don't exit — let BullMQ retry failed jobs
})

process.on('unhandledRejection', (reason) => {
  console.error('[workers] Unhandled rejection:', reason)
})
