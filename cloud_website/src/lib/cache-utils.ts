// Cache utilities for API routes and data fetching

export interface CacheConfig {
  maxAge: number; // in seconds
  sMaxAge?: number; // CDN cache time
  staleWhileRevalidate?: number; // SWR time
  tags?: readonly string[]; // Cache tags for invalidation
}

export const CACHE_CONFIGS = {
  // Static content - long cache
  static: {
    maxAge: 31536000, // 1 year
    sMaxAge: 31536000,
    tags: ['static'],
  },
  // Course data - medium cache with SWR
  courses: {
    maxAge: 1800, // 30 minutes
    sMaxAge: 1800,
    staleWhileRevalidate: 86400, // 24 hours
    tags: ['courses'],
  },
  // Instructor data - medium cache
  instructors: {
    maxAge: 3600, // 1 hour
    sMaxAge: 3600,
    staleWhileRevalidate: 86400,
    tags: ['instructors'],
  },
  // Search results - short cache
  search: {
    maxAge: 300, // 5 minutes
    sMaxAge: 300,
    staleWhileRevalidate: 3600, // 1 hour
    tags: ['search'],
  },
  // Analytics data - very short cache
  analytics: {
    maxAge: 60, // 1 minute
    sMaxAge: 60,
    tags: ['analytics'],
  },
  // Homepage data - short cache with frequent updates
  homepage: {
    maxAge: 900, // 15 minutes
    sMaxAge: 900,
    staleWhileRevalidate: 3600,
    tags: ['homepage'],
  },
} as const;

export function getCacheHeaders(config: CacheConfig): Record<string, string> {
  const headers: Record<string, string> = {};

  // Basic cache control
  const cacheControl = [
    'public',
    `max-age=${config.maxAge}`,
  ];

  if (config.sMaxAge) {
    cacheControl.push(`s-maxage=${config.sMaxAge}`);
  }

  if (config.staleWhileRevalidate) {
    cacheControl.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  headers['Cache-Control'] = cacheControl.join(', ');

  // CDN-specific headers
  if (config.sMaxAge) {
    headers['CDN-Cache-Control'] = `public, max-age=${config.sMaxAge}`;
  }

  // Vary header for content negotiation
  headers['Vary'] = 'Accept-Encoding, Accept';

  // ETag for validation
  headers['ETag'] = `"${Date.now()}"`;

  return headers;
}

export function createCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return `${prefix}:${sortedParams}`;
}

// In-memory cache for server-side caching
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number; tags: string[] }>();
  private maxSize = 1000;

  set(key: string, data: any, ttl: number, tags: string[] = []): void {
    // Don't cache undefined or null values, or empty keys
    if (data === undefined || data === null || !key.trim()) {
      return;
    }

    // Clean up expired entries
    this.cleanup();

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const normalizedKey = key.trim();
    this.cache.set(normalizedKey, {
      data,
      expires: Date.now() + ttl * 1000,
      tags,
    });
  }

  get(key: string): any | null {
    if (!key.trim()) {
      return null;
    }

    const normalizedKey = key.trim();
    const entry = this.cache.get(normalizedKey);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(normalizedKey);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}

export const memoryCache = new MemoryCache();

// Cache wrapper for API functions
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig
): Promise<T> {
  // Normalize and validate cache key
  const normalizedKey = key.trim();
  if (!normalizedKey) {
    // For empty or whitespace-only keys, bypass cache and fetch directly
    return await fetcher();
  }

  // Try memory cache first
  const cached = memoryCache.get(normalizedKey);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Only cache non-undefined, non-null values with valid keys
  if (data !== undefined && data !== null && normalizedKey) {
    memoryCache.set(normalizedKey, data, config.maxAge, [...(config.tags || [])]);
  }

  return data;
}

// Response wrapper with cache headers
export function withCacheHeaders(data: any, config: CacheConfig): Response {
  const headers = getCacheHeaders(config);
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// Cache invalidation utilities
export function invalidateCache(tags: string[]): number {
  let totalInvalidated = 0;
  
  for (const tag of tags) {
    totalInvalidated += memoryCache.invalidateByTag(tag);
  }

  return totalInvalidated;
}

// Preload cache for critical data
export async function preloadCache() {
  try {
    // Preload critical data that's likely to be requested
    const criticalEndpoints = [
      '/api/courses?featured=true',
      '/api/instructors?featured=true',
      '/api/analytics/stats',
    ];

    await Promise.allSettled(
      criticalEndpoints.map(async (endpoint) => {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            console.log(`Preloaded cache for ${endpoint}`);
          }
        } catch (error) {
          console.warn(`Failed to preload ${endpoint}:`, error);
        }
      })
    );
  } catch (error) {
    console.error('Cache preloading failed:', error);
  }
}

// Cache warming for popular content
export async function warmCache(popularKeys: string[]) {
  for (const key of popularKeys) {
    try {
      // Trigger cache warming by making requests
      await fetch(`/api/cache/warm?key=${encodeURIComponent(key)}`);
    } catch (error) {
      console.warn(`Failed to warm cache for ${key}:`, error);
    }
  }
}

// Cache statistics
export function getCacheStats() {
  return {
    size: memoryCache.size(),
    maxSize: 1000,
    hitRate: 0, // Would need to track hits/misses
  };
}