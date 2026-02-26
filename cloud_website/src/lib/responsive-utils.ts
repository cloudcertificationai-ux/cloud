/**
 * Responsive Design Utilities
 * Provides utilities for responsive breakpoints, touch interactions, and mobile optimization
 */

// Breakpoint definitions matching Tailwind config
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1400,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Check if current viewport matches a breakpoint
 */
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.innerWidth >= breakpoints[breakpoint];
};

/**
 * Get current breakpoint
 */
export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'sm';
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

/**
 * Touch interaction utilities
 */
export const touchUtils = {
  // Minimum touch target size (44px recommended by Apple/Google)
  minTouchTarget: 44,
  
  // Touch gesture detection
  isTouchDevice: (): boolean => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // Add touch-friendly classes
  getTouchClasses: (baseClasses: string): string => {
    const touchClasses = touchUtils.isTouchDevice() 
      ? 'touch-manipulation select-none' 
      : '';
    return `${baseClasses} ${touchClasses}`.trim();
  },
  
  // Enhanced tap target sizing
  getTapTargetClasses: (size: 'sm' | 'md' | 'lg' = 'md'): string => {
    const sizeMap = {
      sm: 'min-h-[44px] min-w-[44px]',
      md: 'min-h-[48px] min-w-[48px]',
      lg: 'min-h-[56px] min-w-[56px]'
    };
    return sizeMap[size];
  }
};

/**
 * Responsive spacing utilities
 */
export const responsiveSpacing = {
  // Container padding that adapts to screen size
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  
  // Section spacing that scales with screen size
  sectionSpacing: 'py-12 sm:py-16 lg:py-20',
  
  // Grid gaps that adapt to screen size
  gridGap: 'gap-4 sm:gap-6 lg:gap-8',
  
  // Text spacing that scales appropriately
  textSpacing: 'space-y-4 sm:space-y-6 lg:space-y-8'
};

/**
 * Mobile-first responsive grid utilities
 */
export const responsiveGrid = {
  // Common responsive grid patterns
  autoFit: (minWidth: string = '280px') => 
    `grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(${minWidth},1fr))]`,
  
  // Standard responsive column patterns
  columns: {
    '1-2': 'grid-cols-1 md:grid-cols-2',
    '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '1-2-4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    '2-3-4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    '1-3': 'grid-cols-1 lg:grid-cols-3',
    '2-4': 'grid-cols-2 lg:grid-cols-4'
  }
};

/**
 * Typography scaling utilities
 */
export const responsiveTypography = {
  // Heading scales that adapt to screen size
  heading: {
    h1: 'text-3xl sm:text-4xl lg:text-5xl xl:text-6xl',
    h2: 'text-2xl sm:text-3xl lg:text-4xl',
    h3: 'text-xl sm:text-2xl lg:text-3xl',
    h4: 'text-lg sm:text-xl lg:text-2xl',
    h5: 'text-base sm:text-lg lg:text-xl',
    h6: 'text-sm sm:text-base lg:text-lg'
  },
  
  // Body text that scales appropriately
  body: {
    large: 'text-lg sm:text-xl',
    base: 'text-base sm:text-lg',
    small: 'text-sm sm:text-base'
  },
  
  // Line height adjustments for different screen sizes
  lineHeight: {
    tight: 'leading-tight sm:leading-snug',
    normal: 'leading-normal sm:leading-relaxed',
    relaxed: 'leading-relaxed sm:leading-loose'
  }
};

/**
 * Mobile navigation utilities
 */
export const mobileNavigation = {
  // Mobile menu classes
  mobileMenu: 'lg:hidden',
  desktopMenu: 'hidden lg:flex',
  
  // Mobile menu overlay
  overlay: 'fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden',
  
  // Mobile menu panel
  panel: 'fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-xl lg:hidden',
  
  // Hamburger menu button
  hamburger: 'inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden'
};

/**
 * Image responsive utilities
 */
export const responsiveImages = {
  // Standard responsive image sizes
  sizes: {
    full: '100vw',
    half: '(max-width: 768px) 100vw, 50vw',
    third: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    quarter: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw',
    hero: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px',
    thumbnail: '(max-width: 640px) 80px, (max-width: 768px) 100px, 120px'
  },
  
  // Aspect ratio utilities
  aspectRatio: {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    ultraWide: 'aspect-[21/9]'
  }
};

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  // Lazy loading classes
  lazyLoad: 'loading-lazy',
  
  // Intersection observer options for lazy loading
  intersectionOptions: {
    rootMargin: '50px',
    threshold: 0.1
  },
  
  // Preload critical resources
  preloadCritical: (href: string, as: string = 'image') => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      document.head.appendChild(link);
    }
  }
};

/**
 * Accessibility utilities for responsive design
 */
export const a11yUtils = {
  // Screen reader only classes
  srOnly: 'sr-only',
  
  // Focus management for mobile
  focusClasses: 'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
  
  // Skip links for mobile navigation
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50',
  
  // ARIA labels for responsive components
  getAriaLabel: (component: string, breakpoint: Breakpoint) => {
    const labels = {
      menu: {
        xs: 'Mobile navigation menu',
        sm: 'Mobile navigation menu', 
        md: 'Navigation menu',
        lg: 'Main navigation',
        xl: 'Main navigation',
        '2xl': 'Main navigation'
      },
      grid: {
        xs: 'Single column layout',
        sm: 'Two column layout',
        md: 'Three column layout', 
        lg: 'Four column layout',
        xl: 'Four column layout',
        '2xl': 'Four column layout'
      }
    };
    
    return labels[component as keyof typeof labels]?.[breakpoint] || '';
  }
};

/**
 * Hook for responsive behavior
 */
export const useResponsive = () => {
  if (typeof window === 'undefined') {
    return {
      breakpoint: 'sm' as Breakpoint,
      isMobile: false,
      isTablet: false,
      isDesktop: false,
      isTouchDevice: false
    };
  }

  const breakpoint = getCurrentBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
  const isTouchDevice = touchUtils.isTouchDevice();

  return {
    breakpoint,
    isMobile,
    isTablet, 
    isDesktop,
    isTouchDevice
  };
};