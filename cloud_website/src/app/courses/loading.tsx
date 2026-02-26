import { CourseCardSkeleton, PageHeaderSkeleton } from '@/components';

export default function CoursesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header skeleton */}
      <PageHeaderSkeleton />

      {/* Filter sidebar and course grid skeleton */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter sidebar skeleton */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="h-6 bg-gray-200 rounded-md w-20 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Course grid skeleton */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}