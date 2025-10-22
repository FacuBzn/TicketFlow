import { Body, Controller, Post, Get, Patch, Delete, Param, Query } from '@nestjs/common';
import { CreateTicketDto } from '../dtos/CreateTicketDto';
import { TicketResponseDto } from '../dtos/TicketResponseDto';
import { UpdateTicketStatusDto } from '../dtos/UpdateTicketStatusDto';
import { TicketFiltersDto } from '../dtos/TicketFiltersDto';
import { CreateTicketUseCase } from '../../application/use-cases/CreateTicketUseCase';
import { ListTicketsUseCase } from '../../application/use-cases/ListTicketsUseCase';
import { GetTicketByIdUseCase } from '../../application/use-cases/GetTicketByIdUseCase';
import { UpdateTicketStatusUseCase } from '../../application/use-cases/UpdateTicketStatusUseCase';
import { CloseTicketUseCase } from '../../application/use-cases/CloseTicketUseCase';
import { ReclassifyTicketUseCase } from '../../application/use-cases/ReclassifyTicketUseCase';
import { DeleteTicketUseCase } from '../../application/use-cases/DeleteTicketUseCase';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly createTicketUseCase: CreateTicketUseCase,
    private readonly listTicketsUseCase: ListTicketsUseCase,
    private readonly getTicketByIdUseCase: GetTicketByIdUseCase,
    private readonly updateTicketStatusUseCase: UpdateTicketStatusUseCase,
    private readonly closeTicketUseCase: CloseTicketUseCase,
    private readonly reclassifyTicketUseCase: ReclassifyTicketUseCase,
    private readonly deleteTicketUseCase: DeleteTicketUseCase,
  ) {}

  @Get('debug')
  @ApiOperation({ summary: 'Debug environment variables' })
  debug() {
    return {
      LLM_PROVIDER: process.env.LLM_PROVIDER,
      OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
      OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
      GEMINI_API_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
      GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY?.length || 0,
      NODE_ENV: process.env.NODE_ENV
    };
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a new support ticket with AI-powered urgency classification',
    description: 'Creates a new ticket and automatically classifies its urgency using AI (OpenAI/Gemini) or heuristic rules'
  })
  @ApiBody({
    type: CreateTicketDto,
    examples: {
      normal: {
        summary: 'Normal Ticket',
        description: 'A typical support request',
        value: {
          title: 'Payment issue',
          description: 'Customer cannot complete the payment process'
        }
      },
      urgent: {
        summary: 'Urgent Ticket',
        description: 'A high-priority system issue',
        value: {
          title: 'System down urgent',
          description: 'Production system is completely offline and customers cannot access services'
        }
      },
      critical: {
        summary: 'Critical Ticket',
        description: 'A critical system failure',
        value: {
          title: 'Critical system failure',
          description: 'Production database is down and all services are offline'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Ticket created successfully with AI classification',
    type: TicketResponseDto
  })
  async create(@Body() dto: CreateTicketDto): Promise<TicketResponseDto> {
    const ticket = await this.createTicketUseCase.execute(dto);
    return { ...ticket };
  }

  @Get()
  @ApiOperation({ summary: 'List all tickets with optional filters' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] })
  @ApiResponse({ 
    status: 200, 
    description: 'List of tickets',
    type: [TicketResponseDto]
  })
  async list(@Query() filters: TicketFiltersDto): Promise<TicketResponseDto[]> {
    const tickets = await this.listTicketsUseCase.execute(filters);
    return tickets.map(ticket => ({ ...ticket }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket found', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getById(@Param('id') id: string): Promise<TicketResponseDto> {
    const ticket = await this.getTicketByIdUseCase.execute(id);
    return { ...ticket };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiBody({ type: UpdateTicketStatusDto })
  @ApiResponse({ status: 200, description: 'Status updated successfully', type: TicketResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid state transition' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto
  ): Promise<TicketResponseDto> {
    const ticket = await this.updateTicketStatusUseCase.execute(id, dto.status);
    return { ...ticket };
  }

  @Post(':id/reclassify')
  @ApiOperation({ 
    summary: 'Re-classify ticket urgency using AI',
    description: 'Re-analyzes the ticket using LLM and updates urgency score and priority'
  })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket re-classified successfully', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async reclassify(@Param('id') id: string): Promise<TicketResponseDto> {
    const ticket = await this.reclassifyTicketUseCase.execute(id);
    return { ...ticket };
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket closed successfully', type: TicketResponseDto })
  @ApiResponse({ status: 400, description: 'Cannot close ticket' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async close(@Param('id') id: string): Promise<TicketResponseDto> {
    const ticket = await this.closeTicketUseCase.execute(id);
    return { ...ticket };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Ticket deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async delete(@Param('id') id: string): Promise<{ deleted: boolean; id: string }> {
    return await this.deleteTicketUseCase.execute(id);
  }
}
