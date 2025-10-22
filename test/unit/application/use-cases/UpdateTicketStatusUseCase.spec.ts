import { UpdateTicketStatusUseCase } from '../../../../src/application/use-cases/UpdateTicketStatusUseCase';
import { TicketRepositoryPort } from '../../../../src/application/ports/TicketRepositoryPort';
import { Ticket } from '../../../../src/domain/entities/Ticket';
import { TicketNotFoundError } from '../../../../src/domain/errors/TicketNotFoundError';
import { InvalidStateTransitionError } from '../../../../src/domain/errors/InvalidStateTransitionError';

describe('UpdateTicketStatusUseCase', () => {
  let useCase: UpdateTicketStatusUseCase;
  let mockRepository: jest.Mocked<TicketRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new UpdateTicketStatusUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update ticket status successfully', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id, 'IN_PROGRESS');

      // Assert
      expect(result.status).toBe('IN_PROGRESS');
      expect(mockRepository.findById).toHaveBeenCalledWith(ticket.id);
      expect(mockRepository.save).toHaveBeenCalledWith(ticket);
    });

    it('should throw TicketNotFoundError when ticket not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute('non-existent', 'IN_PROGRESS')
      ).rejects.toThrow(TicketNotFoundError);
    });

    it('should throw InvalidStateTransitionError for invalid transition', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      ticket.updateStatus('CLOSED');
      mockRepository.findById.mockResolvedValue(ticket);

      // Act & Assert
      await expect(
        useCase.execute(ticket.id, 'RESOLVED')
      ).rejects.toThrow(InvalidStateTransitionError);
      
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should allow valid state transitions OPEN → IN_PROGRESS', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id, 'IN_PROGRESS');

      // Assert
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should allow valid state transitions OPEN → RESOLVED', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id, 'RESOLVED');

      // Assert
      expect(result.status).toBe('RESOLVED');
    });

    it('should allow valid state transitions IN_PROGRESS → RESOLVED', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      ticket.updateStatus('IN_PROGRESS');
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id, 'RESOLVED');

      // Assert
      expect(result.status).toBe('RESOLVED');
    });

    it('should allow reopening closed tickets', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      ticket.close();
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id, 'OPEN');

      // Assert
      expect(result.status).toBe('OPEN');
    });

    it('should update updatedAt timestamp', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      const originalUpdatedAt = ticket.updatedAt.getTime();
      
      // Wait to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id, 'IN_PROGRESS');

      // Assert
      expect(result.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });

    it('should propagate repository errors on findById', async () => {
      // Arrange
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        useCase.execute('some-id', 'IN_PROGRESS')
      ).rejects.toThrow('Database error');
    });

    it('should propagate repository errors on save', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockRejectedValue(new Error('Save failed'));

      // Act & Assert
      await expect(
        useCase.execute(ticket.id, 'IN_PROGRESS')
      ).rejects.toThrow('Save failed');
    });
  });
});

