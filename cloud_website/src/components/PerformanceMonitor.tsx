'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showInDevelopment?: boolean;
}

/**
 * Performance monitoring component that tracks Core Web Vitals
 * Only shows in development mode unless explicitly enabled
 */
export default function PerformanceMonitor({ 
  enabled = false, 
  showInDevelopment = true 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const shouldShow = enabled || (process.env.NODE_ENV === 'development' && showInDevelopment);
    setIsVisible(shouldShow);

    if (!shouldShow) return;

    // Dynamically import and start monitoring
    const initializeMonitoring = async () => {
      const { performanceMonitor } = await import('@/lib/performance-optimization');
      performanceMonitor.observeWebVitals();

      // Update metrics periodically
      const interval = setInterval(() => {
        const currentMetrics = performanceMonitor.getMetrics();
        setMetrics(currentMetrics);
      }, 1000);

      return interval;
    };

    let intervalId: NodeJS.Timeout;
    initializeMonitoring().then(interval => {
      intervalId = interval;
    });

    // Get navigation timing
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          ttfb: navigation.responseStart - navigation.requestStart,
          fcp: navigation.loadEventEnd - navigation.loadEventStart,
        }));
      }
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [enabled, showInDevelopment]);

  if (!isVisible) return null;

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatMetric = (value: number | undefined, unit = 'ms') => {
    if (value === undefined) return 'N/A';
    return `${value.toFixed(2)}${unit}`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-xs font-mono z-50 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close performance monitor"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        {/* Largest Contentful Paint */}
        <div className="flex justify-between">
          <span>LCP:</span>
          <span className={getScoreColor(metrics.lcp || 0, { good: 2500, poor: 4000 })}>
            {formatMetric(metrics.lcp)}
          </span>
        </div>

        {/* First Input Delay */}
        <div className="flex justify-between">
          <span>FID:</span>
          <span className={getScoreColor(metrics.fid || 0, { good: 100, poor: 300 })}>
            {formatMetric(metrics.fid)}
          </span>
        </div>

        {/* Cumulative Layout Shift */}
        <div className="flex justify-between">
          <span>CLS:</span>
          <span className={getScoreColor(metrics.cls || 0, { good: 0.1, poor: 0.25 })}>
            {formatMetric(metrics.cls, '')}
          </span>
        </div>

        {/* Time to First Byte */}
        <div className="flex justify-between">
          <span>TTFB:</span>
          <span className={getScoreColor(metrics.ttfb || 0, { good: 800, poor: 1800 })}>
            {formatMetric(metrics.ttfb)}
          </span>
        </div>

        {/* First Contentful Paint */}
        <div className="flex justify-between">
          <span>FCP:</span>
          <span className={getScoreColor(metrics.fcp || 0, { good: 1800, poor: 3000 })}>
            {formatMetric(metrics.fcp)}
          </span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Good:</span>
          <span className="text-green-600">●</span>
        </div>
        <div className="flex justify-between">
          <span>Needs Improvement:</span>
          <span className="text-yellow-600">●</span>
        </div>
        <div className="flex justify-between">
          <span>Poor:</span>
          <span className="text-red-600">●</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Bundle size monitor component
 */
export function BundleSizeMonitor({ enabled = false }: { enabled?: boolean }) {
  const [bundleInfo, setBundleInfo] = useState<{
    jsSize: number;
    cssSize: number;
    totalSize: number;
  }>({ jsSize: 0, cssSize: 0, totalSize: 0 });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      let jsSize = 0;
      let cssSize = 0;

      list.getEntries().forEach((entry) => {
        const resource = entry as PerformanceResourceTiming;
        const size = resource.transferSize || 0;

        if (resource.name.includes('.js')) {
          jsSize += size;
        } else if (resource.name.includes('.css')) {
          cssSize += size;
        }
      });

      setBundleInfo(prev => ({
        jsSize: prev.jsSize + jsSize,
        cssSize: prev.cssSize + cssSize,
        totalSize: prev.totalSize + jsSize + cssSize,
      }));
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => observer.disconnect();
  }, [enabled]);

  if (!enabled || process.env.NODE_ENV !== 'development') return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-xs font-mono z-50">
      <h3 className="font-semibold text-gray-800 mb-2">Bundle Size</h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>JavaScript:</span>
          <span>{formatSize(bundleInfo.jsSize)}</span>
        </div>
        <div className="flex justify-between">
          <span>CSS:</span>
          <span>{formatSize(bundleInfo.cssSize)}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>{formatSize(bundleInfo.totalSize)}</span>
        </div>
      </div>
    </div>
  );
}