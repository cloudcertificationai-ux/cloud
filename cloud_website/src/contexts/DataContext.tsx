'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { Course, Instructor, StudentTestimonial, SuccessMetrics } from '@/types';
import { mockDataService } from '@/data/mock-data-service';

// Data state interface
interface DataState {
  courses: Course[];
  instructors: Instructor[];
  testimonials: StudentTestimonial[];
  successMetrics: SuccessMetrics;
  loading: {
    courses: boolean;
    instructors: boolean;
    testimonials: boolean;
    successMetrics: boolean;
  };
  errors: {
    courses: string | null;
    instructors: string | null;
    testimonials: string | null;
    successMetrics: string | null;
  };
  lastUpdated: {
    courses: Date | null;
    instructors: Date | null;
    testimonials: Date | null;
    successMetrics: Date | null;
  };
}

// Action types for data management
type DataAction =
  | { type: 'SET_LOADING'; payload: { key: keyof DataState['loading']; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof DataState['errors']; error: string | null } }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_INSTRUCTORS'; payload: Instructor[] }
  | { type: 'SET_TESTIMONIALS'; payload: StudentTestimonial[] }
  | { type: 'SET_SUCCESS_METRICS'; payload: SuccessMetrics }
  | { type: 'UPDATE_COURSE'; payload: Course }
  | { type: 'UPDATE_INSTRUCTOR'; payload: Instructor }
  | { type: 'ADD_COURSE'; payload: Course }
  | { type: 'ADD_INSTRUCTOR'; payload: Instructor }
  | { type: 'ADD_TESTIMONIAL'; payload: StudentTestimonial }
  | { type: 'REMOVE_COURSE'; payload: string }
  | { type: 'REMOVE_INSTRUCTOR'; payload: string }
  | { type: 'INVALIDATE_DATA'; payload: keyof DataState['lastUpdated'] | 'all' }
  | { type: 'RESET_DATA' };

// Initial state
const initialState: DataState = {
  courses: [],
  instructors: [],
  testimonials: [],
  successMetrics: {
    totalStudents: 0,
    averageSalaryIncrease: '0%',
    jobPlacementRate: 0,
    courseCompletionRate: 0,
    averageRating: 0,
    industryPartners: [],
  },
  loading: {
    courses: false,
    instructors: false,
    testimonials: false,
    successMetrics: false,
  },
  errors: {
    courses: null,
    instructors: null,
    testimonials: null,
    successMetrics: null,
  },
  lastUpdated: {
    courses: null,
    instructors: null,
    testimonials: null,
    successMetrics: null,
  },
};

