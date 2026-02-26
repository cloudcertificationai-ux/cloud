'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Enrollment, Course, Instructor, Module, Lesson } from '@prisma/client'
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'

type EnrollmentWithCourse = Enrollment & {
  course: Course & {
    instructor: Instructor | null
    modules: (Module & {
      lessons: Lesson[]
    })[]
  }
}

interface CourseProgressCardProps {
  enrollment: EnrollmentWithCourse
  userId: string
}

export default function CourseProgressCard({
  enrollment,
  userId,
}: CourseProgressCardProps) {
  const { course, enrolledAt, lastAccessedAt, completionPercentage, status } =
    enrollment

  const [progress, setProgress] = useState<{
    totalLessons: number
    completedLessons: number
    lastAccessedLesson: string | null
    timeSpent: number
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [lastLessonName, setLastLessonName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch(`/api/progress/${course.id}`)
        if (response.ok) {
          const data = await response.json()
          setProgress(data)
          
          // Find the last accessed lesson name from course modules
          if (data.lastAccessedLesson) {
            for (const module of course.modules) {
              const lesson = module.lessons.find(
                (l) => l.id === data.lastAccessedLesson
              )
              if (lesson) {
                setLastLessonName(lesson.title)
                break
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [course.id, course.modules])

  // Calculate total lessons from modules
  const totalLessons = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0
  )

  // Use progress data if available, otherwise calculate from enrollment
  const completedLessons = progress?.completedLessons ?? 0
  const progressPercentage = progress
    ? Math.round((completedLessons / totalLessons) * 100)
    : Math.round(completionPercentage)

  // Format dates
  const enrolledDate = new Date(enrolledAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const lastAccessDate = lastAccessedAt
    ? new Date(lastAccessedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  // Format time spent (convert seconds to hours)
  const timeSpentHours = progress?.timeSpent
    ? Math.round(progress.timeSpent / 3600)
    : 0

  // Get status badge color
  const getStatusBadge = () => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="filled" color="success" size="sm">
            Completed
          </Badge>
        )
      case 'ACTIVE':
        return (
          <Badge variant="filled" color="primary" size="sm">
            In Progress
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge variant="filled" color="neutral" size="sm">
            Cancelled
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card hover className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-navy-800 mb-2 line-clamp-2">
              {course.title}
            </h3>
            {course.instructor && (
              <p className="text-sm text-neutral-600">
                by {course.instructor.name}
              </p>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Course Thumbnail */}
        {course.thumbnailUrl && (
          <div className="mb-4 rounded-lg overflow-hidden bg-neutral-100">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-40 object-cover"
            />
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-700">
              Progress
            </span>
            <span className="text-sm font-semibold text-primary-600">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2.5">
            <div
              className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-neutral-600 mb-1">Lessons</p>
            <p className="text-sm font-semibold text-navy-800">
              {completedLessons} / {totalLessons}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-600 mb-1">Time Spent</p>
            <p className="text-sm font-semibold text-navy-800">
              {loading ? '...' : `${timeSpentHours}h`}
            </p>
          </div>
        </div>

        {/* Last Accessed Lesson */}
        {lastLessonName && (
          <div className="mb-4 p-3 bg-accent-50 rounded-lg border border-accent-200">
            <p className="text-xs text-accent-700 font-medium mb-1">
              Continue Learning
            </p>
            <p className="text-sm text-accent-900 line-clamp-1">
              {lastLessonName}
            </p>
          </div>
        )}

        {/* Enrollment Info */}
        <div className="text-xs text-neutral-500 space-y-1">
          <p>Enrolled: {enrolledDate}</p>
          {lastAccessDate && <p>Last accessed: {lastAccessDate}</p>}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/courses/${course.slug}`} className="w-full">
          <Button variant="primary" size="md" fullWidth>
            {status === 'COMPLETED' ? 'Review Course' : 'Continue Learning'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
