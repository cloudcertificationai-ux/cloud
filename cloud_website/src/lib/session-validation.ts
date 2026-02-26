// src/lib/session-validation.ts

/**
 * Session validation error types
 */
export enum SessionErrorType {
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_INVALID = 'SESSION_INVALID',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INACTIVITY_TIMEOUT = 'INACTIVITY_TIMEOUT',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean;
  error?: SessionErrorType;
  message?: string;
  redirectUrl?: string;
}

/**
 * Session context for preserving user intent
 */
export interface SessionContext {
  intendedDestination?: string;
  returnUrl?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Store session context in sessionStorage
 */
export function storeSessionContext(context: SessionContext): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem('session_context', JSON.stringify(context));
  } catch (error) {
    console.error('Failed to store session context:', error);
  }
}

/**
 * Retrieve session context from sessionStorage
 */
export function retrieveSessionContext(): SessionContext | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = sessionStorage.getItem('session_context');
    if (!stored) return null;

    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to retrieve session context:', error);
    return null;
  }
}

/**
 * Clear session context from sessionStorage
 */
export function clearSessionContext(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem('session_context');
  } catch (error) {
    console.error('Failed to clear session context:', error);
  }
}

/**
 * Build redirect URL with session context
 */
export function buildRedirectUrl(
  destination: string,
  error?: SessionErrorType,
  preserveContext: boolean = true
): string {
  const url = new URL('/auth/signin', window.location.origin);

  // Add callback URL
  url.searchParams.set('callbackUrl', destination);

  // Add error parameter if provided
  if (error) {
    url.searchParams.set('error', error);
  }

  // Store additional context if needed
  if (preserveContext) {
    storeSessionContext({
      intendedDestination: destination,
      returnUrl: window.location.href,
    });
  }

  return url.toString();
}

/**
 * Handle session validation error
 */
export function handleSessionError(
  error: SessionErrorType,
  currentPath: string = window.location.pathname,
  preserveContext: boolean = true
): void {
  // Build redirect URL with error and context
  const redirectUrl = buildRedirectUrl(currentPath, error, preserveContext);

  // Redirect to sign-in page
  window.location.href = redirectUrl;
}

/**
 * Get user-friendly error message for session error
 */
export function getSessionErrorMessage(error: SessionErrorType): {
  title: string;
  message: string;
  action: string;
} {
  switch (error) {
    case SessionErrorType.SESSION_EXPIRED:
      return {
        title: 'Session Expired',
        message: 'Your session has expired. Please sign in again to continue.',
        action: 'Sign In',
      };
    case SessionErrorType.INACTIVITY_TIMEOUT:
      return {
        title: 'Session Timed Out',
        message: 'Your session has expired due to inactivity. Please sign in again to continue.',
        action: 'Sign In',
      };
    case SessionErrorType.SESSION_INVALID:
      return {
        title: 'Invalid Session',
        message: 'Your session is invalid. Please sign in again.',
        action: 'Sign In',
      };
    case SessionErrorType.SESSION_NOT_FOUND:
      return {
        title: 'Session Not Found',
        message: 'No active session found. Please sign in to continue.',
        action: 'Sign In',
      };
    case SessionErrorType.TOKEN_EXPIRED:
      return {
        title: 'Authentication Expired',
        message: 'Your authentication has expired. Please sign in again.',
        action: 'Sign In',
      };
    case SessionErrorType.UNAUTHORIZED:
      return {
        title: 'Authentication Required',
        message: 'You need to be signed in to access this page.',
        action: 'Sign In',
      };
    default:
      return {
        title: 'Authentication Error',
        message: 'There was a problem with your session. Please sign in again.',
        action: 'Sign In',
      };
  }
}

/**
 * Validate session and handle errors
 */
export async function validateSession(
  checkFunction: () => Promise<boolean>,
  currentPath?: string
): Promise<SessionValidationResult> {
  try {
    const isValid = await checkFunction();

    if (!isValid) {
      const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
      const redirectUrl = buildRedirectUrl(path, SessionErrorType.SESSION_INVALID);

      return {
        valid: false,
        error: SessionErrorType.SESSION_INVALID,
        message: 'Session is invalid',
        redirectUrl,
      };
    }

    return {
      valid: true,
    };
  } catch (error) {
    console.error('Session validation error:', error);

    const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
    const redirectUrl = buildRedirectUrl(path, SessionErrorType.SESSION_INVALID);

    return {
      valid: false,
      error: SessionErrorType.SESSION_INVALID,
      message: 'Failed to validate session',
      redirectUrl,
    };
  }
}

/**
 * Check if current session is valid (client-side)
 */
export async function checkSessionValidity(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    // Check if we have a session by calling the session endpoint
    const response = await fetch('/api/auth/session');

    if (!response.ok) {
      return false;
    }

    const session = await response.json();
    return !!session?.user;
  } catch (error) {
    console.error('Failed to check session validity:', error);
    return false;
  }
}

/**
 * Restore user context after successful authentication
 */
export function restoreUserContext(): SessionContext | null {
  const context = retrieveSessionContext();

  if (context) {
    // Clear the stored context
    clearSessionContext();

    // If there's an intended destination, navigate to it
    if (context.intendedDestination && typeof window !== 'undefined') {
      // Use setTimeout to allow the current navigation to complete
      setTimeout(() => {
        window.location.href = context.intendedDestination!;
      }, 100);
    }
  }

  return context;
}

/**
 * Session validation middleware for client-side route protection
 */
export async function requireSession(
  onInvalid?: (error: SessionErrorType) => void
): Promise<boolean> {
  const isValid = await checkSessionValidity();

  if (!isValid) {
    const error = SessionErrorType.UNAUTHORIZED;

    if (onInvalid) {
      onInvalid(error);
    } else {
      handleSessionError(error);
    }

    return false;
  }

  return true;
}

/**
 * Hook-friendly session validator
 */
export function useSessionValidation() {
  const validateAndRedirect = async (currentPath?: string) => {
    const result = await validateSession(checkSessionValidity, currentPath);

    if (!result.valid && result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }

    return result;
  };

  const handleError = (error: SessionErrorType, currentPath?: string) => {
    handleSessionError(error, currentPath);
  };

  const restore = () => {
    return restoreUserContext();
  };

  return {
    validate: validateAndRedirect,
    handleError,
    restore,
    checkValidity: checkSessionValidity,
  };
}

/**
 * Parse session error from URL parameters
 */
export function parseSessionErrorFromUrl(): SessionErrorType | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');

  if (!error) return null;

  // Map error strings to SessionErrorType
  const errorMap: Record<string, SessionErrorType> = {
    SessionExpired: SessionErrorType.SESSION_EXPIRED,
    SessionInvalid: SessionErrorType.SESSION_INVALID,
    SessionNotFound: SessionErrorType.SESSION_NOT_FOUND,
    InactivityTimeout: SessionErrorType.INACTIVITY_TIMEOUT,
    TokenExpired: SessionErrorType.TOKEN_EXPIRED,
    Unauthorized: SessionErrorType.UNAUTHORIZED,
  };

  return errorMap[error] || null;
}

/**
 * Get callback URL from current URL parameters
 */
export function getCallbackUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  return params.get('callbackUrl');
}

export default {
  storeSessionContext,
  retrieveSessionContext,
  clearSessionContext,
  buildRedirectUrl,
  handleSessionError,
  getSessionErrorMessage,
  validateSession,
  checkSessionValidity,
  restoreUserContext,
  requireSession,
  useSessionValidation,
  parseSessionErrorFromUrl,
  getCallbackUrl,
  SessionErrorType,
};