// Data reducer
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.loading,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };

    case 'SET_COURSES':
      return {
        ...state,
        courses: action.payload,
        loading: { ...state.loading, courses: false },
        errors: { ...state.errors, courses: null },
        lastUpdated: { ...state.lastUpdated, courses: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'SET_INSTRUCTORS':
      return {
        ...state,
        instructors: action.payload,
        loading: { ...state.loading, instructors: false },
        errors: { ...state.errors, instructors: null },
        lastUpdated: { ...state.lastUpdated, instructors: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'SET_TESTIMONIALS':
      return {
        ...state,
        testimonials: action.payload,
        loading: { ...state.loading, testimonials: false },
        errors: { ...state.errors, testimonials: null },
        lastUpdated: { ...state.lastUpdated, testimonials: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'SET_SUCCESS_METRICS':
      return {
        ...state,
        successMetrics: action.payload,
        loading: { ...state.loading, successMetrics: false },
        errors: { ...state.errors, successMetrics: null },
        lastUpdated: { ...state.lastUpdated, successMetrics: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.id ? action.payload : course
        ),
        lastUpdated: { ...state.lastUpdated, courses: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'UPDATE_INSTRUCTOR':
      return {
        ...state,
        instructors: state.instructors.map(instructor =>
          instructor.id === action.payload.id ? action.payload : instructor
        ),
        lastUpdated: { ...state.lastUpdated, instructors: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'ADD_COURSE':
      return {
        ...state,
        courses: [...state.courses, action.payload],
        lastUpdated: { ...state.lastUpdated, courses: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'ADD_INSTRUCTOR':
      return {
        ...state,
        instructors: [...state.instructors, action.payload],
        lastUpdated: { ...state.lastUpdated, instructors: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'ADD_TESTIMONIAL':
      return {
        ...state,
        testimonials: [...state.testimonials, action.payload],
        lastUpdated: { ...state.lastUpdated, testimonials: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'REMOVE_COURSE':
      return {
        ...state,
        courses: state.courses.filter(course => course.id !== action.payload),
        lastUpdated: { ...state.lastUpdated, courses: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'REMOVE_INSTRUCTOR':
      return {
        ...state,
        instructors: state.instructors.filter(instructor => instructor.id !== action.payload),
        lastUpdated: { ...state.lastUpdated, instructors: typeof window !== 'undefined' ? new Date() : null },
      };

    case 'INVALIDATE_DATA':
      if (action.payload === 'all') {
        return {
          ...state,
          lastUpdated: {
            courses: null,
            instructors: null,
            testimonials: null,
            successMetrics: null,
          },
        };
      }
      return {
        ...state,
        lastUpdated: {
          ...state.lastUpdated,
          [action.payload]: null,
        },
      };

    case 'RESET_DATA':
      return initialState;

    default:
      return state;
  }
}

// Context interface
interface DataContextType {
  state: DataState;
  actions: {
    loadCourses: () => Promise<void>;
    loadInstructors: () => Promise<void>;
    loadTestimonials: () => Promise<void>;
    loadSuccessMetrics: () => Promise<void>;
    updateCourse: (course: Course) => void;
    updateInstructor: (instructor: Instructor) => void;
    addCourse: (course: Course) => void;
    addInstructor: (instructor: Instructor) => void;
    addTestimonial: (testimonial: StudentTestimonial) => void;
    removeCourse: (courseId: string) => void;
    removeInstructor: (instructorId: string) => void;
    invalidateData: (key: keyof DataState['lastUpdated'] | 'all') => void;
    resetData: () => void;
    refreshData: () => Promise<void>;
  };
  selectors: {
    getCourseById: (id: string) => Course | undefined;
    getCourseBySlug: (slug: string) => Course | undefined;
    getInstructorById: (id: string) => Instructor | undefined;
    getInstructorsByIds: (ids: string[]) => Instructor[];
    getCoursesByInstructorId: (instructorId: string) => Course[];
    getTestimonialsByCourseId: (courseId: string) => StudentTestimonial[];
    isDataStale: (key: keyof DataState['lastUpdated'], maxAge?: number) => boolean;
  };
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Data provider component
export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Load courses
  const loadCourses = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'courses', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'courses', error: null } });
      
      // Simulate network delay for realistic behavior
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const courses = mockDataService.getCourses();
      dispatch({ type: 'SET_COURSES', payload: courses });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load courses';
      dispatch({ type: 'SET_ERROR', payload: { key: 'courses', error: errorMessage } });
      dispatch({ type: 'SET_LOADING', payload: { key: 'courses', loading: false } });
    }
  }, []);

  // Load instructors
  const loadInstructors = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'instructors', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'instructors', error: null } });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const instructors = mockDataService.getInstructors();
      dispatch({ type: 'SET_INSTRUCTORS', payload: instructors });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load instructors';
      dispatch({ type: 'SET_ERROR', payload: { key: 'instructors', error: errorMessage } });
      dispatch({ type: 'SET_LOADING', payload: { key: 'instructors', loading: false } });
    }
  }, []);

  // Load testimonials
  const loadTestimonials = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'testimonials', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'testimonials', error: null } });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const testimonials = mockDataService.getTestimonials();
      dispatch({ type: 'SET_TESTIMONIALS', payload: testimonials });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load testimonials';
      dispatch({ type: 'SET_ERROR', payload: { key: 'testimonials', error: errorMessage } });
      dispatch({ type: 'SET_LOADING', payload: { key: 'testimonials', loading: false } });
    }
  }, []);

  // Load success metrics
  const loadSuccessMetrics = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: 'successMetrics', loading: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: 'successMetrics', error: null } });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const successMetrics = mockDataService.getSuccessMetrics();
      dispatch({ type: 'SET_SUCCESS_METRICS', payload: successMetrics });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load success metrics';
      dispatch({ type: 'SET_ERROR', payload: { key: 'successMetrics', error: errorMessage } });
      dispatch({ type: 'SET_LOADING', payload: { key: 'successMetrics', loading: false } });
    }
  }, []);

  // Update course
  const updateCourse = useCallback((course: Course) => {
    dispatch({ type: 'UPDATE_COURSE', payload: course });
  }, []);

  // Update instructor
  const updateInstructor = useCallback((instructor: Instructor) => {
    dispatch({ type: 'UPDATE_INSTRUCTOR', payload: instructor });
  }, []);

  // Add course
  const addCourse = useCallback((course: Course) => {
    dispatch({ type: 'ADD_COURSE', payload: course });
  }, []);

  // Add instructor
  const addInstructor = useCallback((instructor: Instructor) => {
    dispatch({ type: 'ADD_INSTRUCTOR', payload: instructor });
  }, []);

  // Add testimonial
  const addTestimonial = useCallback((testimonial: StudentTestimonial) => {
    dispatch({ type: 'ADD_TESTIMONIAL', payload: testimonial });
  }, []);

  // Remove course
  const removeCourse = useCallback((courseId: string) => {
    dispatch({ type: 'REMOVE_COURSE', payload: courseId });
  }, []);

  // Remove instructor
  const removeInstructor = useCallback((instructorId: string) => {
    dispatch({ type: 'REMOVE_INSTRUCTOR', payload: instructorId });
  }, []);

  // Invalidate data
  const invalidateData = useCallback((key: keyof DataState['lastUpdated'] | 'all') => {
    dispatch({ type: 'INVALIDATE_DATA', payload: key });
  }, []);

  // Reset data
  const resetData = useCallback(() => {
    dispatch({ type: 'RESET_DATA' });
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadCourses(),
      loadInstructors(),
      loadTestimonials(),
      loadSuccessMetrics(),
    ]);
  }, [loadCourses, loadInstructors, loadTestimonials, loadSuccessMetrics]);

  // Selectors
  const getCourseById = useCallback((id: string) => {
    return state.courses.find(course => course.id === id);
  }, [state.courses]);

  const getCourseBySlug = useCallback((slug: string) => {
    return state.courses.find(course => course.slug === slug);
  }, [state.courses]);

  const getInstructorById = useCallback((id: string) => {
    return state.instructors.find(instructor => instructor.id === id);
  }, [state.instructors]);

  const getInstructorsByIds = useCallback((ids: string[]) => {
    return state.instructors.filter(instructor => ids.includes(instructor.id));
  }, [state.instructors]);

  const getCoursesByInstructorId = useCallback((instructorId: string) => {
    return state.courses.filter(course => course.instructorIds.includes(instructorId));
  }, [state.courses]);

  const getTestimonialsByCourseId = useCallback((courseId: string) => {
    const course = getCourseById(courseId);
    if (!course) return [];
    return state.testimonials.filter(testimonial => 
      testimonial.courseCompleted === course.title
    );
  }, [state.testimonials, getCourseById]);

  const isDataStale = useCallback((key: keyof DataState['lastUpdated'], maxAge: number = CACHE_DURATION) => {
    const lastUpdated = state.lastUpdated[key];
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated.getTime() > maxAge;
  }, [state.lastUpdated, CACHE_DURATION]);

  // Auto-load data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Context value
  const contextValue: DataContextType = {
    state,
    actions: {
      loadCourses,
      loadInstructors,
      loadTestimonials,
      loadSuccessMetrics,
      updateCourse,
      updateInstructor,
      addCourse,
      addInstructor,
      addTestimonial,
      removeCourse,
      removeInstructor,
      invalidateData,
      resetData,
      refreshData,
    },
    selectors: {
      getCourseById,
      getCourseBySlug,
      getInstructorById,
      getInstructorsByIds,
      getCoursesByInstructorId,
      getTestimonialsByCourseId,
      isDataStale,
    },
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

// Hook to use data context
export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Hook for courses data
export function useCourses() {
  const { state, actions, selectors } = useData();
  
  return {
    courses: state.courses,
    loading: state.loading.courses,
    error: state.errors.courses,
    lastUpdated: state.lastUpdated.courses,
    loadCourses: actions.loadCourses,
    getCourseById: selectors.getCourseById,
    getCourseBySlug: selectors.getCourseBySlug,
    updateCourse: actions.updateCourse,
    addCourse: actions.addCourse,
    removeCourse: actions.removeCourse,
    isStale: () => selectors.isDataStale('courses'),
  };
}

// Hook for instructors data
export function useInstructors() {
  const { state, actions, selectors } = useData();
  
  return {
    instructors: state.instructors,
    loading: state.loading.instructors,
    error: state.errors.instructors,
    lastUpdated: state.lastUpdated.instructors,
    loadInstructors: actions.loadInstructors,
    getInstructorById: selectors.getInstructorById,
    getInstructorsByIds: selectors.getInstructorsByIds,
    getCoursesByInstructorId: selectors.getCoursesByInstructorId,
    updateInstructor: actions.updateInstructor,
    addInstructor: actions.addInstructor,
    removeInstructor: actions.removeInstructor,
    isStale: () => selectors.isDataStale('instructors'),
  };
}

// Hook for testimonials data
export function useTestimonials() {
  const { state, actions, selectors } = useData();
  
  return {
    testimonials: state.testimonials,
    loading: state.loading.testimonials,
    error: state.errors.testimonials,
    lastUpdated: state.lastUpdated.testimonials,
    loadTestimonials: actions.loadTestimonials,
    getTestimonialsByCourseId: selectors.getTestimonialsByCourseId,
    addTestimonial: actions.addTestimonial,
    isStale: () => selectors.isDataStale('testimonials'),
  };
}

// Hook for success metrics data
export function useSuccessMetrics() {
  const { state, actions, selectors } = useData();
  
  return {
    successMetrics: state.successMetrics,
    loading: state.loading.successMetrics,
    error: state.errors.successMetrics,
    lastUpdated: state.lastUpdated.successMetrics,
    loadSuccessMetrics: actions.loadSuccessMetrics,
    isStale: () => selectors.isDataStale('successMetrics'),
  };
}