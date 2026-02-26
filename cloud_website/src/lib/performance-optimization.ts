/**
 * Performance optimization utilities for the Simplilearn-inspired redesign
 * Implements code splitting, lazy loading, and bundle optimization strategies
 */

import { ComponentType, lazy, Suspense, ReactNode, createElement } from 'react';

/**
 * Resource preloading utilities
 */
export const resourcePreloader = {
  // Preload critical CSS
  preloadCSS: (href: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    }
  },

  // Preload JavaScript modules
  preloadJS: (href: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = href;
      document.head.appendChild(link);
    }
  },

  // Preload fonts
  preloadFont: (href: string, type = 'font/woff2') => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = type;
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  },

  // Prefetch next page resources on hover
  prefetchOnHover: (href: string) => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }
  },
};

/**
 * Lazy loading utilities with intersection observer
 */
export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private loadedElements = new Set<Element>();

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '50px',
          threshold: 0.1,
          ...options,
        }
      );
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !this.loadedElements.has(entry.target)) {
        this.loadedElements.add(entry.target);
        
        // Trigger lazy loading based on data attributes
        const element = entry.target as HTMLElement;
        
        if (element.dataset.lazySrc) {
          this.loadImage(element as HTMLImageElement);
        }
        
        if (element.dataset.lazyComponent) {
          this.loadComponent(element);
        }

        this.observer?.unobserve(entry.target);
      }
    });
  }

  private loadImage(img: HTMLImageElement) {
    const src = img.dataset.lazySrc;
    if (src) {
      img.src = src;
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
    }
  }

  private loadComponent(element: HTMLElement) {
    const componentName = element.dataset.lazyComponent;
    if (componentName) {
      // Trigger component loading event
      element.dispatchEvent(new CustomEvent('lazyload', { detail: { componentName } }));
    }
  }

  observe(element: Element) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

/**
 * Bundle splitting utilities
 */
export const bundleSplitter = {
  // Create lazy-loaded component with error boundary
  createLazyComponent: <T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: ReactNode,
    errorFallback?: ReactNode
  ) => {
    const LazyComponent = lazy(importFn);
    
    return (props: any) => {
      const defaultFallback = createElement('div', {
        className: 'animate-pulse bg-gray-200 h-32 rounded'
      });

      return createElement(
        Suspense,
        { fallback: fallback || defaultFallback },
        createElement(LazyComponent, props)
      );
    };
  },

  // Split vendor libraries
  loadVendorLibrary: async (libraryName: string) => {
    const libraries: Record<string, () => Promise<any>> = {
      'chart': () => Promise.resolve(null), // Placeholder for recharts
      'date': () => Promise.resolve(null), // Placeholder for date-fns
      'animation': () => Promise.resolve(null), // Placeholder for framer-motion
      'validation': () => import('zod').catch(() => null),
      'icons': () => import('@heroicons/react/24/outline'),
    };

    try {
      const library = libraries[libraryName];
      return library ? await library() : null;
    } catch (error) {
      console.warn(`Failed to load library: ${libraryName}`, error);
      return null;
    }
  },
};

/**
 * Image optimization utilities
 */
export const imageOptimizer = {
  // Generate responsive image sizes
  generateSizes: (breakpoints: { [key: string]: string }) => {
    return Object.entries(breakpoints)
      .map(([breakpoint, size]) => `(max-width: ${breakpoint}) ${size}`)
      .join(', ');
  },

  // Preload critical images
  preloadCriticalImages: (images: string[]) => {
    if (typeof window !== 'undefined') {
      images.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    }
  },

  // Create blur placeholder
  createBlurPlaceholder: (width: number, height: number) => {
    if (typeof document === 'undefined') return '';
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL();
  },
};

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private metrics: { [key: string]: number } = {};

  startTiming(label: string) {
    this.metrics[`${label}_start`] = performance.now();
  }

  endTiming(label: string) {
    const startTime = this.metrics[`${label}_start`];
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics[label] = duration;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance: ${label} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  }

  getMetrics() {
    return { ...this.metrics };
  }

  // Monitor Core Web Vitals
  observeWebVitals() {
    if (typeof window !== 'undefined') {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const firstInput = entryList.getEntries()[0] as any;
        if (firstInput && firstInput.processingStart) {
          this.metrics.fid = firstInput.processingStart - firstInput.startTime;
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.metrics.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
}

/**
 * Code splitting strategies
 */
export const codeSplitting = {
  // Route-based splitting
  splitByRoute: {
    homepage: () => import('@/app/page'),
    courses: () => import('@/app/courses/page'),
    courseDetail: () => import('@/app/courses/[slug]/page'),
    business: () => import('@/app/for-business/page'),
    about: () => import('@/app/about/page'),
    contact: () => import('@/app/contact/page'),
  },

  // Feature-based splitting
  splitByFeature: {
    testimonials: () => import('@/components/TestimonialsSection'),
    megaMenu: () => import('@/components/MegaMenu'),
    trustIndicators: () => import('@/components/TrustIndicators'),
    enterpriseSolutions: () => import('@/components/EnterpriseSolutions'),
    courseFilters: () => import('@/app/courses/components/CourseFilters'),
    enrollmentModal: () => import('@/app/courses/[slug]/components/EnrollmentModal'),
  },

  // Vendor library splitting
  splitVendors: {
    ui: () => import('@headlessui/react'),
    icons: () => import('@heroicons/react/24/outline'),
    analytics: () => import('@vercel/analytics'),
  },
};

/**
 * Cache optimization
 */
export const cacheOptimizer = {
  // Service worker cache strategies
  cacheStrategies: {
    // Cache first for static assets
    cacheFirst: (request: Request) => {
      return caches.match(request).then(response => {
        return response || fetch(request);
      });
    },

    // Network first for dynamic content
    networkFirst: (request: Request) => {
      return fetch(request).catch(() => {
        return caches.match(request);
      });
    },

    // Stale while revalidate for API responses
    staleWhileRevalidate: (request: Request) => {
      const fetchPromise = fetch(request).then(response => {
        const responseClone = response.clone();
        caches.open('api-cache').then(cache => {
          cache.put(request, responseClone);
        });
        return response;
      });

      return caches.match(request).then(response => {
        return response || fetchPromise;
      });
    },
  },

  // Memory cache for component data
  memoryCache: new Map<string, { data: any; timestamp: number; ttl: number }>(),

  set(key: string, data: any, ttl = 300000) { // 5 minutes default
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  },

  get(key: string) {
    const cached = this.memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.memoryCache.delete(key);
    return null;
  },

  clear() {
    this.memoryCache.clear();
  },
};

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Global lazy loader instance
export const lazyLoader = new LazyLoader();

// Initialize performance monitoring in browser
if (typeof window !== 'undefined') {
  performanceMonitor.observeWebVitals();
}