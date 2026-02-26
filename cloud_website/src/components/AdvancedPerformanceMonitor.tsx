'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { trackEvent } from '@/lib/analytics';

// Core Web Vitals monitoring with enhanced data collection
export function CoreWebVitalsMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Generate session ID for tracking
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Import web-vitals dynamically
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      const metrics: any[] = [];

      // Largest Contentful Paint
      onLCP((metric) => {
        const metricData = {
          name: 'LCP',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
        };
        
        metrics.push(metricData);
        trackEvent('web_vital_lcp', 'Performance', 'LCP', Math.round(metric.value));
        console.log('LCP:', metric.value, 'Rating:', metric.rating);
        
        // Send to performance API
        sendPerformanceData([metricData], sessionId);
      });

      // First Contentful Paint
      onFCP((metric) => {
        const metricData = {
          name: 'FCP',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
        };
        
        metrics.push(metricData);
        trackEvent('web_vital_fcp', 'Performance', 'FCP', Math.round(metric.value));
        console.log('FCP:', metric.value, 'Rating:', metric.rating);
        
        sendPerformanceData([metricData], sessionId);
      });

      // Cumulative Layout Shift
      onCLS((metric) => {
        const metricData = {
          name: 'CLS',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
        };
        
        metrics.push(metricData);
        trackEvent('web_vital_cls', 'Performance', 'CLS', Math.round(metric.value * 1000));
        console.log('CLS:', metric.value, 'Rating:', metric.rating);
        
        sendPerformanceData([metricData], sessionId);
      });

      // Interaction to Next Paint
      onINP((metric) => {
        const metricData = {
          name: 'INP',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
        };
        
        metrics.push(metricData);
        trackEvent('web_vital_inp', 'Performance', 'INP', Math.round(metric.value));
        console.log('INP:', metric.value, 'Rating:', metric.rating);
        
        sendPerformanceData([metricData], sessionId);
      });

      // Time to First Byte
      onTTFB((metric) => {
        const metricData = {
          name: 'TTFB',
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
        };
        
        metrics.push(metricData);
        trackEvent('web_vital_ttfb', 'Performance', 'TTFB', Math.round(metric.value));
        console.log('TTFB:', metric.value, 'Rating:', metric.rating);
        
        sendPerformanceData([metricData], sessionId);
      });
    });
  }, []);

  return null;
}

// Enhanced performance data sender with rate limiting and error handling
let lastSendTime = 0;
const SEND_THROTTLE_MS = 1000; // Only send once per second
const pendingMetrics: any[] = [];
let sendTimeout: NodeJS.Timeout | null = null;

async function sendPerformanceData(metrics: any[], sessionId: string) {
  try {
    // Add metrics to pending queue
    pendingMetrics.push(...metrics);
    
    // Clear existing timeout
    if (sendTimeout) {
      clearTimeout(sendTimeout);
    }
    
    // Throttle sends to prevent overwhelming the API
    const now = Date.now();
    const timeSinceLastSend = now - lastSendTime;
    
    if (timeSinceLastSend < SEND_THROTTLE_MS) {
      // Schedule a batched send
      sendTimeout = setTimeout(() => {
        sendBatchedMetrics(sessionId);
      }, SEND_THROTTLE_MS - timeSinceLastSend);
      return;
    }
    
    // Send immediately
    await sendBatchedMetrics(sessionId);
  } catch (error) {
    // Silently fail - don't log connection errors
    if (error instanceof Error && !error.message.includes('aborted')) {
      console.warn('Failed to send performance data:', error.message);
    }
  }
}

async function sendBatchedMetrics(sessionId: string) {
  if (pendingMetrics.length === 0) return;
  
  try {
    // Collect additional context
    const connectionInfo = (navigator as any).connection;
    const memoryInfo = (performance as any).memory;
    
    // Calculate bundle size estimate
    const bundleSize = calculateBundleSize();
    
    // Get all pending metrics
    const metricsToSend = [...pendingMetrics];
    pendingMetrics.length = 0; // Clear the queue
    
    const performanceData = {
      metrics: metricsToSend,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now(),
      sessionId,
      connectionType: connectionInfo?.effectiveType || 'unknown',
      deviceMemory: (navigator as any).deviceMemory || undefined,
      bundleSize,
    };

    lastSendTime = Date.now();

    // Send to performance API with timeout and abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    await fetch('/api/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(performanceData),
      signal: controller.signal,
      keepalive: true, // Keep connection alive even if page unloads
    }).finally(() => {
      clearTimeout(timeoutId);
    });
  } catch (error) {
    // Silently handle aborted requests - they're normal when users navigate away
    if (error instanceof Error && error.name !== 'AbortError') {
      console.warn('Failed to send batched metrics:', error.message);
    }
  }
}

