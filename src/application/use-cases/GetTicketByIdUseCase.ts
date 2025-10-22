import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { Ticket } from '../../domain/entities/Ticket';
import { TicketNotFoundError } from '../../domain/errors/TicketNotFoundError';

export class GetTicketByIdUseCase {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async execute(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new TicketNotFoundError(id);
    }

    return ticket;
  }
}

