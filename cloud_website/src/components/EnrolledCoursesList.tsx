'use client'

import Link from 'next/link'
import { Enrollment, Course, Instructor, Module, Lesson } from '@prisma/client'
import CourseProgressCard from './CourseProgressCard'
import Button from './ui/Button'

type EnrollmentWithCourse = Enrollment & {
  course: Course & {
    instructor: Instructor | null
    modules: (Module & {
      lessons: Lesson[]
    })[]
  }
}

interface EnrolledCoursesListProps {
  enrollments: EnrollmentWithCourse[]
  userId: string
}

export default function EnrolledCoursesList({
  enrollments,
  userId,
}: EnrolledCoursesListProps) {
  // Empty state
  if (enrollments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-card p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-neutral-400"
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
          <h3 className="text-2xl font-bold text-navy-800 mb-3">
            No Courses Yet
          </h3>
          <p className="text-neutral-600 mb-6">
            Start your learning journey by enrolling in a course. Explore our
            catalog to find the perfect course for you.
          </p>
          <Link href="/courses">
            <Button variant="primary" size="lg">
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-800">My Courses</h2>
        <Link href="/courses">
          <Button variant="outline" size="sm">
            Browse More Courses
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enrollments.map((enrollment) => (
          <CourseProgressCard
            key={enrollment.id}
            enrollment={enrollment}
            userId={userId}
          />
        ))}
      </div>
    </div>
  )
}
