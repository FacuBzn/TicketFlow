import { LLMClientPort } from '../../application/ports/LLMClientPort';
import { GeminiLLMClient } from '../adapters/llm/GeminiLLMClient';
import { OpenAILLMClient } from '../adapters/llm/OpenAILLMClient';
import { StubLLMClient } from '../adapters/llm/StubLLMClient';
import { AppLogger } from '../logger/AppLogger';

export class LlmProviderFactory {
  static create(logger: AppLogger): LLMClientPort {
    const provider = (process.env.LLM_PROVIDER || '').toLowerCase();
    
    logger.log('Initializing LLM provider', 'LlmProviderFactory', {
      provider,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
    });
    
    switch (provider) {
      case 'gemini':
        logger.log('LLM provider selected', 'LlmProviderFactory', { provider: 'gemini' });
        return new GeminiLLMClient(logger);
      case 'openai':
        logger.log('LLM provider selected', 'LlmProviderFactory', { provider: 'openai' });
        return new OpenAILLMClient(logger);
      default:
        logger.log('LLM provider selected', 'LlmProviderFactory', { provider: 'stub' });
        return new StubLLMClient();
    }
  }
}
