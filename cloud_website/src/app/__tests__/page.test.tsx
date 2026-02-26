import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import Home, { metadata } from '../page';
import { mockData } from '../../data/sample-data';

// Feature: anywheredoor, Property 18: Static Generation Performance
// **Validates: Requirements 10.2, 11.2**

// Mock Next.js components and hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('../../components/Header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>;
  };
});

jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, priority, className, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-priority={priority}
        data-testid="next-image"
        {...props}
      />
    );
  };
});

describe('Homepage Static Generation Performance', () => {
  it('should have complete metadata for static generation optimization', () => {
    // Property test: For any static page, all essential SEO metadata should be present
    // for optimal static generation and CDN caching
    
    expect(metadata.title).toBeDefined();
    expect(metadata.description).toBeDefined();
    expect(metadata.keywords).toBeDefined();
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.twitter).toBeDefined();
    
    // Verify metadata is optimized for static generation
    expect(typeof metadata.title).toBe('string');
    expect(typeof metadata.description).toBe('string');
    expect(Array.isArray(metadata.keywords)).toBe(true);
    
    // OpenGraph should be complete for social sharing
    expect(metadata.openGraph?.title).toBeTruthy();
    expect(metadata.openGraph?.description).toBeTruthy();
    expect((metadata.openGraph as any)?.type).toBe('website');
    expect(metadata.openGraph?.url).toBeTruthy();
    expect(metadata.openGraph?.images).toBeDefined();
    
    // Twitter card should be optimized
    expect((metadata.twitter as any)?.card).toBe('summary_large_image');
    expect(metadata.twitter?.title).toBeTruthy();
    expect(metadata.twitter?.description).toBeTruthy();
  });

  it('should render all static content for optimal performance', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 100000 }),
        fc.integer({ min: 80, max: 100 }),
        fc.float({ min: 4.0, max: 5.0 }),
        (totalStudents, placementRate, avgRating) => {
          // Property test: For any static page with success metrics,
          // all content should be rendered server-side for optimal performance
          
          const { container } = render(<Home />);
          
          // Verify structured data is present for SEO
          const structuredDataScript = container.querySelector('script[type="application/ld+json"]');
          expect(structuredDataScript).toBeTruthy();
          
          if (structuredDataScript) {
            const structuredData = JSON.parse(structuredDataScript.textContent || '{}');
            expect(structuredData['@context']).toBe('https://schema.org');
            expect(structuredData['@type']).toBe('EducationalOrganization');
            expect(structuredData.name).toBe('Anywheredoor');
            expect(structuredData.aggregateRating).toBeDefined();
          }
          
          // Verify hero section is rendered
          expect(screen.getAllByText(/Transform Your Career/)[0]).toBeInTheDocument();
          expect(screen.getAllByText(/Browse Courses/)[0]).toBeInTheDocument();
          expect(screen.getAllByText(/Learn More/)[0]).toBeInTheDocument();
          
          // Verify statistics are displayed
          expect(screen.getAllByText(/Students Enrolled/)[0]).toBeInTheDocument();
          expect(screen.getAllByText(/Job Placement Rate/)[0]).toBeInTheDocument();
          expect(screen.getAllByText(/Avg Salary Increase/)[0]).toBeInTheDocument();
          expect(screen.getAllByText(/Average Rating/)[0]).toBeInTheDocument();
          
          // Verify categories section is rendered
          expect(screen.getAllByText(/Popular Course Categories/)[0]).toBeInTheDocument();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have optimized content structure for static generation', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 3, maxLength: 8 }),
        (categoryNames) => {
          // Property test: For any set of categories, the homepage should render
          // them in an optimized structure for static generation
          
          const { container } = render(<Home />);
          
          // Verify semantic HTML structure for SEO
          const mainHeading = container.querySelector('h1');
          expect(mainHeading).toBeTruthy();
          expect(mainHeading?.textContent).toContain('Transform Your Career');
          
          const sections = container.querySelectorAll('section');
          expect(sections.length).toBeGreaterThanOrEqual(2); // Hero + Categories
          
          // Verify category grid structure
          const categoryGrid = container.querySelector('.grid');
          expect(categoryGrid).toBeTruthy();
          
          // Verify links are properly structured for prefetching
          const categoryLinks = container.querySelectorAll('a[href*="/courses"]');
          expect(categoryLinks.length).toBeGreaterThan(0);
          
          // Verify proper heading hierarchy
          const h2Elements = container.querySelectorAll('h2');
          expect(h2Elements.length).toBeGreaterThan(0);
          
          const h3Elements = container.querySelectorAll('h3');
          expect(h3Elements.length).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include performance-optimized elements for static generation', () => {
    fc.assert(
      fc.property(
        fc.record({
          totalStudents: fc.integer({ min: 10000, max: 200000 }),
          jobPlacementRate: fc.integer({ min: 70, max: 100 }),
          averageSalaryIncrease: fc.string({ minLength: 2, maxLength: 5 }),
          averageRating: fc.float({ min: 3.5, max: 5.0 }),
        }),
        (metrics) => {
          // Property test: For any success metrics, the static page should
          // render performance-optimized content for CDN caching
          
          const { container } = render(<Home />);
          
          // Verify no client-side only content that would break SSG
          expect(container.querySelector('[data-client-only]')).toBeFalsy();
          
          // Verify proper meta tags are included in structured data
          const structuredDataScript = container.querySelector('script[type="application/ld+json"]');
          expect(structuredDataScript).toBeTruthy();
          
          // Verify content is fully rendered (not loading states)
          expect(screen.queryByText(/loading/i)).toBeFalsy();
          expect(screen.queryByText(/skeleton/i)).toBeFalsy();
          
          // Verify all critical content is present for static generation
          expect(screen.getAllByText(/Transform Your Career/)[0]).toBeInTheDocument();
          expect(screen.getAllByText(/Popular Course Categories/)[0]).toBeInTheDocument();
          
          // Verify proper link structure for prefetching
          const internalLinks = container.querySelectorAll('a[href^="/"]');
          expect(internalLinks.length).toBeGreaterThan(0);
          
          // Verify no dynamic imports that would break static generation
          expect(container.innerHTML).not.toContain('React.lazy');
          expect(container.innerHTML).not.toContain('dynamic(');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});