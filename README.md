# TicketFlow - Smart Ticket Management API

Sistema de gestión inteligente de tickets con clasificación automática de prioridad mediante IA (OpenAI/Gemini), arquitectura hexagonal limpia y documentación Swagger completa.

## 📋 Requisitos
- Node.js v18+
- npm

## 🚀 Instalación y Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu OPENAI_API_KEY o GEMINI_API_KEY

# Iniciar en modo desarrollo
npm run start:dev

# Compilar para producción
npm run build
npm start
```

## 🎯 Endpoints Disponibles

### Monitoreo y Salud
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/tickets/health` | Health check endpoint (estado del servicio) |
| GET | `/api/v1/tickets/debug` | Variables de entorno (solo desarrollo) |

### Gestión de Tickets
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/tickets` | Crear ticket con clasificación AI |
| GET | `/api/v1/tickets` | Listar tickets (con filtros opcionales) |
| GET | `/api/v1/tickets/:id` | Obtener ticket por ID |
| PATCH | `/api/v1/tickets/:id/status` | Actualizar estado del ticket |
| POST | `/api/v1/tickets/:id/reclassify` | Re-clasificar urgencia con AI |
| PATCH | `/api/v1/tickets/:id/close` | Cerrar ticket |
| DELETE | `/api/v1/tickets/:id` | Eliminar ticket |

### 📚 Documentación

- **📖 Índice Completo**: `DOCS_INDEX.md` - **Empieza aquí** para navegar toda la documentación
- **Swagger UI**: `http://localhost:3000/docs` - Documentación interactiva OpenAPI
- **Postman Collection**: `postman_collection.json` - Colección completa con 40+ requests
- **Ejemplos Simples**: `EJEMPLOS_TICKETS.md` - 3 ejemplos rápidos (LOW, MEDIUM, CRITICAL)


## 🔧 Ejemplos de Uso

### Crear Ticket
```bash
curl -X POST http://localhost:3000/api/v1/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Payment issue",
    "description": "Customer cannot complete the payment process"
  }'
```

### Listar Tickets con Filtros
```bash
# Todos los tickets
curl http://localhost:3000/api/v1/tickets

# Filtrar por estado
curl "http://localhost:3000/api/v1/tickets?status=OPEN"

# Filtrar por prioridad
curl "http://localhost:3000/api/v1/tickets?priority=CRITICAL"
```

### Obtener Ticket por ID
```bash
curl http://localhost:3000/api/v1/tickets/{id}
```

### Actualizar Estado
```bash
curl -X PATCH http://localhost:3000/api/v1/tickets/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

### Re-clasificar con AI
```bash
curl -X POST http://localhost:3000/api/v1/tickets/{id}/reclassify
```

### Cerrar Ticket
```bash
curl -X PATCH http://localhost:3000/api/v1/tickets/{id}/close
```

### Eliminar Ticket
```bash
curl -X DELETE http://localhost:3000/api/v1/tickets/{id}
```

### Health Check
```bash
curl http://localhost:3000/api/v1/tickets/health
```

### Debug (solo desarrollo)
```bash
curl http://localhost:3000/api/v1/tickets/debug
```

## ⚙️ Variables de Entorno

Edita `.env` según el provider de LLM:

```env
PORT=3000
NODE_ENV=development          # development | production
LOG_LEVEL=info                # debug | info | warn | error
LLM_PROVIDER=stub             # stub | openai | gemini
OPENAI_API_KEY=               # Tu clave de OpenAI
GEMINI_API_KEY=               # Tu clave de Gemini
```

### Providers LLM Disponibles:
- **`stub`**: Heurística simple basada en keywords (no requiere API key)
- **`openai`**: Clasificación con OpenAI GPT-3.5 (requiere `OPENAI_API_KEY`)
- **`gemini`**: Clasificación con Google Gemini (requiere `GEMINI_API_KEY`)

## 🏗️ Arquitectura Hexagonal

```
src/
├── api/                    # Capa de presentación
│   ├── controllers/        # Controladores REST
│   ├── dtos/              # Data Transfer Objects
│   ├── mappers/           # Mapeo de entidades a DTOs
│   └── swagger/           # Configuración Swagger
├── application/           # Capa de aplicación
│   ├── use-cases/         # Casos de uso (lógica de negocio)
│   └── ports/             # Interfaces (puertos)
├── domain/                # Capa de dominio
│   ├── entities/          # Entidades del dominio
│   ├── services/          # Servicios de dominio
│   └── errors/            # Errores de dominio
└── infrastructure/        # Capa de infraestructura
    ├── adapters/          # Implementaciones de puertos
    │   ├── persistence/   # Repositorio en memoria
    │   ├── llm/          # Adapters para LLMs
    │   └── http/         # Filtros y middlewares
    ├── interceptors/      # Interceptores NestJS
    ├── logger/            # Configuración de logging
    ├── providers/         # Factories y providers
    └── utils/             # Utilidades (retry, etc.)
