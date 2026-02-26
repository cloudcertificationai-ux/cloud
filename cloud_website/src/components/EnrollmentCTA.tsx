'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ShoppingCartIcon, CheckCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface Course {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
  currency: string;
}

interface EnrollmentCTAProps {
  course: Course;
  isEnrolled?: boolean;
  className?: string;
}

export default function EnrollmentCTA({ course, isEnrolled = false, className = '' }: EnrollmentCTAProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const price = course.priceCents / 100;
  const isFree = course.priceCents === 0;

  const handleEnroll = async () => {
    // Redirect to sign in if not authenticated
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/courses/${course.slug}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isFree) {
        // Free enrollment - create enrollment directly
        const response = await fetch(`/api/courses/${course.slug}/enroll`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Failed to enroll');
        }

        // Redirect to course content
        router.push(`/courses/${course.slug}/learn`);
      } else {
        // Paid enrollment - redirect to payment
        const response = await fetch('/api/checkout/create-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId: course.id,
            successUrl: `${window.location.origin}/courses/${course.slug}/learn`,
            cancelUrl: `${window.location.origin}/courses/${course.slug}`,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error?.message || 'Failed to create checkout session');
        }

        const { sessionUrl } = await response.json();
        
        // Redirect to Stripe checkout
        window.location.href = sessionUrl;
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessCourse = () => {
    router.push(`/courses/${course.slug}/learn`);
  };

  if (isEnrolled) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4 text-green-600">
          <CheckCircleIcon className="w-6 h-6" />
          <span className="font-semibold">You're enrolled in this course</span>
        </div>
        <button
          onClick={handleAccessCourse}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          aria-label="Continue learning this course"
        >
          Continue Learning
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Price Display */}
      <div className="mb-6">
        {isFree ? (
          <div className="text-center">
            <span className="text-3xl font-bold text-green-600">Free</span>
            <p className="text-sm text-gray-600 mt-1">Full access at no cost</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-sm text-gray-600">{course.currency}</span>
              <span className="text-4xl font-bold text-gray-900">
                {price.toFixed(2)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">One-time payment</p>
          </div>
        )}
      </div>

            <button
              onClick={handleEnroll}
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-colors mb-4 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isFree
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              aria-label={isFree ? 'Enroll in this free course' : 'Enroll in this course and proceed to payment'}
              aria-busy={isLoading}
            >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            {isFree ? (
              <>
                <CheckCircleIcon className="w-6 h-6" />
                Enroll for Free
              </>
            ) : (
              <>
                <ShoppingCartIcon className="w-6 h-6" />
                Enroll Now
              </>
            )}
          </span>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* What's Included */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-900 mb-3">This course includes:</p>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Lifetime access to all course materials</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Certificate of completion</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Access on mobile and desktop</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span>Instructor support and Q&A</span>
          </li>
        </ul>
      </div>

      {/* Money-back Guarantee */}
      {!isFree && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <LockClosedIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">30-Day Money-Back Guarantee</p>
              <p className="text-xs text-blue-700 mt-1">
                Not satisfied? Get a full refund within 30 days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sign in prompt for non-authenticated users */}
      {!session && (
        <p className="text-xs text-center text-gray-500 mt-4">
          You'll be asked to sign in to complete enrollment
        </p>
      )}
    </div>
  );
}
