import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { Ticket } from '../../domain/entities/Ticket';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StateTransitionValidator } from '../../domain/services/StateTransitionValidator';

export class CloseTicketUseCase {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async execute(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // Validate can close
    try {
      StateTransitionValidator.validate(ticket.status, 'CLOSED');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cannot close ticket';
      throw new BadRequestException(`Cannot close ticket: ${message}`);
    }

    // Update to CLOSED
    ticket.status = 'CLOSED';
    ticket.updatedAt = new Date();

    await this.ticketRepository.save(ticket);
    return ticket;
  }
}

