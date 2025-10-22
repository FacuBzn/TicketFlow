import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../../domain/entities/Ticket';

export class UpdateTicketStatusDto {
  @ApiProperty({
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
    example: 'IN_PROGRESS',
    description: 'New status for the ticket'
  })
  @IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status!: TicketStatus;
}

