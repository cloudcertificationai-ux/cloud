/**
 * CDN Cache Configuration for VOD Media System
 * 
 * This module provides cache header utilities for HLS streaming content.
 * Cache headers optimize CDN performance and reduce origin requests.
 */

/**
 * Cache configuration for different content types
 */
export const CDN_CACHE_CONFIG = {
  // HLS segments are immutable - cache for 1 year
  HLS_SEGMENT: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'CDN-Cache-Control': 'public, max-age=31536000, immutable',
  },
  
  // HLS manifests change when content updates - cache for 5 minutes
  HLS_MANIFEST: {
    'Cache-Control': 'public, max-age=300',
    'CDN-Cache-Control': 'public, max-age=300',
  },
  
  // Thumbnails are immutable
  THUMBNAIL: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'CDN-Cache-Control': 'public, max-age=31536000, immutable',
  },
} as const;

/**
 * Content type patterns for cache header detection
 */
const CONTENT_TYPE_PATTERNS = {
  HLS_SEGMENT: /\.ts$/i,
  HLS_MANIFEST: /\.m3u8$/i,
  THUMBNAIL: /\.(jpg|jpeg|png|webp)$/i,
} as const;

/**
 * Determine cache headers based on file path or content type
 */
export function getCacheHeaders(
  pathOrUrl: string
): Record<string, string> | null {
  // Check for HLS segments (.ts files)
  if (CONTENT_TYPE_PATTERNS.HLS_SEGMENT.test(pathOrUrl)) {
    return CDN_CACHE_CONFIG.HLS_SEGMENT;
  }
  
  // Check for HLS manifests (.m3u8 files)
  if (CONTENT_TYPE_PATTERNS.HLS_MANIFEST.test(pathOrUrl)) {
    return CDN_CACHE_CONFIG.HLS_MANIFEST;
  }
  
  // Check for thumbnails
  if (CONTENT_TYPE_PATTERNS.THUMBNAIL.test(pathOrUrl)) {
    return CDN_CACHE_CONFIG.THUMBNAIL;
  }
  
  return null;
}

/**
 * Apply cache headers to a Response object
 */
export function applyCacheHeaders(
  response: Response,
  pathOrUrl: string
): Response {
  const headers = getCacheHeaders(pathOrUrl);
  
  if (headers) {
    const newHeaders = new Headers(response.headers);
    Object.entries(headers).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
  
  return response;
}

/**
 * Get cache headers for R2 putObject operations
 * These headers will be stored with the object and served by R2/CDN
 */
export function getR2CacheMetadata(key: string): Record<string, string> {
  const headers = getCacheHeaders(key);
  
  if (headers) {
    return {
      'cache-control': headers['Cache-Control'],
    };
  }
  
  return {};
}

/**
 * Create a Response with appropriate cache headers
 */
export function createCachedResponse(
  body: BodyInit | null,
  pathOrUrl: string,
  init?: ResponseInit
): Response {
  const headers = getCacheHeaders(pathOrUrl);
  const responseHeaders = new Headers(init?.headers);
  
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
  }
  
  return new Response(body, {
    ...init,
    headers: responseHeaders,
  });
}
