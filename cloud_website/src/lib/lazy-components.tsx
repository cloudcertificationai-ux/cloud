'use client';

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

// Loading component for lazy-loaded components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lesson Player Components - Heavy components with video players, quiz logic, etc.
export const LazyLessonPlayer = dynamic(
  () => import('@/components/LessonPlayer').catch(() => ({
    default: () => <div>Lesson player not available</div>
  })),
  {
    loading: LoadingSpinner,
    ssr: false, // Disable SSR for interactive components
  }
);

// Video Player - Heavy component with video controls and tracking
export const LazyVideoPlayer = dynamic(
  () => import('@/components/VideoPlayer').catch(() => ({
    default: () => <div>Video player not available</div>
  })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

// Progress Tracker - Heavy component with charts and analytics
export const LazyProgressTracker = dynamic(
  () => import('@/components/ProgressTracker').catch(() => ({
    default: () => <div>Progress tracker not available</div>
  })),
  {
    loading: LoadingSpinner,
    ssr: false,
  }
);

// Social Share buttons - Can be lazy loaded
export const LazySocialShare = dynamic(
  () => import('@/components/SocialShare'),
  {
    loading: () => <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />,
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
    loading: options?.loading || LoadingSpinner,
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

/**
 * Preload multiple components in parallel
 */
export function preloadComponents(
  importFns: Array<() => Promise<{ default: ComponentType<any> }>>
) {
  Promise.all(importFns.map(fn => fn())).catch(() => {
    // Silently fail if preload fails
  });
}
