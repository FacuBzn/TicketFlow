import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TicketsModule } from './api/http/TicketsModule';
import { AppLoggerModule } from './infrastructure/logger/LoggerModule';

@Module({
  imports: [
    // Rate Limiting Configuration
    ThrottlerModule.forRoot([
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
    LoggerModule.forRoot({
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
          level(label: string) {
            return { level: label };
          }
        },
        customProps: (req: any) => ({
          service: 'support-tickets-api',
          correlationId: req.correlationId,
        }),
      },
    }),
    AppLoggerModule,
    TicketsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

