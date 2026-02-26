import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbDataService } from '@/data/db-data-service';
import { hasCompletedCourse } from '@/lib/course-completion';
import CourseCompletedContent from './components/CourseCompletedContent';

interface CourseCompletedPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CourseCompletedPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const course = await dbDataService.getCourseBySlug(resolvedParams.slug);
  
  if (!course) {
    return {
      title: 'Course Not Found | Anywheredoor',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Congratulations! - ${course.title} | Anywheredoor`,
    description: `You've completed ${course.title}!`,
    robots: { index: false, follow: false },
  };
}

export default async function CourseCompletedPage({ params }: CourseCompletedPageProps) {
  const resolvedParams = await params;
  
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/courses/${resolvedParams.slug}`);
  }

  // Fetch course
  const course = await dbDataService.getCourseBySlug(resolvedParams.slug);
  
  if (!course) {
    notFound();
  }

  // Check if user has actually completed the course
  const isCompleted = await hasCompletedCourse(session.user.id, course.id);
  
  if (!isCompleted) {
    // Not completed yet, redirect to learn page
    redirect(`/courses/${resolvedParams.slug}/learn`);
  }

  // Get enrollment details
  const enrollment = await dbDataService.checkEnrollment(session.user.id, course.id);

  return (
    <CourseCompletedContent
      course={course as any}
      enrollment={enrollment}
      userName={session.user.name || 'Student'}
    />
  );
}
