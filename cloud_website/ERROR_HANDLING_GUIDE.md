# Error Handling and User Feedback Guide

This guide explains how to use the comprehensive error handling system implemented for the anywheredoor application.

## Overview

The error handling system provides:
- User-friendly error messages with suggested actions
- Automatic retry logic with exponential backoff
- Enrollment-specific error handling
- Session validation with context preservation
- Offline resilience with operation queueing

## Components

### 1. ErrorMessage Component

The main error message component with support for different error types, actions, and retry mechanisms.

```tsx
import { ErrorMessage } from '@/components/ErrorMessage';

<ErrorMessage
  type="error"
  title="Something went wrong"
  message="We couldn't process your request. Please try again."
  showRetry={true}
  onRetry={handleRetry}
  dismissible={true}
  onDismiss={handleDismiss}
/>
```

**Props:**
- `message` (required): Error message to display
- `type`: 'error' | 'warning' | 'info' (default: 'error')
- `title`: Optional title for the error
- `actions`: Array of action buttons with labels and handlers
- `showRetry`: Whether to show a retry button
- `onRetry`: Callback when retry is clicked
- `dismissible`: Whether the error can be dismissed
- `onDismiss`: Callback when error is dismissed
- `autoDismiss`: Auto-dismiss after specified milliseconds

### 2. Authentication Error Messages

Pre-configured error messages for authentication errors.

```tsx
import { AuthenticationErrorMessage } from '@/components/ErrorMessage';

<AuthenticationErrorMessage
  error="SessionExpired"
  onRetry={handleRetry}
  callbackUrl="/dashboard"
/>
```

**Supported Error Types:**
- `SessionExpired`: Session has expired
- `OAuthSignin`: OAuth sign-in error
- `OAuthCallback`: OAuth callback error
- `OAuthCreateAccount`: Account creation error
- `Callback`: General callback error
- `OAuthAccountNotLinked`: Account already exists with different provider
- `CredentialsSignin`: Invalid credentials
- `SessionRequired`: Authentication required

### 3. Enrollment Error Messages

Pre-configured error messages for enrollment errors.

```tsx
import { EnrollmentErrorMessage } from '@/components/ErrorMessage';

<EnrollmentErrorMessage
  error={enrollmentError}
  onRetry={handleRetry}
  courseSlug="react-fundamentals"
/>
```

**Handles:**
- Already enrolled errors
- Course not found errors
- Payment required errors
- Unauthorized access errors
- Network and server errors

### 4. Session Error Messages

Pre-configured error messages for session validation errors.

```tsx
import { SessionErrorMessage } from '@/components/ErrorMessage';

<SessionErrorMessage
  errorType="SessionExpired"
  callbackUrl="/dashboard"
  onSignIn={handleSignIn}
/>
```

### 5. Offline Messages

Components for displaying offline status and queued operations.

```tsx
import { OfflineMessage, OfflineBanner } from '@/components/ErrorMessage';

// Inline message
<OfflineMessage
  queuedOperations={3}
  onRetry={handleRetry}
  dismissible={true}
/>

// Fixed banner at top of page
<OfflineBanner
  queuedOperations={3}
  onRetry={handleRetry}
  onDismiss={handleDismiss}
/>
```

## Utilities

### 1. API Retry Logic

Automatic retry with exponential backoff for failed API requests.

```typescript
import { retryWithBackoff, fetchWithRetry } from '@/lib/api-retry';

// Basic retry
const data = await retryWithBackoff(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw response;
    return response.json();
  },
  {
    maxAttempts: 3,
    initialDelay: 1000,
    onRetry: (error, attempt, delay) => {
      console.log(`Retry attempt ${attempt} after ${delay}ms`);
    }
  }
);

// Fetch with retry
const response = await fetchWithRetry('/api/data', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' }),
});
```

**Configuration Options:**
- `maxAttempts`: Maximum retry attempts (default: 3)
- `initialDelay`: Initial delay in ms (default: 1000)
- `maxDelay`: Maximum delay in ms (default: 10000)
- `backoffMultiplier`: Exponential multiplier (default: 2)
- `useJitter`: Add random jitter (default: true)
- `retryableStatusCodes`: HTTP codes to retry (default: [408, 429, 500, 502, 503, 504])
- `shouldRetry`: Custom retry logic function
- `onRetry`: Callback before each retry

### 2. Retryable API Client

Pre-configured API client with built-in retry logic.

```typescript
import { createRetryableApiClient } from '@/lib/api-retry';

const apiClient = createRetryableApiClient('/api', {
  maxAttempts: 3,
  initialDelay: 1000,
});

// GET request
const data = await apiClient.get('/courses');

// POST request
const result = await apiClient.post('/enrollments', {
  courseId: '123',
});

// PUT request
await apiClient.put('/profile', profileData);

// DELETE request
await apiClient.delete('/enrollments/123');
```

### 3. Enrollment Error Handling

Parse and format enrollment errors with suggested actions.

```typescript
import { parseEnrollmentError, formatEnrollmentError } from '@/lib/enrollment-errors';

try {
  await enrollInCourse(courseId);
} catch (error) {
  const enrollmentError = parseEnrollmentError(error);
  const formatted = formatEnrollmentError(enrollmentError, courseSlug);
  
  // Display error with formatted message and actions
  setError(formatted);
}
```

### 4. Session Validation

Handle session validation with context preservation.

