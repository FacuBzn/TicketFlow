# 🧪 Estrategia de Testing - TicketFlow v1.2.0

## 🎯 Objetivo

Aumentar el coverage de testing del **3% actual** al **80%+** mediante una suite completa de tests.

---

## 📊 Estado Actual vs. Objetivo

| Métrica | Actual | Objetivo | Gap |
|---------|--------|----------|-----|
| Unit Tests | 0 | 50+ | +50 |
| Integration Tests | 0 | 15+ | +15 |
| E2E Tests | 0 | 10+ | +10 |
| **Coverage** | **3%** | **80%** | **+77%** |

---

## 🏗️ Estructura de Testing

```
test/
├── unit/                          # Tests aislados de lógica
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Ticket.spec.ts
│   │   ├── services/
│   │   │   └── StateTransitionValidator.spec.ts
│   │   └── errors/
│   │       ├── TicketNotFoundError.spec.ts
│   │       └── InvalidStateTransitionError.spec.ts
│   │
│   ├── application/
│   │   └── use-cases/
│   │       ├── CreateTicketUseCase.spec.ts
│   │       ├── ListTicketsUseCase.spec.ts
│   │       ├── GetTicketByIdUseCase.spec.ts
│   │       ├── UpdateTicketStatusUseCase.spec.ts
│   │       ├── ReclassifyTicketUseCase.spec.ts
│   │       ├── CloseTicketUseCase.spec.ts
│   │       └── DeleteTicketUseCase.spec.ts
│   │
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   ├── llm/
│   │   │   │   ├── StubLLMClient.spec.ts
│   │   │   │   ├── OpenAILLMClient.spec.ts (con mocks)
│   │   │   │   └── GeminiLLMClient.spec.ts (con mocks)
│   │   │   └── persistence/
│   │   │       └── InMemoryTicketRepository.spec.ts
│   │   ├── utils/
│   │   │   └── RetryHandler.spec.ts
│   │   └── providers/
│   │       └── LlmProviderFactory.spec.ts
│   │
│   └── api/
│       ├── mappers/
│       │   └── TicketMapper.spec.ts
│       └── dtos/
│           ├── CreateTicketDto.spec.ts (validación)
│           └── UpdateTicketStatusDto.spec.ts (validación)
│
├── integration/                   # Tests con múltiples componentes
│   ├── controllers/
│   │   └── TicketsController.spec.ts
│   └── modules/
│       └── TicketsModule.spec.ts
│
└── e2e/                           # Tests end-to-end
    ├── tickets-crud.e2e-spec.ts
    ├── tickets-classification.e2e-spec.ts
    └── health-monitoring.e2e-spec.ts
```

---

## 🔧 Configuración de Jest

### 1. Instalar Dependencias

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @nestjs/testing \
  supertest \
  @types/supertest
```

### 2. `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.port.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@api/(.*)$': '<rootDir>/src/api/$1',
    '^@app/(.*)$': '<rootDir>/src/application/$1',
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@infra/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  verbose: true,
};
```

### 3. `test/setup.ts`

```typescript
// Setup global para tests
process.env.NODE_ENV = 'test';
process.env.LLM_PROVIDER = 'stub';
process.env.LOG_LEVEL = 'error'; // Solo errores en tests

// Mock de dotenv para tests
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));
```

### 4. Actualizar `package.json`

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./jest-e2e.config.js"
  }
}
```

---

## 📝 Ejemplos de Tests por Capa

### 1. Domain Layer - Ticket Entity

**`test/unit/domain/entities/Ticket.spec.ts`**

