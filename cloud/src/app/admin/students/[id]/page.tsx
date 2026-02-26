'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  ShoppingBagIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns/format'
import { adminApi } from '@/lib/api-client'
import { LoadingSpinner, EmptyState, useNotification } from '@/components/ui'
import EnrollmentManagement from '@/components/EnrollmentManagement'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface EnrollmentData {
  id: string
  enrolledAt: string
  lastAccessedAt: string | null
  completionPercentage: number
  status: string
  source: string
  course: {
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
  purchase: {
    id: string
    amountCents: number
    currency: string
    status: string
    createdAt: string
  } | null
}

interface PurchaseData {
  id: string
  amountCents: number
  currency: string
  status: string
  createdAt: string
  course: {
    id: string
    title: string
  }
}

interface StudentDetailData {
  id: string
  email: string
  name: string | null
  image: string | null
  role: string
  createdAt: string
  lastLoginAt: string | null
  Profile: {
    bio: string | null
    location: string | null
    timezone: string | null
    phone: string | null
  } | null
  Enrollment: EnrollmentData[]
  Purchase: PurchaseData[]
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const notification = useNotification()
  const studentId = params.id as string

  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    enrollmentId: string
    courseTitle: string
  } | null>(null)

  const { data: student, isLoading, error } = useQuery<StudentDetailData>({
    queryKey: ['student', studentId],
    queryFn: () => adminApi.getStudentDetail(studentId),
  })

  // Redirect to login if authentication is required
  if (error && (error as Error).message === 'Authentication required') {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin'
    }
  }

  const deleteEnrollmentMutation = useMutation({
    mutationFn: (enrollmentId: string) => adminApi.deleteEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] })
      setDeleteConfirm(null)
      notification.success('Enrollment removed successfully')
    },
    onError: (error: Error) => {
      notification.error('Failed to remove enrollment', error.message)
    },
  })

  const handleDeleteEnrollment = (enrollmentId: string, courseTitle: string) => {
    setDeleteConfirm({ enrollmentId, courseTitle })
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteEnrollmentMutation.mutate(deleteConfirm.enrollmentId)
    }
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading student: {(error as Error).message}</p>
        <button 
          onClick={() => router.back()} 
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!student) {
    return (
      <EmptyState
        title="Student not found"
        description="The student you're looking for doesn't exist."
      />
    )
  }

  const totalSpent = (student.Purchase || [])
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amountCents, 0) / 100

  const activeEnrollments = (student.Enrollment || []).filter(e => e.status === 'ACTIVE').length
  const completedEnrollments = (student.Enrollment || []).filter(e => e.status === 'COMPLETED').length

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Students
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Student Details</h1>
      </div>

      {/* Student Profile Card */}
      <div className="card mb-6">
        <div className="flex items-start space-x-6">
          {student.image ? (
            <img
              className="h-24 w-24 rounded-full"
              src={student.image}
              alt={student.name || 'Student'}
            />
          ) : (
            <UserCircleIcon className="h-24 w-24 text-gray-400" />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {student.name || 'No name'}
            </h2>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-gray-600">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                {student.email}
              </div>
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Joined {format(new Date(student.createdAt), 'MMMM dd, yyyy')}
              </div>
              {student.lastLoginAt && (
                <div className="flex items-center text-gray-600">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Last active {format(new Date(student.lastLoginAt), 'MMMM dd, yyyy')}
                </div>
              )}
            </div>
            <div className="mt-4">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                student.role === 'ADMIN' 
                  ? 'bg-purple-100 text-purple-800'
                  : student.role === 'INSTRUCTOR'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {student.role}
              </span>
            </div>
          </div>
        </div>

        {student.Profile && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {student.Profile.bio && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Bio</p>
                  <p className="text-gray-900">{student.Profile.bio}</p>
                </div>
              )}
              {student.Profile.location && (
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-900">{student.Profile.location}</p>
                </div>
              )}
              {student.Profile.timezone && (
                <div>
                  <p className="text-sm text-gray-600">Timezone</p>
                  <p className="text-gray-900">{student.Profile.timezone}</p>
                </div>
              )}
              {student.Profile.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-gray-900">{student.Profile.phone}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-2xl font-bold text-gray-900">
            {(student.Enrollment || []).length}
          </div>
          <div className="text-sm text-gray-600">Total Enrollments</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-blue-600">
            {activeEnrollments}
          </div>
          <div className="text-sm text-gray-600">Active Courses</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-green-600">
            {completedEnrollments}
          </div>
          <div className="text-sm text-gray-600">Completed Courses</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-primary-600">
            ${totalSpent.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
      </div>

      {/* Enrollments Section */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AcademicCapIcon className="h-6 w-6 mr-2" />
            Enrollments
          </h3>
          <button
            onClick={() => setShowEnrollmentModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Enrollment
          </button>
        </div>

        {(student.Enrollment || []).length > 0 ? (
          <div className="space-y-4">
            {(student.Enrollment || []).map((enrollment) => (
              <div
                key={enrollment.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {enrollment.course.thumbnailUrl && (
                      <img
                        src={enrollment.course.thumbnailUrl}
                        alt={enrollment.course.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {enrollment.course.title}
                      </h4>
                      {enrollment.course.instructor && (
                        <p className="text-sm text-gray-600">
                          by {enrollment.course.instructor.name}
                        </p>
                      )}
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Enrolled: {format(new Date(enrollment.enrolledAt), 'MMM dd, yyyy')}
                        </span>
                        {enrollment.lastAccessedAt && (
                          <span>
                            Last accessed: {format(new Date(enrollment.lastAccessedAt), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          enrollment.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : enrollment.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.status}
                        </span>
                        <span className="text-xs text-gray-600">
                          Source: {enrollment.source}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">
                            {enrollment.completionPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${enrollment.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEnrollment(enrollment.id, enrollment.course.title)}
                    disabled={deleteEnrollmentMutation.isPending}
                    className="ml-4 text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No enrollments"
            description="This student hasn't enrolled in any courses yet."
          />
        )}
      </div>

      {/* Purchase History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-6">
          <ShoppingBagIcon className="h-6 w-6 mr-2" />
          Purchase History
        </h3>

        {(student.Purchase || []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(student.Purchase || []).map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.course.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.currency} {(purchase.amountCents / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        purchase.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : purchase.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : purchase.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(purchase.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No purchases"
            description="This student hasn't made any purchases yet."
          />
        )}
      </div>

      {/* Add Enrollment Modal */}
      {showEnrollmentModal && (
        <EnrollmentManagement
          studentId={studentId}
          studentName={student.name || student.email}
          onClose={() => setShowEnrollmentModal(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Remove Enrollment"
        message={`Are you sure you want to remove the enrollment for "${deleteConfirm?.courseTitle}"? This action cannot be undone.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleteEnrollmentMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}
