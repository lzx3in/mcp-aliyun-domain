/**
 * Retry utility with exponential backoff and jitter.
 * Used to wrap Alibaba Cloud API calls for transient error recovery.
 */

export interface RetryOptions {
  /** Maximum number of retries (default: 2, meaning up to 3 total attempts) */
  maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff (default: 1000) */
  baseDelayMs?: number;
}

/** Network error codes that are safe to retry */
const RETRYABLE_NETWORK_CODES = [
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'EAI_AGAIN',
];

/** HTTP status codes that are safe to retry */
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

/** Alibaba Cloud SDK error codes that are safe to retry */
const RETRYABLE_SDK_CODES = [
  'ServiceUnavailable',
  'Throttling',
  'Throttling.User',
  'Throttling.Api',
  'InternalError',
  'OperationConflict',
];

/**
 * Determine whether an error is retryable.
 * Checks network error codes, HTTP status codes, and Alibaba Cloud SDK error codes.
 */
export function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const e = error as Record<string, unknown>;

  // Check Node.js network error codes
  if (typeof e.code === 'string' && RETRYABLE_NETWORK_CODES.includes(e.code)) {
    return true;
  }

  // Check HTTP status code (direct or nested in data)
  const statusCode = typeof e.statusCode === 'number'
    ? e.statusCode
    : typeof e.data === 'object' && e.data !== null && typeof (e.data as Record<string, unknown>).httpStatusCode === 'number'
      ? (e.data as Record<string, unknown>).httpStatusCode as number
      : undefined;

  if (statusCode !== undefined && RETRYABLE_STATUS_CODES.includes(statusCode)) {
    return true;
  }

  // Check Alibaba Cloud SDK error codes
  if (typeof e.code === 'string' && RETRYABLE_SDK_CODES.includes(e.code)) {
    return true;
  }

  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute an async function with retry logic using exponential backoff and jitter.
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function call
 * @throws The original error if all retries are exhausted or the error is not retryable
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions,
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 2;
  const baseDelayMs = options?.baseDelayMs ?? 1000;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if not retryable or exhausted all retries
      if (attempt >= maxRetries || !isRetryableError(error)) {
        throw error;
      }

      // Exponential backoff with jitter: baseDelay * 2^attempt + random(0, baseDelay)
      const backoff = Math.min(
        baseDelayMs * Math.pow(2, attempt) + Math.random() * baseDelayMs,
        30000,
      );
      const delayMs = Math.round(backoff);

      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(
        `[retry] attempt ${attempt + 1}/${maxRetries + 1} failed: ${errorMsg}, retrying in ${delayMs}ms...`,
      );

      await delay(delayMs);
    }
  }

  // This should not be reached, but TypeScript requires it
  throw lastError;
}
