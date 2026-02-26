// src/lib/course-completion.ts
import prisma from '@/lib/db';
import { dbDataService } from '@/data/db-data-service';

/**
 * Check if a course is completed and update enrollment status
 */
export async function checkAndUpdateCourseCompletion(
  userId: string,
  courseId: string
): Promise<{ completed: boolean; completionPercentage: number }> {
  // Get course progress
  const courseProgress = await dbDataService.getCourseProgress(userId, courseId);

  if (!courseProgress) {
    return { completed: false, completionPercentage: 0 };
  }

  const { completionPercentage } = courseProgress;
  const isCompleted = completionPercentage === 100;

  // Update enrollment with completion percentage
  const enrollment = await prisma.enrollment.update({
    where: {
      userId_courseId: { userId, courseId },
    },
    data: {
      completionPercentage,
      ...(isCompleted && { status: 'COMPLETED' }),
    },
  });

  // If just completed, trigger completion actions
  if (isCompleted && enrollment.status === 'COMPLETED') {
    await handleCourseCompletion(userId, courseId);
  }

  return {
    completed: isCompleted,
    completionPercentage,
  };
}

/**
 * Handle course completion actions
 */
async function handleCourseCompletion(userId: string, courseId: string): Promise<void> {
  try {
    // Get user and course details
    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.course.findUnique({ 
        where: { id: courseId },
        include: { instructor: true }
      }),
    ]);

    if (!user || !course) {
      console.error('User or course not found for completion notification');
      return;
    }

    // Log completion event
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COURSE_COMPLETED',
        resourceType: 'Course',
        resourceId: courseId,
        details: {
          courseName: course.title,
          userName: user.name,
          userEmail: user.email,
        },
      },
    });

    // TODO: Send completion email notification
    // await sendCourseCompletionEmail(user, course);

    // TODO: Generate certificate
    // await generateCourseCertificate(user, course);

    console.log(`Course completed: ${course.title} by ${user.name}`);
  } catch (error) {
    console.error('Error handling course completion:', error);
    // Don't throw - completion should still be recorded even if notifications fail
  }
}

/**
 * Get completion statistics for a user
 */
export async function getUserCompletionStats(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
        },
      },
    },
  });

  const totalEnrollments = enrollments.length;
  const completedCourses = enrollments.filter(e => e.status === 'COMPLETED').length;
  const inProgressCourses = enrollments.filter(
    e => e.status === 'ACTIVE' && e.completionPercentage > 0 && e.completionPercentage < 100
  ).length;
  const notStartedCourses = enrollments.filter(
    e => e.status === 'ACTIVE' && e.completionPercentage === 0
  ).length;

  const averageCompletion = totalEnrollments > 0
    ? enrollments.reduce((sum, e) => sum + e.completionPercentage, 0) / totalEnrollments
    : 0;

  return {
    totalEnrollments,
    completedCourses,
    inProgressCourses,
    notStartedCourses,
    averageCompletion: Math.round(averageCompletion * 10) / 10, // Round to 1 decimal
    completionRate: totalEnrollments > 0 
      ? Math.round((completedCourses / totalEnrollments) * 100) 
      : 0,
    recentlyCompleted: enrollments
      .filter(e => e.status === 'COMPLETED')
      .sort((a, b) => {
        const aDate = a.lastAccessedAt || a.enrolledAt;
        const bDate = b.lastAccessedAt || b.enrolledAt;
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 5)
      .map(e => ({
        courseId: e.course.id,
        courseTitle: e.course.title,
        courseThumbnail: e.course.thumbnailUrl,
        completedAt: e.lastAccessedAt,
      })),
  };
}

/**
 * Check if user has completed a specific course
 */
export async function hasCompletedCourse(userId: string, courseId: string): Promise<boolean> {
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
  });

  return enrollment?.status === 'COMPLETED';
}

/**
 * Get courses nearing completion (80%+)
 */
export async function getCoursesNearingCompletion(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      completionPercentage: {
        gte: 80,
        lt: 100,
      },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          slug: true,
        },
      },
    },
    orderBy: {
      completionPercentage: 'desc',
    },
  });

  return enrollments.map(e => ({
    courseId: e.course.id,
    courseTitle: e.course.title,
    courseThumbnail: e.course.thumbnailUrl,
    courseSlug: e.course.slug,
    completionPercentage: e.completionPercentage,
    lastAccessedAt: e.lastAccessedAt,
  }));
}
