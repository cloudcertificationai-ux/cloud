import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbDataService } from '@/data/db-data-service';
import LessonPlayerPage from './components/LessonPlayerPage';

interface LearnPageProps {
  params: { slug: string };
  searchParams: { lesson?: string };
}

export async function generateMetadata({ params }: LearnPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const course = await dbDataService.getCourseBySlug(resolvedParams.slug);
  
  if (!course) {
    return {
      title: 'Course Not Found | Anywheredoor',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Learn ${course.title} | Anywheredoor`,
    description: `Continue learning ${course.title}`,
    robots: { index: false, follow: false }, // Don't index lesson pages
  };
}

export default async function LearnPage({ params, searchParams }: LearnPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // Check authentication (requirement 15.2)
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/courses/${resolvedParams.slug}/learn`);
  }

  // Fetch course with curriculum
  const course = await dbDataService.getCourseBySlug(resolvedParams.slug);
  
  if (!course) {
    notFound();
  }

  // Check if course is published
  if (!course.published) {
    notFound();
  }

  // Check enrollment and access (requirement 15.2, 15.4)
  const enrollment = await dbDataService.checkEnrollment(session.user.id, course.id);
  
  if (!enrollment) {
    // Not enrolled - redirect to course page with enrollment CTA
    redirect(`/courses/${resolvedParams.slug}?enroll=true`);
  }

  // Check enrollment status (requirement 15.4)
  if (enrollment.status === 'CANCELLED' || enrollment.status === 'REFUNDED') {
    // Redirect to a restricted access page
    redirect(`/courses/${resolvedParams.slug}/access-restricted?status=${enrollment.status}`);
  }

  if (enrollment.status !== 'ACTIVE') {
    // Other non-active statuses - redirect to course page
    redirect(`/courses/${resolvedParams.slug}?enroll=true`);
  }

  // Get user's progress
  const progressResult = await dbDataService.getCourseProgress(session.user.id, course.id);
  const progressData = progressResult?.progress || [];

  // Determine which lesson to show
  let currentLessonId = resolvedSearchParams.lesson;
  
  // If no lesson specified, show the last accessed or first lesson
  if (!currentLessonId) {
    if (progressData && progressData.length > 0) {
      // Find the last accessed lesson or first incomplete lesson
      const lastAccessed = progressData.reduce((latest, current) => {
        return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
      });
      currentLessonId = lastAccessed.lessonId || undefined;
    }
    
    // If still no lesson, use the first lesson
    if (!currentLessonId && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
      currentLessonId = course.modules[0].lessons[0].id;
    }
  }

  if (!currentLessonId) {
    // No lessons in course
    redirect(`/courses/${resolvedParams.slug}`);
  }

  return (
    <LessonPlayerPage
      course={course as any}
      currentLessonId={currentLessonId}
      userId={session.user.id}
      initialProgress={progressData}
    />
  );
}
