/**
 * R2 error handling and fallback utilities
 */

export class R2UnavailableError extends Error {
  constructor(message: string, public readonly statusCode?: number) {
    super(message);
    this.name = 'R2UnavailableError';
  }
}

/**
 * Check if error is an R2 5xx server error
 */
export function isR2ServerError(error: any): boolean {
  if (!error) return false;

  // Check for HTTP status codes
  if (error.statusCode && error.statusCode >= 500 && error.statusCode < 600) {
    return true;
  }

  // Check for AWS SDK errors
  if (error.$metadata?.httpStatusCode) {
    const statusCode = error.$metadata.httpStatusCode;
    return statusCode >= 500 && statusCode < 600;
  }

  // Check for network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return true;
  }

  return false;
}

/**
 * Wrap R2 operations with error handling and fallback
 */
export async function withR2Fallback<T>(
  operation: () => Promise<T>,
  fallback: () => Promise<T | null>,
  operationName: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isR2ServerError(error)) {
      console.error(`R2 unavailable for ${operationName}:`, error);
      
      // Try fallback
      const fallbackResult = await fallback();
      
      if (fallbackResult !== null) {
        console.warn(`Using fallback for ${operationName}`);
        return fallbackResult;
      }
      
      // No fallback available
      throw new R2UnavailableError(
        `R2 service is temporarily unavailable. Please try again later.`,
        503
      );
    }
    
    // Re-throw non-R2 errors
    throw error;
  }
}
