import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppLogger {
  constructor(private readonly logger: PinoLogger) {}

  log(message: string, context: string, metadata?: Record<string, any>): void {
    this.logger.setContext(context);
    if (metadata) {
      this.logger.info(metadata, message);
    } else {
      this.logger.info(message);
    }
  }

  warn(message: string, context: string, metadata?: Record<string, any>): void {
    this.logger.setContext(context);
    if (metadata) {
      this.logger.warn(metadata, message);
    } else {
      this.logger.warn(message);
    }
  }

  error(message: string, context: string, trace?: string, metadata?: Record<string, any>): void {
    this.logger.setContext(context);
    const errorMetadata = { ...metadata, trace };
    this.logger.error(errorMetadata, message);
  }

  debug(message: string, context: string, metadata?: Record<string, any>): void {
    this.logger.setContext(context);
    if (metadata) {
      this.logger.debug(metadata, message);
    } else {
      this.logger.debug(message);
    }
  }

  trace(message: string, context: string, metadata?: Record<string, any>): void {
    this.logger.setContext(context);
    if (metadata) {
      this.logger.trace(metadata, message);
    } else {
      this.logger.trace(message);
    }
  }
}

