'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface CoursesErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CoursesError({ error, reset }: CoursesErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Courses page error:', error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        {/* Error icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Unable to load courses
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          We're having trouble loading the course catalog. This might be a temporary issue.
        </p>

        {/* Action buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={reset}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-teal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors"
          >
            Try again
          </button>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors"
          >
            Go home
          </Link>
        </div>

        {/* Alternative actions */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            While we fix this issue, you can:
          </p>
          <div className="space-y-2 sm:space-y-0 sm:space-x-6 sm:flex sm:justify-center text-sm">
            <Link
              href="/about"
              className="text-accent-teal hover:text-primary-navy transition-colors"
            >
              Learn about us
            </Link>
            <Link
              href="/instructors"
              className="text-accent-teal hover:text-primary-navy transition-colors"
            >
              Meet our instructors
            </Link>
            <Link
              href="/contact"
              className="text-accent-teal hover:text-primary-navy transition-colors"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}