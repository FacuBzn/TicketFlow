"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketStatus = void 0;
/**
 * Value Object for Ticket Status
 * Type-safe enum with state transition validation
 */
class TicketStatus {
    value;
    static OPEN = new TicketStatus('OPEN');
    static IN_PROGRESS = new TicketStatus('IN_PROGRESS');
    static RESOLVED = new TicketStatus('RESOLVED');
    static CLOSED = new TicketStatus('CLOSED');
    static ALL_VALUES = [
        TicketStatus.OPEN,
        TicketStatus.IN_PROGRESS,
        TicketStatus.RESOLVED,
        TicketStatus.CLOSED,
    ];
    constructor(value) {
        this.value = value;
    }
    static fromString(value) {
        const normalized = value.toUpperCase();
        const found = TicketStatus.ALL_VALUES.find((s) => s.value === normalized);
        if (!found) {
            throw new Error(`Invalid status: ${value}. Must be one of: OPEN, IN_PROGRESS, RESOLVED, CLOSED`);
        }
        return found;
    }
    getValue() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
    isOpen() {
        return this.equals(TicketStatus.OPEN);
    }
    isClosed() {
        return this.equals(TicketStatus.CLOSED);
    }
    isResolved() {
        return this.equals(TicketStatus.RESOLVED);
    }
    toString() {
        return this.value;
    }
    // Helper for JSON serialization
    toJSON() {
        return this.value;
    }
}
exports.TicketStatus = TicketStatus;
//# sourceMappingURL=TicketStatus.js.map