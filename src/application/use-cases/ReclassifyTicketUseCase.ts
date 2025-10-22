import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { LLMClientPort } from '../ports/LLMClientPort';
import { Ticket } from '../../domain/entities/Ticket';
import { TicketNotFoundError } from '../../domain/errors/TicketNotFoundError';

export class ReclassifyTicketUseCase {
  constructor(
    private readonly ticketRepository: TicketRepositoryPort,
    private readonly llmClient: LLMClientPort,
  ) {}

  async execute(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new TicketNotFoundError(id);
    }

    // Re-classify using LLM
    const { urgencyScore } = await this.llmClient.classifyUrgency({
      title: ticket.title,
      description: ticket.description,
    });

    // Use encapsulated method to reclassify
    ticket.reclassify(urgencyScore);

    await this.ticketRepository.save(ticket);
    return ticket;
  }
}

