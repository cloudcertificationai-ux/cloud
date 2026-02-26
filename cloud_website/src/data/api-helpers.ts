import { NextRequest } from 'next/server';
import { SearchParams, CourseFilters } from '@/types';

// Parse search parameters from URL search params
export function parseSearchParams(searchParams: URLSearchParams): SearchParams {
  const params: SearchParams = {};

  // Parse query
  const query = searchParams.get('q') || searchParams.get('query');
  if (query) {
    params.query = query;
  }

  // Parse filters
  const filters: CourseFilters = {};
  
  // Category filter (can be multiple)
  const categories = searchParams.getAll('category');
  if (categories.length > 0) {
    filters.category = categories;
  }

  // Level filter (can be multiple)
  const levels = searchParams.getAll('level');
  if (levels.length > 0) {
    filters.level = levels;
  }

  // Mode filter (can be multiple)
  const modes = searchParams.getAll('mode');
  if (modes.length > 0) {
    filters.mode = modes;
  }

  // Price range filter
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  if (minPrice || maxPrice) {
    filters.priceRange = {
      min: minPrice ? parseInt(minPrice, 10) : 0,
      max: maxPrice ? parseInt(maxPrice, 10) : Infinity,
    };
  }

  // Duration range filter
  const minDuration = searchParams.get('minDuration');
  const maxDuration = searchParams.get('maxDuration');
  if (minDuration || maxDuration) {
    filters.duration = {
      min: minDuration ? parseInt(minDuration, 10) : 0,
      max: maxDuration ? parseInt(maxDuration, 10) : Infinity,
    };
  }

  if (Object.keys(filters).length > 0) {
    params.filters = filters;
  }

  // Parse sorting
  const sortBy = searchParams.get('sortBy');
  if (sortBy) {
    params.sortBy = sortBy as SearchParams['sortBy'];
  }

  const sortOrder = searchParams.get('sortOrder');
  if (sortOrder === 'asc' || sortOrder === 'desc') {
    params.sortOrder = sortOrder;
  }

  // Parse pagination
  const page = searchParams.get('page');
  if (page) {
    const pageNum = parseInt(page, 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      params.page = pageNum;
    }
  }

  const limit = searchParams.get('limit');
  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0 && limitNum <= 100) {
      params.limit = limitNum;
    }
  }

  return params;
}

// Parse search parameters from Next.js request
export function parseSearchParamsFromRequest(request: NextRequest): SearchParams {
  return parseSearchParams(request.nextUrl.searchParams);
}

// Build URL search params from SearchParams object
export function buildSearchParams(params: SearchParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (params.query) {
    searchParams.set('q', params.query);
  }

  if (params.filters) {
    const { filters } = params;

    if (filters.category) {
      filters.category.forEach(cat => searchParams.append('category', cat));
    }

    if (filters.level) {
      filters.level.forEach(level => searchParams.append('level', level));
    }

    if (filters.mode) {
      filters.mode.forEach(mode => searchParams.append('mode', mode));
    }

    if (filters.priceRange) {
      if (filters.priceRange.min > 0) {
        searchParams.set('minPrice', filters.priceRange.min.toString());
      }
      if (filters.priceRange.max < Infinity) {
        searchParams.set('maxPrice', filters.priceRange.max.toString());
      }
    }

    if (filters.duration) {
      if (filters.duration.min > 0) {
        searchParams.set('minDuration', filters.duration.min.toString());
      }
      if (filters.duration.max < Infinity) {
        searchParams.set('maxDuration', filters.duration.max.toString());
      }
    }
  }

  if (params.sortBy) {
    searchParams.set('sortBy', params.sortBy);
  }

  if (params.sortOrder) {
    searchParams.set('sortOrder', params.sortOrder);
  }

  if (params.page && params.page > 1) {
    searchParams.set('page', params.page.toString());
  }

  if (params.limit && params.limit !== 12) {
    searchParams.set('limit', params.limit.toString());
  }

  return searchParams;
}

// Validate search parameters
export function validateSearchParams(params: SearchParams): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate page
  if (params.page !== undefined) {
    if (!Number.isInteger(params.page) || params.page < 1) {
      errors.push('Page must be a positive integer');
    }
  }

  // Validate limit
  if (params.limit !== undefined) {
    if (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 100) {
      errors.push('Limit must be an integer between 1 and 100');
    }
  }

  // Validate sort order
  if (params.sortOrder !== undefined) {
    if (params.sortOrder !== 'asc' && params.sortOrder !== 'desc') {
      errors.push('Sort order must be "asc" or "desc"');
    }
  }

  // Validate sort by
  if (params.sortBy !== undefined) {
    const validSortBy = ['relevance', 'rating', 'price', 'duration', 'popularity'];
    if (!validSortBy.includes(params.sortBy)) {
      errors.push(`Sort by must be one of: ${validSortBy.join(', ')}`);
    }
  }

  // Validate filters
  if (params.filters) {
    const { filters } = params;

    // Validate level filter
    if (filters.level) {
      const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
      const invalidLevels = filters.level.filter(level => !validLevels.includes(level));
      if (invalidLevels.length > 0) {
        errors.push(`Invalid levels: ${invalidLevels.join(', ')}`);
      }
    }

    // Validate mode filter
    if (filters.mode) {
      const validModes = ['Live', 'Self-Paced', 'Hybrid'];
      const invalidModes = filters.mode.filter(mode => !validModes.includes(mode));
      if (invalidModes.length > 0) {
        errors.push(`Invalid modes: ${invalidModes.join(', ')}`);
      }
    }

    // Validate price range
    if (filters.priceRange) {
      if (filters.priceRange.min < 0) {
        errors.push('Minimum price cannot be negative');
      }
      if (filters.priceRange.max < 0) {
        errors.push('Maximum price cannot be negative');
      }
      if (filters.priceRange.min > filters.priceRange.max) {
        errors.push('Minimum price cannot be greater than maximum price');
      }
    }

    // Validate duration range
    if (filters.duration) {
      if (filters.duration.min < 0) {
        errors.push('Minimum duration cannot be negative');
      }
      if (filters.duration.max < 0) {
        errors.push('Maximum duration cannot be negative');
      }
      if (filters.duration.min > filters.duration.max) {
        errors.push('Minimum duration cannot be greater than maximum duration');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Create API response helpers
export function createSuccessResponse<T>(data: T, status: number = 200) {
  return Response.json({
    success: true,
    data,
  }, { status });
}

export function createErrorResponse(message: string, status: number = 400, errors?: string[]) {
  return Response.json({
    success: false,
    error: message,
    errors,
  }, { status });
}

// Pagination helpers
export function createPaginationInfo(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null,
  };
}

// Cache headers for API responses
export function getCacheHeaders(maxAge: number = 300) {
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${maxAge}`,
  };
}

// CORS headers for API responses
export function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}