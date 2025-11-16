# Asistente IA - Implementación con Backend REST

Este documento describe la implementación del Asistente IA para la aplicación de gastos usando un backend REST separado.

## 📋 Resumen

La implementación del Asistente IA está **completa en el frontend** y lista para conectarse con un backend REST que tú implementes.

### ✅ Lo que YA está implementado (Frontend)

1. **Vista del Asistente IA** (`src/components/asistente/AsistenteIA.tsx`)
   - Interfaz de chat moderna y responsive
   - Mensaje de bienvenida con preguntas sugeridas
   - Historial de conversación
   - Indicadores de carga
   - Auto-scroll
   - Dark mode compatible

2. **Servicio de IA** (`src/services/ai.ts`)
   - Llamadas REST al backend
   - Autenticación con Firebase Token
   - Manejo de errores completo
   - Preparación de contexto del usuario
   - Validación de mensajes

3. **Hook personalizado** (`src/hooks/useAssistant.ts`)
   - Gestión del estado de la conversación
   - Manejo de mensajes
   - Loading states
   - Error handling

4. **Rutas configuradas** (`src/App.tsx`)
   - Ruta `/asistente` activa
   - Lazy loading del componente
   - Protección de ruta (solo usuarios autenticados)

## 🔧 Configuración del Frontend

### 1. Variables de Entorno

Actualiza tu archivo `.env`:

```bash
# URL de tu backend API
VITE_API_BASE_URL=http://localhost:3000/api

# O en producción:
# VITE_API_BASE_URL=https://tu-backend.com/api
```

### 2. ¡Listo!

El frontend ya está configurado. Solo necesita que implementes el backend.

## 🚀 Implementar el Backend

### Endpoint Requerido

El frontend llama a:

```
POST /api/assistant/chat
```

### Documentación Completa

Consulta **`BACKEND_API_SPEC.md`** para:
- ✅ Especificación completa del endpoint
- ✅ Formato de request y response
- ✅ Autenticación con Firebase
- ✅ Manejo de errores
- ✅ Rate limiting
- ✅ Ejemplo completo de implementación (Node.js + Express)
- ✅ Tipos de datos TypeScript
- ✅ Variables de entorno necesarias

## 📊 Esquema Rápido de la API

### Request

```http
POST /api/assistant/chat
Authorization: Bearer <firebase_id_token>
Content-Type: application/json

{
  "message": "¿Cómo van mis gastos este mes?",
  "context": {
    "gastos": [...],      // Array de gastos del mes
    "presupuestos": [...], // Array de presupuestos
    "mes": "2024-11"      // Mes actual
  },
  "conversationHistory": [...] // Historial previo (opcional)
}
```

### Response

```json
{
  "success": true,
  "message": "Respuesta del asistente IA...",
  "usage": {
    "inputTokens": 1250,
    "outputTokens": 180
  }
}
```

## 🛠️ Stack Tecnológico Recomendado para el Backend

### Opción 1: Node.js + Express (Recomendado)

```bash
npm install express @anthropic-ai/sdk firebase-admin express-rate-limit cors helmet
```

**Pros:**
- Mismo lenguaje que el frontend (JavaScript/TypeScript)
- Documentación completa incluida en `BACKEND_API_SPEC.md`
- Fácil integración con Firebase Admin SDK

### Opción 2: Python + FastAPI

```bash
pip install fastapi anthropic firebase-admin uvicorn python-dotenv
```

**Pros:**
- Excelente para procesamiento de datos
- FastAPI tiene validación automática de datos
- Anthropic tiene SDK oficial de Python

### Opción 3: Cualquier otro framework

El backend puede estar en cualquier lenguaje/framework siempre que:
- ✅ Pueda verificar Firebase ID Tokens
- ✅ Pueda llamar a la API de Anthropic
- ✅ Devuelva las respuestas en el formato especificado

## 📂 Estructura del Proyecto (Frontend)

```
src/
├── components/
│   └── asistente/
│       └── AsistenteIA.tsx      # Vista del chat
├── hooks/
│   └── useAssistant.ts          # Hook para el asistente
├── services/
│   └── ai.ts                    # Servicio de llamadas a la API
└── types/
    └── index.ts                 # Tipos compartidos
```

