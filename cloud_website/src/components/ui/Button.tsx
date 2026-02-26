'use client';

import React from 'react';
import { ButtonProps } from '@/types/design-system';
import { cn } from '@/lib/utils';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      color = 'primary',
      disabled = false,
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      href,
      target,
      onClick,
      ...props
    },
    ref
  ) => {
    // Base button styles
    const baseStyles = [
      'inline-flex items-center justify-center gap-2',
      'font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden',
    ];

    // Size variants
    const sizeStyles = {
      xs: 'px-2.5 py-1.5 text-xs rounded-md',
      sm: 'px-3 py-2 text-sm rounded-md',
      md: 'px-4 py-2.5 text-sm rounded-lg',
      lg: 'px-6 py-3 text-base rounded-lg',
      xl: 'px-8 py-4 text-lg rounded-xl',
      '2xl': 'px-10 py-5 text-xl rounded-xl',
    };

    // Variant styles with improved contrast
    const variantStyles = {
      primary: {
        primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-button hover:shadow-button-hover focus:ring-primary-300',
        navy: 'bg-navy-800 hover:bg-navy-900 text-white shadow-button hover:shadow-button-hover focus:ring-navy-300',
        accent: 'bg-accent-500 hover:bg-accent-600 text-white shadow-button hover:shadow-button-hover focus:ring-accent-300',
        warning: 'bg-warning-500 hover:bg-warning-600 text-white shadow-button hover:shadow-button-hover focus:ring-warning-300',
        success: 'bg-success-500 hover:bg-success-600 text-white shadow-button hover:shadow-button-hover focus:ring-success-300',
        error: 'bg-error-500 hover:bg-error-600 text-white shadow-button hover:shadow-button-hover focus:ring-error-300',
        neutral: 'bg-neutral-700 hover:bg-neutral-800 text-white shadow-button hover:shadow-button-hover focus:ring-neutral-300',
      },
      secondary: {
        primary: 'bg-white hover:bg-primary-50 text-primary-800 border-2 border-primary-300 hover:border-primary-400 focus:ring-primary-300',
        navy: 'bg-white hover:bg-navy-50 text-navy-800 border-2 border-navy-300 hover:border-navy-400 focus:ring-navy-300',
        accent: 'bg-white hover:bg-accent-50 text-accent-800 border-2 border-accent-300 hover:border-accent-400 focus:ring-accent-300',
        warning: 'bg-white hover:bg-warning-50 text-warning-800 border-2 border-warning-300 hover:border-warning-400 focus:ring-warning-300',
        success: 'bg-white hover:bg-success-50 text-success-800 border-2 border-success-300 hover:border-success-400 focus:ring-success-300',
        error: 'bg-white hover:bg-error-50 text-error-800 border-2 border-error-300 hover:border-error-400 focus:ring-error-300',
        neutral: 'bg-white hover:bg-neutral-50 text-neutral-800 border-2 border-neutral-300 hover:border-neutral-400 focus:ring-neutral-300',
      },
      outline: {
        primary: 'border-2 border-primary-500 text-primary-700 hover:bg-primary-50 hover:text-primary-800 focus:ring-primary-300',
        navy: 'border-2 border-navy-500 text-navy-700 hover:bg-navy-50 hover:text-navy-800 focus:ring-navy-300',
        accent: 'border-2 border-accent-500 text-accent-700 hover:bg-accent-50 hover:text-accent-800 focus:ring-accent-300',
        warning: 'border-2 border-warning-500 text-warning-700 hover:bg-warning-50 hover:text-warning-800 focus:ring-warning-300',
        success: 'border-2 border-success-500 text-success-700 hover:bg-success-50 hover:text-success-800 focus:ring-success-300',
        error: 'border-2 border-error-500 text-error-700 hover:bg-error-50 hover:text-error-800 focus:ring-error-300',
        neutral: 'border-2 border-neutral-500 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-800 focus:ring-neutral-300',
      },
      ghost: {
        primary: 'text-primary-700 hover:bg-primary-100 hover:text-primary-800 focus:ring-primary-300',
        navy: 'text-navy-700 hover:bg-navy-100 hover:text-navy-800 focus:ring-navy-300',
        accent: 'text-accent-700 hover:bg-accent-100 hover:text-accent-800 focus:ring-accent-300',
        warning: 'text-warning-700 hover:bg-warning-100 hover:text-warning-800 focus:ring-warning-300',
        success: 'text-success-700 hover:bg-success-100 hover:text-success-800 focus:ring-success-300',
        error: 'text-error-700 hover:bg-error-100 hover:text-error-800 focus:ring-error-300',
        neutral: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-800 focus:ring-neutral-300',
      },
      link: {
        primary: 'text-primary-700 hover:text-primary-800 underline-offset-4 hover:underline focus:ring-primary-300',
        navy: 'text-navy-700 hover:text-navy-800 underline-offset-4 hover:underline focus:ring-navy-300',
        accent: 'text-accent-700 hover:text-accent-800 underline-offset-4 hover:underline focus:ring-accent-300',
        warning: 'text-warning-700 hover:text-warning-800 underline-offset-4 hover:underline focus:ring-warning-300',
        success: 'text-success-700 hover:text-success-800 underline-offset-4 hover:underline focus:ring-success-300',
        error: 'text-error-700 hover:text-error-800 underline-offset-4 hover:underline focus:ring-error-300',
        neutral: 'text-neutral-700 hover:text-neutral-800 underline-offset-4 hover:underline focus:ring-neutral-300',
      },
    };

    // Combine all styles
    const buttonClasses = cn(
      baseStyles,
      sizeStyles[size],
      variantStyles[variant][color],
      fullWidth && 'w-full',
      loading && 'cursor-wait',
      className
    );

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
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
    );

    // Handle click events
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    // If href is provided, render as a link-styled button
    if (href) {
      return (
        <a
          href={href}
          target={target}
          className={buttonClasses}
          {...(props as any)}
        >
          {leftIcon && !loading && leftIcon}
          {loading && <LoadingSpinner />}
          {children}
          {rightIcon && !loading && rightIcon}
        </a>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {leftIcon && !loading && leftIcon}
        {loading && <LoadingSpinner />}
        {children}
        {rightIcon && !loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;