/**
 * Retry utility for handling transient failures with exponential backoff
 */

export interface RetryOptions {
  maxAttempts: number;
  delays: number[]; // Delay in milliseconds for each retry
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxAttempts, delays, onRetry } = options;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts) {
        throw new RetryError(
          `Failed after ${maxAttempts} attempts: ${lastError.message}`,
          maxAttempts,
          lastError
        );
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      const delay = delays[attempt - 1] || delays[delays.length - 1];
      await sleep(delay);
    }
  }

  throw new RetryError(
    `Failed after ${maxAttempts} attempts`,
    maxAttempts,
    lastError!
  );
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry configuration for playback token requests
 * 3 attempts with 1s, 2s, 4s delays
 */
export const PLAYBACK_TOKEN_RETRY_CONFIG: RetryOptions = {
  maxAttempts: 3,
  delays: [1000, 2000, 4000],
};

/**
 * Retry configuration for R2 operations
 * 3 attempts with 1s, 2s, 4s delays
 */
export const R2_RETRY_CONFIG: RetryOptions = {
  maxAttempts: 3,
  delays: [1000, 2000, 4000],
};

/**
 * Retry configuration for database operations
 * 2 attempts with 500ms, 1s delays
 */
export const DB_RETRY_CONFIG: RetryOptions = {
  maxAttempts: 2,
  delays: [500, 1000],
};
