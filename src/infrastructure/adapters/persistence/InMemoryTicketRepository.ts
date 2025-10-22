import { Injectable, Scope } from '@nestjs/common';
import { Ticket } from '../../../domain/entities/Ticket';
import { TicketRepositoryPort } from '../../../application/ports/TicketRepositoryPort';

/**
 * In-memory ticket repository implementation.
 * 
 * ## Singleton Pattern
 * Marked as Singleton (Scope.DEFAULT) to ensure data persistence across requests.
 * All HTTP requests share the same Map instance.
 * 
 * ## Thread Safety
 * JavaScript Map is NOT thread-safe by design. However, Node.js operates on a 
 * single-threaded event loop model, making race conditions unlikely in typical scenarios.
 * 
 * **Considerations**:
 * - Safe for single-threaded Node.js applications ✅
 * - NOT safe for Worker Threads or Cluster mode without synchronization ⚠️
 * - For production with high concurrency, consider:
 *   1. PostgreSQL/MongoDB with proper transactions
 *   2. Redis with atomic operations
 *   3. Distributed locks (e.g., Redlock pattern)
 * 
 * ## Production Readiness
 * ⚠️ This implementation is suitable for:
 * - Development/testing environments
 * - MVP/prototypes
 * - Single-instance deployments
 * 
 * ❌ NOT recommended for:
 * - Multi-instance production (data not shared across instances)
 * - High-traffic applications requiring persistence
 * - Applications requiring data durability (data lost on restart)
 */
@Injectable({ scope: Scope.DEFAULT })
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
