"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables from .env file FIRST
const dotenv = __importStar(require("dotenv"));
dotenv.config();
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const SwaggerConfig_1 = require("./api/swagger/SwaggerConfig");
const HttpExceptionFilter_1 = require("./infrastructure/adapters/http/HttpExceptionFilter");
const uuid_1 = require("uuid");
const nestjs_pino_1 = require("nestjs-pino");
const AppLogger_1 = require("./infrastructure/logger/AppLogger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        bufferLogs: true,
    });
    // Use Pino logger
    app.useLogger(app.get(nestjs_pino_1.Logger));
    // Correlation ID middleware
    app.use((req, _res, next) => {
        req.correlationId = (0, uuid_1.v4)();
        next();
    });
    // Global configuration
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const appLogger = app.get(AppLogger_1.AppLogger);
    app.useGlobalFilters(new HttpExceptionFilter_1.HttpExceptionFilter(appLogger));
    // Swagger documentation
    (0, SwaggerConfig_1.setupSwagger)(app);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    const logger = new common_1.Logger('Bootstrap');
    logger.log(`Application started successfully on port ${port}`);
    logger.log(`Swagger documentation available at http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map