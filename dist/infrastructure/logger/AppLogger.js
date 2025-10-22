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
exports.ContextualLogger = exports.AppLogger = void 0;
const common_1 = require("@nestjs/common");
const nestjs_pino_1 = require("nestjs-pino");
/**
 * Application logger wrapper around PinoLogger
 * Provides contextual logging with consistent structure
 */
let AppLogger = class AppLogger {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Log info message
     * @param message - Log message
     * @param context - Context/component name (e.g., 'CreateTicketUseCase')
     * @param metadata - Additional structured data
     */
    log(message, context, metadata) {
        this.logger.info({ context, ...metadata }, message);
    }
    /**
     * Log info message (alias for log)
     */
    info(message, context, metadata) {
        this.log(message, context, metadata);
    }
    /**
     * Log warning message
     */
    warn(message, context, metadata) {
        this.logger.warn({ context, ...metadata }, message);
    }
    /**
     * Log error message with optional stack trace
     * @param message - Error message
     * @param context - Context/component name
     * @param trace - Stack trace (optional)
     * @param metadata - Additional error metadata
     */
    error(message, context, trace, metadata) {
        this.logger.error({ context, trace, ...metadata }, message);
    }
    /**
     * Log debug message
     */
    debug(message, context, metadata) {
        this.logger.debug({ context, ...metadata }, message);
    }
    /**
     * Log trace message (most verbose)
     */
    trace(message, context, metadata) {
        this.logger.trace({ context, ...metadata }, message);
    }
    /**
     * Create a child logger with fixed context
     * Useful for classes that always log with the same context
     * @param context - Fixed context for all logs
     */
    withContext(context) {
        return new ContextualLogger(this, context);
    }
};
exports.AppLogger = AppLogger;
exports.AppLogger = AppLogger = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_pino_1.PinoLogger])
], AppLogger);
/**
 * Contextual logger that always logs with a fixed context
 * Simplifies logging in classes that have a consistent context
 */
class ContextualLogger {
    logger;
    context;
    constructor(logger, context) {
        this.logger = logger;
        this.context = context;
    }
    log(message, metadata) {
        this.logger.log(message, this.context, metadata);
    }
    info(message, metadata) {
        this.logger.info(message, this.context, metadata);
    }
    warn(message, metadata) {
        this.logger.warn(message, this.context, metadata);
    }
    error(message, trace, metadata) {
        this.logger.error(message, this.context, trace, metadata);
    }
    debug(message, metadata) {
        this.logger.debug(message, this.context, metadata);
    }
    trace(message, metadata) {
        this.logger.trace(message, this.context, metadata);
    }
}
exports.ContextualLogger = ContextualLogger;
//# sourceMappingURL=AppLogger.js.map