"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketNotFoundError = void 0;
class TicketNotFoundError extends Error {
    constructor(ticketId) {
        super(`Ticket with ID ${ticketId} not found`);
        this.name = 'TicketNotFoundError';
    }
}
exports.TicketNotFoundError = TicketNotFoundError;
//# sourceMappingURL=TicketNotFoundError.js.map