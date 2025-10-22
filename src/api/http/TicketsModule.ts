import { Module } from '@nestjs/common';
import { TicketsController } from '../controllers/TicketsController';
import { CreateTicketUseCase } from '../../application/use-cases/CreateTicketUseCase';
import { ListTicketsUseCase } from '../../application/use-cases/ListTicketsUseCase';
import { GetTicketByIdUseCase } from '../../application/use-cases/GetTicketByIdUseCase';
import { UpdateTicketStatusUseCase } from '../../application/use-cases/UpdateTicketStatusUseCase';
import { CloseTicketUseCase } from '../../application/use-cases/CloseTicketUseCase';
import { ReclassifyTicketUseCase } from '../../application/use-cases/ReclassifyTicketUseCase';
import { DeleteTicketUseCase } from '../../application/use-cases/DeleteTicketUseCase';
import { InMemoryTicketRepository } from '../../infrastructure/adapters/persistence/InMemoryTicketRepository';
import { LlmProviderFactory } from '../../infrastructure/providers/LlmProviderFactory';
import { AppLogger } from '../../infrastructure/logger/AppLogger';

@Module({
  controllers: [TicketsController],
  providers: [
    // Repository
    {
      provide: 'TicketRepositoryPort',
      useClass: InMemoryTicketRepository,
    },
    // LLM Client
    {
      provide: 'LLMClientPort',
      useFactory: (logger: AppLogger) => LlmProviderFactory.create(logger),
      inject: [AppLogger],
    },
    // Use Cases
    {
      provide: CreateTicketUseCase,
      useFactory: (ticketRepository, llmClient) =>
        new CreateTicketUseCase(ticketRepository, llmClient),
      inject: ['TicketRepositoryPort', 'LLMClientPort'],
    },
    {
      provide: ListTicketsUseCase,
      useFactory: (ticketRepository) =>
        new ListTicketsUseCase(ticketRepository),
      inject: ['TicketRepositoryPort'],
    },
    {
      provide: GetTicketByIdUseCase,
      useFactory: (ticketRepository) =>
        new GetTicketByIdUseCase(ticketRepository),
      inject: ['TicketRepositoryPort'],
    },
    {
      provide: UpdateTicketStatusUseCase,
      useFactory: (ticketRepository) =>
        new UpdateTicketStatusUseCase(ticketRepository),
      inject: ['TicketRepositoryPort'],
    },
    {
      provide: CloseTicketUseCase,
      useFactory: (ticketRepository) =>
        new CloseTicketUseCase(ticketRepository),
      inject: ['TicketRepositoryPort'],
    },
    {
      provide: ReclassifyTicketUseCase,
      useFactory: (ticketRepository, llmClient) =>
        new ReclassifyTicketUseCase(ticketRepository, llmClient),
      inject: ['TicketRepositoryPort', 'LLMClientPort'],
    },
    {
      provide: DeleteTicketUseCase,
      useFactory: (ticketRepository) =>
        new DeleteTicketUseCase(ticketRepository),
      inject: ['TicketRepositoryPort'],
    },
  ],
})
export class TicketsModule {}
