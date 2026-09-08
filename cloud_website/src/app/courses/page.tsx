import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { dbDataService } from '@/data/db-data-service';
import { generateCanonicalUrl, generateOrganizationStructuredData } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import SearchBar from '@/components/SearchBar';
import dynamic from 'next/dynamic';
import { EmptyCoursesState } from '@/components/ui/EmptyStates';
import prisma from '@/lib/db';
import { CourseCategory } from '@/types';

// Dynamically import client components
const NavigationFlow = dynamic(() => import('@/components/NavigationFlow'));
import CourseGrid from './components/CourseGrid';
import CoursePagination from './components/CoursePagination';
import SortControls from './components/SortControls';
import ViewToggle from './components/ViewToggle';

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
    title = `${categoryParam} Courses - Online Training & Certification | Cloud Certification`;
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
    title = `"${query}" Courses - Search Results | Cloud Certification`;
    description = `Find the best online courses for "${query}". Expert-led training programs to advance your tech career with hands-on learning and certification.`;
    keywords = [query.toLowerCase(), 'online courses', 'training', 'certification', 'bootcamp'];
  } else {
    title = 'Online Courses - Programming, Data Science & Cybersecurity | Cloud Certification';
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
      title: categoryParam ? `${categoryParam} Courses - Cloud Certification` : 'Online Courses - Cloud Certification',
      description,
      type: 'website',
      images: ['/og-courses.jpg'],
      url: canonicalUrl,
      siteName: 'Cloud Certification',
    },
    twitter: {
      card: 'summary_large_image',
      title: categoryParam ? `${categoryParam} Courses` : 'Online Courses',
      description,
      images: ['/og-courses.jpg'],
      creator: '@Cloud Certification',
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
  const view = (resolvedSearchParams.view as string) === 'list' ? 'list' : 'grid';

  // Fetch categories from database
  let categoriesFromDb: Array<{ id: string; name: string; slug: string }> = [];
  try {
    categoriesFromDb = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error('Error fetching categories during build:', error);
  }

  // Map to CourseCategory type with defaults
  const categories: CourseCategory[] = categoriesFromDb.map(cat => ({
    ...cat,
    description: '',
    color: '#3B82F6',
  }));

  // Get search results using the database service
  let searchResults: Awaited<ReturnType<typeof dbDataService.getCourses>> = { 
    courses: [], 
    total: 0, 
    page: 1, 
    pageSize: limit, 
    totalPages: 0 
  };
  try {
    searchResults = await dbDataService.getCourses({
      category: categoryParam,
      level: levelParam,
      search: query,
      published: true,
      page,
      pageSize: limit,
      sortBy,
      sortOrder,
    });
  } catch (error) {
    console.error('Error fetching courses during build:', error);
  }

  // Platform-wide stats for the hero bento cells
  let totalPublishedCourses = 0;
  let totalLearners = 0;
  let avgRating = 0;
  try {
    const [courseCount, enrollmentCount, ratingAgg] = await Promise.all([
      prisma.course.count({ where: { published: true } }),
      prisma.enrollment.count(),
      prisma.course.aggregate({ where: { published: true, rating: { gt: 0 } }, _avg: { rating: true } }),
    ]);
    totalPublishedCourses = courseCount;
    totalLearners = enrollmentCount;
    avgRating = ratingAgg._avg.rating || 0;
  } catch (error) {
    console.error('Error fetching hero stats during build:', error);
  }

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

  return (
    <>
      {/* Structured Data */}
      <StructuredData data={organizationStructuredData} />

      <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
        {/* ═══════════════ DARK BENTO HERO ═══════════════ */}
        <div style={{ background: 'linear-gradient(160deg,#080f1e 0%,#0f1e3c 50%,#0f172a 100%)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#475569' }}>
              <span className="text-slate-300">Home</span>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
              <span className="text-slate-400">
                {selectedCategory ? selectedCategory.name : query ? `"${query}"` : 'All Courses'}
              </span>
            </div>

            {/* ══ BENTO GRID ══ */}
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
              {/* CELL 1: Headline + search — col 1-8 */}
              <div
                className="rounded-2xl p-6 lg:p-8 flex flex-col justify-center"
                style={{
                  gridColumn: '1 / 9',
                  gridRow: '1 / 2',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  minHeight: '210px',
                }}
              >
                <span className="text-[11px] font-bold px-3 py-1 rounded-full w-fit mb-4"
                  style={{ background: 'rgba(29,78,216,0.2)', color: '#93c5fd' }}>
                  {totalPublishedCourses}+ courses live
                </span>
                <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3"
                  style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                  {selectedCategory
                    ? `${selectedCategory.name} Courses`
                    : query
                    ? `Results for "${query}"`
                    : 'Find your next skill'}
                </h1>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#64748b', maxWidth: '480px' }}>
                  Expert-led, job-focused programs across cloud, AI, security, data and enterprise platforms. Build real projects and get certified.
                </p>
                <div className="max-w-md">
                  <SearchBar
                    placeholder="Search courses, skills, tools…"
                    className="[&_input]:h-12 [&_input]:rounded-xl [&_input]:text-sm"
                  />
                </div>
              </div>

              {/* CELL 2: Stats stack — col 9-12 */}
              <div className="hidden lg:grid gap-3" style={{ gridColumn: '9 / 13', gridRow: '1 / 2', gridTemplateColumns: '1fr 1fr' }}>
                <div className="rounded-2xl p-4 flex flex-col justify-between" style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.15)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#0369a1' }}>Courses</p>
                  <p className="text-2xl font-extrabold" style={{ color: '#38bdf8' }}>{totalPublishedCourses}+</p>
                </div>
                <div className="rounded-2xl p-4 flex flex-col justify-between" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#5b21b6' }}>Learners</p>
                  <p className="text-2xl font-extrabold" style={{ color: '#a78bfa' }}>
                    {totalLearners > 999 ? `${(totalLearners / 1000).toFixed(1)}k` : totalLearners}
                  </p>
                </div>
                <div className="rounded-2xl p-4 flex flex-col justify-between" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#92400e' }}>Avg. rating</p>
                  <p className="text-2xl font-extrabold" style={{ color: '#fbbf24' }}>{avgRating > 0 ? avgRating.toFixed(1) : '4.8'}</p>
                </div>
                <div className="rounded-2xl p-4 flex flex-col justify-between" style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#065f46' }}>Categories</p>
                  <p className="text-2xl font-extrabold" style={{ color: '#34d399' }}>{categories.length}</p>
                </div>
              </div>

              {/* CELL 3: Category chips — full width */}
              <div
                className="rounded-2xl p-4 lg:p-5"
                style={{
                  gridColumn: '1 / 13',
                  gridRow: '2 / 3',
                  background: 'rgba(29,78,216,0.06)',
                  border: '1px solid rgba(29,78,216,0.12)',
                }}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href="/courses"
                    className="text-xs font-bold px-4 py-2 rounded-full transition-all"
                    style={
                      !categoryParam
                        ? { background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)', color: '#fff' }
                        : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                  >
                    All Courses
                  </Link>
                  {categories.map((category: any) => {
                    const active = categoryParam === category.slug || categoryParam === category.id;
                    return (
                      <Link
                        key={category.id}
                        href={`/courses?category=${category.slug}`}
                        className="text-xs font-bold px-4 py-2 rounded-full transition-all"
                        style={
                          active
                            ? { background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)', color: '#fff' }
                            : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }
                        }
                      >
                        {category.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* SaaS dashboard-style toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-slate-200 px-5 py-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {paginatedResults.total} Course{paginatedResults.total !== 1 ? 's' : ''} found
                </h2>
                {query && (
                  <p className="text-sm text-slate-500 mt-0.5">Search results for &ldquo;{query}&rdquo;</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Suspense fallback={<div className="h-10 w-40 bg-slate-100 rounded-xl animate-pulse" />}>
                  <SortControls />
                </Suspense>
                <div className="w-px h-6 bg-slate-200 hidden sm:block" />
                <ViewToggle view={view} />
              </div>
            </div>

            <Suspense fallback={<div>Loading courses...</div>}>
              <CourseGrid courses={paginatedResults.courses as any} displayMode={view} />
            </Suspense>

            {/* Pagination */}
            {paginatedResults.totalPages > 1 && (
              <div className="mt-8">
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
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-2">No courses found</h3>
                <p className="text-slate-500 mb-6 text-sm">
                  Try adjusting your search criteria or browse all categories.
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(90deg,#1d4ed8,#0ea5e9)' }}
                >
                  View All Courses
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Navigation Flow */}
        <NavigationFlow />
      </div>
    </>
  );
}
