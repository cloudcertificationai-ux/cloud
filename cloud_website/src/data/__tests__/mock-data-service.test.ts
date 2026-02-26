import { MockDataService } from '../mock-data-service';
import { SearchParams } from '@/types';

describe('MockDataService', () => {
  let service: MockDataService;

  beforeEach(() => {
    service = new MockDataService();
  });

  describe('Basic Data Retrieval', () => {
    test('should return courses', () => {
      const courses = service.getCourses();
      expect(Array.isArray(courses)).toBe(true);
      expect(courses.length).toBeGreaterThan(0);
    });

    test('should return instructors', () => {
      const instructors = service.getInstructors();
      expect(Array.isArray(instructors)).toBe(true);
      expect(instructors.length).toBeGreaterThan(0);
    });

    test('should return categories', () => {
      const categories = service.getCategories();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
    });

    test('should return testimonials', () => {
      const testimonials = service.getTestimonials();
      expect(Array.isArray(testimonials)).toBe(true);
      expect(testimonials.length).toBeGreaterThan(0);
    });

    test('should return success metrics', () => {
      const metrics = service.getSuccessMetrics();
      expect(typeof metrics).toBe('object');
      expect(typeof metrics.totalStudents).toBe('number');
      expect(typeof metrics.jobPlacementRate).toBe('number');
    });
  });

  describe('Individual Item Retrieval', () => {
    test('should get course by ID', () => {
      const courses = service.getCourses();
      const firstCourse = courses[0];
      const foundCourse = service.getCourseById(firstCourse.id);
      
      expect(foundCourse).toBeDefined();
      expect(foundCourse?.id).toBe(firstCourse.id);
    });

    test('should return undefined for non-existent course ID', () => {
      const course = service.getCourseById('non-existent-id');
      expect(course).toBeUndefined();
    });

    test('should get course by slug', () => {
      const courses = service.getCourses();
      const firstCourse = courses[0];
      const foundCourse = service.getCourseBySlug(firstCourse.slug);
      
      expect(foundCourse).toBeDefined();
      expect(foundCourse?.slug).toBe(firstCourse.slug);
    });

    test('should get instructor by ID', () => {
      const instructors = service.getInstructors();
      const firstInstructor = instructors[0];
      const foundInstructor = service.getInstructorById(firstInstructor.id);
      
      expect(foundInstructor).toBeDefined();
      expect(foundInstructor?.id).toBe(firstInstructor.id);
    });

    test('should get category by ID', () => {
      const categories = service.getCategories();
      const firstCategory = categories[0];
      const foundCategory = service.getCategoryById(firstCategory.id);
      
      expect(foundCategory).toBeDefined();
      expect(foundCategory?.id).toBe(firstCategory.id);
    });
  });

  describe('Search Functionality', () => {
    test('should search courses without parameters', () => {
      const results = service.searchCourses();
      
      expect(results.courses).toBeDefined();
      expect(Array.isArray(results.courses)).toBe(true);
      expect(typeof results.total).toBe('number');
      expect(typeof results.page).toBe('number');
      expect(typeof results.totalPages).toBe('number');
      expect(typeof results.hasMore).toBe('boolean');
    });

    test('should search courses with query', () => {
      const searchParams: SearchParams = {
        query: 'React',
      };
      
      const results = service.searchCourses(searchParams);
      
      expect(results.courses.length).toBeGreaterThanOrEqual(0);
      // If there are results, they should contain the search term
      if (results.courses.length > 0) {
        const hasReactInResults = results.courses.some(course => 
          course.title.toLowerCase().includes('react') ||
          course.shortDescription.toLowerCase().includes('react') ||
          course.tags.some(tag => tag.toLowerCase().includes('react'))
        );
        expect(hasReactInResults).toBe(true);
      }
    });

    test('should filter courses by category', () => {
      const categories = service.getCategories();
      const firstCategory = categories[0];
      
      const searchParams: SearchParams = {
        filters: {
          category: [firstCategory.id],
        },
      };
      
      const results = service.searchCourses(searchParams);
      
      // All results should be from the specified category
      results.courses.forEach(course => {
        expect(course.category.id).toBe(firstCategory.id);
      });
    });

    test('should filter courses by level', () => {
      const searchParams: SearchParams = {
        filters: {
          level: ['Beginner'],
        },
      };
      
      const results = service.searchCourses(searchParams);
      
      // All results should be beginner level
      results.courses.forEach(course => {
        expect(course.level).toBe('Beginner');
      });
    });

    test('should filter courses by price range', () => {
      const searchParams: SearchParams = {
        filters: {
          priceRange: {
            min: 100,
            max: 300,
          },
        },
      };
      
      const results = service.searchCourses(searchParams);
      
      // All results should be within price range
      results.courses.forEach(course => {
        expect(course.price.amount).toBeGreaterThanOrEqual(100);
        expect(course.price.amount).toBeLessThanOrEqual(300);
      });
    });

    test('should sort courses by rating', () => {
      const searchParams: SearchParams = {
        sortBy: 'rating',
        sortOrder: 'desc',
      };
      
      const results = service.searchCourses(searchParams);
      
      // Results should be sorted by rating in descending order
      for (let i = 1; i < results.courses.length; i++) {
        expect(results.courses[i - 1].rating.average).toBeGreaterThanOrEqual(
          results.courses[i].rating.average
        );
      }
    });

    test('should handle pagination', () => {
      const searchParams: SearchParams = {
        page: 1,
        limit: 5,
      };
      
      const results = service.searchCourses(searchParams);
      
      expect(results.courses.length).toBeLessThanOrEqual(5);
      expect(results.page).toBe(1);
      expect(results.totalPages).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Related Data Retrieval', () => {
    test('should get courses by instructor ID', () => {
      const instructors = service.getInstructors();
      const instructor = instructors.find(i => i.courseIds.length > 0);
      
      if (instructor) {
        const courses = service.getCoursesByInstructorId(instructor.id);
        expect(Array.isArray(courses)).toBe(true);
        
        // All courses should include this instructor
        courses.forEach(course => {
          expect(course.instructorIds).toContain(instructor.id);
        });
      }
    });

    test('should get courses by category', () => {
      const categories = service.getCategories();
      const firstCategory = categories[0];
      
      const courses = service.getCoursesByCategory(firstCategory.id);
      
      // All courses should be from this category
      courses.forEach(course => {
        expect(course.category.id).toBe(firstCategory.id);
      });
    });

    test('should get testimonials by course ID', () => {
      const courses = service.getCourses();
      const firstCourse = courses[0];
      
      const testimonials = service.getTestimonialsByCourseId(firstCourse.id);
      
      // All testimonials should be for this course
      testimonials.forEach(testimonial => {
        expect(testimonial.courseCompleted).toBe(firstCourse.title);
      });
    });

    test('should get related courses', () => {
      const courses = service.getCourses();
      const firstCourse = courses[0];
      
      const relatedCourses = service.getRelatedCourses(firstCourse.id);
      
      expect(Array.isArray(relatedCourses)).toBe(true);
      // Related courses should not include the original course
      relatedCourses.forEach(course => {
        expect(course.id).not.toBe(firstCourse.id);
      });
    });
  });

  describe('Specialized Queries', () => {
    test('should get featured courses', () => {
      const featuredCourses = service.getFeaturedCourses(3);
      
      expect(Array.isArray(featuredCourses)).toBe(true);
      expect(featuredCourses.length).toBeLessThanOrEqual(3);
      
      // Featured courses should be active
      featuredCourses.forEach(course => {
        expect(course.isActive).toBe(true);
      });
    });

    test('should get recent courses', () => {
      const recentCourses = service.getRecentCourses(5);
      
      expect(Array.isArray(recentCourses)).toBe(true);
      expect(recentCourses.length).toBeLessThanOrEqual(5);
      
      // Recent courses should be sorted by creation date (newest first)
      for (let i = 1; i < recentCourses.length; i++) {
        expect(recentCourses[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
          recentCourses[i].createdAt.getTime()
        );
      }
    });

    test('should get courses by level', () => {
      const beginnerCourses = service.getCoursesByLevel('Beginner');
      
      beginnerCourses.forEach(course => {
        expect(course.level).toBe('Beginner');
        expect(course.isActive).toBe(true);
      });
    });

    test('should get courses by mode', () => {
      const liveCourses = service.getCoursesByMode('Live');
      
      liveCourses.forEach(course => {
        expect(course.mode).toBe('Live');
        expect(course.isActive).toBe(true);
      });
    });
  });

  describe('Statistics and Ranges', () => {
    test('should get course statistics', () => {
      const stats = service.getCourseStats();
      
      expect(typeof stats.totalCourses).toBe('number');
      expect(typeof stats.totalInstructors).toBe('number');
      expect(typeof stats.totalStudents).toBe('number');
      expect(typeof stats.averageRating).toBe('number');
      expect(Array.isArray(stats.categoryCounts)).toBe(true);
      expect(typeof stats.levelCounts).toBe('object');
      expect(typeof stats.modeCounts).toBe('object');
    });

    test('should get price range', () => {
      const priceRange = service.getPriceRange();
      
      expect(typeof priceRange.min).toBe('number');
      expect(typeof priceRange.max).toBe('number');
      expect(priceRange.min).toBeLessThanOrEqual(priceRange.max);
    });

    test('should get duration range', () => {
      const durationRange = service.getDurationRange();
      
      expect(typeof durationRange.min).toBe('number');
      expect(typeof durationRange.max).toBe('number');
      expect(durationRange.min).toBeLessThanOrEqual(durationRange.max);
    });
  });

  describe('Data Management', () => {
    test('should add new course', () => {
      const initialCount = service.getCourses().length;
      const newCourse = service.getCourses()[0]; // Use existing course as template
      const courseToAdd = { ...newCourse, id: 'new-test-course', title: 'Test Course' };
      
      service.addCourse(courseToAdd);
      
      const updatedCount = service.getCourses().length;
      expect(updatedCount).toBe(initialCount + 1);
      
      const addedCourse = service.getCourseById('new-test-course');
      expect(addedCourse).toBeDefined();
      expect(addedCourse?.title).toBe('Test Course');
    });

    test('should reset data', () => {
      // Add a new course
      const newCourse = service.getCourses()[0];
      const courseToAdd = { ...newCourse, id: 'temp-course', title: 'Temp Course' };
      service.addCourse(courseToAdd);
      
      // Verify the course was added
      expect(service.getCourseById('temp-course')).toBeDefined();
      
      // Reset data
      service.resetData();
      
      // The temp course should be gone
      expect(service.getCourseById('temp-course')).toBeUndefined();
      
      // Should have courses again (new random set)
      expect(service.getCourses().length).toBeGreaterThan(0);
    });
  });
});