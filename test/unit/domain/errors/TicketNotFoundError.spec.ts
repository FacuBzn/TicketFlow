import { TicketNotFoundError } from '../../../../src/domain/errors/TicketNotFoundError';

describe('TicketNotFoundError', () => {
  it('should create error with correct message', () => {
    const ticketId = 'test-ticket-id-123';
    const error = new TicketNotFoundError(ticketId);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(`Ticket with ID ${ticketId} not found`);
  });

  it('should have correct error name', () => {
    const error = new TicketNotFoundError('some-id');

    expect(error.name).toBe('TicketNotFoundError');
  });

  it('should be throwable', () => {
    expect(() => {
      throw new TicketNotFoundError('ticket-123');
    }).toThrow('Ticket with ID ticket-123 not found');
  });

  it('should be catchable as TicketNotFoundError', () => {
    try {
      throw new TicketNotFoundError('ticket-456');
    } catch (error) {
      expect(error).toBeInstanceOf(TicketNotFoundError);
      expect((error as TicketNotFoundError).name).toBe('TicketNotFoundError');
    }
  });

  it('should work with different ticket IDs', () => {
    const uuidId = '550e8400-e29b-41d4-a716-446655440000';
    const error1 = new TicketNotFoundError(uuidId);
    expect(error1.message).toBe(`Ticket with ID ${uuidId} not found`);

    const simpleId = '123';
    const error2 = new TicketNotFoundError(simpleId);
    expect(error2.message).toBe(`Ticket with ID ${simpleId} not found`);
  });
});

