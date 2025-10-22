"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsModule = void 0;
const common_1 = require("@nestjs/common");
const TicketsController_1 = require("../controllers/TicketsController");
const CreateTicketUseCase_1 = require("../../application/use-cases/CreateTicketUseCase");
const ListTicketsUseCase_1 = require("../../application/use-cases/ListTicketsUseCase");
const GetTicketByIdUseCase_1 = require("../../application/use-cases/GetTicketByIdUseCase");
const UpdateTicketStatusUseCase_1 = require("../../application/use-cases/UpdateTicketStatusUseCase");
const CloseTicketUseCase_1 = require("../../application/use-cases/CloseTicketUseCase");
const ReclassifyTicketUseCase_1 = require("../../application/use-cases/ReclassifyTicketUseCase");
const DeleteTicketUseCase_1 = require("../../application/use-cases/DeleteTicketUseCase");
const InMemoryTicketRepository_1 = require("../../infrastructure/adapters/persistence/InMemoryTicketRepository");
const LlmProviderFactory_1 = require("../../infrastructure/providers/LlmProviderFactory");
const AppLogger_1 = require("../../infrastructure/logger/AppLogger");
let TicketsModule = class TicketsModule {
};
exports.TicketsModule = TicketsModule;
exports.TicketsModule = TicketsModule = __decorate([
    (0, common_1.Module)({
        controllers: [TicketsController_1.TicketsController],
        providers: [
            // Repository
            {
                provide: 'TicketRepositoryPort',
                useClass: InMemoryTicketRepository_1.InMemoryTicketRepository,
            },
            // LLM Client
            {
                provide: 'LLMClientPort',
                useFactory: (logger) => LlmProviderFactory_1.LlmProviderFactory.create(logger),
                inject: [AppLogger_1.AppLogger],
            },
            // Use Cases
            {
                provide: CreateTicketUseCase_1.CreateTicketUseCase,
                useFactory: (ticketRepository, llmClient) => new CreateTicketUseCase_1.CreateTicketUseCase(ticketRepository, llmClient),
                inject: ['TicketRepositoryPort', 'LLMClientPort'],
            },
            {
                provide: ListTicketsUseCase_1.ListTicketsUseCase,
                useFactory: (ticketRepository) => new ListTicketsUseCase_1.ListTicketsUseCase(ticketRepository),
                inject: ['TicketRepositoryPort'],
            },
            {
                provide: GetTicketByIdUseCase_1.GetTicketByIdUseCase,
                useFactory: (ticketRepository) => new GetTicketByIdUseCase_1.GetTicketByIdUseCase(ticketRepository),
                inject: ['TicketRepositoryPort'],
            },
            {
                provide: UpdateTicketStatusUseCase_1.UpdateTicketStatusUseCase,
                useFactory: (ticketRepository) => new UpdateTicketStatusUseCase_1.UpdateTicketStatusUseCase(ticketRepository),
                inject: ['TicketRepositoryPort'],
            },
            {
                provide: CloseTicketUseCase_1.CloseTicketUseCase,
                useFactory: (ticketRepository) => new CloseTicketUseCase_1.CloseTicketUseCase(ticketRepository),
                inject: ['TicketRepositoryPort'],
            },
            {
                provide: ReclassifyTicketUseCase_1.ReclassifyTicketUseCase,
                useFactory: (ticketRepository, llmClient) => new ReclassifyTicketUseCase_1.ReclassifyTicketUseCase(ticketRepository, llmClient),
                inject: ['TicketRepositoryPort', 'LLMClientPort'],
            },
            {
                provide: DeleteTicketUseCase_1.DeleteTicketUseCase,
                useFactory: (ticketRepository) => new DeleteTicketUseCase_1.DeleteTicketUseCase(ticketRepository),
                inject: ['TicketRepositoryPort'],
            },
        ],
    })
], TicketsModule);
//# sourceMappingURL=TicketsModule.js.map