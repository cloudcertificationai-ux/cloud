import dynamic from 'next/dynamic';
import { ComponentType, ReactElement } from 'react';

/**
 * Dynamic import utilities for code splitting and performance optimization
 * These utilities help reduce initial bundle size by loading components only when needed
 */

// Course-related dynamic imports
export const DynamicCourseCard = dynamic(
  () => import('@/app/courses/components/CourseCard'),
  {
    loading: () => (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-6 space-y-3">
          <div className="h-6 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ),
    ssr: true, // Enable SSR for SEO
  }
);

export const DynamicCourseFilters = dynamic(
  () => import('@/app/courses/components/CourseFilters'),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="h-6 bg-gray-200 rounded w-20 mb-4 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false, // Filters can be client-side only
  }
);

export const DynamicAdvancedFilters = dynamic(
  () => import('@/app/courses/components/AdvancedFilters'),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Course detail page dynamic imports
export const DynamicEnrollmentModal = dynamic(
  () => import('@/app/courses/[slug]/components/EnrollmentModal'),
  {
    loading: () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ),
    ssr: false, // Modal is client-side only
  }
);

export const DynamicCourseReviews = dynamic(
  () => import('@/app/courses/[slug]/components/CourseReviews'),
  {
    loading: () => (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        ))}
      </div>
    ),
    ssr: true, // Reviews are important for SEO
  }
);

export const DynamicCourseCurriculum = dynamic(
  () => import('@/app/courses/[slug]/components/CourseCurriculum'),
  {
    loading: () => (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-center justify-between mb-3">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        ))}
      </div>
    ),
    ssr: true, // Curriculum is important for SEO
  }
);

// Search and interactive components
export const DynamicSearchBar = dynamic(
  () => import('@/components/SearchBar'),
  {
    loading: () => (
      <div className="relative">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    ),
    ssr: false, // Search is interactive, client-side only
  }
);

// Analytics and tracking (client-side only)
export const DynamicAnalytics = dynamic(
  () => Promise.resolve({ default: () => null }), // Placeholder for analytics
  {
    ssr: false,
    loading: () => null, // No loading state needed for analytics
  }
);

// Heavy third-party components (placeholder for future use)
export const DynamicChartComponent = dynamic(
  () => Promise.resolve({ 
    default: () => (
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Chart component placeholder</div>
      </div>
    )
  }),
  {
    loading: () => (
      <div className="h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading chart...</div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * Utility function to create dynamic imports with consistent loading states
 */
export function createDynamicImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    loading?: () => ReactElement;
    ssr?: boolean;
    loadingHeight?: string;
    loadingText?: string;
  } = {}
) {
  const {
    loading: LoadingComponent,
    ssr = true,
    loadingHeight = 'h-32',
    loadingText = 'Loading...'
  } = options;

  const defaultLoading = () => (
    <div className={`bg-gray-200 rounded-lg animate-pulse flex items-center justify-center ${loadingHeight}`}>
      <div className="text-gray-500">{loadingText}</div>
    </div>
  );

  return dynamic(importFn, {
    loading: LoadingComponent || defaultLoading,
    ssr,
  });
}

/**
 * Preload critical components for better performance
 */
export function preloadCriticalComponents() {
  if (typeof window !== 'undefined') {
    // Preload components that are likely to be needed soon
    import('@/app/courses/components/CourseCard');
    import('@/components/SearchBar');
  }
}

// Heavy components that should be code-split
export const DynamicTestimonialsSection = dynamic(
  () => import('@/components/TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })),
  {
    loading: () => (
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
    ),
    ssr: true, // Important for SEO
  }
);

export const DynamicMegaMenu = dynamic(
  () => import('@/components/MegaMenu'),
  {
    loading: () => (
      <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-40"></div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: false, // Interactive component, client-side only
  }
);

export const DynamicTrustIndicators = dynamic(
  () => import('@/components/TrustIndicators'),
  {
    loading: () => (
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    ssr: true, // Important for trust signals
  }
);

export const DynamicEnterpriseSolutions = dynamic(
  () => import('@/components/EnterpriseSolutions'),
  {
    loading: () => (
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
    ),
    ssr: true, // Important for business content
  }
);

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  // Lazy load heavy libraries only when needed
  loadChartLibrary: () => Promise.resolve(null), // Placeholder for recharts
  loadDateLibrary: () => Promise.resolve(null), // Placeholder for date-fns
  loadValidationLibrary: () => import('zod').catch(() => null),
  loadAnimationLibrary: () => Promise.resolve(null), // Placeholder for framer-motion
  
  // Preload critical paths based on user navigation
  preloadHomePage: () => {
    if (typeof window !== 'undefined') {
      // Preload critical homepage components
      import('@/app/page');
      import('@/components/HeroSection');
      import('@/components/TrustIndicators');
    }
  },
  
  preloadCoursesPage: () => {
    if (typeof window !== 'undefined') {
      import('@/app/courses/page');
      import('@/app/courses/components/CourseCard');
      import('@/app/courses/components/CourseFilters');
      import('@/app/courses/components/CourseGrid');
    }
  },

  preloadCourseDetailPage: () => {
    if (typeof window !== 'undefined') {
      import('@/app/courses/[slug]/components/CourseContent');
      import('@/app/courses/[slug]/components/CourseInstructors');
      import('@/app/courses/[slug]/components/StickyEnrollment');
    }
  },

  preloadBusinessPage: () => {
    if (typeof window !== 'undefined') {
      import('@/app/for-business/page');
      import('@/components/EnterpriseSolutions');
      import('@/components/EnterpriseContactForm');
    }
  },
};

/**
 * Performance monitoring and optimization
 */
export const performanceOptimization = {
  // Intersection Observer for lazy loading components
  createIntersectionObserver: (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      return new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options,
      });
    }
    return null;
  },

  // Prefetch resources on hover
  prefetchOnHover: (href: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }
  },

  // Preload critical images
  preloadCriticalImages: () => {
    if (typeof window !== 'undefined') {
      const criticalImages = [
        '/logo.png',
        '/og-homepage.jpg',
        '/partners/google-logo.svg',
        '/partners/microsoft-logo.svg',
        '/partners/amazon-logo.svg',
      ];
      
      criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    }
  },

  // Bundle size monitoring
  logBundleSize: () => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Monitor performance in development
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Bundle load time:', navEntry.loadEventEnd - navEntry.loadEventStart);
          }
        });
      });
      observer.observe({ entryTypes: ['navigation'] });
    }
  },
};