/**
 * Redis Cache Utility for Media Metadata
 * 
 * Provides caching functionality for media records to reduce database load
 * and improve API response times.
 */

import { Redis } from 'ioredis';
import type { Media } from '@prisma/client';

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  MEDIA_TTL: 3600, // 1 hour in seconds
  KEY_PREFIX: 'media:',
} as const;

/**
 * Redis client singleton
 */
let redisClient: Redis | null = null;

/**
 * Get or create Redis client for caching
 */
function getRedisClient(): Redis | null {
  // Return null if Redis URL is not configured (graceful degradation)
  if (!process.env.REDIS_URL) {
    console.warn('Redis URL not configured. Caching disabled.');
    return null;
  }

  if (!redisClient) {
    try {
      redisClient = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      redisClient.on('error', (error) => {
        console.error('Redis cache connection error:', error);
      });

      redisClient.on('connect', () => {
        console.log('Redis cache connected');
      });

      // Connect asynchronously
      redisClient.connect().catch((error) => {
        console.error('Failed to connect to Redis:', error);
      });
    } catch (error) {
      console.error('Failed to initialize Redis client:', error);
      return null;
    }
  }

  return redisClient;
}

/**
 * Generate cache key for media record
 */
function getMediaCacheKey(mediaId: string): string {
  return `${CACHE_CONFIG.KEY_PREFIX}${mediaId}`;
}

/**
 * Get media record from cache
 * @param mediaId - Media ID
 * @returns Cached media record or null if not found
 */
export async function getCachedMedia(
  mediaId: string
): Promise<Media | null> {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  try {
    const key = getMediaCacheKey(mediaId);
    const cached = await client.get(key);

    if (!cached) {
      return null;
    }

    // Parse JSON and convert BigInt fields
    const parsed = JSON.parse(cached);
    
    // Convert fileSize back to BigInt
    if (parsed.fileSize) {
      parsed.fileSize = BigInt(parsed.fileSize);
    }

    // Convert date strings back to Date objects
    if (parsed.createdAt) {
      parsed.createdAt = new Date(parsed.createdAt);
    }
    if (parsed.updatedAt) {
      parsed.updatedAt = new Date(parsed.updatedAt);
    }

    return parsed as Media;
  } catch (error) {
    console.error('Error getting cached media:', error);
    return null;
  }
}

/**
 * Set media record in cache
 * @param media - Media record to cache
 */
export async function setCachedMedia(media: Media): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  try {
    const key = getMediaCacheKey(media.id);
    
    // Convert BigInt to string for JSON serialization
    const serializable = {
      ...media,
      fileSize: media.fileSize.toString(),
    };

    await client.setex(
      key,
      CACHE_CONFIG.MEDIA_TTL,
      JSON.stringify(serializable)
    );
  } catch (error) {
    console.error('Error setting cached media:', error);
  }
}

/**
 * Invalidate media cache
 * @param mediaId - Media ID to invalidate
 */
export async function invalidateMediaCache(mediaId: string): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  try {
    const key = getMediaCacheKey(mediaId);
    await client.del(key);
  } catch (error) {
    console.error('Error invalidating media cache:', error);
  }
}

/**
 * Invalidate multiple media cache entries
 * @param mediaIds - Array of media IDs to invalidate
 */
export async function invalidateMediaCacheBatch(
  mediaIds: string[]
): Promise<void> {
  const client = getRedisClient();
  if (!client || mediaIds.length === 0) {
    return;
  }

  try {
    const keys = mediaIds.map(getMediaCacheKey);
    await client.del(...keys);
  } catch (error) {
    console.error('Error invalidating media cache batch:', error);
  }
}

/**
 * Clear all media cache entries
 * Use with caution - this will clear all cached media records
 */
export async function clearMediaCache(): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  try {
    const pattern = `${CACHE_CONFIG.KEY_PREFIX}*`;
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(...keys);
      console.log(`Cleared ${keys.length} media cache entries`);
    }
  } catch (error) {
    console.error('Error clearing media cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  connected: boolean;
  totalKeys: number;
}> {
  const client = getRedisClient();
  
  if (!client) {
    return { connected: false, totalKeys: 0 };
  }

  try {
    const pattern = `${CACHE_CONFIG.KEY_PREFIX}*`;
    const keys = await client.keys(pattern);
    
    return {
      connected: true,
      totalKeys: keys.length,
    };
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return { connected: false, totalKeys: 0 };
  }
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedisCache(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      console.log('Redis cache connection closed');
    } catch (error) {
      console.error('Error closing Redis cache connection:', error);
    }
  }
}
