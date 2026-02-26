import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbDataService } from '@/data/db-data-service';
import AccessRestrictedContent from './components/AccessRestrictedContent';

interface AccessRestrictedPageProps {
  params: { slug: string };
  searchParams: { status?: string };
}

export async function generateMetadata({ params }: AccessRestrictedPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const course = await dbDataService.getCourseBySlug(resolvedParams.slug);
  
  if (!course) {
    return {
      title: 'Course Not Found | Anywheredoor',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `Access Restricted - ${course.title} | Anywheredoor`,
    description: 'Your access to this course has been restricted.',
    robots: { index: false, follow: false },
  };
}

export default async function AccessRestrictedPage({ params, searchParams }: AccessRestrictedPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
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

  // Check enrollment status
  const enrollment = await dbDataService.checkEnrollment(session.user.id, course.id);
  
  if (!enrollment) {
    redirect(`/courses/${resolvedParams.slug}`);
  }

  // If enrollment is active, redirect to learn page
  if (enrollment.status === 'ACTIVE') {
    redirect(`/courses/${resolvedParams.slug}/learn`);
  }

  const status = resolvedSearchParams.status || enrollment.status;

  return (
    <AccessRestrictedContent
      course={course as any}
      enrollmentStatus={status as string}
    />
  );
}
