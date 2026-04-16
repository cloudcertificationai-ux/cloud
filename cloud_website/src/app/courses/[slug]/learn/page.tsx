import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbDataService } from '@/data/db-data-service';
import LessonPlayerPage from './components/LessonPlayerPage';
import prisma from '@/lib/db';
import { getPaymentConfig } from '@/lib/site-settings';

// Handle PayPal return after approval
async function handlePayPalReturn(purchaseId: string, sessionUserId: string) {
  try {
    const config = await getPaymentConfig();
    if (!config.paypal.enabled || !config.paypal.clientId || !config.paypal.clientSecret) return;

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { User: true },
    });

    if (!purchase || purchase.userId !== sessionUserId) return;
    if (purchase.status === 'COMPLETED') return;

    const baseUrl = config.paypal.mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    const credentials = Buffer.from(`${config.paypal.clientId}:${config.paypal.clientSecret}`).toString('base64');
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });

    if (!tokenRes.ok) return;
    const { access_token } = await tokenRes.json();

    const orderId = purchase.providerId;
    if (!orderId) return;

    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    });

    if (!captureRes.ok) return;
    const captureData = await captureRes.json();

    if (captureData.status === 'COMPLETED') {
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: 'COMPLETED' },
      });

      const existing = await dbDataService.checkEnrollment(sessionUserId, purchase.courseId);
      if (!existing) {
        await prisma.enrollment.create({
          data: {
            User: { connect: { id: sessionUserId } },
            Course: { connect: { id: purchase.courseId } },
            source: 'paypal',
            status: 'ACTIVE',
            Purchase: { connect: { id: purchase.id } },
          },
        });
      }
    }
  } catch (err) {
    console.error('[learn] PayPal capture error:', err);
  }
}

interface LearnPageProps {
  params: { slug: string };
  searchParams: { lesson?: string; payment?: string; provider?: string; purchaseId?: string; token?: string; PayerID?: string };
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

  // Handle PayPal return (capture payment server-side)
  if (resolvedSearchParams.provider === 'paypal' && resolvedSearchParams.purchaseId && session?.user?.id) {
    await handlePayPalReturn(resolvedSearchParams.purchaseId, session.user.id);
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
    if (!currentLessonId && course.Module.length > 0 && course.Module[0].Lesson.length > 0) {
      currentLessonId = course.Module[0].Lesson[0].id;
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
