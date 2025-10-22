import { TicketMapper } from '../../../../src/api/mappers/TicketMapper';
import { Ticket } from '../../../../src/domain/entities/Ticket';
import { TicketResponseDto } from '../../../../src/api/dtos/TicketResponseDto';

describe('TicketMapper', () => {
  describe('toDto', () => {
    it('should map Ticket entity to TicketResponseDto', () => {
      // Arrange
      const ticket = Ticket.create('Test Title', 'Test Description', 0.85);

      // Act
      const dto = TicketMapper.toDto(ticket);

      // Assert
      expect(dto).toBeInstanceOf(TicketResponseDto);
      expect(dto.id).toBe(ticket.id);
      expect(dto.title).toBe('Test Title');
      expect(dto.description).toBe('Test Description');
      expect(dto.status).toBe('OPEN');
      expect(dto.priority).toBe('CRITICAL');
      expect(dto.urgencyScore).toBe(0.85);
      expect(dto.createdAt).toBe(ticket.createdAt);
      expect(dto.updatedAt).toBe(ticket.updatedAt);
    });

    it('should map ticket with different statuses', () => {
      // OPEN
      const openTicket = Ticket.create('T1', 'D1', 0.5);
      const openDto = TicketMapper.toDto(openTicket);
      expect(openDto.status).toBe('OPEN');

      // IN_PROGRESS
      const inProgressTicket = Ticket.create('T2', 'D2', 0.5);
      inProgressTicket.updateStatus('IN_PROGRESS');
      const inProgressDto = TicketMapper.toDto(inProgressTicket);
      expect(inProgressDto.status).toBe('IN_PROGRESS');

      // CLOSED
      const closedTicket = Ticket.create('T3', 'D3', 0.5);
      closedTicket.close();
      const closedDto = TicketMapper.toDto(closedTicket);
      expect(closedDto.status).toBe('CLOSED');
    });

    it('should map ticket with different priorities', () => {
      // LOW
      const lowTicket = Ticket.create('Low', 'Description', 0.1);
      const lowDto = TicketMapper.toDto(lowTicket);
      expect(lowDto.priority).toBe('LOW');

      // MEDIUM
      const mediumTicket = Ticket.create('Medium', 'Description', 0.4);
      const mediumDto = TicketMapper.toDto(mediumTicket);
      expect(mediumDto.priority).toBe('MEDIUM');

      // HIGH
      const highTicket = Ticket.create('High', 'Description', 0.6);
      const highDto = TicketMapper.toDto(highTicket);
      expect(highDto.priority).toBe('HIGH');

      // CRITICAL
      const criticalTicket = Ticket.create('Critical', 'Description', 0.9);
      const criticalDto = TicketMapper.toDto(criticalTicket);
      expect(criticalDto.priority).toBe('CRITICAL');
    });

    it('should preserve all ticket properties', () => {
      // Arrange
      const ticket = Ticket.create('Title', 'Description', 0.65);
      const ticketId = ticket.id;
      const createdAt = ticket.createdAt;
      const updatedAt = ticket.updatedAt;

      // Act
      const dto = TicketMapper.toDto(ticket);

      // Assert
      expect(dto.id).toBe(ticketId);
      expect(dto.title).toBe('Title');
      expect(dto.description).toBe('Description');
      expect(dto.urgencyScore).toBe(0.65);
      expect(dto.priority).toBe('HIGH');
      expect(dto.status).toBe('OPEN');
      expect(dto.createdAt).toBe(createdAt);
      expect(dto.updatedAt).toBe(updatedAt);
    });

    it('should create independent DTO objects', () => {
      // Arrange
      const ticket = Ticket.create('Test', 'Description', 0.5);

      // Act
      const dto1 = TicketMapper.toDto(ticket);
      const dto2 = TicketMapper.toDto(ticket);

      // Assert
      expect(dto1).not.toBe(dto2); // Different objects
      expect(dto1.id).toBe(dto2.id); // Same data
      expect(dto1.title).toBe(dto2.title);
    });
  });

  describe('toDtoList', () => {
    it('should map array of tickets to array of DTOs', () => {
      // Arrange
      const tickets = [
        Ticket.create('T1', 'D1', 0.9),
        Ticket.create('T2', 'D2', 0.4),
        Ticket.create('T3', 'D3', 0.1),
      ];

      // Act
      const dtos = TicketMapper.toDtoList(tickets);

      // Assert
      expect(dtos).toHaveLength(3);
      expect(dtos[0]).toBeInstanceOf(TicketResponseDto);
      expect(dtos[1]).toBeInstanceOf(TicketResponseDto);
      expect(dtos[2]).toBeInstanceOf(TicketResponseDto);
      expect(dtos[0].title).toBe('T1');
      expect(dtos[1].title).toBe('T2');
      expect(dtos[2].title).toBe('T3');
    });

    it('should return empty array for empty input', () => {
      // Act
      const dtos = TicketMapper.toDtoList([]);

      // Assert
      expect(dtos).toEqual([]);
      expect(dtos).toHaveLength(0);
    });

    it('should map single ticket array', () => {
      // Arrange
      const tickets = [Ticket.create('Single', 'Description', 0.7)];

      // Act
      const dtos = TicketMapper.toDtoList(tickets);

      // Assert
      expect(dtos).toHaveLength(1);
      expect(dtos[0].title).toBe('Single');
      expect(dtos[0].priority).toBe('HIGH');
    });

    it('should preserve order of tickets', () => {
      // Arrange
      const ticket1 = Ticket.create('First', 'D1', 0.1);
      const ticket2 = Ticket.create('Second', 'D2', 0.5);
      const ticket3 = Ticket.create('Third', 'D3', 0.9);
      const tickets = [ticket1, ticket2, ticket3];

      // Act
      const dtos = TicketMapper.toDtoList(tickets);

      // Assert
      expect(dtos[0].title).toBe('First');
      expect(dtos[1].title).toBe('Second');
      expect(dtos[2].title).toBe('Third');
      expect(dtos[0].id).toBe(ticket1.id);
      expect(dtos[1].id).toBe(ticket2.id);
      expect(dtos[2].id).toBe(ticket3.id);
    });

    it('should map tickets with different states correctly', () => {
      // Arrange
      const ticket1 = Ticket.create('T1', 'D1', 0.9);
      const ticket2 = Ticket.create('T2', 'D2', 0.5);
      ticket2.updateStatus('IN_PROGRESS');
      const ticket3 = Ticket.create('T3', 'D3', 0.1);
      ticket3.close();

      const tickets = [ticket1, ticket2, ticket3];

      // Act
      const dtos = TicketMapper.toDtoList(tickets);

      // Assert
      expect(dtos[0].status).toBe('OPEN');
      expect(dtos[0].priority).toBe('CRITICAL');
      expect(dtos[1].status).toBe('IN_PROGRESS');
      expect(dtos[1].priority).toBe('MEDIUM');
      expect(dtos[2].status).toBe('CLOSED');
      expect(dtos[2].priority).toBe('LOW');
    });
  });
});

