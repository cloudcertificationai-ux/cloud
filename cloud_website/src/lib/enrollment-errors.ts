// src/lib/enrollment-errors.ts

/**
 * Enrollment error types
 */
export enum EnrollmentErrorType {
  ALREADY_ENROLLED = 'ALREADY_ENROLLED',
  COURSE_NOT_FOUND = 'COURSE_NOT_FOUND',
  COURSE_UNAVAILABLE = 'COURSE_UNAVAILABLE',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  ENROLLMENT_LIMIT_REACHED = 'ENROLLMENT_LIMIT_REACHED',
  COURSE_FULL = 'COURSE_FULL',
  PREREQUISITES_NOT_MET = 'PREREQUISITES_NOT_MET',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Enrollment error details
 */
export interface EnrollmentError {
  type: EnrollmentErrorType;
  message: string;
  title: string;
  suggestedActions: Array<{
    label: string;
    action: 'retry' | 'navigate' | 'contact' | 'custom';
    url?: string;
    handler?: () => void;
  }>;
  retryable: boolean;
}

/**
 * Map of enrollment errors with user-friendly messages and suggested actions
 */
export const ENROLLMENT_ERRORS: Record<EnrollmentErrorType, Omit<EnrollmentError, 'type'>> = {
  [EnrollmentErrorType.ALREADY_ENROLLED]: {
    title: 'Already Enrolled',
    message: 'You are already enrolled in this course. You can access it from your dashboard.',
    suggestedActions: [
      {
        label: 'Go to Dashboard',
        action: 'navigate',
        url: '/dashboard',
      },
      {
        label: 'View Course',
        action: 'custom',
      },
    ],
    retryable: false,
  },
  [EnrollmentErrorType.COURSE_NOT_FOUND]: {
    title: 'Course Not Found',
    message: 'The course you are trying to enroll in could not be found. It may have been removed or is no longer available.',
    suggestedActions: [
      {
        label: 'Browse Courses',
        action: 'navigate',
        url: '/courses',
      },
      {
        label: 'Contact Support',
        action: 'contact',
      },
    ],
    retryable: false,
  },
  [EnrollmentErrorType.COURSE_UNAVAILABLE]: {
    title: 'Course Unavailable',
    message: 'This course is currently unavailable for enrollment. Please check back later or contact support for more information.',
    suggestedActions: [
      {
        label: 'Browse Other Courses',
        action: 'navigate',
        url: '/courses',
      },
      {
        label: 'Contact Support',
        action: 'contact',
      },
    ],
    retryable: false,
  },
  [EnrollmentErrorType.PAYMENT_REQUIRED]: {
    title: 'Payment Required',
    message: 'This is a paid course. Please complete the payment process to enroll.',
    suggestedActions: [
      {
        label: 'Proceed to Payment',
        action: 'custom',
      },
      {
        label: 'View Course Details',
        action: 'custom',
      },
    ],
    retryable: false,
  },
  [EnrollmentErrorType.PAYMENT_FAILED]: {
    title: 'Payment Failed',
    message: 'Your payment could not be processed. Please check your payment details and try again.',
    suggestedActions: [
      {
        label: 'Try Again',
        action: 'retry',
      },
      {
        label: 'Update Payment Method',
        action: 'custom',
      },
      {
        label: 'Contact Support',
        action: 'contact',
      },
    ],
    retryable: true,
  },
  [EnrollmentErrorType.UNAUTHORIZED]: {
    title: 'Sign In Required',
    message: 'You need to be signed in to enroll in courses. Please sign in or create an account to continue.',
    suggestedActions: [
      {
        label: 'Sign In',
        action: 'navigate',
        url: '/auth/signin',
      },
      {
        label: 'Create Account',
        action: 'navigate',
        url: '/auth/signin',
      },
    ],
    retryable: false,
  },
  [EnrollmentErrorType.ENROLLMENT_LIMIT_REACHED]: {
    title: 'Enrollment Limit Reached',
    message: 'You have reached the maximum number of active enrollments. Please complete or unenroll from some courses before enrolling in new ones.',
    suggestedActions: [
      {
        label: 'View My Courses',
        action: 'navigate',
        url: '/dashboard',
      },
      {
        label: 'Contact Support',
        action: 'contact',
      },
    ],
    retryable: false,
  },
  [EnrollmentErrorType.COURSE_FULL]: {
    title: 'Course Full',
    message: 'This course has reached its maximum enrollment capacity. You can join the waitlist or browse similar courses.',
    suggestedActions: [
      {
        label: 'Join Waitlist',
        action: 'custom',
      },
      {
        label: 'Browse Similar Courses',
        action: 'navigate',
        url: '/courses',
      },
    ],
    retryable: false,
  },
  [EnrollmentErrorType.PREREQUISITES_NOT_MET]: {
    title: 'Prerequisites Not Met',
    message: 'You need to complete prerequisite courses before enrolling in this course. Check the course details for required prerequisites.',
    suggestedActions: [
      {
        label: 'View Prerequisites',
        action: 'custom',
      },
      {
        label: 'Browse Beginner Courses',
        action: 'navigate',
        url: '/courses?level=beginner',
      },
    ],
    retryable: false,
  },
  [EnrollmentErrorType.NETWORK_ERROR]: {
    title: 'Connection Error',
    message: 'We couldn\'t connect to the server. Please check your internet connection and try again.',
    suggestedActions: [
      {
        label: 'Try Again',
        action: 'retry',
      },
      {
        label: 'Check Connection',
        action: 'custom',
      },
    ],
    retryable: true,
  },
  [EnrollmentErrorType.SERVER_ERROR]: {
    title: 'Server Error',
    message: 'We encountered a problem processing your enrollment. Our team has been notified. Please try again in a few moments.',
    suggestedActions: [
      {
        label: 'Try Again',
        action: 'retry',
      },
      {
        label: 'Contact Support',
        action: 'contact',
      },
    ],
    retryable: true,
  },
  [EnrollmentErrorType.UNKNOWN_ERROR]: {
    title: 'Enrollment Failed',
    message: 'An unexpected error occurred while processing your enrollment. Please try again or contact support if the problem persists.',
    suggestedActions: [
      {
        label: 'Try Again',
        action: 'retry',
      },
      {
        label: 'Contact Support',
        action: 'contact',
      },
    ],
    retryable: true,
  },
};

/**
 * Parse API error response and return enrollment error details
 */
export function parseEnrollmentError(error: any): EnrollmentError {
  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: EnrollmentErrorType.NETWORK_ERROR,
      ...ENROLLMENT_ERRORS[EnrollmentErrorType.NETWORK_ERROR],
    };
  }

  // Handle Response objects
  if (error instanceof Response) {
    const status = error.status;

    if (status === 401) {
      return {
        type: EnrollmentErrorType.UNAUTHORIZED,
        ...ENROLLMENT_ERRORS[EnrollmentErrorType.UNAUTHORIZED],
      };
    }

    if (status === 404) {
      return {
        type: EnrollmentErrorType.COURSE_NOT_FOUND,
        ...ENROLLMENT_ERRORS[EnrollmentErrorType.COURSE_NOT_FOUND],
      };
    }

    if (status >= 500) {
      return {
        type: EnrollmentErrorType.SERVER_ERROR,
        ...ENROLLMENT_ERRORS[EnrollmentErrorType.SERVER_ERROR],
      };
    }
  }

  // Handle API error responses with error field
  if (error?.error) {
    const errorMessage = error.error.toLowerCase();

    if (errorMessage.includes('already enrolled')) {
      return {
        type: EnrollmentErrorType.ALREADY_ENROLLED,
        ...ENROLLMENT_ERRORS[EnrollmentErrorType.ALREADY_ENROLLED],
      };
    }

    if (errorMessage.includes('not found')) {
      return {
        type: EnrollmentErrorType.COURSE_NOT_FOUND,
        ...ENROLLMENT_ERRORS[EnrollmentErrorType.COURSE_NOT_FOUND],
      };
    }

    if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
      return {
        type: EnrollmentErrorType.UNAUTHORIZED,
        ...ENROLLMENT_ERRORS[EnrollmentErrorType.UNAUTHORIZED],
      };
    }

    if (errorMessage.includes('payment')) {
      return {
        type: EnrollmentErrorType.PAYMENT_FAILED,
        ...ENROLLMENT_ERRORS[EnrollmentErrorType.PAYMENT_FAILED],
      };
    }
  }

  // Handle requiresPayment response
  if (error?.requiresPayment) {
    return {
      type: EnrollmentErrorType.PAYMENT_REQUIRED,
      ...ENROLLMENT_ERRORS[EnrollmentErrorType.PAYMENT_REQUIRED],
    };
  }

  // Default to unknown error
  return {
    type: EnrollmentErrorType.UNKNOWN_ERROR,
    ...ENROLLMENT_ERRORS[EnrollmentErrorType.UNKNOWN_ERROR],
  };
}

