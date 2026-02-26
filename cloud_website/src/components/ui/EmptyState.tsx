'use client'

import { ReactNode } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: ReactNode
  }
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-6 ${className}`} role="status" aria-live="polite">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mb-6">
        {icon ? (
          <div className="text-neutral-400" aria-hidden="true">
            {icon}
          </div>
        ) : (
          <div className="w-12 h-12 bg-neutral-300 rounded-xl" aria-hidden="true"></div>
        )}
      </div>
      
      <h3 className="text-xl font-semibold text-navy-800 mb-2">
        {title}
      </h3>
      
      <p className="text-navy-500 mb-8 max-w-md mx-auto">
        {description}
      </p>
      
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="btn-primary inline-flex items-center"
          >
            {action.icon || <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />}
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="btn-primary inline-flex items-center"
          >
            {action.icon || <PlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />}
            {action.label}
          </button>
        )
      )}
    </div>
  )
}

export function EmptyStateCard({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  )
}
