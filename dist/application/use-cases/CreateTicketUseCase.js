"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTicketUseCase = void 0;
const Ticket_1 = require("../../domain/entities/Ticket");
const UrgencyPriorityMapper_1 = require("../../domain/services/UrgencyPriorityMapper");
class CreateTicketUseCase {
    ticketRepository;
    llmClient;
    constructor(ticketRepository, llmClient) {
        this.ticketRepository = ticketRepository;
        this.llmClient = llmClient;
    }
    async execute(input) {
        // LLM Classify
        const { urgencyScore } = await this.llmClient.classifyUrgency({
            title: input.title,
            description: input.description,
        });
        // Map to domain priority
        const priority = UrgencyPriorityMapper_1.UrgencyPriorityMapper.map(urgencyScore);
        // Create ticket entity
        const ticket = new Ticket_1.Ticket(input.title, input.description, 'OPEN', priority, urgencyScore);
        // Persist
        await this.ticketRepository.save(ticket);
        return ticket;
    }
}
exports.CreateTicketUseCase = CreateTicketUseCase;
//# sourceMappingURL=CreateTicketUseCase.js.map