/**
 * Get enrollment status feedback message
 */
export function getEnrollmentStatusMessage(status: 'pending' | 'processing' | 'success' | 'error'): {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
} {
  switch (status) {
    case 'pending':
      return {
        title: 'Enrollment Pending',
        message: 'Your enrollment request is being processed. This may take a few moments.',
        type: 'info',
      };
    case 'processing':
      return {
        title: 'Processing Enrollment',
        message: 'We are processing your enrollment. Please wait...',
        type: 'info',
      };
    case 'success':
      return {
        title: 'Enrollment Successful',
        message: 'You have been successfully enrolled in the course. You can now access all course materials.',
        type: 'success',
      };
    case 'error':
      return {
        title: 'Enrollment Failed',
        message: 'There was a problem processing your enrollment. Please try again.',
        type: 'error',
      };
  }
}

/**
 * Format enrollment error for display
 */
export function formatEnrollmentError(error: EnrollmentError, courseSlug?: string): {
  title: string;
  message: string;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  showRetry: boolean;
} {
  const actions = error.suggestedActions.map((action) => {
    let onClick: () => void;

    switch (action.action) {
      case 'navigate':
        onClick = () => {
          if (action.url) {
            window.location.href = action.url;
          }
        };
        break;
      case 'contact':
        onClick = () => {
          window.location.href = '/contact';
        };
        break;
      case 'custom':
        onClick = action.handler || (() => {});
        break;
      case 'retry':
      default:
        onClick = () => {};
        break;
    }

    return {
      label: action.label,
      onClick,
      variant: action.action === 'retry' ? 'primary' as const : 'secondary' as const,
    };
  });

  return {
    title: error.title,
    message: error.message,
    actions: actions.filter((a) => a.label !== 'Try Again'), // Filter out retry action
    showRetry: error.retryable,
  };
}

/**
 * Check if error is retryable
 */
export function isEnrollmentErrorRetryable(error: any): boolean {
  const enrollmentError = parseEnrollmentError(error);
  return enrollmentError.retryable;
}

export default {
  parseEnrollmentError,
  getEnrollmentStatusMessage,
  formatEnrollmentError,
  isEnrollmentErrorRetryable,
  ENROLLMENT_ERRORS,
  EnrollmentErrorType,
};
