// src/lib/api-retry.ts

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxAttempts?: number;

  /**
   * Initial delay in milliseconds before first retry (default: 1000)
   */
  initialDelay?: number;

  /**
   * Maximum delay in milliseconds between retries (default: 10000)
   */
  maxDelay?: number;

  /**
   * Exponential backoff multiplier (default: 2)
   */
  backoffMultiplier?: number;

  /**
   * Whether to add random jitter to delays (default: true)
   */
  useJitter?: boolean;

  /**
   * HTTP status codes that should trigger a retry (default: [408, 429, 500, 502, 503, 504])
   */
  retryableStatusCodes?: number[];

  /**
   * Custom function to determine if an error should trigger a retry
   */
  shouldRetry?: (error: any, attempt: number) => boolean;

  /**
   * Callback function called before each retry attempt
   */
  onRetry?: (error: any, attempt: number, delay: number) => void;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<Omit<RetryConfig, 'shouldRetry' | 'onRetry'>> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  useJitter: true,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * Calculate delay for next retry attempt using exponential backoff
 */
function calculateDelay(
  attempt: number,
  config: Required<Omit<RetryConfig, 'shouldRetry' | 'onRetry'>>
): number {
  // Calculate exponential backoff: initialDelay * (backoffMultiplier ^ attempt)
  let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);

  // Cap at maximum delay
  delay = Math.min(delay, config.maxDelay);

  // Add jitter to prevent thundering herd
  if (config.useJitter) {
    // Random jitter between 0% and 25% of the delay
    const jitter = delay * 0.25 * Math.random();
    delay = delay + jitter;
  }

  return Math.floor(delay);
}

/**
 * Determine if an error should trigger a retry
 */
function shouldRetryError(
  error: any,
  attempt: number,
  config: Required<Omit<RetryConfig, 'shouldRetry' | 'onRetry'>>
): boolean {
  // Don't retry if we've exceeded max attempts
  if (attempt >= config.maxAttempts) {
    return false;
  }

  // Check if error has a response with status code
  if (error?.response?.status) {
    return config.retryableStatusCodes.includes(error.response.status);
  }

  // Check if it's a fetch Response object
  if (error instanceof Response) {
    return config.retryableStatusCodes.includes(error.status);
  }

  // Retry on network errors
  if (
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('ETIMEDOUT')
  ) {
    return true;
  }

  // Don't retry by default
  return false;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * 
 * @param fn - The async function to retry
 * @param config - Retry configuration
 * @returns Promise that resolves with the function result or rejects after all retries fail
 * 
 * @example
 * ```typescript
 * const data = await retryWithBackoff(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     if (!response.ok) throw response;
 *     return response.json();
 *   },
 *   {
 *     maxAttempts: 3,
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry attempt ${attempt} after ${delay}ms`);
 *     }
 *   }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const mergedConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: any;
  let attempt = 0;

  while (attempt < mergedConfig.maxAttempts) {
    try {
      // Attempt the function
      return await fn();
    } catch (error) {
      lastError = error;
      attempt++;

      // Check if we should retry
      const shouldRetry = config.shouldRetry
        ? config.shouldRetry(error, attempt)
        : shouldRetryError(error, attempt, mergedConfig);

      if (!shouldRetry) {
        // Don't retry, throw the error
        throw error;
      }

      // Calculate delay for next retry
      const delay = calculateDelay(attempt, mergedConfig);

      // Log retry attempt
      console.warn(
        `API request failed (attempt ${attempt}/${mergedConfig.maxAttempts}). Retrying in ${delay}ms...`,
        error
      );

      // Call onRetry callback if provided
      if (config.onRetry) {
        config.onRetry(error, attempt, delay);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted, throw the last error
  console.error(
    `API request failed after ${mergedConfig.maxAttempts} attempts`,
    lastError
  );
  throw lastError;
}

/**
 * Wrapper for fetch with automatic retry logic
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @param retryConfig - Retry configuration
 * @returns Promise that resolves with the Response
 * 
 * @example
 * ```typescript
 * const response = await fetchWithRetry('/api/data', {
 *   method: 'POST',
 *   body: JSON.stringify({ key: 'value' }),
 * });
 * const data = await response.json();
 * ```
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options);

    // Throw response if not ok to trigger retry logic
    if (!response.ok) {
      throw response;
    }

    return response;
  }, retryConfig);
}

/**
 * API client with built-in retry logic
 */
export class RetryableApiClient {
  private baseUrl: string;
  private defaultConfig: RetryConfig;
  private defaultHeaders: HeadersInit;

  constructor(
    baseUrl: string = '',
    defaultConfig: RetryConfig = {},
    defaultHeaders: HeadersInit = {}
  ) {
    this.baseUrl = baseUrl;
    this.defaultConfig = defaultConfig;
    this.defaultHeaders = defaultHeaders;
  }

  /**
   * Make a GET request with retry logic
   */
  async get<T>(url: string, config?: RetryConfig): Promise<T> {
    const response = await fetchWithRetry(
      `${this.baseUrl}${url}`,
      {
        method: 'GET',
        headers: this.defaultHeaders,
      },
      { ...this.defaultConfig, ...config }
    );

    return response.json();
  }

  /**
   * Make a POST request with retry logic
   */
  async post<T>(url: string, data?: any, config?: RetryConfig): Promise<T> {
    const response = await fetchWithRetry(
      `${this.baseUrl}${url}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
        },
        body: data ? JSON.stringify(data) : undefined,
      },
      { ...this.defaultConfig, ...config }
    );

    return response.json();
  }

  /**
   * Make a PUT request with retry logic
   */
  async put<T>(url: string, data?: any, config?: RetryConfig): Promise<T> {
    const response = await fetchWithRetry(
      `${this.baseUrl}${url}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.defaultHeaders,
        },
        body: data ? JSON.stringify(data) : undefined,
      },
      { ...this.defaultConfig, ...config }
    );

    return response.json();
  }

  /**
   * Make a DELETE request with retry logic
   */
  async delete<T>(url: string, config?: RetryConfig): Promise<T> {
    const response = await fetchWithRetry(
      `${this.baseUrl}${url}`,
      {
        method: 'DELETE',
        headers: this.defaultHeaders,
      },
      { ...this.defaultConfig, ...config }
    );

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }
}

