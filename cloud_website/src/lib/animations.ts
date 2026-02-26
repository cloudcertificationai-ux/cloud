/**
 * Animation utilities for consistent UI polish and micro-interactions
 */

import { useState, useEffect, useRef } from 'react';

/**
 * CSS classes for common animations
 */
export const animations = {
  // Fade animations
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  
  // Scale animations
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  scaleOnHover: 'hover:scale-105 transition-transform duration-300',
  
  // Slide animations
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  slideInUp: 'animate-slide-in-up',
  slideInDown: 'animate-slide-in-down',
  
  // Bounce animations
  bounce: 'animate-bounce',
  bounceIn: 'animate-bounce-in',
  
  // Pulse animations
  pulse: 'animate-pulse',
  pulseOnHover: 'hover:animate-pulse',
  
  // Spin animations
  spin: 'animate-spin',
  spinSlow: 'animate-spin-slow',
  
  // Loading animations
  loading: 'animate-pulse bg-gray-200',
  skeleton: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
  
  // Hover effects
  hoverLift: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-300',
  hoverGlow: 'hover:shadow-xl hover:shadow-blue-500/25 transition-shadow duration-300',
  hoverBrightness: 'hover:brightness-110 transition-all duration-300',
  
  // Focus effects
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
  
  // Transition utilities
  transitionAll: 'transition-all duration-300 ease-in-out',
  transitionColors: 'transition-colors duration-300 ease-in-out',
  transitionTransform: 'transition-transform duration-300 ease-in-out',
  transitionOpacity: 'transition-opacity duration-300 ease-in-out',
  
  // Stagger animations for lists
  staggerChildren: 'animate-stagger-children',
  staggerItem: 'animate-stagger-item',
} as const;

/**
 * Animation delays for staggered effects
 */
export const staggerDelays = {
  '100': 'animation-delay-100',
  '200': 'animation-delay-200',
  '300': 'animation-delay-300',
  '400': 'animation-delay-400',
  '500': 'animation-delay-500',
} as const;

/**
 * Intersection Observer hook for scroll-triggered animations
 */
export function useScrollAnimation(threshold = 0.1) {
  if (typeof window === 'undefined') {
    return { ref: null, isVisible: false };
  }

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally unobserve after first intersection
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

/**
 * Custom animation variants for different components
 */
export const animationVariants = {
  // Card animations
  card: {
    initial: 'opacity-0 translate-y-4',
    animate: 'opacity-100 translate-y-0',
    hover: 'hover:-translate-y-2 hover:shadow-xl',
    transition: 'transition-all duration-300 ease-out',
  },
  
  // Button animations
  button: {
    initial: 'transform scale-100',
    hover: 'hover:scale-105 active:scale-95',
    focus: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    transition: 'transition-all duration-200 ease-in-out',
  },
  
  // Modal animations
  modal: {
    backdrop: 'animate-fade-in',
    content: 'animate-scale-in',
    exit: 'animate-fade-out',
  },
  
  // Navigation animations
  nav: {
    item: 'hover:text-blue-600 transition-colors duration-200',
    underline: 'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full',
  },
  
  // Loading animations
  loading: {
    spinner: 'animate-spin',
    dots: 'animate-pulse',
    skeleton: 'animate-pulse bg-gray-200',
    wave: 'animate-wave',
  },
  
  // Page transitions
  page: {
    enter: 'animate-fade-in-up',
    exit: 'animate-fade-out-down',
  },
} as const;

/**
 * Micro-interaction utilities
 */
export const microInteractions = {
  // Click feedback
  clickFeedback: 'active:scale-95 transition-transform duration-100',
  
  // Hover feedback
  hoverFeedback: 'hover:bg-gray-50 transition-colors duration-200',
  
  // Focus feedback
  focusFeedback: 'focus:bg-blue-50 focus:border-blue-300 transition-all duration-200',
  
  // Success feedback
  successFeedback: 'bg-green-50 border-green-200 text-green-800',
  
  // Error feedback
  errorFeedback: 'bg-red-50 border-red-200 text-red-800',
  
  // Warning feedback
  warningFeedback: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  
  // Info feedback
  infoFeedback: 'bg-blue-50 border-blue-200 text-blue-800',
} as const;

/**
 * Performance-optimized animation utilities
 */
export const performanceAnimations = {
  // Use transform instead of changing layout properties
  translateX: (value: string) => `transform: translateX(${value})`,
  translateY: (value: string) => `transform: translateY(${value})`,
  scale: (value: number) => `transform: scale(${value})`,
  rotate: (value: string) => `transform: rotate(${value})`,
  
  // Use opacity for fade effects
  fade: (value: number) => `opacity: ${value}`,
  
  // Use will-change for animations
  willChange: 'will-change-transform',
  willChangeAuto: 'will-change-auto',
} as const;

/**
 * Accessibility-friendly animation utilities
 */
export const a11yAnimations = {
  // Respect user's motion preferences
  respectMotion: 'motion-safe:animate-fade-in motion-reduce:animate-none',
  
  // Reduced motion alternatives
  reducedMotion: {
    fadeIn: 'motion-reduce:opacity-100',
    slideIn: 'motion-reduce:transform-none',
    scale: 'motion-reduce:scale-100',
  },
  
  // Focus indicators that work with animations
  focusIndicator: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 motion-reduce:focus:ring-offset-0',
} as const;

/**
 * Animation timing functions
 */
export const easings = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

/**
 * Animation durations
 */
export const durations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '750ms',
} as const;