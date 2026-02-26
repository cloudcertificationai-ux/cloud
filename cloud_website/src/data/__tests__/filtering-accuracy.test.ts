// Feature: anywheredoor, Property 2: Course Filtering Accuracy
// **Validates: Requirements 2.3**

import * as fc from 'fast-check';
import { mockDataService } from '../mock-data-service';
import { Course, SearchParams, CourseFilters } from '@/types';

describe('Course Filtering Accuracy Property Tests', () => {
  beforeEach(() => {
    // Reset data service to ensure consistent state
    mockDataService.resetData();
  });

  test('Property 2: Course Filtering Accuracy - For any combination of filter criteria, all returned courses should match every selected filter criterion', () => {
    fc.assert(
      fc.property(
        // Generate filter combinations
        fc.record({
          // Category filter
          category: fc.option(
            fc.constantFrom(
              'web-development', 'data-science', 'cybersecurity', 'cloud-computing'
            ).map(cat => [cat]),
            { nil: undefined }
          ),
          // Level filter
          level: fc.option(
            fc.constantFrom('Beginner', 'Intermediate', 'Advanced').map(level => [level]),
            { nil: undefined }
          ),
          // Mode filter
          mode: fc.option(
            fc.constantFrom('Live', 'Self-Paced', 'Hybrid').map(mode => [mode]),
            { nil: undefined }
          ),
          // Price range filter
          priceRange: fc.option(
            fc.record({
              min: fc.integer({ min: 0, max: 500 }),
              max: fc.integer({ min: 100, max: 1000 })
            }).filter(range => range.min <= range.max),
            { nil: undefined }
          ),
          // Duration range filter
          duration: fc.option(
            fc.record({
              min: fc.integer({ min: 10, max: 100 }),
              max: fc.integer({ min: 50, max: 300 })
            }).filter(range => range.min <= range.max),
            { nil: undefined }
          )
        }),
        (filters: CourseFilters) => {
          // Skip if no filters are applied
          const hasFilters = filters.category || filters.level || filters.mode || 
                           filters.priceRange || filters.duration;
          
          if (!hasFilters) return true; // Skip this test case

          // Perform search with filters
          const searchParams: SearchParams = {
            query: '', // No search query, just filtering
            filters,
            page: 1,
            limit: 100, // Get all results to test thoroughly
          };

          const searchResults = mockDataService.searchCourses(searchParams);
          const { courses } = searchResults;

          // Property: All returned courses should match every selected filter criterion
          courses.forEach((course: Course) => {
            // Check category filter
            if (filters.category && filters.category.length > 0) {
              const matchesCategory = filters.category.some(categoryFilter => 
                course.category.id === categoryFilter || 
                course.category.slug === categoryFilter ||
                course.category.name === categoryFilter
              );
              expect(matchesCategory).toBe(true);
            }

            // Check level filter
            if (filters.level && filters.level.length > 0) {
              const matchesLevel = filters.level.includes(course.level);
              expect(matchesLevel).toBe(true);
            }

            // Check mode filter
            if (filters.mode && filters.mode.length > 0) {
              const matchesMode = filters.mode.includes(course.mode);
              expect(matchesMode).toBe(true);
            }

            // Check price range filter
            if (filters.priceRange) {
              const { min, max } = filters.priceRange;
              expect(course.price.amount).toBeGreaterThanOrEqual(min);
              expect(course.price.amount).toBeLessThanOrEqual(max);
            }

            // Check duration filter
            if (filters.duration) {
              const { min, max } = filters.duration;
              expect(course.duration.hours).toBeGreaterThanOrEqual(min);
              expect(course.duration.hours).toBeLessThanOrEqual(max);
            }

            // All courses should be active
            expect(course.isActive).toBe(true);
          });

          // Additional property: Results should be consistent
          expect(Array.isArray(courses)).toBe(true);
          expect(searchResults.total).toBeGreaterThanOrEqual(0);
          expect(searchResults.total).toBe(courses.length);
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
        seed: 42, // For reproducible tests
      }
    );
  });

  test('Property 2a: Single filter criteria should work correctly', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Test individual filter types
          fc.record({ category: fc.constantFrom('web-development', 'data-science').map(c => [c]) }),
          fc.record({ level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced').map(l => [l]) }),
          fc.record({ mode: fc.constantFrom('Live', 'Self-Paced', 'Hybrid').map(m => [m]) }),
          fc.record({ 
            priceRange: fc.record({
              min: fc.integer({ min: 0, max: 200 }),
              max: fc.integer({ min: 300, max: 800 })
            })
          }),
          fc.record({ 
            duration: fc.record({
              min: fc.integer({ min: 20, max: 80 }),
              max: fc.integer({ min: 100, max: 250 })
            })
          })
        ),
        (filters: CourseFilters) => {
          const searchResults = mockDataService.searchCourses({
            query: '',
            filters,
            page: 1,
            limit: 50,
          });

          // Each course should match the single filter criterion
          searchResults.courses.forEach(course => {
            if (filters.category) {
              const categoryMatch = filters.category.some(cat => 
                course.category.slug === cat || course.category.id === cat
              );
              expect(categoryMatch).toBe(true);
            }

            if (filters.level) {
              expect(filters.level).toContain(course.level);
            }

            if (filters.mode) {
              expect(filters.mode).toContain(course.mode);
            }

            if (filters.priceRange) {
              expect(course.price.amount).toBeGreaterThanOrEqual(filters.priceRange.min);
              expect(course.price.amount).toBeLessThanOrEqual(filters.priceRange.max);
            }

            if (filters.duration) {
              expect(course.duration.hours).toBeGreaterThanOrEqual(filters.duration.min);
              expect(course.duration.hours).toBeLessThanOrEqual(filters.duration.max);
            }
          });
        }
      ),
      { 
        numRuns: 50,
        verbose: true,
      }
    );
  });

  test('Property 2b: Multiple filters should create intersection (AND logic)', () => {
    fc.assert(
      fc.property(
        fc.record({
          category: fc.constantFrom('web-development', 'data-science').map(c => [c]),
          level: fc.constantFrom('Beginner', 'Intermediate').map(l => [l])
        }),
        (filters: CourseFilters) => {
          const searchResults = mockDataService.searchCourses({
            query: '',
            filters,
            page: 1,
            limit: 100,
          });

          // Each course should match ALL filter criteria (AND logic)
          searchResults.courses.forEach(course => {
            // Must match category
            const categoryMatch = filters.category!.some(cat => 
              course.category.slug === cat || course.category.id === cat
            );
            expect(categoryMatch).toBe(true);

            // Must match level
            expect(filters.level).toContain(course.level);
          });

          // Results should be subset of individual filter results
          const categoryOnlyResults = mockDataService.searchCourses({
            query: '',
            filters: { category: filters.category },
            page: 1,
            limit: 100,
          });

          const levelOnlyResults = mockDataService.searchCourses({
            query: '',
            filters: { level: filters.level },
            page: 1,
            limit: 100,
          });

          // Combined results should be <= individual filter results
          expect(searchResults.total).toBeLessThanOrEqual(categoryOnlyResults.total);
          expect(searchResults.total).toBeLessThanOrEqual(levelOnlyResults.total);
        }
      ),
      { 
        numRuns: 30,
        verbose: true,
      }
    );
  });

  test('Property 2c: Price range filtering edge cases', () => {
    fc.assert(
      fc.property(
        fc.record({
          min: fc.integer({ min: 0, max: 100 }),
          max: fc.integer({ min: 200, max: 1000 })
        }),
        (priceRange) => {
          const searchResults = mockDataService.searchCourses({
            query: '',
            filters: { priceRange },
            page: 1,
            limit: 100,
          });

          searchResults.courses.forEach(course => {
            expect(course.price.amount).toBeGreaterThanOrEqual(priceRange.min);
            expect(course.price.amount).toBeLessThanOrEqual(priceRange.max);
          });

          // Test boundary conditions
          if (searchResults.courses.length > 0) {
            const prices = searchResults.courses.map(c => c.price.amount);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            
            expect(minPrice).toBeGreaterThanOrEqual(priceRange.min);
            expect(maxPrice).toBeLessThanOrEqual(priceRange.max);
          }
        }
      ),
      { 
        numRuns: 40,
        verbose: true,
      }
    );
  });

  test('Property 2d: Duration range filtering edge cases', () => {
    fc.assert(
      fc.property(
        fc.record({
          min: fc.integer({ min: 10, max: 50 }),
          max: fc.integer({ min: 100, max: 300 })
        }),
        (duration) => {
          const searchResults = mockDataService.searchCourses({
            query: '',
            filters: { duration },
            page: 1,
            limit: 100,
          });

          searchResults.courses.forEach(course => {
            expect(course.duration.hours).toBeGreaterThanOrEqual(duration.min);
            expect(course.duration.hours).toBeLessThanOrEqual(duration.max);
          });

          // Test boundary conditions
          if (searchResults.courses.length > 0) {
            const durations = searchResults.courses.map(c => c.duration.hours);
            const minDuration = Math.min(...durations);
            const maxDuration = Math.max(...durations);
            
            expect(minDuration).toBeGreaterThanOrEqual(duration.min);
            expect(maxDuration).toBeLessThanOrEqual(duration.max);
          }
        }
      ),
      { 
        numRuns: 40,
        verbose: true,
      }
    );
  });

  test('Property 2e: Filter results should be deterministic', () => {
    fc.assert(
      fc.property(
        fc.record({
          category: fc.option(fc.constantFrom('web-development', 'data-science').map(c => [c]), { nil: undefined }),
          level: fc.option(fc.constantFrom('Beginner', 'Advanced').map(l => [l]), { nil: undefined })
        }),
        (filters: CourseFilters) => {
          // Skip if no filters
          if (!filters.category && !filters.level) return true;

          const searchParams = {
            query: '',
            filters,
            page: 1,
            limit: 50,
          };

          // Run the same search multiple times
          const results1 = mockDataService.searchCourses(searchParams);
          const results2 = mockDataService.searchCourses(searchParams);
          const results3 = mockDataService.searchCourses(searchParams);

          // Results should be identical
          expect(results1.total).toBe(results2.total);
          expect(results2.total).toBe(results3.total);
          
          expect(results1.courses.length).toBe(results2.courses.length);
          expect(results2.courses.length).toBe(results3.courses.length);

          // Course IDs should be in the same order
          const ids1 = results1.courses.map(c => c.id);
          const ids2 = results2.courses.map(c => c.id);
          const ids3 = results3.courses.map(c => c.id);
          
          expect(ids1).toEqual(ids2);
          expect(ids2).toEqual(ids3);
        }
      ),
      { 
        numRuns: 25,
        verbose: true,
      }
    );
  });

  test('Property 2f: Empty filters should return all active courses', () => {
    const emptyFilterResults = mockDataService.searchCourses({
      query: '',
      filters: {},
      page: 1,
      limit: 1000, // Get all courses
    });

    const allCourses = mockDataService.getCourses().filter(course => course.isActive);

    // Should return all active courses when no filters are applied
    expect(emptyFilterResults.total).toBe(allCourses.length);
    expect(emptyFilterResults.courses.length).toBe(Math.min(allCourses.length, 1000));

    // All returned courses should be active
    emptyFilterResults.courses.forEach(course => {
      expect(course.isActive).toBe(true);
    });
  });
});