import { NextRequest, NextResponse } from 'next/server';
import { dbDataService } from '@/data/db-data-service';
import { withCache, withCacheHeaders, CACHE_CONFIGS, createCacheKey } from '@/lib/cache-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { 
          error: 'Bad request',
          message: 'Course slug is required'
        },
        { status: 400 }
      );
    }

    // Create cache key
    const cacheKey = createCacheKey('course', { slug });

    // Use cache wrapper
    const course = await withCache(
      cacheKey,
      async () => dbDataService.getCourseBySlug(slug),
      CACHE_CONFIGS.courses
    );

    // Return 404 if course not found or not published
    if (!course) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Course not found'
        },
        { status: 404 }
      );
    }

    if (!course.published) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Course not found'
        },
        { status: 404 }
      );
    }

    // Add metadata
    const response = {
      course,
      timestamp: new Date().toISOString(),
      cached: true,
    };

    return withCacheHeaders(response, CACHE_CONFIGS.courses);

  } catch (error) {
    console.error('Course detail API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch course'
      },
      { status: 500 }
    );
  }
}
