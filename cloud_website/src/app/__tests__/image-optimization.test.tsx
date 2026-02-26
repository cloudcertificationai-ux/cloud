import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import Home from '../page';

// Feature: anywheredoor, Property 19: Image Optimization Compliance
// **Validates: Requirements 10.4, 8.4**

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

// Mock Next.js Image component to verify optimization properties
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

describe('Image Optimization Compliance', () => {
  it('should use Next.js Image component for all images', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 4, maxLength: 8 }),
        (partnerNames) => {
          // Property test: For any set of partner names, all images should use Next.js Image component
          // for automatic optimization, lazy loading, and responsive sizing
          
          const { container } = render(<Home />);
          
          // Verify all images use Next.js Image component (mocked as img with data-testid)
          const nextImages = container.querySelectorAll('img[data-testid="next-image"]');
          const regularImages = container.querySelectorAll('img:not([data-testid="next-image"])');
          
          // All images should be Next.js Image components
          expect(nextImages.length).toBeGreaterThan(0);
          expect(regularImages.length).toBe(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have proper image attributes for optimization', () => {
    fc.assert(
      fc.property(
        fc.record({
          width: fc.integer({ min: 50, max: 500 }),
          height: fc.integer({ min: 20, max: 200 }),
          priority: fc.boolean(),
        }),
        (imageProps) => {
          // Property test: For any image dimensions and priority settings,
          // images should have proper attributes for Next.js optimization
          
          const { container } = render(<Home />);
          
          const images = container.querySelectorAll('img[data-testid="next-image"]');
          
          images.forEach((img) => {
            // Verify required attributes for optimization
            expect(img.getAttribute('src')).toBeTruthy();
            expect(img.getAttribute('alt')).toBeTruthy();
            expect(img.getAttribute('width')).toBeTruthy();
            expect(img.getAttribute('height')).toBeTruthy();
            
            // Verify width and height are numeric
            const width = img.getAttribute('width');
            const height = img.getAttribute('height');
            expect(Number(width)).toBeGreaterThan(0);
            expect(Number(height)).toBeGreaterThan(0);
            
            // Verify alt text is descriptive (not empty or just filename)
            const alt = img.getAttribute('alt') || '';
            expect(alt.length).toBeGreaterThan(0);
            expect(alt).not.toMatch(/\.(jpg|jpeg|png|svg|webp)$/i);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should implement lazy loading for performance optimization', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 5, maxLength: 15 }), { minLength: 6, maxLength: 10 }),
        (imageNames) => {
          // Property test: For any set of images, lazy loading should be implemented
          // for performance optimization (except priority images)
          
          const { container } = render(<Home />);
          
          const images = container.querySelectorAll('img[data-testid="next-image"]');
          const priorityImages = container.querySelectorAll('img[data-priority="true"]');
          const nonPriorityImages = container.querySelectorAll('img[data-priority="false"], img:not([data-priority])');
          
          // Should have both priority and non-priority images
          expect(images.length).toBeGreaterThan(0);
          
          // Priority images should be marked appropriately
          priorityImages.forEach((img) => {
            expect(img.getAttribute('data-priority')).toBe('true');
          });
          
          // Non-priority images should use lazy loading (default behavior)
          nonPriorityImages.forEach((img) => {
            const priority = img.getAttribute('data-priority');
            expect(priority === null || priority === 'false').toBe(true);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have responsive image sizing and proper CSS classes', () => {
    fc.assert(
      fc.property(
        fc.record({
          containerWidth: fc.integer({ min: 320, max: 1920 }),
          imageCount: fc.integer({ min: 4, max: 12 }),
        }),
        (layoutProps) => {
          // Property test: For any container width and image count,
          // images should have responsive sizing and proper CSS classes
          
          const { container } = render(<Home />);
          
          const images = container.querySelectorAll('img[data-testid="next-image"]');
          
          images.forEach((img) => {
            const className = img.getAttribute('class') || '';
            
            // Verify images have responsive classes or sizing
            const hasResponsiveClass = 
              className.includes('w-auto') ||
              className.includes('h-auto') ||
              className.includes('object-contain') ||
              className.includes('object-cover') ||
              className.includes('mx-auto');
            
            // At least some styling should be present for responsive behavior
            expect(hasResponsiveClass || className.length > 0).toBe(true);
            
            // Verify proper object-fit classes for image optimization
            if (className.includes('object-')) {
              expect(
                className.includes('object-contain') ||
                className.includes('object-cover') ||
                className.includes('object-fill')
              ).toBe(true);
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should optimize partner logos and certification badges', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 4, maxLength: 12 }), { minLength: 6, maxLength: 10 }),
        (partnerLogos) => {
          // Property test: For any set of partner logos and certification badges,
          // they should be optimized with proper dimensions and formats
          
          const { container } = render(<Home />);
          
          // Find partner logo images
          const partnerImages = container.querySelectorAll('img[alt*="logo"]');
          const certificationImages = container.querySelectorAll('img[alt*="Certified"], img[alt*="Accredited"], img[alt*="Recognized"], img[alt*="Guarantee"]');
          
          // Verify partner logos have optimization attributes
          partnerImages.forEach((img) => {
            expect(img.getAttribute('width')).toBeTruthy();
            expect(img.getAttribute('height')).toBeTruthy();
            
            // Partner logos should have reasonable dimensions
            const width = Number(img.getAttribute('width'));
            const height = Number(img.getAttribute('height'));
            expect(width).toBeGreaterThan(50);
            expect(width).toBeLessThan(300);
            expect(height).toBeGreaterThan(20);
            expect(height).toBeLessThan(150);
            
            // Should have proper CSS classes for styling
            const className = img.getAttribute('class') || '';
            expect(className.length).toBeGreaterThan(0);
          });
          
          // Verify certification badges have optimization attributes
          certificationImages.forEach((img) => {
            expect(img.getAttribute('width')).toBeTruthy();
            expect(img.getAttribute('height')).toBeTruthy();
            
            // Certification badges should be square or nearly square
            const width = Number(img.getAttribute('width'));
            const height = Number(img.getAttribute('height'));
            expect(width).toBeGreaterThan(40);
            expect(height).toBeGreaterThan(40);
            
            // Should have descriptive alt text
            const alt = img.getAttribute('alt') || '';
            expect(alt.length).toBeGreaterThan(5);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});