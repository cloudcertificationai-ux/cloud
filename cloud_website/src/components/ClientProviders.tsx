'use client';

import { useEffect } from 'react';
// import PerformanceMonitor, { BundleSizeMonitor } from '@/components/PerformanceMonitor';
import AdvancedPerformanceMonitor from '@/components/AdvancedPerformanceMonitor';
import PerformanceDashboard from '@/components/PerformanceDashboard';
import ServiceWorkerManager from '@/components/ServiceWorkerManager';
import MobileAccessibilityOptimizer from '@/components/MobileAccessibilityOptimizer';
import { GoogleAnalytics, GoogleTagManager } from '@/components/Analytics';

/**
 * Client-side providers and components wrapper
 * This isolates all client components from the server layout
 */
export default function ClientProviders() {
  // Add global error handler to catch uncaught errors
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      // Silently handle connection abort errors - they're normal
      if (event.message && event.message.includes('aborted')) {
        event.preventDefault();
        return;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Silently handle connection abort errors - they're normal
      if (event.reason && 
          (event.reason.code === 'ECONNRESET' || 
           event.reason.message?.includes('aborted') ||
           event.reason.name === 'AbortError')) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <>
      {/* Performance monitoring components - temporarily disabled */}
      {/* <PerformanceMonitor />
      <BundleSizeMonitor enabled={process.env.NODE_ENV === 'development'} /> */}
      <AdvancedPerformanceMonitor />
      <PerformanceDashboard />
      
      {/* Service Worker Manager */}
      <ServiceWorkerManager />
      
      {/* Mobile and Accessibility Optimizer */}
      <MobileAccessibilityOptimizer 
        enableAccessibilityMonitoring={true}
        enableMobileOptimizations={true}
        showAccessibilityReport={process.env.NODE_ENV === 'development'}
      />
      
      {/* Analytics components */}
      <GoogleAnalytics />
      <GoogleTagManager />
    </>
  );
}