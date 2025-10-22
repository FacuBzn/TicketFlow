"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTicketStatusUseCase = void 0;
const TicketNotFoundError_1 = require("../../domain/errors/TicketNotFoundError");
const StateTransitionValidator_1 = require("../../domain/services/StateTransitionValidator");
class UpdateTicketStatusUseCase {
    ticketRepository;
    constructor(ticketRepository) {
        this.ticketRepository = ticketRepository;
    }
    async execute(id, newStatus) {
        const ticket = await this.ticketRepository.findById(id);
        if (!ticket) {
            throw new TicketNotFoundError_1.TicketNotFoundError(id);
        }
        // Validate state transition (will throw InvalidStateTransitionError if invalid)
        StateTransitionValidator_1.StateTransitionValidator.validate(ticket.status, newStatus);
        // Use encapsulated method to update status
        ticket.updateStatus(newStatus);
        await this.ticketRepository.save(ticket);
        return ticket;
    }
}
exports.UpdateTicketStatusUseCase = UpdateTicketStatusUseCase;
//# sourceMappingURL=UpdateTicketStatusUseCase.js.map