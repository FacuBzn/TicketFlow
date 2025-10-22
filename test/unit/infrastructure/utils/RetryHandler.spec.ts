import { RetryHandler } from '../../../../src/infrastructure/utils/RetryHandler';

describe('RetryHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('withRetry', () => {
    it('should return result on first successful attempt', async () => {
      // Arrange
      const successFn = jest.fn().mockResolvedValue('success');

      // Act
      const result = await RetryHandler.withRetry(successFn, {
        maxRetries: 3,
        initialDelayMs: 1000,
        timeoutMs: 5000
      });

      // Assert
      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('503: Service Unavailable'))
        .mockRejectedValueOnce(new Error('503: Service Unavailable'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 1000,
        timeoutMs: 10000
      });

      // Advance timers for retries
      await jest.advanceTimersByTimeAsync(1000); // First retry delay
      await jest.advanceTimersByTimeAsync(2000); // Second retry delay (exponential backoff)

      const result = await promise;

      // Assert
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries exceeded', async () => {
      // Arrange
      const error = new Error('400: Bad Request'); // Non-retryable error
      const fn = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(
        RetryHandler.withRetry(fn, {
          maxRetries: 2,
          initialDelayMs: 100,
          timeoutMs: 10000
        })
      ).rejects.toThrow('400: Bad Request');
      
      expect(fn).toHaveBeenCalledTimes(1); // No retries for 400 errors
    });

    it('should not retry non-retryable errors', async () => {
      // Arrange
      const error = new Error('Invalid input');
      const fn = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(
        RetryHandler.withRetry(fn, {
          maxRetries: 3,
          initialDelayMs: 1000,
          timeoutMs: 5000
        })
      ).rejects.toThrow('Invalid input');

      expect(fn).toHaveBeenCalledTimes(1); // No retries for non-retryable errors
    });

    it('should timeout if operation takes too long', async () => {
      // Arrange
      const fn = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 1000,
        timeoutMs: 2000
      });

      jest.advanceTimersByTime(2000);

      // Assert
      await expect(promise).rejects.toThrow('Operation timed out after 2000ms');
    });

    it('should use default options when none provided', async () => {
      // Arrange
      const fn = jest.fn().mockResolvedValue('result');

      // Act
      const result = await RetryHandler.withRetry(fn);

      // Assert
      expect(result).toBe('result');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should apply exponential backoff correctly', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('502: Bad Gateway'))
        .mockRejectedValueOnce(new Error('502: Bad Gateway'))
        .mockRejectedValueOnce(new Error('502: Bad Gateway'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 4,
        initialDelayMs: 100,
        backoffMultiplier: 2,
        timeoutMs: 10000
      });

      // First retry: 100ms
      await jest.advanceTimersByTimeAsync(100);
      
      // Second retry: 200ms (100 * 2)
      await jest.advanceTimersByTimeAsync(200);
      
      // Third retry: 400ms (200 * 2)
      await jest.advanceTimersByTimeAsync(400);

      const result = await promise;

      // Assert
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(4);
    });

    it('should retry on 504 Gateway Timeout errors', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('504: Gateway Timeout'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 100,
        timeoutMs: 5000
      });

      await jest.advanceTimersByTimeAsync(100);

      const result = await promise;

      // Assert
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on timeout errors', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 500,
        timeoutMs: 10000
      });

      await jest.advanceTimersByTimeAsync(500);

      const result = await promise;

      // Assert
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on network errors', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('network error'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 500,
        timeoutMs: 10000
      });

      await jest.advanceTimersByTimeAsync(500);

      const result = await promise;

      // Assert
      expect(result).toBe('success');
    });

    it('should retry on ECONNREFUSED errors', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 500,
        timeoutMs: 10000
      });

      await jest.advanceTimersByTimeAsync(500);

      const result = await promise;

      // Assert
      expect(result).toBe('success');
    });

    it('should retry on ENOTFOUND errors', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('ENOTFOUND'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 500,
        timeoutMs: 10000
      });

      await jest.advanceTimersByTimeAsync(500);

      const result = await promise;

      // Assert
      expect(result).toBe('success');
    });

    it('should retry on 502 errors', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('502: Bad Gateway'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 500,
        timeoutMs: 10000
      });

      await jest.advanceTimersByTimeAsync(500);

      const result = await promise;

      // Assert
      expect(result).toBe('success');
    });

    it('should retry on 429 rate limit errors', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('429: Too Many Requests'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 500,
        timeoutMs: 10000
      });

      await jest.advanceTimersByTimeAsync(500);

      const result = await promise;

      // Assert
      expect(result).toBe('success');
    });

    it('should handle non-Error rejections', async () => {
      // Arrange
      const fn = jest.fn().mockRejectedValue('string error');

      // Act & Assert
      await expect(
        RetryHandler.withRetry(fn, {
          maxRetries: 1,
          initialDelayMs: 100,
          timeoutMs: 5000
        })
      ).rejects.toBe('string error');
    });

    it('should throw "All retry attempts failed" when all retries exhausted', async () => {
      // Arrange
      const fn = jest.fn().mockRejectedValue(new Error('400: Bad Request'));

      // Act & Assert
      await expect(
        RetryHandler.withRetry(fn, {
          maxRetries: 0,
          initialDelayMs: 100,
          timeoutMs: 5000
        })
      ).rejects.toThrow('400: Bad Request');
    });

    it('should handle multiple sequential retry attempts', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('503: Service Unavailable'))
        .mockRejectedValueOnce(new Error('503: Service Unavailable'))
        .mockResolvedValue('success after retries');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        timeoutMs: 5000
      });

      await jest.advanceTimersByTimeAsync(100);
      await jest.advanceTimersByTimeAsync(200);

      const result = await promise;

      // Assert
      expect(result).toBe('success after retries');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use custom backoff multiplier', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('503'))
        .mockRejectedValueOnce(new Error('503'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 100,
        backoffMultiplier: 3, // Triple each time
        timeoutMs: 10000
      });

      // First retry: 100ms
      await jest.advanceTimersByTimeAsync(100);
      
      // Second retry: 300ms (100 * 3)
      await jest.advanceTimersByTimeAsync(300);

      const result = await promise;

      // Assert
      expect(result).toBe('success');
    });

    it('should handle async function returning complex objects', async () => {
      // Arrange
      const complexObject = { id: '123', data: { nested: 'value' }, array: [1, 2, 3] };
      const fn = jest.fn().mockResolvedValue(complexObject);

      // Act
      const result = await RetryHandler.withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 100,
        timeoutMs: 5000
      });

      // Assert
      expect(result).toEqual(complexObject);
    });
  });
});

