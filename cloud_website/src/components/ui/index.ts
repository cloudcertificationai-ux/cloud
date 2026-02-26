// Design System UI Components
// Simplilearn-inspired component library

// Base components
export { default as Button } from './Button';
export { default as Badge } from './Badge';
export { default as Input } from './Input';
export { default as Typography } from './Typography';
export { default as Avatar } from './Avatar';
export { default as Spinner } from './Spinner';

// Card components
export { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  default as CardComponent 
} from './Card';

// Empty state components
export { default as EmptyState, EmptyStateCard } from './EmptyState';
export { 
  EmptyCoursesState, 
  EmptyEnrollmentsState, 
  EmptyAnalyticsState 
} from './EmptyStates';

// Re-export types for convenience
export type {
  ButtonProps,
  BadgeProps,
  InputProps,
  TypographyProps,
  AvatarProps,
  SpinnerProps,
  CardProps,
  CardHeaderProps,
  CardContentProps,
  CardFooterProps,
} from '@/types/design-system';