// Setup global para tests
process.env.NODE_ENV = 'test';
process.env.LLM_PROVIDER = 'stub';
process.env.LOG_LEVEL = 'error'; // Solo errores en tests
process.env.PORT = '3001'; // Puerto diferente para tests

// Mock de dotenv para tests
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
};

