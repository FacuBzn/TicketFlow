import { ApiProperty } from '@nestjs/swagger';

export class TicketResponseDto {
  @ApiProperty({ example: 'd3c6a9d4-3a6d-40ee-b5c0-bd3a6f556a65' })
  id!: string;

  @ApiProperty({ example: 'Payment issue' })
  title!: string;

  @ApiProperty({ example: 'Customer cannot complete the payment process' })
  description!: string;

  @ApiProperty({ enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], example: 'OPEN' })
  status!: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], example: 'MEDIUM' })
  priority!: string;

  @ApiProperty({ example: 0.63, description: 'Urgency score from 0.0 to 1.0' })
  urgencyScore!: number;

  @ApiProperty({ example: '2025-10-22T14:48:47.222Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-10-22T14:48:47.222Z' })
  updatedAt!: Date;
}
