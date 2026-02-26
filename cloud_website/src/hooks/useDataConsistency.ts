import { useCallback, useEffect, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { Course, Instructor } from '@/types';

/**
 * Hook for managing data consistency across components
 * Ensures that data updates are reflected consistently throughout the application
 */
export function useDataConsistency() {
  const { state, actions, selectors } = useData();
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update function to prevent excessive re-renders
  const debouncedUpdate = useCallback((fn: () => void, delay: number = 300) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(fn, delay);
  }, []);

  // Update course and ensure consistency across all components
  const updateCourseConsistently = useCallback((course: Course) => {
    // Update the course in the global state
    actions.updateCourse(course);
    
    // If the course has instructors, ensure their course lists are updated
    const instructors = selectors.getInstructorsByIds(course.instructorIds);
    instructors.forEach(instructor => {
      if (!instructor.courseIds.includes(course.id)) {
        const updatedInstructor = {
          ...instructor,
          courseIds: [...instructor.courseIds, course.id],
        };
        actions.updateInstructor(updatedInstructor);
      }
    });
  }, [actions, selectors]);

  // Update instructor and ensure consistency across all components
  const updateInstructorConsistently = useCallback((instructor: Instructor) => {
    // Update the instructor in the global state
    actions.updateInstructor(instructor);
    
    // Update all courses taught by this instructor to reflect any changes
    const courses = selectors.getCoursesByInstructorId(instructor.id);
    courses.forEach(course => {
      if (!course.instructorIds.includes(instructor.id)) {
        const updatedCourse = {
          ...course,
          instructorIds: [...course.instructorIds, instructor.id],
        };
        actions.updateCourse(updatedCourse);
      }
    });
  }, [actions, selectors]);

  // Add course and maintain referential integrity
  const addCourseConsistently = useCallback((course: Course) => {
    // Add the course to the global state
    actions.addCourse(course);
    
    // Update instructor course lists
    const instructors = selectors.getInstructorsByIds(course.instructorIds);
    instructors.forEach(instructor => {
      if (!instructor.courseIds.includes(course.id)) {
        const updatedInstructor = {
          ...instructor,
          courseIds: [...instructor.courseIds, course.id],
        };
        actions.updateInstructor(updatedInstructor);
      }
    });
  }, [actions, selectors]);

  // Remove course and clean up references
  const removeCourseConsistently = useCallback((courseId: string) => {
    const course = selectors.getCourseById(courseId);
    if (!course) return;

    // Remove the course from global state
    actions.removeCourse(courseId);
    
    // Remove course from instructor course lists
    const instructors = selectors.getInstructorsByIds(course.instructorIds);
    instructors.forEach(instructor => {
      const updatedInstructor = {
        ...instructor,
        courseIds: instructor.courseIds.filter(id => id !== courseId),
      };
      actions.updateInstructor(updatedInstructor);
    });
  }, [actions, selectors]);

  // Batch update multiple courses
  const batchUpdateCourses = useCallback((courses: Course[]) => {
    debouncedUpdate(() => {
      courses.forEach(course => {
        updateCourseConsistently(course);
      });
    });
  }, [updateCourseConsistently, debouncedUpdate]);

  // Batch update multiple instructors
  const batchUpdateInstructors = useCallback((instructors: Instructor[]) => {
    debouncedUpdate(() => {
      instructors.forEach(instructor => {
        updateInstructorConsistently(instructor);
      });
    });
  }, [updateInstructorConsistently, debouncedUpdate]);

  // Sync data when it becomes stale
  const syncStaleData = useCallback(async () => {
    const promises: Promise<void>[] = [];

    if (selectors.isDataStale('courses')) {
      promises.push(actions.loadCourses());
    }
    
    if (selectors.isDataStale('instructors')) {
      promises.push(actions.loadInstructors());
    }
    
    if (selectors.isDataStale('testimonials')) {
      promises.push(actions.loadTestimonials());
    }
    
    if (selectors.isDataStale('successMetrics')) {
      promises.push(actions.loadSuccessMetrics());
    }

    await Promise.all(promises);
  }, [actions, selectors]);

  // Auto-sync stale data on mount and periodically
  useEffect(() => {
    syncStaleData();
    
    // Set up periodic sync (every 5 minutes)
    const interval = setInterval(syncStaleData, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [syncStaleData]);

  // Validate data consistency
  const validateDataConsistency = useCallback(() => {
    const issues: string[] = [];
    
    // Check course-instructor relationships
    state.courses.forEach(course => {
      course.instructorIds.forEach(instructorId => {
        const instructor = selectors.getInstructorById(instructorId);
        if (!instructor) {
          issues.push(`Course "${course.title}" references non-existent instructor ${instructorId}`);
        } else if (!instructor.courseIds.includes(course.id)) {
          issues.push(`Instructor "${instructor.name}" missing course "${course.title}" in courseIds`);
        }
      });
    });

    // Check instructor-course relationships
    state.instructors.forEach(instructor => {
      instructor.courseIds.forEach(courseId => {
        const course = selectors.getCourseById(courseId);
        if (!course) {
          issues.push(`Instructor "${instructor.name}" references non-existent course ${courseId}`);
        } else if (!course.instructorIds.includes(instructor.id)) {
          issues.push(`Course "${course.title}" missing instructor "${instructor.name}" in instructorIds`);
        }
      });
    });

    return {
      isConsistent: issues.length === 0,
      issues,
    };
  }, [state.courses, state.instructors, selectors]);

  // Get data freshness status
  const getDataFreshness = useCallback(() => {
    return {
      courses: {
        lastUpdated: state.lastUpdated.courses,
        isStale: selectors.isDataStale('courses'),
        isLoading: state.loading.courses,
        hasError: !!state.errors.courses,
      },
      instructors: {
        lastUpdated: state.lastUpdated.instructors,
        isStale: selectors.isDataStale('instructors'),
        isLoading: state.loading.instructors,
        hasError: !!state.errors.instructors,
      },
      testimonials: {
        lastUpdated: state.lastUpdated.testimonials,
        isStale: selectors.isDataStale('testimonials'),
        isLoading: state.loading.testimonials,
        hasError: !!state.errors.testimonials,
      },
      successMetrics: {
        lastUpdated: state.lastUpdated.successMetrics,
        isStale: selectors.isDataStale('successMetrics'),
        isLoading: state.loading.successMetrics,
        hasError: !!state.errors.successMetrics,
      },
    };
  }, [state, selectors]);

  return {
    // Consistent update operations
    updateCourseConsistently,
    updateInstructorConsistently,
    addCourseConsistently,
    removeCourseConsistently,
    batchUpdateCourses,
    batchUpdateInstructors,
    
    // Data synchronization
    syncStaleData,
    
    // Data validation
    validateDataConsistency,
    
    // Data freshness
    getDataFreshness,
    
    // Direct access to state and actions
    state,
    actions,
    selectors,
  };
}

/**
 * Hook for components that need to ensure they have fresh data
 */
export function useFreshData(dataTypes: Array<'courses' | 'instructors' | 'testimonials' | 'successMetrics'> = ['courses', 'instructors']) {
  const { selectors, actions } = useData();

  useEffect(() => {
    const loadPromises: Promise<void>[] = [];

    dataTypes.forEach(dataType => {
      if (selectors.isDataStale(dataType)) {
        switch (dataType) {
          case 'courses':
            loadPromises.push(actions.loadCourses());
            break;
          case 'instructors':
            loadPromises.push(actions.loadInstructors());
            break;
          case 'testimonials':
            loadPromises.push(actions.loadTestimonials());
            break;
          case 'successMetrics':
            loadPromises.push(actions.loadSuccessMetrics());
            break;
        }
      }
    });

    if (loadPromises.length > 0) {
      Promise.all(loadPromises).catch(error => {
        console.error('Failed to load fresh data:', error);
      });
    }
  }, [dataTypes, selectors, actions]);
}

/**
 * Hook for components that need to watch for data changes
 */
export function useDataChangeListener(
  callback: (changes: {
    courses?: Course[];
    instructors?: Instructor[];
    timestamp: Date;
  }) => void,
  dependencies: Array<'courses' | 'instructors'> = ['courses', 'instructors']
) {
  const { state } = useData();
  const previousDataRef = useRef<{
    courses: Course[];
    instructors: Instructor[];
  }>({
    courses: [],
    instructors: [],
  });

  useEffect(() => {
    const changes: any = { timestamp: new Date() };
    let hasChanges = false;

    if (dependencies.includes('courses') && 
        JSON.stringify(state.courses) !== JSON.stringify(previousDataRef.current.courses)) {
      changes.courses = state.courses;
      previousDataRef.current.courses = state.courses;
      hasChanges = true;
    }

    if (dependencies.includes('instructors') && 
        JSON.stringify(state.instructors) !== JSON.stringify(previousDataRef.current.instructors)) {
      changes.instructors = state.instructors;
      previousDataRef.current.instructors = state.instructors;
      hasChanges = true;
    }

    if (hasChanges) {
      callback(changes);
    }
  }, [state.courses, state.instructors, callback, dependencies]);
}