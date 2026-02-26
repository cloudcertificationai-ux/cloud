/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
  useJitter?: boolean
  retryableStatusCodes?: number[]
  shouldRetry?: (error: any, attempt: number) => boolean
  onRetry?: (error: any, attempt: number, delay: number) => void
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
}

/**
 * Calculate delay for next retry attempt using exponential backoff
 */
function calculateDelay(
  attempt: number,
  config: Required<Omit<RetryConfig, 'shouldRetry' | 'onRetry'>>
): number {
  let delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1)
  delay = Math.min(delay, config.maxDelay)

  if (config.useJitter) {
    const jitter = delay * 0.25 * Math.random()
    delay = delay + jitter
  }

  return Math.floor(delay)
}

/**
 * Determine if an error should trigger a retry
 */
function shouldRetryError(
  error: any,
  attempt: number,
  config: Required<Omit<RetryConfig, 'shouldRetry' | 'onRetry'>>
): boolean {
  if (attempt >= config.maxAttempts) {
    return false
  }

  if (error?.response?.status) {
    return config.retryableStatusCodes.includes(error.response.status)
  }

  if (error instanceof Response) {
    return config.retryableStatusCodes.includes(error.status)
  }

  if (
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('ETIMEDOUT')
  ) {
    return true
  }

  return false
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const mergedConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  }

  let lastError: any
  let attempt = 0

  while (attempt < mergedConfig.maxAttempts) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      attempt++

      const shouldRetry = config.shouldRetry
        ? config.shouldRetry(error, attempt)
        : shouldRetryError(error, attempt, mergedConfig)

      if (!shouldRetry) {
        throw error
      }

      const delay = calculateDelay(attempt, mergedConfig)

      console.warn(
        `Request failed (attempt ${attempt}/${mergedConfig.maxAttempts}). Retrying in ${delay}ms...`,
        error
      )

      if (config.onRetry) {
        config.onRetry(error, attempt, delay)
      }

      await sleep(delay)
    }
  }

  console.error(
    `Request failed after ${mergedConfig.maxAttempts} attempts`,
    lastError
  )
  throw lastError
}

/**
 * Wrapper for fetch with automatic retry logic
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  retryConfig?: RetryConfig
): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options)

    if (!response.ok) {
      throw response
    }

    return response
  }, retryConfig)
}

/**
 * Utility to check if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  return shouldRetryError(error, 0, DEFAULT_RETRY_CONFIG)
}

export default retryWithBackoff
