"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlmProviderFactory = void 0;
const GeminiLLMClient_1 = require("../adapters/llm/GeminiLLMClient");
const OpenAILLMClient_1 = require("../adapters/llm/OpenAILLMClient");
const StubLLMClient_1 = require("../adapters/llm/StubLLMClient");
class LlmProviderFactory {
    static create(logger) {
        const provider = (process.env.LLM_PROVIDER || '').toLowerCase();
        logger.log('Initializing LLM provider', 'LlmProviderFactory', {
            provider,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
        });
        switch (provider) {
            case 'gemini':
                logger.log('LLM provider selected', 'LlmProviderFactory', { provider: 'gemini' });
                return new GeminiLLMClient_1.GeminiLLMClient(logger);
            case 'openai':
                logger.log('LLM provider selected', 'LlmProviderFactory', { provider: 'openai' });
                return new OpenAILLMClient_1.OpenAILLMClient(logger);
            default:
                logger.log('LLM provider selected', 'LlmProviderFactory', { provider: 'stub' });
                return new StubLLMClient_1.StubLLMClient();
        }
    }
}
exports.LlmProviderFactory = LlmProviderFactory;
//# sourceMappingURL=LlmProviderFactory.js.map