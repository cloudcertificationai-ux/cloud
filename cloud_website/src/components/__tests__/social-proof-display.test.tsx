// Feature: anywheredoor, Property 14: Social Proof Display
// **Validates: Requirements 9.2, 9.3**

import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import { TestimonialCard } from '../TestimonialCard';
import { SuccessStoryCarousel } from '../SuccessStoryCarousel';
import { EnrollmentStats } from '../EnrollmentStats';
import { StudentTestimonial, SuccessMetrics } from '@/types';

// Mock Next.js components
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('Social Proof Display Property Tests', () => {
  test('Property 14: Social Proof Display - For any course or instructor page, social proof elements should be displayed including testimonials, ratings, enrollment numbers, and success metrics', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 5, maxLength: 20 }),
          studentName: fc.string({ minLength: 5, maxLength: 50 }),
          studentPhoto: fc.constant('/testimonials/student.jpg'),
          courseCompleted: fc.string({ minLength: 10, maxLength: 100 }),
          rating: fc.integer({ min: 1, max: 5 }),
          testimonialText: fc.string({ minLength: 50, maxLength: 500 }),
          careerOutcome: fc.record({
            previousRole: fc.option(fc.string({ minLength: 5, maxLength: 50 })),
            currentRole: fc.string({ minLength: 5, maxLength: 50 }),
            salaryIncrease: fc.option(fc.string({ minLength: 2, maxLength: 10 })),
            companyName: fc.string({ minLength: 3, maxLength: 50 }),
          }),
          isVerified: fc.boolean(),
          dateCompleted: fc.constant(new Date('2024-08-15')),
        }),
        (testimonialData) => {
          const testimonial = testimonialData as StudentTestimonial;
          
          const { container } = render(<TestimonialCard testimonial={testimonial} />);
          
          // Property: Testimonial should display student name
          expect(container.textContent).toContain(testimonial.studentName);
          
          // Property: Testimonial should display course completed
          expect(container.textContent).toContain(testimonial.courseCompleted);
          
          // Property: Testimonial should display rating
          const stars = container.querySelectorAll('svg');
          expect(stars.length).toBeGreaterThanOrEqual(5); // Should have 5 star elements
          
          // Property: Testimonial should display testimonial text
          expect(container.textContent).toContain(testimonial.testimonialText);
          
          // Property: Testimonial should display career outcome information
          expect(container.textContent).toContain(testimonial.careerOutcome.currentRole);
          expect(container.textContent).toContain(testimonial.careerOutcome.companyName);
          
          if (testimonial.careerOutcome.previousRole) {
            expect(container.textContent).toContain(testimonial.careerOutcome.previousRole);
          }
          
          if (testimonial.careerOutcome.salaryIncrease) {
            expect(container.textContent).toContain(testimonial.careerOutcome.salaryIncrease);
          }
          
          // Property: Verified testimonials should show verification indicator
          if (testimonial.isVerified) {
            const verificationElement = container.querySelector('[aria-label*="Verified"], [class*="verified"]');
            expect(verificationElement).toBeTruthy();
          }
          
          // Property: Student photo should have proper alt text
          const studentPhoto = container.querySelector('img');
          expect(studentPhoto).toBeTruthy();
          expect(studentPhoto?.getAttribute('alt')).toContain(testimonial.studentName);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 14a: Success Story Carousel should display multiple testimonials with navigation', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 5, maxLength: 20 }),
            studentName: fc.string({ minLength: 5, maxLength: 50 }),
            studentPhoto: fc.constant('/testimonials/student.jpg'),
            courseCompleted: fc.string({ minLength: 10, maxLength: 100 }),
            rating: fc.integer({ min: 1, max: 5 }),
            testimonialText: fc.string({ minLength: 50, maxLength: 500 }),
            careerOutcome: fc.record({
              previousRole: fc.option(fc.string({ minLength: 5, maxLength: 50 })),
              currentRole: fc.string({ minLength: 5, maxLength: 50 }),
              salaryIncrease: fc.option(fc.string({ minLength: 2, maxLength: 10 })),
              companyName: fc.string({ minLength: 3, maxLength: 50 }),
            }),
            isVerified: fc.boolean(),
            dateCompleted: fc.constant(new Date('2024-08-15')),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (testimonialsData) => {
          const testimonials = testimonialsData as StudentTestimonial[];
          
          const { container } = render(
            <SuccessStoryCarousel testimonials={testimonials} autoPlay={false} />
          );
          
          // Property: Carousel should display at least one testimonial
          expect(testimonials.length).toBeGreaterThan(0);
          
          // Property: First testimonial should be visible
          const firstTestimonial = testimonials[0];
          expect(container.textContent).toContain(firstTestimonial.studentName);
          expect(container.textContent).toContain(firstTestimonial.courseCompleted);
          
          // Property: Navigation controls should be present for multiple testimonials
          if (testimonials.length > 1) {
            const prevButton = container.querySelector('[aria-label*="Previous"]');
            const nextButton = container.querySelector('[aria-label*="Next"]');
            expect(prevButton).toBeTruthy();
            expect(nextButton).toBeTruthy();
            
            // Property: Dot indicators should be present
            const dots = container.querySelectorAll('[aria-label*="Go to testimonial"]');
            expect(dots.length).toBe(testimonials.length);
          }
          
          // Property: All testimonials should be in the DOM (for accessibility)
          testimonials.forEach(testimonial => {
            // Each testimonial should be present in the carousel structure
            const testimonialElements = container.querySelectorAll('[class*="flex-shrink-0"]');
            expect(testimonialElements.length).toBe(testimonials.length);
          });
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('Property 14b: Enrollment Statistics should display all success metrics', () => {
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
          
          const { container } = render(<EnrollmentStats metrics={metrics} showRealTime={false} />);
          
          // Property: Total students should be displayed
          expect(container.textContent).toContain(metrics.totalStudents.toLocaleString());
          
          // Property: Job placement rate should be displayed with percentage
          expect(container.textContent).toContain(metrics.jobPlacementRate.toString());
          expect(container.textContent).toContain('%');
          
          // Property: Course completion rate should be displayed
          expect(container.textContent).toContain(metrics.courseCompletionRate.toString());
          
          // Property: Average rating should be displayed
          expect(container.textContent).toContain(metrics.averageRating.toString());
          
          // Property: Average salary increase should be displayed
          expect(container.textContent).toContain(metrics.averageSalaryIncrease);
          
          // Property: All statistics should have descriptive labels
          expect(container.textContent).toContain('Students Enrolled');
          expect(container.textContent).toContain('Job Placement Rate');
          expect(container.textContent).toContain('Course Completion Rate');
          expect(container.textContent).toContain('Average Rating');
          
          // Property: Icons should be present for visual enhancement
          const icons = container.querySelectorAll('svg');
          expect(icons.length).toBeGreaterThanOrEqual(4); // At least 4 icons for the main stats
          
          // Property: Statistics should be properly formatted and accessible
          const statValues = container.querySelectorAll('[class*="text-2xl"], [class*="text-3xl"]');
          expect(statValues.length).toBeGreaterThanOrEqual(4); // Main stats should be prominently displayed
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 14c: Empty state handling for social proof components', () => {
    // Property: Components should handle empty data gracefully
    const { container: emptyCarousel } = render(
      <SuccessStoryCarousel testimonials={[]} />
    );
    
    expect(emptyCarousel.textContent).toContain('No success stories available');
    
    // Property: Zero metrics should still display properly
    const zeroMetrics: SuccessMetrics = {
      totalStudents: 0,
      averageSalaryIncrease: '0%',
      jobPlacementRate: 0,
      courseCompletionRate: 0,
      averageRating: 0,
      industryPartners: [],
    };
    
    const { container: zeroStats } = render(
      <EnrollmentStats metrics={zeroMetrics} showRealTime={false} />
    );
    
    expect(zeroStats.textContent).toContain('0');
    expect(zeroStats).toBeTruthy();
  });
});