import * as fc from 'fast-check';
import {
  validateCourse,
  validateInstructor,
  validateCourseCategory,
  validateCurriculumModule,
  validateLesson,
  validateStudentTestimonial,
} from '../validators';
import {
  generateCourse,
  generateInstructor,
  generateCourseCategory,
  generateCurriculumModule,
  generateLesson,
  generateTestimonial,
} from '../generators';
import {
  Course,
  Instructor,
  CourseCategory,
  CurriculumModule,
  Lesson,
  StudentTestimonial,
} from '@/types';

// Feature: anywheredoor, Property 8: Data Structure Validation
// **Validates: Requirements 6.1, 6.2**

describe('Data Structure Validation Property Tests', () => {
  describe('Course Data Structure Validation', () => {
    test('Property 8a: Generated courses should always pass validation', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (count) => {
          // Generate random courses using our generator
          const courses: Course[] = [];
          for (let i = 0; i < count; i++) {
            courses.push(generateCourse());
          }

          // All generated courses should pass validation
          for (const course of courses) {
            const validation = validateCourse(course);
            if (!validation.isValid) {
              console.error('Course validation failed:', validation.errors);
              console.error('Course data:', JSON.stringify(course, null, 2));
            }
            expect(validation.isValid).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    test('Property 8b: Courses with invalid required fields should fail validation', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.oneof(fc.constant(''), fc.constant(null), fc.constant(undefined)),
            title: fc.oneof(fc.constant(''), fc.constant('   '), fc.constant(null)),
            level: fc.oneof(fc.constant('Invalid'), fc.constant(''), fc.constant(null)),
          }),
          (invalidFields) => {
            const validCourse = generateCourse();
            const invalidCourse = { ...validCourse, ...invalidFields };

            const validation = validateCourse(invalidCourse as any);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Instructor Data Structure Validation', () => {
    test('Property 8c: Generated instructors should always pass validation', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (count) => {
          // Generate random instructors using our generator
          const instructors: Instructor[] = [];
          for (let i = 0; i < count; i++) {
            instructors.push(generateInstructor());
          }

          // All generated instructors should pass validation
          for (const instructor of instructors) {
            const validation = validateInstructor(instructor);
            if (!validation.isValid) {
              console.error('Instructor validation failed:', validation.errors);
              console.error('Instructor data:', JSON.stringify(instructor, null, 2));
            }
            expect(validation.isValid).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    test('Property 8d: Instructors with invalid experience years should fail validation', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(-1), 
            fc.constant(-10), 
            fc.integer({ min: -100, max: -1 }), // Use integer instead of float to avoid NaN
            fc.constant(NaN)
          ),
          (invalidYears) => {
            const validInstructor = generateInstructor();
            const invalidInstructor = {
              ...validInstructor,
              experience: {
                ...validInstructor.experience,
                years: invalidYears,
              },
            };

            const validation = validateInstructor(invalidInstructor);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.some(error => error.includes('experience years'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Course Category Data Structure Validation', () => {
    test('Property 8e: Generated course categories should always pass validation', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (count) => {
          // Generate random course categories using our generator
          const categories: CourseCategory[] = [];
          for (let i = 0; i < count; i++) {
            categories.push(generateCourseCategory());
          }

          // All generated categories should pass validation
          for (const category of categories) {
            const validation = validateCourseCategory(category);
            if (!validation.isValid) {
              console.error('Category validation failed:', validation.errors);
              console.error('Category data:', JSON.stringify(category, null, 2));
            }
            expect(validation.isValid).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    test('Property 8f: Categories with invalid color formats should fail validation', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('invalid-color'),
            fc.constant('#GGG'),
            fc.constant('rgb(255,255,255)'),
            fc.constant('#12345'),
            fc.constant('#1234567')
          ),
          (invalidColor) => {
            const validCategory = generateCourseCategory();
            const invalidCategory = { ...validCategory, color: invalidColor };

            const validation = validateCourseCategory(invalidCategory);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.some(error => error.includes('color'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Curriculum Module Data Structure Validation', () => {
    test('Property 8g: Generated curriculum modules should always pass validation', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), (count) => {
          // Generate random curriculum modules using our generator
          const modules: CurriculumModule[] = [];
          for (let i = 0; i < count; i++) {
            modules.push(generateCurriculumModule(i + 1));
          }

          // All generated modules should pass validation
          for (const module of modules) {
            const validation = validateCurriculumModule(module);
            if (!validation.isValid) {
              console.error('Module validation failed:', validation.errors);
              console.error('Module data:', JSON.stringify(module, null, 2));
            }
            expect(validation.isValid).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    test('Property 8h: Modules with invalid order should fail validation', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(0), 
            fc.constant(-1), 
            fc.integer({ min: -10, max: 0 }), // Use integer instead of float
            fc.constant(NaN)
          ),
          (invalidOrder) => {
            const validModule = generateCurriculumModule(1);
            const invalidModule = { ...validModule, order: invalidOrder };

            const validation = validateCurriculumModule(invalidModule);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.some(error => error.includes('order'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Lesson Data Structure Validation', () => {
    test('Property 8i: Generated lessons should always pass validation', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (count) => {
          // Generate random lessons using our generator
          const lessons: Lesson[] = [];
          for (let i = 0; i < count; i++) {
            lessons.push(generateLesson('module-id', i + 1));
          }

          // All generated lessons should pass validation
          for (const lesson of lessons) {
            const validation = validateLesson(lesson);
            if (!validation.isValid) {
              console.error('Lesson validation failed:', validation.errors);
              console.error('Lesson data:', JSON.stringify(lesson, null, 2));
            }
            expect(validation.isValid).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    test('Property 8j: Lessons with invalid types should fail validation', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('InvalidType'),
            fc.constant(''),
            fc.constant('Lecture'),
            fc.constant('Assignment')
          ),
          (invalidType) => {
            const validLesson = generateLesson('module-id', 1);
            const invalidLesson = { ...validLesson, type: invalidType as any };

            const validation = validateLesson(invalidLesson);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.some(error => error.includes('type'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Student Testimonial Data Structure Validation', () => {
    test('Property 8k: Generated testimonials should always pass validation', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10 }), (count) => {
          // Generate random testimonials using our generator
          const testimonials: StudentTestimonial[] = [];
          for (let i = 0; i < count; i++) {
            testimonials.push(generateTestimonial());
          }

          // All generated testimonials should pass validation
          for (const testimonial of testimonials) {
            const validation = validateStudentTestimonial(testimonial);
            if (!validation.isValid) {
              console.error('Testimonial validation failed:', validation.errors);
              console.error('Testimonial data:', JSON.stringify(testimonial, null, 2));
            }
            expect(validation.isValid).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    test('Property 8l: Testimonials with invalid ratings should fail validation', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(0),
            fc.constant(6),
            fc.constant(-1),
            fc.constant(Math.fround(5.1)), // Use Math.fround for 32-bit float
            fc.constant(Math.fround(10.5))
          ),
          (invalidRating) => {
            const validTestimonial = generateTestimonial();
            const invalidTestimonial = { ...validTestimonial, rating: invalidRating };

            const validation = validateStudentTestimonial(invalidTestimonial);
            expect(validation.isValid).toBe(false);
            expect(validation.errors.some(error => error.includes('rating'))).toBe(true);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Cross-Structure Consistency', () => {
    test('Property 8m: Course instructor IDs should reference valid instructor structures', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), (instructorCount) => {
          // Generate instructors first
          const instructors: Instructor[] = [];
          for (let i = 0; i < instructorCount; i++) {
            instructors.push(generateInstructor());
          }

          // Generate course with these instructors
          const course = generateCourse(instructors);

          // Validate that all instructor IDs in the course reference valid instructors
          for (const instructorId of course.instructorIds) {
            const instructor = instructors.find(i => i.id === instructorId);
            if (instructor) {
              const validation = validateInstructor(instructor);
              expect(validation.isValid).toBe(true);
            }
          }

          // Validate the course itself
          const courseValidation = validateCourse(course);
          expect(courseValidation.isValid).toBe(true);
        }),
        { numRuns: 50 }
      );
    });

    test('Property 8n: All data structures should maintain referential integrity', () => {
      fc.assert(
        fc.property(
          fc.record({
            courseCount: fc.integer({ min: 1, max: 5 }),
            instructorCount: fc.integer({ min: 1, max: 3 }),
          }),
          ({ courseCount, instructorCount }) => {
            // Generate instructors
            const instructors: Instructor[] = [];
            for (let i = 0; i < instructorCount; i++) {
              instructors.push(generateInstructor());
            }

            // Generate courses with these instructors
            const courses: Course[] = [];
            for (let i = 0; i < courseCount; i++) {
              courses.push(generateCourse(instructors));
            }

            // Generate testimonials for these courses
            const testimonials: StudentTestimonial[] = [];
            for (let i = 0; i < courseCount; i++) {
              testimonials.push(generateTestimonial(courses));
            }

            // Validate all structures
            for (const course of courses) {
              const validation = validateCourse(course);
              expect(validation.isValid).toBe(true);
            }

            for (const instructor of instructors) {
              const validation = validateInstructor(instructor);
              expect(validation.isValid).toBe(true);
            }

            for (const testimonial of testimonials) {
              const validation = validateStudentTestimonial(testimonial);
              expect(validation.isValid).toBe(true);
            }

            // Check that testimonials reference actual course titles
            for (const testimonial of testimonials) {
              const courseExists = courses.some(course => course.title === testimonial.courseCompleted);
              expect(courseExists).toBe(true);
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});