import { NextRequest, NextResponse } from 'next/server';
import { dbDataService } from '@/data/db-data-service';

// Cache for search results (in production, use Redis or similar)
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search parameters
    const search = searchParams.get('q') || searchParams.get('query') || searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const level = searchParams.get('level') || undefined;
    const published = searchParams.get('published') !== 'false'; // Default to true

    // Create cache key
    const cacheKey = JSON.stringify({ search, category, level, published });
    
    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT'
        }
      });
    }

    // Perform search
    const result = await dbDataService.getCourses({
      search,
      category,
      level,
      published,
    });
    
    // Add additional metadata
    const response = {
      courses: result.courses,
      total: result.total,
      query: search || '',
      timestamp: new Date().toISOString(),
    };

    // Cache the results
    searchCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    // Clean up old cache entries (simple cleanup)
    if (searchCache.size > 1000) {
      const entries = Array.from(searchCache.entries());
      const cutoff = Date.now() - CACHE_DURATION * 2;
      entries.forEach(([key, value]) => {
        if (value.timestamp < cutoff) {
          searchCache.delete(key);
        }
      });
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to perform search'
      },
      { status: 500 }
    );
  }
}

// OPTIONS endpoint for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}