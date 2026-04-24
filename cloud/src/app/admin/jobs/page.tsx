'use client'

// src/app/admin/jobs/page.tsx
// Bull Board-style job monitoring dashboard.
// Shows queue stats, recent jobs (completed/failed/active), and retry buttons.

import { useState, useEffect, useCallback } from 'react'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueueStat {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
}

interface JobRecord {
  id?: string
  name: string
  data: Record<string, unknown>
  status: 'completed' | 'failed' | 'active' | 'waiting'
  returnvalue?: unknown
  failedReason?: string
  finishedOn?: number
  processedOn?: number
  timestamp?: number
  attemptsMade?: number
}

const QUEUE_NAMES = ['email', 'sync', 'transcode', 'analytics']

const QUEUE_COLORS: Record<string, string> = {
  email:     'bg-purple-100 text-purple-800',
  sync:      'bg-blue-100 text-blue-800',
  transcode: 'bg-orange-100 text-orange-800',
  analytics: 'bg-green-100 text-green-800',
}

const QUEUE_LABELS: Record<string, string> = {
  email:     '📧 Email',
  sync:      '🔄 Sync',
  transcode: '🎬 Transcode',
  analytics: '📊 Analytics',
}

// ─── Components ───────────────────────────────────────────────────────────────

function StatBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-lg ${color}`}>
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-xs font-medium mt-0.5 opacity-80">{label}</span>
    </div>
  )
}

function JobRow({
  job,
  queue,
  onRetry,
}: {
  job: JobRecord
  queue: string
  onRetry: (queue: string, jobId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const statusIcon = {
    completed: <CheckCircleIcon className="w-4 h-4 text-green-500" />,
    failed:    <XCircleIcon className="w-4 h-4 text-red-500" />,
    active:    <PlayIcon className="w-4 h-4 text-blue-500 animate-pulse" />,
    waiting:   <ClockIcon className="w-4 h-4 text-gray-400" />,
  }[job.status]

  const timeAgo = (ts?: number) => {
    if (!ts) return '—'
    const secs = Math.floor((Date.now() - ts) / 1000)
    if (secs < 60) return `${secs}s ago`
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    return `${Math.floor(secs / 3600)}h ago`
  }

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3 text-sm text-gray-500 font-mono">{job.id?.slice(0, 8) || '—'}</td>
        <td className="px-4 py-3">
          <span className="text-sm font-medium text-gray-900">{job.name}</span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">{statusIcon}<span className="text-xs text-gray-600 capitalize">{job.status}</span></div>
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">{timeAgo(job.finishedOn || job.processedOn || job.timestamp)}</td>
        <td className="px-4 py-3">
          {job.status === 'failed' && job.id && (
            <button
              onClick={(e) => { e.stopPropagation(); onRetry(queue, job.id!) }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <ArrowPathIcon className="w-3 h-3" /> Retry
            </button>
          )}
        </td>
        <td className="px-4 py-3 text-gray-400">
          {expanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-4 pb-3">
            {job.failedReason && (
              <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-mono">
                {job.failedReason}
              </div>
            )}
            <pre className="text-xs text-gray-700 bg-white border border-gray-200 rounded p-3 overflow-auto max-h-40">
              {JSON.stringify(job.data, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const [stats, setStats] = useState<Record<string, QueueStat>>({})
  const [jobs, setJobs] = useState<Record<string, { completed: JobRecord[]; failed: JobRecord[]; active: JobRecord[]; waiting: JobRecord[] }>>({})
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/jobs')
      if (!res.ok) throw new Error('Failed to fetch queue stats')
      const data = await res.json()
      setStats(data.stats || {})
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    }
  }, [])

  const fetchQueueJobs = useCallback(async (queue: string) => {
    try {
      const res = await fetch(`/api/admin/jobs?queue=${queue}`)
      if (!res.ok) throw new Error('Failed to fetch jobs')
      const data = await res.json()
      setJobs(prev => ({ ...prev, [queue]: data.jobs }))
    } catch (err) {
      console.error('Failed to fetch queue jobs:', err)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await fetchStats()
    if (selectedQueue) await fetchQueueJobs(selectedQueue)
    setRefreshing(false)
  }, [fetchStats, fetchQueueJobs, selectedQueue])

  const handleQueueSelect = useCallback(async (queue: string) => {
    setSelectedQueue(queue === selectedQueue ? null : queue)
    if (queue !== selectedQueue) {
      await fetchQueueJobs(queue)
    }
  }, [selectedQueue, fetchQueueJobs])

  const handleRetry = useCallback(async (queue: string, jobId: string) => {
    await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queue, jobId, action: 'retry' }),
    })
    await fetchQueueJobs(queue)
  }, [fetchQueueJobs])

  useEffect(() => {
    fetchStats().finally(() => setLoading(false))
    const interval = setInterval(fetchStats, 10_000) // Auto-refresh every 10s
    return () => clearInterval(interval)
  }, [fetchStats])

  const totalFailed = Object.values(stats).reduce((sum, s) => sum + (s.failed || 0), 0)
  const totalActive = Object.values(stats).reduce((sum, s) => sum + (s.active || 0), 0)
  const totalWaiting = Object.values(stats).reduce((sum, s) => sum + (s.waiting || 0), 0)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Queue Monitor</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
        >
          <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800">
          <ExclamationTriangleIcon className="w-4 h-4 shrink-0" />
          {error} — Is Redis running?
        </div>
      )}

      {/* Summary strip */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
            <PlayIcon className="w-8 h-8 text-blue-500" />
            <div><p className="text-2xl font-bold text-gray-900">{totalActive}</p><p className="text-xs text-gray-500">Active jobs</p></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
            <ClockIcon className="w-8 h-8 text-yellow-500" />
            <div><p className="text-2xl font-bold text-gray-900">{totalWaiting}</p><p className="text-xs text-gray-500">Waiting</p></div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
            <XCircleIcon className="w-8 h-8 text-red-500" />
            <div><p className="text-2xl font-bold text-gray-900">{totalFailed}</p><p className="text-xs text-gray-500">Failed</p></div>
          </div>
        </div>
      )}

      {/* Queue cards */}
      <div className="space-y-4">
        {QUEUE_NAMES.map((queueName) => {
          const stat = stats[queueName] ?? { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
          const isSelected = selectedQueue === queueName
          const queueJobs = jobs[queueName]

          return (
            <div key={queueName} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Queue header */}
              <button
                onClick={() => handleQueueSelect(queueName)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${QUEUE_COLORS[queueName]}`}>
                    {QUEUE_LABELS[queueName]}
                  </span>
                  {stat.active > 0 && (
                    <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <PlayIcon className="w-3 h-3 animate-pulse" />{stat.active} running
                    </span>
                  )}
                  {stat.failed > 0 && (
                    <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                      <ExclamationTriangleIcon className="w-3 h-3" />{stat.failed} failed
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <StatBadge count={stat.waiting} label="Waiting" color="bg-yellow-50 text-yellow-700" />
                    <StatBadge count={stat.active} label="Active" color="bg-blue-50 text-blue-700" />
                    <StatBadge count={stat.completed} label="Done" color="bg-green-50 text-green-700" />
                    <StatBadge count={stat.failed} label="Failed" color="bg-red-50 text-red-700" />
                  </div>
                  {isSelected ? <ChevronDownIcon className="w-5 h-5 text-gray-400" /> : <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
                </div>
              </button>

              {/* Job list */}
              {isSelected && queueJobs && (
                <div className="border-t border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                        <th className="px-4 py-2">Job ID</th>
                        <th className="px-4 py-2">Name</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Time</th>
                        <th className="px-4 py-2">Actions</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...queueJobs.active, ...queueJobs.waiting, ...queueJobs.failed, ...queueJobs.completed].map((job, i) => (
                        <JobRow key={job.id || i} job={job} queue={queueName} onRetry={handleRetry} />
                      ))}
                      {[...queueJobs.active, ...queueJobs.waiting, ...queueJobs.failed, ...queueJobs.completed].length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                            No recent jobs
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {isSelected && !queueJobs && (
                <div className="border-t border-gray-200 p-8 text-center text-gray-400">
                  <ArrowPathIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading jobs...
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
