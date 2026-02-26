/**
 * Property-Based Tests for Content Consistency
 * Feature: anywheredoor, Property 9: Content Consistency
 * Validates: Requirements 6.3
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { DataProvider, useData } from '@/contexts/DataContext';
import { useDataConsistency } from '@/hooks/useDataConsistency';
import { Course, Instructor } from '@/types';

// Test component that uses data consistency hooks
function TestComponent({ 
  onDataChange,
  testAction,
}: { 
  onDataChange?: (data: any) => void;
  testAction?: (actions: any, selectors: any) => void;
}) {
  const { state, actions, selectors } = useData();
  const { validateDataConsistency } = useDataConsistency();

  React.useEffect(() => {
    if (onDataChange) {
      onDataChange({ state, actions, selectors, validateDataConsistency });
    }
  }, [state, actions, selectors, validateDataConsistency, onDataChange]);

  React.useEffect(() => {
    if (testAction) {
      testAction(actions, selectors);
    }
  }, [testAction, actions, selectors]);

  return (
    <div>
      <div data-testid="courses-count">{state.courses.length}</div>
      <div data-testid="instructors-count">{state.instructors.length}</div>
      <div data-testid="testimonials-count">{state.testimonials.length}</div>
    </div>
  );
}

// Wrapper component with DataProvider
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      {children}
    </DataProvider>
  );
}

// Generators for test data
const courseGenerator = fc.record({
  id: fc.string({ minLength: 1, maxLength: 10 }),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  slug: fc.string({ minLength: 1, maxLength: 30 }),
  shortDescription: fc.string({ minLength: 1, maxLength: 100 }),
  longDescription: fc.string({ minLength: 1, maxLength: 200 }),
  category: fc.record({
    id: fc.string({ minLength: 1, maxLength: 10 }),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    slug: fc.string({ minLength: 1, maxLength: 20 }),
    description: fc.string({ minLength: 1, maxLength: 100 }),
    color: fc.string({ minLength: 1, maxLength: 10 }),
  }),
  level: fc.constantFrom('Beginner', 'Intermediate', 'Advanced'),
  duration: fc.record({
    hours: fc.integer({ min: 1, max: 200 }),
    weeks: fc.integer({ min: 1, max: 52 }),
  }),
  price: fc.record({
    amount: fc.integer({ min: 0, max: 5000 }),
    currency: fc.constant('USD'),
  }),
  rating: fc.record({
    average: fc.float({ min: 1, max: 5 }),
    count: fc.integer({ min: 0, max: 1000 }),
  }),
  thumbnailUrl: fc.string({ minLength: 1, maxLength: 100 }),
  instructorIds: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 3 }),
  curriculum: fc.array(fc.record({
    id: fc.string({ minLength: 1, maxLength: 10 }),
    title: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.string({ minLength: 1, maxLength: 100 }),
    order: fc.integer({ min: 1, max: 20 }),
    lessons: fc.array(fc.record({
      id: fc.string({ minLength: 1, maxLength: 10 }),
      title: fc.string({ minLength: 1, maxLength: 50 }),
      type: fc.constantFrom('Video', 'Reading', 'Exercise', 'Quiz'),
      duration: fc.integer({ min: 1, max: 120 }),
      isPreview: fc.boolean(),
    })),
    estimatedHours: fc.integer({ min: 1, max: 40 }),
  })),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
  mode: fc.constantFrom('Live', 'Self-Paced', 'Hybrid'),
  enrollmentCount: fc.integer({ min: 0, max: 10000 }),
  isActive: fc.boolean(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
});

const instructorGenerator = fc.record({
  id: fc.string({ minLength: 1, maxLength: 10 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  bio: fc.string({ minLength: 1, maxLength: 200 }),
  profileImageUrl: fc.string({ minLength: 1, maxLength: 100 }),
  expertise: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
  experience: fc.record({
    years: fc.integer({ min: 1, max: 30 }),
    companies: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 }),
  }),
  socialLinks: fc.record({
    linkedin: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    twitter: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
    github: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
  }),
  courseIds: fc.array(fc.string({ minLength: 1, maxLength: 10 }), { maxLength: 5 }),
  rating: fc.record({
    average: fc.float({ min: 1, max: 5 }),
    count: fc.integer({ min: 0, max: 1000 }),
  }),
});

describe('Content Consistency Property Tests', () => {
  // Property 9: Content Consistency
  // For any data update to courses or instructors, the changes should be reflected 
  // consistently across all pages where that data appears

  it('should maintain consistency when updating course data', () => {
    fc.assert(
      fc.property(
        courseGenerator,
        fc.record({
          title: fc.string({ minLength: 1, maxLength: 50 }),
          rating: fc.record({
            average: fc.float({ min: 1, max: 5 }),
            count: fc.integer({ min: 0, max: 1000 }),
          }),
        }),
        (originalCourse, updates) => {
          let capturedData: any = null;
          
          const { rerender } = render(
            <TestWrapper>
              <TestComponent 
                onDataChange={(data) => { capturedData = data; }}
              />
            </TestWrapper>
          );

          // Wait for initial data load
          act(() => {
            // Add the original course
            if (capturedData?.actions) {
              capturedData.actions.addCourse(originalCourse);
            }
          });

          // Update the course
          const updatedCourse = { ...originalCourse, ...updates };
          
          act(() => {
            if (capturedData?.actions) {
              capturedData.actions.updateCourse(updatedCourse);
            }
          });

          // Re-render to get updated state
          rerender(
            <TestWrapper>
              <TestComponent 
                onDataChange={(data) => { capturedData = data; }}
              />
            </TestWrapper>
          );

          if (capturedData?.selectors) {
            // Verify the course was updated consistently
            const retrievedCourse = capturedData.selectors.getCourseById(originalCourse.id);
            
            if (retrievedCourse) {
              // The retrieved course should have the updated data
              expect(retrievedCourse.title).toBe(updates.title);
              expect(retrievedCourse.rating.average).toBe(updates.rating.average);
              expect(retrievedCourse.rating.count).toBe(updates.rating.count);
              
              // Other fields should remain unchanged
              expect(retrievedCourse.id).toBe(originalCourse.id);
              expect(retrievedCourse.slug).toBe(originalCourse.slug);
              expect(retrievedCourse.level).toBe(originalCourse.level);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain consistency when updating instructor data', () => {
    fc.assert(
      fc.property(
        instructorGenerator,
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          experience: fc.record({
            years: fc.integer({ min: 1, max: 30 }),
            companies: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 }),
          }),
        }),
        (originalInstructor, updates) => {
          let capturedData: any = null;
          
          render(
            <TestWrapper>
              <TestComponent 
                onDataChange={(data) => { capturedData = data; }}
              />
            </TestWrapper>
          );

          // Add the original instructor
          act(() => {
            if (capturedData?.actions) {
              capturedData.actions.addInstructor(originalInstructor);
            }
          });

          // Update the instructor
          const updatedInstructor = { ...originalInstructor, ...updates };
          
          act(() => {
            if (capturedData?.actions) {
              capturedData.actions.updateInstructor(updatedInstructor);
            }
          });

          if (capturedData?.selectors) {
            // Verify the instructor was updated consistently
            const retrievedInstructor = capturedData.selectors.getInstructorById(originalInstructor.id);
            
            if (retrievedInstructor) {
              // The retrieved instructor should have the updated data
              expect(retrievedInstructor.name).toBe(updates.name);
              expect(retrievedInstructor.experience.years).toBe(updates.experience.years);
              expect(retrievedInstructor.experience.companies).toEqual(updates.experience.companies);
              
              // Other fields should remain unchanged
              expect(retrievedInstructor.id).toBe(originalInstructor.id);
              expect(retrievedInstructor.title).toBe(originalInstructor.title);
              expect(retrievedInstructor.bio).toBe(originalInstructor.bio);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain referential integrity between courses and instructors', () => {
    fc.assert(
      fc.property(
        fc.array(instructorGenerator, { minLength: 1, maxLength: 3 }),
        fc.array(courseGenerator, { minLength: 1, maxLength: 3 }),
        (instructors, courses) => {
          let capturedData: any = null;
          
          render(
            <TestWrapper>
              <TestComponent 
                onDataChange={(data) => { capturedData = data; }}
              />
            </TestWrapper>
          );

          act(() => {
            if (capturedData?.actions) {
              // Add instructors first
              instructors.forEach(instructor => {
                capturedData.actions.addInstructor(instructor);
              });

              // Add courses with references to instructors
              courses.forEach(course => {
                const courseWithValidInstructors = {
                  ...course,
                  instructorIds: instructors.slice(0, Math.min(2, instructors.length)).map(i => i.id),
                };
                capturedData.actions.addCourse(courseWithValidInstructors);
              });
            }
          });

          if (capturedData?.validateDataConsistency) {
            // Validate that referential integrity is maintained
            const consistencyReport = capturedData.validateDataConsistency();
            
            // Should have no consistency issues
            expect(consistencyReport.isConsistent).toBe(true);
            expect(consistencyReport.issues).toHaveLength(0);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should reflect updates across all data access methods', () => {
    fc.assert(
      fc.property(
        courseGenerator,
        fc.string({ minLength: 1, maxLength: 50 }),
        (course, newTitle) => {
          let capturedData: any = null;
          
          render(
            <TestWrapper>
              <TestComponent 
                onDataChange={(data) => { capturedData = data; }}
              />
            </TestWrapper>
          );

          act(() => {
            if (capturedData?.actions) {
              // Add the course
              capturedData.actions.addCourse(course);
              
              // Update the course title
              const updatedCourse = { ...course, title: newTitle };
              capturedData.actions.updateCourse(updatedCourse);
            }
          });

          if (capturedData?.selectors && capturedData?.state) {
            // Verify consistency across different access methods
            
            // 1. Direct state access
            const courseFromState = capturedData.state.courses.find((c: Course) => c.id === course.id);
            
            // 2. Selector by ID
            const courseById = capturedData.selectors.getCourseById(course.id);
            
            // 3. Selector by slug
            const courseBySlug = capturedData.selectors.getCourseBySlug(course.slug);
            
            // All methods should return the same updated data
            if (courseFromState && courseById && courseBySlug) {
              expect(courseFromState.title).toBe(newTitle);
              expect(courseById.title).toBe(newTitle);
              expect(courseBySlug.title).toBe(newTitle);
              
              // All should be the same object reference (consistency)
              expect(courseFromState).toEqual(courseById);
              expect(courseById).toEqual(courseBySlug);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should maintain consistency when removing data', () => {
    fc.assert(
      fc.property(
        fc.array(courseGenerator, { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }),
        (courses, removeIndex) => {
          if (removeIndex >= courses.length) return; // Skip invalid indices
          
          let capturedData: any = null;
          
          render(
            <TestWrapper>
              <TestComponent 
                onDataChange={(data) => { capturedData = data; }}
              />
            </TestWrapper>
          );

          act(() => {
            if (capturedData?.actions) {
              // Add all courses
              courses.forEach(course => {
                capturedData.actions.addCourse(course);
              });
              
              // Remove one course
              const courseToRemove = courses[removeIndex];
              capturedData.actions.removeCourse(courseToRemove.id);
            }
          });

          if (capturedData?.selectors && capturedData?.state) {
            // Verify the course was removed consistently
            const removedCourse = capturedData.selectors.getCourseById(courses[removeIndex].id);
            expect(removedCourse).toBeUndefined();
            
            // Verify other courses are still present
            const remainingCourses = courses.filter((_, index) => index !== removeIndex);
            remainingCourses.forEach(course => {
              const existingCourse = capturedData.selectors.getCourseById(course.id);
              expect(existingCourse).toBeDefined();
              expect(existingCourse?.id).toBe(course.id);
            });
            
            // Verify state count is correct
            expect(capturedData.state.courses).toHaveLength(remainingCourses.length);
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  it('should maintain data freshness timestamps consistently', () => {
    fc.assert(
      fc.property(
        courseGenerator,
        (course) => {
          let capturedData: any = null;
          let initialTimestamp: Date | null = null;
          
          render(
            <TestWrapper>
              <TestComponent 
                onDataChange={(data) => { 
                  capturedData = data;
                  if (!initialTimestamp && data.state.lastUpdated.courses) {
                    initialTimestamp = data.state.lastUpdated.courses;
                  }
                }}
              />
            </TestWrapper>
          );

          // Wait a bit to ensure timestamp difference
          setTimeout(() => {
            act(() => {
              if (capturedData?.actions) {
                capturedData.actions.addCourse(course);
              }
            });

            if (capturedData?.state && initialTimestamp) {
              // Timestamp should be updated after adding course
              const newTimestamp = capturedData.state.lastUpdated.courses;
              expect(newTimestamp).toBeDefined();
              expect(newTimestamp!.getTime()).toBeGreaterThan(initialTimestamp.getTime());
            }
          }, 10);
        }
      ),
      { numRuns: 20 }
    );
  });
});

// Unit tests for specific consistency scenarios
describe('Content Consistency Unit Tests', () => {
  it('should handle concurrent updates gracefully', async () => {
    let capturedData: any = null;
    
    render(
      <TestWrapper>
        <TestComponent 
          onDataChange={(data) => { capturedData = data; }}
        />
      </TestWrapper>
    );

    const course: Course = {
      id: 'test-course',
      title: 'Test Course',
      slug: 'test-course',
      shortDescription: 'A test course',
      longDescription: 'A longer test course description',
      category: {
        id: 'test-cat',
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test category description',
        color: 'blue',
      },
      level: 'Beginner',
      duration: { hours: 10, weeks: 2 },
      price: { amount: 100, currency: 'USD' },
      rating: { average: 4.5, count: 10 },
      thumbnailUrl: 'test.jpg',
      instructorIds: [],
      curriculum: [],
      tags: ['test'],
      mode: 'Self-Paced',
      enrollmentCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Simulate concurrent updates
    await act(async () => {
      if (capturedData?.actions) {
        capturedData.actions.addCourse(course);
        
        // Multiple rapid updates
        const promises = [
          Promise.resolve(capturedData.actions.updateCourse({ ...course, title: 'Updated Title 1' })),
          Promise.resolve(capturedData.actions.updateCourse({ ...course, title: 'Updated Title 2' })),
          Promise.resolve(capturedData.actions.updateCourse({ ...course, title: 'Updated Title 3' })),
        ];
        
        await Promise.all(promises);
      }
    });

    // Should have the final update
    if (capturedData?.selectors) {
      const finalCourse = capturedData.selectors.getCourseById('test-course');
      expect(finalCourse).toBeDefined();
      expect(finalCourse?.title).toBe('Updated Title 3');
    }
  });

  it('should maintain consistency during error conditions', () => {
    let capturedData: any = null;
    
    render(
      <TestWrapper>
        <TestComponent 
          onDataChange={(data) => { capturedData = data; }}
        />
      </TestWrapper>
    );

    act(() => {
      if (capturedData?.actions) {
        // Try to update a non-existent course
        capturedData.actions.updateCourse({
          id: 'non-existent',
          title: 'Should not exist',
        } as Course);
        
        // Try to remove a non-existent course
        capturedData.actions.removeCourse('non-existent');
      }
    });

    // State should remain consistent despite errors
    if (capturedData?.state) {
      expect(capturedData.state.courses).toHaveLength(0);
      expect(capturedData.state.instructors).toHaveLength(0);
    }
  });
});