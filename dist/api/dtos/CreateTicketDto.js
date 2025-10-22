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
exports.CreateTicketDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTicketDto {
    title;
    description;
}
exports.CreateTicketDto = CreateTicketDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Payment issue',
        description: 'Title of the support ticket',
        minLength: 3
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'Customer cannot complete the payment process',
        description: 'Detailed description of the issue',
        minLength: 10
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    __metadata("design:type", String)
], CreateTicketDto.prototype, "description", void 0);
//# sourceMappingURL=CreateTicketDto.js.map