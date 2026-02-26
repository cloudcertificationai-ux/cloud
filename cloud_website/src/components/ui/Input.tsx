'use client';

import React from 'react';
import { InputProps } from '@/types/design-system';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      size = 'md',
      error = false,
      disabled = false,
      fullWidth = false,
      label,
      helperText,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for accessibility
    const inputId = React.useId();
    const helperTextId = React.useId();

    // Base input styles
    const baseStyles = [
      'block border rounded-lg transition-all duration-200',
      'placeholder:text-neutral-400',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
    ];

    // Size styles
    const sizeStyles = {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-3.5 py-2.5 text-sm',
      lg: 'px-4 py-3 text-base',
      xl: 'px-5 py-4 text-lg',
      '2xl': 'px-6 py-5 text-xl',
    };

    // State-based styles
    const stateStyles = error
      ? 'border-error-300 text-error-900 focus:border-error-500 focus:ring-error-200'
      : 'border-neutral-300 text-neutral-900 focus:border-primary-500 focus:ring-primary-200';

    // Icon padding adjustments
    const iconPadding = {
      xs: { left: leftIcon ? 'pl-8' : '', right: rightIcon ? 'pr-8' : '' },
      sm: { left: leftIcon ? 'pl-9' : '', right: rightIcon ? 'pr-9' : '' },
      md: { left: leftIcon ? 'pl-10' : '', right: rightIcon ? 'pr-10' : '' },
      lg: { left: leftIcon ? 'pl-11' : '', right: rightIcon ? 'pr-11' : '' },
      xl: { left: leftIcon ? 'pl-12' : '', right: rightIcon ? 'pr-12' : '' },
      '2xl': { left: leftIcon ? 'pl-14' : '', right: rightIcon ? 'pr-14' : '' },
    };

    // Icon positioning
    const iconPositionStyles = {
      xs: 'top-1.5 h-4 w-4',
      sm: 'top-2 h-4 w-4',
      md: 'top-2.5 h-5 w-5',
      lg: 'top-3 h-5 w-5',
      xl: 'top-4 h-6 w-6',
      '2xl': 'top-5 h-6 w-6',
    };

    // Combine input styles
    const inputClasses = cn(
      baseStyles,
      sizeStyles[size],
      stateStyles,
      iconPadding[size].left,
      iconPadding[size].right,
      fullWidth ? 'w-full' : 'w-auto',
      className
    );

    // Label styles
    const labelClasses = cn(
      'block text-sm font-medium mb-2',
      error ? 'text-error-700' : 'text-neutral-700',
      disabled && 'text-neutral-500'
    );

    // Helper text styles
    const helperTextClasses = cn(
      'mt-2 text-sm',
      error ? 'text-error-600' : 'text-neutral-600'
    );

    return (
      <div className={fullWidth ? 'w-full' : 'w-auto'}>
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute left-3 pointer-events-none text-neutral-400',
              iconPositionStyles[size]
            )}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={error}
            aria-describedby={helperText ? helperTextId : undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className={cn(
              'absolute right-3 pointer-events-none text-neutral-400',
              iconPositionStyles[size]
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {helperText && (
          <p id={helperTextId} className={helperTextClasses}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;