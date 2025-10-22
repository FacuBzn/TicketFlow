"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTicketByIdUseCase = void 0;
const TicketNotFoundError_1 = require("../../domain/errors/TicketNotFoundError");
class GetTicketByIdUseCase {
    ticketRepository;
    constructor(ticketRepository) {
        this.ticketRepository = ticketRepository;
    }
    async execute(id) {
        const ticket = await this.ticketRepository.findById(id);
        if (!ticket) {
            throw new TicketNotFoundError_1.TicketNotFoundError(id);
        }
        return ticket;
    }
}
exports.GetTicketByIdUseCase = GetTicketByIdUseCase;
//# sourceMappingURL=GetTicketByIdUseCase.js.map