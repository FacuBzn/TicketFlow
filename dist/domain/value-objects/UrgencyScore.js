"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrgencyScore = void 0;
const TicketPriority_1 = require("./TicketPriority");
/**
 * Value Object representing urgency score (0.0 - 1.0)
 * Encapsulates validation and mapping to priority levels
 */
class UrgencyScore {
    value;
    constructor(value) {
        this.value = value;
        if (value < 0 || value > 1) {
            throw new Error('UrgencyScore must be between 0.0 and 1.0');
        }
    }
    /**
     * Create UrgencyScore from number
     * @throws Error if value is out of range
     */
    static fromNumber(value) {
        return new UrgencyScore(value);
    }
    /**
     * Get numeric value
     */
    getValue() {
        return this.value;
    }
    /**
     * Map urgency score to ticket priority
     * Rules:
     * - 0.00-0.25 → LOW
     * - 0.26-0.50 → MEDIUM
     * - 0.51-0.75 → HIGH
     * - 0.76-1.00 → CRITICAL
     */
    toPriority() {
        if (this.value <= 0.25)
            return TicketPriority_1.TicketPriority.LOW;
        if (this.value <= 0.5)
            return TicketPriority_1.TicketPriority.MEDIUM;
        if (this.value <= 0.75)
            return TicketPriority_1.TicketPriority.HIGH;
        return TicketPriority_1.TicketPriority.CRITICAL;
    }
    /**
     * Check if score is critical (>0.75)
     */
    isCritical() {
        return this.value > 0.75;
    }
    /**
     * Check if score is low (<0.25)
     */
    isLow() {
        return this.value <= 0.25;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return `${(this.value * 100).toFixed(1)}%`;
    }
}
exports.UrgencyScore = UrgencyScore;
//# sourceMappingURL=UrgencyScore.js.map