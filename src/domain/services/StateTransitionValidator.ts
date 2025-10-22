import { TicketStatus } from '../entities/Ticket';
import { InvalidStateTransitionError } from '../errors/InvalidStateTransitionError';

export class StateTransitionValidator {
  private static readonly VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
    OPEN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    IN_PROGRESS: ['OPEN', 'RESOLVED', 'CLOSED'],
    RESOLVED: ['OPEN', 'CLOSED'],
    CLOSED: ['OPEN'],
  };

  static validate(from: TicketStatus, to: TicketStatus): void {
    const allowedTransitions = this.VALID_TRANSITIONS[from];
    
    if (!allowedTransitions.includes(to)) {
      throw new InvalidStateTransitionError(from, to);
    }
  }

  static isValidTransition(from: TicketStatus, to: TicketStatus): boolean {
    const allowedTransitions = this.VALID_TRANSITIONS[from];
    return allowedTransitions.includes(to);
  }
}

