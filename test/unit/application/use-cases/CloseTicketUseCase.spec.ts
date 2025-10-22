import { CloseTicketUseCase } from '../../../../src/application/use-cases/CloseTicketUseCase';
import { TicketRepositoryPort } from '../../../../src/application/ports/TicketRepositoryPort';
import { Ticket } from '../../../../src/domain/entities/Ticket';
import { TicketNotFoundError } from '../../../../src/domain/errors/TicketNotFoundError';
import { InvalidStateTransitionError } from '../../../../src/domain/errors/InvalidStateTransitionError';

describe('CloseTicketUseCase', () => {
  let useCase: CloseTicketUseCase;
  let mockRepository: jest.Mocked<TicketRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    useCase = new CloseTicketUseCase(mockRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should close an OPEN ticket', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.status).toBe('CLOSED');
      expect(mockRepository.findById).toHaveBeenCalledWith(ticket.id);
      expect(mockRepository.save).toHaveBeenCalledWith(ticket);
    });

    it('should close an IN_PROGRESS ticket', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      ticket.updateStatus('IN_PROGRESS');
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.status).toBe('CLOSED');
    });

    it('should close a RESOLVED ticket', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      ticket.updateStatus('RESOLVED');
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.status).toBe('CLOSED');
    });

    it('should throw TicketNotFoundError when ticket not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute('non-existent-id')
      ).rejects.toThrow(TicketNotFoundError);
      
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw InvalidStateTransitionError when trying to close already CLOSED ticket', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      ticket.close();
      mockRepository.findById.mockResolvedValue(ticket);

      // Act & Assert
      await expect(
        useCase.execute(ticket.id)
      ).rejects.toThrow(InvalidStateTransitionError);
      
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should update updatedAt timestamp', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      const originalUpdatedAt = ticket.updatedAt.getTime();

      await new Promise(resolve => setTimeout(resolve, 10));

      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });

    it('should preserve other ticket properties', async () => {
      // Arrange
      const ticket = Ticket.create('Test Title', 'Test Description', 0.8);
      const originalId = ticket.id;
      const originalPriority = ticket.priority;
      const originalUrgencyScore = ticket.urgencyScore;
      const originalCreatedAt = ticket.createdAt;

      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.id).toBe(originalId);
      expect(result.title).toBe('Test Title');
      expect(result.description).toBe('Test Description');
      expect(result.priority).toBe(originalPriority);
      expect(result.urgencyScore).toBe(originalUrgencyScore);
      expect(result.createdAt).toBe(originalCreatedAt);
    });

    it('should propagate repository errors on findById', async () => {
      // Arrange
      mockRepository.findById.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        useCase.execute('some-id')
      ).rejects.toThrow('Database error');
    });

    it('should propagate repository errors on save', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockRejectedValue(new Error('Save failed'));

      // Act & Assert
      await expect(
        useCase.execute(ticket.id)
      ).rejects.toThrow('Save failed');
    });

    it('should verify isClosed returns true after closing', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.isClosed()).toBe(true);
      expect(result.isOpen()).toBe(false);
    });
  });
});

