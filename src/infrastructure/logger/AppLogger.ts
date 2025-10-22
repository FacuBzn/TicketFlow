import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

/**
 * Application logger wrapper around PinoLogger
 * Provides contextual logging with consistent structure
 */
@Injectable()
export class AppLogger {
  constructor(private readonly logger: PinoLogger) {}

  /**
   * Log info message
   * @param message - Log message
   * @param context - Context/component name (e.g., 'CreateTicketUseCase')
   * @param metadata - Additional structured data
   */
  log(message: string, context: string, metadata?: Record<string, any>): void {
    this.logger.info({ context, ...metadata }, message);
  }

  /**
   * Log info message (alias for log)
   */
  info(message: string, context: string, metadata?: Record<string, any>): void {
    this.log(message, context, metadata);
  }

  /**
   * Log warning message
   */
  warn(message: string, context: string, metadata?: Record<string, any>): void {
    this.logger.warn({ context, ...metadata }, message);
  }

  /**
   * Log error message with optional stack trace
   * @param message - Error message
   * @param context - Context/component name
   * @param trace - Stack trace (optional)
   * @param metadata - Additional error metadata
   */
  error(message: string, context: string, trace?: string, metadata?: Record<string, any>): void {
    this.logger.error({ context, trace, ...metadata }, message);
  }

  /**
   * Log debug message
   */
  debug(message: string, context: string, metadata?: Record<string, any>): void {
    this.logger.debug({ context, ...metadata }, message);
  }

  /**
   * Log trace message (most verbose)
   */
  trace(message: string, context: string, metadata?: Record<string, any>): void {
    this.logger.trace({ context, ...metadata }, message);
  }

  /**
   * Create a child logger with fixed context
   * Useful for classes that always log with the same context
   * @param context - Fixed context for all logs
   */
  withContext(context: string): ContextualLogger {
    return new ContextualLogger(this, context);
  }
}

/**
 * Contextual logger that always logs with a fixed context
 * Simplifies logging in classes that have a consistent context
 */
export class ContextualLogger {
  constructor(
    private readonly logger: AppLogger,
    private readonly context: string
  ) {}

  log(message: string, metadata?: Record<string, any>): void {
    this.logger.log(message, this.context, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.logger.info(message, this.context, metadata);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.logger.warn(message, this.context, metadata);
  }

  error(message: string, trace?: string, metadata?: Record<string, any>): void {
    this.logger.error(message, this.context, trace, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.logger.debug(message, this.context, metadata);
  }

  trace(message: string, metadata?: Record<string, any>): void {
    this.logger.trace(message, this.context, metadata);
  }
}

