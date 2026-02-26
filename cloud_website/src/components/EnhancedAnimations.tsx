'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { useScrollAnimation } from '@/lib/animations';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}

export function ScrollReveal({ 
  children, 
  className = '', 
  delay = 0, 
  threshold = 0.1 
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollAnimation(threshold);
  
  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? 'revealed' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({ 
  children, 
  className = '', 
  staggerDelay = 100 
}: StaggerContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${isVisible ? 'stagger-container' : ''} ${className}`}
      style={{
        '--stagger-delay': `${staggerDelay}ms`,
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
}: AnimatedButtonProps) {
  const baseClasses = 'btn-primary button-press focus-ring-enhanced ripple-effect font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="spin-fade w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
}

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({ 
  children, 
  className = '', 
  hover = true, 
  onClick 
}: AnimatedCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        ${hover ? 'card-hover' : ''} 
        ${onClick ? 'cursor-pointer click-feedback' : ''} 
        bg-white rounded-lg border border-gray-200 p-6 
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
}

export function Typewriter({ 
  text, 
  speed = 50, 
  className = '', 
  onComplete 
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className={`typewriter ${className}`}>
      {displayText}
    </span>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  intensity?: 'subtle' | 'normal' | 'strong';
}

export function FloatingElement({ 
  children, 
  className = '', 
  intensity = 'normal' 
}: FloatingElementProps) {
  const intensityClasses = {
    subtle: 'float-animation',
    normal: 'float-animation',
    strong: 'float-animation',
  };

  return (
    <div className={`${intensityClasses[intensity]} ${className}`}>
      {children}
    </div>
  );
}

interface PulseGlowProps {
  children: ReactNode;
  className?: string;
  color?: 'blue' | 'teal' | 'green' | 'orange';
}

export function PulseGlow({ 
  children, 
  className = '', 
  color = 'teal' 
}: PulseGlowProps) {
  return (
    <div className={`pulse-glow ${className}`}>
      {children}
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingDots({ className = '', size = 'md' }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={`dots-loading ${sizeClasses[size]} ${className}`}>
      Loading
    </div>
  );
}

interface ShimmerProps {
  className?: string;
  width?: string;
  height?: string;
}

export function Shimmer({ 
  className = '', 
  width = '100%', 
  height = '20px' 
}: ShimmerProps) {
  return (
    <div
      className={`shimmer rounded ${className}`}
      style={{ width, height }}
    />
  );
}

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={`page-transition-enter ${className}`}>
      {children}
    </div>
  );
}

// Hook for managing complex animations
export function useAnimationSequence(steps: Array<{
  delay: number;
  duration: number;
  callback: () => void;
}>) {
  const [currentStep, setCurrentStep] = useState(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any existing timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];

    // Set up new animation sequence
    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        step.callback();
        setCurrentStep(index + 1);
      }, step.delay);
      
      timeoutsRef.current.push(timeout);
    });

    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [steps]);

  return { currentStep };
}

// Hook for intersection observer with animation triggers
export function useIntersectionAnimation(
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => callback(entry.isIntersecting),
      options
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [callback, options]);

  return ref;
}

// Performance-optimized animation component
export function PerformantAnimation({ 
  children, 
  trigger, 
  className = '' 
}: {
  children: ReactNode;
  trigger: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      if (trigger) {
        ref.current.style.willChange = 'transform, opacity';
        ref.current.classList.add('animate-fade-in-up');
      } else {
        ref.current.style.willChange = 'auto';
        ref.current.classList.remove('animate-fade-in-up');
      }
    }
  }, [trigger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}