import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { NotFoundException } from '@nestjs/common';

export interface DeleteTicketResponse {
  deleted: boolean;
  id: string;
}

export class DeleteTicketUseCase {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async execute(id: string): Promise<DeleteTicketResponse> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    await this.ticketRepository.delete(id);
    
    return {
      deleted: true,
      id,
    };
  }
}

