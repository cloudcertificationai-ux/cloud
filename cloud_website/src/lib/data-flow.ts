/**
 * Data flow management utilities for consistent data across components
 */

import { Course, Instructor, StudentTestimonial, SuccessMetrics } from '@/types';
import { mockDataService } from '@/data/mock-data-service';

// Cache interface for managing data freshness
interface DataCache {
  courses: { data: Course[]; timestamp: number } | null;
  instructors: { data: Instructor[]; timestamp: number } | null;
  testimonials: { data: StudentTestimonial[]; timestamp: number } | null;
  successMetrics: { data: SuccessMetrics; timestamp: number } | null;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Global data cache
let dataCache: DataCache = {
  courses: null,
  instructors: null,
  testimonials: null,
  successMetrics: null,
};

/**
 * Check if cached data is still fresh
 */
function isCacheValid(cacheEntry: { timestamp: number } | null): boolean {
  if (!cacheEntry) return false;
  return Date.now() - cacheEntry.timestamp < CACHE_DURATION;
}

/**
 * Get courses with caching
 */
export async function getCachedCourses(): Promise<Course[]> {
  if (isCacheValid(dataCache.courses)) {
    return dataCache.courses!.data;
  }

  const courses = mockDataService.getCourses();
  dataCache.courses = {
    data: courses,
    timestamp: Date.now(),
  };

  return courses;
}

/**
 * Get instructors with caching
 */
export async function getCachedInstructors(): Promise<Instructor[]> {
  if (isCacheValid(dataCache.instructors)) {
    return dataCache.instructors!.data;
  }

  const instructors = mockDataService.getInstructors();
  dataCache.instructors = {
    data: instructors,
    timestamp: Date.now(),
  };

  return instructors;
}

/**
 * Get testimonials with caching
 */
export async function getCachedTestimonials(): Promise<StudentTestimonial[]> {
  if (isCacheValid(dataCache.testimonials)) {
    return dataCache.testimonials!.data;
  }

  const testimonials = mockDataService.getTestimonials();
  dataCache.testimonials = {
    data: testimonials,
    timestamp: Date.now(),
  };

  return testimonials;
}

/**
 * Get success metrics with caching
 */
export async function getCachedSuccessMetrics(): Promise<SuccessMetrics> {
  if (isCacheValid(dataCache.successMetrics)) {
    return dataCache.successMetrics!.data;
  }

  const successMetrics = mockDataService.getSuccessMetrics();
  dataCache.successMetrics = {
    data: successMetrics,
    timestamp: Date.now(),
  };

  return successMetrics;
}

/**
 * Invalidate specific cache entry
 */
export function invalidateCache(key: keyof DataCache | 'all'): void {
  if (key === 'all') {
    dataCache = {
      courses: null,
      instructors: null,
      testimonials: null,
      successMetrics: null,
    };
  } else {
    dataCache[key] = null;
  }
}

/**
 * Preload all data for better performance
 */
export async function preloadData(): Promise<{
  courses: Course[];
  instructors: Instructor[];
  testimonials: StudentTestimonial[];
  successMetrics: SuccessMetrics;
}> {
  const [courses, instructors, testimonials, successMetrics] = await Promise.all([
    getCachedCourses(),
    getCachedInstructors(),
    getCachedTestimonials(),
    getCachedSuccessMetrics(),
  ]);

  return {
    courses,
    instructors,
    testimonials,
    successMetrics,
  };
}

/**
 * Get course with related data (instructors, testimonials)
 */
export async function getCourseWithRelatedData(courseId: string): Promise<{
  course: Course | null;
  instructors: Instructor[];
  testimonials: StudentTestimonial[];
  relatedCourses: Course[];
}> {
  const [courses, instructors, testimonials] = await Promise.all([
    getCachedCourses(),
    getCachedInstructors(),
    getCachedTestimonials(),
  ]);

  const course = courses.find(c => c.id === courseId) || null;
  
  if (!course) {
    return {
      course: null,
      instructors: [],
      testimonials: [],
      relatedCourses: [],
    };
  }

  const courseInstructors = instructors.filter(instructor => 
    course.instructorIds.includes(instructor.id)
  );

  const courseTestimonials = testimonials.filter(testimonial => 
    testimonial.courseCompleted === course.title
  );

  const relatedCourses = mockDataService.getRelatedCourses(courseId, 4);

  return {
    course,
    instructors: courseInstructors,
    testimonials: courseTestimonials,
    relatedCourses,
  };
}

/**
 * Get instructor with related data (courses, testimonials)
 */
export async function getInstructorWithRelatedData(instructorId: string): Promise<{
  instructor: Instructor | null;
  courses: Course[];
  testimonials: StudentTestimonial[];
}> {
  const [courses, instructors, testimonials] = await Promise.all([
    getCachedCourses(),
    getCachedInstructors(),
    getCachedTestimonials(),
  ]);

  const instructor = instructors.find(i => i.id === instructorId) || null;
  
  if (!instructor) {
    return {
      instructor: null,
      courses: [],
      testimonials: [],
    };
  }

  const instructorCourses = courses.filter(course => 
    course.instructorIds.includes(instructorId)
  );

  const instructorTestimonials = testimonials.filter(testimonial => 
    instructorCourses.some(course => course.title === testimonial.courseCompleted)
  );

  return {
    instructor,
    courses: instructorCourses,
    testimonials: instructorTestimonials,
  };
}

/**
 * Search across all data types
 */
export async function globalSearch(query: string): Promise<{
  courses: Course[];
  instructors: Instructor[];
  suggestions: string[];
}> {
  const [courses, instructors] = await Promise.all([
    getCachedCourses(),
    getCachedInstructors(),
  ]);

  const searchTerm = query.toLowerCase().trim();
  
  // Search courses
  const matchingCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm) ||
    course.shortDescription.toLowerCase().includes(searchTerm) ||
    course.category.name.toLowerCase().includes(searchTerm) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );

  // Search instructors
  const matchingInstructors = instructors.filter(instructor => 
    instructor.name.toLowerCase().includes(searchTerm) ||
    instructor.expertise.some(skill => skill.toLowerCase().includes(searchTerm))
  );

  // Generate suggestions
  const suggestions = [
    ...new Set([
      ...matchingCourses.map(course => course.title),
      ...matchingCourses.map(course => course.category.name),
      ...matchingInstructors.map(instructor => instructor.name),
      ...matchingCourses.flatMap(course => course.tags),
    ])
  ].slice(0, 10);

  return {
    courses: matchingCourses,
    instructors: matchingInstructors,
    suggestions,
  };
}

