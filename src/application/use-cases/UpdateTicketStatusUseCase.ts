import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { Ticket, TicketStatus } from '../../domain/entities/Ticket';
import { TicketNotFoundError } from '../../domain/errors/TicketNotFoundError';
import { StateTransitionValidator } from '../../domain/services/StateTransitionValidator';

export class UpdateTicketStatusUseCase {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async execute(id: string, newStatus: TicketStatus): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new TicketNotFoundError(id);
    }

    // Validate state transition (will throw InvalidStateTransitionError if invalid)
    StateTransitionValidator.validate(ticket.status, newStatus);

    // Use encapsulated method to update status
    ticket.updateStatus(newStatus);

    await this.ticketRepository.save(ticket);
    return ticket;
  }
}

