'use client'

import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { mainWebsiteApi } from '@/lib/api-client'
import { useNotification } from '@/components/ui'

interface EnrollmentManagementProps {
  studentId: string
  studentName: string
  onClose: () => void
}

interface Course {
  id: string
  title: string
  slug: string
  thumbnailUrl: string | null
  priceCents: number
  currency: string
  instructor: {
    name: string
  } | null
}

export default function EnrollmentManagement({
  studentId,
  studentName,
  onClose,
}: EnrollmentManagementProps) {
  const queryClient = useQueryClient()
  const notification = useNotification()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])

  // Fetch available courses
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses', searchTerm],
    queryFn: () => mainWebsiteApi.getCourses({
      page: 1,
      limit: 50,
    }),
  })

  const createEnrollmentMutation = useMutation({
    mutationFn: (courseId: string) => mainWebsiteApi.createEnrollment(studentId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] })
      notification.success('Enrollment created successfully')
    },
    onError: (error: Error) => {
      notification.error('Failed to create enrollment', error.message)
    },
  })

  const bulkCreateEnrollmentsMutation = useMutation({
    mutationFn: async (courseIds: string[]) => {
      const results = await Promise.allSettled(
        courseIds.map(courseId => mainWebsiteApi.createEnrollment(studentId, courseId))
      )
      return results
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      queryClient.invalidateQueries({ queryKey: ['student', studentId] })
      
      if (failed === 0) {
        notification.success(`Successfully created ${successful} enrollment(s)`)
      } else {
        notification.warning(`Created ${successful} enrollment(s), ${failed} failed`)
      }
      
      setSelectedCourses([])
    },
    onError: (error: Error) => {
      notification.error('Bulk enrollment failed', error.message)
    },
  })

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSelectAll = () => {
    if (!coursesData?.courses) return
    
    const allCourseIds = coursesData.courses.map((c: Course) => c.id)
    if (selectedCourses.length === allCourseIds.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(allCourseIds)
    }
  }

  const handleBulkEnroll = () => {
    if (selectedCourses.length === 0) {
      notification.warning('Please select at least one course')
      return
    }

    if (confirm(`Enroll ${studentName} in ${selectedCourses.length} course(s)?`)) {
      bulkCreateEnrollmentsMutation.mutate(selectedCourses)
    }
  }

  const handleSingleEnroll = (courseId: string, courseTitle: string) => {
    if (confirm(`Enroll ${studentName} in "${courseTitle}"?`)) {
      createEnrollmentMutation.mutate(courseId)
    }
  }

  const filteredCourses = coursesData?.courses?.filter((course: Course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Enrollment Management
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Manage enrollments for {studentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Search and Actions */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                className="input-field pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              {selectedCourses.length === filteredCourses.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={handleBulkEnroll}
              disabled={selectedCourses.length === 0 || bulkCreateEnrollmentsMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkCreateEnrollmentsMutation.isPending
                ? 'Enrolling...'
                : `Enroll in ${selectedCourses.length} Course${selectedCourses.length !== 1 ? 's' : ''}`
              }
            </button>
          </div>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto p-6">
          {coursesLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Loading courses...</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="space-y-3">
              {filteredCourses.map((course: Course) => (
                <div
                  key={course.id}
                  className={`border rounded-lg p-4 hover:border-primary-300 transition-colors ${
                    selectedCourses.includes(course.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => handleToggleCourse(course.id)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    {course.thumbnailUrl && (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {course.title}
                      </h4>
                      {course.instructor && (
                        <p className="text-sm text-gray-600">
                          by {course.instructor.name}
                        </p>
                      )}
                      <div className="mt-1 flex items-center space-x-4">
                        <span className="text-sm font-semibold text-primary-600">
                          {course.currency} {(course.priceCents / 100).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: {course.id}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSingleEnroll(course.id, course.title)}
                      disabled={createEnrollmentMutation.isPending}
                      className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? 'No courses found matching your search' : 'No courses available'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
