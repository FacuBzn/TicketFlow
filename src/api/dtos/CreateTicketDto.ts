import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {
  @ApiProperty({ 
    example: 'Payment issue',
    description: 'Title of the support ticket',
    minLength: 3
  })
  @IsString()
  @MinLength(3)
  title!: string;

  @ApiProperty({ 
    example: 'Customer cannot complete the payment process',
    description: 'Detailed description of the issue',
    minLength: 10
  })
  @IsString()
  @MinLength(10)
  description!: string;
}
