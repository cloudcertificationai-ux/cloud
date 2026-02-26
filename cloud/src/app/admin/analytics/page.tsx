'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline'
import { mainWebsiteApi } from '@/lib/api-client'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { EmptyAnalyticsState } from '@/components/ui/EmptyStates'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('12months')

  // Calculate date range based on selection
  const { startDate, endDate, groupBy } = useMemo(() => {
    const end = new Date()
    let start = new Date()
    let group: 'day' | 'week' | 'month' | 'year' = 'month'

    switch (dateRange) {
      case '7days':
        start.setDate(end.getDate() - 7)
        group = 'day'
        break
      case '30days':
        start.setDate(end.getDate() - 30)
        group = 'day'
        break
      case '3months':
        start.setMonth(end.getMonth() - 3)
        group = 'week'
        break
      case '12months':
      default:
        start.setMonth(end.getMonth() - 12)
        group = 'month'
        break
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      groupBy: group,
    }
  }, [dateRange])

  // Fetch enrollment analytics
  const { data: enrollmentData, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['analytics', 'enrollments', startDate, endDate, groupBy],
    queryFn: () => mainWebsiteApi.getEnrollmentStats({ startDate, endDate, groupBy }),
  })

  // Fetch student analytics
  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['analytics', 'students', startDate, endDate],
    queryFn: () => mainWebsiteApi.getStudentAnalytics({ startDate, endDate }),
  })

  // Fetch progress analytics
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['analytics', 'progress'],
    queryFn: () => mainWebsiteApi.getProgressAnalytics(),
  })

  const isLoading = enrollmentLoading || studentLoading || progressLoading

  // Check if there's any data at all
  const hasAnyData = useMemo(() => {
    return (
      (enrollmentData?.data?.summary?.totalEnrollments ?? 0) > 0 ||
      (studentData?.data?.summary?.totalStudents ?? 0) > 0 ||
      (progressData?.data?.summary?.completionRate ?? 0) > 0
    )
  }, [enrollmentData, studentData, progressData])

  // Prepare chart data
  const enrollmentTrendData = useMemo(() => {
    return enrollmentData?.data?.timeSeries?.map((item: any) => ({
      period: item.period,
      total: item.count,
      active: item.active,
      completed: item.completed,
    })) || []
  }, [enrollmentData])

  const enrollmentStatusData = useMemo(() => {
    return enrollmentData?.data?.byStatus?.map((item: any) => ({
      name: item.status,
      value: item.count,
    })) || []
  }, [enrollmentData])

  const studentRegistrationData = useMemo(() => {
    return studentData?.data?.registrationTrend?.map((item: any) => ({
      month: item.month,
      count: item.count,
    })) || []
  }, [studentData])

  const completionDistributionData = useMemo(() => {
    return progressData?.data?.completionDistribution?.map((item: any) => ({
      name: item.range,
      value: item.count,
    })) || []
  }, [progressData])

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  // Show empty state if no data exists
  if (!hasAnyData) {
    return (
      <div>
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-sm text-gray-600">
              Track your platform's performance and growth
            </p>
          </div>
        </div>
        <EmptyAnalyticsState />
      </div>
    )
  }

  const overviewStats = [
    {
      name: 'Total Enrollments',
      value: enrollmentData?.data?.summary?.totalEnrollments?.toLocaleString() || '0',
      change: enrollmentData?.data?.summary?.growthRate || 0,
      changeType: (enrollmentData?.data?.summary?.growthRate || 0) >= 0 ? 'increase' : 'decrease',
    },
    {
      name: 'Total Students',
      value: studentData?.data?.summary?.totalStudents?.toLocaleString() || '0',
      change: studentData?.data?.summary?.engagementRate || 0,
      changeType: 'increase',
      label: 'engagement',
    },
    {
      name: 'Active Students',
      value: studentData?.data?.summary?.activeStudents?.toLocaleString() || '0',
      change: studentData?.data?.summary?.retentionRate || 0,
      changeType: 'increase',
      label: 'retention',
    },
    {
      name: 'Completion Rate',
      value: `${progressData?.data?.summary?.completionRate?.toFixed(1) || '0'}%`,
      change: progressData?.data?.summary?.avgCompletionPercentage || 0,
      changeType: 'increase',
      label: 'avg progress',
    },
  ]

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your platform's performance and growth
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            className="input-field"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="3months">Last 3 months</option>
            <option value="12months">Last 12 months</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewStats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex items-center">
                {stat.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`ml-1 text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(stat.change).toFixed(1)}%
                </span>
              </div>
            </div>
            {stat.label && (
              <p className="mt-2 text-xs text-gray-500">{stat.label}</p>
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Enrollment Trend Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" name="Total" />
              <Line type="monotone" dataKey="active" stroke="#10B981" name="Active" />
              <Line type="monotone" dataKey="completed" stroke="#8B5CF6" name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollment Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={enrollmentStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {enrollmentStatusData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Student Registration Trend */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Student Registrations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentRegistrationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#10B981" name="New Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionDistributionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#F59E0B" name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Courses by Enrollment */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Courses by Enrollment</h3>
          <div className="space-y-4">
            {enrollmentData?.data?.topCourses?.slice(0, 5).map((course: any, index: number) => (
              <div key={course.courseId} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">{index + 1}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{course.courseTitle}</p>
                    <p className="text-sm text-gray-500">
                      {course.enrollmentCount} enrollments
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No enrollment data available</p>
            )}
          </div>
        </div>

        {/* Top Students by Enrollments */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Students</h3>
          <div className="space-y-4">
            {studentData?.data?.topStudents?.byEnrollments?.slice(0, 5).map((student: any, index: number) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">{index + 1}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{student.name || student.email}</p>
                    <p className="text-sm text-gray-500">
                      {student.enrollmentCount} enrollments
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No student data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Enrollment by Source */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Source</h3>
          <div className="space-y-3">
            {enrollmentData?.data?.bySource?.map((item: any) => (
              <div key={item.source} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.source}</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 mr-2">{item.count}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Course Completion Rates */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Completion Rates</h3>
          <div className="space-y-3">
            {progressData?.data?.courseCompletionRates?.slice(0, 5).map((course: any) => (
              <div key={course.courseId} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate flex-1 mr-2">{course.courseTitle}</span>
                <span className="text-sm font-medium text-green-600">{course.completionRate}%</span>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Most Active Courses */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Courses (30d)</h3>
          <div className="space-y-3">
            {progressData?.data?.mostActiveCourses?.slice(0, 5).map((course: any) => (
              <div key={course.courseId} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate flex-1 mr-2">{course.courseTitle}</span>
                <span className="text-sm font-medium text-blue-600">{course.recentActivityCount}</span>
              </div>
            )) || (
              <p className="text-sm text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
