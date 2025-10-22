import { StubLLMClient } from '../../../../../src/infrastructure/adapters/llm/StubLLMClient';

describe('StubLLMClient', () => {
  let client: StubLLMClient;

  beforeEach(() => {
    client = new StubLLMClient();
  });

  describe('classifyUrgency', () => {
    it('should return high urgency for "down" keyword', async () => {
      const result = await client.classifyUrgency({
        title: 'System down',
        description: 'All services are down'
      });

      expect(result.urgencyScore).toBe(0.95);
    });

    it('should return high urgency for "offline" keyword', async () => {
      const result = await client.classifyUrgency({
        title: 'Service offline',
        description: 'Cannot access the system'
      });

      expect(result.urgencyScore).toBe(0.95);
    });

    it('should return high urgency for "crash" keyword', async () => {
      const result = await client.classifyUrgency({
        title: 'Application crash',
        description: 'App keeps crashing'
      });

      expect(result.urgencyScore).toBe(0.95);
    });

    it('should return high urgency for security issues', async () => {
      const result = await client.classifyUrgency({
        title: 'Security breach',
        description: 'Possible hack detected'
      });

      expect(result.urgencyScore).toBe(0.9);
    });

    it('should return high urgency for billing issues', async () => {
      const result = await client.classifyUrgency({
        title: 'Billing problem',
        description: 'Wrong charge on account'
      });

      expect(result.urgencyScore).toBe(0.8);
    });

    it('should return high urgency for "urgent" keyword', async () => {
      const result = await client.classifyUrgency({
        title: 'Urgent issue',
        description: 'Need immediate help'
      });

      expect(result.urgencyScore).toBe(0.77);
    });

    it('should return low urgency for questions', async () => {
      const result = await client.classifyUrgency({
        title: 'Question about feature',
        description: 'How do I use this feature?'
      });

      expect(result.urgencyScore).toBe(0.22);
    });

    it('should return medium urgency for generic issues', async () => {
      const result = await client.classifyUrgency({
        title: 'Some issue',
        description: 'Having a problem'
      });

      expect(result.urgencyScore).toBe(0.5);
    });

    it('should be case insensitive', async () => {
      const result1 = await client.classifyUrgency({
        title: 'SYSTEM DOWN',
        description: 'OFFLINE'
      });

      const result2 = await client.classifyUrgency({
        title: 'system down',
        description: 'offline'
      });

      expect(result1.urgencyScore).toBe(result2.urgencyScore);
      expect(result1.urgencyScore).toBe(0.95);
    });

    it('should check both title and description', async () => {
      const result1 = await client.classifyUrgency({
        title: 'Issue',
        description: 'System is down'
      });

      const result2 = await client.classifyUrgency({
        title: 'System is down',
        description: 'Need help'
      });

      expect(result1.urgencyScore).toBe(0.95);
      expect(result2.urgencyScore).toBe(0.95);
    });

    it('should handle multiple matching keywords (first match wins)', async () => {
      const result = await client.classifyUrgency({
        title: 'System down with security breach',
        description: 'urgent'
      });

      // "down" matches first with 0.95
      expect(result.urgencyScore).toBe(0.95);
    });

    it('should handle empty strings', async () => {
      const result = await client.classifyUrgency({
        title: '',
        description: ''
      });

      expect(result.urgencyScore).toBe(0.5); // Default
    });

    it('should handle special characters', async () => {
      const result = await client.classifyUrgency({
        title: 'System @#$ down!',
        description: 'Urgent!!!'
      });

      expect(result.urgencyScore).toBeGreaterThan(0.7);
    });
  });
});