```typescript
import { Ticket } from '../../../../src/domain/entities/Ticket';

describe('Ticket Entity', () => {
  describe('create', () => {
    it('should create ticket with CRITICAL priority for high urgency (>0.75)', () => {
      const ticket = Ticket.create('Title', 'Description', 0.9);

      expect(ticket).toBeDefined();
      expect(ticket.id).toBeDefined();
      expect(ticket.title).toBe('Title');
      expect(ticket.description).toBe('Description');
      expect(ticket.status).toBe('OPEN');
      expect(ticket.priority).toBe('CRITICAL');
      expect(ticket.urgencyScore).toBe(0.9);
      expect(ticket.createdAt).toBeInstanceOf(Date);
      expect(ticket.updatedAt).toBeInstanceOf(Date);
    });

    it('should create ticket with HIGH priority for urgency 0.51-0.75', () => {
      const ticket = Ticket.create('Title', 'Description', 0.6);
      expect(ticket.priority).toBe('HIGH');
    });

    it('should create ticket with MEDIUM priority for urgency 0.26-0.50', () => {
      const ticket = Ticket.create('Title', 'Description', 0.4);
      expect(ticket.priority).toBe('MEDIUM');
    });

    it('should create ticket with LOW priority for urgency 0.00-0.25', () => {
      const ticket = Ticket.create('Title', 'Description', 0.2);
      expect(ticket.priority).toBe('LOW');
    });

    it('should create ticket with LOW priority for urgency score 0', () => {
      const ticket = Ticket.create('Title', 'Description', 0);
      expect(ticket.priority).toBe('LOW');
    });

    it('should create ticket with CRITICAL priority for urgency score 1', () => {
      const ticket = Ticket.create('Title', 'Description', 1);
      expect(ticket.priority).toBe('CRITICAL');
    });
  });

  describe('reclassify', () => {
    it('should update urgency score and recalculate priority', () => {
      const ticket = Ticket.create('Title', 'Description', 0.3);
      expect(ticket.priority).toBe('MEDIUM');
      expect(ticket.urgencyScore).toBe(0.3);

      const originalUpdatedAt = ticket.updatedAt;

      // Wait 1ms para asegurar que updatedAt cambie
      jest.advanceTimersByTime(1);

      ticket.reclassify(0.9);

      expect(ticket.urgencyScore).toBe(0.9);
      expect(ticket.priority).toBe('CRITICAL');
      expect(ticket.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should throw error for invalid urgency score > 1', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(() => ticket.reclassify(1.5)).toThrow('Urgency score must be between 0 and 1');
    });

    it('should throw error for invalid urgency score < 0', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(() => ticket.reclassify(-0.1)).toThrow('Urgency score must be between 0 and 1');
    });
  });

  describe('updateStatus', () => {
    it('should update ticket status', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      expect(ticket.status).toBe('OPEN');

      ticket.updateStatus('IN_PROGRESS');

      expect(ticket.status).toBe('IN_PROGRESS');
    });

    it('should update updatedAt when status changes', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      const originalUpdatedAt = ticket.updatedAt;

      jest.advanceTimersByTime(1);

      ticket.updateStatus('IN_PROGRESS');

      expect(ticket.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('close', () => {
    it('should set status to CLOSED', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      ticket.close();

      expect(ticket.status).toBe('CLOSED');
    });

    it('should update updatedAt when closing', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      const originalUpdatedAt = ticket.updatedAt;

      jest.advanceTimersByTime(1);

      ticket.close();

      expect(ticket.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('isClosed', () => {
    it('should return true for CLOSED tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      ticket.close();

      expect(ticket.isClosed()).toBe(true);
    });

    it('should return false for non-CLOSED tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(ticket.isClosed()).toBe(false);
    });
  });

  describe('isOpen', () => {
    it('should return true for OPEN tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(ticket.isOpen()).toBe(true);
    });

    it('should return false for non-OPEN tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);
      ticket.updateStatus('IN_PROGRESS');

      expect(ticket.isOpen()).toBe(false);
    });
  });

  describe('isCritical', () => {
    it('should return true for CRITICAL priority tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.9);

      expect(ticket.isCritical()).toBe(true);
    });

    it('should return false for non-CRITICAL priority tickets', () => {
      const ticket = Ticket.create('Title', 'Description', 0.5);

      expect(ticket.isCritical()).toBe(false);
    });
  });
});
```

### 2. Domain Services - StateTransitionValidator

**`test/unit/domain/services/StateTransitionValidator.spec.ts`**

