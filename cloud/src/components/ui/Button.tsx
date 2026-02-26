'use client'

import { ReactNode, ButtonHTMLAttributes } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  children: ReactNode
}

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  outline: 'border-2 border-navy-200 text-navy-700 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50 focus:ring-4 focus:ring-teal-200',
}

const sizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = variants[variant]
  const sizeClasses = sizes[size]
  const widthClasses = fullWidth ? 'w-full' : ''
  
  const isDisabled = disabled || loading

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses}
        ${sizeClasses}
        ${widthClasses}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size="sm" 
          className="mr-2" 
        />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

export function ButtonGroup({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`inline-flex rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function FloatingActionButton({
  onClick,
  icon,
  className = '',
  ...props
}: {
  onClick: () => void
  icon: ReactNode
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 bg-gradient-to-r from-teal-500 to-teal-600 
        hover:from-teal-600 hover:to-teal-700
        text-white rounded-full shadow-large hover:shadow-glow
        flex items-center justify-center
        transition-all duration-300 transform hover:scale-110 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-teal-200
        float-animation
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  )
}