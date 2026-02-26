import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components';

// Generic fallback for missing content
export function ContentFallback({ 
  title = "Content unavailable", 
  message = "This content is currently unavailable.",
  showRetry = false,
  onRetry,
  className = ""
}: {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`text-center py-8 px-4 ${className}`}>
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
        <svg
          className="h-6 w-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="text-accent-teal hover:text-primary-navy font-medium text-sm"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// Fallback for missing course data
export function CourseFallback({ 
  showImage = true,
  showActions = true,
  className = ""
}: {
  showImage?: boolean;
  showActions?: boolean;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      {showImage && (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <svg
            className="h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Course unavailable
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Course information unavailable
        </h3>
        
        <p className="text-gray-600 text-sm mb-4">
          This course information is currently unavailable. Please check back later or contact support.
        </p>
        
        {showActions && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span>Duration: --</span>
              <span className="mx-2">•</span>
              <span>Level: --</span>
            </div>
            <Link
              href="/courses"
              className="text-accent-teal hover:text-primary-navy font-medium text-sm"
            >
              Browse courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Fallback for missing instructor data
export function InstructorFallback({ 
  showImage = true,
  showBio = true,
  className = ""
}: {
  showImage?: boolean;
  showBio?: boolean;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 text-center ${className}`}>
      {showImage && (
        <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="h-8 w-8 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        Instructor unavailable
      </h3>
      
      <p className="text-gray-600 text-sm mb-2">
        Information not available
      </p>
      
      {showBio && (
        <p className="text-gray-500 text-xs mb-4">
          This instructor's profile is currently unavailable. Please check back later.
        </p>
      )}
      
      <Link
        href="/instructors"
        className="text-accent-teal hover:text-primary-navy font-medium text-sm"
      >
        View all instructors
      </Link>
    </div>
  );
}

// Fallback for missing image
export function ImageFallback({ 
  alt = "Image unavailable",
  className = "",
  iconSize = "h-8 w-8"
}: {
  alt?: string;
  className?: string;
  iconSize?: string;
}) {
  return (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <svg
          className={`mx-auto text-gray-300 ${iconSize}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-xs text-gray-400 mt-1">{alt}</p>
      </div>
    </div>
  );
}

// Fallback for empty search results
export function EmptySearchFallback({ 
  query,
  onClearFilters,
  showSuggestions = true
}: {
  query?: string;
  onClearFilters?: () => void;
  showSuggestions?: boolean;
}) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No courses found
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {query 
          ? `We couldn't find any courses matching "${query}". Try adjusting your search or filters.`
          : "No courses match your current filters. Try adjusting your criteria."
        }
      </p>
      
      <div className="space-y-3 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-teal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors"
          >
            Clear filters
          </button>
        )}
        
        <Link
          href="/courses"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors"
        >
          Browse all courses
        </Link>
      </div>
      
      {showSuggestions && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['Web Development', 'Data Science', 'Python', 'JavaScript', 'Machine Learning'].map((term) => (
              <Link
                key={term}
                href={`/courses?search=${encodeURIComponent(term)}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback for loading states
export function LoadingFallback({ 
  message = "Loading...",
  className = ""
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mx-auto flex items-center justify-center h-12 w-12 mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-teal"></div>
      </div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

// Fallback for network errors
export function NetworkErrorFallback({ 
  onRetry,
  className = ""
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
        <svg
          className="h-6 w-6 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Connection error
      </h3>
      
      <p className="text-gray-600 mb-4">
        Unable to connect to our servers. Please check your internet connection and try again.
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-accent-teal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

// Fallback for maintenance mode
export function MaintenanceFallback({ 
  estimatedTime,
  className = ""
}: {
  estimatedTime?: string;
  className?: string;
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
        <svg
          className="h-8 w-8 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Under maintenance
      </h3>
      
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        We're currently performing scheduled maintenance to improve your experience.
        {estimatedTime && ` We'll be back ${estimatedTime}.`}
      </p>
      
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors"
      >
        Go to homepage
      </Link>
    </div>
  );
}