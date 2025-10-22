import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { LLMClientPort } from '../ports/LLMClientPort';
import { Ticket } from '../../domain/entities/Ticket';
import { UrgencyPriorityMapper } from '../../domain/services/UrgencyPriorityMapper';
import { NotFoundException } from '@nestjs/common';

export class ReclassifyTicketUseCase {
  constructor(
    private readonly ticketRepository: TicketRepositoryPort,
    private readonly llmClient: LLMClientPort,
  ) {}

  async execute(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // Re-classify using LLM
    const { urgencyScore } = await this.llmClient.classifyUrgency({
      title: ticket.title,
      description: ticket.description,
    });

    // Update priority based on new score
    const priority = UrgencyPriorityMapper.map(urgencyScore);
    
    ticket.urgencyScore = urgencyScore;
    ticket.priority = priority;
    ticket.updatedAt = new Date();

    await this.ticketRepository.save(ticket);
    return ticket;
  }
}

