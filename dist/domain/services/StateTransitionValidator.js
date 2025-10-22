"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateTransitionValidator = void 0;
const InvalidStateTransitionError_1 = require("../errors/InvalidStateTransitionError");
class StateTransitionValidator {
    static VALID_TRANSITIONS = {
        OPEN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        IN_PROGRESS: ['OPEN', 'RESOLVED', 'CLOSED'],
        RESOLVED: ['OPEN', 'CLOSED'],
        CLOSED: ['OPEN'],
    };
    static validate(from, to) {
        const allowedTransitions = this.VALID_TRANSITIONS[from];
        if (!allowedTransitions.includes(to)) {
            throw new InvalidStateTransitionError_1.InvalidStateTransitionError(from, to);
        }
    }
    static isValidTransition(from, to) {
        const allowedTransitions = this.VALID_TRANSITIONS[from];
        return allowedTransitions.includes(to);
    }
}
exports.StateTransitionValidator = StateTransitionValidator;
//# sourceMappingURL=StateTransitionValidator.js.map