'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon as StarIconOutline,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyCoursesState } from '@/components/ui/EmptyStates'

interface CourseListItem {
  id: string
  title: string
  slug: string
  summary: string | null
  published: boolean
  featured: boolean
  level: string | null
  priceCents: number
  currency: string
  rating: number | null
  thumbnailUrl: string | null
  Category: { id: string; name: string; slug: string } | null
  Instructor: { id: string; name: string } | null
  _count: {
    Enrollment: number
  }
}

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [publishedFilter, setPublishedFilter] = useState<string>('all')
  const [featuredFilter, setFeaturedFilter] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)

  // Fetch courses
  const { data: courses, isLoading, refetch } = useQuery<CourseListItem[]>({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      const data = await response.json()
      return data.courses || []
    },
  })

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    },
  })

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesPublished = publishedFilter === 'all' || 
                            (publishedFilter === 'published' && course.published) ||
                            (publishedFilter === 'draft' && !course.published)
    const matchesFeatured = featuredFilter === 'all' ||
                           (featuredFilter === 'featured' && course.featured) ||
                           (featuredFilter === 'not-featured' && !course.featured)
    const matchesCategory = !selectedCategory || course.Category?.id === selectedCategory
    
    return matchesSearch && matchesPublished && matchesFeatured && matchesCategory
  })

  const handleDeleteClick = (courseId: string) => {
    setCourseToDelete(courseId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return

    try {
      const response = await fetch(`/api/admin/courses/${courseToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete course')
      }

      toast.success('Course deleted successfully')
      refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete course')
    } finally {
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your course catalog and content
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/courses/new"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Course
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input-field"
            value={publishedFilter}
            onChange={(e) => setPublishedFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            className="input-field"
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value)}
          >
            <option value="all">All Featured</option>
            <option value="featured">Featured</option>
            <option value="not-featured">Not Featured</option>
          </select>
          <select
            className="input-field"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories?.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {filteredCourses?.length || 0} courses found
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="card-hover overflow-hidden">
        {/* Show empty state when no courses exist at all */}
        {courses && courses.length === 0 && !searchTerm && publishedFilter === 'all' && featuredFilter === 'all' && !selectedCategory ? (
          <EmptyCoursesState onCreateCourse={() => window.location.href = '/admin/courses/new'} />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-neutral-100">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-navy-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-navy-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-100">
                  {filteredCourses?.map((course) => (
                    <tr key={course.id} className="table-row group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            {course.thumbnailUrl ? (
                              <img
                                className="h-12 w-16 rounded-lg object-cover shadow-soft group-hover:shadow-medium transition-shadow"
                                src={course.thumbnailUrl}
                                alt={course.title}
                              />
                            ) : (
                              <div className="h-12 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-400">No image</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-navy-800 group-hover:text-teal-600 transition-colors">
                              {course.title}
                            </div>
                            {course.summary && (
                              <div className="text-sm text-navy-500 line-clamp-1">
                                {course.summary}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {course.Category ? (
                          <span className="badge badge-info">
                            {course.Category.name}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No category</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {course.level ? (
                          <span className={`badge ${
                            course.level === 'Beginner' ? 'badge-success' :
                            course.level === 'Intermediate' ? 'badge-warning' :
                            'badge-danger'
                          }`}>
                            {course.level}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-navy-800">
                        {course.currency} {(course.priceCents / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-navy-800">
                            {course._count.Enrollment.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            className="p-2 text-navy-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                            title="View on frontend"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/courses/${course.id}/edit`}
                            className="p-2 text-navy-600 hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-all"
                            title="Edit course"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteClick(course.id)}
                            className="p-2 text-navy-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete course"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCourses?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-400">
                          <p className="text-lg font-medium">No courses found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or create a new course</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredCourses?.map((course) => (
                <div key={course.id} className="bg-white border border-neutral-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      {course.thumbnailUrl ? (
                        <img
                          className="h-20 w-28 rounded-lg object-cover"
                          src={course.thumbnailUrl}
                          alt={course.title}
                        />
                      ) : (
                        <div className="h-20 w-28 rounded-lg bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-navy-800 mb-1 line-clamp-2">
                        {course.title}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {course.Category && (
                          <span className="badge badge-info text-xs">
                            {course.Category.name}
                          </span>
                        )}
                        {course.level && (
                          <span className={`badge text-xs ${
                            course.level === 'Beginner' ? 'badge-success' :
                            course.level === 'Intermediate' ? 'badge-warning' :
                            'badge-danger'
                          }`}>
                            {course.level}
                          </span>
                        )}
                        <span className={`badge text-xs ${
                          course.published ? 'badge-success' : 'badge-neutral'
                        }`}>
                          {course.published ? 'Published' : 'Draft'}
                        </span>
                        {course.featured && (
                          <span className="badge badge-warning text-xs inline-flex items-center">
                            <StarIconSolid className="h-3 w-3 mr-1" />
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-navy-600">
                        <span className="font-semibold">
                          {course.currency} {(course.priceCents / 100).toFixed(2)}
                        </span>
                        <span>
                          {course._count.Enrollment.toLocaleString()} students
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-neutral-100">
                    <Link
                      href={`/courses/${course.slug}`}
                      target="_blank"
                      className="p-2 text-navy-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                      title="View"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="p-2 text-navy-600 hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteClick(course.id)}
                      className="p-2 text-navy-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredCourses?.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg font-medium">No courses found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or create a new course</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone and will also delete all modules, lessons, and related data."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  )
}