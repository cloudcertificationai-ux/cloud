import { Metadata } from 'next';
import { Suspense } from 'react';
import { dbDataService } from '@/data/db-data-service';
import { generateCanonicalUrl, generateOrganizationStructuredData } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import Breadcrumb from '@/components/Breadcrumb';
import dynamic from 'next/dynamic';
import { EmptyCoursesState } from '@/components/ui/EmptyStates';
import prisma from '@/lib/db';
import { CourseCategory } from '@/types';

// Dynamically import client components
const NavigationFlow = dynamic(() => import('@/components/NavigationFlow'));
import CourseGrid from './components/CourseGrid';
import AdvancedFilters from './components/AdvancedFilters';
import CoursePagination from './components/CoursePagination';
import SortControls from './components/SortControls';

// This page uses ISR (Incremental Static Regeneration) for optimal performance
// Enable ISR with revalidation (Requirement 12.1, 12.2, 12.3, 12.4)
export const revalidate = 900; // Revalidate every 15 minutes

// Enhanced metadata generation with dynamic content
export async function generateMetadata({ searchParams }: CoursePageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const categoryParam = resolvedSearchParams.category as string;
  const query = resolvedSearchParams.search as string || resolvedSearchParams.q as string || '';
  
  // For now, we'll use a simple title/description since we don't have categories in the database yet
  let title: string;
  let description: string;
  let keywords: string[];
  
  if (categoryParam) {
    title = `${categoryParam} Courses - Online Training & Certification | Anywheredoor`;
    description = `Master ${categoryParam.toLowerCase()} with expert-led online courses. Get certified and advance your career with hands-on training.`;
    keywords = [
      categoryParam.toLowerCase(),
      `${categoryParam.toLowerCase()} courses`,
      `${categoryParam.toLowerCase()} training`,
      `${categoryParam.toLowerCase()} certification`,
      'online courses',
      'bootcamp',
      'career advancement',
    ];
  } else if (query) {
    title = `"${query}" Courses - Search Results | Anywheredoor`;
    description = `Find the best online courses for "${query}". Expert-led training programs to advance your tech career with hands-on learning and certification.`;
    keywords = [query.toLowerCase(), 'online courses', 'training', 'certification', 'bootcamp'];
  } else {
    title = 'Online Courses - Programming, Data Science & Cybersecurity | Anywheredoor';
    description = 'Browse our comprehensive catalog of online courses in web development, data science, cybersecurity, and cloud computing. Expert-led training for career advancement.';
    keywords = ['online courses', 'programming courses', 'data science training', 'cybersecurity bootcamp', 'cloud computing certification'];
  }
  
  const canonicalUrl = generateCanonicalUrl('/courses');
  
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: categoryParam ? `${categoryParam} Courses - Anywheredoor` : 'Online Courses - Anywheredoor',
      description,
      type: 'website',
      images: ['/og-courses.jpg'],
      url: canonicalUrl,
      siteName: 'Anywheredoor',
    },
    twitter: {
      card: 'summary_large_image',
      title: categoryParam ? `${categoryParam} Courses` : 'Online Courses',
      description,
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

interface CoursePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CoursesPage({ searchParams }: CoursePageProps) {
  // Parse search parameters
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.search as string || resolvedSearchParams.q as string || '';
  const categoryParam = resolvedSearchParams.category as string;
  const levelParam = resolvedSearchParams.level as string;
  const modeParam = resolvedSearchParams.mode as string;
  const sortBy = resolvedSearchParams.sortBy as string || 'createdAt';
  const sortOrder = resolvedSearchParams.sortOrder as 'asc' | 'desc' || 'desc';
  const page = parseInt(resolvedSearchParams.page as string) || 1;
  const limit = parseInt(resolvedSearchParams.limit as string) || 12;

  // Fetch categories from database
  const categoriesFromDb = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' }
  });

  // Map to CourseCategory type with defaults
  const categories: CourseCategory[] = categoriesFromDb.map(cat => ({
    ...cat,
    description: '',
    color: '#3B82F6',
  }));

  // Get search results using the database service
  const searchResults = await dbDataService.getCourses({
    category: categoryParam,
    level: levelParam,
    search: query,
    published: true,
    page,
    pageSize: limit,
    sortBy,
    sortOrder,
  });

  // Calculate price and duration ranges from database
  const priceStats = await prisma.course.aggregate({
    where: { published: true },
    _min: { priceCents: true },
    _max: { priceCents: true },
  });

  const durationStats = await prisma.course.aggregate({
    where: { published: true },
    _min: { durationMin: true },
    _max: { durationMin: true },
  });

  const priceRange = {
    min: priceStats._min.priceCents ? Math.floor(priceStats._min.priceCents / 100) : 0,
    max: priceStats._max.priceCents ? Math.ceil(priceStats._max.priceCents / 100) : 1000,
  };

  const durationRange = {
    min: durationStats._min.durationMin || 0,
    max: durationStats._max.durationMin || 500,
  };

  const selectedCategory = categories.find((cat: any) => cat.slug === categoryParam || cat.id === categoryParam);

  // Calculate pagination
  const totalPages = Math.ceil(searchResults.total / limit);
  const hasMore = page < totalPages;

  const paginatedResults = {
    courses: searchResults.courses,
    total: searchResults.total,
    page,
    totalPages,
    hasMore,
  };

  // Generate organization structured data
  const organizationStructuredData = generateOrganizationStructuredData();

  // Generate breadcrumb data
  const breadcrumbItems = selectedCategory 
    ? [{ label: 'Courses', href: '/courses' }, { label: selectedCategory.name }]
    : [{ label: 'Courses' }];

  return (
    <>
      {/* Structured Data */}
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
              {selectedCategory ? (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {selectedCategory.name} Courses
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    {selectedCategory.description}. Master the skills that top employers are looking for.
                  </p>
                </>
              ) : query ? (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    Search Results for "{query}"
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Find the perfect course to advance your career in technology.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    All Courses
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    Explore our comprehensive catalog of expert-led courses designed to advance your tech career.
                  </p>
                </>
              )}
              
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category: any) => (
                  <a
                    key={category.id}
                    href={`/courses?category=${category.slug}`}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      categoryParam === category.slug || categoryParam === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <aside className="lg:w-1/4">
                <Suspense fallback={<div>Loading filters...</div>}>
                  <AdvancedFilters
                    categories={categories}
                    priceRange={priceRange}
                    durationRange={durationRange}
                  />
                </Suspense>
              </aside>

              {/* Course Results */}
              <main className="lg:w-3/4">
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {paginatedResults.total} Course{paginatedResults.total !== 1 ? 's' : ''} Found
                      </h2>
                      {query && (
                        <p className="text-gray-600">
                          Search results for "{query}"
                        </p>
                      )}
                    </div>
                    
                    {/* Sort Controls */}
                    <Suspense fallback={<div>Loading sort options...</div>}>
                      <SortControls />
                    </Suspense>
                  </div>
                </div>

                <Suspense fallback={<div>Loading courses...</div>}>
                  <CourseGrid courses={paginatedResults.courses as any} />
                </Suspense>

                {/* Pagination */}
                {paginatedResults.totalPages > 1 && (
                  <div className="mt-12">
                    <CoursePagination
                      currentPage={paginatedResults.page}
                      totalPages={paginatedResults.totalPages}
                      hasMore={paginatedResults.hasMore}
                      searchParams={searchParams}
                    />
                  </div>
                )}

                {/* Empty State */}
                {paginatedResults.courses.length === 0 && paginatedResults.total === 0 && !query && !categoryParam && (
                  <EmptyCoursesState />
                )}

                {/* No Results State (when filtering/searching) */}
                {paginatedResults.courses.length === 0 && (query || categoryParam) && (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No courses found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your search criteria or browse all categories.
                    </p>
                    <a
                      href="/courses"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View All Courses
                    </a>
                  </div>
                )}
              </main>
            </div>
          </div>
        </section>

        {/* Navigation Flow */}
        <NavigationFlow />
      </div>
    </>
  );
}