'use client'

import { ReactNode } from 'react'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period?: string
  }
  color?: 'teal' | 'navy' | 'orange' | 'green' | 'purple' | 'red'
  className?: string
  onClick?: () => void
}

const colorSchemes = {
  teal: {
    gradient: 'from-teal-500 to-teal-600',
    bg: 'from-teal-50 to-teal-100',
    text: 'text-teal-600',
    hover: 'hover:shadow-glow',
  },
  navy: {
    gradient: 'from-navy-500 to-navy-600',
    bg: 'from-navy-50 to-navy-100',
    text: 'text-navy-600',
    hover: 'hover:shadow-medium',
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'from-orange-50 to-orange-100',
    text: 'text-orange-600',
    hover: 'hover:shadow-medium',
  },
  green: {
    gradient: 'from-green-500 to-green-600',
    bg: 'from-green-50 to-green-100',
    text: 'text-green-600',
    hover: 'hover:shadow-medium',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'from-purple-50 to-purple-100',
    text: 'text-purple-600',
    hover: 'hover:shadow-medium',
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    bg: 'from-red-50 to-red-100',
    text: 'text-red-600',
    hover: 'hover:shadow-medium',
  },
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  color = 'teal',
  className = '',
  onClick,
}: StatsCardProps) {
  const colorScheme = colorSchemes[color]
  const isClickable = !!onClick

  return (
    <div
      className={`
        card-hover group relative overflow-hidden
        ${isClickable ? 'cursor-pointer' : ''}
        ${colorScheme.hover}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 opacity-10">
        <div className={`w-full h-full bg-gradient-to-br ${colorScheme.gradient} rounded-full transform rotate-12`}></div>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorScheme.bg} group-hover:scale-110 transition-transform duration-300`}>
            <div className={`w-6 h-6 ${colorScheme.text}`}>
              {icon}
            </div>
          </div>
          
          {change && (
            <div className="flex items-center space-x-1">
              {change.type === 'increase' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-semibold ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.value}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-navy-600">
            {title}
          </p>
          <p className="text-3xl font-bold text-navy-800 group-hover:text-navy-900 transition-colors">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change?.period && (
            <p className="text-xs text-navy-500">
              vs {change.period}
            </p>
          )}
        </div>
      </div>

      {/* Hover effect overlay */}
      {isClickable && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
      )}
    </div>
  )
}

export function StatsGrid({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-container ${className}`}>
      {children}
    </div>
  )
}