import { DeleteTicketUseCase } from '../../../../src/application/use-cases/DeleteTicketUseCase';
import { TicketRepositoryPort } from '../../../../src/application/ports/TicketRepositoryPort';
import { Ticket } from '../../../../src/domain/entities/Ticket';
import { TicketNotFoundError } from '../../../../src/domain/errors/TicketNotFoundError';

describe('DeleteTicketUseCase', () => {
  let useCase: DeleteTicketUseCase;
  let mockRepository: jest.Mocked<TicketRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new DeleteTicketUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should delete ticket successfully', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result).toEqual({
        deleted: true,
        id: ticket.id
      });
      expect(mockRepository.findById).toHaveBeenCalledWith(ticket.id);
      expect(mockRepository.delete).toHaveBeenCalledWith(ticket.id);
    });

    it('should throw TicketNotFoundError when ticket not found', async () => {
      // Arrange
      const ticketId = 'non-existent-id';
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute(ticketId)
      ).rejects.toThrow(TicketNotFoundError);
      
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete ticket with any status', async () => {
      // Test OPEN
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      mockRepository.findById.mockResolvedValue(ticket1);
      mockRepository.delete.mockResolvedValue(undefined);

      const result1 = await useCase.execute(ticket1.id);
      expect(result1.deleted).toBe(true);

      // Test IN_PROGRESS
      const ticket2 = Ticket.create('T2', 'D2', 0.5);
      ticket2.updateStatus('IN_PROGRESS');
      mockRepository.findById.mockResolvedValue(ticket2);

      const result2 = await useCase.execute(ticket2.id);
      expect(result2.deleted).toBe(true);

      // Test CLOSED
      const ticket3 = Ticket.create('T3', 'D3', 0.5);
      ticket3.close();
      mockRepository.findById.mockResolvedValue(ticket3);

      const result3 = await useCase.execute(ticket3.id);
      expect(result3.deleted).toBe(true);
    });

    it('should delete ticket with any priority', async () => {
      // LOW
      const lowTicket = Ticket.create('Low', 'Description', 0.1);
      mockRepository.findById.mockResolvedValue(lowTicket);
      mockRepository.delete.mockResolvedValue(undefined);

      const result1 = await useCase.execute(lowTicket.id);
      expect(result1.deleted).toBe(true);

      // CRITICAL
      const criticalTicket = Ticket.create('Critical', 'Description', 0.95);
      mockRepository.findById.mockResolvedValue(criticalTicket);

      const result2 = await useCase.execute(criticalTicket.id);
      expect(result2.deleted).toBe(true);
    });

    it('should return correct response structure', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result).toHaveProperty('deleted');
      expect(result).toHaveProperty('id');
      expect(typeof result.deleted).toBe('boolean');
      expect(typeof result.id).toBe('string');
      expect(result.deleted).toBe(true);
      expect(result.id).toBe(ticket.id);
    });

    it('should propagate repository errors on findById', async () => {
      // Arrange
      mockRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(
        useCase.execute('some-id')
      ).rejects.toThrow('Database connection failed');
      
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate repository errors on delete', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.delete.mockRejectedValue(new Error('Delete operation failed'));

      // Act & Assert
      await expect(
        useCase.execute(ticket.id)
      ).rejects.toThrow('Delete operation failed');
    });

    it('should call repository delete with correct ticket ID', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      const ticketId = ticket.id;
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.delete.mockResolvedValue(undefined);

      // Act
      await useCase.execute(ticketId);

      // Assert
      expect(mockRepository.delete).toHaveBeenCalledWith(ticketId);
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});

