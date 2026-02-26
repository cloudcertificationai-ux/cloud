'use client';

import { useState, useEffect } from 'react';
import { ChartBarIcon, ClockIcon, CpuChipIcon, SignalIcon } from '@heroicons/react/24/outline';

interface PerformanceMetrics {
  lcp: number;
  fcp: number;
  cls: number;
  ttfb: number;
  loadTime: number;
  memoryUsage: number;
  networkType: string;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fcp: 0,
    cls: 0,
    ttfb: 0,
    loadTime: 0,
    memoryUsage: 0,
    networkType: 'unknown',
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const showDashboard = process.env.NODE_ENV === 'development' || 
                         localStorage.getItem('show-performance-dashboard') === 'true';
    setIsVisible(showDashboard);

    if (!showDashboard) return;

    // Collect performance metrics
    const collectMetrics = () => {
      if (typeof window === 'undefined') return;

      // Get navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(prev => ({
          ...prev,
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          ttfb: navigation.responseStart - navigation.requestStart,
        }));
      }

      // Get memory info (Chrome only)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: Math.round(memory.usedJSHeapSize / 1048576), // Convert to MB
        }));
      }

      // Get network info
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setMetrics(prev => ({
          ...prev,
          networkType: connection.effectiveType || 'unknown',
        }));
      }
    };

    // Collect Web Vitals
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB }) => {
      onLCP((metric) => {
        setMetrics(prev => ({ ...prev, lcp: metric.value }));
      });

      onFCP((metric) => {
        setMetrics(prev => ({ ...prev, fcp: metric.value }));
      });

      onCLS((metric) => {
        setMetrics(prev => ({ ...prev, cls: metric.value }));
      });

      onTTFB((metric) => {
        setMetrics(prev => ({ ...prev, ttfb: metric.value }));
      });
    });

    collectMetrics();

    // Update metrics every 5 seconds
    const interval = setInterval(collectMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center">
          <ChartBarIcon className="h-4 w-4 mr-1" />
          Performance
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {/* Core Web Vitals */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}>
              {formatTime(metrics.lcp)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={getScoreColor(metrics.fcp, { good: 1800, poor: 3000 })}>
              {formatTime(metrics.fcp)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={getScoreColor(metrics.cls * 1000, { good: 100, poor: 250 })}>
              {metrics.cls.toFixed(3)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>TTFB:</span>
            <span className={getScoreColor(metrics.ttfb, { good: 800, poor: 1800 })}>
              {formatTime(metrics.ttfb)}
            </span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Additional Metrics */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" />
              Load Time:
            </span>
            <span className={getScoreColor(metrics.loadTime, { good: 3000, poor: 5000 })}>
              {formatTime(metrics.loadTime)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <CpuChipIcon className="h-3 w-3 mr-1" />
              Memory:
            </span>
            <span className={getScoreColor(metrics.memoryUsage, { good: 50, poor: 100 })}>
              {metrics.memoryUsage}MB
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <SignalIcon className="h-3 w-3 mr-1" />
              Network:
            </span>
            <span className="text-gray-600">
              {metrics.networkType}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Dev Mode • Real-time metrics
        </div>
      </div>
    </div>
  );
}