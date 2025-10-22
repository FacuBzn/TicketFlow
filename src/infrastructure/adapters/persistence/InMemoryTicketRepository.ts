import { Ticket } from '../../../domain/entities/Ticket';
import { TicketRepositoryPort } from '../../../application/ports/TicketRepositoryPort';

export class InMemoryTicketRepository implements TicketRepositoryPort {
  private readonly store = new Map<string, Ticket>();

  async save(ticket: Ticket): Promise<Ticket> {
    this.store.set(ticket.id, ticket);
    return ticket;
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Ticket[]> {
    return Array.from(this.store.values());
  }

  async update(id: string, ticket: Ticket): Promise<Ticket> {
    if (!this.store.has(id)) {
      throw new Error(`Ticket with ID ${id} not found`);
    }
    this.store.set(id, ticket);
    return ticket;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }
}
