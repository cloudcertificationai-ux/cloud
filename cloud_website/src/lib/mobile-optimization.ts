// Mobile optimization utilities and progressive enhancement

export interface MobileOptimizationConfig {
  enableTouchOptimization: boolean;
  enableProgressiveEnhancement: boolean;
  enableOfflineSupport: boolean;
  enableReducedMotion: boolean;
  enableHighContrast: boolean;
  touchTargetMinSize: number; // in pixels
}

export const DEFAULT_MOBILE_CONFIG: MobileOptimizationConfig = {
  enableTouchOptimization: true,
  enableProgressiveEnhancement: true,
  enableOfflineSupport: true,
  enableReducedMotion: true,
  enableHighContrast: true,
  touchTargetMinSize: 44, // WCAG AA standard
};

// Device detection utilities
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
}

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1;
  
  return window.devicePixelRatio || 1;
}

export function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 0, height: 0 };
  
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

// Network and performance optimization
export function getConnectionInfo(): {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} | null {
  if (typeof window === 'undefined' || !('navigator' in window)) return null;
  
  const connection = (navigator as any).connection;
  if (!connection) return null;
  
  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
}

export function isSlowConnection(): boolean {
  const connection = getConnectionInfo();
  if (!connection) return false;
  
  return connection.effectiveType === '2g' || 
         connection.effectiveType === 'slow-2g' ||
         connection.saveData;
}

export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isHighContrastPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
}

// Touch optimization utilities
export function optimizeTouchTargets(config: MobileOptimizationConfig = DEFAULT_MOBILE_CONFIG) {
  if (typeof window === 'undefined' || !config.enableTouchOptimization) return;
  
  const style = document.createElement('style');
  style.textContent = `
    /* Touch target optimization */
    button, a, input, select, textarea, [role="button"], [role="link"] {
      min-height: ${config.touchTargetMinSize}px;
      min-width: ${config.touchTargetMinSize}px;
      touch-action: manipulation;
    }
    
    /* Improve touch scrolling */
    * {
      -webkit-overflow-scrolling: touch;
    }
    
    /* Prevent zoom on input focus */
    input, select, textarea {
      font-size: 16px;
    }
    
    /* Touch-friendly spacing */
    @media (max-width: 768px) {
      button, a {
        padding: 12px 16px;
        margin: 4px;
      }
    }
  `;
  
  document.head.appendChild(style);
}

// Progressive enhancement utilities
export function enableProgressiveEnhancement(config: MobileOptimizationConfig = DEFAULT_MOBILE_CONFIG) {
  if (typeof window === 'undefined' || !config.enableProgressiveEnhancement) return;
  
  // Add classes based on device capabilities
  const html = document.documentElement;
  
  if (isTouchDevice()) {
    html.classList.add('touch');
  } else {
    html.classList.add('no-touch');
  }
  
  if (isMobileDevice()) {
    html.classList.add('mobile');
  }
  
  if (isTabletDevice()) {
    html.classList.add('tablet');
  }
  
  const connection = getConnectionInfo();
  if (connection) {
    html.classList.add(`connection-${connection.effectiveType}`);
    
    if (connection.saveData) {
      html.classList.add('save-data');
    }
  }
  
  if (isReducedMotionPreferred()) {
    html.classList.add('reduce-motion');
  }
  
  if (isHighContrastPreferred()) {
    html.classList.add('high-contrast');
  }
}

// Accessibility enhancements
export function enhanceAccessibility(config: MobileOptimizationConfig = DEFAULT_MOBILE_CONFIG) {
  if (typeof window === 'undefined') return;
  
  // Focus management
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  // Trap focus in modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const modal = document.querySelector('[role="dialog"]:not([hidden])');
      if (modal) {
        const focusable = modal.querySelectorAll(focusableElements);
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
      const modal = document.querySelector('[role="dialog"]:not([hidden])');
      if (modal) {
        const closeButton = modal.querySelector('[data-close]') as HTMLElement;
        if (closeButton) {
          closeButton.click();
        }
      }
    }
  });
  
  // Announce dynamic content changes
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  document.body.appendChild(announcer);
  
  // Function to announce messages to screen readers
  (window as any).announceToScreenReader = (message: string) => {
    announcer.textContent = message;
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  };
}

// Performance optimization for mobile
export function optimizeForMobile(config: MobileOptimizationConfig = DEFAULT_MOBILE_CONFIG) {
  if (typeof window === 'undefined') return;
  
  // Lazy load images on mobile
  if (isMobileDevice() && 'IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px',
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  // Reduce animations on slow connections
  if (isSlowConnection() || isReducedMotionPreferred()) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Optimize scrolling performance
  const style = document.createElement('style');
  style.textContent = `
    /* Optimize scrolling */
    * {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
    
    /* Optimize transforms */
    .transform-gpu {
      transform: translateZ(0);
      will-change: transform;
    }
    
    /* Optimize animations */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Viewport optimization
export function optimizeViewport() {
  if (typeof window === 'undefined') return;
  
  // Ensure viewport meta tag is properly set
  let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
  
  if (!viewportMeta) {
    viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    document.head.appendChild(viewportMeta);
  }
  
  // Set optimal viewport configuration
  viewportMeta.content = 'width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover';
  
  // Add safe area insets for devices with notches
  const style = document.createElement('style');
  style.textContent = `
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
  `;
  document.head.appendChild(style);
}

// Mobile-specific event handlers
export function addMobileEventHandlers() {
  if (typeof window === 'undefined' || !isTouchDevice()) return;
  
  // Prevent double-tap zoom on buttons
  document.addEventListener('touchend', (e) => {
    const target = e.target as HTMLElement;
    if (target.matches('button, [role="button"], input[type="submit"], input[type="button"]')) {
      e.preventDefault();
      target.click();
    }
  });
  
  // Handle orientation changes
  window.addEventListener('orientationchange', () => {
    // Force viewport recalculation
    setTimeout(() => {
      window.scrollTo(0, window.scrollY);
    }, 100);
  });
  
  // Handle visibility changes (app backgrounding)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // App is backgrounded - pause non-essential operations
      console.log('App backgrounded - pausing non-essential operations');
    } else {
      // App is foregrounded - resume operations
      console.log('App foregrounded - resuming operations');
    }
  });
}

// Initialize all mobile optimizations
export function initializeMobileOptimizations(config: MobileOptimizationConfig = DEFAULT_MOBILE_CONFIG) {
  if (typeof window === 'undefined') return;
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeMobileOptimizations(config);
    });
    return;
  }
  
  optimizeViewport();
  enableProgressiveEnhancement(config);
  optimizeTouchTargets(config);
  enhanceAccessibility(config);
  optimizeForMobile(config);
  addMobileEventHandlers();
  
  console.log('Mobile optimizations initialized', {
    isMobile: isMobileDevice(),
    isTouch: isTouchDevice(),
    connection: getConnectionInfo(),
    viewport: getViewportSize(),
  });
}

// Export utility functions for components
export const MobileUtils = {
  isMobileDevice,
  isTabletDevice,
  isTouchDevice,
  getDevicePixelRatio,
  getViewportSize,
  getConnectionInfo,
  isSlowConnection,
  isReducedMotionPreferred,
  isHighContrastPreferred,
};