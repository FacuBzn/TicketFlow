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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsController = void 0;
const common_1 = require("@nestjs/common");
const CreateTicketDto_1 = require("../dtos/CreateTicketDto");
const TicketResponseDto_1 = require("../dtos/TicketResponseDto");
const UpdateTicketStatusDto_1 = require("../dtos/UpdateTicketStatusDto");
const TicketFiltersDto_1 = require("../dtos/TicketFiltersDto");
const CreateTicketUseCase_1 = require("../../application/use-cases/CreateTicketUseCase");
const ListTicketsUseCase_1 = require("../../application/use-cases/ListTicketsUseCase");
const GetTicketByIdUseCase_1 = require("../../application/use-cases/GetTicketByIdUseCase");
const UpdateTicketStatusUseCase_1 = require("../../application/use-cases/UpdateTicketStatusUseCase");
const CloseTicketUseCase_1 = require("../../application/use-cases/CloseTicketUseCase");
const ReclassifyTicketUseCase_1 = require("../../application/use-cases/ReclassifyTicketUseCase");
const DeleteTicketUseCase_1 = require("../../application/use-cases/DeleteTicketUseCase");
const swagger_1 = require("@nestjs/swagger");
const TicketMapper_1 = require("../mappers/TicketMapper");
const LoggingInterceptor_1 = require("../../infrastructure/interceptors/LoggingInterceptor");
let TicketsController = class TicketsController {
    createTicketUseCase;
    listTicketsUseCase;
    getTicketByIdUseCase;
    updateTicketStatusUseCase;
    closeTicketUseCase;
    reclassifyTicketUseCase;
    deleteTicketUseCase;
    constructor(createTicketUseCase, listTicketsUseCase, getTicketByIdUseCase, updateTicketStatusUseCase, closeTicketUseCase, reclassifyTicketUseCase, deleteTicketUseCase) {
        this.createTicketUseCase = createTicketUseCase;
        this.listTicketsUseCase = listTicketsUseCase;
        this.getTicketByIdUseCase = getTicketByIdUseCase;
        this.updateTicketStatusUseCase = updateTicketStatusUseCase;
        this.closeTicketUseCase = closeTicketUseCase;
        this.reclassifyTicketUseCase = reclassifyTicketUseCase;
        this.deleteTicketUseCase = deleteTicketUseCase;
    }
    healthCheck() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            service: 'ticketflow',
            version: '1.0.0',
            llmProvider: process.env.LLM_PROVIDER || 'stub',
            environment: process.env.NODE_ENV || 'development',
        };
    }
    debug() {
        // Security: Only allow in development/staging environments
        if (process.env.NODE_ENV === 'production') {
            throw new common_1.NotFoundException('Debug endpoint not available in production');
        }
        return {
            LLM_PROVIDER: process.env.LLM_PROVIDER,
            OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY,
            OPENAI_API_KEY_LENGTH: process.env.OPENAI_API_KEY?.length || 0,
            GEMINI_API_KEY_EXISTS: !!process.env.GEMINI_API_KEY,
            GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY?.length || 0,
            NODE_ENV: process.env.NODE_ENV
        };
    }
    async create(dto) {
        const ticket = await this.createTicketUseCase.execute(dto);
        return TicketMapper_1.TicketMapper.toDto(ticket);
    }
    async list(filters) {
        const tickets = await this.listTicketsUseCase.execute(filters);
        return TicketMapper_1.TicketMapper.toDtoList(tickets);
    }
    async getById(id) {
        const ticket = await this.getTicketByIdUseCase.execute(id);
        return TicketMapper_1.TicketMapper.toDto(ticket);
    }
    async updateStatus(id, dto) {
        const ticket = await this.updateTicketStatusUseCase.execute(id, dto.status);
        return TicketMapper_1.TicketMapper.toDto(ticket);
    }
    async reclassify(id) {
        const ticket = await this.reclassifyTicketUseCase.execute(id);
        return TicketMapper_1.TicketMapper.toDto(ticket);
    }
    async close(id) {
        const ticket = await this.closeTicketUseCase.execute(id);
        return TicketMapper_1.TicketMapper.toDto(ticket);
    }
    async delete(id) {
        return await this.deleteTicketUseCase.execute(id);
    }
};
exports.TicketsController = TicketsController;
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Health check endpoint',
        description: 'Returns the service health status and configuration'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is healthy',
        schema: {
            example: {
                status: 'ok',
                timestamp: '2025-10-22T20:00:00.000Z',
                uptime: 3600,
                service: 'ticketflow',
                version: '1.0.0',
                llmProvider: 'gemini',
                environment: 'development'
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Get)('debug'),
    (0, swagger_1.ApiOperation)({
        summary: 'Debug environment variables (development only)',
        description: 'Returns configuration info. Only accessible in non-production environments.'
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TicketsController.prototype, "debug", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new support ticket with AI-powered urgency classification',
        description: 'Creates a new ticket and automatically classifies its urgency using AI (OpenAI/Gemini) or heuristic rules'
    }),
    (0, swagger_1.ApiBody)({
        type: CreateTicketDto_1.CreateTicketDto,
        examples: {
            normal: {
                summary: 'Normal Ticket',
                description: 'A typical support request',
                value: {
                    title: 'Payment issue',
                    description: 'Customer cannot complete the payment process'
                }
            },
            urgent: {
                summary: 'Urgent Ticket',
                description: 'A high-priority system issue',
                value: {
                    title: 'System down urgent',
                    description: 'Production system is completely offline and customers cannot access services'
                }
            },
            critical: {
                summary: 'Critical Ticket',
                description: 'A critical system failure',
                value: {
                    title: 'Critical system failure',
                    description: 'Production database is down and all services are offline'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Ticket created successfully with AI classification',
        type: TicketResponseDto_1.TicketResponseDto
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateTicketDto_1.CreateTicketDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all tickets with optional filters' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] }),
    (0, swagger_1.ApiQuery)({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of tickets',
        type: [TicketResponseDto_1.TicketResponseDto]
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [TicketFiltersDto_1.TicketFiltersDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a ticket by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Ticket ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket found', type: TicketResponseDto_1.TicketResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "getById", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ticket status' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Ticket ID' }),
    (0, swagger_1.ApiBody)({ type: UpdateTicketStatusDto_1.UpdateTicketStatusDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully', type: TicketResponseDto_1.TicketResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid state transition' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTicketStatusDto_1.UpdateTicketStatusDto]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/reclassify'),
    (0, swagger_1.ApiOperation)({
        summary: 'Re-classify ticket urgency using AI',
        description: 'Re-analyzes the ticket using LLM and updates urgency score and priority'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Ticket ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket re-classified successfully', type: TicketResponseDto_1.TicketResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "reclassify", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    (0, swagger_1.ApiOperation)({ summary: 'Close a ticket' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Ticket ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket closed successfully', type: TicketResponseDto_1.TicketResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cannot close ticket' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "close", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a ticket' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Ticket ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ticket deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ticket not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketsController.prototype, "delete", null);
exports.TicketsController = TicketsController = __decorate([
    (0, swagger_1.ApiTags)('Tickets'),
    (0, common_1.Controller)('tickets'),
    (0, common_1.UseInterceptors)(LoggingInterceptor_1.LoggingInterceptor),
    __metadata("design:paramtypes", [CreateTicketUseCase_1.CreateTicketUseCase,
        ListTicketsUseCase_1.ListTicketsUseCase,
        GetTicketByIdUseCase_1.GetTicketByIdUseCase,
        UpdateTicketStatusUseCase_1.UpdateTicketStatusUseCase,
        CloseTicketUseCase_1.CloseTicketUseCase,
        ReclassifyTicketUseCase_1.ReclassifyTicketUseCase,
        DeleteTicketUseCase_1.DeleteTicketUseCase])
], TicketsController);
//# sourceMappingURL=TicketsController.js.map