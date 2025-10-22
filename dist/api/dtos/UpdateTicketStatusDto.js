"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTicketStatusDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateTicketStatusDto {
    status;
}
exports.UpdateTicketStatusDto = UpdateTicketStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
        example: 'IN_PROGRESS',
        description: 'New status for the ticket'
    }),
    (0, class_validator_1.IsEnum)(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    __metadata("design:type", String)
], UpdateTicketStatusDto.prototype, "status", void 0);
//# sourceMappingURL=UpdateTicketStatusDto.js.map