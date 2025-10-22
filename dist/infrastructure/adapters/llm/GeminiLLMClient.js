"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiLLMClient = void 0;
const commonPrompt_1 = require("./commonPrompt");
const RetryHandler_1 = require("../../utils/RetryHandler");
class GeminiLLMClient {
    logger;
    apiKey;
    retryOptions = {
        maxRetries: 3,
        initialDelayMs: 1000,
        timeoutMs: 15000, // 15 seconds timeout
    };
    constructor(logger) {
        this.logger = logger;
        this.apiKey = process.env.GEMINI_API_KEY;
    }
    async classifyUrgency(input) {
        this.logger.log('Processing ticket classification', 'GeminiLLMClient', { provider: 'gemini' });
        return RetryHandler_1.RetryHandler.withRetry(() => this.performClassification(input), this.retryOptions);
    }
    async performClassification(input) {
        const prompt = commonPrompt_1.BASE_URGENCY_PROMPT
            .replace('{{title}}', input.title)
            .replace('{{description}}', input.description);
        // Try free models for text analysis
        const models = ['gemini-2.0-flash-lite'];
        let lastError = null;
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
                    const result = parsed;
                    if (typeof result.urgencyScore !== 'number') {
                        throw new Error('Missing urgencyScore in response');
                    }
                    this.logger.log('Urgency classification completed', 'GeminiLLMClient', {
                        model,
                        urgencyScore: result.urgencyScore
                    });
                    return result;
                }
                catch (e) {
                    const error = e;
                    this.logger.error('Failed to parse Gemini response', 'GeminiLLMClient', error.stack, { model, rawText: text });
                    lastError = new Error(`Invalid JSON response: ${text}`);
                    continue;
                }
            }
            catch (error) {
                const err = error;
                this.logger.error('Model error', 'GeminiLLMClient', err.stack, { model });
                lastError = err;
                continue;
            }
        }
        // All models failed
        this.logger.error('All Gemini models failed', 'GeminiLLMClient', lastError?.stack, { attemptedModels: models });
        throw lastError || new Error('All Gemini models failed');
    }
}
exports.GeminiLLMClient = GeminiLLMClient;
//# sourceMappingURL=GeminiLLMClient.js.map