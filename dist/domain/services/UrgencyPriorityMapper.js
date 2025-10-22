"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrgencyPriorityMapper = void 0;
class UrgencyPriorityMapper {
    static map(score) {
        if (score <= 0.25)
            return 'LOW';
        if (score <= 0.5)
            return 'MEDIUM';
        if (score <= 0.75)
            return 'HIGH';
        return 'CRITICAL';
    }
}
exports.UrgencyPriorityMapper = UrgencyPriorityMapper;
//# sourceMappingURL=UrgencyPriorityMapper.js.map