```typescript
import { StateTransitionValidator } from '../../../../src/domain/services/StateTransitionValidator';
import { InvalidStateTransitionError } from '../../../../src/domain/errors/InvalidStateTransitionError';

describe('StateTransitionValidator', () => {
  describe('validate', () => {
    it('should allow OPEN → IN_PROGRESS', () => {
      expect(() => {
        StateTransitionValidator.validate('OPEN', 'IN_PROGRESS');
      }).not.toThrow();
    });

    it('should allow OPEN → RESOLVED', () => {
      expect(() => {
        StateTransitionValidator.validate('OPEN', 'RESOLVED');
      }).not.toThrow();
    });

    it('should allow OPEN → CLOSED', () => {
      expect(() => {
        StateTransitionValidator.validate('OPEN', 'CLOSED');
      }).not.toThrow();
    });

    it('should allow IN_PROGRESS → OPEN', () => {
      expect(() => {
        StateTransitionValidator.validate('IN_PROGRESS', 'OPEN');
      }).not.toThrow();
    });

    it('should allow IN_PROGRESS → RESOLVED', () => {
      expect(() => {
        StateTransitionValidator.validate('IN_PROGRESS', 'RESOLVED');
      }).not.toThrow();
    });

    it('should allow IN_PROGRESS → CLOSED', () => {
      expect(() => {
        StateTransitionValidator.validate('IN_PROGRESS', 'CLOSED');
      }).not.toThrow();
    });

    it('should allow RESOLVED → OPEN', () => {
      expect(() => {
        StateTransitionValidator.validate('RESOLVED', 'OPEN');
      }).not.toThrow();
    });

    it('should allow RESOLVED → CLOSED', () => {
      expect(() => {
        StateTransitionValidator.validate('RESOLVED', 'CLOSED');
      }).not.toThrow();
    });

    it('should allow CLOSED → OPEN (reopen)', () => {
      expect(() => {
        StateTransitionValidator.validate('CLOSED', 'OPEN');
      }).not.toThrow();
    });

    it('should throw InvalidStateTransitionError for RESOLVED → IN_PROGRESS', () => {
      expect(() => {
        StateTransitionValidator.validate('RESOLVED', 'IN_PROGRESS');
      }).toThrow(InvalidStateTransitionError);
    });

    it('should throw InvalidStateTransitionError for CLOSED → IN_PROGRESS', () => {
      expect(() => {
        StateTransitionValidator.validate('CLOSED', 'IN_PROGRESS');
      }).toThrow(InvalidStateTransitionError);
    });

    it('should throw InvalidStateTransitionError for CLOSED → RESOLVED', () => {
      expect(() => {
        StateTransitionValidator.validate('CLOSED', 'RESOLVED');
      }).toThrow(InvalidStateTransitionError);
    });

    it('should have correct error message', () => {
      expect(() => {
        StateTransitionValidator.validate('CLOSED', 'RESOLVED');
      }).toThrow('Invalid state transition from CLOSED to RESOLVED');
    });
  });

  describe('isValidTransition', () => {
    it('should return true for valid transitions', () => {
      expect(StateTransitionValidator.isValidTransition('OPEN', 'IN_PROGRESS')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
      expect(StateTransitionValidator.isValidTransition('CLOSED', 'OPEN')).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(StateTransitionValidator.isValidTransition('RESOLVED', 'IN_PROGRESS')).toBe(false);
      expect(StateTransitionValidator.isValidTransition('CLOSED', 'RESOLVED')).toBe(false);
    });
  });
});
```

### 3. Use Cases - CreateTicketUseCase

**`test/unit/application/use-cases/CreateTicketUseCase.spec.ts`**

```typescript
import { CreateTicketUseCase } from '../../../../src/application/use-cases/CreateTicketUseCase';
import { TicketRepositoryPort } from '../../../../src/application/ports/TicketRepositoryPort';
import { LLMClientPort } from '../../../../src/application/ports/LLMClientPort';
import { Ticket } from '../../../../src/domain/entities/Ticket';

describe('CreateTicketUseCase', () => {
  let useCase: CreateTicketUseCase;
  let mockRepository: jest.Mocked<TicketRepositoryPort>;
  let mockLLMClient: jest.Mocked<LLMClientPort>;

  beforeEach(() => {
    // Create mocks
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockLLMClient = {
      classifyUrgency: jest.fn(),
    };

    useCase = new CreateTicketUseCase(mockRepository, mockLLMClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create ticket with CRITICAL priority for high urgency score', async () => {
    // Arrange
    mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.9 });
    mockRepository.save.mockImplementation(async (ticket) => ticket);

    // Act
    const result = await useCase.execute({
      title: 'Production down',
      description: 'System is offline'
    });

    // Assert
    expect(mockLLMClient.classifyUrgency).toHaveBeenCalledWith({
      title: 'Production down',
      description: 'System is offline'
    });
    expect(result).toBeInstanceOf(Ticket);
    expect(result.title).toBe('Production down');
    expect(result.description).toBe('System is offline');
    expect(result.urgencyScore).toBe(0.9);
    expect(result.priority).toBe('CRITICAL');
    expect(result.status).toBe('OPEN');
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should create ticket with LOW priority for low urgency score', async () => {
    // Arrange
    mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.2 });
    mockRepository.save.mockImplementation(async (ticket) => ticket);

    // Act
    const result = await useCase.execute({
      title: 'Question about feature',
      description: 'How do I export data?'
    });

    // Assert
    expect(result.urgencyScore).toBe(0.2);
    expect(result.priority).toBe('LOW');
  });

  it('should create ticket with MEDIUM priority for medium urgency score', async () => {
    // Arrange
    mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.4 });
    mockRepository.save.mockImplementation(async (ticket) => ticket);

    // Act
    const result = await useCase.execute({
      title: 'Slow loading',
      description: 'Dashboard is slow'
    });

    // Assert
    expect(result.urgencyScore).toBe(0.4);
    expect(result.priority).toBe('MEDIUM');
  });

  it('should propagate LLM client errors', async () => {
    // Arrange
    const llmError = new Error('LLM API unavailable');
    mockLLMClient.classifyUrgency.mockRejectedValue(llmError);

    // Act & Assert
    await expect(
      useCase.execute({
        title: 'Test',
        description: 'Test description'
      })
    ).rejects.toThrow('LLM API unavailable');

    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should propagate repository errors', async () => {
    // Arrange
    mockLLMClient.classifyUrgency.mockResolvedValue({ urgencyScore: 0.5 });
    const repositoryError = new Error('Database connection failed');
    mockRepository.save.mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(
      useCase.execute({
        title: 'Test',
        description: 'Test description'
      })
    ).rejects.toThrow('Database connection failed');
  });
});
```

