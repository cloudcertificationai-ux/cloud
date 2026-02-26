'use client'

import { 
  AcademicCapIcon, 
  RectangleStackIcon,
  ChartBarIcon,
  UsersIcon 
} from '@heroicons/react/24/outline'
import EmptyState from './EmptyState'

/**
 * Empty state for course listings in admin panel
 */
export function EmptyCoursesState({ onCreateCourse }: { onCreateCourse?: () => void }) {
  return (
    <EmptyState
      icon={<AcademicCapIcon className="h-12 w-12" />}
      title="No courses yet"
      description="Get started by creating your first course. You can add modules, lessons, and content to build engaging learning experiences."
      action={onCreateCourse ? {
        label: 'Create Course',
        onClick: onCreateCourse
      } : undefined}
      className="min-h-[400px] flex flex-col justify-center"
    />
  )
}

/**
 * Empty state for curriculum builder when no modules exist
 */
export function EmptyModulesState({ onAddModule }: { onAddModule?: () => void }) {
  return (
    <EmptyState
      icon={<RectangleStackIcon className="h-12 w-12" />}
      title="No modules in this course"
      description="Start building your course curriculum by adding modules. Each module can contain multiple lessons organized in a logical sequence."
      action={onAddModule ? {
        label: 'Add Module',
        onClick: onAddModule
      } : undefined}
      className="min-h-[300px] flex flex-col justify-center"
    />
  )
}

/**
 * Empty state for analytics dashboard when no data is available
 */
export function EmptyAnalyticsState() {
  return (
    <EmptyState
      icon={<ChartBarIcon className="h-12 w-12" />}
      title="No analytics data available"
      description="Analytics will appear here once students start enrolling in courses and engaging with content."
      className="min-h-[400px] flex flex-col justify-center"
    />
  )
}

/**
 * Empty state for student/enrollment management when no students exist
 */
export function EmptyEnrollmentsState() {
  return (
    <EmptyState
      icon={<UsersIcon className="h-12 w-12" />}
      title="No enrollments yet"
      description="Student enrollments will appear here once learners start signing up for courses."
      className="min-h-[400px] flex flex-col justify-center"
    />
  )
}
