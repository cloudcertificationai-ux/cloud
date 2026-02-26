'use client';

import React, { useState, useEffect } from 'react';

export interface ErrorMessageProps {
  /**
   * Error message to display
   */
  message: string;
  
  /**
   * Error type for styling and icon selection
   */
  type?: 'error' | 'warning' | 'info';
  
  /**
   * Optional title for the error
   */
  title?: string;
  
  /**
   * Optional suggested actions to resolve the error
   */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  
  /**
   * Whether to show a retry button
   */
  showRetry?: boolean;
  
  /**
   * Callback when retry is clicked
   */
  onRetry?: () => void;
  
  /**
   * Whether the error is dismissible
   */
  dismissible?: boolean;
  
  /**
   * Callback when error is dismissed
   */
  onDismiss?: () => void;
  
  /**
   * Auto-dismiss after specified milliseconds
   */
  autoDismiss?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * ErrorMessage component for displaying user-friendly error messages
 * with optional retry mechanisms and suggested actions
 */
export function ErrorMessage({
  message,
  type = 'error',
  title,
  actions,
  showRetry = false,
  onRetry,
  dismissible = false,
  onDismiss,
  autoDismiss,
  className = '',
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto-dismiss functionality
  useEffect(() => {
    if (autoDismiss && autoDismiss > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismiss);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  // Determine styling based on error type
  const typeStyles = {
    error: {
      container: 'bg-red-50 border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      message: 'text-red-800',
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      ),
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      message: 'text-yellow-800',
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      ),
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      message: 'text-blue-800',
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className={`rounded-lg border p-4 ${styles.container} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        {/* Icon */}
        <div className="flex-shrink-0">
          <svg
            className={`h-5 w-5 ${styles.icon}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {styles.iconPath}
          </svg>
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${styles.message}`}>
            {message}
          </div>

          {/* Actions */}
          {(actions || showRetry) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {showRetry && onRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-accent-teal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRetrying ? (
                    <>
                      <svg
                        className="animate-spin -ml-0.5 mr-2 h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Retrying...
                    </>
                  ) : (
                    'Try again'
                  )}
                </button>
              )}

              {actions?.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={
                    action.variant === 'primary'
                      ? 'inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-accent-teal hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors'
                      : 'inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors'
                  }
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dismiss button */}
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={handleDismiss}
              className={`inline-flex rounded-md p-1.5 ${styles.icon} hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-teal transition-colors`}
              aria-label="Dismiss"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Authentication-specific error messages with predefined actions
 */
export function AuthenticationErrorMessage({
  error,
  onRetry,
  callbackUrl,
}: {
  error: string;
  onRetry?: () => void;
  callbackUrl?: string;
}) {
  const errorMessages: Record<string, { title: string; message: string; showRetry: boolean }> = {
    SessionExpired: {
      title: 'Session Expired',
      message: 'Your session has expired due to inactivity. Please sign in again to continue.',
      showRetry: false,
    },
    OAuthSignin: {
      title: 'Sign In Error',
      message: 'There was a problem starting the sign-in process. Please try again.',
      showRetry: true,
    },
    OAuthCallback: {
      title: 'Authentication Error',
      message: 'There was a problem completing the sign-in process. Please try again.',
      showRetry: true,
    },
    OAuthCreateAccount: {
      title: 'Account Creation Error',
      message: 'We couldn\'t create your account. Please try again or contact support.',
      showRetry: true,
    },
    EmailCreateAccount: {
      title: 'Account Creation Error',
      message: 'We couldn\'t create your account with this email. Please try again.',
      showRetry: true,
    },
    Callback: {
      title: 'Authentication Error',
      message: 'There was a problem during authentication. Please try again.',
      showRetry: true,
    },
    OAuthAccountNotLinked: {
      title: 'Account Already Exists',
      message: 'An account with this email already exists. Click "Continue with Auth0" again - we\'ll automatically link your accounts for a seamless experience.',
      showRetry: true,
    },
    EmailSignin: {
      title: 'Email Sign In Error',
      message: 'We couldn\'t send you a sign-in email. Please check your email address and try again.',
      showRetry: true,
    },
    CredentialsSignin: {
      title: 'Invalid Credentials',
      message: 'The credentials you provided are incorrect. Please try again.',
      showRetry: true,
    },
    SessionRequired: {
      title: 'Authentication Required',
      message: 'You need to be signed in to access this page.',
      showRetry: false,
    },
    Default: {
      title: 'Authentication Error',
      message: 'An unexpected error occurred during authentication. Please try again.',
      showRetry: true,
    },
  };

  const errorConfig = errorMessages[error] || errorMessages.Default;

  const actions = [
    {
      label: 'Sign In',
      onClick: () => {
        const signInUrl = callbackUrl
          ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : '/auth/signin';
        window.location.href = signInUrl;
      },
      variant: 'primary' as const,
    },
  ];

  return (
    <ErrorMessage
      type="error"
      title={errorConfig.title}
      message={errorConfig.message}
      showRetry={errorConfig.showRetry}
      onRetry={onRetry}
      actions={actions}
    />
  );
}

/**
 * Inline error message for form fields
 */
export function InlineErrorMessage({
  message,
  className = '',
}: {
  message: string;
  className?: string;
}) {
  return (
    <p className={`text-sm text-red-600 mt-1 ${className}`} role="alert">
      {message}
    </p>
  );
}

/**
 * Toast-style error notification
 */
export function ErrorToast({
  message,
  onDismiss,
  duration = 5000,
}: {
  message: string;
  onDismiss?: () => void;
  duration?: number;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <ErrorMessage
        message={message}
        type="error"
        dismissible
        onDismiss={onDismiss}
        autoDismiss={duration}
        className="shadow-lg"
      />
    </div>
  );
}

/**
 * Enrollment-specific error messages with predefined actions
 */
export function EnrollmentErrorMessage({
  error,
  onRetry,
  courseSlug,
}: {
  error: any;
  onRetry?: () => void;
  courseSlug?: string;
}) {
  // Import enrollment error utilities dynamically to avoid circular dependencies
  const parseEnrollmentError = (err: any) => {
    // This is a simplified version - in production, import from enrollment-errors.ts
    if (err?.error?.includes('already enrolled')) {
      return {
        title: 'Already Enrolled',
        message: 'You are already enrolled in this course. You can access it from your dashboard.',
        showRetry: false,
        actions: [
          {
            label: 'Go to Dashboard',
            onClick: () => window.location.href = '/dashboard',
            variant: 'primary' as const,
          },
        ],
      };
    }

    if (err?.error?.includes('not found')) {
      return {
        title: 'Course Not Found',
        message: 'The course you are trying to enroll in could not be found.',
        showRetry: false,
        actions: [
          {
            label: 'Browse Courses',
            onClick: () => window.location.href = '/courses',
            variant: 'primary' as const,
          },
        ],
      };
    }

    if (err?.requiresAuth || err?.error?.includes('Unauthorized')) {
      return {
        title: 'Sign In Required',
        message: 'You need to be signed in to enroll in courses.',
        showRetry: false,
        actions: [
          {
            label: 'Sign In',
            onClick: () => {
              const callbackUrl = courseSlug ? `/courses/${courseSlug}` : '/courses';
              window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
            },
            variant: 'primary' as const,
          },
        ],
      };
    }

    if (err?.requiresPayment) {
      return {
        title: 'Payment Required',
        message: 'This is a paid course. Please complete the payment process to enroll.',
        showRetry: false,
        actions: [
          {
            label: 'Proceed to Payment',
            onClick: () => {
              // This would be handled by the parent component
              if (onRetry) onRetry();
            },
            variant: 'primary' as const,
          },
        ],
      };
    }

    // Network or server errors
    if (err instanceof TypeError || err?.status >= 500) {
      return {
        title: 'Connection Error',
        message: 'We couldn\'t process your enrollment. Please check your connection and try again.',
        showRetry: true,
        actions: [
          {
            label: 'Contact Support',
            onClick: () => window.location.href = '/contact',
            variant: 'secondary' as const,
          },
        ],
      };
    }

    // Default error
    return {
      title: 'Enrollment Failed',
      message: 'An unexpected error occurred. Please try again or contact support.',
      showRetry: true,
      actions: [
        {
          label: 'Contact Support',
          onClick: () => window.location.href = '/contact',
          variant: 'secondary' as const,
        },
      ],
    };
  };

  const errorConfig = parseEnrollmentError(error);

  return (
    <ErrorMessage
      type="error"
      title={errorConfig.title}
      message={errorConfig.message}
      showRetry={errorConfig.showRetry}
      onRetry={onRetry}
      actions={errorConfig.actions}
    />
  );
}

/**
 * Enrollment status feedback message
 */
export function EnrollmentStatusMessage({
  status,
  courseName,
}: {
  status: 'pending' | 'processing' | 'success' | 'error';
  courseName?: string;
}) {
  const statusConfig = {
    pending: {
      type: 'info' as const,
      title: 'Enrollment Pending',
      message: courseName
        ? `Your enrollment in "${courseName}" is being processed.`
        : 'Your enrollment request is being processed.',
    },
    processing: {
      type: 'info' as const,
      title: 'Processing Enrollment',
      message: 'Please wait while we process your enrollment...',
    },
    success: {
      type: 'info' as const, // Using info instead of success for consistency
      title: 'Enrollment Successful!',
      message: courseName
        ? `You have been successfully enrolled in "${courseName}". You can now access all course materials.`
        : 'You have been successfully enrolled. You can now access all course materials.',
    },
    error: {
      type: 'error' as const,
      title: 'Enrollment Failed',
      message: 'There was a problem processing your enrollment. Please try again.',
    },
  };

  const config = statusConfig[status];

  return (
    <ErrorMessage
      type={config.type}
      title={config.title}
      message={config.message}
      dismissible={status === 'success'}
      autoDismiss={status === 'success' ? 5000 : undefined}
    />
  );
}

/**
 * Session validation error messages with context preservation
 */
export function SessionErrorMessage({
  errorType,
  callbackUrl,
  onSignIn,
}: {
  errorType: 'SessionExpired' | 'SessionInvalid' | 'InactivityTimeout' | 'Unauthorized' | string;
  callbackUrl?: string;
  onSignIn?: () => void;
}) {
  const errorConfig: Record<string, { title: string; message: string }> = {
    SessionExpired: {
      title: 'Session Expired',
      message: 'Your session has expired. Please sign in again to continue where you left off.',
    },
    SessionInvalid: {
      title: 'Invalid Session',
      message: 'Your session is invalid. Please sign in again to continue.',
    },
    InactivityTimeout: {
      title: 'Session Timed Out',
      message: 'Your session has expired due to inactivity. Please sign in again to continue.',
    },
    Unauthorized: {
      title: 'Authentication Required',
      message: 'You need to be signed in to access this page. Please sign in to continue.',
    },
  };

  const config = errorConfig[errorType] || {
    title: 'Authentication Error',
    message: 'There was a problem with your session. Please sign in again.',
  };

  const handleSignIn = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      const signInUrl = callbackUrl
        ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : '/auth/signin';
      window.location.href = signInUrl;
    }
  };

  return (
    <ErrorMessage
      type="warning"
      title={config.title}
      message={config.message}
      actions={[
        {
          label: 'Sign In',
          onClick: handleSignIn,
          variant: 'primary',
        },
      ]}
    />
  );
}

/**
 * Offline status message with queued operations info
 */
export function OfflineMessage({
  queuedOperations = 0,
  onRetry,
  dismissible = false,
}: {
  queuedOperations?: number;
  onRetry?: () => void;
  dismissible?: boolean;
}) {
  const message =
    queuedOperations > 0
      ? `You are currently offline. ${queuedOperations} operation${queuedOperations > 1 ? 's' : ''} will be retried when connection is restored.`
      : 'You are currently offline. Some features may not be available until connection is restored.';

  return (
    <ErrorMessage
      type="warning"
      title="No Internet Connection"
      message={message}
      showRetry={!!onRetry}
      onRetry={onRetry}
      dismissible={dismissible}
      className="border-l-4 border-l-yellow-500"
    />
  );
}

/**
 * Fixed position offline banner
 */
export function OfflineBanner({
  queuedOperations = 0,
  onRetry,
  onDismiss,
}: {
  queuedOperations?: number;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-yellow-50 border-b-2 border-yellow-400 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-yellow-600 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-900">
                No Internet Connection
              </p>
              {queuedOperations > 0 && (
                <p className="text-xs text-yellow-800 mt-0.5">
                  {queuedOperations} operation{queuedOperations > 1 ? 's' : ''} queued for retry
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs font-medium text-yellow-900 hover:text-yellow-700 px-3 py-1 border border-yellow-300 rounded-md hover:bg-yellow-100 transition-colors"
              >
                Retry Now
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-yellow-600 hover:text-yellow-800 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorMessage;
