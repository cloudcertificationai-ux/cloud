/**
 * @deprecated This mock data service is being replaced by the database service.
 * New code should use API routes that connect to the database via dbDataService.
 * This file is kept for backward compatibility during the migration.
 */

import {
  Course,
  Instructor,
  CourseCategory,
  StudentTestimonial,
  SuccessMetrics,
  SearchParams,
  SearchResults,
  CourseFilters,
} from '@/types';
import {
  generateCourses,
  generateInstructors,
  generateTestimonials,
} from './generators';
import { categories, successMetrics } from './sample-data';

// Mock data service class for managing course data
export class MockDataService {
  private courses: Course[] = [];
  private instructors: Instructor[] = [];
  private testimonials: StudentTestimonial[] = [];
  private categories: CourseCategory[] = categories;
  private successMetrics: SuccessMetrics = successMetrics;

  constructor() {
    this.initializeData();
  }

  // Initialize with sample data
  private initializeData(): void {
    // Generate instructors first
    this.instructors = generateInstructors({ count: 12 });
    
    // Generate courses with these instructors
    this.courses = generateCourses({ count: 50 });
    
    // Update instructor courseIds based on generated courses
    this.updateInstructorCourseIds();
    
    // Generate testimonials for these courses
    this.testimonials = generateTestimonials({ count: 30 }, this.courses);
  }

  // Update instructor courseIds to match generated courses
  private updateInstructorCourseIds(): void {
    this.instructors.forEach(instructor => {
      instructor.courseIds = this.courses
        .filter(course => course.instructorIds.includes(instructor.id))
        .map(course => course.id);
    });
  }

  // Get all courses
  getCourses(): Course[] {
    return [...this.courses];
  }

  // Get course by ID
  getCourseById(id: string): Course | undefined {
    return this.courses.find(course => course.id === id);
  }

  // Get course by slug
  getCourseBySlug(slug: string): Course | undefined {
    return this.courses.find(course => course.slug === slug);
  }

  // Get all instructors
  getInstructors(): Instructor[] {
    return [...this.instructors];
  }

  // Get instructor by ID
  getInstructorById(id: string): Instructor | undefined {
    return this.instructors.find(instructor => instructor.id === id);
  }

  // Get instructors by IDs
  getInstructorsByIds(ids: string[]): Instructor[] {
    return this.instructors.filter(instructor => ids.includes(instructor.id));
  }

  // Get courses by instructor ID
  getCoursesByInstructorId(instructorId: string): Course[] {
    return this.courses.filter(course => 
      course.instructorIds.includes(instructorId)
    );
  }

  // Get all categories
  getCategories(): CourseCategory[] {
    return [...this.categories];
  }

  // Get category by ID
  getCategoryById(id: string): CourseCategory | undefined {
    return this.categories.find(category => category.id === id);
  }

  // Get category by slug
  getCategoryBySlug(slug: string): CourseCategory | undefined {
    return this.categories.find(category => category.slug === slug);
  }

  // Get courses by category
  getCoursesByCategory(categoryId: string): Course[] {
    return this.courses.filter(course => course.category.id === categoryId);
  }

  // Get all testimonials
  getTestimonials(): StudentTestimonial[] {
    return [...this.testimonials];
  }

  // Get testimonials by course ID
  getTestimonialsByCourseId(courseId: string): StudentTestimonial[] {
    const course = this.getCourseById(courseId);
    if (!course) return [];
    
    return this.testimonials.filter(testimonial => 
      testimonial.courseCompleted === course.title
    );
  }

  // Get testimonials by course title
  getTestimonialsByCourse(courseTitle: string): StudentTestimonial[] {
    return this.testimonials.filter(testimonial => 
      testimonial.courseCompleted === courseTitle
    );
  }

  // Get success metrics
  getSuccessMetrics(): SuccessMetrics {
    return { ...this.successMetrics };
  }

  // Search courses with filters and pagination
  searchCourses(params: SearchParams = {}): SearchResults {
    const {
      query = '',
      filters = {},
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = params;

    let filteredCourses = [...this.courses];

    // Apply text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(searchTerm) ||
        course.shortDescription.toLowerCase().includes(searchTerm) ||
        course.longDescription.toLowerCase().includes(searchTerm) ||
        course.category.name.toLowerCase().includes(searchTerm) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        course.instructorIds.some(instructorId => {
          const instructor = this.getInstructorById(instructorId);
          return instructor?.name.toLowerCase().includes(searchTerm) ||
                 instructor?.expertise.some(skill => skill.toLowerCase().includes(searchTerm));
        })
      );
    }

    // Apply filters
    filteredCourses = this.applyFilters(filteredCourses, filters);

