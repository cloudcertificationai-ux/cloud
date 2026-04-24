// src/app/api/admin/jobs/route.ts
// Queue stats API — returns counts for all queues.
// Used by the Bull Board admin page.

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAllQueueStats, getRecentJobs, retryFailedJob } from '@/lib/queue-client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/admin/jobs — returns stats for all queues
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const queueName = searchParams.get('queue')

  try {
    if (queueName) {
      // Detailed view for a specific queue
      const jobs = await getRecentJobs(queueName, 50)
      return NextResponse.json({ queue: queueName, jobs })
    }

    // Overview: stats for all queues
    const stats = await getAllQueueStats()
    return NextResponse.json({ stats, timestamp: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch queue stats', detail: (err as Error).message },
      { status: 500 }
    )
  }
}

// POST /api/admin/jobs — retry a failed job
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { queue, jobId, action } = await req.json()

  if (action === 'retry') {
    const success = await retryFailedJob(queue, jobId)
    return NextResponse.json({ success })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
