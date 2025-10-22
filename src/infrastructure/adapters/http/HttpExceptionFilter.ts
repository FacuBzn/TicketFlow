import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AppLogger } from '../../logger/AppLogger';
import { TicketNotFoundError } from '../../../domain/errors/TicketNotFoundError';
import { InvalidStateTransitionError } from '../../../domain/errors/InvalidStateTransitionError';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(@Inject(AppLogger) private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Map domain exceptions to HTTP exceptions
    if (exception instanceof TicketNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
      error = 'Not Found';
    } else if (exception instanceof InvalidStateTransitionError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Bad Request';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        message = resp.message || exception.message;
        error = resp.error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      
      // Log unexpected errors
      this.logger.error('Unhandled exception', 'HttpExceptionFilter', exception.stack, {
        status,
        message,
        path: request.url,
        method: request.method,
        correlationId: (request as any).correlationId,
      });
    }

    response.status(status).json({
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

