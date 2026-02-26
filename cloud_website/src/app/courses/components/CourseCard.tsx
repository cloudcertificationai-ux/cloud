'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/types';
import { mockDataService } from '@/data/mock-data-service';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface CourseCardProps {
  course: Course;
  displayMode?: 'compact' | 'detailed';
  showInstructor?: boolean;
  showCohortInfo?: boolean;
}

export default function CourseCard({ 
  course, 
  displayMode = 'detailed',
  showInstructor = true,
  showCohortInfo = false 
}: CourseCardProps) {
  // Get instructor information
  const instructors = course.instructorIds
    .map(id => mockDataService.getInstructorById(id))
    .filter(Boolean);

  const primaryInstructor = instructors[0];

  // Calculate discount percentage
  const discountPercentage = course.price.originalPrice 
    ? Math.round((1 - course.price.amount / course.price.originalPrice) * 100)
    : 0;

  // Generate structured data for the course
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.shortDescription,
    "provider": {
      "@type": "Organization",
      "name": "Anywheredoor",
      "url": "https://anywheredoor.com"
    },
    "instructor": instructors.map(instructor => ({
      "@type": "Person",
      "name": instructor!.name
    })),
    "courseCode": course.id,
    "educationalLevel": course.level,
    "timeRequired": `PT${course.duration.hours}H`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": course.rating.average,
      "reviewCount": course.rating.count,
      "bestRating": 5,
      "worstRating": 1
    },
    "offers": {
      "@type": "Offer",
      "price": course.price.amount,
      "priceCurrency": course.price.currency,
      "availability": "https://schema.org/InStock",
      "validFrom": course.createdAt.toISOString()
    }
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <Card 
        className="group h-full flex flex-col overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        padding="xs"
        hover={true}
      >
        {/* Course Thumbnail with Overlay */}
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          <Image
            src={course.thumbnailUrl}
            alt={`${course.title} course thumbnail`}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {/* Course Mode Badge */}
            <Badge
              variant="filled"
              color={course.mode === 'Live' ? 'error' : course.mode === 'Self-Paced' ? 'success' : 'accent'}
              size="sm"
              rounded
            >
              {course.mode}
            </Badge>
            
            {/* Level Badge */}
            <Badge
              variant="outline"
              color="neutral"
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
            >
              {course.level}
            </Badge>
          </div>

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-3 right-3">
              <Badge variant="filled" color="warning" size="sm" rounded>
                {discountPercentage}% OFF
              </Badge>
            </div>
          )}

          {/* Quick Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              variant="primary"
              color="primary"
              size="md"
              className="transform scale-95 group-hover:scale-100 transition-transform duration-200"
            >
              View Details
            </Button>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Category */}
          <div className="mb-3">
            <Badge
              variant="default"
              color="primary"
              size="sm"
              className="text-xs font-semibold"
            >
              {course.category.name}
            </Badge>
          </div>
          
          {/* Course Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            <Link
              href={`/courses/${course.slug}`}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-describedby={`course-${course.id}-description course-${course.id}-meta`}
            >
              {course.title}
            </Link>
          </h3>
          
          {/* Course Description */}
          <p 
            id={`course-${course.id}-description`}
            className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed flex-1"
          >
            {course.shortDescription}
          </p>

          {/* Instructor Information */}
          {showInstructor && primaryInstructor && (
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                {primaryInstructor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {primaryInstructor.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {primaryInstructor.title}
                </p>
              </div>
              {primaryInstructor.rating && (
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {primaryInstructor.rating.average}
                </div>
              )}
            </div>
          )}
          
          {/* Course Meta Information */}
          <div 
            id={`course-${course.id}-meta`}
            className="grid grid-cols-2 gap-4 mb-4 text-sm"
          >
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{course.duration.hours}h</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">{course.enrollmentCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex items-center mr-2" aria-label={`Rating: ${course.rating.average} out of 5 stars`}>
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(course.rating.average)
                        ? 'text-yellow-400'
                        : i < course.rating.average
                        ? 'text-yellow-200'
                        : 'text-gray-200'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {course.rating.average}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({course.rating.count.toLocaleString()})
              </span>
            </div>
            
            {/* Certification Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" color="success" size="sm" className="text-xs">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Certificate
              </Badge>
              <Badge variant="outline" color="primary" size="sm" className="text-xs">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Career Boost
              </Badge>
            </div>
          </div>
          
          {/* Price and CTA */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-gray-900">
                <span className="sr-only">Price: </span>
                ${course.price.amount}
              </span>
              {course.price.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  <span className="sr-only">Original price: </span>
                  ${course.price.originalPrice}
                </span>
              )}
            </div>
            <Button
              variant="primary"
              color="primary"
              size="md"
              className="font-semibold"
              href={`/courses/${course.slug}`}
            >
              Enroll Now
            </Button>
          </div>

          {/* Skills Tags */}
          {course.tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {course.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    color="neutral"
                    size="sm"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge
                    variant="default"
                    color="neutral"
                    size="sm"
                    className="text-xs"
                  >
                    +{course.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
}