import { TicketPriority } from '../entities/Ticket';

export class UrgencyPriorityMapper {
  static map(score: number): TicketPriority {
    if (score <= 0.25) return 'LOW';
    if (score <= 0.5) return 'MEDIUM';
    if (score <= 0.75) return 'HIGH';
    return 'CRITICAL';
  }
}

