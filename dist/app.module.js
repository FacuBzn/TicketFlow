"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const throttler_1 = require("@nestjs/throttler");
const TicketsModule_1 = require("./api/http/TicketsModule");
const LoggerModule_1 = require("./infrastructure/logger/LoggerModule");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // Rate Limiting Configuration
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000, // 1 second
                    limit: 10, // 10 requests per second
                },
                {
                    name: 'medium',
                    ttl: 60000, // 1 minute
                    limit: 100, // 100 requests per minute
                },
                {
                    name: 'long',
                    ttl: 900000, // 15 minutes
                    limit: 500, // 500 requests per 15 minutes
                },
            ]),
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    transport: process.env.NODE_ENV !== 'production' ? {
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            singleLine: true,
                            translateTime: 'yyyy-mm-dd HH:MM:ss.l o',
                            ignore: 'pid,hostname',
                        }
                    } : undefined,
                    level: process.env.LOG_LEVEL || 'info',
                    formatters: {
                        level(label) {
                            return { level: label };
                        }
                    },
                    customProps: (req) => ({
                        service: 'support-tickets-api',
                        correlationId: req.correlationId,
                    }),
                },
            }),
            LoggerModule_1.AppLoggerModule,
            TicketsModule_1.TicketsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map