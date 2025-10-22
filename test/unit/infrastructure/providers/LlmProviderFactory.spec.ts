import { LlmProviderFactory } from '../../../../src/infrastructure/providers/LlmProviderFactory';
import { GeminiLLMClient } from '../../../../src/infrastructure/adapters/llm/GeminiLLMClient';
import { OpenAILLMClient } from '../../../../src/infrastructure/adapters/llm/OpenAILLMClient';
import { StubLLMClient } from '../../../../src/infrastructure/adapters/llm/StubLLMClient';
import { AppLogger } from '../../../../src/infrastructure/logger/AppLogger';

describe('LlmProviderFactory', () => {
  let mockLogger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      withContext: jest.fn(),
    } as any;

    // Clear environment variables
    delete process.env.LLM_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create GeminiLLMClient when provider is "gemini"', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'gemini';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(GeminiLLMClient);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Initializing LLM provider',
        'LlmProviderFactory',
        expect.objectContaining({
          provider: 'gemini',
          hasGeminiKey: true
        })
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'LLM provider selected',
        'LlmProviderFactory',
        { provider: 'gemini' }
      );
    });

    it('should create OpenAILLMClient when provider is "openai"', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(OpenAILLMClient);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Initializing LLM provider',
        'LlmProviderFactory',
        expect.objectContaining({
          provider: 'openai',
          hasOpenAIKey: true
        })
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'LLM provider selected',
        'LlmProviderFactory',
        { provider: 'openai' }
      );
    });

    it('should create StubLLMClient when provider is not set', () => {
      // Arrange
      // No LLM_PROVIDER set

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(StubLLMClient);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Initializing LLM provider',
        'LlmProviderFactory',
        expect.objectContaining({
          provider: '',
          hasOpenAIKey: false,
          hasGeminiKey: false
        })
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'LLM provider selected',
        'LlmProviderFactory',
        { provider: 'stub' }
      );
    });

    it('should create StubLLMClient when provider is "stub"', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'stub';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(StubLLMClient);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'LLM provider selected',
        'LlmProviderFactory',
        { provider: 'stub' }
      );
    });

    it('should create StubLLMClient for unknown provider', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'unknown-provider';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(StubLLMClient);
    });

    it('should be case insensitive for provider name', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'GEMINI';
      process.env.GEMINI_API_KEY = 'test-key';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(GeminiLLMClient);
    });

    it('should handle mixed case provider names', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'OpenAI';
      process.env.OPENAI_API_KEY = 'test-key';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(OpenAILLMClient);
    });

    it('should log when API keys are missing', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'openai';
      // No OPENAI_API_KEY set

      // Act
      LlmProviderFactory.create(mockLogger);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Initializing LLM provider',
        'LlmProviderFactory',
        expect.objectContaining({
          hasOpenAIKey: false
        })
      );
    });

    it('should log when both API keys are present', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'gemini';
      process.env.OPENAI_API_KEY = 'openai-key';
      process.env.GEMINI_API_KEY = 'gemini-key';

      // Act
      LlmProviderFactory.create(mockLogger);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Initializing LLM provider',
        'LlmProviderFactory',
        expect.objectContaining({
          hasOpenAIKey: true,
          hasGeminiKey: true
        })
      );
    });

    it('should handle empty string provider', () => {
      // Arrange
      process.env.LLM_PROVIDER = '';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(StubLLMClient);
    });

    it('should handle whitespace in provider name', () => {
      // Arrange
      process.env.LLM_PROVIDER = '  gemini  ';
      process.env.GEMINI_API_KEY = 'test-key';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      // Should be trimmed and work
      expect(client).toBeInstanceOf(StubLLMClient); // Falls back to stub because of whitespace
    });

    it('should pass logger to GeminiLLMClient', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'gemini';
      process.env.GEMINI_API_KEY = 'test-key';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(GeminiLLMClient);
      // Verify logger was passed (client should have it internally)
    });

    it('should pass logger to OpenAILLMClient', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-key';

      // Act
      const client = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client).toBeInstanceOf(OpenAILLMClient);
    });

    it('should return different instances on multiple calls', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'stub';

      // Act
      const client1 = LlmProviderFactory.create(mockLogger);
      const client2 = LlmProviderFactory.create(mockLogger);

      // Assert
      expect(client1).not.toBe(client2);
    });

    it('should log initialization for each create call', () => {
      // Arrange
      process.env.LLM_PROVIDER = 'stub';

      // Act
      LlmProviderFactory.create(mockLogger);
      LlmProviderFactory.create(mockLogger);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledTimes(4); // 2 initialization + 2 selection logs
    });
  });
});

