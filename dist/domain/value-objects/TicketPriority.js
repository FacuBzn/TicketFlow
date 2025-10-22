"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketPriority = void 0;
/**
 * Value Object for Ticket Priority
 * Type-safe enum with validation
 */
class TicketPriority {
    value;
    static LOW = new TicketPriority('LOW');
    static MEDIUM = new TicketPriority('MEDIUM');
    static HIGH = new TicketPriority('HIGH');
    static CRITICAL = new TicketPriority('CRITICAL');
    static ALL_VALUES = [
        TicketPriority.LOW,
        TicketPriority.MEDIUM,
        TicketPriority.HIGH,
        TicketPriority.CRITICAL,
    ];
    constructor(value) {
        this.value = value;
    }
    static fromString(value) {
        const normalized = value.toUpperCase();
        const found = TicketPriority.ALL_VALUES.find((p) => p.value === normalized);
        if (!found) {
            throw new Error(`Invalid priority: ${value}. Must be one of: LOW, MEDIUM, HIGH, CRITICAL`);
        }
        return found;
    }
    getValue() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
    isHigherThan(other) {
        const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        return priorities.indexOf(this.value) > priorities.indexOf(other.value);
    }
    toString() {
        return this.value;
    }
    // Helper for JSON serialization
    toJSON() {
        return this.value;
    }
}
exports.TicketPriority = TicketPriority;
//# sourceMappingURL=TicketPriority.js.map