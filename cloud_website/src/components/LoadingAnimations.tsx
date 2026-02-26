'use client';

import { ReactNode, useState, useEffect } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'teal' | 'gray';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    blue: 'border-blue-600 border-t-transparent',
    teal: 'border-teal-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]} 
        ${colorClasses[color]} 
        border-2 rounded-full animate-spin
        ${className}
      `}
    />
  );
}

interface LoadingPulseProps {
  className?: string;
  children?: ReactNode;
}

export function LoadingPulse({ className = '', children }: LoadingPulseProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {children || (
        <div className="bg-gray-200 rounded h-4 w-full" />
      )}
    </div>
  );
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div 
            className="bg-gray-200 rounded h-4"
            style={{ 
              width: `${Math.random() * 40 + 60}%` 
            }}
          />
        </div>
      ))}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  message = 'Loading...', 
  className = '' 
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 font-medium">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  color?: 'blue' | 'teal' | 'green';
  animated?: boolean;
}

export function ProgressBar({ 
  progress, 
  className = '', 
  color = 'blue', 
  animated = true 
}: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-600',
    teal: 'bg-teal-600',
    green: 'bg-green-600',
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className={`
          h-2 rounded-full transition-all duration-500 ease-out
          ${colorClasses[color]}
          ${animated ? 'animate-pulse' : ''}
        `}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className = '' }: LoadingCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="bg-gray-200 rounded h-6 w-3/4 mb-4" />
        <div className="space-y-2">
          <div className="bg-gray-200 rounded h-4 w-full" />
          <div className="bg-gray-200 rounded h-4 w-5/6" />
          <div className="bg-gray-200 rounded h-4 w-4/6" />
        </div>
        <div className="mt-4 flex space-x-2">
          <div className="bg-gray-200 rounded h-8 w-20" />
          <div className="bg-gray-200 rounded h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

interface LoadingGridProps {
  items?: number;
  className?: string;
}

export function LoadingGrid({ items = 6, className = '' }: LoadingGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </div>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function LoadingButton({ 
  isLoading, 
  children, 
  className = '', 
  disabled = false,
  onClick 
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
    >
      {isLoading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      <span className={isLoading ? 'opacity-75' : ''}>
        {children}
      </span>
    </button>
  );
}

interface TypewriterLoadingProps {
  messages: string[];
  interval?: number;
  className?: string;
}

export function TypewriterLoading({ 
  messages, 
  interval = 2000, 
  className = '' 
}: TypewriterLoadingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval]);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size="sm" />
      <span className="animate-fade-in-up">
        {messages[currentIndex]}
      </span>
    </div>
  );
}

// Hook for managing loading states
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
  };

  const reset = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset,
  };
}