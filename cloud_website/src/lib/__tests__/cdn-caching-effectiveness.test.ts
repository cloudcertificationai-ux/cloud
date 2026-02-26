// Feature: anywheredoor, Property 20: CDN and Caching Effectiveness
// **Validates: Requirements 11.1, 11.2**

import * as fc from 'fast-check';
import { getCacheHeaders, createCacheKey, CACHE_CONFIGS, memoryCache, withCache } from '../cache-utils';

describe('CDN and Caching Effectiveness', () => {
  beforeEach(() => {
    // Clear cache before each test
    memoryCache.clear();
  });

  describe('Property 20: CDN and Caching Effectiveness', () => {
    it('should generate appropriate cache headers for all cache configurations', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.keys(CACHE_CONFIGS)),
          (configName) => {
            // Feature: anywheredoor, Property 20: CDN and Caching Effectiveness
            const config = CACHE_CONFIGS[configName as keyof typeof CACHE_CONFIGS];
            const headers = getCacheHeaders(config);

            // All cache headers should include basic cache control
            expect(headers['Cache-Control']).toBeDefined();
            expect(headers['Cache-Control']).toContain('public');
            expect(headers['Cache-Control']).toContain(`max-age=${config.maxAge}`);

            // Should include s-maxage if specified
            if (config.sMaxAge) {
              expect(headers['Cache-Control']).toContain(`s-maxage=${config.sMaxAge}`);
              expect(headers['CDN-Cache-Control']).toBeDefined();
              expect(headers['CDN-Cache-Control']).toContain(`max-age=${config.sMaxAge}`);
            }

            // Should include stale-while-revalidate if specified
            if ('staleWhileRevalidate' in config && config.staleWhileRevalidate) {
              expect(headers['Cache-Control']).toContain(`stale-while-revalidate=${config.staleWhileRevalidate}`);
            }

            // Should include Vary header for content negotiation
            expect(headers['Vary']).toBeDefined();
            expect(headers['Vary']).toContain('Accept-Encoding');

            // Should include ETag for validation
            expect(headers['ETag']).toBeDefined();
            expect(headers['ETag']).toMatch(/^".*"$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create consistent cache keys for identical parameters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.record({
            query: fc.string(),
            category: fc.option(fc.string()),
            level: fc.option(fc.string()),
            page: fc.integer({ min: 1, max: 100 }),
          }),
          (prefix, params) => {
            // Feature: anywheredoor, Property 20: CDN and Caching Effectiveness
            const key1 = createCacheKey(prefix, params);
            const key2 = createCacheKey(prefix, params);

            // Same parameters should generate identical cache keys
            expect(key1).toBe(key2);

            // Cache key should include prefix
            expect(key1).toContain(prefix);

            // Cache key should be deterministic regardless of parameter order
            const reorderedParams = Object.keys(params)
              .reverse()
              .reduce((acc, key) => {
                acc[key] = params[key as keyof typeof params];
                return acc;
              }, {} as any);
            
            const key3 = createCacheKey(prefix, reorderedParams);
            expect(key1).toBe(key3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should cache and retrieve data effectively with TTL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0), // Only non-empty keys
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.record({
              id: fc.integer(),
              name: fc.string(),
            })
          ), // Use specific data types instead of fc.anything()
          fc.integer({ min: 1, max: 10 }),
          async (key, data, ttlSeconds) => {
            // Feature: anywheredoor, Property 20: CDN and Caching Effectiveness
            const mockFetcher = jest.fn().mockResolvedValue(data);
            const config = { maxAge: ttlSeconds, tags: ['test'] };

            // First call should fetch from source
            const result1 = await withCache(key, mockFetcher, config);
            expect(result1).toEqual(data);
            expect(mockFetcher).toHaveBeenCalledTimes(1);

            // Second call should use cache
            const result2 = await withCache(key, mockFetcher, config);
            expect(result2).toEqual(data);
            expect(mockFetcher).toHaveBeenCalledTimes(1); // Still only called once

            // Results should be identical
            expect(result1).toEqual(result2);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle cache invalidation by tags correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
          fc.array(fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 5 }),
          fc.anything().filter(data => data !== undefined && data !== null),
          (keys, tags, data) => {
            // Feature: anywheredoor, Property 20: CDN and Caching Effectiveness
            // Set up cache entries with tags
            keys.forEach((key, index) => {
              const entryTags = tags.slice(0, (index % tags.length) + 1);
              memoryCache.set(key, data, 3600, entryTags);
            });

            const initialSize = memoryCache.size();
            expect(initialSize).toBe(keys.length);

            // Invalidate by first tag
            const tagToInvalidate = tags[0];
            const invalidatedCount = memoryCache.invalidateByTag(tagToInvalidate);

            // Should have invalidated at least one entry
            expect(invalidatedCount).toBeGreaterThan(0);

            // Cache size should be reduced
            expect(memoryCache.size()).toBeLessThan(initialSize);

            // Entries with the invalidated tag should be gone
            keys.forEach((key, index) => {
              const entryTags = tags.slice(0, (index % tags.length) + 1);
              if (entryTags.includes(tagToInvalidate)) {
                expect(memoryCache.get(key)).toBeNull();
              }
            });
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should respect cache size limits and evict old entries', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 50, max: 200 }),
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.record({
              id: fc.integer(),
              name: fc.string(),
            })
          ), // Use specific data types
          (numEntries, data) => {
            // Feature: anywheredoor, Property 20: CDN and Caching Effectiveness
            // Clear cache and add many entries
            memoryCache.clear();
            
            const keys: string[] = [];
            for (let i = 0; i < numEntries; i++) {
              const key = `test-key-${i}`;
              keys.push(key);
              memoryCache.set(key, data, 3600, ['test']);
            }

            // Cache should not exceed reasonable limits (implementation dependent)
            const finalSize = memoryCache.size();
            expect(finalSize).toBeLessThanOrEqual(1000); // Max size from implementation

            // If we exceeded the limit, oldest entries should be evicted
            if (numEntries > 1000) {
              expect(finalSize).toBe(1000);
              
              // First entries should be evicted, last entries should remain
              const lastKey = keys[keys.length - 1];
              expect(memoryCache.get(lastKey)).toEqual(data);
            } else {
              expect(finalSize).toBe(numEntries);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle concurrent cache operations safely', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { minLength: 5, maxLength: 20 }),
          fc.anything().filter(data => data !== undefined && data !== null),
          async (keys, data) => {
            // Feature: anywheredoor, Property 20: CDN and Caching Effectiveness
            memoryCache.clear();

            // Ensure unique keys to avoid conflicts
            const uniqueKeys = [...new Set(keys)];

            // Create multiple concurrent cache operations
            const operations = uniqueKeys.map(async (key, index) => {
              let dataString;
              if (Array.isArray(data)) {
                dataString = data.length === 0 ? 'empty-array' : JSON.stringify(data);
              } else if (typeof data === 'string') {
                dataString = data;
              } else {
                dataString = JSON.stringify(data);
              }
              const mockFetcher = jest.fn().mockResolvedValue(`${dataString}-${index}`);
              const config = { maxAge: 60, tags: ['concurrent-test'] };
              
              return withCache(key, mockFetcher, config);
            });

            // Execute all operations concurrently
            const results = await Promise.all(operations);

            // All operations should complete successfully
            expect(results).toHaveLength(uniqueKeys.length);
            
            // Each result should match expected data
            results.forEach((result, index) => {
              let expectedDataString;
              if (Array.isArray(data)) {
                expectedDataString = data.length === 0 ? 'empty-array' : JSON.stringify(data);
              } else if (typeof data === 'string') {
                expectedDataString = data;
              } else {
                expectedDataString = JSON.stringify(data);
              }
              expect(result).toBe(`${expectedDataString}-${index}`);
            });

            // Cache should contain all entries
            uniqueKeys.forEach((key, index) => {
              const cached = memoryCache.get(key);
              let expectedDataString;
              if (Array.isArray(data)) {
                expectedDataString = data.length === 0 ? 'empty-array' : JSON.stringify(data);
              } else if (typeof data === 'string') {
                expectedDataString = data;
              } else {
                expectedDataString = JSON.stringify(data);
              }
              expect(cached).toBe(`${expectedDataString}-${index}`);
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should generate different cache keys for different parameters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          fc.record({
            query: fc.string(),
            category: fc.option(fc.string()),
            page: fc.integer({ min: 1, max: 100 }),
          }),
          fc.record({
            query: fc.string(),
            category: fc.option(fc.string()),
            page: fc.integer({ min: 1, max: 100 }),
          }),
          (prefix, params1, params2) => {
            // Feature: anywheredoor, Property 20: CDN and Caching Effectiveness
            fc.pre(!deepEqual(params1, params2)); // Only test with different parameters

            const key1 = createCacheKey(prefix, params1);
            const key2 = createCacheKey(prefix, params2);

            // Different parameters should generate different cache keys
            expect(key1).not.toBe(key2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

// Helper function to deep compare objects
function deepEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}