export interface LLMClientPort {
  classifyUrgency(input: { title: string; description: string }): Promise<{ urgencyScore: number }>;
}

