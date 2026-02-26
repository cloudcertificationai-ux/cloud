'use client';

import { ReactNode, Suspense } from 'react';
import { useLazyLoading, usePerformanceMonitor } from '@/hooks/useLazyLoading';

interface LazySectionProps {
  children: ReactNode;
  fallback?: ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  minHeight?: string;
  performanceMonitoring?: boolean;
  sectionName?: string;
}

/**
 * LazySection component for lazy loading heavy content sections
 * Uses Intersection Observer to load content only when it comes into view
 */
export default function LazySection({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '100px',
  className = '',
  minHeight = 'min-h-[200px]',
  performanceMonitoring = false,
  sectionName = 'LazySection',
}: LazySectionProps) {
  const { elementRef, isIntersecting } = useLazyLoading({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const { measureOperation } = usePerformanceMonitor(
    performanceMonitoring ? sectionName : ''
  );

  const defaultFallback = (
    <div className={`${minHeight} bg-gray-50 animate-pulse flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-500 text-sm">Loading content...</p>
      </div>
    </div>
  );

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className={className}>
      {isIntersecting ? (
        <Suspense fallback={fallback || defaultFallback}>
          {performanceMonitoring ? (
            <div>
              {measureOperation('section-render', () => children)}
            </div>
          ) : (
            children
          )}
        </Suspense>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
}

/**
 * Specialized lazy section for testimonials
 */
export function LazyTestimonialsSection({ children, ...props }: Omit<LazySectionProps, 'fallback' | 'sectionName'>) {
  const testimonialsFallback = (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm animate-pulse">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <LazySection
      {...props}
      fallback={testimonialsFallback}
      sectionName="TestimonialsSection"
      performanceMonitoring={true}
    >
      {children}
    </LazySection>
  );
}

/**
 * Specialized lazy section for course grids
 */
export function LazyCourseGrid({ children, ...props }: Omit<LazySectionProps, 'fallback' | 'sectionName'>) {
  const courseGridFallback = (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6 space-y-3">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <LazySection
      {...props}
      fallback={courseGridFallback}
      sectionName="CourseGrid"
      performanceMonitoring={true}
    >
      {children}
    </LazySection>
  );
}

/**
 * Specialized lazy section for enterprise solutions
 */
export function LazyEnterpriseSolutions({ children, ...props }: Omit<LazySectionProps, 'fallback' | 'sectionName'>) {
  const enterpriseFallback = (
    <div className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
              <div className="h-12 w-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <LazySection
      {...props}
      fallback={enterpriseFallback}
      sectionName="EnterpriseSolutions"
      performanceMonitoring={true}
    >
      {children}
    </LazySection>
  );
}