```typescript
import {
  handleSessionError,
  storeSessionContext,
  restoreUserContext,
  SessionErrorType,
} from '@/lib/session-validation';

// Store context before redirect
storeSessionContext({
  intendedDestination: '/dashboard',
  action: 'view_course',
  metadata: { courseId: '123' },
});

// Handle session error
handleSessionError(
  SessionErrorType.SESSION_EXPIRED,
  '/dashboard',
  true // preserve context
);

// After successful authentication, restore context
const context = restoreUserContext();
if (context?.intendedDestination) {
  router.push(context.intendedDestination);
}
```

### 5. Offline Resilience

Detect network errors and queue operations for retry.

```typescript
import {
  getOfflineManager,
  fetchWithOfflineSupport,
  isNetworkError,
} from '@/lib/offline-resilience';

// Fetch with offline support
try {
  const response = await fetchWithOfflineSupport('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify({ courseId: '123' }),
    operationType: 'enrollment',
    queueOnFailure: true,
    maxRetries: 3,
  });
} catch (error) {
  if (isNetworkError(error)) {
    // Operation has been queued for retry
    showMessage('Operation queued for retry when connection is restored');
  }
}

// Manual queue management
const manager = getOfflineManager();

// Queue an operation
manager.queueOperation(
  'enrollment',
  '/api/enrollments',
  'POST',
  { courseId: '123' },
  { 'Content-Type': 'application/json' },
  3 // max retries
);

// Retry queued operations
await manager.retryQueue();

// Get offline status
const status = manager.getStatus();
console.log(`Offline: ${status.isOffline}, Queued: ${status.queuedOperations}`);
```

## React Hooks

### useOfflineStatus

Monitor offline status in React components.

```tsx
import { useOfflineStatus } from '@/components/OfflineDetector';

function MyComponent() {
  const { isOffline, queuedOperations, lastOnline } = useOfflineStatus();
  
  return (
    <div>
      {isOffline && (
        <p>Offline - {queuedOperations} operations queued</p>
      )}
    </div>
  );
}
```

### useOfflineQueue

Queue operations when offline.

```tsx
import { useOfflineQueue } from '@/components/OfflineDetector';

function MyComponent() {
  const { queueOperation, retryQueue, clearQueue } = useOfflineQueue();
  
  const handleSubmit = async () => {
    try {
      await fetch('/api/data', { method: 'POST', body: data });
    } catch (error) {
      // Queue for retry
      queueOperation('submit', '/api/data', 'POST', data);
    }
  };
  
  return (
    <button onClick={retryQueue}>Retry Queued Operations</button>
  );
}
```

## Global Setup

### Add Offline Detector to Layout

Add the OfflineDetector component to your root layout to automatically show offline banner.

```tsx
// app/layout.tsx
import { OfflineDetector } from '@/components/OfflineDetector';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <OfflineDetector />
        {children}
      </body>
    </html>
  );
}
```

## Best Practices

1. **Always provide user-friendly error messages**: Use the pre-configured error components instead of generic error messages.

2. **Enable retry for transient errors**: Use `showRetry={true}` for network errors and server errors that are likely temporary.

3. **Preserve user context**: When redirecting to sign-in, always preserve the intended destination using session context.

4. **Queue operations when offline**: For important operations (enrollments, profile updates), enable offline queueing.

5. **Provide suggested actions**: Always include actionable next steps in error messages.

6. **Log errors appropriately**: Use console.error for debugging but don't expose sensitive information to users.

7. **Test offline scenarios**: Test your application with network throttling and offline mode to ensure proper error handling.

## Examples

### Complete Enrollment Flow with Error Handling

```tsx
import { useState } from 'react';
import { EnrollmentErrorMessage, EnrollmentStatusMessage } from '@/components/ErrorMessage';
import { fetchWithRetry } from '@/lib/api-retry';
import { fetchWithOfflineSupport } from '@/lib/offline-resilience';

function EnrollButton({ courseId, courseSlug }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState(null);
  
  const handleEnroll = async () => {
    setStatus('loading');
    setError(null);
    
    try {
      const response = await fetchWithOfflineSupport(
        '/api/enrollments',
        {
          method: 'POST',
          body: JSON.stringify({ courseId }),
          headers: { 'Content-Type': 'application/json' },
          operationType: 'enrollment',
          queueOnFailure: true,
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }
      
      setStatus('success');
    } catch (err) {
      setError(err);
      setStatus('error');
    }
  };
  
  return (
    <div>
      {status === 'error' && error && (
        <EnrollmentErrorMessage
          error={error}
          onRetry={handleEnroll}
          courseSlug={courseSlug}
        />
      )}
      
      {status === 'success' && (
        <EnrollmentStatusMessage
          status="success"
          courseName={courseSlug}
        />
      )}
      
      <button
        onClick={handleEnroll}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Enrolling...' : 'Enroll Now'}
      </button>
    </div>
  );
}
```

## Testing

Test error handling by:

1. **Network errors**: Use browser DevTools to throttle or disable network
2. **Server errors**: Mock API responses with error status codes
3. **Session expiration**: Clear session cookies and attempt protected actions
4. **Offline mode**: Enable offline mode in DevTools and test operation queueing

## Summary

This error handling system provides a comprehensive solution for:
- ✅ User-friendly error messages
- ✅ Automatic retry with exponential backoff
- ✅ Context preservation during authentication
- ✅ Offline resilience with operation queueing
- ✅ Enrollment-specific error handling
- ✅ Session validation error handling

All components and utilities are fully typed with TypeScript and follow React best practices.
