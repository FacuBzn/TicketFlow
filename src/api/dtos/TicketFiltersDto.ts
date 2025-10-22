import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TicketStatus, TicketPriority } from '../../domain/entities/Ticket';

export class TicketFiltersDto {
  @ApiPropertyOptional({
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    description: 'Filter by ticket status'
  })
  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status?: TicketStatus;

  @ApiPropertyOptional({
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    description: 'Filter by ticket priority'
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: TicketPriority;
}

