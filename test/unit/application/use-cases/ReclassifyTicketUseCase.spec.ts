import { ReclassifyTicketUseCase } from '../../../../src/application/use-cases/ReclassifyTicketUseCase';
import { TicketRepositoryPort } from '../../../../src/application/ports/TicketRepositoryPort';
import { LLMClientPort } from '../../../../src/application/ports/LLMClientPort';
import { Ticket } from '../../../../src/domain/entities/Ticket';
import { TicketNotFoundError } from '../../../../src/domain/errors/TicketNotFoundError';

describe('ReclassifyTicketUseCase', () => {
  let useCase: ReclassifyTicketUseCase;
  let mockRepository: jest.Mocked<TicketRepositoryPort>;
  let mockLLMClient: jest.Mocked<LLMClientPort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockLLMClient = {
      classifyUrgency: jest.fn(),
    };

    useCase = new ReclassifyTicketUseCase(mockRepository, mockLLMClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should reclassify ticket with new urgency score', async () => {
      // Arrange
      const ticket = Ticket.create('Old Title', 'Old Description', 0.3);
      expect(ticket.priority).toBe('MEDIUM');

      mockRepository.findById.mockResolvedValue(ticket);
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.9 });
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.urgencyScore).toBe(0.9);
      expect(result.priority).toBe('CRITICAL');
      expect(mockLLMClient.classifyUrgency).toHaveBeenCalledWith({
        title: 'Old Title',
        description: 'Old Description'
      });
      expect(mockRepository.save).toHaveBeenCalledWith(ticket);
    });

    it('should throw TicketNotFoundError when ticket not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        useCase.execute('non-existent-id')
      ).rejects.toThrow(TicketNotFoundError);
      
      expect(mockLLMClient.classifyUrgency).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should reclassify from CRITICAL to LOW', async () => {
      // Arrange
      const ticket = Ticket.create('Urgent', 'Critical issue', 0.9);
      expect(ticket.priority).toBe('CRITICAL');

      mockRepository.findById.mockResolvedValue(ticket);
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.1 });
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.urgencyScore).toBe(0.1);
      expect(result.priority).toBe('LOW');
    });

    it('should reclassify from LOW to HIGH', async () => {
      // Arrange
      const ticket = Ticket.create('Question', 'Simple query', 0.2);
      expect(ticket.priority).toBe('LOW');

      mockRepository.findById.mockResolvedValue(ticket);
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.7 });
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.urgencyScore).toBe(0.7);
      expect(result.priority).toBe('HIGH');
    });

    it('should update updatedAt timestamp', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      const originalUpdatedAt = ticket.updatedAt.getTime();

      await new Promise(resolve => setTimeout(resolve, 10));

      mockRepository.findById.mockResolvedValue(ticket);
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.8 });
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt);
    });

    it('should preserve other ticket properties', async () => {
      // Arrange
      const ticket = Ticket.create('Test Title', 'Test Description', 0.5);
      const originalId = ticket.id;
      const originalStatus = ticket.status;
      const originalCreatedAt = ticket.createdAt;

      mockRepository.findById.mockResolvedValue(ticket);
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.8 });
      mockRepository.save.mockResolvedValue(ticket);

      // Act
      const result = await useCase.execute(ticket.id);

      // Assert
      expect(result.id).toBe(originalId);
      expect(result.title).toBe('Test Title');
      expect(result.description).toBe('Test Description');
      expect(result.status).toBe(originalStatus);
      expect(result.createdAt).toBe(originalCreatedAt);
    });

    it('should propagate LLM client errors', async () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);
      mockRepository.findById.mockResolvedValue(ticket);
      mockLLMClient.classifyUrgency.mockRejectedValue(new Error('LLM API failed'));

      // Act & Assert
      await expect(
        useCase.execute(ticket.id)
      ).rejects.toThrow('LLM API failed');
      
      expect(mockRepository.save).not.toHaveBeenCalled();
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
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.8 });
      mockRepository.save.mockRejectedValue(new Error('Save failed'));

      // Act & Assert
      await expect(
        useCase.execute(ticket.id)
      ).rejects.toThrow('Save failed');
    });
  });
});

