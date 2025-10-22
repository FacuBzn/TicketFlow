import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { Ticket } from '../../domain/entities/Ticket';
import { NotFoundException } from '@nestjs/common';

export class GetTicketByIdUseCase {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async execute(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }
}

