"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const uuid_1 = require("uuid");
/**
 * Ticket aggregate root entity
 * Encapsulates business rules and state transitions
 */
class Ticket {
    id;
    title;
    description;
    createdAt;
    _status;
    _priority;
    _urgencyScore;
    _updatedAt;
    constructor(title, description, status, priority, urgencyScore, id, createdAt, updatedAt) {
        this.id = id || (0, uuid_1.v4)();
        this.title = title;
        this.description = description;
        this.createdAt = createdAt || new Date();
        this._updatedAt = updatedAt || new Date();
        this._status = status || 'OPEN';
        this._priority = priority || 'LOW';
        this._urgencyScore = urgencyScore ?? 0;
    }
    // Getters
    get status() {
        return this._status;
    }
    get priority() {
        return this._priority;
    }
    get urgencyScore() {
        return this._urgencyScore;
    }
    get updatedAt() {
        return this._updatedAt;
    }
    /**
     * Factory method to create a new ticket with LLM classification
     */
    static create(title, description, urgencyScore) {
        const priority = Ticket.mapUrgencyToPriority(urgencyScore);
        return new Ticket(title, description, 'OPEN', priority, urgencyScore);
    }
    /**
     * Reclassify ticket with new urgency score
     * Updates both urgency score and derived priority
     */
    reclassify(newUrgencyScore) {
        if (newUrgencyScore < 0 || newUrgencyScore > 1) {
            throw new Error('Urgency score must be between 0 and 1');
        }
        this._urgencyScore = newUrgencyScore;
        this._priority = Ticket.mapUrgencyToPriority(newUrgencyScore);
        this._updatedAt = new Date();
    }
    /**
     * Update ticket status
     * Note: State transition validation should be done by StateTransitionValidator
     */
    updateStatus(newStatus) {
        this._status = newStatus;
        this._updatedAt = new Date();
    }
    /**
     * Close the ticket
     */
    close() {
        this._status = 'CLOSED';
        this._updatedAt = new Date();
    }
    /**
     * Check if ticket is closed
     */
    isClosed() {
        return this._status === 'CLOSED';
    }
    /**
     * Check if ticket is open
     */
    isOpen() {
        return this._status === 'OPEN';
    }
    /**
     * Check if priority is critical
     */
    isCritical() {
        return this._priority === 'CRITICAL';
    }
    /**
     * Map urgency score to priority
     * Rules:
     * - 0.00-0.25 → LOW
     * - 0.26-0.50 → MEDIUM
     * - 0.51-0.75 → HIGH
     * - 0.76-1.00 → CRITICAL
     */
    static mapUrgencyToPriority(score) {
        if (score <= 0.25)
            return 'LOW';
        if (score <= 0.5)
            return 'MEDIUM';
        if (score <= 0.75)
            return 'HIGH';
        return 'CRITICAL';
    }
}
exports.Ticket = Ticket;
//# sourceMappingURL=Ticket.js.map