// Property test for SEO-friendly URL structure
// Feature: anywheredoor, Property 16: SEO-Friendly URL Structure
// **Validates: Requirements 7.4**

import * as fc from 'fast-check';
import { generateSlug, generateCanonicalUrl } from '../seo';
import { mockDataService } from '@/data/mock-data-service';

describe('SEO-Friendly URL Structure Property Tests', () => {
  describe('URL Slug Generation', () => {
    it('should generate SEO-friendly slugs for any course title', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(title => {
            const trimmed = title.trim();
            return trimmed.length > 0 && /[a-zA-Z0-9]/.test(trimmed);
          }),
          (title) => {
            const slug = generateSlug(title);
            
            // Property: For any course title, generated slug should be SEO-friendly
            
            // Should only contain lowercase letters, numbers, and hyphens
            expect(slug).toMatch(/^[a-z0-9-]*$/);
            
            // Should not start or end with hyphens
            expect(slug).not.toMatch(/^-|-$/);
            
            // Should not contain consecutive hyphens
            expect(slug).not.toMatch(/--/);
            
            // Should have some content since we filtered for alphanumeric input
            expect(slug.length).toBeGreaterThan(0);
            
            // Should be URL-safe
            expect(decodeURIComponent(slug)).toBe(slug);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate consistent slugs for the same input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (title) => {
            const slug1 = generateSlug(title);
            const slug2 = generateSlug(title);
            
            // Property: For any title, slug generation should be deterministic
            expect(slug1).toBe(slug2);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle special characters appropriately', () => {
      const testCases = [
        'JavaScript & React Development',
        'C++ Programming: Advanced Concepts',
        'Data Science with Python (2024)',
        'Web Development - Full Stack',
        'Machine Learning: A-Z Guide',
        'Node.js + Express.js Tutorial',
        'CSS3 & HTML5 Masterclass',
        'API Development @ Scale',
      ];

      testCases.forEach(title => {
        const slug = generateSlug(title);
        
        // Should be valid URL slug
        expect(slug).toMatch(/^[a-z0-9-]*$/);
        expect(slug).not.toMatch(/^-|-$/);
        expect(slug).not.toMatch(/--/);
        expect(slug.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Canonical URL Generation', () => {
    it('should generate proper canonical URLs for any valid path', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 })
            .filter(path => !path.includes(' ') && !path.includes('?') && !path.includes('#')),
          (path) => {
            const cleanPath = path.startsWith('/') ? path : `/${path}`;
            const canonicalUrl = generateCanonicalUrl(cleanPath);
            
            // Property: For any valid path, canonical URL should be properly formatted
            
            // Should start with protocol
            expect(canonicalUrl).toMatch(/^https?:\/\//);
            
            // Should contain the path
            expect(canonicalUrl).toContain(path);
            
            // Should be a valid URL
            expect(() => new URL(canonicalUrl)).not.toThrow();
            
            // Should not have query parameters or fragments
            const url = new URL(canonicalUrl);
            expect(url.search).toBe('');
            expect(url.hash).toBe('');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate consistent canonical URLs', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(path => !path.includes(' ')),
          (path) => {
            const cleanPath = path.startsWith('/') ? path : `/${path}`;
            const url1 = generateCanonicalUrl(cleanPath);
            const url2 = generateCanonicalUrl(cleanPath);
            
            // Property: For any path, canonical URL generation should be deterministic
            expect(url1).toBe(url2);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Course URL Structure', () => {
    it('should have SEO-friendly URLs for all courses', () => {
      const courses = mockDataService.getCourses();
      
      courses.forEach(course => {
        // Property: For any course, the URL structure should be SEO-friendly
        
        // Slug should be SEO-friendly
        expect(course.slug).toMatch(/^[a-z0-9-]+$/);
        expect(course.slug).not.toMatch(/^-|-$/);
        expect(course.slug).not.toMatch(/--/);
        expect(course.slug.length).toBeGreaterThan(0);
        
        // URL path should be logical
        const expectedPath = `/courses/${course.slug}`;
        expect(expectedPath).toMatch(/^\/courses\/[a-z0-9-]+$/);
        
        // Canonical URL should be valid
        const canonicalUrl = generateCanonicalUrl(expectedPath);
        expect(() => new URL(canonicalUrl)).not.toThrow();
      });
    });

    it('should have unique slugs for all courses', () => {
      const courses = mockDataService.getCourses();
      const slugs = courses.map(course => course.slug);
      const uniqueSlugs = new Set(slugs);
      
      // Property: All course slugs should be unique
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('Instructor URL Structure', () => {
    it('should have SEO-friendly URLs for all instructors', () => {
      const instructors = mockDataService.getInstructors();
      
      instructors.forEach(instructor => {
        // Property: For any instructor, the URL structure should be SEO-friendly
        
        // ID should be URL-safe (used in URL path)
        expect(instructor.id).toMatch(/^[a-zA-Z0-9-_]+$/);
        expect(instructor.id.length).toBeGreaterThan(0);
        
        // URL path should be logical
        const expectedPath = `/instructors/${instructor.id}`;
        expect(expectedPath).toMatch(/^\/instructors\/[a-zA-Z0-9-_]+$/);
        
        // Canonical URL should be valid
        const canonicalUrl = generateCanonicalUrl(expectedPath);
        expect(() => new URL(canonicalUrl)).not.toThrow();
      });
    });

    it('should have unique IDs for all instructors', () => {
      const instructors = mockDataService.getInstructors();
      const ids = instructors.map(instructor => instructor.id);
      const uniqueIds = new Set(ids);
      
      // Property: All instructor IDs should be unique
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Category URL Structure', () => {
    it('should have SEO-friendly URLs for all categories', () => {
      const categories = mockDataService.getCategories();
      
      categories.forEach(category => {
        // Property: For any category, the URL structure should be SEO-friendly
        
        // Slug should be SEO-friendly
        expect(category.slug).toMatch(/^[a-z0-9-]+$/);
        expect(category.slug).not.toMatch(/^-|-$/);
        expect(category.slug).not.toMatch(/--/);
        expect(category.slug.length).toBeGreaterThan(0);
        
        // URL path should be logical
        const expectedPath = `/courses?category=${category.slug}`;
        expect(expectedPath).toMatch(/^\/courses\?category=[a-z0-9-]+$/);
      });
    });

    it('should have unique slugs for all categories', () => {
      const categories = mockDataService.getCategories();
      const slugs = categories.map(category => category.slug);
      const uniqueSlugs = new Set(slugs);
      
      // Property: All category slugs should be unique
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('URL Path Validation', () => {
    it('should validate common URL patterns', () => {
      const urlPatterns = [
        '/',
        '/courses',
        '/courses/javascript-fundamentals',
        '/courses/advanced-react-development',
        '/instructors',
        '/instructors/john-doe',
        '/instructors/jane-smith-123',
        '/about',
        '/contact',
      ];

      urlPatterns.forEach(path => {
        // Property: Common URL patterns should be valid
        
        // Should not contain invalid characters
        expect(path).not.toMatch(/[<>"\s]/);
        
        // Should start with /
        expect(path).toMatch(/^\//);
        
        // Should not end with / (except root)
        if (path !== '/') {
          expect(path).not.toMatch(/\/$/);
        }
        
        // Should not contain double slashes
        expect(path).not.toMatch(/\/\//);
        
        // Canonical URL should be valid
        const canonicalUrl = generateCanonicalUrl(path);
        expect(() => new URL(canonicalUrl)).not.toThrow();
      });
    });

    it('should handle URL encoding properly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(str => /[a-zA-Z0-9]/.test(str)), // Must contain at least one alphanumeric
          (input) => {
            const slug = generateSlug(input);
            const path = `/courses/${slug}`;
            const canonicalUrl = generateCanonicalUrl(path);
            
            // Property: URLs should handle encoding properly
            
            if (slug.length > 0) {
              // Should be valid when encoded/decoded
              const encoded = encodeURIComponent(slug);
              const decoded = decodeURIComponent(encoded);
              expect(decoded).toBe(slug);
              
              // URL should be valid
              expect(() => new URL(canonicalUrl)).not.toThrow();
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Breadcrumb URL Structure', () => {
    it('should generate valid breadcrumb URLs', () => {
      const courses = mockDataService.getCourses().slice(0, 5); // Test with first 5 courses
      
      courses.forEach(course => {
        // Property: Breadcrumb URLs should be valid and hierarchical
        
        const breadcrumbPaths = [
          '/',
          '/courses',
          `/courses?category=${course.category.slug}`,
          `/courses/${course.slug}`,
        ];
        
        breadcrumbPaths.forEach((path, index) => {
          // Each breadcrumb level should be valid
          if (path.includes('?')) {
            // Query parameter URLs
            const [basePath, query] = path.split('?');
            expect(basePath).toMatch(/^\/[a-z]*$/);
            expect(query).toMatch(/^[a-z]+=[\w-]+$/);
          } else {
            // Regular paths
            expect(path).toMatch(/^\/([a-z0-9-]*\/?)*$/);
          }
          
          // Should be hierarchical (each level builds on previous)
          if (index > 0) {
            const previousPath = breadcrumbPaths[index - 1];
            if (!path.includes('?') && !previousPath.includes('?')) {
              expect(path.startsWith(previousPath) || previousPath === '/').toBe(true);
            }
          }
        });
      });
    });
  });
});