    // Apply sorting
    filteredCourses = this.sortCourses(filteredCourses, sortBy, sortOrder, query);

    // Calculate pagination
    const total = filteredCourses.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

    return {
      courses: paginatedCourses,
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    };
  }

  // Apply filters to courses
  private applyFilters(courses: Course[], filters: CourseFilters): Course[] {
    let filtered = [...courses];

    // Category filter
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(course => 
        filters.category!.includes(course.category.id) ||
        filters.category!.includes(course.category.slug) ||
        filters.category!.includes(course.category.name)
      );
    }

    // Level filter
    if (filters.level && filters.level.length > 0) {
      filtered = filtered.filter(course => 
        filters.level!.includes(course.level)
      );
    }

    // Mode filter
    if (filters.mode && filters.mode.length > 0) {
      filtered = filtered.filter(course => 
        filters.mode!.includes(course.mode)
      );
    }

    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      filtered = filtered.filter(course => 
        course.price.amount >= min && course.price.amount <= max
      );
    }

    // Duration filter (in hours)
    if (filters.duration) {
      const { min, max } = filters.duration;
      filtered = filtered.filter(course => 
        course.duration.hours >= min && course.duration.hours <= max
      );
    }

    // Only show active courses by default
    filtered = filtered.filter(course => course.isActive);

    return filtered;
  }

  // Sort courses based on criteria
  private sortCourses(
    courses: Course[], 
    sortBy: string, 
    sortOrder: 'asc' | 'desc',
    query?: string
  ): Course[] {
    const sorted = [...courses];

    switch (sortBy) {
      case 'relevance':
        // If there's a query, sort by relevance to search term
        if (query && query.trim()) {
          const searchTerm = query.toLowerCase().trim();
          sorted.sort((a, b) => {
            const aRelevance = this.calculateRelevanceScore(a, searchTerm);
            const bRelevance = this.calculateRelevanceScore(b, searchTerm);
            return sortOrder === 'desc' ? bRelevance - aRelevance : aRelevance - bRelevance;
          });
        } else {
          // Default to popularity when no search query
          sorted.sort((a, b) => {
            const aScore = a.enrollmentCount * a.rating.average;
            const bScore = b.enrollmentCount * b.rating.average;
            return sortOrder === 'desc' ? bScore - aScore : aScore - bScore;
          });
        }
        break;

      case 'rating':
        sorted.sort((a, b) => {
          const diff = a.rating.average - b.rating.average;
          return sortOrder === 'desc' ? -diff : diff;
        });
        break;

      case 'price':
        sorted.sort((a, b) => {
          const diff = a.price.amount - b.price.amount;
          return sortOrder === 'desc' ? -diff : diff;
        });
        break;

      case 'duration':
        sorted.sort((a, b) => {
          const diff = a.duration.hours - b.duration.hours;
          return sortOrder === 'desc' ? -diff : diff;
        });
        break;

      case 'popularity':
        sorted.sort((a, b) => {
          const diff = a.enrollmentCount - b.enrollmentCount;
          return sortOrder === 'desc' ? -diff : diff;
        });
        break;

      default:
        // Default to creation date
        sorted.sort((a, b) => {
          const diff = a.createdAt.getTime() - b.createdAt.getTime();
          return sortOrder === 'desc' ? -diff : diff;
        });
    }

    return sorted;
  }

  // Calculate relevance score for search
  private calculateRelevanceScore(course: Course, searchTerm: string): number {
    let score = 0;
    const term = searchTerm.toLowerCase();

    // Title match (highest weight)
    if (course.title.toLowerCase().includes(term)) {
      score += 10;
      if (course.title.toLowerCase().startsWith(term)) {
        score += 5; // Bonus for starting with search term
      }
    }

    // Category match
    if (course.category.name.toLowerCase().includes(term)) {
      score += 8;
    }

    // Tags match
    course.tags.forEach(tag => {
      if (tag.toLowerCase().includes(term)) {
        score += 6;
      }
    });

    // Description match
    if (course.shortDescription.toLowerCase().includes(term)) {
      score += 4;
    }
    if (course.longDescription.toLowerCase().includes(term)) {
      score += 2;
    }

    // Instructor expertise match
    course.instructorIds.forEach(instructorId => {
      const instructor = this.getInstructorById(instructorId);
      if (instructor) {
        if (instructor.name.toLowerCase().includes(term)) {
          score += 5;
        }
        instructor.expertise.forEach(skill => {
          if (skill.toLowerCase().includes(term)) {
            score += 3;
          }
        });
      }
    });

    // Boost score based on course quality metrics
    score += course.rating.average * 0.5;
    score += Math.log(course.enrollmentCount + 1) * 0.1;

    return score;
  }

  // Get featured courses (high rating and enrollment)
  getFeaturedCourses(limit: number = 6): Course[] {
    return this.courses
      .filter(course => course.isActive)
      .sort((a, b) => {
        const aScore = a.rating.average * Math.log(a.enrollmentCount + 1);
        const bScore = b.rating.average * Math.log(b.enrollmentCount + 1);
        return bScore - aScore;
      })
      .slice(0, limit);
  }

  // Get popular courses by category
  getPopularCoursesByCategory(categoryId: string, limit: number = 4): Course[] {
    return this.courses
      .filter(course => course.isActive && course.category.id === categoryId)
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
      .slice(0, limit);
  }

  // Get recently added courses
  getRecentCourses(limit: number = 6): Course[] {
    return this.courses
      .filter(course => course.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Get courses by level
  getCoursesByLevel(level: Course['level'], limit?: number): Course[] {
    const filtered = this.courses
      .filter(course => course.isActive && course.level === level)
      .sort((a, b) => b.rating.average - a.rating.average);
    
    return limit ? filtered.slice(0, limit) : filtered;
  }

  // Get courses by mode
  getCoursesByMode(mode: Course['mode'], limit?: number): Course[] {
    const filtered = this.courses
      .filter(course => course.isActive && course.mode === mode)
      .sort((a, b) => b.enrollmentCount - a.enrollmentCount);
    
    return limit ? filtered.slice(0, limit) : filtered;
  }

  // Get related courses (same category or similar tags)
  getRelatedCourses(courseId: string, limit: number = 4): Course[] {
    const course = this.getCourseById(courseId);
    if (!course) return [];

    const related = this.courses
      .filter(c => 
        c.id !== courseId && 
        c.isActive && 
        (c.category.id === course.category.id || 
         c.tags.some(tag => course.tags.includes(tag)))
      )
      .sort((a, b) => {
        // Calculate similarity score
        const aTagOverlap = a.tags.filter(tag => course.tags.includes(tag)).length;
        const bTagOverlap = b.tags.filter(tag => course.tags.includes(tag)).length;
        const aCategoryMatch = a.category.id === course.category.id ? 1 : 0;
        const bCategoryMatch = b.category.id === course.category.id ? 1 : 0;
        
        const aScore = (aTagOverlap * 2) + aCategoryMatch + (a.rating.average * 0.1);
        const bScore = (bTagOverlap * 2) + bCategoryMatch + (b.rating.average * 0.1);
        
        return bScore - aScore;
      })
      .slice(0, limit);

    return related;
  }

  // Get course statistics
  getCourseStats() {
    const activeCourses = this.courses.filter(course => course.isActive);
    
    return {
      totalCourses: activeCourses.length,
      totalInstructors: this.instructors.length,
      totalStudents: activeCourses.reduce((sum, course) => sum + course.enrollmentCount, 0),
      averageRating: activeCourses.reduce((sum, course) => sum + course.rating.average, 0) / activeCourses.length,
      categoryCounts: this.categories.map(category => ({
        category: category.name,
        count: activeCourses.filter(course => course.category.id === category.id).length,
      })),
      levelCounts: {
        Beginner: activeCourses.filter(course => course.level === 'Beginner').length,
        Intermediate: activeCourses.filter(course => course.level === 'Intermediate').length,
        Advanced: activeCourses.filter(course => course.level === 'Advanced').length,
      },
      modeCounts: {
        Live: activeCourses.filter(course => course.mode === 'Live').length,
        'Self-Paced': activeCourses.filter(course => course.mode === 'Self-Paced').length,
        Hybrid: activeCourses.filter(course => course.mode === 'Hybrid').length,
      },
    };
  }

  // Get price range for filtering
  getPriceRange(): { min: number; max: number } {
    const prices = this.courses
      .filter(course => course.isActive)
      .map(course => course.price.amount);
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  // Get duration range for filtering
  getDurationRange(): { min: number; max: number } {
    const durations = this.courses
      .filter(course => course.isActive)
      .map(course => course.duration.hours);
    
    return {
      min: Math.min(...durations),
      max: Math.max(...durations),
    };
  }

  // Add new course (for testing)
  addCourse(course: Course): void {
    this.courses.push(course);
  }

  // Add new instructor (for testing)
  addInstructor(instructor: Instructor): void {
    this.instructors.push(instructor);
  }

  // Add new testimonial (for testing)
  addTestimonial(testimonial: StudentTestimonial): void {
    this.testimonials.push(testimonial);
  }

  // Reset data (for testing)
  resetData(): void {
    this.initializeData();
  }
}

// Create and export singleton instance
export const mockDataService = new MockDataService();