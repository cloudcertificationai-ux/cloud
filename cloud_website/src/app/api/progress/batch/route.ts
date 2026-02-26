// src/app/api/progress/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbDataService } from '@/data/db-data-service';
import prisma from '@/lib/db';

interface ProgressUpdate {
  lessonId: string;
  completed: boolean;
  timeSpent?: number;
  lastPosition?: number;
}

/**
 * POST /api/progress/batch
 * Batch update multiple lesson progress records
 * Used for auto-save and page unload scenarios
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, updates } = body as { courseId: string; updates: ProgressUpdate[] };

    if (!courseId || !updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'courseId and updates array are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check enrollment
    const enrollment = await dbDataService.checkEnrollment(user.id, courseId);
    
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Update all progress records
    const results = await Promise.all(
      updates.map(async (update) => {
        try {
          return await dbDataService.updateLessonProgress(
            user.id,
            courseId,
            update.lessonId,
            update.completed,
            update.timeSpent
          );
        } catch (err) {
          console.error(`Failed to update progress for lesson ${update.lessonId}:`, err);
          return null;
        }
      })
    );

    // Update enrollment's lastAccessedAt
    await prisma.enrollment.update({
      where: {
        userId_courseId: { userId: user.id, courseId },
      },
      data: {
        lastAccessedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      updated: results.filter(r => r !== null).length,
      total: updates.length,
    });
  } catch (error) {
    console.error('Error batch updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
