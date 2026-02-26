import { Metadata } from 'next';
import { Suspense } from 'react';
import { dbDataService } from '@/data/db-data-service';
import { generateCanonicalUrl, generateOrganizationStructuredData } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import Breadcrumb from '@/components/Breadcrumb';
import CourseGrid from '../components/CourseGrid';
import dynamic from 'next/dynamic';

const NavigationFlow = dynamic(() => import('@/components/NavigationFlow'));

export const metadata: Metadata = {
  title: 'Featured Courses - Top Rated Online Training | Anywheredoor',
  description: 'Explore our hand-picked featured courses. Learn from industry experts with our most popular and highly-rated online training programs.',
  keywords: ['featured courses', 'top courses', 'best online courses', 'popular courses', 'highly rated training'],
  alternates: {
    canonical: generateCanonicalUrl('/courses/featured'),
  },
  openGraph: {
    title: 'Featured Courses - Anywheredoor',
    description: 'Explore our hand-picked featured courses. Learn from industry experts with our most popular and highly-rated online training programs.',
    type: 'website',
    images: ['/og-featured-courses.jpg'],
    url: generateCanonicalUrl('/courses/featured'),
    siteName: 'Anywheredoor',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Featured Courses',
    description: 'Explore our hand-picked featured courses',
    images: ['/og-featured-courses.jpg'],
    creator: '@anywheredoor',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function FeaturedCoursesPage() {
  // Fetch featured courses (requirement 10.2)
  const result = await dbDataService.getCourses({
    featured: true,
    published: true,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  const courses = result.courses;

  const organizationStructuredData = generateOrganizationStructuredData();

  const breadcrumbItems = [
    { label: 'Courses', href: '/courses' },
    { label: 'Featured' }
  ];

  return (
    <>
      <StructuredData data={organizationStructuredData} />
      
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>
        
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-6">
                ⭐ Hand-Picked by Experts
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Featured Courses
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover our most popular and highly-rated courses, carefully selected to help you advance your career in technology.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Courses Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {courses.length > 0 ? (
              <>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {courses.length} Featured Course{courses.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600">
                    Top-rated courses recommended by our instructors and students
                  </p>
                </div>

                <Suspense fallback={<div>Loading courses...</div>}>
                  <CourseGrid courses={courses as any} />
                </Suspense>
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No featured courses available
                </h3>
                <p className="text-gray-600 mb-4">
                  Check back soon for our hand-picked featured courses.
                </p>
                <a
                  href="/courses"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse All Courses
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Why These Courses Section */}
        {courses.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Why These Courses Stand Out
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Expert Instructors
                    </h3>
                    <p className="text-gray-600">
                      Learn from industry professionals with years of real-world experience
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Highly Rated
                    </h3>
                    <p className="text-gray-600">
                      Top-rated by thousands of students who have completed these courses
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Career Impact
                    </h3>
                    <p className="text-gray-600">
                      Skills that directly translate to career advancement and job opportunities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <NavigationFlow />
      </div>
    </>
  );
}
