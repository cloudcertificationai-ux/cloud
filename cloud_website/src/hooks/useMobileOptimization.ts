'use client';

import { useState, useEffect, useCallback } from 'react';
import { useResponsive, touchUtils } from '@/lib/responsive-utils';

interface MobileOptimizationState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  viewportHeight: number;
  viewportWidth: number;
  isKeyboardOpen: boolean;
}

interface MobileOptimizationActions {
  handleTouchStart: (e: TouchEvent) => void;
  handleTouchEnd: (e: TouchEvent) => void;
  preventZoom: (e: TouchEvent) => void;
  optimizeScrolling: () => void;
}

export const useMobileOptimization = (): MobileOptimizationState & MobileOptimizationActions => {
  const responsive = useResponsive();
  
  const [state, setState] = useState<MobileOptimizationState>({
    isMobile: responsive.isMobile,
    isTablet: responsive.isTablet,
    isDesktop: responsive.isDesktop,
    isTouchDevice: responsive.isTouchDevice,
    orientation: 'portrait',
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    isKeyboardOpen: false
  });

  // Handle viewport changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const newHeight = window.innerHeight;
      const newWidth = window.innerWidth;
      const newOrientation = newWidth > newHeight ? 'landscape' : 'portrait';
      
      // Detect virtual keyboard on mobile
      const isKeyboardOpen = responsive.isMobile && newHeight < state.viewportHeight * 0.75;

      setState(prev => ({
        ...prev,
        viewportHeight: newHeight,
        viewportWidth: newWidth,
        orientation: newOrientation,
        isKeyboardOpen,
        isMobile: responsive.isMobile,
        isTablet: responsive.isTablet,
        isDesktop: responsive.isDesktop
      }));
    };

    const handleOrientationChange = () => {
      // Delay to allow for orientation change to complete
      setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial setup
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [responsive.isMobile, responsive.isTablet, responsive.isDesktop, state.viewportHeight]);

  // Touch interaction handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Add touch feedback
    const target = e.target as HTMLElement;
    if (target.classList.contains('touch-feedback')) {
      target.style.transform = 'scale(0.98)';
      target.style.opacity = '0.8';
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // Remove touch feedback
    const target = e.target as HTMLElement;
    if (target.classList.contains('touch-feedback')) {
      target.style.transform = '';
      target.style.opacity = '';
    }
  }, []);

  // Prevent accidental zoom on double-tap
  const preventZoom = useCallback((e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, []);

  // Optimize scrolling performance
  const optimizeScrolling = useCallback(() => {
    if (typeof document === 'undefined') return;

    // Add momentum scrolling for iOS
    (document.body.style as any).webkitOverflowScrolling = 'touch';
    
    // Prevent scroll chaining on mobile
    if (responsive.isMobile) {
      document.body.style.overscrollBehavior = 'contain';
    }
  }, [responsive.isMobile]);

  // Set up touch optimizations
  useEffect(() => {
    if (!responsive.isTouchDevice) return;

    optimizeScrolling();

    // Add global touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchmove', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchmove', preventZoom);
    };
  }, [responsive.isTouchDevice, handleTouchStart, handleTouchEnd, preventZoom, optimizeScrolling]);

  return {
    ...state,
    handleTouchStart,
    handleTouchEnd,
    preventZoom,
    optimizeScrolling
  };
};

/**
 * Hook for mobile-specific navigation behavior
 */
export const useMobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isMobile } = useMobileOptimization();

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
    if (isMobile && typeof document !== 'undefined') {
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }
  }, [isMobile]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    if (typeof document !== 'undefined') {
      // Restore body scroll
      document.body.style.overflow = '';
    }
  }, []);

  const toggleMenu = useCallback(() => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isMenuOpen, openMenu, closeMenu]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen, closeMenu]);

  return {
    isMenuOpen,
    openMenu,
    closeMenu,
    toggleMenu
  };
};

/**
 * Hook for responsive image loading
 */
export const useResponsiveImages = () => {
  const { isMobile, isTablet, viewportWidth } = useMobileOptimization();

  const getOptimalImageSize = useCallback((baseWidth: number) => {
    if (isMobile) return Math.min(baseWidth, viewportWidth);
    if (isTablet) return Math.min(baseWidth, viewportWidth * 0.8);
    return baseWidth;
  }, [isMobile, isTablet, viewportWidth]);

  const getSrcSet = useCallback((baseSrc: string, sizes: number[]) => {
    return sizes
      .map(size => `${baseSrc}?w=${size} ${size}w`)
      .join(', ');
  }, []);

  const getSizes = useCallback((breakpoints: { [key: string]: string }) => {
    return Object.entries(breakpoints)
      .map(([breakpoint, size]) => `(max-width: ${breakpoint}px) ${size}`)
      .join(', ');
  }, []);

  return {
    getOptimalImageSize,
    getSrcSet,
    getSizes
  };
};