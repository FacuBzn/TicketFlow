import { GetTicketByIdUseCase } from '../../../../src/application/use-cases/GetTicketByIdUseCase';
import { TicketRepositoryPort } from '../../../../src/application/ports/TicketRepositoryPort';
import { Ticket } from '../../../../src/domain/entities/Ticket';
import { TicketNotFoundError } from '../../../../src/domain/errors/TicketNotFoundError';

describe('GetTicketByIdUseCase', () => {
  let useCase: GetTicketByIdUseCase;
  let mockRepository: jest.Mocked<TicketRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new GetTicketByIdUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return ticket when found', async () => {
      // Arrange
      const ticket = Ticket.create('Test Ticket', 'Test Description', 0.7);
      mockRepository.findById.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result).toBe(ticket);
      expect(mockRepository.findById).toHaveBeenCalledWith(ticket.id);
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw TicketNotFoundError when ticket not found', async () => {
      // Arrange
      const ticketId = 'non-existent-id';
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(ticketId)).rejects.toThrow(TicketNotFoundError);
      await expect(useCase.execute(ticketId)).rejects.toThrow(`Ticket with ID ${ticketId} not found`);
      expect(mockRepository.findById).toHaveBeenCalledWith(ticketId);
    });

    it('should return ticket with correct properties', async () => {
      // Arrange
      const ticket = Ticket.create('Urgent Issue', 'System down', 0.95);
      mockRepository.findById.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.id).toBe(ticket.id);
      expect(result.title).toBe('Urgent Issue');
      expect(result.description).toBe('System down');
      expect(result.urgencyScore).toBe(0.95);
      expect(result.priority).toBe('CRITICAL');
      expect(result.status).toBe('OPEN');
    });

    it('should propagate repository errors', async () => {
      // Arrange
      mockRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(useCase.execute('some-id')).rejects.toThrow('Database connection failed');
    });

    it('should work with different ticket IDs', async () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.5);
      const ticket2 = Ticket.create('T2', 'D2', 0.8);

      mockRepository.findById.mockImplementation(async (id: string) => {
        if (id === ticket1.id) return ticket1;
        if (id === ticket2.id) return ticket2;
        return null;
      });

      // Act
      const result1 = await useCase.execute(ticket1.id);
      const result2 = await useCase.execute(ticket2.id);

      // Assert
      expect(result1).toBe(ticket1);
      expect(result2).toBe(ticket2);
    });
  });
});

