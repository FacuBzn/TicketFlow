"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubLLMClient = void 0;
/**
 * Stub LLM Client for dev environments. Returns deterministic urgencyScore based on keywords heuristics.
 */
class StubLLMClient {
    async classifyUrgency(input) {
        const text = `${input.title} ${input.description}`.toLowerCase();
        if (/down|offline|crash|no (service|access)/.test(text))
            return { urgencyScore: 0.95 };
        if (/billing|pago|cobro|loss|charge/.test(text))
            return { urgencyScore: 0.8 };
        if (/security|breach|vulnerab|hack|phish/.test(text))
            return { urgencyScore: 0.9 };
        if (/urgent|urgente|immediate/.test(text))
            return { urgencyScore: 0.77 };
        if (/question|consulta|info|help/.test(text))
            return { urgencyScore: 0.22 };
        // Default
        return { urgencyScore: 0.5 };
    }
}
exports.StubLLMClient = StubLLMClient;
//# sourceMappingURL=StubLLMClient.js.map