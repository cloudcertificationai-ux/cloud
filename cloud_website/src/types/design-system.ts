// Design System TypeScript Interfaces for Simplilearn-inspired redesign

// Base component props that all UI components should extend
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Color variants for consistent theming
export type ColorVariant = 
  | 'primary' 
  | 'navy' 
  | 'accent' 
  | 'warning' 
  | 'success' 
  | 'error' 
  | 'neutral';

// Size variants for consistent sizing
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Button component interfaces
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: SizeVariant;
  color?: ColorVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  href?: string; // For link-style buttons
  target?: '_blank' | '_self' | '_parent' | '_top';
}

// Card component interfaces
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: SizeVariant | 'none';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export interface CardHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export interface CardContentProps extends BaseComponentProps {
  // Content-specific props can be added here
}

export interface CardFooterProps extends BaseComponentProps {
  // Footer-specific props can be added here
}

// Badge component interfaces
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'outline' | 'filled';
  color?: ColorVariant;
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

// Input component interfaces
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'color'>, BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  error?: boolean;
  helperText?: string;
  label?: string;
  size?: SizeVariant;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// Typography component interfaces
export interface TypographyProps extends BaseComponentProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: ColorVariant | 'inherit';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  as?: React.ElementType;
}

// Avatar component interfaces
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: SizeVariant;
  fallback?: string;
  rounded?: boolean;
  border?: boolean;
}

// Loading/Skeleton component interfaces
export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export interface SpinnerProps extends BaseComponentProps {
  size?: SizeVariant;
  color?: ColorVariant;
}

// Modal/Dialog component interfaces
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

// Dropdown/Select component interfaces
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps extends BaseComponentProps {
  options: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  label?: string;
  size?: SizeVariant;
  fullWidth?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  onChange?: (value: string | number | (string | number)[]) => void;
}

// Toast/Notification component interfaces
export interface ToastProps extends BaseComponentProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Progress component interfaces
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: SizeVariant;
  color?: ColorVariant;
  showLabel?: boolean;
  label?: string;
  variant?: 'linear' | 'circular';
}

// Tabs component interfaces
export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  defaultActiveTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: SizeVariant;
}

// Breadcrumb component interfaces
export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
}

// Pagination component interfaces
export interface PaginationProps extends BaseComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  size?: SizeVariant;
  maxVisiblePages?: number;
}

// Search component interfaces
export interface SearchProps extends BaseComponentProps {
  placeholder?: string;
  value?: string;
  onSearch?: (query: string) => void;
  onChange?: (value: string) => void;
  suggestions?: string[];
  loading?: boolean;
  size?: SizeVariant;
  fullWidth?: boolean;
}

// Layout component interfaces
export interface ContainerProps extends BaseComponentProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: SizeVariant;
  centered?: boolean;
}

export interface GridProps extends BaseComponentProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gap?: SizeVariant;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export interface FlexProps extends BaseComponentProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: SizeVariant;
}

// Animation and transition interfaces
export interface AnimationProps {
  animation?: 'fade-in' | 'fade-in-up' | 'fade-in-down' | 'slide-in-left' | 'slide-in-right' | 'scale-in' | 'bounce-in';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: 'none' | 'short' | 'medium' | 'long';
}

// Theme and styling interfaces
export interface ThemeConfig {
  colors: {
    primary: string;
    navy: string;
    accent: string;
    warning: string;
    success: string;
    error: string;
    neutral: string;
  };
  fonts: {
    sans: string;
    serif: string;
    mono: string;
    display: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Responsive design interfaces
export interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// Accessibility interfaces
export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  role?: string;
  tabIndex?: number;
}

// Form interfaces
export interface FormFieldProps extends BaseComponentProps, AccessibilityProps {
  name: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string | boolean;
  helperText?: string;
}

// Icon interfaces
export interface IconProps extends BaseComponentProps {
  name?: string;
  size?: SizeVariant | number;
  color?: ColorVariant;
  strokeWidth?: number;
}

// Data display interfaces
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: PaginationProps;
  sortable?: boolean;
  selectable?: boolean;
  onRowClick?: (record: T, index: number) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
}

// Export all interfaces for easy importing