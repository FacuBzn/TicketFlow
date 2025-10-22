"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTicketsUseCase = void 0;
class ListTicketsUseCase {
    ticketRepository;
    constructor(ticketRepository) {
        this.ticketRepository = ticketRepository;
    }
    async execute(filters) {
        const allTickets = await this.ticketRepository.findAll();
        if (!filters) {
            return allTickets;
        }
        return allTickets.filter(ticket => {
            if (filters.status && ticket.status !== filters.status) {
                return false;
            }
            if (filters.priority && ticket.priority !== filters.priority) {
                return false;
            }
            return true;
        });
    }
}
exports.ListTicketsUseCase = ListTicketsUseCase;
//# sourceMappingURL=ListTicketsUseCase.js.map