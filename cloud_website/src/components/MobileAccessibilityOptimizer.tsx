'use client';

import { useEffect, useState } from 'react';
import { 
  initializeMobileOptimizations, 
  MobileUtils, 
  DEFAULT_MOBILE_CONFIG 
} from '@/lib/mobile-optimization';
import { 
  AccessibilityMonitor, 
  AccessibilityReport, 
  AccessibilityIssue,
  runAccessibilityAudit 
} from '@/lib/accessibility-testing';

interface MobileAccessibilityOptimizerProps {
  enableAccessibilityMonitoring?: boolean;
  enableMobileOptimizations?: boolean;
  showAccessibilityReport?: boolean;
  onAccessibilityIssue?: (issue: AccessibilityIssue) => void;
}

export default function MobileAccessibilityOptimizer({
  enableAccessibilityMonitoring = true,
  enableMobileOptimizations = true,
  showAccessibilityReport = false,
  onAccessibilityIssue,
}: MobileAccessibilityOptimizerProps) {
  const [accessibilityReport, setAccessibilityReport] = useState<AccessibilityReport | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<{
    isMobile: boolean;
    isTablet: boolean;
    isTouch: boolean;
    connection: any;
    viewport: { width: number; height: number };
  } | null>(null);
  const [accessibilityMonitor, setAccessibilityMonitor] = useState<AccessibilityMonitor | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Initialize mobile optimizations
    if (enableMobileOptimizations) {
      initializeMobileOptimizations(DEFAULT_MOBILE_CONFIG);
    }

    // Collect device information
    setDeviceInfo({
      isMobile: MobileUtils.isMobileDevice(),
      isTablet: MobileUtils.isTabletDevice(),
      isTouch: MobileUtils.isTouchDevice(),
      connection: MobileUtils.getConnectionInfo(),
      viewport: MobileUtils.getViewportSize(),
    });

    // Initialize accessibility monitoring
    if (enableAccessibilityMonitoring) {
      try {
        const monitor = new AccessibilityMonitor((issue) => {
          console.warn('Accessibility issue detected:', issue);
          onAccessibilityIssue?.(issue);
        });

        monitor.start();
        setAccessibilityMonitor(monitor);

        // Run initial accessibility audit with error handling
        try {
          const initialReport = runAccessibilityAudit();
          setAccessibilityReport(initialReport);

          // Log accessibility score
          console.log(`Accessibility Score: ${initialReport.score}/100`, {
            critical: initialReport.summary.critical,
            serious: initialReport.summary.serious,
            moderate: initialReport.summary.moderate,
            minor: initialReport.summary.minor,
          });
        } catch (auditError) {
          console.warn('Failed to run accessibility audit:', auditError);
        }

        return () => {
          monitor.stop();
        };
      } catch (monitorError) {
        console.warn('Failed to initialize accessibility monitor:', monitorError);
      }
    }
  }, [isClient, enableAccessibilityMonitoring, enableMobileOptimizations, onAccessibilityIssue]);

  // Handle viewport changes
  useEffect(() => {
    if (!isClient || !deviceInfo) return;

    const handleResize = () => {
      setDeviceInfo(prev => prev ? {
        ...prev,
        viewport: MobileUtils.getViewportSize(),
      } : null);
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        handleResize();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [isClient, deviceInfo]);

  // Periodic accessibility checks
  useEffect(() => {
    if (!isClient || !enableAccessibilityMonitoring) return;

    const interval = setInterval(() => {
      try {
        const report = runAccessibilityAudit();
        setAccessibilityReport(report);
      } catch (error) {
        console.warn('Failed to run periodic accessibility audit:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isClient, enableAccessibilityMonitoring]);

  // Don't render anything until we're on the client
  if (!isClient) {
    return null;
  }

  // Don't render anything in production unless explicitly requested
  if (!showAccessibilityReport && process.env.NODE_ENV === 'production') {
    return (
      <>
        {/* Accessibility announcements - always render for screen readers */}
        <div
          id="accessibility-announcer"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />
      </>
    );
  }

  return (
    <>
      {/* Development-only accessibility report */}
      {showAccessibilityReport && accessibilityReport && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">
              Accessibility Score
            </h3>
            <div className={`text-lg font-bold ${
              accessibilityReport.score >= 90 ? 'text-green-600' :
              accessibilityReport.score >= 70 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {accessibilityReport.score}/100
            </div>
          </div>
          
          <div className="space-y-1 text-xs">
            {accessibilityReport.summary.critical > 0 && (
              <div className="text-red-600">
                Critical: {accessibilityReport.summary.critical}
              </div>
            )}
            {accessibilityReport.summary.serious > 0 && (
              <div className="text-orange-600">
                Serious: {accessibilityReport.summary.serious}
              </div>
            )}
            {accessibilityReport.summary.moderate > 0 && (
              <div className="text-yellow-600">
                Moderate: {accessibilityReport.summary.moderate}
              </div>
            )}
            {accessibilityReport.summary.minor > 0 && (
              <div className="text-blue-600">
                Minor: {accessibilityReport.summary.minor}
              </div>
            )}
          </div>

          {deviceInfo && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                <div>Device: {deviceInfo.isMobile ? 'Mobile' : deviceInfo.isTablet ? 'Tablet' : 'Desktop'}</div>
                <div>Touch: {deviceInfo.isTouch ? 'Yes' : 'No'}</div>
                <div>Viewport: {deviceInfo.viewport.width}×{deviceInfo.viewport.height}</div>
                {deviceInfo.connection && (
                  <div>Connection: {deviceInfo.connection.effectiveType}</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progressive enhancement styles */}
      <style jsx global>{`
        /* Mobile-first responsive design */
        @media (max-width: 768px) {
          .mobile-optimized {
            font-size: 16px; /* Prevent zoom on iOS */
            touch-action: manipulation;
          }
          
          .mobile-optimized button,
          .mobile-optimized a,
          .mobile-optimized input,
          .mobile-optimized select {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* Touch device optimizations */
        .touch .hover-only {
          display: none;
        }

        .no-touch .touch-only {
          display: none;
        }

        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .reduce-motion *,
          .reduce-motion *::before,
          .reduce-motion *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* High contrast preferences */
        @media (prefers-contrast: high) {
          .high-contrast {
            filter: contrast(1.5);
          }
        }

        /* Slow connection optimizations */
        .save-data img,
        .connection-2g img,
        .connection-slow-2g img {
          background-color: #f3f4f6;
        }

        .save-data .animation,
        .connection-2g .animation,
        .connection-slow-2g .animation {
          animation: none !important;
          transition: none !important;
        }

        /* Focus indicators */
        .focus-visible:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Screen reader only content */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* Safe area insets for devices with notches */
        .safe-area-inset-top {
          padding-top: env(safe-area-inset-top);
        }

        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }

        .safe-area-inset-left {
          padding-left: env(safe-area-inset-left);
        }

        .safe-area-inset-right {
          padding-right: env(safe-area-inset-right);
        }
      `}</style>

      {/* Accessibility announcements */}
      <div
        id="accessibility-announcer"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Performance monitoring script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Monitor mobile performance
            if (typeof window !== 'undefined' && 'performance' in window) {
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              
              if (isMobile) {
                // Monitor touch events performance
                let touchStartTime = 0;
                document.addEventListener('touchstart', () => {
                  touchStartTime = performance.now();
                });
                
                document.addEventListener('touchend', () => {
                  const touchDuration = performance.now() - touchStartTime;
                  if (touchDuration > 100) {
                    console.warn('Slow touch response:', touchDuration + 'ms');
                  }
                });
                
                // Monitor scroll performance
                let scrollStartTime = 0;
                let isScrolling = false;
                
                document.addEventListener('scroll', () => {
                  if (!isScrolling) {
                    scrollStartTime = performance.now();
                    isScrolling = true;
                  }
                });
                
                document.addEventListener('scrollend', () => {
                  if (isScrolling) {
                    const scrollDuration = performance.now() - scrollStartTime;
                    if (scrollDuration > 16) { // > 1 frame at 60fps
                      console.warn('Janky scroll detected:', scrollDuration + 'ms');
                    }
                    isScrolling = false;
                  }
                });
              }
            }
          `,
        }}
      />
    </>
  );
}