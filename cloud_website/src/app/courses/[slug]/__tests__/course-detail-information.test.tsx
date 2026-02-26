import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { Course, Instructor, StudentTestimonial } from '@/types';
import { generateCourses, generateInstructors, generateTestimonials } from '@/data/generators';
import CourseHero from '../components/CourseHero';
import CourseContent from '../components/CourseContent';
import CourseOverview from '../components/CourseOverview';
import CourseCurriculum from '../components/CourseCurriculum';
import CourseInstructors from '../components/CourseInstructors';
import CourseReviews from '../components/CourseReviews';
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

// Feature: anywheredoor, Property 5: Course Detail Information Display
describe('Course Detail Information Display Property', () => {
  it('should display all essential course information for any course detail page', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }).chain(count => 
          fc.tuple(
            fc.constantFrom(...generateCourses({ count })),
            fc.array(fc.constantFrom(...generateInstructors({ count: 10 })), { minLength: 1, maxLength: 3 }),
            fc.array(fc.constantFrom(...generateTestimonials({ count: 20 }, generateCourses({ count: 50 }))), { minLength: 0, maxLength: 5 })
          )
        ),
        ([course, instructors, testimonials]: [Course, Instructor[], StudentTestimonial[]]) => {
          // Test CourseHero component displays essential information
          const { container: heroContainer } = render(
            React.createElement(CourseHero, { course, instructors })
          );

          // Verify course title is displayed
          expect(screen.getByText(course.title)).toBeInTheDocument();
          
          // Verify course description is displayed
          expect(screen.getByText(course.shortDescription)).toBeInTheDocument();
          
          // Verify price is displayed
          expect(screen.getByText(`$${course.price.amount}`)).toBeInTheDocument();
          
          // Verify duration is displayed
          expect(screen.getByText(`${course.duration.hours} hours (${course.duration.weeks} weeks)`)).toBeInTheDocument();
          
          // Verify rating is displayed
          expect(screen.getByText(course.rating.average.toString())).toBeInTheDocument();
          
          // Verify level is displayed
          expect(screen.getByText(course.level)).toBeInTheDocument();
          
          // Verify mode is displayed
          expect(screen.getByText(course.mode)).toBeInTheDocument();
          
          // Verify category is displayed
          expect(screen.getByText(course.category.name)).toBeInTheDocument();

          // Clean up
          heroContainer.remove();

          // Test CourseOverview component displays detailed information
          const { container: overviewContainer } = render(
            React.createElement(CourseOverview, { course })
          );

          // Verify long description is displayed
          expect(screen.getByText(course.longDescription)).toBeInTheDocument();
          
          // Verify course tags/skills are displayed
          course.tags.forEach(tag => {
            expect(screen.getByText(`Master ${tag} development`)).toBeInTheDocument();
          });

          // Clean up
          overviewContainer.remove();

          // Test CourseCurriculum component displays curriculum information
          if (course.curriculum.length > 0) {
            const { container: curriculumContainer } = render(
              React.createElement(CourseCurriculum, { course })
            );

            // Verify curriculum modules are displayed
            course.curriculum.forEach(module => {
              expect(screen.getByText(`Module ${module.order}: ${module.title}`)).toBeInTheDocument();
              expect(screen.getByText(module.description)).toBeInTheDocument();
            });

            // Clean up
            curriculumContainer.remove();
          }

          // Test CourseInstructors component displays instructor information
          if (instructors.length > 0) {
            const { container: instructorsContainer } = render(
              React.createElement(CourseInstructors, { instructors })
            );

            // Verify instructor information is displayed
            instructors.forEach(instructor => {
              expect(screen.getByText(instructor.name)).toBeInTheDocument();
              expect(screen.getByText(instructor.title)).toBeInTheDocument();
              expect(screen.getByText(instructor.bio)).toBeInTheDocument();
              expect(screen.getByText(instructor.rating.average.toString())).toBeInTheDocument();
            });

            // Clean up
            instructorsContainer.remove();
          }

          // Test CourseReviews component displays review information
          const { container: reviewsContainer } = render(
            React.createElement(CourseReviews, { course, testimonials })
          );

          // Verify course rating information is displayed
          expect(screen.getByText(course.rating.average.toString())).toBeInTheDocument();
          expect(screen.getByText(`${course.rating.count.toLocaleString()} reviews`)).toBeInTheDocument();

          // Verify testimonials are displayed if they exist
          testimonials.forEach(testimonial => {
            expect(screen.getByText(testimonial.studentName)).toBeInTheDocument();
            expect(screen.getByText(`"${testimonial.testimonialText}"`)).toBeInTheDocument();
            expect(screen.getByText(testimonial.careerOutcome.currentRole)).toBeInTheDocument();
            expect(screen.getByText(testimonial.careerOutcome.companyName)).toBeInTheDocument();
          });

          // Clean up
          reviewsContainer.remove();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle courses with missing or incomplete data gracefully', () => {
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
            slug: fc.string(),
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
          // Test that components handle the course data without crashing
          expect(() => {
            const { container } = render(React.createElement(CourseOverview, { course }));
            container.remove();
          }).not.toThrow();

          expect(() => {
            const { container } = render(React.createElement(CourseCurriculum, { course }));
            container.remove();
          }).not.toThrow();

          expect(() => {
            const { container } = render(React.createElement(CourseReviews, { course, testimonials: [] }));
            container.remove();
          }).not.toThrow();
        }
      ),
      { numRuns: 100 }
    );
  });
});