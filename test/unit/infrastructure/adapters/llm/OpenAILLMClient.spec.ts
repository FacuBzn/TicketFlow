import { OpenAILLMClient } from '../../../../../src/infrastructure/adapters/llm/OpenAILLMClient';
import { AppLogger } from '../../../../../src/infrastructure/logger/AppLogger';

// Mock global fetch
global.fetch = jest.fn();

describe('OpenAILLMClient', () => {
  let client: OpenAILLMClient;
  let mockLogger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    // Create mock logger
    mockLogger = {
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
      withContext: jest.fn(),
    } as any;

    // Set API key in environment
    process.env.OPENAI_API_KEY = 'test-api-key-123';

    client = new OpenAILLMClient(mockLogger);

    // Clear mocks
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('classifyUrgency', () => {
    it('should successfully classify urgency with OpenAI', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'response-123',
          model: 'gpt-3.5-turbo',
          choices: [{
            message: {
              content: '{"urgencyScore": 0.85}'
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await client.classifyUrgency({
        title: 'System down',
        description: 'Production is offline'
      });

      // Assert
      expect(result).toEqual({ urgencyScore: 0.85 });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Processing ticket classification',
        'OpenAILLMClient',
        { provider: 'openai' }
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Urgency classification completed',
        'OpenAILLMClient',
        { urgencyScore: 0.85 }
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key-123'
          })
        })
      );
    });

    it('should handle OpenAI API errors', async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: jest.fn().mockResolvedValue('Service unavailable')
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        client.classifyUrgency({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow('OpenAI API Error: 500 - Service unavailable');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'OpenAI API request failed',
        'OpenAILLMClient',
        undefined,
        expect.objectContaining({
          status: 500,
          statusText: 'Internal Server Error'
        })
      );
    });

    it('should handle invalid JSON response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'response-123',
          model: 'gpt-3.5-turbo',
          choices: [{
            message: {
              content: 'This is not JSON'
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        client.classifyUrgency({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow('OpenAILLMClient: Invalid response');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to parse OpenAI response',
        'OpenAILLMClient',
        expect.any(String),
        expect.objectContaining({
          rawText: 'This is not JSON'
        })
      );
    });

    it('should handle response with missing urgencyScore', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'response-123',
          model: 'gpt-3.5-turbo',
          choices: [{
            message: {
              content: '{"someOtherField": "value"}'
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        client.classifyUrgency({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow('OpenAILLMClient: Invalid response');
    });

    it('should handle network errors', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(
        client.classifyUrgency({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow('Network error');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected error in OpenAI client',
        'OpenAILLMClient',
        expect.any(String)
      );
    });

    it('should log debug messages for API response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'response-123',
          model: 'gpt-3.5-turbo',
          choices: [{
            message: {
              content: '{"urgencyScore": 0.5}'
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await client.classifyUrgency({
        title: 'Test',
        description: 'Test description'
      });

      // Assert
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'OpenAI API response received',
        'OpenAILLMClient',
        expect.objectContaining({
          responseId: 'response-123',
          model: 'gpt-3.5-turbo'
        })
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Extracted text from response',
        'OpenAILLMClient',
        expect.objectContaining({
          textLength: expect.any(Number)
        })
      );
    });

    it('should handle empty content in response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'response-123',
          model: 'gpt-3.5-turbo',
          choices: [{
            message: {
              content: ''
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(
        client.classifyUrgency({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow();
    });

    it('should handle timeout with retry mechanism', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            id: 'response-123',
            model: 'gpt-3.5-turbo',
            choices: [{
              message: {
                content: '{"urgencyScore": 0.7}'
              }
            }]
          })
        });

      // Act
      const result = await client.classifyUrgency({
        title: 'Test',
        description: 'Test description'
      });

      // Assert
      expect(result.urgencyScore).toBe(0.7);
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });

    it('should send correct prompt to OpenAI', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'response-123',
          model: 'gpt-3.5-turbo',
          choices: [{
            message: {
              content: '{"urgencyScore": 0.6}'
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await client.classifyUrgency({
        title: 'Payment issue',
        description: 'Customer cannot checkout'
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('Payment issue'),
        })
      );
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: expect.stringContaining('Customer cannot checkout'),
        })
      );
    });

    it('should use correct model and temperature', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: 'response-123',
          model: 'gpt-3.5-turbo',
          choices: [{
            message: {
              content: '{"urgencyScore": 0.5}'
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await client.classifyUrgency({
        title: 'Test',
        description: 'Test description'
      });

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody.model).toBe('gpt-3.5-turbo');
      expect(requestBody.temperature).toBe(0.0);
    });

    it('should handle 429 rate limit errors and retry', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          text: jest.fn().mockResolvedValue('Rate limit exceeded')
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            id: 'response-123',
            model: 'gpt-3.5-turbo',
            choices: [{
              message: {
                content: '{"urgencyScore": 0.8}'
              }
            }]
          })
        });

      // Act
      const result = await client.classifyUrgency({
        title: 'Test',
        description: 'Test description'
      });

      // Assert
      expect(result.urgencyScore).toBe(0.8);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle 503 service unavailable and retry', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: jest.fn().mockResolvedValue('Service temporarily unavailable')
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            id: 'response-123',
            model: 'gpt-3.5-turbo',
            choices: [{
              message: {
                content: '{"urgencyScore": 0.75}'
              }
            }]
          })
        });

      // Act
      const result = await client.classifyUrgency({
        title: 'Test',
        description: 'Test description'
      });

      // Assert
      expect(result.urgencyScore).toBe(0.75);
    });
  });
});

