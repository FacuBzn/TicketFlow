import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { LLMClientPort } from '../ports/LLMClientPort';
import { Ticket } from '../../domain/entities/Ticket';

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
    
    // Create ticket entity using factory method (encapsulates priority mapping)
    const ticket = Ticket.create(input.title, input.description, urgencyScore);
    
    // Persist
    await this.ticketRepository.save(ticket);
    return ticket;
  }
}
