# 🧪 Testing Commands Reference - TicketFlow

## 📋 Comandos Principales

### Ejecutar Tests

```bash
# Todos los tests (unit + e2e)
npm test

# Solo tests unitarios (recomendado para desarrollo)
npm test -- --testPathIgnorePatterns=e2e

# Solo tests E2E
npm run test:e2e

# Modo watch (auto-rerun on changes)
npm run test:watch
```

### Coverage Reports

```bash
# Coverage completo
npm run test:cov

# Coverage solo unitarios
npm run test:cov -- --testPathIgnorePatterns=e2e

# Coverage con resumen
npm test -- --coverage --coverageReporters=text-summary

# Ver reporte HTML (abre en navegador)
npm run test:cov
# Luego abre: coverage/lcov-report/index.html
```

### Tests Específicos

```bash
# Ejecutar un archivo específico
npm test -- Ticket.spec.ts
npm test -- CreateTicketUseCase.spec.ts

# Ejecutar por patrón de nombre
npm test -- --testNamePattern="should create ticket"
npm test -- --testNamePattern="CRITICAL"

# Ejecutar tests de una carpeta
npm test -- test/unit/domain
npm test -- test/unit/application/use-cases
```

### Debug Tests

```bash
# Debug mode
npm run test:debug

# Verbose output
npm test -- --verbose

# Show individual test results
npm test -- --verbose --expand
```

### CI/CD Commands

```bash
# Build + Test (para CI)
npm run build && npm test

# Coverage con threshold check
npm run test:cov

# Test con timeout específico
npm test -- --testTimeout=30000
```

---

## 📊 Estado Actual del Proyecto

### ✅ Coverage: 100% / 94.82% / 100% / 100%

```
=============================== Coverage summary ===============================
Statements   : 100% ( 167/167 )
Branches     : 94.82% ( 55/58 )
Functions    : 100% ( 41/41 )
Lines        : 100% ( 156/156 )
================================================================================
```

### ✅ Tests: 159 / 159 PASANDO

```
Test Suites: 14 passed, 14 total
Tests:       159 passed, 159 total
Snapshots:   0 total
Time:        ~12 seconds
```

### 📁 Archivos de Test

- **Unit Tests**: 14 archivos, 159 tests
- **E2E Tests**: 2 archivos, 40+ tests
- **Total**: 16 archivos de test

---

## 🎯 Quick Reference

### Por Capa

```bash
# Domain Layer
npm test -- test/unit/domain

# Application Layer
npm test -- test/unit/application

# Infrastructure Layer
npm test -- test/unit/infrastructure

# API Layer
npm test -- test/unit/api
```

### Por Tipo

```bash
# Entities
npm test -- Ticket.spec.ts

# Use Cases
npm test -- test/unit/application/use-cases

# Services
npm test -- StateTransitionValidator.spec.ts

# Errors
npm test -- test/unit/domain/errors

# Adapters
npm test -- test/unit/infrastructure/adapters
```

---

## 🔧 Configuración

### jest.config.js

- **Preset**: ts-jest
- **Test Environment**: node
- **Roots**: `<rootDir>/test`
- **Coverage Threshold**: 80% (todas las métricas)
- **Setup**: `test/setup.ts`
- **Timeout**: 30000ms

### test/setup.ts

- **NODE_ENV**: test
- **LLM_PROVIDER**: stub (para tests)
- **LOG_LEVEL**: error (solo errores)
- **Console mocks**: log, debug, info, warn

---

## 📈 Performance

| Operación | Tiempo | Estado |
|-----------|--------|--------|
| All tests | ~12s | ✅ Rápido |
| Unit tests only | ~11s | ✅ Rápido |
| E2E tests | ~8s | ✅ Rápido |
| Coverage report | +1s | ✅ Aceptable |

---

## 🚨 Troubleshooting

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache

# Update snapshots (si usas)
npm test -- -u

# Run specific failing test
npm test -- failing-test.spec.ts --verbose
```

### Coverage Issues

```bash
# Regenerate coverage
rm -rf coverage && npm run test:cov

# Check which files are not covered
npm run test:cov -- --collectCoverageFrom='src/**/*.ts'
```

### E2E Tests Issues

```bash
# Ensure server is not running
# E2E tests start their own instance

# Check ports
netstat -an | grep 3000

# Run with debug
npm run test:e2e -- --verbose
```

---

## 📚 Documentación Relacionada

- **TESTING_STRATEGY.md**: Estrategia completa de testing
- **TESTING_SUMMARY.md**: Resumen ejecutivo con todos los detalles
- **README.md**: Sección de testing actualizada
- **Code Review**: Recomendaciones de testing

---

## ✨ Best Practices

### Antes de Commit

```bash
# 1. Run tests
npm test

# 2. Check coverage
npm run test:cov

# 3. Build
npm run build

# 4. Lint (cuando esté configurado)
npm run lint
```

### Durante Desarrollo

```bash
# Usar watch mode
npm run test:watch

# Tests específicos mientras desarrollas
npm test -- MyFeature.spec.ts --watch
```

### Antes de Deploy

```bash
# Full suite
npm run build && npm test && npm run test:cov

# Verificar threshold
# Coverage debe ser >= 80% en todas las métricas
```

---

## 🎓 Tips

1. **Tests Lentos?** → Usa `--testPathIgnorePatterns=e2e` para desarrollo
2. **Debugging?** → Usa `--verbose` o `--expand` para más detalle
3. **CI/CD?** → Usa `--ci` flag para Jest en pipelines
4. **Snapshots?** → Usa `-u` para actualizarlos cuando cambies la API
5. **Parallel?** → Jest ya ejecuta en paralelo por defecto

---

**Autor:** Juan Facundo Bazan Alvarez  
**Proyecto:** TicketFlow  
**Versión:** 1.2.0  
**Última Actualización:** Octubre 2025

