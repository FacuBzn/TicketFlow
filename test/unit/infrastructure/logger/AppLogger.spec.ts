import { AppLogger, ContextualLogger } from '../../../../src/infrastructure/logger/AppLogger';
import { PinoLogger } from 'nestjs-pino';

describe('AppLogger', () => {
  let appLogger: AppLogger;
  let mockPinoLogger: jest.Mocked<PinoLogger>;

  beforeEach(() => {
    mockPinoLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    } as any;

    appLogger = new AppLogger(mockPinoLogger);

    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should log info message with context and metadata', () => {
      // Act
      appLogger.log('Test message', 'TestContext', { key: 'value' });

      // Assert
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { context: 'TestContext', key: 'value' },
        'Test message'
      );
    });

    it('should log info message without metadata', () => {
      // Act
      appLogger.log('Test message', 'TestContext');

      // Assert
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { context: 'TestContext' },
        'Test message'
      );
    });

    it('should handle empty metadata object', () => {
      // Act
      appLogger.log('Test message', 'TestContext', {});

      // Assert
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { context: 'TestContext' },
        'Test message'
      );
    });

    it('should handle complex metadata', () => {
      // Arrange
      const complexMetadata = {
        userId: '123',
        action: 'create',
        nested: { field: 'value' },
        array: [1, 2, 3]
      };

      // Act
      appLogger.log('Complex message', 'TestContext', complexMetadata);

      // Assert
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { context: 'TestContext', ...complexMetadata },
        'Complex message'
      );
    });
  });

  describe('info', () => {
    it('should call log method', () => {
      // Arrange
      const spy = jest.spyOn(appLogger, 'log');

      // Act
      appLogger.info('Info message', 'InfoContext', { data: 'test' });

      // Assert
      expect(spy).toHaveBeenCalledWith('Info message', 'InfoContext', { data: 'test' });
    });
  });

  describe('warn', () => {
    it('should log warning with context and metadata', () => {
      // Act
      appLogger.warn('Warning message', 'WarnContext', { warning: 'data' });

      // Assert
      expect(mockPinoLogger.warn).toHaveBeenCalledWith(
        { context: 'WarnContext', warning: 'data' },
        'Warning message'
      );
    });

    it('should log warning without metadata', () => {
      // Act
      appLogger.warn('Warning message', 'WarnContext');

      // Assert
      expect(mockPinoLogger.warn).toHaveBeenCalledWith(
        { context: 'WarnContext' },
        'Warning message'
      );
    });
  });

  describe('error', () => {
    it('should log error with context, trace, and metadata', () => {
      // Act
      appLogger.error('Error message', 'ErrorContext', 'Stack trace here', { errorCode: 500 });

      // Assert
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        { context: 'ErrorContext', trace: 'Stack trace here', errorCode: 500 },
        'Error message'
      );
    });

    it('should log error without trace', () => {
      // Act
      appLogger.error('Error message', 'ErrorContext', undefined, { errorCode: 404 });

      // Assert
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        { context: 'ErrorContext', trace: undefined, errorCode: 404 },
        'Error message'
      );
    });

    it('should log error without metadata', () => {
      // Act
      appLogger.error('Error message', 'ErrorContext', 'Stack trace');

      // Assert
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        { context: 'ErrorContext', trace: 'Stack trace' },
        'Error message'
      );
    });

    it('should log error with only message and context', () => {
      // Act
      appLogger.error('Error message', 'ErrorContext');

      // Assert
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        { context: 'ErrorContext', trace: undefined },
        'Error message'
      );
    });
  });

  describe('debug', () => {
    it('should log debug message with context and metadata', () => {
      // Act
      appLogger.debug('Debug message', 'DebugContext', { debugData: 'test' });

      // Assert
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        { context: 'DebugContext', debugData: 'test' },
        'Debug message'
      );
    });

    it('should log debug message without metadata', () => {
      // Act
      appLogger.debug('Debug message', 'DebugContext');

      // Assert
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        { context: 'DebugContext' },
        'Debug message'
      );
    });
  });

  describe('trace', () => {
    it('should log trace message with context and metadata', () => {
      // Act
      appLogger.trace('Trace message', 'TraceContext', { traceData: 'test' });

      // Assert
      expect(mockPinoLogger.trace).toHaveBeenCalledWith(
        { context: 'TraceContext', traceData: 'test' },
        'Trace message'
      );
    });

    it('should log trace message without metadata', () => {
      // Act
      appLogger.trace('Trace message', 'TraceContext');

      // Assert
      expect(mockPinoLogger.trace).toHaveBeenCalledWith(
        { context: 'TraceContext' },
        'Trace message'
      );
    });
  });

  describe('withContext', () => {
    it('should create ContextualLogger with fixed context', () => {
      // Act
      const contextualLogger = appLogger.withContext('FixedContext');

      // Assert
      expect(contextualLogger).toBeInstanceOf(ContextualLogger);
    });

    it('should allow logging with contextual logger', () => {
      // Arrange
      const contextualLogger = appLogger.withContext('FixedContext');

      // Act
      contextualLogger.log('Message from contextual logger', { data: 'test' });

      // Assert
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { context: 'FixedContext', data: 'test' },
        'Message from contextual logger'
      );
    });
  });
});

