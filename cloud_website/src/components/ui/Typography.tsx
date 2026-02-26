'use client';

import React from 'react';
import { TypographyProps } from '@/types/design-system';
import { cn } from '@/lib/utils';

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  (
    {
      className,
      variant = 'body1',
      color = 'inherit',
      align = 'left',
      weight = 'normal',
      as,
      children,
      ...props
    },
    ref
  ) => {
    // Default HTML elements for each variant
    const defaultElements = {
      h1: 'h1',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      h5: 'h5',
      h6: 'h6',
      body1: 'p',
      body2: 'p',
      caption: 'span',
      overline: 'span',
    } as const;

    // Typography variant styles
    const variantStyles = {
      h1: 'text-4xl md:text-5xl lg:text-6xl font-bold leading-tight',
      h2: 'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
      h3: 'text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight',
      h4: 'text-xl md:text-2xl lg:text-3xl font-semibold leading-snug',
      h5: 'text-lg md:text-xl lg:text-2xl font-medium leading-snug',
      h6: 'text-base md:text-lg lg:text-xl font-medium leading-normal',
      body1: 'text-base leading-relaxed',
      body2: 'text-sm leading-relaxed',
      caption: 'text-xs leading-normal',
      overline: 'text-xs uppercase tracking-wider font-medium leading-normal',
    };

    // Color styles
    const colorStyles = {
      inherit: '',
      primary: 'text-primary-600',
      navy: 'text-navy-800',
      accent: 'text-accent-600',
      warning: 'text-warning-600',
      success: 'text-success-600',
      error: 'text-error-600',
      neutral: 'text-neutral-600',
    };

    // Text alignment styles
    const alignStyles = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    // Font weight styles
    const weightStyles = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    };

    // Combine all styles
    const typographyClasses = cn(
      variantStyles[variant],
      color !== 'inherit' && colorStyles[color],
      alignStyles[align],
      weightStyles[weight],
      className
    );

    // Determine the HTML element to render
    const Component = (as || defaultElements[variant]) as React.ElementType;

    return React.createElement(
      Component,
      {
        ref,
        className: typographyClasses,
        ...props,
      },
      children
    );
  }
);

Typography.displayName = 'Typography';

export default Typography;