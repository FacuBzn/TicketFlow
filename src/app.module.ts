import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { TicketsModule } from './api/http/TicketsModule';
import { AppLoggerModule } from './infrastructure/logger/LoggerModule';

@Module({
  imports: [
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
          level(label) {
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
})
export class AppModule {}