### 4. Infrastructure - RetryHandler

**`test/unit/infrastructure/utils/RetryHandler.spec.ts`**

```typescript
import { RetryHandler } from '../../../../src/infrastructure/utils/RetryHandler';

describe('RetryHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('withRetry', () => {
    it('should return result on first successful attempt', async () => {
      // Arrange
      const successFn = jest.fn().mockResolvedValue('success');

      // Act
      const result = await RetryHandler.withRetry(successFn, {
        maxRetries: 3,
        initialDelayMs: 1000,
        timeoutMs: 5000
      });

      // Assert
      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      // Arrange
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('503: Service Unavailable'))
        .mockRejectedValueOnce(new Error('503: Service Unavailable'))
        .mockResolvedValue('success');

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 1000,
        timeoutMs: 5000
      });

      // Advance timers for retries
      await jest.advanceTimersByTimeAsync(1000); // First retry delay
      await jest.advanceTimersByTimeAsync(2000); // Second retry delay (exponential backoff)

      const result = await promise;

      // Assert
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries exceeded', async () => {
      // Arrange
      const error = new Error('503: Service Unavailable');
      const fn = jest.fn().mockRejectedValue(error);

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 2,
        initialDelayMs: 100,
        timeoutMs: 5000
      });

      // Advance timers
      await jest.advanceTimersByTimeAsync(100); // First retry
      await jest.advanceTimersByTimeAsync(200); // Second retry

      // Assert
      await expect(promise).rejects.toThrow('503: Service Unavailable');
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should not retry non-retryable errors', async () => {
      // Arrange
      const error = new Error('Invalid input');
      const fn = jest.fn().mockRejectedValue(error);

      // Act & Assert
      await expect(
        RetryHandler.withRetry(fn, {
          maxRetries: 3,
          initialDelayMs: 1000,
          timeoutMs: 5000
        })
      ).rejects.toThrow('Invalid input');

      expect(fn).toHaveBeenCalledTimes(1); // No retries for non-retryable errors
    });

    it('should timeout if operation takes too long', async () => {
      // Arrange
      const fn = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

      // Act
      const promise = RetryHandler.withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 1000,
        timeoutMs: 2000
      });

      jest.advanceTimersByTime(2000);

      // Assert
      await expect(promise).rejects.toThrow('Operation timed out after 2000ms');
    });
  });
});
```

### 5. E2E Tests - Tickets CRUD

