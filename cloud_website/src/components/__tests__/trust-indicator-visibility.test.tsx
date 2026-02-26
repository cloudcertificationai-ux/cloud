// Feature: anywheredoor, Property 15: Trust Indicator Visibility
// **Validates: Requirements 9.1, 9.5**

import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import TrustIndicators from '../TrustIndicators';
import { JobPlacementStats } from '../JobPlacementStats';
import { SuccessMetrics } from '@/types';

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('Trust Indicator Visibility Property Tests', () => {
  test('Property 15: Trust Indicator Visibility - For any homepage or course page visit, trust indicators including partner logos, certifications, and placement statistics should be prominently displayed', () => {
    fc.assert(
      fc.property(
        fc.record({
          totalStudents: fc.integer({ min: 1000, max: 100000 }),
          averageSalaryIncrease: fc.string({ minLength: 2, maxLength: 10 }),
          jobPlacementRate: fc.integer({ min: 70, max: 100 }),
          courseCompletionRate: fc.integer({ min: 60, max: 100 }),
          averageRating: fc.float({ min: 3.0, max: 5.0 }),
          industryPartners: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 3, maxLength: 10 }),
        }),
        (metricsData) => {
          const metrics = metricsData as SuccessMetrics;
          
          const { container } = render(
            <TrustIndicators 
              metrics={metrics} 
              showPartnerLogos={true}
              showCertifications={true}
              showStatistics={true}
            />
          );
          
          // Property: Trust indicators should display key statistics prominently
          expect(container.textContent).toContain(metrics.totalStudents.toLocaleString());
          expect(container.textContent).toContain(metrics.jobPlacementRate.toString());
          expect(container.textContent).toContain(metrics.courseCompletionRate.toString());
          expect(container.textContent).toContain(metrics.averageRating.toString());
          
          // Property: Partner logos section should be present
          expect(container.textContent).toContain('Our Graduates Work At');
          
          // Property: Certifications section should be present
          expect(container.textContent).toContain('Certifications & Accreditations');
          
          // Property: Trust badges should be visible
          expect(container.textContent).toContain('Verified Reviews');
          expect(container.textContent).toContain('Industry Certified');
          expect(container.textContent).toContain('Money-Back Guarantee');
          
          // Property: Statistics should have descriptive labels
          expect(container.textContent).toContain('Students Trained');
          expect(container.textContent).toContain('Job Placement Rate');
          expect(container.textContent).toContain('Course Completion');
          expect(container.textContent).toContain('Average Rating');
          
          // Property: Icons should be present for visual enhancement
          const icons = container.querySelectorAll('svg');
          expect(icons.length).toBeGreaterThanOrEqual(4); // At least 4 icons for main stats
          
          // Property: Partner logos should have proper alt text
          const partnerImages = container.querySelectorAll('img[alt*="logo"]');
          partnerImages.forEach(img => {
            const altText = img.getAttribute('alt');
            expect(altText).toBeTruthy();
            expect(altText).toContain('logo');
          });
          
          // Property: Certification images should have proper alt text
          const certImages = container.querySelectorAll('img[alt*="certification"]');
          certImages.forEach(img => {
            const altText = img.getAttribute('alt');
            expect(altText).toBeTruthy();
            expect(altText).toContain('certification');
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 15a: Job Placement Statistics should display comprehensive career metrics', () => {
    fc.assert(
      fc.property(
        fc.record({
          totalStudents: fc.integer({ min: 1000, max: 100000 }),
          averageSalaryIncrease: fc.string({ minLength: 2, maxLength: 10 }),
          jobPlacementRate: fc.integer({ min: 70, max: 100 }),
          courseCompletionRate: fc.integer({ min: 60, max: 100 }),
          averageRating: fc.float({ min: 3.0, max: 5.0 }),
          industryPartners: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 6, maxLength: 10 }),
        }),
        (metricsData) => {
          const metrics = metricsData as SuccessMetrics;
          
          const { container } = render(
            <JobPlacementStats 
              metrics={metrics} 
              showDetailedBreakdown={true}
              animateOnView={false}
            />
          );
          
          // Property: Job placement rate should be prominently displayed
          expect(container.textContent).toContain(metrics.jobPlacementRate.toString());
          expect(container.textContent).toContain('Job Placement Rate');
          
          // Property: Salary increase should be displayed
          expect(container.textContent).toContain(metrics.averageSalaryIncrease);
          expect(container.textContent).toContain('Average Salary Increase');
          
          // Property: Career advancement metrics should be present
          expect(container.textContent).toContain('Career Advancement');
          expect(container.textContent).toContain('Successful Placements');
          
          // Property: Detailed breakdown should show role-specific information
          expect(container.textContent).toContain('Placement Breakdown by Role');
          expect(container.textContent).toContain('Software Engineer');
          expect(container.textContent).toContain('Data Scientist');
          
          // Property: Industry partners should be listed
          expect(container.textContent).toContain('Hiring Partners Include');
          
          // Property: All metrics should have proper icons
          const metricIcons = container.querySelectorAll('svg');
          expect(metricIcons.length).toBeGreaterThanOrEqual(4);
          
          // Property: Success stories CTA should be present
          expect(container.textContent).toContain('View Success Stories');
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 15b: Trust indicators should be configurable and handle different display options', () => {
    fc.assert(
      fc.property(
        fc.record({
          totalStudents: fc.integer({ min: 1000, max: 100000 }),
          averageSalaryIncrease: fc.string({ minLength: 2, maxLength: 10 }),
          jobPlacementRate: fc.integer({ min: 70, max: 100 }),
          courseCompletionRate: fc.integer({ min: 60, max: 100 }),
          averageRating: fc.float({ min: 3.0, max: 5.0 }),
          industryPartners: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 3, maxLength: 10 }),
        }),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (metricsData, showPartners, showCerts, showStats) => {
          const metrics = metricsData as SuccessMetrics;
          
          const { container } = render(
            <TrustIndicators 
              metrics={metrics} 
              showPartnerLogos={showPartners}
              showCertifications={showCerts}
              showStatistics={showStats}
            />
          );
          
          // Property: Partner logos section should only appear when enabled
          if (showPartners) {
            expect(container.textContent).toContain('Our Graduates Work At');
          } else {
            expect(container.textContent).not.toContain('Our Graduates Work At');
          }
          
          // Property: Certifications section should only appear when enabled
          if (showCerts) {
            expect(container.textContent).toContain('Certifications & Accreditations');
          } else {
            expect(container.textContent).not.toContain('Certifications & Accreditations');
          }
          
          // Property: Statistics should only appear when enabled
          if (showStats) {
            expect(container.textContent).toContain('Students Trained');
          } else {
            expect(container.textContent).not.toContain('Students Trained');
          }
          
          // Property: Header should always be present regardless of options
          expect(container.textContent).toContain('Trusted by Industry Leaders');
          
          return true;
        }
      ),
      { numRuns: 30 }
    );
  });

  test('Property 15c: Trust indicators should maintain accessibility standards', () => {
    const metrics: SuccessMetrics = {
      totalStudents: 50000,
      averageSalaryIncrease: '65%',
      jobPlacementRate: 92,
      courseCompletionRate: 87,
      averageRating: 4.7,
      industryPartners: ['Google', 'Microsoft', 'Amazon', 'Netflix'],
    };
    
    const { container } = render(
      <TrustIndicators metrics={metrics} />
    );
    
    // Property: All images should have meaningful alt text
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      const altText = img.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText).not.toBe('');
      expect(altText).not.toBe('image');
    });
    
    // Property: Headings should follow proper hierarchy
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);
    
    // Property: Statistics should have proper semantic structure
    const statElements = container.querySelectorAll('[class*="text-3xl"]');
    expect(statElements.length).toBeGreaterThanOrEqual(4);
    
    // Property: Interactive elements should be properly labeled
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      expect(button.textContent?.trim()).not.toBe('');
    });
  });

  test('Property 15d: Empty or minimal data should be handled gracefully', () => {
    const minimalMetrics: SuccessMetrics = {
      totalStudents: 0,
      averageSalaryIncrease: '0%',
      jobPlacementRate: 0,
      courseCompletionRate: 0,
      averageRating: 0,
      industryPartners: [],
    };
    
    const { container } = render(
      <TrustIndicators metrics={minimalMetrics} />
    );
    
    // Property: Component should render without errors even with minimal data
    expect(container).toBeTruthy();
    expect(container.textContent).toContain('Trusted by Industry Leaders');
    
    // Property: Zero values should be displayed properly
    expect(container.textContent).toContain('0');
    
    const { container: jobStatsContainer } = render(
      <JobPlacementStats metrics={minimalMetrics} />
    );
    
    // Property: Job placement stats should handle zero values gracefully
    expect(jobStatsContainer).toBeTruthy();
    expect(jobStatsContainer.textContent).toContain('Career Success Metrics');
  });
});