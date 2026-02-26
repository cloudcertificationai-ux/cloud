// src/components/LastUpdatedTimestamp.tsx
'use client'

import { useEffect, useState } from 'react'

interface LastUpdatedTimestampProps {
  timestamp: string | Date
  label?: string
  className?: string
  showRelative?: boolean
}

/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 */
function getRelativeTime(timestamp: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) {
    return 'just now'
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  } else {
    return timestamp.toLocaleDateString()
  }
}

/**
 * Format timestamp as absolute time
 */
function getAbsoluteTime(timestamp: Date): string {
  return timestamp.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Component to display last updated timestamp
 */
export function LastUpdatedTimestamp({
  timestamp,
  label = 'Last updated',
  className = '',
  showRelative = true,
}: LastUpdatedTimestampProps) {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Ensure component is mounted before rendering time-dependent content
  useEffect(() => {
    setMounted(true)
    
    // Update current time every minute for relative time display
    if (showRelative) {
      const interval = setInterval(() => {
        setCurrentTime(new Date())
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [showRelative])

  if (!mounted) {
    return null
  }

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const displayTime = showRelative ? getRelativeTime(date) : getAbsoluteTime(date)
  const absoluteTime = getAbsoluteTime(date)

  return (
    <div className={`text-sm text-gray-500 ${className}`}>
      <span className="font-medium">{label}:</span>{' '}
      <time dateTime={date.toISOString()} title={absoluteTime}>
        {displayTime}
      </time>
    </div>
  )
}

/**
 * Component to display sync status with timestamp
 */
interface SyncStatusProps {
  lastSyncedAt?: string | Date
  syncStatus?: 'synced' | 'pending' | 'failed'
  className?: string
}

export function SyncStatus({
  lastSyncedAt,
  syncStatus = 'synced',
  className = '',
}: SyncStatusProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const statusColors = {
    synced: 'text-green-600',
    pending: 'text-yellow-600',
    failed: 'text-red-600',
  }

  const statusIcons = {
    synced: '✓',
    pending: '⟳',
    failed: '✗',
  }

  const statusLabels = {
    synced: 'Synced',
    pending: 'Syncing...',
    failed: 'Sync failed',
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className={`font-medium ${statusColors[syncStatus]}`}>
        {statusIcons[syncStatus]} {statusLabels[syncStatus]}
      </span>
      {lastSyncedAt && syncStatus === 'synced' && (
        <LastUpdatedTimestamp
          timestamp={lastSyncedAt}
          label=""
          showRelative={true}
          className="text-gray-500"
        />
      )}
    </div>
  )
}

/**
 * Component to display data freshness indicator
 */
interface DataFreshnessProps {
  timestamp: string | Date
  warningThresholdMinutes?: number
  errorThresholdMinutes?: number
  className?: string
}

export function DataFreshness({
  timestamp,
  warningThresholdMinutes = 60,
  errorThresholdMinutes = 180,
  className = '',
}: DataFreshnessProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const now = new Date()
  const ageMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  let statusColor = 'text-green-600'
  let statusIcon = '●'
  let statusLabel = 'Fresh'

  if (ageMinutes > errorThresholdMinutes) {
    statusColor = 'text-red-600'
    statusIcon = '●'
    statusLabel = 'Stale'
  } else if (ageMinutes > warningThresholdMinutes) {
    statusColor = 'text-yellow-600'
    statusIcon = '●'
    statusLabel = 'Aging'
  }

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <span className={`${statusColor}`}>
        {statusIcon} {statusLabel}
      </span>
      <LastUpdatedTimestamp
        timestamp={timestamp}
        label=""
        showRelative={true}
        className="text-gray-500"
      />
    </div>
  )
}
