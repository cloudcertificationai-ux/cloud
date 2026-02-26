'use client';

import { Course } from '@/types';
import CourseCard from './CourseCard';
import { Card } from '@/components/ui/Card';

interface CourseGridProps {
  courses: Course[];
  loading?: boolean;
  displayMode?: 'grid' | 'list';
  showInstructor?: boolean;
  showCohortInfo?: boolean;
}

export default function CourseGrid({ 
  courses, 
  loading = false,
  displayMode = 'grid',
  showInstructor = true,
  showCohortInfo = false 
}: CourseGridProps) {
  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Card className="h-full animate-pulse" padding="xs">
      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </Card>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        We couldn't find any courses matching your criteria. Try adjusting your filters or search terms.
      </p>
      <button
        onClick={() => window.location.href = '/courses'}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        View All Courses
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className={`grid gap-8 ${
        displayMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="grid grid-cols-1">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{courses.length}</span> course{courses.length !== 1 ? 's' : ''}
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">View:</span>
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('view', 'grid');
                window.location.href = url.toString();
              }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                displayMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('view', 'list');
                window.location.href = url.toString();
              }}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                displayMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              aria-label="List view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className={`grid gap-8 ${
        displayMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
          : 'grid-cols-1 max-w-4xl'
      }`}>
        {courses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course}
            displayMode={displayMode === 'list' ? 'compact' : 'detailed'}
            showInstructor={showInstructor}
            showCohortInfo={showCohortInfo}
          />
        ))}
      </div>

      {/* Load More Button (for future pagination enhancement) */}
      {courses.length > 0 && courses.length % 12 === 0 && (
        <div className="flex justify-center pt-8">
          <button className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Load More Courses
          </button>
        </div>
      )}
    </div>
  );
}