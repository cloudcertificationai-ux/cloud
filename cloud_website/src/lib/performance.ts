/**
 * Performance monitoring and optimization utilities
 * Tracks Core Web Vitals, bundle sizes, and loading performance
 */

// Core Web Vitals tracking
export interface WebVitalsMetric {
  name: 'CLS' | 'INP' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }
}

/**
 * Performance observer for monitoring loading performance
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start monitoring performance metrics
   */
  startMonitoring() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Monitor navigation timing
    this.observeNavigationTiming();
    
    // Monitor resource loading
    this.observeResourceTiming();
    
    // Monitor paint timing
    this.observePaintTiming();
    
    // Monitor layout shifts
    this.observeLayoutShifts();
  }

  private observeNavigationTiming() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          this.reportNavigationMetrics(navEntry);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  private observeResourceTiming() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.reportResourceMetrics(resourceEntry);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  private observePaintTiming() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'paint') {
          this.reportPaintMetrics(entry);
        }
      });
    });

    observer.observe({ entryTypes: ['paint'] });
    this.observers.push(observer);
  }

  private observeLayoutShifts() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          this.reportLayoutShift(entry);
        }
      });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(observer);
  }

  private reportNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.connectEnd - entry.secureConnectionStart,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domParse: entry.domContentLoadedEventStart - entry.responseEnd,
      domReady: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('[Performance] Navigation Metrics:', metrics);
    }

    // Report to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      Object.entries(metrics).forEach(([key, value]) => {
        if (value > 0) {
          window.gtag('event', 'navigation_timing', {
            event_category: 'Performance',
            event_label: key,
            value: Math.round(value),
          });
        }
      });
    }
  }

  private reportResourceMetrics(entry: PerformanceResourceTiming) {
    // Focus on critical resources
    const isCritical = 
      entry.name.includes('.js') || 
      entry.name.includes('.css') || 
      entry.name.includes('font') ||
      entry.name.includes('image');

    if (isCritical) {
      const resourceEntry = entry as PerformanceResourceTiming;
      const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] Resource: ${entry.name} - ${Math.round(loadTime)}ms`);
      }

      // Report slow resources
      if (loadTime > 1000) {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'slow_resource', {
            event_category: 'Performance',
            event_label: entry.name,
            value: Math.round(loadTime),
          });
        }
      }
    }
  }

  private reportPaintMetrics(entry: PerformanceEntry) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${entry.name}: ${Math.round(entry.startTime)}ms`);
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', entry.name.replace('-', '_'), {
        event_category: 'Performance',
        value: Math.round(entry.startTime),
      });
    }
  }

  private reportLayoutShift(entry: PerformanceEntry) {
    const value = (entry as any).value;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] Layout Shift: ${value}`);
    }

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'layout_shift', {
        event_category: 'Performance',
        value: Math.round(value * 1000),
      });
    }
  }

  /**
   * Stop all performance monitoring
   */
  stopMonitoring() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Image loading performance utilities
 */
export const imagePerformance = {
  /**
   * Preload critical images
   */
  preloadCriticalImages(urls: string[]) {
    if (typeof window === 'undefined') return;

    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  },

  /**
   * Lazy load images with Intersection Observer
   */
  setupLazyLoading() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          
          if (src) {
            img.src = src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01,
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  },

  /**
   * Monitor image loading performance
   */
  monitorImageLoading() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          const resourceEntry = entry as PerformanceResourceTiming;
          const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Image Performance] ${entry.name}: ${Math.round(loadTime)}ms`);
          }

          // Report slow image loading
          if (loadTime > 2000) {
            if (window.gtag) {
              window.gtag('event', 'slow_image_load', {
                event_category: 'Performance',
                event_label: entry.name,
                value: Math.round(loadTime),
              });
            }
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  },
};

/**
 * Bundle size monitoring
 */
export const bundleMonitoring = {
  /**
   * Track bundle loading performance
   */
  trackBundleLoading() {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('/_next/static/chunks/')) {
          const resourceEntry = entry as PerformanceResourceTiming;
          const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;
          const size = resourceEntry.transferSize;
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Bundle] ${entry.name}: ${Math.round(loadTime)}ms, ${Math.round(size / 1024)}KB`);
          }

          // Report large bundles
          if (size > 100 * 1024) { // > 100KB
            if (window.gtag) {
              window.gtag('event', 'large_bundle', {
                event_category: 'Performance',
                event_label: entry.name,
                value: Math.round(size / 1024),
              });
            }
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  },
};

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Start general performance monitoring
  const monitor = PerformanceMonitor.getInstance();
  monitor.startMonitoring();

  // Setup image performance monitoring
  imagePerformance.monitorImageLoading();
  imagePerformance.setupLazyLoading();

  // Setup bundle monitoring
  bundleMonitoring.trackBundleLoading();

  // Preload critical images
  imagePerformance.preloadCriticalImages([
    '/og-homepage.jpg',
    '/logo.png',
  ]);
}

// Global type declarations
declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
  }
}