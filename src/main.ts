// Load environment variables from .env file FIRST
import * as dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { setupSwagger } from './api/swagger/SwaggerConfig';
import { HttpExceptionFilter } from './infrastructure/adapters/http/HttpExceptionFilter';
import { v4 as uuidv4 } from 'uuid';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppLogger } from './infrastructure/logger/AppLogger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Pino logger
  app.useLogger(app.get(PinoLogger));

  // Correlation ID middleware
  app.use((req: any, _res: any, next: any) => {
    req.correlationId = uuidv4();
    next();
  });
  
  // Global configuration
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true,
  }));
  const appLogger = app.get(AppLogger);
  app.useGlobalFilters(new HttpExceptionFilter(appLogger));
  
  // Swagger documentation
  setupSwagger(app);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  const logger = new Logger('Bootstrap');
  logger.log(`Application started successfully on port ${port}`);
  logger.log(`Swagger documentation available at http://localhost:${port}/docs`);
}
bootstrap();
