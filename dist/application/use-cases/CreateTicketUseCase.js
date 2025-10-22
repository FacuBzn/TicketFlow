"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTicketUseCase = void 0;
const Ticket_1 = require("../../domain/entities/Ticket");
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
        // Create ticket entity using factory method (encapsulates priority mapping)
        const ticket = Ticket_1.Ticket.create(input.title, input.description, urgencyScore);
        // Persist
        await this.ticketRepository.save(ticket);
        return ticket;
    }
}
exports.CreateTicketUseCase = CreateTicketUseCase;
//# sourceMappingURL=CreateTicketUseCase.js.map