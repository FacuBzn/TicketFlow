import { Ticket } from '../../domain/entities/Ticket';

export interface TicketRepositoryPort {
  save(ticket: Ticket): Promise<Ticket>;
  findById(id: string): Promise<Ticket | null>;
  findAll(): Promise<Ticket[]>;
  update(id: string, ticket: Ticket): Promise<Ticket>;
  delete(id: string): Promise<void>;
}

