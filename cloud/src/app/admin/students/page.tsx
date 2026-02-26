'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  MagnifyingGlassIcon,
  EyeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns/format'
import { adminApi } from '@/lib/api-client'
import { LoadingSpinner, EmptyState } from '@/components/ui'
import { EmptyEnrollmentsState } from '@/components/ui/EmptyStates'

interface StudentData {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  createdAt: string
  lastLoginAt: string | null
  _count: {
    enrollments: number
    purchases: number
  }
}

interface StudentsResponse {
  students: StudentData[]
  total: number
  page: number
  totalPages: number
}

export default function StudentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const limit = 20

  const { data, isLoading, error } = useQuery<StudentsResponse>({
    queryKey: ['students', page, searchTerm, sortBy, sortOrder],
    queryFn: () => adminApi.getStudents({
      page,
      limit,
      search: searchTerm || undefined,
      sortBy,
      sortOrder,
    }),
    placeholderData: (previousData) => previousData,
  })

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1) // Reset to first page on search
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setPage(1)
  }

  const handleViewStudent = (studentId: string) => {
    router.push(`/admin/students/${studentId}`)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading students: {(error as Error).message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage student accounts and track their progress
        </p>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
          >
            <option value="createdAt">Sort by Join Date</option>
            <option value="name">Sort by Name</option>
            <option value="lastLoginAt">Sort by Last Active</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-2xl font-bold text-gray-900">
              {data.total.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-green-600">
              {data.students.filter(s => s.lastLoginAt && 
                new Date(s.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Active (30 days)</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-primary-600">
              {data.students.reduce((sum, s) => sum + s._count.enrollments, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Enrollments</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-gray-900">
              {data.students.reduce((sum, s) => sum + s._count.purchases, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Purchases</div>
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : data && data.students.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purchases
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.students.map((student) => (
                    <tr key={student.id} className="table-row hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {student.image ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={student.image}
                              alt={student.name || 'Student'}
                            />
                          ) : (
                            <UserCircleIcon className="h-10 w-10 text-gray-400" />
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.role === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-800'
                            : student.role === 'INSTRUCTOR'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {student._count.enrollments}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {student._count.purchases}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(student.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.lastLoginAt 
                          ? format(new Date(student.lastLoginAt), 'MMM dd, yyyy')
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleViewStudent(student.id)}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          <EyeIcon className="h-5 w-5 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {data.page} of {data.totalPages} ({data.total} total students)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : data && data.total === 0 && !searchTerm ? (
          /* Empty state when no students exist at all */
          <EmptyEnrollmentsState />
        ) : (
          /* No results state when filtering */
          <EmptyState
            title="No students found"
            description="No students match your search criteria."
          />
        )}
      </div>
    </div>
  )
}