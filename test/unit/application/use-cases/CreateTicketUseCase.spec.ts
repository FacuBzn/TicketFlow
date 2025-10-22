import { CreateTicketUseCase } from '../../../../src/application/use-cases/CreateTicketUseCase';
import { TicketRepositoryPort } from '../../../../src/application/ports/TicketRepositoryPort';
import { LLMClientPort } from '../../../../src/application/ports/LLMClientPort';
import { Ticket } from '../../../../src/domain/entities/Ticket';

describe('CreateTicketUseCase', () => {
  let useCase: CreateTicketUseCase;
  let mockRepository: jest.Mocked<TicketRepositoryPort>;
  let mockLLMClient: jest.Mocked<LLMClientPort>;

  beforeEach(() => {
    // Create mocks
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

    useCase = new CreateTicketUseCase(mockRepository, mockLLMClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create ticket with CRITICAL priority for high urgency score', async () => {
      // Arrange
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.9 });
      mockRepository.save.mockImplementation(async (ticket) => ticket);

      // Act
      const result = await useCase.execute({
        title: 'Production down',
        description: 'System is offline'
      });

      // Assert
      expect(mockLLMClient.classifyUrgency).toHaveBeenCalledWith({
        title: 'Production down',
        description: 'System is offline'
      });
      expect(mockLLMClient.classifyUrgency).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Ticket);
      expect(result.title).toBe('Production down');
      expect(result.description).toBe('System is offline');
      expect(result.urgencyScore).toBe(0.9);
      expect(result.priority).toBe('CRITICAL');
      expect(result.status).toBe('OPEN');
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Ticket));
    });

    it('should create ticket with LOW priority for low urgency score', async () => {
      // Arrange
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.2 });
      mockRepository.save.mockImplementation(async (ticket) => ticket);

      // Act
      const result = await useCase.execute({
        title: 'Question about feature',
        description: 'How do I export data?'
      });

      // Assert
      expect(result.urgencyScore).toBe(0.2);
      expect(result.priority).toBe('LOW');
      expect(result.title).toBe('Question about feature');
      expect(result.description).toBe('How do I export data?');
    });

    it('should create ticket with MEDIUM priority for medium urgency score', async () => {
      // Arrange
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.4 });
      mockRepository.save.mockImplementation(async (ticket) => ticket);

      // Act
      const result = await useCase.execute({
        title: 'Slow loading',
        description: 'Dashboard is slow'
      });

      // Assert
      expect(result.urgencyScore).toBe(0.4);
      expect(result.priority).toBe('MEDIUM');
    });

    it('should create ticket with HIGH priority for high-medium urgency score', async () => {
      // Arrange
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.65 });
      mockRepository.save.mockImplementation(async (ticket) => ticket);

      // Act
      const result = await useCase.execute({
        title: 'Payment issue',
        description: 'Customers cannot checkout'
      });

      // Assert
      expect(result.urgencyScore).toBe(0.65);
      expect(result.priority).toBe('HIGH');
    });

    it('should propagate LLM client errors', async () => {
      // Arrange
      const llmError = new Error('LLM API unavailable');
      mockLLMClient.classifyUrgency.mockRejectedValue(llmError);

      // Act & Assert
      await expect(
        useCase.execute({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow('LLM API unavailable');

      expect(mockLLMClient.classifyUrgency).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should propagate repository errors', async () => {
      // Arrange
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.5 });
      const repositoryError = new Error('Database connection failed');
      mockRepository.save.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        useCase.execute({
          title: 'Test',
          description: 'Test description'
        })
      ).rejects.toThrow('Database connection failed');

      expect(mockLLMClient.classifyUrgency).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should handle edge case with urgency score 0', async () => {
      // Arrange
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0 });
      mockRepository.save.mockImplementation(async (ticket) => ticket);

      // Act
      const result = await useCase.execute({
        title: 'Info request',
        description: 'Just curious about features'
      });

      // Assert
      expect(result.urgencyScore).toBe(0);
      expect(result.priority).toBe('LOW');
    });

    it('should handle edge case with urgency score 1', async () => {
      // Arrange
      mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 1 });
      mockRepository.save.mockImplementation(async (ticket) => ticket);

      // Act
      const result = await useCase.execute({
        title: 'Critical system failure',
        description: 'All services down, data loss imminent'
      });

      // Assert
      expect(result.urgencyScore).toBe(1);
      expect(result.priority).toBe('CRITICAL');
    });
  });
});

