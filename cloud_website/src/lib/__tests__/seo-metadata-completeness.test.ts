// Property test for SEO metadata completeness
// Feature: anywheredoor, Property 13: SEO Metadata Completeness
// **Validates: Requirements 7.1, 7.3**

import * as fc from 'fast-check';
import { 
  generateCourseSEOMetadata, 
  generateInstructorSEOMetadata,
  generateCourseStructuredData,
  generateInstructorStructuredData,
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData,
  optimizeMetaDescription,
  extractKeywords,
  generateSlug,
  generateCanonicalUrl
} from '../seo';
import type { Course, Instructor } from '@/types';

// Generators for property-based testing
const courseGenerator = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  title: fc.string({ minLength: 10, maxLength: 100 }),
  slug: fc.string({ minLength: 5, maxLength: 50 }),
  shortDescription: fc.string({ minLength: 50, maxLength: 200 }),
  longDescription: fc.string({ minLength: 200, maxLength: 1000 }),
  category: fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    name: fc.string({ minLength: 3, maxLength: 30 }),
    slug: fc.string({ minLength: 3, maxLength: 30 }),
    description: fc.string({ minLength: 20, maxLength: 100 }),
    color: fc.string({ minLength: 6, maxLength: 7 }),
  }),
  level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
  duration: fc.record({
    hours: fc.integer({ min: 1, max: 200 }),
    weeks: fc.integer({ min: 1, max: 52 }),
  }),
  price: fc.record({
    amount: fc.integer({ min: 0, max: 5000 }),
    currency: fc.constant('USD'),
    originalPrice: fc.option(fc.integer({ min: 0, max: 5000 })),
  }),
  rating: fc.record({
    average: fc.float({ min: 1, max: 5 }),
    count: fc.integer({ min: 0, max: 10000 }),
  }),
  thumbnailUrl: fc.webUrl(),
  instructorIds: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
  curriculum: fc.array(fc.record({
    id: fc.string({ minLength: 1, maxLength: 20 }),
    title: fc.string({ minLength: 5, maxLength: 50 }),
    description: fc.string({ minLength: 20, maxLength: 200 }),
    order: fc.integer({ min: 1, max: 20 }),
    lessons: fc.array(fc.record({
      id: fc.string({ minLength: 1, maxLength: 20 }),
      title: fc.string({ minLength: 5, maxLength: 50 }),
      type: fc.constantFrom('Video', 'Reading', 'Exercise', 'Quiz'),
      duration: fc.integer({ min: 5, max: 120 }),
      isPreview: fc.boolean(),
    }), { minLength: 1, maxLength: 10 }),
    estimatedHours: fc.integer({ min: 1, max: 20 }),
  }), { minLength: 1, maxLength: 10 }),
  tags: fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
  mode: fc.constantFrom('Live', 'Self-Paced', 'Hybrid'),
  enrollmentCount: fc.integer({ min: 0, max: 100000 }),
  isActive: fc.boolean(),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
}) as fc.Arbitrary<Course>;

const instructorGenerator = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  name: fc.string({ minLength: 5, maxLength: 50 }),
  title: fc.string({ minLength: 10, maxLength: 100 }),
  bio: fc.string({ minLength: 100, maxLength: 500 }),
  profileImageUrl: fc.webUrl(),
  expertise: fc.array(fc.string({ minLength: 3, maxLength: 30 }), { minLength: 1, maxLength: 10 }),
  experience: fc.record({
    years: fc.integer({ min: 1, max: 30 }),
    companies: fc.array(fc.string({ minLength: 3, maxLength: 30 }), { minLength: 1, maxLength: 10 }),
  }),
  socialLinks: fc.record({
    linkedin: fc.option(fc.webUrl()),
    twitter: fc.option(fc.webUrl()),
    github: fc.option(fc.webUrl()),
  }),
  courseIds: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 20 }),
  rating: fc.record({
    average: fc.float({ min: 1, max: 5 }),
    count: fc.integer({ min: 0, max: 1000 }),
  }),
}) as fc.Arbitrary<Instructor>;

