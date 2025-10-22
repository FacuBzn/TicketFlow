# 🎯 Ejemplos Simples de Tickets por Prioridad

## 📋 Cómo Usar Estos Ejemplos

1. Copia el JSON del ejemplo
2. Abre Postman
3. Crea una request POST a `http://localhost:3000/api/v1/tickets`
4. Pega el JSON en el Body (raw, tipo JSON)
5. Envía la request
6. Observa el `urgencyScore` y `priority` en la respuesta

---

## 🔴 Ejemplo 1: Ticket CRITICAL

### Caso: Sistema Caído

**Request Body:**
```json
{
  "title": "Production server down urgent",
  "description": "The entire production system is offline and all customers are unable to access our services. This is causing major revenue loss and customer complaints."
}
```

**Respuesta Esperada:**
```json
{
  "id": "abc-123-def-456",
  "title": "Production server down urgent",
  "description": "The entire production system is offline and all customers are unable to access our services. This is causing major revenue loss and customer complaints.",
  "status": "OPEN",
  "priority": "CRITICAL",
  "urgencyScore": 0.9,
  "createdAt": "2025-10-22T14:30:00.000Z",
  "updatedAt": "2025-10-22T14:30:00.000Z"
}
```

**Por qué es CRITICAL:**
- ✅ Palabras clave: "down", "urgent", "offline", "loss"
- ✅ Impacto: Todos los clientes afectados
- ✅ Severidad: Sistema productivo caído
- ✅ UrgencyScore esperado: 0.85 - 1.0

---

## 🟡 Ejemplo 2: Ticket MEDIUM

### Caso: Rendimiento Lento

**Request Body:**
```json
{
  "title": "Slow page loading",
  "description": "Some users are reporting that the dashboard page is loading slower than usual. It's affecting user experience but the system is still operational."
}
```

**Respuesta Esperada:**
```json
{
  "id": "xyz-789-uvw-012",
  "title": "Slow page loading",
  "description": "Some users are reporting that the dashboard page is loading slower than usual. It's affecting user experience but the system is still operational.",
  "status": "OPEN",
  "priority": "MEDIUM",
  "urgencyScore": 0.45,
  "createdAt": "2025-10-22T14:31:00.000Z",
  "updatedAt": "2025-10-22T14:31:00.000Z"
}
```

**Por qué es MEDIUM:**
- ✅ Problema existe pero no es crítico
- ✅ Sistema sigue operacional
- ✅ Afecta experiencia pero no bloquea uso
- ✅ UrgencyScore esperado: 0.26 - 0.75

---

## 🟢 Ejemplo 3: Ticket LOW

### Caso: Consulta Simple

**Request Body:**
```json
{
  "title": "Question about feature",
  "description": "I would like to know how to export my data to CSV format. Can you provide some documentation or help on this topic?"
}
```

**Respuesta Esperada:**
```json
{
  "id": "qrs-345-tuv-678",
  "title": "Question about feature",
  "description": "I would like to know how to export my data to CSV format. Can you provide some documentation or help on this topic?",
  "status": "OPEN",
  "priority": "LOW",
  "urgencyScore": 0.2,
  "createdAt": "2025-10-22T14:32:00.000Z",
  "updatedAt": "2025-10-22T14:32:00.000Z"
}
```

**Por qué es LOW:**
- ✅ Palabras clave: "question", "help", "documentation"
- ✅ No hay urgencia
- ✅ Solo consulta informativa
- ✅ No hay impacto en el sistema
- ✅ UrgencyScore esperado: 0.0 - 0.25

---

## 🧪 Verificar que Funcionan Correctamente

### Paso 1: Crear los 3 Tickets
Ejecuta estas 3 requests en Postman (una por una):

1. POST el ejemplo CRITICAL
2. POST el ejemplo MEDIUM  
3. POST el ejemplo LOW

### Paso 2: Listar Todos los Tickets
```
GET http://localhost:3000/api/v1/tickets
```

Deberías ver los 3 tickets con diferentes prioridades.

### Paso 3: Filtrar por Prioridad

**Ver solo CRITICAL:**
```
GET http://localhost:3000/api/v1/tickets?priority=CRITICAL
```
Resultado: Solo el ticket "Production server down urgent"

**Ver solo MEDIUM:**
```
GET http://localhost:3000/api/v1/tickets?priority=MEDIUM
```
Resultado: Solo el ticket "Slow page loading"