## 🎯 Próximos Pasos

### Para el Desarrollador del Backend

1. **Lee `BACKEND_API_SPEC.md`** - Contiene todo lo necesario
2. **Configura tu backend:**
   - Firebase Admin SDK para verificar tokens
   - Anthropic SDK para la IA
   - Rate limiting (30 req/min por usuario)
3. **Implementa el endpoint** `/api/assistant/chat`
4. **Testing:**
   - Verifica que la autenticación funcione
   - Prueba con diferentes mensajes
   - Verifica rate limiting
5. **Deploy** y actualiza `VITE_API_BASE_URL` en el frontend

### Para Testing Local

1. Levanta tu backend en `http://localhost:3000`
2. El frontend ya está configurado para conectarse ahí
3. Ve a `/asistente` en la app
4. ¡Prueba el chat!

## 🔐 Seguridad

### ✅ Implementado en el Frontend

- Envío de Firebase ID Token en cada request
- Validación de mensajes (max 1000 caracteres)
- Manejo de errores de autenticación
- HTTPS en producción (configurar en deployment)

### ⚠️ Debes Implementar en el Backend

- Verificación del Firebase ID Token
- Rate limiting (recomendado: 30 req/min por usuario)
- Validación de entrada de datos
- CORS configurado correctamente
- API Key de Anthropic en variables de entorno (NUNCA en el código)

## 💰 Costos Estimados

### Anthropic API (Claude 3.5 Sonnet)
- **Input:** ~$3 por millón de tokens
- **Output:** ~$15 por millón de tokens
- **Conversación típica:** 500-1000 tokens (~$0.008-$0.015)
- **Estimación:** 1000 conversaciones/mes → ~$10-15/mes

### Backend Hosting
- **Heroku:** $7/mes (plan básico)
- **Railway:** $5/mes (plan básico)
- **Google Cloud Run:** Free tier generoso, luego pay-as-you-go
- **AWS Lambda:** Free tier 1M requests/mes

**Total estimado:** $15-25/mes para 1000 usuarios activos

## 🧪 Testing sin Backend

Si quieres probar la UI sin implementar el backend aún, puedes:

1. **Mock del servicio** - Crear respuestas simuladas:

```typescript
// src/services/ai.ts
export async function callAssistant(...) {
  // Comentar el fetch real, descomentar esto:
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Esta es una respuesta de prueba del asistente. Tus gastos van bien este mes.',
        usage: { inputTokens: 100, outputTokens: 50 }
      });
    }, 2000); // Simula latencia de 2 segundos
  });
}
```

2. **Probar la UI** - Verifica que todo funcione visualmente

3. **Implementar el backend** cuando estés listo

## 📚 Recursos

### Documentación
- **`BACKEND_API_SPEC.md`** - Especificación completa de las APIs
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

### Ejemplos
- El archivo `BACKEND_API_SPEC.md` incluye un ejemplo completo de implementación

### Soporte
- Para dudas sobre el frontend: Revisa el código en `src/components/asistente/`
- Para dudas sobre el backend: Consulta `BACKEND_API_SPEC.md`

## ✅ Checklist

### Frontend (✅ COMPLETO)
- [x] Vista del asistente implementada
- [x] Servicio de API configurado
- [x] Hook personalizado creado
- [x] Rutas configuradas
- [x] Autenticación integrada
- [x] Manejo de errores
- [x] UI responsive
- [x] Dark mode

### Backend (⏳ POR IMPLEMENTAR)
- [ ] Configurar proyecto del backend
- [ ] Instalar dependencias necesarias
- [ ] Configurar Firebase Admin SDK
- [ ] Configurar Anthropic SDK
- [ ] Implementar middleware de autenticación
- [ ] Implementar endpoint `/api/assistant/chat`
- [ ] Implementar rate limiting
- [ ] Configurar CORS
- [ ] Testing
- [ ] Deploy

---

## 🎉 Conclusión

El **frontend está 100% listo**. La vista del asistente es totalmente funcional y solo espera que implementes el backend siguiendo la especificación en `BACKEND_API_SPEC.md`.

¿Necesitas ayuda con la implementación del backend? El archivo `BACKEND_API_SPEC.md` tiene un ejemplo completo listo para copiar y pegar.
