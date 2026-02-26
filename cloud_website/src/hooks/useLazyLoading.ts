'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook for lazy loading components and content
 * Uses Intersection Observer to detect when elements come into view
 */
export function useLazyLoading(options: UseLazyLoadingOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || (triggerOnce && hasTriggered)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            setHasTriggered(true);
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return {
    elementRef,
    isIntersecting: triggerOnce ? hasTriggered : isIntersecting,
    hasTriggered,
  };
}

/**
 * Hook for preloading resources on hover
 */
export function usePreloadOnHover() {
  const preloadedUrls = useRef(new Set<string>());

  const preloadResource = useCallback((url: string, type: 'page' | 'image' | 'script' = 'page') => {
    if (preloadedUrls.current.has(url)) return;

    preloadedUrls.current.add(url);

    const link = document.createElement('link');
    
    switch (type) {
      case 'page':
        link.rel = 'prefetch';
        break;
      case 'image':
        link.rel = 'preload';
        link.as = 'image';
        break;
      case 'script':
        link.rel = 'modulepreload';
        break;
    }
    
    link.href = url;
    document.head.appendChild(link);
  }, []);

  const handleMouseEnter = useCallback((url: string, type?: 'page' | 'image' | 'script') => {
    return () => preloadResource(url, type);
  }, [preloadResource]);

  return { preloadResource, handleMouseEnter };
}

/**
 * Hook for progressive image loading
 */
export function useProgressiveImage(src: string, placeholder?: string) {
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return {
    src: currentSrc,
    isLoading,
    hasError,
  };
}

/**
 * Hook for component performance monitoring
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - renderStartTime.current;
    setRenderTime(duration);

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
    }
  });

  const measureOperation = useCallback((operationName: string, operation: () => void) => {
    const startTime = performance.now();
    operation();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} - ${operationName}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }, [componentName]);

  return {
    renderTime,
    measureOperation,
  };
}

/**
 * Hook for bundle size monitoring
 */
export function useBundleMonitor() {
  const [bundleSize, setBundleSize] = useState<number>(0);
  const [loadTime, setLoadTime] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        setLoadTime(navigation.loadEventEnd - navigation.loadEventStart);
      }

      // Monitor resource loading
      const observer = new PerformanceObserver((list) => {
        let totalSize = 0;
        
        list.getEntries().forEach((entry) => {
          if (entry.name.includes('.js') || entry.name.includes('.css')) {
            totalSize += (entry as any).transferSize || 0;
          }
        });
        
        setBundleSize(prev => prev + totalSize);
      });

      observer.observe({ entryTypes: ['resource'] });

      return () => observer.disconnect();
    }
  }, []);

  return {
    bundleSize,
    loadTime,
  };
}