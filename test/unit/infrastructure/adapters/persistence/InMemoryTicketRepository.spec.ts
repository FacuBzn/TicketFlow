import { InMemoryTicketRepository } from '../../../../../src/infrastructure/adapters/persistence/InMemoryTicketRepository';
import { Ticket } from '../../../../../src/domain/entities/Ticket';

describe('InMemoryTicketRepository', () => {
  let repository: InMemoryTicketRepository;

  beforeEach(() => {
    repository = new InMemoryTicketRepository();
  });

  describe('save', () => {
    it('should save a new ticket', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);

      // Act
      const result = await repository.save(ticket);

      // Assert
      expect(result).toBe(ticket);
    });

    it('should update an existing ticket', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      await repository.save(ticket);

      // Modify ticket
      ticket.updateStatus('IN_PROGRESS');

      // Act
      const result = await repository.save(ticket);

      // Assert
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should save multiple tickets', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      const ticket2 = Ticket.create('T2', 'D2', 0.7);
      const ticket3 = Ticket.create('T3', 'D3', 0.3);

      // Act
      await repository.save(ticket1);
      await repository.save(ticket2);
      await repository.save(ticket3);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(3);
    });
  });

  describe('findById', () => {
    it('should find ticket by ID', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      await repository.save(ticket);

      // Act
      const result = await repository.findById(ticket.id);

      // Assert
      expect(result).toBe(ticket);
      expect(result?.id).toBe(ticket.id);
    });

    it('should return null for non-existent ID', async () => {
      // Act
      const result = await repository.findById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });

    it('should return correct ticket among multiple tickets', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      const ticket2 = Ticket.create('T2', 'D2', 0.7);
      const ticket3 = Ticket.create('T3', 'D3', 0.3);

      await repository.save(ticket1);
      await repository.save(ticket2);
      await repository.save(ticket3);

      // Act
      const result = await repository.findById(ticket2.id);

      // Assert
      expect(result).toBe(ticket2);
      expect(result?.title).toBe('T2');
    });
  });

  describe('findAll', () => {
    it('should return empty array when no tickets', async () => {
      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return all saved tickets', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      const ticket2 = Ticket.create('T2', 'D2', 0.7);
      const ticket3 = Ticket.create('T3', 'D3', 0.3);

      await repository.save(ticket1);
      await repository.save(ticket2);
      await repository.save(ticket3);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toContain(ticket1);
      expect(result).toContain(ticket2);
      expect(result).toContain(ticket3);
    });

    it('should return updated ticket state', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      await repository.save(ticket);

      ticket.updateStatus('CLOSED');
      await repository.save(ticket);

      // Act
      const result = await repository.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('CLOSED');
    });
  });

  describe('update', () => {
    it('should update existing ticket', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      await repository.save(ticket);

      ticket.updateStatus('IN_PROGRESS');

      // Act
      const result = await repository.update(ticket.id, ticket);

      // Assert
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should throw error when updating non-existent ticket', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);

      // Act & Assert
      await expect(
        repository.update('non-existent-id', ticket)
      ).rejects.toThrow('Ticket with ID non-existent-id not found');
    });

    it('should persist updates', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      await repository.save(ticket);

      ticket.reclassify(0.9);

      // Act
      await repository.update(ticket.id, ticket);

      // Assert
      const found = await repository.findById(ticket.id);
      expect(found?.urgencyScore).toBe(0.9);
      expect(found?.priority).toBe('CRITICAL');
    });
  });

  describe('delete', () => {
    it('should delete existing ticket', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      await repository.save(ticket);

      // Act
      await repository.delete(ticket.id);

      // Assert
      const found = await repository.findById(ticket.id);
      expect(found).toBeNull();
    });

    it('should not throw error when deleting non-existent ticket', async () => {
      // Act & Assert
      await expect(
        repository.delete('non-existent-id')
      ).resolves.not.toThrow();
    });

    it('should remove ticket from findAll results', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      const ticket2 = Ticket.create('T2', 'D2', 0.7);

      await repository.save(ticket1);
      await repository.save(ticket2);

      // Act
      await repository.delete(ticket1.id);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(1);
      expect(all[0]).toBe(ticket2);
    });

    it('should delete only specified ticket', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      const ticket2 = Ticket.create('T2', 'D2', 0.7);
      const ticket3 = Ticket.create('T3', 'D3', 0.3);

      await repository.save(ticket1);
      await repository.save(ticket2);
      await repository.save(ticket3);

      // Act
      await repository.delete(ticket2.id);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(2);
      expect(all).toContain(ticket1);
      expect(all).toContain(ticket3);
      expect(all).not.toContain(ticket2);
    });
  });

  describe('data persistence', () => {
    it('should maintain data across multiple operations', async () => {
      // Create
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      await repository.save(ticket1);

      // Update
      ticket1.updateStatus('IN_PROGRESS');
      await repository.save(ticket1);

      // Create another
      const ticket2 = Ticket.create('T2', 'D2', 0.8);
      await repository.save(ticket2);

      // Delete first
      await repository.delete(ticket1.id);

      // Assert
      const all = await repository.findAll();
      expect(all).toHaveLength(1);
      expect(all[0]).toBe(ticket2);
    });

    it('should be isolated between repository instances', async () => {
      // Arrange
      const repo1 = new InMemoryTicketRepository();
      const repo2 = new InMemoryTicketRepository();

      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      const ticket2 = Ticket.create('T2', 'D2', 0.7);

      // Act
      await repo1.save(ticket1);
      await repo2.save(ticket2);

      // Assert
      const repo1Tickets = await repo1.findAll();
      const repo2Tickets = await repo2.findAll();

      expect(repo1Tickets).toHaveLength(1);
      expect(repo2Tickets).toHaveLength(1);
      expect(repo1Tickets[0]).toBe(ticket1);
      expect(repo2Tickets[0]).toBe(ticket2);
    });
  });
});

