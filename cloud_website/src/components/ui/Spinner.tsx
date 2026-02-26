'use client';

import React from 'react';
import { SpinnerProps } from '@/types/design-system';
import { cn } from '@/lib/utils';

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size = 'md',
      color = 'primary',
      ...props
    },
    ref
  ) => {
    // Size styles
    const sizeStyles = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-10 w-10',
      '2xl': 'h-12 w-12',
    };

    // Color styles
    const colorStyles = {
      primary: 'text-primary-600',
      navy: 'text-navy-600',
      accent: 'text-accent-600',
      warning: 'text-warning-600',
      success: 'text-success-600',
      error: 'text-error-600',
      neutral: 'text-neutral-600',
    };

    // Combine spinner styles
    const spinnerClasses = cn(
      'animate-spin',
      sizeStyles[size],
      colorStyles[color],
      className
    );

    return (
      <div ref={ref} className={spinnerClasses} {...props}>
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner;