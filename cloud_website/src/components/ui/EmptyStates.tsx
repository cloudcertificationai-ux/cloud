'use client'

import { 
  AcademicCapIcon, 
  BookOpenIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'
import EmptyState from './EmptyState'

/**
 * Empty state for course listings when no courses are available
 */
export function EmptyCoursesState() {
  return (
    <EmptyState
      icon={<AcademicCapIcon className="h-12 w-12" />}
      title="No courses available"
      description="There are no courses to display at the moment. Check back soon for new learning opportunities!"
      className="min-h-[400px] flex flex-col justify-center"
    />
  )
}

/**
 * Empty state for student dashboard when no enrollments exist
 */
export function EmptyEnrollmentsState() {
  return (
    <EmptyState
      icon={<BookOpenIcon className="h-12 w-12" />}
      title="No enrolled courses"
      description="You haven't enrolled in any courses yet. Browse our course catalog to start your learning journey!"
      action={{
        label: 'Browse Courses',
        href: '/courses'
      }}
      className="min-h-[400px] flex flex-col justify-center"
    />
  )
}

/**
 * Empty state for analytics when no data is available
 */
export function EmptyAnalyticsState() {
  return (
    <EmptyState
      icon={<ChartBarIcon className="h-12 w-12" />}
      title="No analytics data"
      description="Start learning to see your progress and analytics here."
      className="min-h-[300px] flex flex-col justify-center"
    />
  )
}
