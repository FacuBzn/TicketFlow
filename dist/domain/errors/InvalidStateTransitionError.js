"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidStateTransitionError = void 0;
class InvalidStateTransitionError extends Error {
    constructor(from, to) {
        super(`Invalid state transition from ${from} to ${to}`);
        this.name = 'InvalidStateTransitionError';
    }
}
exports.InvalidStateTransitionError = InvalidStateTransitionError;
//# sourceMappingURL=InvalidStateTransitionError.js.map