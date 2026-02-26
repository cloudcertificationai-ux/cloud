'use client';

import React from 'react';
import { AvatarProps } from '@/types/design-system';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = '',
      size = 'md',
      fallback,
      rounded = true,
      border = false,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    // Reset error state when src changes
    React.useEffect(() => {
      setImageError(false);
      setImageLoaded(false);
    }, [src]);

    // Size styles
    const sizeStyles = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
      '2xl': 'h-20 w-20 text-2xl',
    };

    // Base avatar styles
    const baseStyles = [
      'inline-flex items-center justify-center',
      'bg-neutral-100 text-neutral-600',
      'font-medium select-none',
      'overflow-hidden flex-shrink-0',
    ];

    // Border styles
    const borderStyles = border ? 'ring-2 ring-white shadow-lg' : '';

    // Rounded styles
    const roundedStyles = rounded ? 'rounded-full' : 'rounded-lg';

    // Combine avatar styles
    const avatarClasses = cn(
      baseStyles,
      sizeStyles[size],
      borderStyles,
      roundedStyles,
      className
    );

    // Generate fallback text from name or use provided fallback
    const getFallbackText = () => {
      if (fallback) return fallback;
      if (alt) {
        return alt
          .split(' ')
          .map(word => word.charAt(0))
          .join('')
          .toUpperCase()
          .slice(0, 2);
      }
      return '?';
    };

    // Handle image load error
    const handleImageError = () => {
      setImageError(true);
      setImageLoaded(false);
    };

    // Handle image load success
    const handleImageLoad = () => {
      setImageError(false);
      setImageLoaded(true);
    };

    return (
      <div ref={ref} className={avatarClasses} {...props}>
        {src && !imageError ? (
          <>
            <img
              src={src}
              alt={alt}
              className={cn(
                'h-full w-full object-cover transition-opacity duration-200',
                imageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                <div className="animate-pulse bg-neutral-200 h-full w-full" />
              </div>
            )}
          </>
        ) : (
          <span className="font-medium">
            {getFallbackText()}
          </span>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;