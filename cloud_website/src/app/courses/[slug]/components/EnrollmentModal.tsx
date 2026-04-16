'use client';

import { useState, Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Course } from '@/types';
import {
  XMarkIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

interface EnrollmentModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentConfig {
  stripe: { enabled: boolean; publishableKey: string };
  paypal: { enabled: boolean; clientId: string; mode: string };
  razorpay: { enabled: boolean; keyId: string };
}

type PaymentProvider = 'stripe' | 'paypal' | 'razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function EnrollmentModal({ course, isOpen, onClose }: EnrollmentModalProps) {
  const { isAuthenticated, redirectToSignIn } = useAuth();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'select-payment' | 'processing' | 'success'>('confirm');
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);

  const isFree = !course.price || course.price.amount === 0;

  // Fetch payment config on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/payment-config')
        .then((r) => r.json())
        .then(setPaymentConfig)
        .catch(() => setPaymentConfig(null));
    }
  }, [isOpen]);

  const availableProviders = paymentConfig
    ? ([
        paymentConfig.stripe.enabled && 'stripe',
        paymentConfig.paypal.enabled && 'paypal',
        paymentConfig.razorpay.enabled && 'razorpay',
      ].filter(Boolean) as PaymentProvider[])
    : [];

  const handleEnroll = async () => {
    setError(null);

    if (!isAuthenticated) {
      sessionStorage.setItem('enrollmentIntent', JSON.stringify({
        courseId: course.id,
        courseSlug: course.slug,
        timestamp: Date.now(),
      }));
      redirectToSignIn(`/courses/${course.slug}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, courseSlug: course.slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresAuth) {
          sessionStorage.setItem('enrollmentIntent', JSON.stringify({
            courseId: course.id,
            courseSlug: course.slug,
            timestamp: Date.now(),
          }));
          redirectToSignIn(`/courses/${course.slug}`);
          return;
        }
        throw new Error(data.error || 'Failed to enroll');
      }

      // Free course — enrollment complete
      if (data.success && !data.requiresPayment) {
        setStep('success');
        setIsSubmitting(false);
        sessionStorage.removeItem('enrollmentIntent');
        return;
      }

      // Paid course — move to payment selection
      if (data.requiresPayment && data.purchaseId) {
        setPurchaseId(data.purchaseId);
        setIsSubmitting(false);

        // If only one payment method is active, skip the selection step
        if (availableProviders.length === 1) {
          setSelectedProvider(availableProviders[0]);
          await handlePayment(availableProviders[0], data.purchaseId);
        } else if (availableProviders.length > 1) {
          setStep('select-payment');
        } else {
          throw new Error('No payment methods are configured. Please contact support.');
        }
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during enrollment');
      setStep('confirm');
      setIsSubmitting(false);
    }
  };

  const handlePayment = async (provider: PaymentProvider, pId?: string) => {
    const pid = pId || purchaseId;
    if (!pid) return;

    setIsSubmitting(true);
    setStep('processing');
    setError(null);

    try {
      if (provider === 'stripe') {
        await handleStripePayment(pid);
      } else if (provider === 'paypal') {
        await handlePayPalPayment(pid);
      } else if (provider === 'razorpay') {
        await handleRazorpayPayment(pid);
      }
    } catch (err) {
      console.error(`${provider} payment error:`, err);
      setError(err instanceof Error ? err.message : `${provider} payment failed`);
      setStep(availableProviders.length > 1 ? 'select-payment' : 'confirm');
      setIsSubmitting(false);
    }
  };

  const handleStripePayment = async (pid: string) => {
    const checkoutResponse = await fetch('/api/payments/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId: pid }),
    });

    const checkoutData = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      throw new Error(checkoutData.error || 'Failed to create Stripe checkout session');
    }

    if (checkoutData.url) {
      sessionStorage.removeItem('enrollmentIntent');
      window.location.href = checkoutData.url;
    } else {
      throw new Error('Failed to initialize Stripe payment');
    }
  };

  const handlePayPalPayment = async (pid: string) => {
    const response = await fetch('/api/payments/paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId: pid }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create PayPal order');
    }

    if (data.approvalUrl) {
      sessionStorage.removeItem('enrollmentIntent');
      window.location.href = data.approvalUrl;
    } else {
      throw new Error('Failed to get PayPal approval URL');
    }
  };

  const handleRazorpayPayment = async (pid: string) => {
    const response = await fetch('/api/payments/razorpay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId: pid }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create Razorpay order');
    }

    // Load Razorpay script dynamically
    if (!window.Razorpay) {
      await loadRazorpayScript();
    }

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: 'Cloud Certification',
      description: data.courseName,
      order_id: data.orderId,
      prefill: {
        email: data.userEmail,
        name: data.userName,
      },
      theme: { color: '#2563eb' },
      handler: async (response: any) => {
        try {
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              purchaseId: pid,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok) {
            throw new Error(verifyData.error || 'Payment verification failed');
          }

          sessionStorage.removeItem('enrollmentIntent');
          setStep('success');
          setIsSubmitting(false);
        } catch (err) {
          console.error('Razorpay verification error:', err);
          setError(err instanceof Error ? err.message : 'Payment verification failed');
          setStep('select-payment');
          setIsSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => {
          setStep(availableProviders.length > 1 ? 'select-payment' : 'confirm');
          setIsSubmitting(false);
          setError('Payment was cancelled. Please try again.');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    // Don't set isSubmitting to false here — Razorpay modal is open
  };

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.getElementById('razorpay-sdk')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-sdk';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  };

  const resetModal = () => {
    setStep('confirm');
    setError(null);
    setPurchaseId(null);
    setSelectedProvider(null);
    onClose();
  };

  const providerInfo: Record<PaymentProvider, { name: string; description: string; color: string; logo: string }> = {
    stripe: {
      name: 'Credit / Debit Card',
      description: 'Visa, Mastercard, Amex, and more — powered by Stripe',
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
      logo: '💳',
    },
    paypal: {
      name: 'PayPal',
      description: 'Pay with your PayPal balance or linked accounts',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      logo: '🅿',
    },
    razorpay: {
      name: 'UPI / Net Banking / Cards',
      description: 'UPI, Net Banking, Cards, Wallets — powered by Razorpay',
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
      logo: '🏦',
    },
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
                      {step === 'select-payment' && 'Choose Payment Method'}
                      {step === 'processing' && 'Processing...'}
                      {step === 'success' && 'Enrollment Successful!'}
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mt-1">{course.title}</p>
                  </div>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">

                  {/* CONFIRM STEP */}
                  {step === 'confirm' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Course Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Course:</span>
                            <span className="font-medium">{course.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium text-lg">
                              {isFree ? (
                                <span className="text-green-600">Free</span>
                              ) : (
                                `${course.price?.currency || ''} ${course.price?.amount}`
                              )}
                            </span>
                          </div>
                          {course.price?.originalPrice && course.price.originalPrice > course.price.amount && (
                            <div className="flex justify-between text-green-600">
                              <span>You Save:</span>
                              <span>-{course.price?.currency || ''} {course.price.originalPrice - course.price.amount}</span>
                            </div>
                          )}
                        </div>
                      </div>

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

                      {/* Show payment methods available */}
                      {!isFree && availableProviders.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Accepted:</span>
                          {availableProviders.map((p) => (
                            <span key={p} className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">{p === 'stripe' ? 'Cards' : p}</span>
                          ))}
                        </div>
                      )}

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      )}

                      {!isAuthenticated && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            You'll be redirected to sign in before completing enrollment.
                          </p>
                        </div>
                      )}

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
                          {isSubmitting
                            ? 'Processing...'
                            : isFree
                            ? 'Enroll Now'
                            : availableProviders.length > 1
                            ? 'Continue to Payment'
                            : `Pay ${course.price?.currency || ''} ${course.price?.amount}`}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SELECT PAYMENT METHOD */}
                  {step === 'select-payment' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Choose how you'd like to pay for <strong>{course.title}</strong>.
                      </p>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-800">{error}</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {availableProviders.map((provider) => {
                          const info = providerInfo[provider];
                          return (
                            <button
                              key={provider}
                              onClick={() => handlePayment(provider)}
                              disabled={isSubmitting}
                              className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all text-left ${info.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              <span className="text-2xl">{info.logo}</span>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">{info.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{info.description}</div>
                              </div>
                              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex justify-start pt-2">
                        <button
                          type="button"
                          onClick={() => setStep('confirm')}
                          disabled={isSubmitting}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          ← Back
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PROCESSING */}
                  {step === 'processing' && (
                    <div className="text-center space-y-6 py-8">
                      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Payment</h3>
                        <p className="text-gray-600">Please wait while we set up your payment...</p>
                      </div>
                    </div>
                  )}

                  {/* SUCCESS */}
                  {step === 'success' && (
                    <div className="text-center space-y-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <CheckIcon className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to the Course!</h3>
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
                          <li>• Get your certification upon completion</li>
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
