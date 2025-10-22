"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryTicketRepository = void 0;
const common_1 = require("@nestjs/common");
/**
 * In-memory ticket repository implementation.
 *
 * ## Singleton Pattern
 * Marked as Singleton (Scope.DEFAULT) to ensure data persistence across requests.
 * All HTTP requests share the same Map instance.
 *
 * ## Thread Safety
 * JavaScript Map is NOT thread-safe by design. However, Node.js operates on a
 * single-threaded event loop model, making race conditions unlikely in typical scenarios.
 *
 * **Considerations**:
 * - Safe for single-threaded Node.js applications ✅
 * - NOT safe for Worker Threads or Cluster mode without synchronization ⚠️
 * - For production with high concurrency, consider:
 *   1. PostgreSQL/MongoDB with proper transactions
 *   2. Redis with atomic operations
 *   3. Distributed locks (e.g., Redlock pattern)
 *
 * ## Production Readiness
 * ⚠️ This implementation is suitable for:
 * - Development/testing environments
 * - MVP/prototypes
 * - Single-instance deployments
 *
 * ❌ NOT recommended for:
 * - Multi-instance production (data not shared across instances)
 * - High-traffic applications requiring persistence
 * - Applications requiring data durability (data lost on restart)
 */
let InMemoryTicketRepository = class InMemoryTicketRepository {
    store = new Map();
    async save(ticket) {
        this.store.set(ticket.id, ticket);
        return ticket;
    }
    async findById(id) {
        return this.store.get(id) ?? null;
    }
    async findAll() {
        return Array.from(this.store.values());
    }
    async update(id, ticket) {
        if (!this.store.has(id)) {
            throw new Error(`Ticket with ID ${id} not found`);
        }
        this.store.set(id, ticket);
        return ticket;
    }
    async delete(id) {
        this.store.delete(id);
    }
};
exports.InMemoryTicketRepository = InMemoryTicketRepository;
exports.InMemoryTicketRepository = InMemoryTicketRepository = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.DEFAULT })
], InMemoryTicketRepository);
//# sourceMappingURL=InMemoryTicketRepository.js.map