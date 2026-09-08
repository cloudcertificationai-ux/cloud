'use client';

import { Course } from '@/types';
import CourseCard from './CourseCard';
import DbCourseCard, { DbCourse } from './DbCourseCard';

function isDbCourse(course: Course | DbCourse): course is DbCourse {
  return 'priceCents' in course;
}

interface CourseGridProps {
  courses: (Course | DbCourse)[];
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
  showCohortInfo = false,
}: CourseGridProps) {
  const LoadingSkeleton = () => (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-4/5" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-3/5" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-7 bg-slate-100 rounded-lg" />
          <div className="h-7 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-1/4" />
          <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed border-slate-200 bg-white">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(29,78,216,0.06)' }}>
        <svg className="w-10 h-10" style={{ color: '#1d4ed8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">No courses found</h3>
      <p className="text-slate-500 text-center max-w-md mb-6 text-sm">
        We couldn't find any courses matching your criteria. Try adjusting your filters or search terms.
      </p>
      <button
        onClick={() => (window.location.href = '/courses')}
        className="text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-transform hover:scale-105"
        style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
      >
        View All Courses
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className={`grid gap-6 ${displayMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1'}`}>
        {Array.from({ length: 8 }).map((_, index) => (
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
    <div className={`grid gap-6 ${displayMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid-cols-1 max-w-4xl'}`}>
      {courses.map((course) =>
        isDbCourse(course) ? (
          <DbCourseCard
            key={course.id}
            course={course}
            displayMode={displayMode === 'list' ? 'compact' : 'detailed'}
            showInstructor={showInstructor}
          />
        ) : (
          <CourseCard
            key={course.id}
            course={course}
            displayMode={displayMode === 'list' ? 'compact' : 'detailed'}
            showInstructor={showInstructor}
            showCohortInfo={showCohortInfo}
          />
        )
      )}
    </div>
  );
}
