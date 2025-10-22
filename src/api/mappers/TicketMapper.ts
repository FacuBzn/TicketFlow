import { Ticket } from '../../domain/entities/Ticket';
import { TicketResponseDto } from '../dtos/TicketResponseDto';

/**
 * Mapper to convert domain entities to API DTOs
 * Prevents internal domain details from leaking to API responses
 */
export class TicketMapper {
  /**
   * Convert Ticket entity to TicketResponseDto
   */
  static toDto(ticket: Ticket): TicketResponseDto {
    const dto = new TicketResponseDto();
    dto.id = ticket.id;
    dto.title = ticket.title;
    dto.description = ticket.description;
    dto.status = ticket.status;
    dto.priority = ticket.priority;
    dto.urgencyScore = ticket.urgencyScore;
    dto.createdAt = ticket.createdAt;
    dto.updatedAt = ticket.updatedAt;
    return dto;
  }

  /**
   * Convert array of Tickets to array of DTOs
   */
  static toDtoList(tickets: Ticket[]): TicketResponseDto[] {
    return tickets.map((ticket) => this.toDto(ticket));
  }
}

