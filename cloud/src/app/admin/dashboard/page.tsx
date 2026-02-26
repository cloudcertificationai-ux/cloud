'use client'

import { useQuery } from '@tanstack/react-query'
import {
  UserGroupIcon,
  BookOpenIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  StarIcon,
} from '@heroicons/react/24/outline'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="stagger-container">
        <div className="loading-skeleton h-8 w-1/3 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="loading-skeleton h-32 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="loading-skeleton h-80 rounded-2xl"></div>
          <div className="loading-skeleton h-80 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No dashboard data available</p>
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Students',
      value: dashboardData?.stats.totalStudents.toLocaleString(),
      icon: UserGroupIcon,
      change: dashboardData?.stats.monthlyGrowth.students,
      changeType: 'increase',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'from-teal-50 to-teal-100',
    },
    {
      name: 'Total Courses',
      value: dashboardData?.stats.totalCourses.toString(),
      icon: BookOpenIcon,
      change: dashboardData?.stats.monthlyGrowth.courses,
      changeType: 'increase',
      color: 'from-navy-500 to-navy-600',
      bgColor: 'from-navy-50 to-navy-100',
    },
    {
      name: 'Total Revenue',
      value: `$${((dashboardData?.stats.totalRevenue || 0) / 1000000).toFixed(1)}M`,
      icon: CurrencyDollarIcon,
      change: dashboardData?.stats.monthlyGrowth.revenue,
      changeType: 'increase',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100',
    },
    {
      name: 'Active Enrollments',
      value: dashboardData?.stats.activeEnrollments.toLocaleString(),
      icon: AcademicCapIcon,
      change: dashboardData?.stats.monthlyGrowth.enrollments,
      changeType: 'increase',
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">Dashboard</h1>
            <p className="mt-2 text-navy-600">
              Welcome back! Here's what's happening with your platform.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-navy-500">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span>Live data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-container">
        {stats.map((stat, index) => (
          <div key={stat.name} className="card-hover group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`h-6 w-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-navy-800">{stat.value}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <div className="flex items-center space-x-1">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}%
                    </span>
                  </div>
                  <span className="text-sm text-navy-500 ml-2">vs last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-hover animate-fade-in-up animation-delay-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-navy-800">Revenue Trend</h3>
            <div className="flex items-center space-x-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-teal-500" />
              <span className="text-sm text-teal-600 font-medium">+15.7% growth</span>
            </div>
          </div>
          <div className="h-64">
            <Line
              data={dashboardData?.revenueData || { labels: [], datasets: [] }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#2d3748',
                    bodyColor: '#2d3748',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    cornerRadius: 12,
                    displayColors: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: '#64748b',
                      font: {
                        size: 12,
                      },
                    },
                  },
                  y: {
                    grid: {
                      color: '#f1f5f9',
                    },
                    ticks: {
                      color: '#64748b',
                      font: {
                        size: 12,
                      },
                      callback: function(value) {
                        return '$' + (Number(value) / 1000) + 'K'
                      }
                    }
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index',
                },
              }}
            />
          </div>
        </div>

        <div className="card-hover animate-fade-in-up animation-delay-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-navy-800">Course Categories</h3>
            <EyeIcon className="h-5 w-5 text-navy-600" />
          </div>
          <div className="h-64">
            <Doughnut
              data={dashboardData?.enrollmentData || { labels: [], datasets: [] }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      font: {
                        size: 12,
                      },
                      color: '#64748b',
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#2d3748',
                    bodyColor: '#2d3748',
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    cornerRadius: 12,
                    callbacks: {
                      label: function(context) {
                        return context.label + ': ' + context.parsed + '%'
                      }
                    }
                  },
                },
                cutout: '60%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-hover animate-fade-in-up animation-delay-400">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-navy-800">Recent Enrollments</h3>
            <button className="btn-ghost text-sm">View all</button>
          </div>
          <div className="space-y-4">
            {dashboardData?.recentEnrollments.map((enrollment, index) => (
              <div key={enrollment.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                <img
                  src={enrollment.avatar}
                  alt={enrollment.studentName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-800 truncate">
                    {enrollment.studentName}
                  </p>
                  <p className="text-sm text-navy-500 truncate">
                    {enrollment.courseName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-navy-800">
                    ${enrollment.amount}
                  </p>
                  <p className="text-xs text-navy-500">
                    {new Date(enrollment.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-hover animate-fade-in-up animation-delay-500">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-navy-800">Top Performing Courses</h3>
            <button className="btn-ghost text-sm">View all</button>
          </div>
          <div className="space-y-4">
            {dashboardData?.topCourses.map((course, index) => (
              <div key={course.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-12 h-8 rounded-lg object-cover"
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{index + 1}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-navy-800 truncate">
                    {course.title}
                  </p>
                  <p className="text-sm text-navy-500">
                    {course.enrollments.toLocaleString()} students
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-semibold text-navy-800">{course.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}