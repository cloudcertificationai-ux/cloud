import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { dbDataService } from '@/data/db-data-service';
import { generateCanonicalUrl, generateOrganizationStructuredData } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import Breadcrumb from '@/components/Breadcrumb';
import CourseGrid from '../../components/CourseGrid';
import CoursePagination from '../../components/CoursePagination';
import SortControls from '../../components/SortControls';
import dynamic from 'next/dynamic';
import prisma from '@/lib/db';

const NavigationFlow = dynamic(() => import('@/components/NavigationFlow'));

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  
  // Fetch category
  const category = await prisma.category.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!category) {
    return {
      title: 'Category Not Found | Anywheredoor',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = generateCanonicalUrl(`/courses/category/${category.slug}`);

  return {
    title: `${category.name} Courses - Online Training & Certification | Anywheredoor`,
    description: `Master ${category.name.toLowerCase()} with expert-led online courses. Get certified and advance your career with hands-on training in ${category.name.toLowerCase()}.`,
    keywords: [
      category.name.toLowerCase(),
      `${category.name.toLowerCase()} courses`,
      `${category.name.toLowerCase()} training`,
      `${category.name.toLowerCase()} certification`,
      'online courses',
      'bootcamp',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${category.name} Courses - Anywheredoor`,
      description: `Master ${category.name.toLowerCase()} with expert-led online courses`,
      type: 'website',
      images: ['/og-courses.jpg'],
      url: canonicalUrl,
      siteName: 'Anywheredoor',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} Courses`,
      description: `Master ${category.name.toLowerCase()} with expert-led online courses`,
      images: ['/og-courses.jpg'],
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
}

export default async function CategoryCoursesPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Fetch category
  const category = await prisma.category.findUnique({
    where: { slug: resolvedParams.slug },
  });

  if (!category) {
    notFound();
  }

  // Parse search parameters
  const sortBy = resolvedSearchParams.sortBy as string || 'createdAt';
  const sortOrder = resolvedSearchParams.sortOrder as 'asc' | 'desc' || 'desc';
  const page = parseInt(resolvedSearchParams.page as string) || 1;
  const limit = parseInt(resolvedSearchParams.limit as string) || 12;

  // Fetch courses by category (requirement 10.3)
  const result = await dbDataService.getCourses({
    category: category.id,
    published: true,
    sortBy: sortBy as any,
    sortOrder,
  });

  const allCourses = result.courses;

  // Manual pagination
  const totalCourses = allCourses.length;
  const totalPages = Math.ceil(totalCourses / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCourses = allCourses.slice(startIndex, endIndex);

  const organizationStructuredData = generateOrganizationStructuredData();

  const breadcrumbItems = [
    { label: 'Courses', href: '/courses' },
    { label: category.name }
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {category.name} Courses
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Master {category.name.toLowerCase()} with expert-led online courses. Get certified and advance your career with hands-on training.
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{totalCourses}</div>
                  <div className="text-gray-600">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {allCourses.filter(c => c.level === 'Beginner').length}
                  </div>
                  <div className="text-gray-600">Beginner</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {allCourses.filter(c => c.level === 'Intermediate').length}
                  </div>
                  <div className="text-gray-600">Intermediate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {allCourses.filter(c => c.level === 'Advanced').length}
                  </div>
                  <div className="text-gray-600">Advanced</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {paginatedCourses.length > 0 ? (
              <>
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {totalCourses} Course{totalCourses !== 1 ? 's' : ''} Available
                      </h2>
                      <p className="text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalCourses)} of {totalCourses}
                      </p>
                    </div>
                    
                    {/* Sort Controls */}
                    <Suspense fallback={<div>Loading sort options...</div>}>
                      <SortControls />
                    </Suspense>
                  </div>
                </div>

                <Suspense fallback={<div>Loading courses...</div>}>
                  <CourseGrid courses={paginatedCourses as any} />
                </Suspense>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12">
                    <CoursePagination
                      currentPage={page}
                      totalPages={totalPages}
                      hasMore={page < totalPages}
                      searchParams={searchParams}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No courses available in this category
                </h3>
                <p className="text-gray-600 mb-4">
                  Check back soon for new courses in {category.name}.
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

        {/* Category Benefits Section */}
        {paginatedCourses.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Why Learn {category.name}?
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Career Opportunities
                    </h3>
                    <p className="text-gray-600">
                      High demand for {category.name.toLowerCase()} skills across industries with competitive salaries
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Hands-On Learning
                    </h3>
                    <p className="text-gray-600">
                      Practical projects and real-world scenarios to build your portfolio
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Expert Instructors
                    </h3>
                    <p className="text-gray-600">
                      Learn from industry professionals with years of experience
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Certification
                    </h3>
                    <p className="text-gray-600">
                      Earn recognized certificates to showcase your skills to employers
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