/**
 * Create a retryable API client instance
 */
export function createRetryableApiClient(
  baseUrl?: string,
  config?: RetryConfig,
  headers?: HeadersInit
): RetryableApiClient {
  return new RetryableApiClient(baseUrl, config, headers);
}

/**
 * Retry decorator for class methods
 * 
 * @example
 * ```typescript
 * class MyService {
 *   @Retry({ maxAttempts: 3 })
 *   async fetchData() {
 *     // This method will automatically retry on failure
 *     return await fetch('/api/data');
 *   }
 * }
 * ```
 */
export function Retry(config?: RetryConfig) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return retryWithBackoff(
        () => originalMethod.apply(this, args),
        config
      );
    };

    return descriptor;
  };
}

/**
 * Utility to check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  return shouldRetryError(error, 0, DEFAULT_RETRY_CONFIG);
}

/**
 * Get retry-after header value from response
 */
export function getRetryAfter(response: Response): number | null {
  const retryAfter = response.headers.get('Retry-After');
  
  if (!retryAfter) {
    return null;
  }

  // Try parsing as seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to milliseconds
  }

  // Try parsing as HTTP date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return null;
}

/**
 * Enhanced retry config that respects Retry-After header
 */
export function createRetryConfigWithRetryAfter(
  baseConfig?: RetryConfig
): RetryConfig {
  return {
    ...baseConfig,
    shouldRetry: (error: any, attempt: number) => {
      // First check base config's shouldRetry if it exists
      if (baseConfig?.shouldRetry) {
        return baseConfig.shouldRetry(error, attempt);
      }

      // Use default retry logic
      return shouldRetryError(
        error,
        attempt,
        { ...DEFAULT_RETRY_CONFIG, ...baseConfig }
      );
    },
    onRetry: (error: any, attempt: number, delay: number) => {
      // Check for Retry-After header
      if (error instanceof Response) {
        const retryAfter = getRetryAfter(error);
        if (retryAfter !== null) {
          console.log(`Server requested retry after ${retryAfter}ms`);
        }
      }

      // Call base config's onRetry if it exists
      if (baseConfig?.onRetry) {
        baseConfig.onRetry(error, attempt, delay);
      }
    },
  };
}

export default retryWithBackoff;
