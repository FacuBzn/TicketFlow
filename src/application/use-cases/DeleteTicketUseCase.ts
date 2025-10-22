import { TicketRepositoryPort } from '../ports/TicketRepositoryPort';
import { TicketNotFoundError } from '../../domain/errors/TicketNotFoundError';

export interface DeleteTicketResponse {
  deleted: boolean;
  id: string;
}

export class DeleteTicketUseCase {
  constructor(private readonly ticketRepository: TicketRepositoryPort) {}

  async execute(id: string): Promise<DeleteTicketResponse> {
    const ticket = await this.ticketRepository.findById(id);
    
    if (!ticket) {
      throw new TicketNotFoundError(id);
    }

    await this.ticketRepository.delete(id);
    
    return {
      deleted: true,
      id,
    };
  }
}