```

### Principios Arquitectónicos:
- ✅ **Desacoplamiento total**: Dominio independiente de frameworks
- ✅ **Inversión de dependencias**: Abstracciones mediante ports
- ✅ **Fácil testing**: Use cases aislados y testeables
- ✅ **Intercambiabilidad**: Cambiar LLM o persistencia sin alterar lógica
- ✅ **Encapsulación**: Reglas de negocio protegidas en entidades
- ✅ **Excepciones de Dominio**: Application layer independiente de NestJS
- ✅ **Resiliencia**: Retry logic y timeouts en adaptadores externos

## 📊 Modelo de Dominio

### Ticket Entity
```typescript
{
  id: string (UUID)
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  urgencyScore: number (0.0 - 1.0)
  createdAt: Date
  updatedAt: Date
}
```

### Reglas de Negocio:
- **Score → Priority mapping**:
  - 0.00-0.25 → LOW
  - 0.26-0.50 → MEDIUM
  - 0.51-0.75 → HIGH
  - 0.76-1.00 → CRITICAL

- **Transiciones de Estado Válidas**:
  - OPEN → IN_PROGRESS, RESOLVED, CLOSED
  - IN_PROGRESS → OPEN, RESOLVED, CLOSED
  - RESOLVED → OPEN, CLOSED
  - CLOSED → OPEN (reapertura)

## 🔌 Extensibilidad

### Agregar Nuevo Provider LLM
1. Crear adapter en `src/infrastructure/adapters/llm/`
2. Implementar `LLMClientPort`
3. Registrar en `LlmProviderFactory`
4. Configurar en `.env`

### Cambiar Persistencia
1. Implementar `TicketRepositoryPort`
2. Registrar en `TicketsModule`
3. Sin cambios en dominio ni casos de uso

## 🧪 Testing (Próxima Fase)

Estructura preparada para:
- Unit tests de domain y use cases
- Integration tests con repositorio in-memory
- E2E tests de API

## 🛠️ Stack Tecnológico

- **Framework**: NestJS 10
- **Lenguaje**: TypeScript 5
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI
- **Logging**: Pino + nestjs-pino (JSON estructurado, correlationId, metadata)
- **Rate Limiting**: @nestjs/throttler
- **LLM**: OpenAI GPT-3.5-turbo / Google Gemini 2.0 Flash Lite
- **Persistencia**: In-Memory (Map Singleton) - fácil migrar a DB
- **Resiliencia**: Retry handler con exponential backoff y timeout

## 📊 Sistema de Logging Estructurado

### Características
- **Formato JSON** en producción para integración con herramientas de monitoreo
- **Pretty-print** en desarrollo con colores y formato legible
- **CorrelationId** automático en cada request para trazabilidad
- **Niveles de log**: debug, info, warn, error
- **Metadata contextual** en cada log (provider, status, IDs, etc.)

### Formato de Log

**Desarrollo:**
```
2025-10-22 14:35:45.123 INFO  [support-tickets-api] [OpenAILLMClient] Urgency classification completed
    correlationId: 42e1a5f7-8d7a-431c-8f7a-b9cfdb43e51f
    urgencyScore: 0.85
```

**Producción (JSON):**
```json
{
  "level": "info",
  "time": "2025-10-22T14:35:45.123Z",
  "service": "support-tickets-api",
  "context": "OpenAILLMClient",
  "msg": "Urgency classification completed",
  "correlationId": "42e1a5f7-8d7a-431c-8f7a-b9cfdb43e51f",
  "metadata": {
    "urgencyScore": 0.85,
    "provider": "openai"
  }
}
```

### Integración con Herramientas de Monitoreo
Compatible con:
- ElasticSearch + Kibana (ELK Stack)
- Datadog
- AWS CloudWatch
- Google Cloud Logging
- Grafana Loki
- New Relic
- Splunk

### Configuración
- `LOG_LEVEL=debug`: Logs detallados incluyendo requests/responses
- `LOG_LEVEL=info`: Eventos importantes de negocio
- `LOG_LEVEL=warn`: Situaciones anómalas sin fallo
- `LOG_LEVEL=error`: Solo errores críticos

## 📝 Notas de Desarrollo

- El repositorio in-memory se resetea al reiniciar el servidor
- Los logs estructurados incluyen correlationId para tracing
- El filtro global de errores formatea todas las excepciones
- Validación automática de DTOs con class-validator
- Swagger UI incluye ejemplos para cada endpoint

---

## 👨‍💻 Autor

**Juan Facundo Bazan Alvarez**  
*Sr Backend Developer Node  | Software Architect*

Este proyecto fue desarrollado con arquitectura hexagonal limpia, desacoplada y lista para producción.

---

© 2025 Juan Facundo Bazan Alvarez. Todos los derechos reservados.

