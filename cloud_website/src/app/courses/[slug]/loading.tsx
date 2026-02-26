import { CourseHeroSkeleton } from '@/components';

export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Course Hero Skeleton */}
      <CourseHeroSkeleton />

      {/* Course Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation Skeleton */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex space-x-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Content Sections Skeleton */}
            <div className="space-y-8">
              {/* Overview Section */}
              <div>
                <div className="h-8 bg-gray-200 rounded-md w-32 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                </div>
              </div>

              {/* Curriculum Section */}
              <div>
                <div className="h-8 bg-gray-200 rounded-md w-40 mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="h-6 bg-gray-200 rounded-md w-48 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-40 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-36 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor Section */}
              <div>
                <div className="h-8 bg-gray-200 rounded-md w-36 mb-4 animate-pulse"></div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div>
                      <div className="h-6 bg-gray-200 rounded-md w-32 mb-2 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-md w-40 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-5/6 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div>
                <div className="h-8 bg-gray-200 rounded-md w-28 mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded-md w-24 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded-md animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded-md w-4/5 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Enrollment Card Skeleton */}
              <div className="bg-white rounded-lg shadow-lg border p-6 mb-6">
                <div className="h-8 bg-gray-200 rounded-md w-24 mb-4 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full mb-3 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full mb-6 animate-pulse"></div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded-md w-12 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Related Courses Skeleton */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-6 bg-gray-200 rounded-md w-32 mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded-md mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}