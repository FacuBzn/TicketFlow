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
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const AppLogger_1 = require("../logger/AppLogger");
/**
 * Logging interceptor to add business metadata to logs
 * Captures ticketId, operation type, and performance metrics
 */
let LoggingInterceptor = class LoggingInterceptor {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    intercept(context, next) {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest();
        const { method, url, params } = request;
        const startTime = Date.now();
        // Extract business context
        const ticketId = params?.id;
        const operation = this.getOperationType(method, url);
        const contextName = 'LoggingInterceptor';
        return next.handle().pipe((0, operators_1.tap)({
            next: (response) => {
                const duration = Date.now() - startTime;
                // Log successful operations with business metadata
                this.logger.log('Operation completed successfully', contextName, {
                    operation,
                    ticketId,
                    method,
                    url,
                    durationMs: duration,
                    responseType: Array.isArray(response) ? 'list' : 'single',
                    itemCount: Array.isArray(response) ? response.length : undefined,
                });
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                // Log failed operations with business metadata
                this.logger.error('Operation failed', contextName, error.stack, {
                    operation,
                    ticketId,
                    method,
                    url,
                    durationMs: duration,
                    errorType: error.name,
                    errorMessage: error.message,
                });
            },
        }));
    }
    /**
     * Extract operation type from HTTP method and URL
     */
    getOperationType(method, url) {
        if (url.includes('/reclassify'))
            return 'RECLASSIFY_TICKET';
        if (url.includes('/close'))
            return 'CLOSE_TICKET';
        if (url.includes('/status'))
            return 'UPDATE_STATUS';
        if (url.includes('/health'))
            return 'HEALTH_CHECK';
        if (url.includes('/debug'))
            return 'DEBUG';
        switch (method.toUpperCase()) {
            case 'POST':
                return 'CREATE_TICKET';
            case 'GET':
                return url.includes('/:id') || url.match(/\/[a-f0-9-]{36}$/i)
                    ? 'GET_TICKET'
                    : 'LIST_TICKETS';
            case 'PATCH':
                return 'UPDATE_TICKET';
            case 'DELETE':
                return 'DELETE_TICKET';
            default:
                return 'UNKNOWN';
        }
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [AppLogger_1.AppLogger])
], LoggingInterceptor);
//# sourceMappingURL=LoggingInterceptor.js.map