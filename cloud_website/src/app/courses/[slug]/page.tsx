import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Course } from '@/types';
import { dbDataService } from '@/data/db-data-service';
import { generateCourseSEOMetadata, generateCanonicalUrl, generateBreadcrumbStructuredData } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import Breadcrumb from '@/components/Breadcrumb';
import SocialShare from '@/components/SocialShare';
import dynamicImport from 'next/dynamic';

// Dynamically import client components
const NavigationFlow = dynamicImport(() => import('@/components/NavigationFlow'));
import CourseHero from './components/CourseHero';
import CourseContent from './components/CourseContent';
import StickyEnrollment from './components/StickyEnrollment';

interface CourseDetailPageProps {
  params: { slug: string };
}

// Enable ISR with revalidation (Requirement 12.1, 12.2, 12.3, 12.4)
export const revalidate = 1800; // Revalidate every 30 minutes

// Generate static params for popular courses at build time
export async function generateStaticParams() {
  try {
    // Fetch featured and popular courses to pre-generate at build time
    const { courses } = await dbDataService.getCourses({
      published: true,
      featured: true,
      pageSize: 20, // Pre-generate top 20 courses
    });
    
    return courses.map((course) => ({
      slug: course.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO with enhanced structured data
export async function generateMetadata({ params }: CourseDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  let course = null;
  
  try {
    course = await dbDataService.getCourseBySlug(resolvedParams.slug);
  } catch (error) {
    console.error('Error fetching course for metadata during build:', error);
  }
  
  if (!course) {
    return {
      title: 'Course Not Found | Anywheredoor',
      description: 'The requested course could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  // Get instructors - the course already includes Instructor from the database query
  const instructors = course.Instructor ? [course.Instructor] : [];
  // Use static time for SSG to avoid the new Date() issue
  const seoMetadata = generateCourseSEOMetadata(course as any, instructors as any);
  
  return {
    title: seoMetadata.title,
    description: seoMetadata.description,
    keywords: seoMetadata.keywords,
    alternates: {
      canonical: seoMetadata.canonicalUrl,
    },
    openGraph: {
      title: seoMetadata.openGraph.title,
      description: seoMetadata.openGraph.description,
      type: 'website',
      images: [
        {
          url: seoMetadata.openGraph.image,
          width: 1200,
          height: 630,
          alt: `${course.title} - Online Course`,
        },
      ],
      url: seoMetadata.canonicalUrl,
      siteName: 'Anywheredoor',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoMetadata.twitterCard.title,
      description: seoMetadata.twitterCard.description,
      images: [seoMetadata.twitterCard.image],
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

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const resolvedParams = await params;
  let course = null;
  
  try {
    course = await dbDataService.getCourseBySlug(resolvedParams.slug);
  } catch (error) {
    console.error('Error fetching course during build:', error);
    notFound();
  }
  
  if (!course) {
    notFound();
  }

  // Check if course is published (requirement 8.3)
  if (!course.published) {
    notFound();
  }

  // Map Prisma instructor shape to the Instructor type expected by components
  const instructors = course.Instructor
    ? [{
        ...course.Instructor,
        title: course.Instructor.company ?? '',
        profileImageUrl: course.Instructor.avatar || '/images/default-avatar.png',
        expertise: [],
        experience: { years: 0, companies: course.Instructor.company ? [course.Instructor.company] : [] },
        socialLinks: {},
        courseIds: [],
        rating: { average: 0, count: 0 },
      }]
    : [];
  
  // Get testimonials for this course - already included in the query
  const testimonials = course.Testimonial || [];

  // Map Prisma result shape to the Course type expected by components
  const reviewCount = course._count?.Review ?? 0;
  const mappedCourse = {
    ...course,
    shortDescription: course.summary ?? '',
    longDescription: course.description ?? '',
    category: course.Category
      ? { ...course.Category, description: '', color: '#3B82F6' }
      : { id: '', name: 'Uncategorized', slug: '', description: '', color: '#6B7280' },
    rating: {
      average: typeof course.rating === 'number' ? course.rating : 0,
      count: reviewCount,
    },
    duration: {
      hours: course.durationMin ? Math.round(course.durationMin / 60) : 0,
      weeks: course.durationMin ? Math.round(course.durationMin / 60 / 5) : 0,
    },
    price: {
      amount: course.priceCents ? course.priceCents / 100 : 0,
      currency: course.currency ?? 'USD',
      originalPrice: undefined,
    },
    mode: (course.level === 'Beginner' ? 'Self-Paced' : 'Live') as 'Live' | 'Self-Paced' | 'Hybrid',
    enrollmentCount: course._count?.Enrollment ?? 0,
    curriculum: (course.Module ?? []).map((mod: any) => ({
      id: mod.id,
      title: mod.title,
      description: '',
      order: mod.order,
      estimatedHours: 0,
      lessons: (mod.Lesson ?? []).map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        type: 'Video' as const,
        duration: lesson.duration ?? 0,
        isPreview: false,
      })),
    })),
    thumbnailUrl: course.thumbnailUrl || '/images/course-placeholder.jpg',
    tags: [],
    isActive: course.published ?? false,
    instructorIds: course.Instructor ? [course.Instructor.id] : [],
    cohorts: [],
    // Rich content fields
    language: (course as any).language ?? 'English',
    learningOutcomes: (course as any).learningOutcomes ?? [],
    handsOnProjects: (course as any).handsOnProjects ?? [],
    caseStudies: (course as any).caseStudies ?? [],
    courseFeatures: (course as any).courseFeatures ?? [],
    requirements: (course as any).requirements ?? [],
    certifications: (course as any).certifications ?? [],
  };

  // Check enrollment status (requirement 8.1)
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');

  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // JWT decryption can fail when NEXTAUTH_SECRET rotates or cookie is stale — treat as unauthenticated
  }

  let isEnrolled = false;
  if (session?.user?.id) {
    try {
      const enrollment = await dbDataService.checkEnrollment(session.user.id, course.id);
      isEnrolled = enrollment?.status === 'ACTIVE';
    } catch (error) {
      console.error('Error checking enrollment during build:', error);
    }
  }

  // Generate SEO metadata and structured data - use static time for build
  const seoMetadata = generateCourseSEOMetadata(course as any, instructors as any, '2025-01-28T00:00:00.000Z');
  
  // Generate breadcrumb data
  const breadcrumbItems = [
    { label: 'Courses', href: '/courses' },
    { label: mappedCourse.category.name, href: `/courses?category=${mappedCourse.category.slug}` },
    { label: course.title }
  ];

  return (
    <>
      {/* Structured Data */}
      <StructuredData data={seoMetadata.structuredData} />
      
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Breadcrumb items={breadcrumbItems} />
              <SocialShare 
                url={seoMetadata.canonicalUrl}
                title={course.title}
                description={course.summary || ''}
                className="flex-shrink-0"
              />
            </div>
          </div>
        </div>
        
        {/* Course Hero Section */}
        <CourseHero course={mappedCourse as any} instructors={instructors as any} />
        
        {/* Course Content with Tabs */}
        <CourseContent 
          course={mappedCourse as any} 
          instructors={instructors as any} 
          testimonials={testimonials as any}
          isEnrolled={isEnrolled}
        />
        
        {/* Sticky Enrollment CTA */}
        <StickyEnrollment course={mappedCourse as any} />

        {/* Navigation Flow */}
        <NavigationFlow />
      </div>
    </>
  );
}