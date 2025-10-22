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
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const AppLogger_1 = require("../../logger/AppLogger");
const TicketNotFoundError_1 = require("../../../domain/errors/TicketNotFoundError");
const InvalidStateTransitionError_1 = require("../../../domain/errors/InvalidStateTransitionError");
let HttpExceptionFilter = class HttpExceptionFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let error = 'Internal Server Error';
        // Map domain exceptions to HTTP exceptions
        if (exception instanceof TicketNotFoundError_1.TicketNotFoundError) {
            status = common_1.HttpStatus.NOT_FOUND;
            message = exception.message;
            error = 'Not Found';
        }
        else if (exception instanceof InvalidStateTransitionError_1.InvalidStateTransitionError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            message = exception.message;
            error = 'Bad Request';
        }
        else if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse;
                message = resp.message || exception.message;
                error = resp.error || exception.name;
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
            // Log unexpected errors
            this.logger.error('Unhandled exception', 'HttpExceptionFilter', exception.stack, {
                status,
                message,
                path: request.url,
                method: request.method,
                correlationId: request.correlationId,
            });
        }
        response.status(status).json({
            statusCode: status,
            error,
            message,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __param(0, (0, common_1.Inject)(AppLogger_1.AppLogger)),
    __metadata("design:paramtypes", [AppLogger_1.AppLogger])
], HttpExceptionFilter);
//# sourceMappingURL=HttpExceptionFilter.js.map