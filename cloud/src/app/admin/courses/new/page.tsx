'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { CourseForm, CourseFormData } from '@/components/CourseForm'
import toast from 'react-hot-toast'

export default function NewCoursePage() {
  const router = useRouter()

  const handleSubmit = async (data: CourseFormData) => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create course')
      }

      const result = await response.json()
      const course = result.data || result
      router.push(`/admin/courses/${course.id}/edit`)
    } catch (error) {
      throw error // Re-throw to let CourseForm handle the error display
    }
  }

  const handleCancel = () => {
    router.push('/admin/courses')
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/courses"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Courses
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
        <p className="mt-1 text-sm text-gray-600">
          Add a new course to your platform
        </p>
      </div>

      <CourseForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}