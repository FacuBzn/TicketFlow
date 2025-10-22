import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { Ticket } from '../../domain/entities/Ticket';
import { TicketNotFoundError } from '../../domain/errors/TicketNotFoundError';
import { StateTransitionValidator } from '../../domain/services/StateTransitionValidator';

export class CloseTicketUseCase {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async execute(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new TicketNotFoundError(id);
    }

    // Validate can close (will throw InvalidStateTransitionError if invalid)
    StateTransitionValidator.validate(ticket.status, 'CLOSED');

    // Use encapsulated method to close ticket
    ticket.close();

    await this.ticketRepository.save(ticket);
    return ticket;
  }
}

