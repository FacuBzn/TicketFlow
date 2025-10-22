import { TicketStatus } from '../entities/Ticket';

export class InvalidStateTransitionError extends Error {
  constructor(from: TicketStatus, to: TicketStatus) {
    super(`Invalid state transition from ${from} to ${to}`);
    this.name = 'InvalidStateTransitionError';
  }
}

