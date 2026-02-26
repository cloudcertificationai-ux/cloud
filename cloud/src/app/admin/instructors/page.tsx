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
  StarIcon,
} from '@heroicons/react/24/outline'
import { Instructor } from '@/types'

export default function InstructorsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExpertise, setSelectedExpertise] = useState('')

  const { data: instructors, isLoading } = useQuery({
    queryKey: ['instructors'],
    queryFn: async () => {
      const response = await fetch('/api/admin/instructors')
      if (!response.ok) throw new Error('Failed to fetch instructors')
      return response.json()
    },
  })

  const filteredInstructors = instructors?.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.bio.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesExpertise = !selectedExpertise || instructor.expertise.includes(selectedExpertise)
    
    return matchesSearch && matchesExpertise
  })

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const allExpertise: string[] = Array.from(
    new Set(instructors?.flatMap(instructor => instructor.expertise) || [])
  )

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your instructor team and their profiles
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/instructors/new"
            className="btn-primary inline-flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Instructor
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search instructors..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input-field"
            value={selectedExpertise}
            onChange={(e) => setSelectedExpertise(e.target.value)}
          >
            <option value="">All Expertise</option>
            {allExpertise.map((skill, index) => (
              <option key={index} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Instructors Grid */}
      {filteredInstructors && filteredInstructors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((instructor) => (
          <div key={instructor.id} className="card">
            <div className="flex items-center space-x-4 mb-4">
              <img
                className="h-16 w-16 rounded-full object-cover"
                src={instructor.profileImageUrl}
                alt={instructor.name}
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{instructor.name}</h3>
                <p className="text-sm text-gray-600">{instructor.title}</p>
                <div className="flex items-center mt-1">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">
                    {instructor.rating.average} ({instructor.rating.count} reviews)
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{instructor.bio}</p>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise</h4>
              <div className="flex flex-wrap gap-2">
                {instructor.expertise.slice(0, 4).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {instructor.expertise.length > 4 && (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    +{instructor.expertise.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Experience: {instructor.experience.years} years</span>
                <span>Courses: {instructor.courseIds.length}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {instructor.socialLinks.linkedin && (
                  <a
                    href={instructor.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    LinkedIn
                  </a>
                )}
                {instructor.socialLinks.github && (
                  <a
                    href={instructor.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800"
                  >
                    GitHub
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  href={`/admin/instructors/${instructor.id}`}
                  className="text-primary-600 hover:text-primary-900"
                >
                  <EyeIcon className="h-5 w-5" />
                </Link>
                <Link
                  href={`/admin/instructors/${instructor.id}/edit`}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button className="text-red-600 hover:text-red-900">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedExpertise 
              ? 'No instructors found matching your criteria.' 
              : 'No instructors yet. Add your first instructor to get started.'}
          </p>
          {!searchTerm && !selectedExpertise && (
            <Link
              href="/admin/instructors/new"
              className="btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add First Instructor
            </Link>
          )}
        </div>
      )}
    </div>
  )
}