// Calculate estimated bundle size
function calculateBundleSize() {
  if (typeof window === 'undefined' || !('performance' in window)) return undefined;

  try {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      totalSize += size;

      if (resource.name.includes('.js')) {
        jsSize += size;
      } else if (resource.name.includes('.css')) {
        cssSize += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) {
        imageSize += size;
      }
    });

    return {
      total: totalSize,
      js: jsSize,
      css: cssSize,
      images: imageSize,
    };
  } catch (error) {
    console.warn('Failed to calculate bundle size:', error);
    return undefined;
  }
}

// Bundle size monitoring
export function BundleSizeMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            // Track page load time
            const loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
            if (loadTime > 0) {
              trackEvent('page_load_time', 'Performance', window.location.pathname, Math.round(loadTime));
            }

            // Track DOM content loaded time
            const domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
            if (domContentLoaded > 0) {
              trackEvent('dom_content_loaded', 'Performance', window.location.pathname, Math.round(domContentLoaded));
            }
          }

          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            const size = resourceEntry.transferSize || 0;
            
            // Track large resources
            if (size > 100 * 1024) { // > 100KB
              trackEvent('large_resource', 'Performance', resourceEntry.name, Math.round(size / 1024));
            }
          }
        });
      });

      observer.observe({ entryTypes: ['navigation', 'resource'] });

      return () => observer.disconnect();
    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }, []);

  return null;
}

// Memory usage monitoring
export function MemoryMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window) || !('memory' in (window.performance as any))) return;

    const checkMemoryUsage = () => {
      const memory = (window.performance as any).memory;
      if (memory) {
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);

        // Track high memory usage
        if (usedMB > 50) { // > 50MB
          trackEvent('high_memory_usage', 'Performance', 'Memory Usage', usedMB);
        }

        console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
      }
    };

    // Check memory usage every 30 seconds
    const interval = setInterval(checkMemoryUsage, 30000);
    
    // Initial check
    checkMemoryUsage();

    return () => clearInterval(interval);
  }, []);

  return null;
}

// Network monitoring
export function NetworkMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('navigator' in window) || !('connection' in navigator)) return;

    const connection = (navigator as any).connection;
    if (connection) {
      const trackNetworkInfo = () => {
        trackEvent('network_info', 'Performance', 'Connection Type', 0);
        
        // Log additional network details
        console.log('Network Info:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
        });
      };

      // Track initial network info
      trackNetworkInfo();

      // Track network changes
      connection.addEventListener('change', trackNetworkInfo);

      return () => connection.removeEventListener('change', trackNetworkInfo);
    }
  }, []);

  return null;
}

// Error monitoring
export function ErrorMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      try {
        trackEvent('javascript_error', 'Error', event.message || 'Unknown error', 0);
        
        // Log additional error details
        const errorDetails = {
          message: event.message || 'Unknown error',
          filename: event.filename || 'Unknown file',
          lineno: event.lineno || 0,
          colno: event.colno || 0,
          stack: event.error?.stack || 'No stack trace',
          timestamp: new Date().toISOString(),
        };
        
        console.error('JavaScript Error:', errorDetails);
      } catch (loggingError) {
        console.error('Failed to log error:', loggingError);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        const reason = event.reason ? String(event.reason) : 'Unknown rejection';
        trackEvent('unhandled_promise_rejection', 'Error', reason, 0);
        
        // Log additional rejection details
        console.error('Unhandled Promise Rejection:', {
          reason: event.reason,
          timestamp: new Date().toISOString(),
        });
      } catch (loggingError) {
        console.error('Failed to log promise rejection:', loggingError);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}

// Main performance monitoring component
export default function AdvancedPerformanceMonitor() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
      <CoreWebVitalsMonitor />
      <BundleSizeMonitor />
      <MemoryMonitor />
      <NetworkMonitor />
      <ErrorMonitor />
    </>
  );
}