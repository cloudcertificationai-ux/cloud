// src/components/CourseCompletionBadge.tsx
'use client';

import { CheckCircleIcon, TrophyIcon } from '@heroicons/react/24/solid';

interface CourseCompletionBadgeProps {
  completionPercentage: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export default function CourseCompletionBadge({
  completionPercentage,
  status,
  size = 'md',
  showPercentage = true,
}: CourseCompletionBadgeProps) {
  const isCompleted = status === 'COMPLETED';
  const isInProgress = completionPercentage > 0 && completionPercentage < 100;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (isCompleted) {
    return (
      <div
        className={`inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full font-medium ${sizeClasses[size]}`}
      >
        <TrophyIcon className={iconSizes[size]} />
        <span>Completed</span>
      </div>
    );
  }

  if (isInProgress) {
    return (
      <div
        className={`inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full font-medium ${sizeClasses[size]}`}
      >
        <div className="relative">
          <svg className={iconSizes[size]} viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.2"
            />
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 10}`}
              strokeDashoffset={`${2 * Math.PI * 10 * (1 - completionPercentage / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 12 12)"
            />
          </svg>
        </div>
        {showPercentage && <span>{Math.round(completionPercentage)}%</span>}
        {!showPercentage && <span>In Progress</span>}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 bg-gray-100 text-gray-600 rounded-full font-medium ${sizeClasses[size]}`}
    >
      <span>Not Started</span>
    </div>
  );
}
