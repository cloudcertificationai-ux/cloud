'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import { adminApi } from '@/lib/api-client'
import { format } from 'date-fns/format'

export default function SecurityPage() {
  const [dateRange, setDateRange] = useState('7days')
  const [filterType, setFilterType] = useState('all')

  const { data: auditLogs, isLoading, error } = useQuery({
    queryKey: ['audit-logs', dateRange, filterType],
    queryFn: () => adminApi.getAuditLogs({
      page: 1,
      limit: 50,
      startDate: getStartDate(dateRange),
      endDate: new Date().toISOString(),
    }),
    retry: 1,
  })

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading security data</h3>
          <p className="mt-1 text-sm text-gray-500">
            {(error as Error).message || 'Failed to fetch audit logs'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const securityStats = {
    totalEvents: auditLogs?.logs?.length || 0,
    failedLogins: auditLogs?.logs?.filter((log: any) => 
      log.action.includes('LOGIN') && log.action.includes('DENIED')
    )?.length || 0,
    successfulLogins: auditLogs?.logs?.filter((log: any) => 
      log.action.includes('LOGIN_SUCCESS')
    )?.length || 0,
    suspiciousActivity: auditLogs?.logs?.filter((log: any) => 
      log.action.includes('DENIED') || log.action.includes('FAILED')
    )?.length || 0,
  }

  function getStartDate(range: string): string {
    const now = new Date()
    switch (range) {
      case '24hours':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  function getActionIcon(action: string) {
    if (action.includes('login')) return UserIcon
    if (action.includes('api')) return GlobeAltIcon
    if (action.includes('admin')) return ShieldCheckIcon
    return ComputerDesktopIcon
  }

  function getActionColor(success: boolean) {
    return success ? 'text-green-600' : 'text-red-600'
  }

  function safeFormatDate(dateValue: any): string {
    if (!dateValue) return 'N/A'
    try {
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return 'Invalid date'
      return format(date, 'MMM dd, HH:mm')
    } catch (e) {
      return 'Invalid date'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Security Dashboard</h1>
          <p className="mt-2 text-navy-600">
            Monitor security events and audit logs
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="24hours">Last 24 Hours</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field"
          >
            <option value="all">All Events</option>
            <option value="success">Successful</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-600">Total Events</p>
              <p className="text-2xl font-bold text-navy-800">{securityStats.totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-600">Successful Logins</p>
              <p className="text-2xl font-bold text-navy-800">{securityStats.successfulLogins}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-50 to-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-600">Failed Logins</p>
              <p className="text-2xl font-bold text-navy-800">{securityStats.failedLogins}</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy-600">Suspicious Activity</p>
              <p className="text-2xl font-bold text-navy-800">{securityStats.suspiciousActivity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card-hover">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-navy-800">Recent Security Events</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-navy-500">Live monitoring</span>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
          {auditLogs?.logs?.map((log: any) => {
            const ActionIcon = getActionIcon(log.action)
            return (
              <div
                key={log.id}
                className="flex items-start space-x-4 p-4 rounded-xl border transition-all hover:shadow-soft border-gray-100 bg-white"
              >
                <div className="p-2 rounded-lg bg-blue-100">
                  <ActionIcon className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-navy-800">
                      {log.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-navy-500">
                      <ClockIcon className="h-4 w-4" />
                      <span>{safeFormatDate(log.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-1 space-y-1">
                    <p className="text-sm text-navy-600">
                      User: {log.user?.name || log.user?.email || 'Anonymous'} ({log.userId || 'N/A'})
                    </p>
                    <p className="text-sm text-navy-500">
                      IP: {log.ipAddress || 'N/A'} • Resource: {log.resourceType || 'N/A'}
                    </p>
                    {log.details && (
                      <div className="text-xs text-navy-400 bg-navy-50 rounded p-2 mt-2">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {(!auditLogs?.logs || auditLogs.logs.length === 0) && (
          <div className="text-center py-12">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No security events</h3>
            <p className="mt-1 text-sm text-gray-500">
              No security events found for the selected time period.
            </p>
          </div>
        )}
      </div>

      {/* Security Recommendations */}
      <div className="card-hover">
        <h3 className="text-xl font-semibold text-navy-800 mb-4">Security Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-navy-700">Strong Authentication</p>
              <p className="text-sm text-navy-500">All admin accounts use strong passwords and session management</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-navy-700">API Security</p>
              <p className="text-sm text-navy-500">API endpoints are protected with keys and request signing</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-navy-700">Rate Limiting</p>
              <p className="text-sm text-navy-500">Requests are rate limited to prevent abuse</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium text-navy-700">Regular Monitoring</p>
              <p className="text-sm text-navy-500">Review security logs regularly for suspicious activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}