import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Health & Monitoring (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/tickets/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('service');
          expect(res.body).toHaveProperty('version');
          expect(res.body).toHaveProperty('llmProvider');
          expect(res.body).toHaveProperty('environment');
          
          expect(res.body.status).toBe('ok');
          expect(res.body.service).toBe('ticketflow');
          expect(res.body.version).toBe('1.0.0');
          expect(typeof res.body.uptime).toBe('number');
          expect(res.body.uptime).toBeGreaterThan(0);
        });
    });

    it('should return valid timestamp', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets/health')
        .expect(200)
        .expect((res) => {
          const timestamp = new Date(res.body.timestamp);
          expect(timestamp).toBeInstanceOf(Date);
          expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
        });
    });

    it('should return LLM provider configuration', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets/health')
        .expect(200)
        .expect((res) => {
          expect(['stub', 'openai', 'gemini']).toContain(res.body.llmProvider);
        });
    });

    it('should return environment', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.environment).toBeDefined();
        });
    });
  });

  describe('/api/v1/tickets/debug (GET)', () => {
    it('should return debug info in test environment', () => {
      // In test environment, debug endpoint should be accessible
      return request(app.getHttpServer())
        .get('/api/v1/tickets/debug')
        .expect((res) => {
          // Should be 200 in test/development, 404 in production
          if (process.env.NODE_ENV !== 'production') {
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('LLM_PROVIDER');
            expect(res.body).toHaveProperty('OPENAI_API_KEY_EXISTS');
            expect(res.body).toHaveProperty('GEMINI_API_KEY_EXISTS');
            expect(res.body).toHaveProperty('NODE_ENV');
          } else {
            expect(res.status).toBe(404);
          }
        });
    });

    it('should not expose API keys in plain text', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets/debug')
        .expect((res) => {
          if (res.status === 200) {
            // Should only show existence and length, not actual keys
            expect(res.body).not.toHaveProperty('OPENAI_API_KEY');
            expect(res.body).not.toHaveProperty('GEMINI_API_KEY');
            expect(res.body).toHaveProperty('OPENAI_API_KEY_EXISTS');
            expect(res.body).toHaveProperty('GEMINI_API_KEY_EXISTS');
            expect(res.body).toHaveProperty('OPENAI_API_KEY_LENGTH');
            expect(res.body).toHaveProperty('GEMINI_API_KEY_LENGTH');
          }
        });
    });
  });
});

