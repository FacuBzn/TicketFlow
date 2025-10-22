import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { Ticket, TicketStatus } from '../../domain/entities/Ticket';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StateTransitionValidator } from '../../domain/services/StateTransitionValidator';

export class UpdateTicketStatusUseCase {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async execute(id: string, newStatus: TicketStatus): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    // Validate state transition
    try {
      StateTransitionValidator.validate(ticket.status, newStatus);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid state transition';
      throw new BadRequestException(message);
    }

    // Update status and timestamp
    ticket.status = newStatus;
    ticket.updatedAt = new Date();

    await this.ticketRepository.save(ticket);
    return ticket;
  }
}

