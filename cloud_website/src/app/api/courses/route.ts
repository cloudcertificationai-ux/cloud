import { NextRequest, NextResponse } from 'next/server';
import { dbDataService } from '@/data/db-data-service';
import { withCache, withCacheHeaders, CACHE_CONFIGS, createCacheKey } from '@/lib/cache-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('q') || searchParams.get('query') || searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const level = searchParams.get('level') || undefined;
    const published = searchParams.get('published') !== 'false'; // Default to true
    const featured = searchParams.get('featured') === 'true' ? true : undefined;
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || searchParams.get('limit') || '20', 10);
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || searchParams.get('order') || 'desc';

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedPageSize = Math.min(Math.max(1, pageSize), 100); // Max 100 items per page

    // Create cache key
    const cacheKey = createCacheKey('courses', {
      search,
      category,
      level,
      published,
      featured,
      page: validatedPage,
      pageSize: validatedPageSize,
      sortBy,
      sortOrder,
    });

    // Use cache wrapper
    const result = await withCache(
      cacheKey,
      async () => dbDataService.getCourses({
        search,
        category,
        level,
        published,
        featured,
        page: validatedPage,
        pageSize: validatedPageSize,
        sortBy,
        sortOrder,
      }),
      CACHE_CONFIGS.courses
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

    return withCacheHeaders(response, CACHE_CONFIGS.courses);

  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch courses'
      },
      { status: 500 }
    );
  }
}