describe('SEO Metadata Completeness Property Tests', () => {
  describe('Course SEO Metadata', () => {
    it('should generate complete SEO metadata for any course', () => {
      fc.assert(
        fc.property(
          courseGenerator,
          fc.array(instructorGenerator, { minLength: 1, maxLength: 3 }),
          (course, instructors) => {
            const seoMetadata = generateCourseSEOMetadata(course, instructors);
            
            // Property: For any course, all essential SEO metadata should be present
            expect(seoMetadata.title).toBeDefined();
            expect(seoMetadata.title.length).toBeGreaterThan(10);
            expect(seoMetadata.title.length).toBeLessThan(70); // SEO title limit
            
            expect(seoMetadata.description).toBeDefined();
            expect(seoMetadata.description.length).toBeGreaterThan(50);
            expect(seoMetadata.description.length).toBeLessThan(170); // SEO description limit
            
            expect(Array.isArray(seoMetadata.keywords)).toBe(true);
            expect(seoMetadata.keywords.length).toBeGreaterThan(0);
            
            expect(seoMetadata.canonicalUrl).toBeDefined();
            expect(seoMetadata.canonicalUrl).toMatch(/^https?:\/\//);
            
            // OpenGraph metadata
            expect(seoMetadata.openGraph.title).toBeDefined();
            expect(seoMetadata.openGraph.description).toBeDefined();
            expect(seoMetadata.openGraph.image).toBeDefined();
            expect(seoMetadata.openGraph.type).toBe('course');
            
            // Twitter Card metadata
            expect(seoMetadata.twitterCard.card).toBe('summary_large_image');
            expect(seoMetadata.twitterCard.title).toBeDefined();
            expect(seoMetadata.twitterCard.description).toBeDefined();
            expect(seoMetadata.twitterCard.image).toBeDefined();
            
            // Structured data
            expect(seoMetadata.structuredData).toBeDefined();
            expect(seoMetadata.structuredData['@context']).toBe('https://schema.org');
            expect(seoMetadata.structuredData['@type']).toBe('Course');
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid structured data for any course', () => {
      fc.assert(
        fc.property(
          courseGenerator,
          fc.array(instructorGenerator, { minLength: 1, maxLength: 3 }),
          (course, instructors) => {
            const structuredData = generateCourseStructuredData(course, instructors, '2024-01-01T00:00:00.000Z');
            
            // Property: For any course, structured data should contain all required schema.org fields
            expect(structuredData['@context']).toBe('https://schema.org');
            expect(structuredData['@type']).toBe('Course');
            expect(structuredData.name).toBe(course.title);
            expect(structuredData.description).toBe(course.shortDescription);
            
            // Provider information
            expect(structuredData.provider).toBeDefined();
            expect(structuredData.provider['@type']).toBe('Organization');
            expect(structuredData.provider.name).toBe('Anywheredoor');
            
            // Instructor information
            expect(Array.isArray(structuredData.instructor)).toBe(true);
            expect(structuredData.instructor.length).toBe(instructors.length);
            
            // Course details
            expect(structuredData.courseCode).toBe(course.id);
            expect(structuredData.educationalLevel).toBe(course.level);
            expect(structuredData.timeRequired).toMatch(/^PT\d+H$/);
            
            // Rating information
            expect(structuredData.aggregateRating).toBeDefined();
            expect(structuredData.aggregateRating['@type']).toBe('AggregateRating');
            expect(structuredData.aggregateRating.ratingValue).toBe(course.rating.average);
            
            // Offer information
            expect(structuredData.offers).toBeDefined();
            expect(structuredData.offers['@type']).toBe('Offer');
            expect(structuredData.offers.price).toBe(course.price.amount);
            expect(structuredData.offers.priceCurrency).toBe(course.price.currency);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Instructor SEO Metadata', () => {
    it('should generate complete SEO metadata for any instructor', () => {
      fc.assert(
        fc.property(
          instructorGenerator,
          (instructor) => {
            const seoMetadata = generateInstructorSEOMetadata(instructor);
            
            // Property: For any instructor, all essential SEO metadata should be present
            expect(seoMetadata.title).toBeDefined();
            expect(seoMetadata.title).toContain(instructor.name);
            expect(seoMetadata.title.length).toBeLessThan(70);
            
            expect(seoMetadata.description).toBeDefined();
            expect(seoMetadata.description).toContain(instructor.name);
            expect(seoMetadata.description.length).toBeLessThan(170);
            
            expect(Array.isArray(seoMetadata.keywords)).toBe(true);
            expect(seoMetadata.keywords).toContain(instructor.name.toLowerCase());
            
            expect(seoMetadata.canonicalUrl).toBeDefined();
            expect(seoMetadata.canonicalUrl).toMatch(/^https?:\/\//);
            
            // OpenGraph metadata
            expect(seoMetadata.openGraph.title).toContain(instructor.name);
            expect(seoMetadata.openGraph.description).toBeDefined();
            expect(seoMetadata.openGraph.image).toMatch(/^https?:\/\//); // Should be a valid URL (dynamic OG image)
            expect(seoMetadata.openGraph.type).toBe('website');
            
            // Structured data
            expect(seoMetadata.structuredData).toBeDefined();
            expect(seoMetadata.structuredData['@type']).toBe('Person');
            expect(seoMetadata.structuredData.name).toBe(instructor.name);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('SEO Utility Functions', () => {
    it('should optimize meta descriptions to proper length for any input', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.integer({ min: 50, max: 200 }),
          (description, maxLength) => {
            const optimized = optimizeMetaDescription(description, maxLength);
            
            // Property: For any description, optimized version should be within limits
            expect(optimized.length).toBeLessThanOrEqual(maxLength);
            
            if (description.length <= maxLength) {
              expect(optimized).toBe(description);
            } else {
              expect(optimized.length).toBeLessThan(description.length);
              // Should not end with incomplete words (unless very short)
              if (optimized.length > maxLength * 0.5) {
                expect(optimized).not.toMatch(/\w+\.\.\.$/);
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate SEO-friendly slugs for any title', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(title => {
            const trimmed = title.trim();
            return trimmed.length > 0 && /[a-zA-Z0-9]/.test(trimmed);
          }),
          (title) => {
            const slug = generateSlug(title);
            
            // Property: For any title with alphanumeric content, slug should be SEO-friendly
            expect(slug).toMatch(/^[a-z0-9-]*$/); // Only lowercase, numbers, and hyphens
            expect(slug).not.toMatch(/^-|-$/); // No leading or trailing hyphens
            expect(slug).not.toMatch(/--/); // No double hyphens
            expect(slug.length).toBeGreaterThan(0); // Should have content
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate canonical URLs with proper format', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 })
            .filter(path => /[a-zA-Z0-9]/.test(path) && !path.includes(' ')),
          (path) => {
            const canonicalUrl = generateCanonicalUrl(`/${path}`);
            
            // Property: For any valid path, canonical URL should be properly formatted
            expect(canonicalUrl).toMatch(/^https?:\/\//);
            expect(canonicalUrl).toContain(path);
            expect(() => new URL(canonicalUrl)).not.toThrow();
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should extract relevant keywords from any course', () => {
      fc.assert(
        fc.property(
          courseGenerator,
          (course) => {
            const keywords = extractKeywords(course);
            
            // Property: For any course, extracted keywords should include relevant terms
            expect(Array.isArray(keywords)).toBe(true);
            expect(keywords.length).toBeGreaterThan(0);
            
            // Should include category
            expect(keywords).toContain(course.category.name.toLowerCase());
            
            // Should include level
            expect(keywords).toContain(course.level.toLowerCase());
            
            // Should include mode
            expect(keywords).toContain(course.mode.toLowerCase());
            
            // Should include common course keywords
            expect(keywords).toContain('online course');
            expect(keywords).toContain('certification');
            
            // Should include tags
            course.tags.forEach(tag => {
              expect(keywords).toContain(tag.toLowerCase());
            });
            
            // All keywords should be lowercase
            keywords.forEach(keyword => {
              expect(keyword).toBe(keyword.toLowerCase());
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Organization and Breadcrumb Structured Data', () => {
    it('should generate valid organization structured data', () => {
      const orgData = generateOrganizationStructuredData();
      
      // Property: Organization structured data should always have required fields
      expect(orgData['@context']).toBe('https://schema.org');
      expect(orgData['@type']).toBe('EducationalOrganization');
      expect(orgData.name).toBe('Anywheredoor');
      expect(orgData.description).toBeDefined();
      expect(orgData.url).toBeDefined();
      expect(orgData.logo).toBeDefined();
      expect(Array.isArray(orgData.sameAs)).toBe(true);
      expect(orgData.contactPoint).toBeDefined();
      expect(orgData.address).toBeDefined();
      expect(Array.isArray(orgData.knowsAbout)).toBe(true);
    });

    it('should generate valid breadcrumb structured data for any breadcrumb list', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 50 }),
              url: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (breadcrumbs) => {
            const breadcrumbData = generateBreadcrumbStructuredData(breadcrumbs);
            
            // Property: For any breadcrumb list, structured data should be valid
            expect(breadcrumbData['@context']).toBe('https://schema.org');
            expect(breadcrumbData['@type']).toBe('BreadcrumbList');
            expect(Array.isArray(breadcrumbData.itemListElement)).toBe(true);
            expect(breadcrumbData.itemListElement.length).toBe(breadcrumbs.length);
            
            breadcrumbData.itemListElement.forEach((item, index) => {
              expect(item['@type']).toBe('ListItem');
              expect(item.position).toBe(index + 1);
              expect(item.name).toBe(breadcrumbs[index].name);
              expect(item.item).toContain(breadcrumbs[index].url);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});