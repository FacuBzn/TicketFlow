"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseTicketUseCase = void 0;
const TicketNotFoundError_1 = require("../../domain/errors/TicketNotFoundError");
const StateTransitionValidator_1 = require("../../domain/services/StateTransitionValidator");
class CloseTicketUseCase {
    ticketRepository;
    constructor(ticketRepository) {
        this.ticketRepository = ticketRepository;
    }
    async execute(id) {
        const ticket = await this.ticketRepository.findById(id);
        if (!ticket) {
            throw new TicketNotFoundError_1.TicketNotFoundError(id);
        }
        // Validate can close (will throw InvalidStateTransitionError if invalid)
        StateTransitionValidator_1.StateTransitionValidator.validate(ticket.status, 'CLOSED');
        // Use encapsulated method to close ticket
        ticket.close();
        await this.ticketRepository.save(ticket);
        return ticket;
    }
}
exports.CloseTicketUseCase = CloseTicketUseCase;
//# sourceMappingURL=CloseTicketUseCase.js.map