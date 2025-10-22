import { Ticket } from '../../../../src/domain/entities/Ticket';

describe('Ticket Entity', () => {
  describe('create', () => {
    it('should create ticket with CRITICAL priority for high urgency (>0.75)', () => {
      const ticket = Ticket.create('Title', 'Description', 0.9);

      expect(ticket).toBeDefined();
      expect(ticket.id).toBeDefined();
      expect(ticket.title).toBe('Title');
      expect(ticket.description).toBe('Description');
      expect(ticket.status).toBe('OPEN');
      expect(ticket.priority).toBe('CRITICAL');
      expect(ticket.urgencyScore).toBe(0.9);
      expect(ticket.createdAt).toBeInstanceOf(Date);
      expect(ticket.updatedAt).toBeInstanceOf(Date);
    });

    it('should create ticket with HIGH priority for urgency 0.51-0.75', () => {
      const ticket = Ticket.create('Title', 'Description', 0.6);
      expect(ticket.priority).toBe('HIGH');
      expect(ticket.urgencyScore).toBe(0.6);
    });

    it('should create ticket with MEDIUM priority for urgency 0.26-0.50', () => {
      const ticket = Ticket.create('Title', 'Description', 0.4);
      expect(ticket.priority).toBe('MEDIUM');
      expect(ticket.urgencyScore).toBe(0.4);
    });

    it('should create ticket with LOW priority for urgency 0.00-0.25', () => {
      const ticket = Ticket.create('Title', 'Description', 0.2);
      expect(ticket.priority).toBe('LOW');
      expect(ticket.urgencyScore).toBe(0.2);
    });

    it('should create ticket with LOW priority for urgency score 0', () => {
      const ticket = Ticket.create('Title', 'Description', 0);
      expect(ticket.priority).toBe('LOW');
      expect(ticket.urgencyScore).toBe(0);
    });

    it('should create ticket with CRITICAL priority for urgency score 1', () => {
      const ticket = Ticket.create('Title', 'Description', 1);
      expect(ticket.priority).toBe('CRITICAL');
      expect(ticket.urgencyScore).toBe(1);
    });

    it('should create ticket with boundary score 0.25 as LOW', () => {
      const ticket = Ticket.create('Title', 'Description', 0.25);
      expect(ticket.priority).toBe('LOW');
    });

    it('should create ticket with boundary score 0.26 as MEDIUM', () => {
      const ticket = Ticket.create('Title', 'Description', 0.26);
      expect(ticket.priority).toBe('MEDIUM');
    });

    it('should create ticket with boundary score 0.75 as HIGH', () => {
      const ticket = Ticket.create('Title', 'Description', 0.75);
      expect(ticket.priority).toBe('HIGH');
    });

    it('should create ticket with boundary score 0.76 as CRITICAL', () => {
      const ticket = Ticket.create('Title', 'Description', 0.76);
      expect(ticket.priority).toBe('CRITICAL');
    });
  });

  describe('reclassify', () => {
    it('should update urgency score and recalculate priority', (done) => {
      const ticket = Ticket.create('Title', 'Description', 0.3);
      expect(ticket.priority).toBe('MEDIUM');
      expect(ticket.urgencyScore).toBe(0.3);

      const originalUpdatedAt = ticket.updatedAt.getTime();

      // Wait 10ms para asegurar que updatedAt cambie
      setTimeout(() => {
        ticket.reclassify(0.9);

        expect(ticket.urgencyScore).toBe(0.9);
        expect(ticket.priority).toBe('CRITICAL');
        expect(ticket.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
        done();
      }, 10);
    });

    it('should throw error for invalid urgency score > 1', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(() => ticket.reclassify(1.5)).toThrow('Urgency score must be between 0 and 1');
    });

    it('should throw error for invalid urgency score < 0', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(() => ticket.reclassify(-0.1)).toThrow('Urgency score must be between 0 and 1');
    });

    it('should reclassify from LOW to CRITICAL', () => {
      const ticket = Ticket.create('Title', 'Description', 0.1);
      expect(ticket.priority).toBe('LOW');

      ticket.reclassify(0.95);

      expect(ticket.priority).toBe('CRITICAL');
      expect(ticket.urgencyScore).toBe(0.95);
    });

    it('should reclassify from CRITICAL to LOW', () => {
      const ticket = Ticket.create('Title', 'Description', 0.9);
      expect(ticket.priority).toBe('CRITICAL');

      ticket.reclassify(0.1);

      expect(ticket.priority).toBe('LOW');
      expect(ticket.urgencyScore).toBe(0.1);
    });
  });

  describe('updateStatus', () => {
    it('should update ticket status', (done) => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      expect(ticket.status).toBe('OPEN');

      setTimeout(() => {
        ticket.updateStatus('IN_PROGRESS');

        expect(ticket.status).toBe('IN_PROGRESS');
        done();
      }, 10);
    });

    it('should update updatedAt when status changes', (done) => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      const originalUpdatedAt = ticket.updatedAt.getTime();

      setTimeout(() => {
        ticket.updateStatus('IN_PROGRESS');

        expect(ticket.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
        done();
      }, 10);
    });

    it('should update to all valid statuses', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      ticket.updateStatus('IN_PROGRESS');
      expect(ticket.status).toBe('IN_PROGRESS');

      ticket.updateStatus('RESOLVED');
      expect(ticket.status).toBe('RESOLVED');

      ticket.updateStatus('CLOSED');
      expect(ticket.status).toBe('CLOSED');

      ticket.updateStatus('OPEN');
      expect(ticket.status).toBe('OPEN');
    });
  });

  describe('close', () => {
    it('should set status to CLOSED', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      ticket.close();

      expect(ticket.status).toBe('CLOSED');
    });

    it('should update updatedAt when closing', (done) => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      const originalUpdatedAt = ticket.updatedAt.getTime();

      setTimeout(() => {
        ticket.close();

        expect(ticket.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
        done();
      }, 10);
    });

    it('should close ticket from any status', () => {
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      ticket1.close();
      expect(ticket1.status).toBe('CLOSED');

      const ticket2 = Ticket.create('T2', 'D2', 0.5);
      ticket2.updateStatus('IN_PROGRESS');
      ticket2.close();
      expect(ticket2.status).toBe('CLOSED');

      const ticket3 = Ticket.create('T3', 'D3', 0.5);
      ticket3.updateStatus('RESOLVED');
      ticket3.close();
      expect(ticket3.status).toBe('CLOSED');
    });
  });

  describe('isClosed', () => {
    it('should return true for CLOSED tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      ticket.close();

      expect(ticket.isClosed()).toBe(true);
    });

    it('should return false for non-CLOSED tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(ticket.isClosed()).toBe(false);

      ticket.updateStatus('IN_PROGRESS');
      expect(ticket.isClosed()).toBe(false);

      ticket.updateStatus('RESOLVED');
      expect(ticket.isClosed()).toBe(false);
    });
  });

  describe('isOpen', () => {
    it('should return true for OPEN tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(ticket.isOpen()).toBe(true);
    });

    it('should return false for non-OPEN tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      ticket.updateStatus('IN_PROGRESS');

      expect(ticket.isOpen()).toBe(false);

      ticket.updateStatus('RESOLVED');
      expect(ticket.isOpen()).toBe(false);

      ticket.close();
      expect(ticket.isOpen()).toBe(false);
    });
  });

  describe('isCritical', () => {
    it('should return true for CRITICAL priority tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.9);

      expect(ticket.isCritical()).toBe(true);
    });

    it('should return false for non-CRITICAL priority tickets', () => {
      const lowTicket = Ticket.create('T1', 'D1', 0.1);
      expect(lowTicket.isCritical()).toBe(false);

      const mediumTicket = Ticket.create('T2', 'D2', 0.4);
      expect(mediumTicket.isCritical()).toBe(false);

      const highTicket = Ticket.create('T3', 'D3', 0.6);
      expect(highTicket.isCritical()).toBe(false);
    });
  });

  describe('getters', () => {
    it('should provide read-only access to private properties', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(ticket.status).toBe('OPEN');
      expect(ticket.priority).toBe('MEDIUM');
      expect(ticket.urgencyScore).toBe(0.5);
      expect(ticket.updatedAt).toBeInstanceOf(Date);

      // Properties have getters only, attempting to set them will throw in strict mode
      expect(() => {
        (ticket as any).status = 'CLOSED';
      }).toThrow(); // TypeScript read-only properties throw when assigned
    });
  });
});

