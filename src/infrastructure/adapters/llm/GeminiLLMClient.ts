import { LLMClientPort } from '../../../application/ports/LLMClientPort';
import { BASE_URGENCY_PROMPT } from './commonPrompt';
import { AppLogger } from '../../logger/AppLogger';
import { RetryHandler } from '../../utils/RetryHandler';

export class GeminiLLMClient implements LLMClientPort {
  private readonly apiKey: string;
  private readonly retryOptions = {
    maxRetries: 3,
    initialDelayMs: 1000,
    timeoutMs: 15000, // 15 seconds timeout
  };

  constructor(private readonly logger: AppLogger) {
    this.apiKey = process.env.GEMINI_API_KEY!;
  }

  async classifyUrgency(input: { title: string; description: string }): Promise<{ urgencyScore: number }> {
    this.logger.log('Processing ticket classification', 'GeminiLLMClient', { provider: 'gemini' });

    return RetryHandler.withRetry(
      () => this.performClassification(input),
      this.retryOptions
    );
  }

  private async performClassification(input: { title: string; description: string }): Promise<{ urgencyScore: number }> {
    
    const prompt = BASE_URGENCY_PROMPT
      .replace('{{title}}', input.title)
      .replace('{{description}}', input.description);

    // Try free models for text analysis
    const models = ['gemini-2.0-flash-lite'];
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        this.logger.debug('Attempting model', 'GeminiLLMClient', { model });
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.0,
              maxOutputTokens: 256,
              responseMimeType: 'application/json'
            }
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          this.logger.warn('Model unavailable', 'GeminiLLMClient', { 
            model, 
            status: response.status,
            errorText 
          });
          lastError = new Error(`${response.status}: ${errorText}`);
          
          // If 503 (overloaded), wait before trying next model
          if (response.status === 503) {
            this.logger.warn('Model overloaded, retrying', 'GeminiLLMClient', { 
              model, 
              retryDelayMs: 2000 
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          continue;
        }

        const json = await response.json();
        this.logger.debug('Gemini API response received', 'GeminiLLMClient', { 
          model,
          responseId: json.responseId,
          modelVersion: json.modelVersion
        });
        
        const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        this.logger.debug('Extracted text from response', 'GeminiLLMClient', { textLength: text.length });

        if (!text || text.trim() === '') {
          this.logger.warn('Empty response from model', 'GeminiLLMClient', { model });
          lastError = new Error('Empty response from Gemini API');
          continue;
        }
        
        try {
          let parsed = JSON.parse(text);
          
          // Handle if response is an array: [{"urgencyScore": 0.9}]
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed = parsed[0];
          }
          
          const result: { urgencyScore: number } = parsed;
          if (typeof result.urgencyScore !== 'number') {
            throw new Error('Missing urgencyScore in response');
          }
          
          this.logger.log('Urgency classification completed', 'GeminiLLMClient', { 
            model, 
            urgencyScore: result.urgencyScore 
          });
          return result;
        } catch (e) {
          const error = e as Error;
          this.logger.error(
            'Failed to parse Gemini response', 
            'GeminiLLMClient',
            error.stack,
            { model, rawText: text }
          );
          lastError = new Error(`Invalid JSON response: ${text}`);
          continue;
        }
      } catch (error) {
        const err = error as Error;
        this.logger.error('Model error', 'GeminiLLMClient', err.stack, { model });
        lastError = err;
        continue;
      }
    }

    // All models failed
    this.logger.error(
      'All Gemini models failed', 
      'GeminiLLMClient',
      lastError?.stack,
      { attemptedModels: models }
    );
    throw lastError || new Error('All Gemini models failed');
  }
}
