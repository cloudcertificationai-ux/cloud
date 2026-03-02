import { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { dbDataService } from '@/data/db-data-service'
import EnrolledCoursesList from '@/components/EnrolledCoursesList'
import { EmptyEnrollmentsState } from '@/components/ui/EmptyStates'

export const metadata: Metadata = {
  title: 'My Dashboard | Anywheredoor',
  description: 'View your enrolled courses and track your learning progress',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }

  const enrollments = await dbDataService.getUserEnrollments(session.user.id)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Section */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-800">
                Welcome back, {session.user.name?.split(' ')[0] || 'Student'}!
              </h1>
              <p className="mt-2 text-neutral-600">
                Continue your learning journey
              </p>
            </div>
            <div className="flex items-center gap-4">
              {session.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-16 h-16 rounded-full border-2 border-primary-300"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Quick Links */}
        {session.user.role === 'ADMIN' && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-card p-6 border border-purple-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              Admin Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="/dashboard/blog"
                className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Blog Management</h3>
                  <p className="text-sm text-gray-600">Create and manage posts</p>
                </div>
              </a>
            </div>
          </div>
        )}

        {enrollments.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-lg shadow-card">
            <EmptyEnrollmentsState />
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      Enrolled Courses
                    </p>
                    <p className="mt-2 text-3xl font-bold text-navy-800">
                      {enrollments.length}
                    </p>
                  </div>
                  <div className="p-3 bg-primary-100 rounded-lg">
                    <svg
                      className="w-8 h-8 text-primary-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      Completed Courses
                    </p>
                    <p className="mt-2 text-3xl font-bold text-navy-800">
                      {enrollments.filter((e) => e.status === 'COMPLETED').length}
                    </p>
                  </div>
                  <div className="p-3 bg-success-100 rounded-lg">
                    <svg
                      className="w-8 h-8 text-success-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      In Progress
                    </p>
                    <p className="mt-2 text-3xl font-bold text-navy-800">
                      {enrollments.filter((e) => e.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <div className="p-3 bg-accent-100 rounded-lg">
                    <svg
                      className="w-8 h-8 text-accent-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Enrolled Courses Section */}
            <EnrolledCoursesList enrollments={enrollments} userId={session.user.id} />
          </>
        )}
      </div>
    </div>
  )
}
