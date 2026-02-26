import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Anywheredoor',
  description: 'The page you are looking for could not be found. Explore our courses and learning opportunities.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        {/* 404 illustration */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-primary-navy mb-8">
          <span className="text-4xl font-bold text-white">404</span>
        </div>

        {/* Error message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Page not found
        </h1>
        
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. Perhaps you'd like to explore our courses or return to the homepage.
        </p>

        {/* Action buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link
            href="/courses"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-teal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors"
          >
            Browse Courses
          </Link>
          
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors"
          >
            Go Home
          </Link>
        </div>

        {/* Additional help */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need help finding what you're looking for?
          </p>
          <div className="space-y-2 sm:space-y-0 sm:space-x-6 sm:flex sm:justify-center text-sm">
            <Link
              href="/contact"
              className="text-accent-teal hover:text-primary-navy transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/about"
              className="text-accent-teal hover:text-primary-navy transition-colors"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}