/**
 * Get data consistency report
 */
export async function getDataConsistencyReport(): Promise<{
  isConsistent: boolean;
  issues: string[];
  stats: {
    totalCourses: number;
    totalInstructors: number;
    totalTestimonials: number;
    orphanedCourses: number;
    orphanedTestimonials: number;
  };
}> {
  const [courses, instructors, testimonials] = await Promise.all([
    getCachedCourses(),
    getCachedInstructors(),
    getCachedTestimonials(),
  ]);

  const issues: string[] = [];
  
  // Check for orphaned courses (courses with invalid instructor IDs)
  const orphanedCourses = courses.filter(course => 
    course.instructorIds.some(instructorId => 
      !instructors.find(instructor => instructor.id === instructorId)
    )
  );

  // Check for orphaned testimonials (testimonials for non-existent courses)
  const orphanedTestimonials = testimonials.filter(testimonial => 
    !courses.find(course => course.title === testimonial.courseCompleted)
  );

  // Check for instructors without courses
  const instructorsWithoutCourses = instructors.filter(instructor => 
    !courses.some(course => course.instructorIds.includes(instructor.id))
  );

  if (orphanedCourses.length > 0) {
    issues.push(`${orphanedCourses.length} courses have invalid instructor references`);
  }

  if (orphanedTestimonials.length > 0) {
    issues.push(`${orphanedTestimonials.length} testimonials reference non-existent courses`);
  }

  if (instructorsWithoutCourses.length > 0) {
    issues.push(`${instructorsWithoutCourses.length} instructors have no associated courses`);
  }

  return {
    isConsistent: issues.length === 0,
    issues,
    stats: {
      totalCourses: courses.length,
      totalInstructors: instructors.length,
      totalTestimonials: testimonials.length,
      orphanedCourses: orphanedCourses.length,
      orphanedTestimonials: orphanedTestimonials.length,
    },
  };
}

/**
 * Refresh all cached data
 */
export async function refreshAllData(): Promise<void> {
  invalidateCache('all');
  await preloadData();
}