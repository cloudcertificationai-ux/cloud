'use client'

import { Fragment } from 'react'
import { Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface NotificationProps {
  show: boolean
  onClose: () => void
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  autoClose?: boolean
  duration?: number
}

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
}

const colors = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-400',
    title: 'text-green-800',
    message: 'text-green-700',
    button: 'text-green-500 hover:text-green-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-400',
    title: 'text-red-800',
    message: 'text-red-700',
    button: 'text-red-500 hover:text-red-600',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    message: 'text-yellow-700',
    button: 'text-yellow-500 hover:text-yellow-600',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    message: 'text-blue-700',
    button: 'text-blue-500 hover:text-blue-600',
  },
}

export default function Notification({
  show,
  onClose,
  type,
  title,
  message,
  autoClose = true,
  duration = 5000,
}: NotificationProps) {
  const Icon = icons[type]
  const colorScheme = colors[type]

  // Auto close functionality
  if (autoClose && show) {
    setTimeout(() => {
      onClose()
    }, duration)
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
      <Transition
        show={show}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={`
          ${colorScheme.bg} ${colorScheme.border} 
          border rounded-xl p-4 shadow-large backdrop-blur-sm
        `}>
          <div className="flex">
            <div className="flex-shrink-0">
              <Icon className={`h-6 w-6 ${colorScheme.icon}`} />
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-semibold ${colorScheme.title}`}>
                {title}
              </p>
              {message && (
                <p className={`mt-1 text-sm ${colorScheme.message}`}>
                  {message}
                </p>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`
                  inline-flex rounded-md p-1.5 transition-colors
                  ${colorScheme.button} focus:outline-none focus:ring-2 focus:ring-offset-2
                `}
                onClick={onClose}
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  )
}

// Toast notification hook
export function useNotification() {
  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message?: string
  ) => {
    // This would integrate with your notification system
    // For now, we'll use react-hot-toast which is already set up
    console.log(`${type}: ${title}${message ? ` - ${message}` : ''}`)
  }

  return {
    success: (title: string, message?: string) => showNotification('success', title, message),
    error: (title: string, message?: string) => showNotification('error', title, message),
    warning: (title: string, message?: string) => showNotification('warning', title, message),
    info: (title: string, message?: string) => showNotification('info', title, message),
  }
}