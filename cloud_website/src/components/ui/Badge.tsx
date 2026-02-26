'use client';

import React from 'react';
import { BadgeProps } from '@/types/design-system';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      color = 'primary',
      size = 'md',
      rounded = false,
      removable = false,
      onRemove,
      children,
      ...props
    },
    ref
  ) => {
    // Base badge styles
    const baseStyles = [
      'inline-flex items-center gap-1',
      'font-medium transition-all duration-200',
      'whitespace-nowrap',
    ];

    // Size styles
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };

    // Rounded styles
    const roundedStyles = {
      sm: rounded ? 'rounded-full' : 'rounded',
      md: rounded ? 'rounded-full' : 'rounded-md',
      lg: rounded ? 'rounded-full' : 'rounded-lg',
    };

    // Variant and color combinations
    const variantStyles = {
      default: {
        primary: 'bg-primary-100 text-primary-800 border border-primary-200',
        navy: 'bg-navy-100 text-navy-800 border border-navy-200',
        accent: 'bg-accent-100 text-accent-800 border border-accent-200',
        warning: 'bg-warning-100 text-warning-800 border border-warning-200',
        success: 'bg-success-100 text-success-800 border border-success-200',
        error: 'bg-error-100 text-error-800 border border-error-200',
        neutral: 'bg-neutral-100 text-neutral-800 border border-neutral-200',
      },
      outline: {
        primary: 'bg-transparent text-primary-600 border border-primary-300',
        navy: 'bg-transparent text-navy-600 border border-navy-300',
        accent: 'bg-transparent text-accent-600 border border-accent-300',
        warning: 'bg-transparent text-warning-600 border border-warning-300',
        success: 'bg-transparent text-success-600 border border-success-300',
        error: 'bg-transparent text-error-600 border border-error-300',
        neutral: 'bg-transparent text-neutral-600 border border-neutral-300',
      },
      filled: {
        primary: 'bg-primary-500 text-white border border-primary-500',
        navy: 'bg-navy-500 text-white border border-navy-500',
        accent: 'bg-accent-500 text-white border border-accent-500',
        warning: 'bg-warning-500 text-white border border-warning-500',
        success: 'bg-success-500 text-white border border-success-500',
        error: 'bg-error-500 text-white border border-error-500',
        neutral: 'bg-neutral-500 text-white border border-neutral-500',
      },
    };

    // Combine all styles
    const badgeClasses = cn(
      baseStyles,
      sizeStyles[size],
      roundedStyles[size],
      variantStyles[variant][color],
      className
    );

    // Remove button component
    const RemoveButton = () => (
      <button
        type="button"
        className={cn(
          'ml-1 inline-flex items-center justify-center',
          'rounded-full hover:bg-black/10 focus:outline-none focus:bg-black/10',
          'transition-colors duration-150',
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-4 w-4',
          size === 'lg' && 'h-5 w-5'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onRemove?.();
        }}
        aria-label="Remove badge"
      >
        <svg
          className={cn(
            'fill-current',
            size === 'sm' && 'h-2 w-2',
            size === 'md' && 'h-3 w-3',
            size === 'lg' && 'h-4 w-4'
          )}
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    );

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {children}
        {removable && <RemoveButton />}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;