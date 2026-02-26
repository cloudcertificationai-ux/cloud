'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useLazyLoading, useProgressiveImage, usePerformanceMonitor } from '@/hooks/useLazyLoading';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showLoadingPlaceholder?: boolean;
  lazyLoad?: boolean;
  preloadOnHover?: boolean;
  performanceMonitoring?: boolean;
}

const DEFAULT_BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";

/**
 * OptimizedImage component with enhanced lazy loading, error handling, and performance optimizations
 * 
 * Features:
 * - Intersection Observer-based lazy loading
 * - Progressive image loading with blur placeholder
 * - Error handling with fallback images
 * - Performance monitoring in development
 * - Preloading on hover for better UX
 * - Optimized sizes for responsive images
 */
export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  showLoadingPlaceholder = true,
  lazyLoad = true,
  preloadOnHover = false,
  performanceMonitoring = false,
  priority = false,
  loading,
  placeholder = 'blur',
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  sizes,
  className = '',
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad || priority);
  
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Lazy loading with intersection observer
  const { elementRef, isIntersecting } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '50px',
    triggerOnce: true,
  });

  // Progressive image loading
  const { src: progressiveSrc, isLoading: progressiveLoading, hasError: progressiveError } = 
    useProgressiveImage(shouldLoad ? (imageSrc as string) : '', blurDataURL);

  // Performance monitoring
  const { measureOperation } = usePerformanceMonitor(
    performanceMonitoring ? `OptimizedImage-${alt}` : ''
  );

  // Update loading state based on intersection
  useEffect(() => {
    if (lazyLoad && isIntersecting && !shouldLoad) {
      measureOperation('lazy-load-trigger', () => {
        setShouldLoad(true);
      });
    }
  }, [isIntersecting, lazyLoad, shouldLoad, measureOperation]);

  // Update loading states
  useEffect(() => {
    setIsLoading(progressiveLoading);
    setHasError(progressiveError);
  }, [progressiveLoading, progressiveError]);

  const handleLoad = () => {
    measureOperation('image-load-complete', () => {
      setIsLoading(false);
      setHasError(false);
    });
  };

  const handleError = () => {
    measureOperation('image-load-error', () => {
      setIsLoading(false);
      setHasError(true);
      if (fallbackSrc && imageSrc !== fallbackSrc) {
        setImageSrc(fallbackSrc);
      }
    });
  };

  const handleMouseEnter = () => {
    if (preloadOnHover && !shouldLoad) {
      // Preload the image on hover for better UX
      const img = document.createElement('img');
      img.src = src as string;
    }
  };

  // Determine loading strategy
  const imageLoading = loading || (priority ? 'eager' : 'lazy');

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || 
    (props.fill 
      ? '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
      : undefined
    );

  // Combine refs for lazy loading
  useEffect(() => {
    if (imageRef.current && elementRef.current !== imageRef.current) {
      (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = imageRef.current;
    }
  }, [elementRef]);

  return (
    <div 
      ref={imageRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {shouldLoad ? (
        <Image
          {...props}
          src={progressiveSrc || imageSrc}
          alt={alt}
          priority={priority}
          loading={imageLoading}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes={responsiveSizes}
          className={`transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } ${className || ''}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        // Placeholder while waiting for intersection
        <div 
          className={`bg-gray-200 ${className || ''}`}
          style={{ 
            width: props.width, 
            height: props.height,
            aspectRatio: props.width && props.height ? `${props.width}/${props.height}` : undefined
          }}
        />
      )}
      
      {/* Loading placeholder */}
      {showLoadingPlaceholder && isLoading && shouldLoad && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Utility function to generate optimized image sizes for different use cases
 */
export const getImageSizes = {
  // For course thumbnails in grid layouts
  courseCard: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
  
  // For instructor profile images
  instructorProfile: '(max-width: 640px) 80px, (max-width: 768px) 100px, 120px',
  
  // For hero images and large displays
  hero: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  
  // For small icons and logos
  icon: '(max-width: 640px) 60px, 80px',
  
  // For partner logos
  partnerLogo: '(max-width: 640px) 80px, (max-width: 768px) 100px, 120px',
};

/**
 * Preload critical images for better performance
 */
export const preloadImage = (src: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  }
};