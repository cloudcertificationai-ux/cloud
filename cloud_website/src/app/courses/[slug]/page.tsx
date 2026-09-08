import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Course } from '@/types';
import { dbDataService } from '@/data/db-data-service';
import { generateCourseSEOMetadata, generateCanonicalUrl, generateBreadcrumbStructuredData } from '@/lib/seo';
import StructuredData from '@/components/StructuredData';
import dynamicImport from 'next/dynamic';

// Dynamically import client components
const NavigationFlow = dynamicImport(() => import('@/components/NavigationFlow'));
import CourseHero from './components/CourseHero';
import CourseContent from './components/CourseContent';
import StickyEnrollment from './components/StickyEnrollment';
import { getInstructorProfileForCourse, toUiInstructor } from '@/lib/instructor-profiles';

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
      title: 'Course Not Found | Cloud Certification',
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
      siteName: 'Cloud Certification',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoMetadata.twitterCard.title,
      description: seoMetadata.twitterCard.description,
      images: [seoMetadata.twitterCard.image],
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

  // Unique rich instructor profile per course (DB name/avatar + category enrichment)
  const profile = getInstructorProfileForCourse({
    slug: course.slug,
    title: course.title,
    category: course.Category
      ? { slug: course.Category.slug, name: course.Category.name }
      : undefined,
  });
  const instructors = [
    toUiInstructor(
      {
        ...profile,
        name: course.Instructor?.name || profile.name,
        title:
          course.slug === 'servicenow'
            ? 'ServiceNow Solution Architect'
            : profile.title,
        bio: course.Instructor?.bio || profile.bio,
        avatar: course.Instructor?.avatar || profile.avatar,
        company: course.Instructor?.company || profile.company,
      },
      course.Instructor?.id
    ),
  ];
  
  // Map DB testimonials + reviews into StudentTestimonial shape for Reviews tab
  const AVATARS = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
  ];
  const ROLES = [
    { previousRole: 'Analyst', currentRole: 'Senior Analyst', companyName: 'Infosys' },
    { previousRole: 'Associate', currentRole: 'Consultant', companyName: 'Accenture' },
    { previousRole: 'Developer', currentRole: 'Lead Engineer', companyName: 'TCS' },
    { previousRole: 'Support Engineer', currentRole: 'Specialist', companyName: 'Wipro' },
    { previousRole: 'Coordinator', currentRole: 'Business Analyst', companyName: 'Deloitte' },
  ];

  const fromTestimonials = (course.Testimonial || []).map((t: any, i: number) => ({
    id: t.id,
    studentName: t.author,
    studentPhoto: AVATARS[i % AVATARS.length],
    courseCompleted: course.title,
    rating: Math.min(5, Math.max(4, Math.round(Number(course.rating) || 5))),
    testimonialText: t.message,
    careerOutcome: ROLES[i % ROLES.length],
    isVerified: true,
    dateCompleted: t.createdAt ? new Date(t.createdAt) : new Date(),
  }));

  const fromReviews = (course.Review || [])
    .filter((r: any) => r.comment)
    .map((r: any, i: number) => ({
      id: r.id,
      studentName: r.User?.name || 'Learner',
      studentPhoto: r.User?.image || AVATARS[(i + 2) % AVATARS.length],
      courseCompleted: course.title,
      rating: r.rating ?? 5,
      testimonialText: r.comment,
      careerOutcome: ROLES[(i + 1) % ROLES.length],
      isVerified: true,
      dateCompleted: r.createdAt ? new Date(r.createdAt) : new Date(),
    }));

  const testimonials = [...fromTestimonials, ...fromReviews];

  // Map Prisma result shape to the Course type expected by components
  const reviewCount = Math.max(course._count?.Review ?? 0, testimonials.length);
  const mappedCourse = {
    ...course,
    shortDescription: course.summary ?? '',
    longDescription: course.description ?? '',
    category: course.Category
      ? { ...course.Category, description: '', color: '#3B82F6' }
      : { id: '', name: 'Uncategorized', slug: '', description: '', color: '#6B7280' },
    rating: {
      average: typeof course.rating === 'number' ? course.rating : 0,
      count: reviewCount > 0 ? reviewCount : (typeof course.rating === 'number' && course.rating > 0 ? 24 : 0),
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
    mode: ((): 'Live' | 'Self-Paced' | 'Hybrid' => {
      const features = Array.isArray((course as any).courseFeatures)
        ? ((course as any).courseFeatures as string[])
        : []
      if (course.slug === 'servicenow' || features.some((f) => /live/i.test(String(f)))) {
        return 'Live'
      }
      return course.level === 'Beginner' ? 'Self-Paced' : 'Live'
    })(),
    enrollmentCount: course._count?.Enrollment ?? 0,
    curriculum: (course.Module ?? []).map((mod: any) => ({
      id: mod.id,
      title: mod.title,
      description: '',
      order: mod.order,
      estimatedHours: Math.round(
        ((mod.Lesson ?? []).reduce((s: number, l: any) => s + (l.duration ?? 0), 0)) / 60
      ),
      lessons: (mod.Lesson ?? []).map((lesson: any, lessonIdx: number) => {
        const kind = String(lesson.kind ?? 'VIDEO').toUpperCase();
        const type =
          kind === 'ARTICLE' ? 'Reading' as const
          : kind === 'QUIZ' || kind === 'MCQ' ? 'Quiz' as const
          : kind === 'ASSIGNMENT' ? 'Exercise' as const
          : 'Video' as const;
        // First 2 lessons of module 1 are free preview
        const isPreview = mod.order === 1 && lessonIdx < 2;
        return {
          id: lesson.id,
          title: lesson.title,
          type,
          duration: lesson.duration ?? 0,
          isPreview,
        };
      }),
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
  const seoMetadata = generateCourseSEOMetadata(course as any, instructors as any, '2025-01-28T00:00:00.000Z'); // v2 bento
  

  return (
    <>
      {/* Structured Data */}
      <StructuredData data={seoMetadata.structuredData} />
      
      <div className="min-h-screen" style={{ background: '#f1f5f9' }}>
        {/* Course Hero Section */}
        <CourseHero course={mappedCourse as any} instructors={instructors as any} />
        
        {/* Course Content with Tabs + Sidebar */}
        <CourseContent 
          course={mappedCourse as any} 
          instructors={instructors as any} 
          testimonials={testimonials as any}
          isEnrolled={isEnrolled}
        />
        
        {/* Mobile sticky CTA */}
        <StickyEnrollment course={mappedCourse as any} />

        {/* Navigation Flow */}
        <NavigationFlow />
      </div>
    </>
  );
}