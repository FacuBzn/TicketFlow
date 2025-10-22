"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTicketUseCase = void 0;
const TicketNotFoundError_1 = require("../../domain/errors/TicketNotFoundError");
class DeleteTicketUseCase {
    ticketRepository;
    constructor(ticketRepository) {
        this.ticketRepository = ticketRepository;
    }
    async execute(id) {
        const ticket = await this.ticketRepository.findById(id);
        if (!ticket) {
            throw new TicketNotFoundError_1.TicketNotFoundError(id);
        }
        await this.ticketRepository.delete(id);
        return {
            deleted: true,
            id,
        };
    }
}
exports.DeleteTicketUseCase = DeleteTicketUseCase;
//# sourceMappingURL=DeleteTicketUseCase.js.map