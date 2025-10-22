"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketMapper = void 0;
const TicketResponseDto_1 = require("../dtos/TicketResponseDto");
/**
 * Mapper to convert domain entities to API DTOs
 * Prevents internal domain details from leaking to API responses
 */
class TicketMapper {
    /**
     * Convert Ticket entity to TicketResponseDto
     */
    static toDto(ticket) {
        const dto = new TicketResponseDto_1.TicketResponseDto();
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
    static toDtoList(tickets) {
        return tickets.map((ticket) => this.toDto(ticket));
    }
}
exports.TicketMapper = TicketMapper;
//# sourceMappingURL=TicketMapper.js.map