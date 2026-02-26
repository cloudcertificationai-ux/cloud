'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Course, Instructor } from '@/types';
import { StarIcon, ClockIcon, UserGroupIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
import EnrollmentModal from './EnrollmentModal';

interface CourseHeroProps {
  course: Course;
  instructors: Instructor[];
}

export default function CourseHero({ course, instructors }: CourseHeroProps) {
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Information */}
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <nav className="mb-6">
                <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <li>
                    <a href="/" className="hover:text-blue-600">Home</a>
                  </li>
                  <li className="text-gray-400">/</li>
                  <li>
                    <a href="/courses" className="hover:text-blue-600">Courses</a>
                  </li>
                  <li className="text-gray-400">/</li>
                  <li>
                    <a 
                      href={`/courses?category=${course.category.slug}`}
                      className="hover:text-blue-600"
                    >
                      {course.category.name}
                    </a>
                  </li>
                  <li className="text-gray-400 hidden sm:inline">/</li>
                  <li className="text-gray-900 font-medium truncate max-w-xs hidden sm:block">{course.title}</li>
                </ol>
              </nav>

              {/* Course Title and Description */}
              <div className="mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: course.category.color }}
                  >
                    {course.category.name}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {course.level}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {course.mode}
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>
                
                <p className="text-lg text-gray-600 mb-6">
                  {course.shortDescription}
                </p>

                {/* Course Stats */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium text-gray-900">
                      {course.rating.average}
                    </span>
                    <span>({course.rating.count.toLocaleString()} reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-blue-500" />
                    <span>{course.enrollmentCount.toLocaleString()} students</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-green-500" />
                    <span>{course.duration.hours} hours ({course.duration.weeks} weeks)</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AcademicCapIcon className="w-5 h-5 text-purple-500" />
                    <span>Certificate included</span>
                  </div>
                </div>
              </div>

              {/* Instructor Preview */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {instructors.length === 1 ? 'Instructor' : 'Instructors'}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {instructors.map((instructor) => (
                    <div key={instructor.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={instructor.profileImageUrl}
                          alt={instructor.name}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="48px"
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{instructor.name}</p>
                        <p className="text-sm text-gray-600">{instructor.title}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <StarIcon className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-600">
                            {instructor.rating.average} ({instructor.rating.count})
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <button className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          ${course.price.amount}
                        </span>
                        {course.price.originalPrice && (
                          <span className="text-lg text-gray-500 line-through">
                            ${course.price.originalPrice}
                          </span>
                        )}
                      </div>
                      {course.price.originalPrice && (
                        <p className="text-sm text-green-600 font-medium">
                          Save ${course.price.originalPrice - course.price.amount}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => setIsEnrollmentModalOpen(true)}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3"
                    >
                      Enroll Now
                    </button>
                    
                    <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                      Add to Wishlist
                    </button>

                    <div className="mt-6 space-y-3 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{course.duration.weeks} weeks</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total hours:</span>
                        <span className="font-medium">{course.duration.hours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <span className="font-medium">{course.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mode:</span>
                        <span className="font-medium">{course.mode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Certificate:</span>
                        <span className="font-medium text-green-600">Included</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enrollment Modal */}
      <EnrollmentModal
        course={course}
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
      />
    </section>
  );
}