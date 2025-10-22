import { GeminiLLMClient } from '../../../../../src/infrastructure/adapters/llm/GeminiLLMClient';
import { AppLogger } from '../../../../../src/infrastructure/logger/AppLogger';

// Mock global fetch
global.fetch = jest.fn();

describe('GeminiLLMClient', () => {
  let client: GeminiLLMClient;
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
    process.env.GEMINI_API_KEY = 'test-gemini-api-key-123';

    client = new GeminiLLMClient(mockLogger);

    // Clear mocks
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('classifyUrgency', () => {
    it('should successfully classify urgency with Gemini', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          responseId: 'response-123',
          modelVersion: 'gemini-2.0-flash-lite',
          candidates: [{
            content: {
              parts: [{
                text: '{"urgencyScore": 0.9}'
              }]
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await client.classifyUrgency({
        title: 'Critical system failure',
        description: 'Production database is down'
      });

      // Assert
      expect(result).toEqual({ urgencyScore: 0.9 });
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Processing ticket classification',
        'GeminiLLMClient',
        { provider: 'gemini' }
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Urgency classification completed',
        'GeminiLLMClient',
        expect.objectContaining({
          urgencyScore: 0.9
        })
      );
    });

    it('should handle array response from Gemini', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          responseId: 'response-123',
          candidates: [{
            content: {
              parts: [{
                text: '[{"urgencyScore": 0.85}]'
              }]
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await client.classifyUrgency({
        title: 'Test',
        description: 'Test description'
      });

      // Assert
      expect(result.urgencyScore).toBe(0.85);
    });

    it('should retry with next model on 503 error', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          text: jest.fn().mockResolvedValue('Service Unavailable')
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            responseId: 'response-123',
            candidates: [{
              content: {
                parts: [{
                  text: '{"urgencyScore": 0.7}'
                }]
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
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Model overloaded, retrying',
        'GeminiLLMClient',
        expect.objectContaining({
          retryDelayMs: 2000
        })
      );
    });

    it('should handle empty response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          responseId: 'response-123',
          candidates: [{
            content: {
              parts: [{
                text: ''
              }]
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

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Empty response from model',
        'GeminiLLMClient',
        expect.any(Object)
      );
    });

    it('should handle invalid JSON response', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          responseId: 'response-123',
          candidates: [{
            content: {
              parts: [{
                text: 'This is not JSON'
              }]
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

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to parse Gemini response',
        'GeminiLLMClient',
        expect.any(String),
        expect.objectContaining({
          rawText: 'This is not JSON'
        })
      );
    });

    it('should handle 404 model not found error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Model not found')
      });

      // Act & Assert
      await expect(
        client.classifyUrgency({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow();

      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should log all attempted models when all fail', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error')
      });

      // Act & Assert
      await expect(
        client.classifyUrgency({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'All Gemini models failed',
        'GeminiLLMClient',
        expect.any(String),
        expect.objectContaining({
          attemptedModels: ['gemini-2.0-flash-lite']
        })
      );
    });

    it('should handle response missing urgencyScore', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          responseId: 'response-123',
          candidates: [{
            content: {
              parts: [{
                text: '{"someOtherField": "value"}'
              }]
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
      ).rejects.toThrow('Invalid JSON response');
    });

    it('should log debug messages during processing', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          responseId: 'response-123',
          modelVersion: 'gemini-2.0-flash-lite',
          candidates: [{
            content: {
              parts: [{
                text: '{"urgencyScore": 0.6}'
              }]
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
        'Attempting model',
        'GeminiLLMClient',
        { model: 'gemini-2.0-flash-lite' }
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Gemini API response received',
        'GeminiLLMClient',
        expect.objectContaining({
          responseId: 'response-123'
        })
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Extracted text from response',
        'GeminiLLMClient',
        expect.any(Object)
      );
    });

    it('should use correct API endpoint and headers', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: '{"urgencyScore": 0.5}'
              }]
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await client.classifyUrgency({
        title: 'Test',
        description: 'Test'
      });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://generativelanguage.googleapis.com/v1beta/models/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('key=test-gemini-api-key-123'),
        expect.any(Object)
      );
    });

    it('should handle network errors', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));

      // Act & Assert
      await expect(
        client.classifyUrgency({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Model error',
        'GeminiLLMClient',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should send prompt with title and description', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: '{"urgencyScore": 0.8}'
              }]
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await client.classifyUrgency({
        title: 'Payment failure',
        description: 'Users cannot complete checkout'
      });

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      const promptText = requestBody.contents[0].parts[0].text;

      expect(promptText).toContain('Payment failure');
      expect(promptText).toContain('Users cannot complete checkout');
    });

    it('should use correct generation config', async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: '{"urgencyScore": 0.5}'
              }]
            }
          }]
        })
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      await client.classifyUrgency({
        title: 'Test',
        description: 'Test'
      });

      // Assert
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody.generationConfig).toEqual({
        temperature: 0.0,
        maxOutputTokens: 256,
        responseMimeType: 'application/json'
      });
    });

    it('should handle 503 and wait before retry', async () => {
      // Arrange
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          text: jest.fn().mockResolvedValue('Overloaded')
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            candidates: [{
              content: {
                parts: [{
                  text: '{"urgencyScore": 0.75}'
                }]
              }
            }]
          })
        });

      // Act
      const result = await client.classifyUrgency({
        title: 'Test',
        description: 'Test'
      });

      // Assert
      expect(result.urgencyScore).toBe(0.75);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Model overloaded, retrying',
        'GeminiLLMClient',
        expect.objectContaining({
          retryDelayMs: 2000
        })
      );
    });
  });
});

