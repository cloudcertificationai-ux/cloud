import { NextRequest, NextResponse } from 'next/server';
import { dbDataService } from '@/data/db-data-service';
import { withCache, withCacheHeaders, CACHE_CONFIGS, createCacheKey } from '@/lib/cache-utils';

// GET /api/courses/featured - Get featured courses with caching
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '10', 10);
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || searchParams.get('order') || 'desc';

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedPageSize = Math.min(Math.max(1, pageSize), 50); // Max 50 items per page

    // Create cache key for featured courses
    const cacheKey = createCacheKey('courses:featured', {
      page: validatedPage,
      pageSize: validatedPageSize,
      sortBy,
      sortOrder,
    });

    // Use cache wrapper with longer TTL for featured courses
    const result = await withCache(
      cacheKey,
      async () => dbDataService.getCourses({
        published: true,
        featured: true,
        page: validatedPage,
        pageSize: validatedPageSize,
        sortBy,
        sortOrder,
      }),
      {
        ...CACHE_CONFIGS.courses,
        maxAge: 3600, // Cache for 1 hour (featured courses change less frequently)
        staleWhileRevalidate: 86400, // 24 hours SWR
        tags: ['courses', 'featured'],
      }
    );
    
    // Add metadata
    const response = {
      courses: result.courses,
      total: result.total,
      page: validatedPage,
      pageSize: validatedPageSize,
      totalPages: result.totalPages,
      timestamp: new Date().toISOString(),
      cached: true,
    };

    return withCacheHeaders(response, {
      maxAge: 3600,
      sMaxAge: 3600,
      staleWhileRevalidate: 86400,
      tags: ['courses', 'featured'],
    });

  } catch (error) {
    console.error('Featured courses API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch featured courses'
      },
      { status: 500 }
    );
  }
}
