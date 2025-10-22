import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { LLMClientPort } from '../ports/LLMClientPort';
import { Ticket } from '../../domain/entities/Ticket';
import { UrgencyPriorityMapper } from '../../domain/services/UrgencyPriorityMapper';

interface CreateTicketInput {
  title: string;
  description: string;
}

export class CreateTicketUseCase {
  constructor(
    private readonly ticketRepository: TicketRepositoryPort,
    private readonly llmClient: LLMClientPort,
  ) {}

  async execute(input: CreateTicketInput): Promise<Ticket> {
    // LLM Classify
    const { urgencyScore } = await this.llmClient.classifyUrgency({
      title: input.title,
      description: input.description,
    });
    // Map to domain priority
    const priority = UrgencyPriorityMapper.map(urgencyScore);
    // Create ticket entity
    const ticket = new Ticket(input.title, input.description, 'OPEN', priority, urgencyScore);
    // Persist
    await this.ticketRepository.save(ticket);
    return ticket;
  }
}
