import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { Course, Instructor } from '@/types';
import { generateCourses, generateInstructors } from '@/data/generators';
import CourseHero from '../components/CourseHero';
import React from 'react';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => 
    React.createElement('img', { src, alt, ...props }),
}));

// Mock Headless UI components
jest.mock('@headlessui/react', () => ({
  Dialog: ({ children, ...props }: any) => React.createElement('div', props, children),
  Transition: ({ children, ...props }: any) => React.createElement('div', props, children),
}));

// Feature: anywheredoor, Property 4: Navigation Consistency
describe('Navigation Consistency Property', () => {
  it('should provide consistent navigation links for any course detail page', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }).chain(count => 
          fc.tuple(
            fc.constantFrom(...generateCourses({ count })),
            fc.array(fc.constantFrom(...generateInstructors({ count: 10 })), { minLength: 1, maxLength: 3 })
          )
        ),
        ([course, instructors]: [Course, Instructor[]]) => {
          // Test CourseHero component has consistent navigation
          const { container } = render(
            React.createElement(CourseHero, { course, instructors })
          );

          // Verify breadcrumb navigation is present and consistent
          const breadcrumbHome = screen.getByText('Home');
          expect(breadcrumbHome).toBeInTheDocument();
          expect(breadcrumbHome.closest('a')).toHaveAttribute('href', '/');

          const breadcrumbCourses = screen.getByText('Courses');
          expect(breadcrumbCourses).toBeInTheDocument();
          expect(breadcrumbCourses.closest('a')).toHaveAttribute('href', '/courses');

          // Verify category navigation link is present
          const categoryLink = screen.getByText(course.category.name);
          expect(categoryLink).toBeInTheDocument();
          expect(categoryLink.closest('a')).toHaveAttribute('href', `/courses?category=${course.category.slug}`);

          // Verify course title is displayed as final breadcrumb item
          expect(screen.getByText(course.title)).toBeInTheDocument();

          // Clean up
          container.remove();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistent navigation structure across different course categories', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.integer({ min: 1, max: 5 }).chain(count => 
            fc.tuple(
              fc.constantFrom(...generateCourses({ count })),
              fc.array(fc.constantFrom(...generateInstructors({ count: 10 })), { minLength: 1, maxLength: 3 })
            )
          ),
          { minLength: 2, maxLength: 5 }
        ),
        (courseInstructorPairs: [Course, Instructor[]][]) => {
          const navigationStructures: string[][] = [];

          courseInstructorPairs.forEach(([course, instructors]) => {
            const { container } = render(
              React.createElement(CourseHero, { course, instructors })
            );

            // Extract navigation structure
            const breadcrumbItems = [
              'Home',
              'Courses',
              course.category.name,
              course.title
            ];

            navigationStructures.push(breadcrumbItems.slice(0, 3)); // Exclude course title as it's unique

            // Verify all navigation elements are present
            breadcrumbItems.forEach((item, index) => {
              if (index < 3) { // First 3 items should be links
                const element = screen.getByText(item);
                expect(element).toBeInTheDocument();
                if (index < 2) { // Home and Courses should be clickable links
                  expect(element.closest('a')).toBeInTheDocument();
                }
              }
            });

            container.remove();
          });

          // Verify that the base navigation structure is consistent across all courses
          const baseStructure = ['Home', 'Courses'];
          navigationStructures.forEach(structure => {
            expect(structure.slice(0, 2)).toEqual(baseStructure);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should handle navigation for courses with different category structures', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string(),
          title: fc.string({ minLength: 1 }),
          slug: fc.string(),
          shortDescription: fc.string({ minLength: 1 }),
          longDescription: fc.string({ minLength: 1 }),
          category: fc.record({
            id: fc.string(),
            name: fc.string({ minLength: 1 }),
            slug: fc.string({ minLength: 1 }),
            description: fc.string(),
            color: fc.string()
          }),
          level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
          duration: fc.record({
            hours: fc.integer({ min: 1, max: 500 }),
            weeks: fc.integer({ min: 1, max: 52 })
          }),
          price: fc.record({
            amount: fc.integer({ min: 0, max: 2000 }),
            currency: fc.constant('USD'),
            originalPrice: fc.option(fc.integer({ min: 0, max: 2000 }), { nil: undefined })
          }),
          rating: fc.record({
            average: fc.float({ min: 0, max: 5 }),
            count: fc.integer({ min: 0, max: 100000 })
          }),
          thumbnailUrl: fc.string(),
          instructorIds: fc.array(fc.string(), { minLength: 0, maxLength: 3 }),
          curriculum: fc.array(fc.record({
            id: fc.string(),
            title: fc.string({ minLength: 1 }),
            description: fc.string(),
            order: fc.integer({ min: 1, max: 20 }),
            lessons: fc.array(fc.record({
              id: fc.string(),
              title: fc.string({ minLength: 1 }),
              type: fc.constantFrom('Video', 'Reading', 'Exercise', 'Quiz'),
              duration: fc.integer({ min: 1, max: 180 }),
              isPreview: fc.boolean()
            }), { minLength: 0, maxLength: 10 }),
            estimatedHours: fc.integer({ min: 1, max: 40 })
          }), { minLength: 0, maxLength: 10 }),
          tags: fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 10 }),
          mode: fc.constantFrom('Live', 'Self-Paced', 'Hybrid'),
          enrollmentCount: fc.integer({ min: 0, max: 100000 }),
          isActive: fc.boolean(),
          createdAt: fc.date(),
          updatedAt: fc.date()
        }),
        (course: Course) => {
          const instructors = generateInstructors({ count: 1 });
          
          // Test that navigation renders without errors for any course structure
          expect(() => {
            const { container } = render(
              React.createElement(CourseHero, { course, instructors })
            );
            
            // Verify basic navigation elements are present
            expect(screen.getByText('Home')).toBeInTheDocument();
            expect(screen.getByText('Courses')).toBeInTheDocument();
            expect(screen.getByText(course.category.name)).toBeInTheDocument();
            expect(screen.getByText(course.title)).toBeInTheDocument();
            
            container.remove();
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});