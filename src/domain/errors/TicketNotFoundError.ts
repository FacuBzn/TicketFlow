export class TicketNotFoundError extends Error {
  constructor(ticketId: string) {
    super(`Ticket with ID ${ticketId} not found`);
    this.name = 'TicketNotFoundError';
  }
}

