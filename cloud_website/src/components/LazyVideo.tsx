'use client';

import { useRef, useEffect, useState } from 'react';
import { useLazyLoading } from '@/hooks/useLazyLoading';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
  fallbackMessage?: string;
  lazyLoad?: boolean;
  preloadOnHover?: boolean;
  streamingOptimized?: boolean;
}

/**
 * LazyVideo component with optimized loading and streaming support
 * 
 * Features:
 * - Intersection Observer-based lazy loading
 * - Preloading on hover for better UX
 * - Streaming optimization with proper buffering
 * - Error handling with fallback messages
 * - Poster image support
 * - Responsive video sizing
 */
export default function LazyVideo({
  src,
  poster,
  fallbackMessage = 'Video unavailable',
  lazyLoad = true,
  preloadOnHover = false,
  streamingOptimized = true,
  className = '',
  controls = true,
  playsInline = true,
  ...props
}: LazyVideoProps) {
  const [shouldLoad, setShouldLoad] = useState(!lazyLoad);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lazy loading with intersection observer
  const { elementRef, isIntersecting } = useLazyLoading({
    threshold: 0.1,
    rootMargin: '100px', // Load videos slightly before they come into view
    triggerOnce: true,
  });

  // Update loading state based on intersection
  useEffect(() => {
    if (lazyLoad && isIntersecting && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [isIntersecting, lazyLoad, shouldLoad]);

  // Combine refs
  useEffect(() => {
    if (containerRef.current && elementRef.current !== containerRef.current) {
      (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = containerRef.current;
    }
  }, [elementRef]);

  // Handle video events for streaming optimization
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamingOptimized) return;

    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleError = () => {
      setHasError(true);
      setIsBuffering(false);
    };

    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [streamingOptimized, shouldLoad]);

  const handleMouseEnter = () => {
    if (preloadOnHover && !shouldLoad) {
      // Preload the video metadata on hover
      setShouldLoad(true);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {shouldLoad ? (
        <>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls={controls}
            playsInline={playsInline}
            className={`w-full h-full ${className}`}
            preload={streamingOptimized ? 'metadata' : 'auto'}
            {...props}
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Buffering indicator */}
          {isBuffering && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-white text-sm">Loading...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white p-4">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-sm">{fallbackMessage}</p>
              </div>
            </div>
          )}
        </>
      ) : (
        // Placeholder with poster image
        <div 
          className={`bg-gray-900 flex items-center justify-center ${className}`}
          style={{ 
            aspectRatio: '16/9',
            backgroundImage: poster ? `url(${poster})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!poster && (
            <div className="text-white">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Utility function to generate video streaming URLs with quality options
 */
export const getVideoStreamingUrl = (baseUrl: string, quality: 'low' | 'medium' | 'high' | 'auto' = 'auto') => {
  // This would integrate with your CDN's video streaming service
  // For now, return the base URL
  return baseUrl;
};

/**
 * Preload video metadata for faster playback
 */
export const preloadVideo = (src: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = src;
    document.head.appendChild(link);
  }
};
