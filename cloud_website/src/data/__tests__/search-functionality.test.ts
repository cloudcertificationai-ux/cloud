// Feature: anywheredoor, Property 1: Course Search Functionality
// **Validates: Requirements 2.2**

import * as fc from 'fast-check';
import { mockDataService } from '../mock-data-service';
import { Course, SearchParams } from '@/types';

describe('Course Search Functionality Property Tests', () => {
  beforeEach(() => {
    // Reset data service to ensure consistent state
    mockDataService.resetData();
  });

  test('Property 1: Course Search Functionality - For any search query entered by a user, all returned courses should match the search terms in their title, description, or category fields', () => {
    fc.assert(
      fc.property(
        // Generate search queries - mix of realistic search terms and random strings
        fc.oneof(
          // Realistic search terms based on common course topics
          fc.constantFrom(
            'React', 'JavaScript', 'Python', 'Data Science', 'Web Development',
            'Machine Learning', 'Cybersecurity', 'Cloud Computing', 'Node.js',
            'TypeScript', 'Full Stack', 'Frontend', 'Backend', 'API', 'Database'
          ),
          // Random strings to test edge cases
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          // Partial matches
          fc.constantFrom('React', 'Java', 'Data', 'Web', 'Cloud', 'Cyber').map(s => s.slice(0, 3)),
          // Case variations
          fc.constantFrom('REACT', 'javascript', 'Python', 'data science').map(s => 
            Math.random() > 0.5 ? s.toLowerCase() : s.toUpperCase()
          )
        ),
        (searchQuery) => {
          // Perform search
          const searchParams: SearchParams = {
            query: searchQuery,
            page: 1,
            limit: 50, // Get more results to test thoroughly
          };

          const searchResults = mockDataService.searchCourses(searchParams);
          const { courses } = searchResults;

          // Property: All returned courses should match the search terms
          const normalizedQuery = searchQuery.toLowerCase().trim();

          courses.forEach((course: Course) => {
            const matchesTitle = course.title.toLowerCase().includes(normalizedQuery);
            const matchesShortDescription = course.shortDescription.toLowerCase().includes(normalizedQuery);
            const matchesLongDescription = course.longDescription.toLowerCase().includes(normalizedQuery);
            const matchesCategory = course.category.name.toLowerCase().includes(normalizedQuery);
            const matchesTags = course.tags.some(tag => tag.toLowerCase().includes(normalizedQuery));
            
            // Check instructor expertise and names
            const matchesInstructor = course.instructorIds.some(instructorId => {
              const instructor = mockDataService.getInstructorById(instructorId);
              if (!instructor) return false;
              
              const matchesInstructorName = instructor.name.toLowerCase().includes(normalizedQuery);
              const matchesExpertise = instructor.expertise.some(skill => 
                skill.toLowerCase().includes(normalizedQuery)
              );
              
              return matchesInstructorName || matchesExpertise;
            });

            const hasMatch = matchesTitle || 
                            matchesShortDescription || 
                            matchesLongDescription || 
                            matchesCategory || 
                            matchesTags || 
                            matchesInstructor;

            // Assert that at least one field matches the search query
            expect(hasMatch).toBe(true);
          });

          // Additional property: Search results should be relevant (non-empty query should return reasonable results)
          if (normalizedQuery.length >= 2) {
            // For reasonable queries, we should get some results or no results (but not an error)
            expect(Array.isArray(courses)).toBe(true);
            expect(searchResults.total).toBeGreaterThanOrEqual(0);
          }
        }
      ),
      { 
        numRuns: 100,
        verbose: true,
        seed: 42, // For reproducible tests
      }
    );
  });

  test('Property 1a: Search functionality should handle edge cases gracefully', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Empty and whitespace queries
          fc.constant(''),
          fc.constant('   '),
          fc.constant('\t\n'),
          // Very short queries
          fc.string({ minLength: 1, maxLength: 2 }),
          // Very long queries
          fc.string({ minLength: 100, maxLength: 200 }),
          // Special characters
          fc.constantFrom('!@#$%', '()[]{}', '+-*/', '&|^~'),
          // Numbers
          fc.integer({ min: 0, max: 9999 }).map(n => n.toString()),
          // Mixed content
          fc.tuple(
            fc.constantFrom('React', 'Python', 'Data'),
            fc.constantFrom('123', '!@#', '   ')
          ).map(([word, special]) => word + special)
        ),
        (searchQuery) => {
          const searchParams: SearchParams = {
            query: searchQuery,
            page: 1,
            limit: 20,
          };

          // The search should not throw an error regardless of input
          expect(() => {
            const results = mockDataService.searchCourses(searchParams);
            
            // Results should always be in expected format
            expect(results).toHaveProperty('courses');
            expect(results).toHaveProperty('total');
            expect(results).toHaveProperty('page');
            expect(results).toHaveProperty('totalPages');
            expect(results).toHaveProperty('hasMore');
            
            expect(Array.isArray(results.courses)).toBe(true);
            expect(typeof results.total).toBe('number');
            expect(typeof results.page).toBe('number');
            expect(typeof results.totalPages).toBe('number');
            expect(typeof results.hasMore).toBe('boolean');
            
            // Total should be non-negative
            expect(results.total).toBeGreaterThanOrEqual(0);
            
            // Page should be positive
            expect(results.page).toBeGreaterThan(0);
            
            // Courses array length should not exceed limit
            expect(results.courses.length).toBeLessThanOrEqual(20);
            
            // If there are courses, they should be valid Course objects
            results.courses.forEach(course => {
              expect(course).toHaveProperty('id');
              expect(course).toHaveProperty('title');
              expect(course).toHaveProperty('shortDescription');
              expect(course).toHaveProperty('category');
              expect(typeof course.id).toBe('string');
              expect(typeof course.title).toBe('string');
              expect(typeof course.shortDescription).toBe('string');
            });
            
          }).not.toThrow();
        }
      ),
      { 
        numRuns: 50,
        verbose: true,
      }
    );
  });

  test('Property 1b: Search results should be consistent for identical queries', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'React', 'Python', 'JavaScript', 'Data Science', 'Web Development'
        ),
        (searchQuery) => {
          const searchParams: SearchParams = {
            query: searchQuery,
            page: 1,
            limit: 20,
          };

          // Perform the same search twice
          const results1 = mockDataService.searchCourses(searchParams);
          const results2 = mockDataService.searchCourses(searchParams);

          // Results should be identical
          expect(results1.total).toBe(results2.total);
          expect(results1.courses.length).toBe(results2.courses.length);
          
          // Course IDs should be in the same order
          const ids1 = results1.courses.map(c => c.id);
          const ids2 = results2.courses.map(c => c.id);
          expect(ids1).toEqual(ids2);
        }
      ),
      { 
        numRuns: 20,
        verbose: true,
      }
    );
  });

  test('Property 1c: Search with filters should return subset of unfiltered search', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('React', 'Python', 'Data', 'Web'),
        fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
        (searchQuery, level) => {
          // Search without filters
          const unfilteredResults = mockDataService.searchCourses({
            query: searchQuery,
            page: 1,
            limit: 100,
          });

          // Search with level filter
          const filteredResults = mockDataService.searchCourses({
            query: searchQuery,
            filters: { level: [level] },
            page: 1,
            limit: 100,
          });

          // Filtered results should be a subset of unfiltered results
          expect(filteredResults.total).toBeLessThanOrEqual(unfilteredResults.total);
          
          // All filtered courses should also appear in unfiltered results
          const unfilteredIds = new Set(unfilteredResults.courses.map(c => c.id));
          filteredResults.courses.forEach(course => {
            expect(unfilteredIds.has(course.id)).toBe(true);
            expect(course.level).toBe(level);
          });
        }
      ),
      { 
        numRuns: 30,
        verbose: true,
      }
    );
  });
});