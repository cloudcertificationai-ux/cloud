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
