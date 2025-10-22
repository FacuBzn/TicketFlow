import { LLMClientPort } from '../../../application/ports/LLMClientPort';
import { BASE_URGENCY_PROMPT } from './commonPrompt';
import { AppLogger } from '../../logger/AppLogger';
import { RetryHandler } from '../../utils/RetryHandler';

export class OpenAILLMClient implements LLMClientPort {
  private readonly apiKey: string;
  private readonly retryOptions = {
    maxRetries: 3,
    initialDelayMs: 1000,
    timeoutMs: 15000, // 15 seconds timeout
  };

  constructor(private readonly logger: AppLogger) {
    this.apiKey = process.env.OPENAI_API_KEY!;
  }

  async classifyUrgency(input: { title: string; description: string }): Promise<{ urgencyScore: number }> {
    this.logger.log('Processing ticket classification', 'OpenAILLMClient', { provider: 'openai' });

    return RetryHandler.withRetry(
      () => this.performClassification(input),
      this.retryOptions
    );
  }

  private async performClassification(input: { title: string; description: string }): Promise<{ urgencyScore: number }> {
    
    const prompt = BASE_URGENCY_PROMPT
      .replace('{{title}}', input.title)
      .replace('{{description}}', input.description);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'Solo responde con el JSON, sin texto extra.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          'OpenAI API request failed', 
          'OpenAILLMClient',
          undefined,
          { 
            status: response.status, 
            statusText: response.statusText,
            errorDetails: errorText 
          }
        );
        throw new Error(`OpenAI API Error: ${response.status} - ${errorText}`);
      }

      const json = await response.json();
      this.logger.debug('OpenAI API response received', 'OpenAILLMClient', { 
        responseId: json.id,
        model: json.model 
      });
      
      const text = json?.choices?.[0]?.message?.content || '';
      this.logger.debug('Extracted text from response', 'OpenAILLMClient', { textLength: text.length });
      
      let result: { urgencyScore: number } = { urgencyScore: 0.5 };
      try {
        result = JSON.parse(text);
        if (typeof result.urgencyScore !== 'number') {
          throw new Error('Missing urgencyScore');
        }
        this.logger.log('Urgency classification completed', 'OpenAILLMClient', { 
          urgencyScore: result.urgencyScore 
        });
      } catch (e) {
        const error = e as Error;
        this.logger.error(
          'Failed to parse OpenAI response', 
          'OpenAILLMClient',
          error.stack,
          { rawText: text }
        );
        throw new Error(`OpenAILLMClient: Invalid response: ${text}`);
      }
      return result;
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('OpenAI API Error')) {
        const err = error as Error;
        this.logger.error('Unexpected error in OpenAI client', 'OpenAILLMClient', err.stack);
      }
      throw error;
    }
  }
}
