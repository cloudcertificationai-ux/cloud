'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon as StarIconOutline,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { CourseForm, CourseFormData } from '@/components/CourseForm'
import { CurriculumBuilder } from '@/components/CurriculumBuilder'
import { MediaManager } from '@/components/MediaManager'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import toast from 'react-hot-toast'

type TabType = 'metadata' | 'curriculum' | 'media' | 'preview'

interface Course {
  id: string
  title: string
  slug: string
  summary: string | null
  description: string | null
  priceCents: number
  currency: string
  published: boolean
  featured: boolean
  level: string | null
  durationMin: number | null
  thumbnailUrl: string | null
  categoryId: string | null
  instructorId: string | null
  Module?: Array<{
    id: string
    title: string
    order: number
    Lesson: Array<{
      id: string
      title: string
      order: number
      content: string | null
      videoUrl: string | null
      duration: number | null
    }>
  }>
}

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const courseId = params.id as string
  const [activeTab, setActiveTab] = useState<TabType>('metadata')
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false)

  // Fetch course data
  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ['admin-course', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/courses/${courseId}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Course not found')
        }
        throw new Error('Failed to fetch course')
      }
      const result = await response.json()
      // API returns { data: course, timestamp: ... }
      return result.data || result
    },
  })

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update course')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      toast.success('Course updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Publish course mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/courses/${courseId}/publish`, {
        method: 'PUT',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || error.message || 'Failed to publish course')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      toast.success('Course published successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Unpublish course mutation
  const unpublishMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/courses/${courseId}/unpublish`, {
        method: 'PUT',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to unpublish course')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      toast.success('Course unpublished successfully')
      setUnpublishDialogOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Feature course mutation
  const featureMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/courses/${courseId}/feature`, {
        method: 'PUT',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to feature course')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      toast.success('Course featured successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Unfeature course mutation
  const unfeatureMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/admin/courses/${courseId}/unfeature`, {
        method: 'PUT',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to unfeature course')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      toast.success('Course unfeatured successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = async (data: CourseFormData) => {
    await updateCourseMutation.mutateAsync(data)
  }

  const handleCancel = () => {
    router.push('/admin/courses')
  }

  const handlePublish = () => {
    // Check if course has curriculum
    if (!course?.Module || course.Module.length === 0) {
      toast.error('Cannot publish course without at least one module. Please add curriculum first.')
      setActiveTab('curriculum')
      return
    }

    const totalLessons = course.Module.reduce((sum, module) => sum + (module.Lesson?.length || 0), 0)
    if (totalLessons === 0) {
      toast.error('Cannot publish course without at least one lesson. Please add lessons to your modules.')
      setActiveTab('curriculum')
      return
    }

    publishMutation.mutate()
  }

  const handleUnpublish = () => {
    setUnpublishDialogOpen(true)
  }

  const handleUnpublishConfirm = () => {
    unpublishMutation.mutate()
  }

  const handleFeature = () => {
    if (course?.featured) {
      unfeatureMutation.mutate()
    } else {
      featureMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
        <Link href="/admin/courses" className="btn-primary">
          Back to Courses
        </Link>
      </div>
    )
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'metadata', label: 'Metadata' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'media', label: 'Media' },
    { id: 'preview', label: 'Preview' },
  ]

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
            <p className="mt-1 text-sm text-gray-600">{course.title}</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Status Badges */}
            <div className="flex items-center space-x-2">
              <span
                className={`badge ${
                  course.published ? 'badge-success' : 'badge-neutral'
                }`}
              >
                {course.published ? 'Published' : 'Draft'}
              </span>
              {course.featured && (
                <span className="badge badge-warning inline-flex items-center">
                  <StarIconSolid className="h-3 w-3 mr-1" />
                  Featured
                </span>
              )}
            </div>

            {/* Publishing Controls */}
            <div className="flex items-center space-x-2 border-l pl-3">
              {course.published ? (
                <button
                  onClick={handleUnpublish}
                  disabled={unpublishMutation.isPending}
                  className="btn-secondary inline-flex items-center"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  {unpublishMutation.isPending ? 'Unpublishing...' : 'Unpublish'}
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  disabled={
                    publishMutation.isPending ||
                    !course.Module ||
                    course.Module.length === 0 ||
                    course.Module.reduce((sum, m) => sum + (m.Lesson?.length || 0), 0) === 0
                  }
                  className="btn-primary inline-flex items-center"
                  title={
                    !course.Module || course.Module.length === 0
                      ? 'Add at least one module to publish'
                      : course.Module.reduce((sum, m) => sum + (m.Lesson?.length || 0), 0) === 0
                      ? 'Add at least one lesson to publish'
                      : ''
                  }
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                </button>
              )}

              <button
                onClick={handleFeature}
                disabled={featureMutation.isPending || unfeatureMutation.isPending || !course.published}
                className={`btn-secondary inline-flex items-center ${
                  !course.published ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={!course.published ? 'Course must be published to be featured' : ''}
              >
                {course.featured ? (
                  <>
                    <StarIconOutline className="h-4 w-4 mr-2" />
                    {unfeatureMutation.isPending ? 'Unfeaturing...' : 'Unfeature'}
                  </>
                ) : (
                  <>
                    <StarIconSolid className="h-4 w-4 mr-2" />
                    {featureMutation.isPending ? 'Featuring...' : 'Feature'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'metadata' && (
          <CourseForm
            initialData={{
              ...course,
              level: course.level as 'Beginner' | 'Intermediate' | 'Advanced' | undefined,
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEditing={true}
          />
        )}

        {activeTab === 'curriculum' && (
          <div>
            <CurriculumBuilder 
              courseId={courseId} 
              modules={(course?.Module || []).map(module => ({
                ...module,
                courseId: courseId,
                lessons: module.Lesson.map(lesson => ({
                  ...lesson,
                  moduleId: module.id,
                  kind: 'VIDEO' as const,
                }))
              }))}
              onUpdate={() => queryClient.invalidateQueries({ queryKey: ['admin-course', courseId] })}
            />
          </div>
        )}

        {activeTab === 'media' && (
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Course Media</h2>
            <p className="text-sm text-gray-600 mb-6">
              Manage all media assets used in this course including thumbnails, videos, and documents.
            </p>
            <MediaManager
              courseId={courseId}
              onMediaSelect={(url) => {
                toast.success('Media URL copied to clipboard')
                navigator.clipboard.writeText(url)
              }}
              allowedTypes={['image', 'video', 'pdf', '3d-model']}
              showLibrary={true}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Course Preview</h2>
            <p className="text-sm text-gray-600 mb-6">
              Preview how this course will appear on the frontend website.
            </p>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-500 mb-4">
                Preview functionality will render the course using frontend templates
              </p>
              <Link
                href={`/courses/${course.slug}`}
                target="_blank"
                className="btn-primary inline-flex items-center"
              >
                View on Frontend
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Unpublish Confirmation Dialog */}
      <ConfirmDialog
        isOpen={unpublishDialogOpen}
        onCancel={() => setUnpublishDialogOpen(false)}
        onConfirm={handleUnpublishConfirm}
        title="Unpublish Course"
        message="Are you sure you want to unpublish this course? It will no longer be visible to students on the frontend."
        confirmLabel="Unpublish"
        variant="warning"
      />
    </div>
  )
}