**Ver solo LOW:**
```
GET http://localhost:3000/api/v1/tickets?priority=LOW
```
Resultado: Solo el ticket "Question about feature"

---

## 🔍 Observar los Logs del Servidor

Mientras creas cada ticket, observa la terminal donde corre `npm run start:dev`:

```bash
[2025-10-22 20:15:33.758 +0000] INFO: Processing ticket classification {"context":"GeminiLLMClient","provider":"gemini"}
[2025-10-22 20:15:35.316 +0000] INFO: Urgency classification completed {"context":"GeminiLLMClient","model":"gemini-2.0-flash-lite","urgencyScore":0.9}
[2025-10-22 20:15:35.317 +0000] INFO: Operation completed successfully {"context":"LoggingInterceptor","operation":"CREATE_TICKET","durationMs":1564,"responseType":"single"}
```

**Características del Logging:**
- ✅ Formato JSON estructurado en producción
- ✅ Pretty-print con colores en desarrollo
- ✅ CorrelationId único por request
- ✅ Metadata contextual (provider, urgencyScore, duration, operation)
- ✅ Compatible con ElasticSearch, Datadog, CloudWatch, Grafana Loki

---

## 📊 Tabla Resumen de los 3 Ejemplos

| Título | Palabras Clave | UrgencyScore | Priority | Status |
|--------|---------------|--------------|----------|--------|
| Production server down urgent | down, urgent, offline, loss | ~0.9 | CRITICAL | OPEN |
| Slow page loading | slow, affecting, operational | ~0.45 | MEDIUM | OPEN |
| Question about feature | question, help, documentation | ~0.2 | LOW | OPEN |

---

## 🎓 Entendiendo la Clasificación de IA

### Mapeo UrgencyScore → Priority

El sistema usa estas reglas (ver `UrgencyPriorityMapper.ts`):

```typescript
if (score <= 0.25) return 'LOW';
if (score <= 0.5)  return 'MEDIUM';
if (score <= 0.75) return 'HIGH';
return 'CRITICAL';
```

### Factores que OpenAI Considera:

1. **Impacto en el negocio**
   - Pérdida de dinero → Mayor urgencia
   - Clientes afectados → Mayor urgencia

2. **Severidad técnica**
   - Sistema caído → CRITICAL
   - Lentitud → MEDIUM
   - Consulta → LOW

3. **Palabras clave de urgencia**
   - "urgent", "critical", "down", "offline" → Alta
   - "slow", "issue", "problem" → Media
   - "question", "help", "info" → Baja

4. **Seguridad**
   - "security", "breach", "vulnerability" → CRITICAL

---

## ✅ Checklist Rápido

### Tickets CRUD
- [ ] Crear ticket CRITICAL y verificar `priority: "CRITICAL"`
- [ ] Crear ticket MEDIUM y verificar `priority: "MEDIUM"`
- [ ] Crear ticket LOW y verificar `priority: "LOW"`
- [ ] Filtrar `GET /tickets?priority=CRITICAL` - debe retornar 1 ticket
- [ ] Filtrar `GET /tickets?priority=MEDIUM` - debe retornar 1 ticket
- [ ] Filtrar `GET /tickets?priority=LOW` - debe retornar 1 ticket
- [ ] Listar todos `GET /tickets` - debe retornar 3 tickets

### Endpoints de Monitoreo
- [ ] Health check `GET /api/v1/tickets/health` - debe retornar status "ok"
- [ ] Debug endpoint `GET /api/v1/tickets/debug` (solo desarrollo)

### Nuevas Características Implementadas
- [x] Logging estructurado con Pino (JSON + pretty-print)
- [x] CorrelationId en cada request
- [x] Rate limiting global (10 req/s, 100 req/min, 500 req/15min)
- [x] Retry logic con exponential backoff en LLM clients
- [x] Timeout de 15 segundos en llamadas LLM
- [x] Mapeo de excepciones de dominio a HTTP
- [x] Endpoint de health check
- [x] Endpoint de debug protegido (404 en producción)
- [x] InMemoryRepository como Singleton
- [x] Encapsulación de reglas de negocio en entidad Ticket

---

## 🚀 Siguiente Paso

Una vez verificados estos 3 tickets básicos, puedes probar:

1. **Actualizar el estado** de alguno de ellos
2. **Re-clasificar** uno de los tickets
3. **Cerrar** uno de los tickets
4. **Eliminar** uno de los tickets

Consulta `POSTMAN_GUIDE.md` para escenarios completos de todos los endpoints.

---

¡Listo para probar! 🎉