**`test/e2e/tickets-crud.e2e-spec.ts`**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Tickets CRUD (e2e)', () => {
  let app: INestApplication;
  let createdTicketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/tickets (POST)', () => {
    it('should create a new ticket with CRITICAL priority', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Production server down',
          description: 'The entire production system is offline'
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Production server down');
          expect(res.body.status).toBe('OPEN');
          expect(res.body.priority).toMatch(/LOW|MEDIUM|HIGH|CRITICAL/);
          expect(res.body.urgencyScore).toBeGreaterThanOrEqual(0);
          expect(res.body.urgencyScore).toBeLessThanOrEqual(1);
          
          createdTicketId = res.body.id;
        });
    });

    it('should reject ticket with title too short', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Hi',
          description: 'This should fail validation'
        })
        .expect(400);
    });

    it('should reject ticket with description too short', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tickets')
        .send({
          title: 'Valid title',
          description: 'Short'
        })
        .expect(400);
    });
  });

  describe('/api/v1/tickets (GET)', () => {
    it('should return list of tickets', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should filter tickets by status', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets?status=OPEN')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((ticket: any) => {
            expect(ticket.status).toBe('OPEN');
          });
        });
    });

    it('should filter tickets by priority', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets?priority=CRITICAL')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/api/v1/tickets/:id (GET)', () => {
    it('should return ticket by ID', () => {
      return request(app.getHttpServer())
        .get(`/api/v1/tickets/${createdTicketId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdTicketId);
        });
    });

    it('should return 404 for non-existent ticket', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tickets/non-existent-id')
        .expect(404);
    });
  });

  describe('/api/v1/tickets/:id/status (PATCH)', () => {
    it('should update ticket status', () => {
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${createdTicketId}/status`)
        .send({ status: 'IN_PROGRESS' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('IN_PROGRESS');
        });
    });

    it('should reject invalid status transition', () => {
      // First, close the ticket
      return request(app.getHttpServer())
        .patch(`/api/v1/tickets/${createdTicketId}/status`)
        .send({ status: 'CLOSED' })
        .then(() => {
          // Try invalid transition: CLOSED → RESOLVED
          return request(app.getHttpServer())
            .patch(`/api/v1/tickets/${createdTicketId}/status`)
            .send({ status: 'RESOLVED' })
            .expect(400);
        });
    });
  });

  describe('/api/v1/tickets/:id (DELETE)', () => {
    it('should delete ticket', () => {
      return request(app.getHttpServer())
        .delete(`/api/v1/tickets/${createdTicketId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.deleted).toBe(true);
          expect(res.body.id).toBe(createdTicketId);
        });
    });

    it('should return 404 when deleting non-existent ticket', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/tickets/non-existent-id')
        .expect(404);
    });
  });
});
```

---

## 📊 Coverage Target por Capa

| Capa | Files | Target | Prioridad |
|------|-------|--------|-----------|
| **Domain** | 5 | 95%+ | 🔴 Crítica |
| **Application** | 8 | 90%+ | 🔴 Crítica |
| **Infrastructure** | 10 | 75%+ | 🟡 Alta |
| **API** | 5 | 80%+ | 🟡 Alta |

---

## 🎯 Plan de Implementación

### Fase 1: Domain Layer (2 días)
- [x] Configurar Jest
- [ ] Tests para Ticket entity (6 tests)
- [ ] Tests para StateTransitionValidator (12 tests)
- [ ] Tests para Domain Errors (4 tests)
- **Target: 95% coverage domain**

### Fase 2: Application Layer (3 días)
- [ ] Tests para todos los Use Cases (35+ tests)
- [ ] Mocks de repositories y LLM clients
- **Target: 90% coverage application**

### Fase 3: Infrastructure Layer (2 días)
- [ ] Tests para RetryHandler (8 tests)
- [ ] Tests para InMemoryRepository (10 tests)
- [ ] Tests para LlmProviderFactory (5 tests)
- [ ] Tests para LLM clients con mocks (15 tests)
- **Target: 75% coverage infrastructure**

### Fase 4: Integration & E2E (2 días)
- [ ] Integration tests para Controllers (15 tests)
- [ ] E2E tests completos (25 tests)
- **Target: 80% coverage API**

### Fase 5: Validación Final (1 día)
- [ ] Verificar coverage >= 80%
- [ ] Documentar tests
- [ ] CI/CD integration

**Total: ~10 días de desarrollo**

---

## 🚀 Comandos de Testing

```bash
# Run all tests
npm test

# Watch mode (desarrollo)
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e

# Debug tests
npm run test:debug

# Run specific test file
npm test -- Ticket.spec.ts

# Run tests with pattern
npm test -- --testNamePattern="should create ticket"
```

---

## 📈 Métricas de Éxito

- ✅ **Coverage >= 80%** en todas las capas
- ✅ **100+ tests** implementados
- ✅ **0 tests fallando** en CI/CD
- ✅ **< 5s** tiempo de ejecución tests unitarios
- ✅ **< 30s** tiempo de ejecución tests E2E

---

**Autor:** Juan Facundo Bazan Alvarez  
**Proyecto:** TicketFlow Testing Strategy  
**Versión:** 1.0.0  
**Fecha:** Octubre 2025


