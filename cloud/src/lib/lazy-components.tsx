/**
 * Lazy-loaded components for code splitting optimization
 * 
 * This file provides dynamic imports for heavy components to reduce initial bundle size.
 * Components are loaded on-demand when needed, improving initial page load performance.
 * 
 * Validates: Task 22.4 - Implement code splitting
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import React from 'react';

// Loading component for lazy-loaded components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lesson Editor Components - Heavy components with rich text, drag-and-drop, etc.
export const LazyLessonEditor = dynamic(
  () => import('@/components/LessonEditor').then(mod => ({ default: mod.LessonEditor })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Disable SSR for editor components
  }
);

// Curriculum Builder - Heavy component with drag-and-drop
export const LazyCurriculumBuilder = dynamic(
  () => import('@/components/CurriculumBuilder').then(mod => ({ default: mod.CurriculumBuilder })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Media Manager - Heavy component with file uploads
export const LazyMediaManager = dynamic(
  () => import('@/components/MediaManager').then(mod => ({ default: mod.MediaManager })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

// Course Form - Can be lazy loaded on the create/edit pages
export const LazyCourseForm = dynamic(
  () => import('@/components/CourseForm').then(mod => ({ default: mod.CourseForm })),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
);

/**
 * Utility function to create a lazy-loaded component with custom loading state
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: () => React.ReactElement;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || (() => <LoadingSpinner />),
    ssr: options?.ssr ?? false,
  });
}

/**
 * Preload a lazy component for better UX
 * Call this on hover or when you know the component will be needed soon
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
) {
  importFn().catch(() => {
    // Silently fail if preload fails
  });
}
