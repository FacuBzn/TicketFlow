import { LoggingInterceptor } from '../../../../src/infrastructure/interceptors/LoggingInterceptor';
import { AppLogger } from '../../../../src/infrastructure/logger/AppLogger';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockLogger: jest.Mocked<AppLogger>;
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockCallHandler: jest.Mocked<CallHandler>;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      trace: jest.fn(),
      withContext: jest.fn(),
    } as any;

    interceptor = new LoggingInterceptor(mockLogger);

    // Mock ExecutionContext
    mockExecutionContext = {
      switchToHttp: jest.fn(),
      getType: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
    } as any;

    // Mock CallHandler
    mockCallHandler = {
      handle: jest.fn(),
    } as any;

    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should log successful operation with ticket UUID', (done) => {
      // Arrange
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/tickets/550e8400-e29b-41d4-a716-446655440000',
        params: { id: '550e8400-e29b-41d4-a716-446655440000' }
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ id: '550e8400-e29b-41d4-a716-446655440000', title: 'Test' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          'Operation completed successfully',
          'LoggingInterceptor',
          expect.objectContaining({
            operation: 'GET_TICKET',
            ticketId: '550e8400-e29b-41d4-a716-446655440000',
            method: 'GET',
            url: '/api/v1/tickets/550e8400-e29b-41d4-a716-446655440000',
            responseType: 'single'
          })
        );
        done();
      });
    });

    it('should log successful operation for list of tickets', (done) => {
      // Arrange
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/tickets',
        params: {}
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      const responseArray = [{ id: '1' }, { id: '2' }, { id: '3' }];
      mockCallHandler.handle.mockReturnValue(of(responseArray));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          'Operation completed successfully',
          'LoggingInterceptor',
          expect.objectContaining({
            operation: 'LIST_TICKETS',
            responseType: 'list',
            itemCount: 3
          })
        );
        done();
      });
    });

    it('should log failed operation with error details', (done) => {
      // Arrange
      const mockRequest = {
        method: 'POST',
        url: '/api/v1/tickets',
        params: {}
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(throwError(() => error));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        error: () => {
          // Assert
          expect(mockLogger.error).toHaveBeenCalledWith(
            'Operation failed',
            'LoggingInterceptor',
            expect.any(String),
            expect.objectContaining({
              operation: 'CREATE_TICKET',
              method: 'POST',
              url: '/api/v1/tickets',
              errorType: 'ValidationError',
              errorMessage: 'Validation failed'
            })
          );
          done();
        }
      });
    });

    it('should detect CREATE_TICKET operation', (done) => {
      // Arrange
      const mockRequest = {
        method: 'POST',
        url: '/api/v1/tickets',
        params: {}
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ id: 'new-123' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            operation: 'CREATE_TICKET'
          })
        );
        done();
      });
    });

    it('should detect RECLASSIFY_TICKET operation', (done) => {
      // Arrange
      const mockRequest = {
        method: 'POST',
        url: '/api/v1/tickets/123/reclassify',
        params: { id: '123' }
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ id: '123' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            operation: 'RECLASSIFY_TICKET'
          })
        );
        done();
      });
    });

    it('should detect CLOSE_TICKET operation', (done) => {
      // Arrange
      const mockRequest = {
        method: 'PATCH',
        url: '/api/v1/tickets/123/close',
        params: { id: '123' }
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ id: '123', status: 'CLOSED' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            operation: 'CLOSE_TICKET'
          })
        );
        done();
      });
    });

    it('should detect UPDATE_STATUS operation', (done) => {
      // Arrange
      const mockRequest = {
        method: 'PATCH',
        url: '/api/v1/tickets/123/status',
        params: { id: '123' }
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ id: '123' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            operation: 'UPDATE_STATUS'
          })
        );
        done();
      });
    });

    it('should detect HEALTH_CHECK operation', (done) => {
      // Arrange
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/tickets/health',
        params: {}
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ status: 'ok' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            operation: 'HEALTH_CHECK'
          })
        );
        done();
      });
    });

    it('should detect DEBUG operation', (done) => {
      // Arrange
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/tickets/debug',
        params: {}
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ env: 'test' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            operation: 'DEBUG'
          })
        );
        done();
      });
    });

    it('should detect DELETE_TICKET operation', (done) => {
      // Arrange
      const mockRequest = {
        method: 'DELETE',
        url: '/api/v1/tickets/123',
        params: { id: '123' }
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ deleted: true }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            operation: 'DELETE_TICKET'
          })
        );
        done();
      });
    });

    it('should detect UPDATE_TICKET for PATCH without specific path', (done) => {
      // Arrange
      const mockRequest = {
        method: 'PATCH',
        url: '/api/v1/tickets/123',
        params: { id: '123' }
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ id: '123' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            operation: 'UPDATE_TICKET'
          })
        );
        done();
      });
    });

    it('should track operation duration', (done) => {
      // Arrange
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/tickets',
        params: {}
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of([]));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            durationMs: expect.any(Number)
          })
        );
        done();
      });
    });

    it('should not include itemCount for single object response', (done) => {
      // Arrange
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/tickets/123',
        params: { id: '123' }
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ id: '123' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            responseType: 'single',
            itemCount: undefined
          })
        );
        done();
      });
    });

    it('should handle UUID in URL for GET_TICKET detection', (done) => {
      // Arrange
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/tickets/550e8400-e29b-41d4-a716-446655440000',
        params: { id: '550e8400-e29b-41d4-a716-446655440000' }
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of({ id: '550e8400-e29b-41d4-a716-446655440000' }));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            operation: 'GET_TICKET'
          })
        );
        done();
      });
    });

    it('should handle requests without ticketId', (done) => {
      // Arrange
      const mockRequest = {
        method: 'GET',
        url: '/api/v1/tickets',
        params: {}
      };

      const mockHttpContext = {
        getRequest: jest.fn().mockReturnValue(mockRequest)
      };

      mockExecutionContext.switchToHttp.mockReturnValue(mockHttpContext as any);
      mockCallHandler.handle.mockReturnValue(of([]));

      // Act
      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
        // Assert
        expect(mockLogger.log).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            ticketId: undefined
          })
        );
        done();
      });
    });
  });
});

