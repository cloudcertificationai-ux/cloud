'use client';

import React from 'react';
import { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from '@/types/design-system';
import { cn } from '@/lib/utils';

// Main Card component
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      clickable = false,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    // Base card styles
    const baseStyles = [
      'bg-white rounded-lg transition-all duration-200',
      'border border-neutral-200',
    ];

    // Variant styles
    const variantStyles = {
      default: 'shadow-card',
      elevated: 'shadow-lg',
      outlined: 'border-2 border-neutral-300 shadow-none',
      filled: 'bg-neutral-50 border-neutral-300',
    };

    // Padding styles
    const paddingStyles = {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
      '2xl': 'p-10',
    };

    // Interactive styles
    const interactiveStyles = [
      hover && 'hover:shadow-card-hover hover:-translate-y-1',
      clickable && 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2',
    ];

    const cardClasses = cn(
      baseStyles,
      variantStyles[variant],
      paddingStyles[padding],
      interactiveStyles,
      className
    );

    const handleClick = () => {
      if (clickable && onClick) {
        onClick();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (clickable && onClick && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        className={cardClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? 'button' : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header component
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    const headerClasses = cn(
      'flex items-start justify-between',
      'pb-4 mb-4 border-b border-neutral-200',
      className
    );

    return (
      <div ref={ref} className={headerClasses} {...props}>
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold text-navy-800 truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-neutral-600 truncate">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content component
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => {
    const contentClasses = cn('text-neutral-700', className);

    return (
      <div ref={ref} className={contentClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer component
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    const footerClasses = cn(
      'flex items-center justify-between',
      'pt-4 mt-4 border-t border-neutral-200',
      className
    );

    return (
      <div ref={ref} className={footerClasses} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Export all card components
export { Card, CardHeader, CardContent, CardFooter };
export default Card;