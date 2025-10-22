import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { Ticket, TicketStatus, TicketPriority } from '../../domain/entities/Ticket';

export interface ListTicketsFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
}

export class ListTicketsUseCase {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async execute(filters?: ListTicketsFilters): Promise<Ticket[]> {
    const allTickets = await this.ticketRepository.findAll();

    if (!filters) {
      return allTickets;
    }

    return allTickets.filter(ticket => {
      if (filters.status && ticket.status !== filters.status) {
        return false;
      }
      if (filters.priority && ticket.priority !== filters.priority) {
        return false;
      }
      return true;
    });
  }
}

