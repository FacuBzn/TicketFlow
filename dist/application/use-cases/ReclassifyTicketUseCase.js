"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReclassifyTicketUseCase = void 0;
const TicketNotFoundError_1 = require("../../domain/errors/TicketNotFoundError");
class ReclassifyTicketUseCase {
    ticketRepository;
    llmClient;
    constructor(ticketRepository, llmClient) {
        this.ticketRepository = ticketRepository;
        this.llmClient = llmClient;
    }
    async execute(id) {
        const ticket = await this.ticketRepository.findById(id);
        if (!ticket) {
            throw new TicketNotFoundError_1.TicketNotFoundError(id);
        }
        // Re-classify using LLM
        const { urgencyScore } = await this.llmClient.classifyUrgency({
            title: ticket.title,
            description: ticket.description,
        });
        // Use encapsulated method to reclassify
        ticket.reclassify(urgencyScore);
        await this.ticketRepository.save(ticket);
        return ticket;
    }
}
exports.ReclassifyTicketUseCase = ReclassifyTicketUseCase;
//# sourceMappingURL=ReclassifyTicketUseCase.js.map