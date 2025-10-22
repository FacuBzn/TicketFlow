/**
 * Retry handler utility for resilient external API calls
 * Implements exponential backoff with configurable timeout
 */
export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  timeoutMs?: number;
  backoffMultiplier?: number;
}

export class RetryHandler {
  private static readonly DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    timeoutMs: 30000,
    backoffMultiplier: 2,
  };

  /**
   * Execute function with retry logic and timeout
   * @param fn - Async function to execute
   * @param options - Retry configuration
   * @returns Result of the function
   * @throws Last error if all retries fail or timeout
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    let lastError: Error | null = null;
    let delayMs = config.initialDelayMs;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Execute with timeout
        const result = await this.withTimeout(fn(), config.timeoutMs);
        return result;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt === config.maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(error)) {
          throw error;
        }

        // Wait before retry with exponential backoff
        await this.delay(delayMs);
        delayMs = Math.min(delayMs * config.backoffMultiplier, config.maxDelayMs);
      }
    }

    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Execute promise with timeout
   */
  private static async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Check if error is retryable (network errors, 5xx, rate limits)
   */
  private static isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // Network errors
      if (
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('econnrefused') ||
        message.includes('enotfound')
      ) {
        return true;
      }

      // HTTP errors (extracted from error message)
      if (message.includes('503') || message.includes('502') || message.includes('429')) {
        return true;
      }
    }

    return false;
  }

  /**
   * Delay execution
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

