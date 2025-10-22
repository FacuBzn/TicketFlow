import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLogger } from '../logger/AppLogger';

/**
 * Logging interceptor to add business metadata to logs
 * Captures ticketId, operation type, and performance metrics
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<any>();
    const { method, url, params } = request;
    const startTime = Date.now();

    // Extract business context
    const ticketId = params?.id;
    const operation = this.getOperationType(method, url);
    
    const contextName = 'LoggingInterceptor';
    
    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          
          // Log successful operations with business metadata
          this.logger.log('Operation completed successfully', contextName, {
            operation,
            ticketId,
            method,
            url,
            durationMs: duration,
            responseType: Array.isArray(response) ? 'list' : 'single',
            itemCount: Array.isArray(response) ? response.length : undefined,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          
          // Log failed operations with business metadata
          this.logger.error('Operation failed', contextName, error.stack, {
            operation,
            ticketId,
            method,
            url,
            durationMs: duration,
            errorType: error.name,
            errorMessage: error.message,
          });
        },
      })
    );
  }

  /**
   * Extract operation type from HTTP method and URL
   */
  private getOperationType(method: string, url: string): string {
    if (url.includes('/reclassify')) return 'RECLASSIFY_TICKET';
    if (url.includes('/close')) return 'CLOSE_TICKET';
    if (url.includes('/status')) return 'UPDATE_STATUS';
    if (url.includes('/health')) return 'HEALTH_CHECK';
    if (url.includes('/debug')) return 'DEBUG';

    switch (method.toUpperCase()) {
      case 'POST':
        return 'CREATE_TICKET';
      case 'GET':
        return url.includes('/:id') || url.match(/\/[a-f0-9-]{36}$/i) 
          ? 'GET_TICKET' 
          : 'LIST_TICKETS';
      case 'PATCH':
        return 'UPDATE_TICKET';
      case 'DELETE':
        return 'DELETE_TICKET';
      default:
        return 'UNKNOWN';
    }
  }
}