describe('ContextualLogger', () => {
  let appLogger: AppLogger;
  let mockPinoLogger: jest.Mocked<PinoLogger>;
  let contextualLogger: ContextualLogger;

  beforeEach(() => {
    mockPinoLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    } as any;

    appLogger = new AppLogger(mockPinoLogger);
    contextualLogger = new ContextualLogger(appLogger, 'TestContext');

    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should log with fixed context', () => {
      // Act
      contextualLogger.log('Test message', { key: 'value' });

      // Assert
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { context: 'TestContext', key: 'value' },
        'Test message'
      );
    });

    it('should log without metadata', () => {
      // Act
      contextualLogger.log('Test message');

      // Assert
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { context: 'TestContext' },
        'Test message'
      );
    });
  });

  describe('info', () => {
    it('should log info with fixed context', () => {
      // Act
      contextualLogger.info('Info message', { data: 'test' });

      // Assert
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { context: 'TestContext', data: 'test' },
        'Info message'
      );
    });
  });

  describe('warn', () => {
    it('should log warning with fixed context', () => {
      // Act
      contextualLogger.warn('Warning message', { warning: 'data' });

      // Assert
      expect(mockPinoLogger.warn).toHaveBeenCalledWith(
        { context: 'TestContext', warning: 'data' },
        'Warning message'
      );
    });
  });

  describe('error', () => {
    it('should log error with fixed context and trace', () => {
      // Act
      contextualLogger.error('Error message', 'Stack trace', { errorCode: 500 });

      // Assert
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        { context: 'TestContext', trace: 'Stack trace', errorCode: 500 },
        'Error message'
      );
    });

    it('should log error without trace', () => {
      // Act
      contextualLogger.error('Error message', undefined, { errorCode: 404 });

      // Assert
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        { context: 'TestContext', trace: undefined, errorCode: 404 },
        'Error message'
      );
    });

    it('should log error without metadata', () => {
      // Act
      contextualLogger.error('Error message', 'Stack trace');

      // Assert
      expect(mockPinoLogger.error).toHaveBeenCalledWith(
        { context: 'TestContext', trace: 'Stack trace' },
        'Error message'
      );
    });
  });

  describe('debug', () => {
    it('should log debug with fixed context', () => {
      // Act
      contextualLogger.debug('Debug message', { debugData: 'test' });

      // Assert
      expect(mockPinoLogger.debug).toHaveBeenCalledWith(
        { context: 'TestContext', debugData: 'test' },
        'Debug message'
      );
    });
  });

  describe('trace', () => {
    it('should log trace with fixed context', () => {
      // Act
      contextualLogger.trace('Trace message', { traceData: 'test' });

      // Assert
      expect(mockPinoLogger.trace).toHaveBeenCalledWith(
        { context: 'TestContext', traceData: 'test' },
        'Trace message'
      );
    });
  });

  describe('context isolation', () => {
    it('should maintain separate contexts for different instances', () => {
      // Arrange
      const logger1 = new ContextualLogger(appLogger, 'Context1');
      const logger2 = new ContextualLogger(appLogger, 'Context2');

      // Act
      logger1.log('Message 1');
      logger2.log('Message 2');

      // Assert
      expect(mockPinoLogger.info).toHaveBeenNthCalledWith(
        1,
        { context: 'Context1' },
        'Message 1'
      );
      expect(mockPinoLogger.info).toHaveBeenNthCalledWith(
        2,
        { context: 'Context2' },
        'Message 2'
      );
    });
  });
});

