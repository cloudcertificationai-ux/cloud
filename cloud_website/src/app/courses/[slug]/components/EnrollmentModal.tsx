'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Course } from '@/types';
import { 
  XMarkIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

interface EnrollmentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function EnrollmentModal({ course, isOpen, onClose }: EnrollmentModalProps) {
  const { isAuthenticated, redirectToSignIn } = useAuth();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm');

  const isFree = !course.price || course.price.amount === 0;

  const handleEnroll = async () => {
    setError(null);
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store enrollment intent in sessionStorage (client-side)
      sessionStorage.setItem('enrollmentIntent', JSON.stringify({
        courseId: course.id,
        courseSlug: course.slug,
        timestamp: Date.now()
      }));
      
      // Redirect to sign in with callback URL
      redirectToSignIn(`/courses/${course.slug}`);
      return;
    }

    setIsSubmitting(true);
    setStep('processing');

    try {
      // Call enrollment API
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          courseSlug: course.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.requiresAuth) {
          // Store intent and redirect to login
          sessionStorage.setItem('enrollmentIntent', JSON.stringify({
            courseId: course.id,
            courseSlug: course.slug,
            timestamp: Date.now()
          }));
          redirectToSignIn(`/courses/${course.slug}`);
          return;
        }
        throw new Error(data.error || 'Failed to enroll');
      }

      // If course is free, enrollment is complete
      if (data.success && !data.requiresPayment) {
        setStep('success');
        setIsSubmitting(false);
        // Clear enrollment intent from sessionStorage
        sessionStorage.removeItem('enrollmentIntent');
        return;
      }

      // If payment is required, redirect to Stripe Checkout
      if (data.requiresPayment && data.purchaseId) {
        const checkoutResponse = await fetch('/api/payments/stripe/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            purchaseId: data.purchaseId,
          }),
        });

        const checkoutData = await checkoutResponse.json();

        if (!checkoutResponse.ok) {
          throw new Error(checkoutData.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (checkoutData.url) {
          // Clear enrollment intent before redirecting
          sessionStorage.removeItem('enrollmentIntent');
          window.location.href = checkoutData.url;
        } else {
          throw new Error('Failed to initialize payment');
        }
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during enrollment');
      setStep('confirm');
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep('confirm');
    setError(null);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                      {step === 'confirm' && 'Enroll in Course'}
                      {step === 'processing' && 'Processing Enrollment'}
                      {step === 'success' && 'Enrollment Successful!'}
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      {course.title}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {step === 'confirm' && (
                    <div className="space-y-6">
                      {/* Course Summary */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Course Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Course:</span>
                            <span className="font-medium">{course.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium">
                              {isFree ? 'Free' : `$${course.price.amount}`}
                            </span>
                          </div>
                          {course.price?.originalPrice && course.price.originalPrice > course.price.amount && (
                            <div className="flex justify-between text-green-600">
                              <span>You Save:</span>
                              <span>-${course.price.originalPrice - course.price.amount}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-gray-600">Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-gray-600">Instant Access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckIcon className="w-5 h-5 text-purple-500" />
                          <span className="text-sm text-gray-600">30-Day Guarantee</span>
                        </div>
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      )}

                      {/* Authentication Notice */}
                      {!isAuthenticated && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            You'll be redirected to sign in before completing enrollment.
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={onClose}
                          disabled={isSubmitting}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEnroll}
                          disabled={isSubmitting}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {!isFree && <CreditCardIcon className="w-5 h-5" />}
                          {isSubmitting ? 'Processing...' : isFree ? 'Enroll Now' : `Pay $${course.price.amount}`}
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 'processing' && (
                    <div className="text-center space-y-6 py-8">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Processing Your Enrollment
                        </h3>
                        <p className="text-gray-600">
                          Please wait while we process your request...
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 'success' && (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckIcon className="w-8 h-8 text-green-600" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Welcome to the Course!
                        </h3>
                        <p className="text-gray-600">
                          You've successfully enrolled in <strong>{course.title}</strong>.
                        </p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
                        <ul className="text-sm text-blue-800 space-y-1 text-left">
                          <li>• Access your course from the dashboard</li>
                          <li>• Start with the first module</li>
                          <li>• Track your progress as you learn</li>
                          <li>• Join the course community</li>
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={resetModal}
                          className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => router.push(`/courses/${course.slug}/learn`)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start Learning
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
