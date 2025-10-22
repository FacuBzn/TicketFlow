import { ListTicketsUseCase } from '../../../../src/application/use-cases/ListTicketsUseCase';
import { TicketRepositoryPort } from '../../../../src/application/ports/TicketRepositoryPort';
import { Ticket } from '../../../../src/domain/entities/Ticket';

describe('ListTicketsUseCase', () => {
  let useCase: ListTicketsUseCase;
  let mockRepository: jest.Mocked<TicketRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new ListTicketsUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return all tickets when no filters provided', async () => {
      // Arrange
      const tickets = [
        Ticket.create('T1', 'D1', 0.9),
        Ticket.create('T2', 'D2', 0.3),
        Ticket.create('T3', 'D3', 0.1),
      ];
      mockRepository.findAll.mockResolvedValue(tickets);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(3);
      expect(result).toEqual(tickets);
      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no tickets exist', async () => {
      // Arrange
      mockRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should filter tickets by status', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      const ticket2 = Ticket.create('T2', 'D2', 0.5);
      ticket2.updateStatus('IN_PROGRESS');
      const ticket3 = Ticket.create('T3', 'D3', 0.5);

      mockRepository.findAll.mockResolvedValue([ticket1, ticket2, ticket3]);

      // Act
      const result = await useCase.execute({ status: 'OPEN' });

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContain(ticket1);
      expect(result).toContain(ticket3);
      expect(result).not.toContain(ticket2);
    });

    it('should filter tickets by priority', async () => {
      // Arrange
      const criticalTicket = Ticket.create('T1', 'D1', 0.9); // CRITICAL
      const mediumTicket = Ticket.create('T2', 'D2', 0.4);   // MEDIUM
      const lowTicket = Ticket.create('T3', 'D3', 0.1);       // LOW

      mockRepository.findAll.mockResolvedValue([criticalTicket, mediumTicket, lowTicket]);

      // Act
      const result = await useCase.execute({ priority: 'CRITICAL' });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(criticalTicket);
    });

    it('should filter tickets by both status and priority', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.9); // OPEN, CRITICAL
      const ticket2 = Ticket.create('T2', 'D2', 0.9); // OPEN, CRITICAL -> IN_PROGRESS
      ticket2.updateStatus('IN_PROGRESS');
      const ticket3 = Ticket.create('T3', 'D3', 0.4); // OPEN, MEDIUM
      const ticket4 = Ticket.create('T4', 'D4', 0.9); // OPEN, CRITICAL

      mockRepository.findAll.mockResolvedValue([ticket1, ticket2, ticket3, ticket4]);

      // Act
      const result = await useCase.execute({ status: 'OPEN', priority: 'CRITICAL' });

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContain(ticket1);
      expect(result).toContain(ticket4);
      expect(result).not.toContain(ticket2); // Wrong status
      expect(result).not.toContain(ticket3); // Wrong priority
    });

    it('should return empty array when filters match no tickets', async () => {
      // Arrange
      const tickets = [
        Ticket.create('T1', 'D1', 0.1), // LOW
        Ticket.create('T2', 'D2', 0.4), // MEDIUM
      ];
      mockRepository.findAll.mockResolvedValue(tickets);

      // Act
      const result = await useCase.execute({ priority: 'CRITICAL' });

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should filter by IN_PROGRESS status', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      ticket1.updateStatus('IN_PROGRESS');
      const ticket2 = Ticket.create('T2', 'D2', 0.5);
      const ticket3 = Ticket.create('T3', 'D3', 0.5);
      ticket3.updateStatus('IN_PROGRESS');

      mockRepository.findAll.mockResolvedValue([ticket1, ticket2, ticket3]);

      // Act
      const result = await useCase.execute({ status: 'IN_PROGRESS' });

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toContain(ticket1);
      expect(result).toContain(ticket3);
    });

    it('should filter by CLOSED status', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      ticket1.close();
      const ticket2 = Ticket.create('T2', 'D2', 0.5);

      mockRepository.findAll.mockResolvedValue([ticket1, ticket2]);

      // Act
      const result = await useCase.execute({ status: 'CLOSED' });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBe(ticket1);
    });

    it('should propagate repository errors', async () => {
      // Arrange
      mockRepository.findAll.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow('Database error');
    });
  });
});

