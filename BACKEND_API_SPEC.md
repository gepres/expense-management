# Especificación de APIs del Backend

Este documento describe las APIs REST que el backend debe implementar para la aplicación de gastos.

## 📋 Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Categorías y Catálogos](#categorías-y-catálogos)
3. [API de Escaneo de Recibos](#api-de-escaneo-de-recibos)
4. [API del Asistente IA](#api-del-asistente-ia)
5. [API de Importación de Gastos](#api-de-importación-de-gastos)
6. [Tipos de Datos](#tipos-de-datos)
7. [Códigos de Error](#códigos-de-error)
8. [Ejemplos de Implementación](#ejemplos-de-implementación)

---

## 🔐 Autenticación

**Todas las APIs requieren autenticación mediante Firebase ID Token.**

### Headers Requeridos

```http
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

### Validación del Token

El backend debe:
1. Extraer el token del header `Authorization`
2. Verificar el token usando Firebase Admin SDK
3. Extraer el `uid` del usuario del token decodificado
4. Usar el `uid` para asociar las operaciones al usuario

**Ejemplo de verificación (Node.js):**

```javascript
const admin = require('firebase-admin');

async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación no proporcionado'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Token inválido o expirado'
    });
  }
}
```

---

## 📊 Categorías y Catálogos

**Descripción:** Endpoints para obtener los catálogos de categorías, subcategorías, métodos de pago y monedas.

### Datos de Referencia

Consulta los archivos:
- **`categorias.json`** - Estructura completa en formato JSON
- **`CATEGORIAS.md`** - Documentación detallada de todas las categorías
- **`categorias-types.ts`** - Tipos TypeScript para el backend

### GET `/api/categorias`

Obtener todas las categorías con sus subcategorías.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "alimentacion",
      "nombre": "Alimentación",
      "icono": "🍔",
      "color": "#FF6B6B",
      "descripcion": "Gastos relacionados con comida y bebidas",
      "subcategorias": [
        {
          "id": "supermercado",
          "nombre": "Supermercado",
          "descripcion": "Compras de abarrotes y productos básicos"
        },
        // ... más subcategorías
      ]
    },
    // ... más categorías
  ]
}
```

### GET `/api/categorias/:id`

Obtener una categoría específica por ID.

#### Response

```json
{
  "success": true,
  "data": {
    "id": "alimentacion",
    "nombre": "Alimentación",
    "icono": "🍔",
    "color": "#FF6B6B",
    "descripcion": "Gastos relacionados con comida y bebidas",
    "subcategorias": [...]
  }
}
```

### GET `/api/metodos-pago`

Obtener todos los métodos de pago disponibles.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "efectivo",
      "nombre": "Efectivo",
      "icono": "💵",
      "descripcion": "Pago en dinero físico"
    },
    {
      "id": "yape",
      "nombre": "Yape",
      "icono": "📱",
      "descripcion": "Pago con Yape (Perú)"
    },
    // ... más métodos
  ]
}
```

### GET `/api/monedas`

Obtener todas las monedas soportadas.

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "PEN",
      "nombre": "Soles Peruanos",
      "simbolo": "S/",
      "icono": "🇵🇪",
      "codigoISO": "PEN"
    },
    {
      "id": "USD",
      "nombre": "Dólares Estadounidenses",
      "simbolo": "$",
      "icono": "🇺🇸",
      "codigoISO": "USD"
    }
  ]
}
```

### Implementación Recomendada

**Opción 1: Servir desde archivo JSON (más simple)**

```javascript
const categoriasData = require('./categorias.json');

app.get('/api/categorias', (req, res) => {
  res.json({
    success: true,
    data: categoriasData.categorias
  });
});

app.get('/api/categorias/:id', (req, res) => {
  const categoria = categoriasData.categorias.find(c => c.id === req.params.id);
  if (!categoria) {
    return res.status(404).json({
      success: false,
      error: 'Categoría no encontrada'
    });
  }
  res.json({ success: true, data: categoria });
});

app.get('/api/metodos-pago', (req, res) => {
  res.json({
    success: true,
    data: categoriasData.metodosPago
  });
});

app.get('/api/monedas', (req, res) => {
  res.json({
    success: true,
    data: categoriasData.monedas
  });
});
```

**Opción 2: Importar a base de datos (más escalable)**

```javascript
// Importación inicial (ejecutar una sola vez)
const categoriasData = require('./categorias.json');

async function importarCategorias() {
  // MongoDB
  await db.collection('categorias').insertMany(categoriasData.categorias);
  await db.collection('metodos_pago').insertMany(categoriasData.metodosPago);
  await db.collection('monedas').insertMany(categoriasData.monedas);

  // O Firestore
  for (const cat of categoriasData.categorias) {
    await db.collection('categorias').doc(cat.id).set(cat);
  }
}

// Endpoints usando la base de datos
app.get('/api/categorias', async (req, res) => {
  const categorias = await db.collection('categorias').find().toArray();
  res.json({ success: true, data: categorias });
});
```

### Validación en el Backend

Usa el archivo `categorias-types.ts` para validar:

```typescript
import { isCategoriaValida, isMetodoPagoValido, isMonedaValida } from './categorias-types';

// Validar al crear un gasto
if (!isCategoriaValida(gasto.categoria)) {
  return res.status(400).json({
    error: 'Categoría inválida',
    message: `La categoría "${gasto.categoria}" no existe`
  });
}

if (!isMonedaValida(gasto.moneda)) {
  return res.status(400).json({
    error: 'Moneda inválida',
    message: `La moneda "${gasto.moneda}" no está soportada`
  });
}
```

### Resumen de Categorías

- **9 categorías principales:** alimentacion, transporte, entretenimiento, salud, servicios, compras, educacion, vivienda, otros
- **1 categoría especial:** general (presupuesto general)
- **57 subcategorías** distribuidas
- **7 métodos de pago:** efectivo, tarjeta_debito, tarjeta_credito, transferencia, yape, plin, otros
- **2 monedas:** PEN (Soles), USD (Dólares)

---

## 📸 API de Escaneo de Recibos

**Descripción:** Endpoint para escanear imágenes de recibos/boletas (Yape, Plin, transferencias) y extraer datos automáticamente mediante OCR + IA.

### POST `/api/receipts/scan`

Escanea una imagen de recibo y extrae los datos del pago.

#### Request

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
image: File (imagen del recibo)
```

**Restricciones:**
- Formatos permitidos: `.jpg`, `.jpeg`, `.png`, `.webp`
- Tamaño máximo: 5MB
- El archivo debe ser una imagen válida

#### Response (200 OK)

```json
{
  "success": true,
  "receiptId": "NIs672MFm3bmt3wqmmc7",
  "imageUrl": "https://res.cloudinary.com/gepres/image/upload/v1763226787/receipts/receipt_1763226786261_yape-panederia.jpg",
  "cloudinaryPublicId": "receipts/receipt_1763226786261_yape-panederia",
  "data": {
    "amount": 2,
    "currency": "PEN",
    "date": "2025-11-14",
    "time": "21:32:00",
    "paymentMethod": "yape",
    "merchant": "Luisa Atau S.",
    "referenceNumber": "24837840",
    "category": "Alimentación",
    "subcategory": "Panadería",
    "description": "Pago por panadería",
    "confidence": 95
  },
  "suggestions": [],
  "status": "processed"
}
```

#### Response (400 Bad Request)

```json
{
  "error": "Imagen inválida",
  "message": "Formato de imagen no válido. Solo se permiten archivos .jpg, .jpeg, .png y .webp"
}
```

#### Response (401 Unauthorized)

```json
{
  "error": "No autorizado",
  "message": "Debes iniciar sesión para escanear recibos"
}
```

#### Response (413 Payload Too Large)

```json
{
  "error": "Archivo demasiado grande",
  "message": "La imagen es demasiado grande (máximo 5MB)"
}
```

#### Response (500 Internal Server Error)

```json
{
  "error": "Error del servidor",
  "message": "Error al procesar el recibo"
}
```

### Datos Extraídos

El campo `data` contiene la siguiente información extraída del recibo:

| Campo | Tipo | Descripción | Requerido |
|-------|------|-------------|-----------|
| `amount` | number | Monto del pago | ✅ |
| `currency` | string | Moneda (PEN o USD) | ✅ |
| `date` | string | Fecha en formato YYYY-MM-DD | ✅ |
| `time` | string | Hora en formato HH:mm:ss | ❌ |
| `paymentMethod` | string | Método de pago (yape, plin, transferencia, etc.) | ✅ |
| `merchant` | string | Comerciante/destinatario | ❌ |
| `referenceNumber` | string | Número de referencia/operación | ❌ |
| `category` | string | Categoría sugerida (nombre legible) | ❌ |
| `subcategory` | string | Subcategoría sugerida (nombre legible) | ❌ |
| `description` | string | Descripción sugerida | ❌ |
| `confidence` | number | Nivel de confianza (0-100) | ✅ |

### Lógica del Backend

El endpoint debe:

1. **Validar autenticación** usando el token de Firebase
2. **Validar la imagen:**
   - Verificar formato (.jpg, .jpeg, .png, .webp)
   - Verificar tamaño (máximo 5MB)
   - Verificar que sea un archivo de imagen válido

3. **Subir imagen a Cloudinary:**
   ```javascript
   const cloudinary = require('cloudinary').v2;

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });

   const result = await cloudinary.uploader.upload(imageFile.path, {
     folder: 'receipts',
     resource_type: 'image',
     public_id: `receipt_${Date.now()}_${fileName}`
   });

   const imageUrl = result.secure_url;
   const cloudinaryPublicId = result.public_id;
   ```

4. **Extraer texto con OCR:**
   - Usar Google Cloud Vision API, Tesseract.js, o similar
   - Extraer todo el texto visible en la imagen

5. **Analizar con IA (Claude):**
   ```javascript
   const Anthropic = require('@anthropic-ai/sdk');

   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY,
   });

   const prompt = `Analiza este recibo de pago y extrae la siguiente información en formato JSON:

   Texto del recibo:
   ${extractedText}

   Extrae:
   - amount (número): Monto del pago
   - currency (PEN o USD): Moneda
   - date (YYYY-MM-DD): Fecha
   - time (HH:mm:ss): Hora
   - paymentMethod (yape, plin, transferencia, efectivo, etc.): Método de pago
   - merchant (string): Nombre del comerciante/destinatario
   - referenceNumber (string): Número de operación/referencia
   - category (string): Categoría sugerida (Alimentación, Transporte, etc.)
   - subcategory (string): Subcategoría sugerida
   - description (string): Descripción del gasto
   - confidence (0-100): Nivel de confianza en la extracción

   Devuelve solo el JSON, sin explicaciones adicionales.`;

   const response = await anthropic.messages.create({
     model: 'claude-3-5-sonnet-20241022',
     max_tokens: 1024,
     messages: [{ role: 'user', content: prompt }]
   });

   const extractedData = JSON.parse(response.content[0].text);
   ```

6. **Guardar en la base de datos (opcional):**
   - Guardar el recibo escaneado con referencia al usuario
   - Útil para historial y auditoría

7. **Devolver respuesta** con formato especificado

### Librerías Recomendadas

**Node.js:**
```bash
npm install cloudinary @anthropic-ai/sdk tesseract.js multer
# O usar Google Cloud Vision:
npm install @google-cloud/vision
```

**Python:**
```bash
pip install cloudinary anthropic pytesseract pillow python-multipart
# O usar Google Cloud Vision:
pip install google-cloud-vision
```

### Ejemplo de Implementación (Node.js)

```javascript
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Anthropic = require('@anthropic-ai/sdk');
const Tesseract = require('tesseract.js');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configurar multer para archivos
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    if (validExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no válido'));
    }
  }
});

// Endpoint de escaneo
app.post('/api/receipts/scan', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Imagen requerida',
        message: 'Debes subir una imagen del recibo'
      });
    }

    // 1. Subir a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: 'receipts',
      resource_type: 'image',
      public_id: `receipt_${Date.now()}_${req.file.originalname.split('.')[0]}`
    });

    const imageUrl = uploadResult.secure_url;
    const cloudinaryPublicId = uploadResult.public_id;

    // 2. OCR - Extraer texto
    const { data: { text } } = await Tesseract.recognize(
      req.file.path,
      'spa', // Español
      { logger: m => console.log(m) }
    );

    // 3. Analizar con Claude
    const prompt = `Analiza este recibo de pago y extrae la siguiente información en formato JSON.

Texto del recibo:
${text}

Extrae:
- amount (número): Monto del pago
- currency (PEN o USD): Moneda (si no se especifica, asume PEN)
- date (YYYY-MM-DD): Fecha del pago
- time (HH:mm:ss): Hora (opcional)
- paymentMethod (string): Método de pago (yape, plin, transferencia, efectivo, etc.)
- merchant (string): Nombre del comerciante/destinatario
- referenceNumber (string): Número de operación/referencia
- category (string): Categoría sugerida (Alimentación, Transporte, Entretenimiento, Salud, Servicios, Compras, Educación, Vivienda, Otros)
- subcategory (string): Subcategoría específica
- description (string): Descripción breve del gasto
- confidence (0-100): Nivel de confianza en la extracción

Devuelve SOLO el objeto JSON, sin texto adicional.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    // Parse JSON response
    const extractedData = JSON.parse(response.content[0].text);

    // 4. Guardar en base de datos (opcional)
    const receiptDoc = await admin.firestore().collection('receipts').add({
      userId: req.user.uid,
      imageUrl,
      cloudinaryPublicId,
      extractedData,
      ocrText: text,
      status: 'processed',
      createdAt: new Date()
    });

    // 5. Devolver respuesta
    res.json({
      success: true,
      receiptId: receiptDoc.id,
      imageUrl,
      cloudinaryPublicId,
      data: extractedData,
      suggestions: [],
      status: 'processed'
    });

  } catch (error) {
    console.error('[Receipt Scan] Error:', error);

    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al procesar el recibo'
    });
  }
});
```

### Variables de Entorno Adicionales

```bash
# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Anthropic (ya configurado)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Google Cloud Vision (opcional, alternativa a Tesseract)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Mejoras Futuras

- [ ] Soporte para múltiples imágenes (batch scanning)
- [ ] Previsualización de la imagen antes de procesar
- [ ] Historial de recibos escaneados
- [ ] Edición manual de datos extraídos
- [ ] Guardar imagen vinculada al gasto creado
- [ ] Detección automática del tipo de recibo (Yape vs Plin vs Transferencia)
- [ ] Soporte para más métodos de pago

---

## 🤖 API del Asistente IA

### POST `/api/assistant/chat`

Procesa un mensaje del usuario y devuelve una respuesta del asistente IA.

#### Request

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

**Body:**
```json
{
  "message": "¿Cómo van mis gastos este mes?",
  "context": {
    "gastos": [
      {
        "id": "gasto_123",
        "userId": "user_456",
        "fecha": "2024-11-14T10:30:00.000Z",
        "categoria": "alimentacion",
        "subcategoria": "Market",
        "monto": 150.50,
        "moneda": "PEN",
        "descripcion": "Compras del mes",
        "metodoPago": "tarjeta_credito",
        "tags": ["supermercado"],
        "recurrente": false,
        "createdAt": "2024-11-14T10:30:00.000Z",
        "updatedAt": "2024-11-14T10:30:00.000Z"
      }
    ],
    "presupuestos": [
      {
        "id": "presupuesto_789",
        "userId": "user_456",
        "mes": "2024-11",
        "categoria": "alimentacion",
        "subcategoria": null,
        "limite": 500,
        "moneda": "PEN",
        "gastado": 150.50,
        "alertaEnviada80": false,
        "alertaEnviada100": false,
        "createdAt": "2024-11-01T00:00:00.000Z",
        "updatedAt": "2024-11-14T10:30:00.000Z"
      }
    ],
    "mes": "2024-11"
  },
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hola",
      "timestamp": "2024-11-14T10:25:00.000Z"
    },
    {
      "role": "assistant",
      "content": "¡Hola! ¿En qué puedo ayudarte hoy?",
      "timestamp": "2024-11-14T10:25:05.000Z"
    }
  ]
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Tus gastos este mes van muy bien. Has gastado S/ 150.50 de un presupuesto de S/ 500 en alimentación, lo que representa solo un 30% del límite. Estás llevando un buen control de tus finanzas. ¿Te gustaría que analice alguna categoría en específico?",
  "usage": {
    "inputTokens": 1250,
    "outputTokens": 180
  }
}
```

#### Response (401 Unauthorized)

```json
{
  "error": "No autorizado",
  "message": "Debes iniciar sesión para usar el asistente"
}
```

#### Response (400 Bad Request)

```json
{
  "error": "Solicitud inválida",
  "message": "El mensaje es requerido y debe ser un string"
}
```

#### Response (429 Too Many Requests)

```json
{
  "error": "Límite excedido",
  "message": "Se ha excedido el límite de solicitudes. Por favor, intenta más tarde"
}
```

#### Response (500 Internal Server Error)

```json
{
  "error": "Error del servidor",
  "message": "Error al procesar la solicitud"
}
```

### Lógica del Backend

El endpoint debe:

1. **Validar autenticación** usando el token de Firebase
2. **Validar el request body:**
   - `message` es requerido y es string no vacío (max 1000 caracteres)
   - `context` es requerido y contiene `gastos`, `presupuestos`, `mes`
   - `conversationHistory` es opcional (array de mensajes)

3. **Preparar el prompt para la IA:**
   - Analizar el contexto del usuario (gastos, presupuestos)
   - Calcular estadísticas (total gastado, por categoría, porcentajes, etc.)
   - Construir un prompt del sistema con el contexto financiero
   - Incluir el historial de conversación

4. **Llamar a la API de Anthropic:**
   ```javascript
   const Anthropic = require('@anthropic-ai/sdk');

   const anthropic = new Anthropic({
     apiKey: process.env.ANTHROPIC_API_KEY,
   });

   const response = await anthropic.messages.create({
     model: 'claude-3-5-sonnet-20241022',
     max_tokens: 2000,
     temperature: 0.7,
     system: systemPrompt, // Prompt con contexto del usuario
     messages: [
       ...conversationHistory,
       { role: 'user', content: message }
     ]
   });
   ```

5. **Devolver la respuesta** con el formato especificado

### Rate Limiting Recomendado

- **Por usuario:** 30 requests por minuto
- **Global:** 1000 requests por minuto
- **Implementar usando:** `express-rate-limit` o similar

```javascript
const rateLimit = require('express-rate-limit');

const assistantLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto
  message: {
    error: 'Límite excedido',
    message: 'Se ha excedido el límite de solicitudes. Por favor, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user.uid, // Rate limit por usuario
});

app.post('/api/assistant/chat', verifyToken, assistantLimiter, chatHandler);
```

---

## 📤 API de Importación de Gastos

### POST `/api/import/validate`

Valida un archivo de gastos antes de importarlo. Retorna errores, advertencias y vista previa.

#### Request

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
file: File (Excel .xlsx, .xls o CSV .csv, máx 5MB)
columnMapping: JSON string (opcional)
```

**Ejemplo de columnMapping:**
```json
{
  "fecha": "Fecha",
  "categoria": "Categoría",
  "subcategoria": "Subcategoría",
  "monto": "Monto",
  "moneda": "Moneda",
  "descripcion": "Descripción",
  "metodoPago": "Método de Pago"
}
```

#### Response (200 OK)

```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    "Fila 5: Campo 'moneda' vacío, se asumirá PEN por defecto"
  ],
  "rowCount": 25,
  "preview": [
    {
      "rowNumber": 2,
      "fecha": "2024-11-01",
      "categoria": "alimentacion",
      "subcategoria": "Market",
      "monto": 150.50,
      "moneda": "PEN",
      "descripcion": "Compras del supermercado",
      "metodoPago": "tarjeta_credito",
      "valid": true,
      "errors": []
    },
    {
      "rowNumber": 3,
      "fecha": "2024-11-02",
      "categoria": "transporte",
      "monto": 25.00,
      "moneda": "PEN",
      "descripcion": "Taxi al trabajo",
      "metodoPago": "efectivo",
      "valid": true,
      "errors": []
    }
  ]
}
```

#### Response (400 Bad Request)

```json
{
  "error": "Archivo inválido",
  "message": "El archivo debe ser Excel (.xlsx, .xls) o CSV (.csv)"
}
```

**Otros errores:**
- `401 Unauthorized` - Token inválido
- `413 Payload Too Large` - Archivo mayor a 5MB

### POST `/api/import/gastos`

Importa gastos desde un archivo validado.

#### Request

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
Content-Type: multipart/form-data
```

**Body (FormData):**
```
file: File (Excel o CSV)
columnMapping: JSON string (opcional)
```

#### Response (200 OK)

```json
{
  "success": true,
  "totalRows": 25,
  "successCount": 23,
  "errorCount": 2,
  "errors": [
    {
      "row": 10,
      "field": "categoria",
      "message": "Categoría 'entretenimiento123' no válida"
    },
    {
      "row": 15,
      "field": "monto",
      "message": "Monto debe ser un número positivo"
    }
  ],
  "importedGastos": [
    {
      "id": "gasto_abc123",
      "fecha": "2024-11-01T00:00:00.000Z",
      "categoria": "alimentacion",
      "monto": 150.50,
      "descripcion": "Compras del supermercado"
    }
  ]
}
```

#### Response (400 Bad Request)

```json
{
  "error": "Datos inválidos",
  "message": "El archivo contiene errores. Usa /api/import/validate primero."
}
```

**Otros errores:**
- `401 Unauthorized` - Token inválido
- `413 Payload Too Large` - Archivo muy grande

### GET `/api/import/template`

Descarga una plantilla de Excel con el formato correcto.

#### Request

**Headers:**
```http
Authorization: Bearer <firebase_id_token>
```

#### Response (200 OK)

**Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

Archivo Excel con:
- Primera fila: nombres de columnas (fecha, categoria, subcategoria, monto, moneda, descripcion, metodoPago)
- Segunda fila: ejemplo de datos
- Tercera fila: otro ejemplo

**Columnas de la plantilla:**

| fecha | categoria | subcategoria | monto | moneda | descripcion | metodoPago |
|-------|-----------|-------------|-------|--------|-------------|------------|
| 2024-11-01 | alimentacion | Market | 150.50 | PEN | Compras | tarjeta_credito |
| 2024-11-02 | transporte | Taxi | 25.00 | PEN | Taxi | efectivo |

#### Response (401 Unauthorized)

```json
{
  "error": "No autorizado",
  "message": "Debes iniciar sesión"
}
```

### Lógica del Backend para Importación

El backend debe:

1. **Validar el archivo:**
   - Verificar extensión (.xlsx, .xls, .csv)
   - Verificar tamaño (máx 5MB)
   - Parsear el archivo usando una librería apropiada

2. **Validar las columnas:**
   - Verificar que existan las columnas requeridas
   - Mapear nombres de columnas si se proporciona `columnMapping`
   - Columnas requeridas: `fecha`, `categoria`, `monto`, `descripcion`
   - Columnas opcionales: `subcategoria`, `moneda` (default: PEN), `metodoPago` (default: efectivo)

3. **Validar cada fila:**
   - **fecha:** formato válido (ISO 8601 o DD/MM/YYYY)
   - **categoria:** debe existir en las categorías válidas
   - **subcategoria:** si existe, debe ser válida para la categoría
   - **monto:** número positivo
   - **moneda:** PEN o USD
   - **descripcion:** string no vacío (max 200 caracteres)
   - **metodoPago:** debe existir en métodos válidos

4. **Para `/api/import/validate`:**
   - Retornar todos los errores y advertencias encontrados
   - Incluir vista previa de las primeras 5 filas válidas
   - NO guardar nada en la base de datos

5. **Para `/api/import/gastos`:**
   - Importar solo las filas válidas
   - Asociar cada gasto al usuario autenticado (`userId` del token)
   - Agregar timestamps `createdAt` y `updatedAt`
   - Retornar resumen con éxitos y errores

### Librerías Recomendadas

**Node.js:**
```bash
npm install xlsx csv-parser multer
```

**Python:**
```bash
pip install pandas openpyxl xlrd python-multipart
```

### Ejemplo de Implementación (Node.js)

```javascript
const multer = require('multer');
const xlsx = require('xlsx');

// Configurar multer para archivos
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = file.originalname.substring(file.originalname.lastIndexOf('.')).toLowerCase();
    if (validExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de archivo no válido'));
    }
  }
});

// Endpoint de validación
app.post('/api/import/validate', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Archivo requerido',
        message: 'Debes subir un archivo'
      });
    }

    // Leer el archivo Excel/CSV
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Validar datos
    const errors = [];
    const warnings = [];
    const preview = [];

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 porque índice 0 es fila 2 en Excel

      // Validar fecha
      if (!row.fecha) {
        errors.push(`Fila ${rowNumber}: Campo 'fecha' es requerido`);
      }

      // Validar categoria
      const validCategories = ['alimentacion', 'transporte', 'entretenimiento', 'salud', 'servicios', 'compras', 'educacion', 'vivienda', 'otros'];
      if (!validCategories.includes(row.categoria)) {
        errors.push(`Fila ${rowNumber}: Categoría '${row.categoria}' no válida`);
      }

      // Validar monto
      if (!row.monto || parseFloat(row.monto) <= 0) {
        errors.push(`Fila ${rowNumber}: Monto debe ser un número positivo`);
      }

      // Advertencias
      if (!row.moneda) {
        warnings.push(`Fila ${rowNumber}: Campo 'moneda' vacío, se asumirá PEN por defecto`);
      }

      // Preview (primeras 5 filas)
      if (preview.length < 5) {
        preview.push({
          rowNumber,
          fecha: row.fecha,
          categoria: row.categoria,
          subcategoria: row.subcategoria || '',
          monto: parseFloat(row.monto),
          moneda: row.moneda || 'PEN',
          descripcion: row.descripcion || '',
          metodoPago: row.metodoPago || 'efectivo',
          valid: errors.filter(e => e.includes(`Fila ${rowNumber}`)).length === 0,
          errors: errors.filter(e => e.includes(`Fila ${rowNumber}`))
        });
      }
    });

    res.json({
      valid: errors.length === 0,
      errors,
      warnings,
      rowCount: data.length,
      preview
    });

  } catch (error) {
    console.error('[Import] Error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al validar el archivo'
    });
  }
});

// Endpoint de importación
app.post('/api/import/gastos', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Archivo requerido',
        message: 'Debes subir un archivo'
      });
    }

    // Leer el archivo
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const importedGastos = [];

    // Procesar cada fila
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      const rowNumber = index + 2;

      try {
        // Validar y crear gasto
        const gasto = {
          userId: req.user.uid,
          fecha: new Date(row.fecha),
          categoria: row.categoria,
          subcategoria: row.subcategoria || undefined,
          monto: parseFloat(row.monto),
          moneda: row.moneda || 'PEN',
          descripcion: row.descripcion || '',
          metodoPago: row.metodoPago || 'efectivo',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Guardar en Firestore
        const docRef = await admin.firestore().collection('gastos').add(gasto);

        importedGastos.push({
          id: docRef.id,
          ...gasto
        });

        successCount++;

      } catch (error) {
        errorCount++;
        errors.push({
          row: rowNumber,
          message: error.message
        });
      }
    }

    res.json({
      success: true,
      totalRows: data.length,
      successCount,
      errorCount,
      errors,
      importedGastos
    });

  } catch (error) {
    console.error('[Import] Error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al importar gastos'
    });
  }
});

// Endpoint para descargar plantilla
app.get('/api/import/template', verifyToken, (req, res) => {
  try {
    // Crear workbook
    const workbook = xlsx.utils.book_new();

    // Datos de ejemplo
    const data = [
      {
        fecha: '2024-11-01',
        categoria: 'alimentacion',
        subcategoria: 'Market',
        monto: 150.50,
        moneda: 'PEN',
        descripcion: 'Compras del supermercado',
        metodoPago: 'tarjeta_credito'
      },
      {
        fecha: '2024-11-02',
        categoria: 'transporte',
        subcategoria: 'Taxi',
        monto: 25.00,
        moneda: 'PEN',
        descripcion: 'Taxi al trabajo',
        metodoPago: 'efectivo'
      }
    ];

    // Crear worksheet
    const worksheet = xlsx.utils.json_to_sheet(data);

    // Agregar al workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Gastos');

    // Generar buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Enviar archivo
    res.setHeader('Content-Disposition', 'attachment; filename=plantilla_gastos.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    console.error('[Import] Error:', error);
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al generar la plantilla'
    });
  }
});
```

---

## 📦 Tipos de Datos

### Gasto

```typescript
interface Gasto {
  id: string;
  userId: string;
  fecha: string; // ISO 8601 date string
  categoria: 'alimentacion' | 'transporte' | 'entretenimiento' |
             'salud' | 'servicios' | 'compras' | 'educacion' |
             'vivienda' | 'otros';
  subcategoria?: string;
  monto: number;
  moneda: 'PEN' | 'USD';
  descripcion: string;
  metodoPago: 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' |
               'transferencia' | 'yape' | 'plin' | 'otros';
  tags?: string[];
  recurrente?: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### Presupuesto

```typescript
interface Presupuesto {
  id: string;
  userId: string;
  mes: string; // Formato: YYYY-MM
  categoria: 'general' | 'alimentacion' | 'transporte' | 'entretenimiento' |
             'salud' | 'servicios' | 'compras' | 'educacion' |
             'vivienda' | 'otros';
  subcategoria?: string;
  limite: number;
  moneda: 'PEN' | 'USD';
  gastado: number;
  alertaEnviada80?: boolean;
  alertaEnviada100?: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### ConversationMessage

```typescript
interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string; // ISO 8601
}
```

### UserContext

```typescript
interface UserContext {
  gastos: Gasto[];
  presupuestos: Presupuesto[];
  mes: string; // Formato: YYYY-MM
}
```

---

## ⚠️ Códigos de Error

| Código | Descripción | Cuándo Usar |
|--------|-------------|-------------|
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | Token inválido o faltante |
| 429 | Too Many Requests | Límite de rate limit excedido |
| 500 | Internal Server Error | Error del servidor o API de Anthropic |
| 503 | Service Unavailable | Servicio temporalmente no disponible |

### Formato de Error Estándar

```json
{
  "error": "Nombre del error",
  "message": "Descripción amigable del error",
  "details": {} // Opcional, solo para debugging en desarrollo
}
```

---

## 💡 Ejemplos de Implementación

### Ejemplo Completo (Node.js + Express)

```javascript
const express = require('express');
const admin = require('firebase-admin');
const Anthropic = require('@anthropic-ai/sdk');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Inicializar Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware de autenticación
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación no proporcionado'
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Token inválido o expirado'
    });
  }
}

// Rate limiter
const assistantLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: 'Límite excedido',
    message: 'Se ha excedido el límite de solicitudes. Por favor, intenta más tarde'
  },
  keyGenerator: (req) => req.user.uid,
});

// Construir prompt del sistema
function buildSystemPrompt(context, userEmail) {
  const { gastos, presupuestos, mes } = context;

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const totalPresupuestos = presupuestos.reduce((sum, p) => sum + p.limite, 0);

  // Gastos por categoría
  const gastosPorCategoria = {};
  gastos.forEach((g) => {
    gastosPorCategoria[g.categoria] = (gastosPorCategoria[g.categoria] || 0) + g.monto;
  });

  // Presupuestos por categoría
  const presupuestosPorCategoria = {};
  presupuestos.forEach((p) => {
    if (p.categoria !== 'general') {
      presupuestosPorCategoria[p.categoria] = p.limite;
    }
  });

  return `Eres un asistente financiero personal para ${userEmail}.

## Contexto del Usuario

**Período actual:** ${mes}

**Resumen financiero:**
- Total gastado: ${totalGastos.toFixed(2)}
- Total presupuestado: ${totalPresupuestos.toFixed(2)}
- Saldo: ${(totalPresupuestos - totalGastos).toFixed(2)}
- Número de gastos: ${gastos.length}

**Gastos por categoría:**
${Object.entries(gastosPorCategoria)
  .map(([cat, total]) => `- ${cat}: ${total.toFixed(2)}`)
  .join('\n')}

**Presupuestos por categoría:**
${Object.entries(presupuestosPorCategoria)
  .map(([cat, limite]) => {
    const gastado = gastosPorCategoria[cat] || 0;
    const porcentaje = limite > 0 ? ((gastado / limite) * 100).toFixed(1) : '0';
    return `- ${cat}: ${gastado.toFixed(2)} / ${limite.toFixed(2)} (${porcentaje}%)`;
  })
  .join('\n')}

## Tu Rol

Eres un asesor financiero amigable. Analiza, recomienda y motiva buenos hábitos financieros.

## Instrucciones

- Usa un tono amigable pero profesional
- Sé conciso y directo
- Basa tus respuestas en los datos proporcionados
- Responde en español`;
}

// Endpoint del asistente
app.post('/api/assistant/chat', verifyToken, assistantLimiter, async (req, res) => {
  try {
    const { message, context, conversationHistory = [] } = req.body;

    // Validar entrada
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Solicitud inválida',
        message: 'El mensaje es requerido y debe ser un string no vacío'
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        error: 'Solicitud inválida',
        message: 'El mensaje es demasiado largo (máximo 1000 caracteres)'
      });
    }

    if (!context || !context.gastos || !context.presupuestos || !context.mes) {
      return res.status(400).json({
        error: 'Solicitud inválida',
        message: 'El contexto del usuario es requerido'
      });
    }

    // Construir prompt del sistema
    const systemPrompt = buildSystemPrompt(context, req.user.email);

    // Preparar mensajes
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Llamar a Anthropic
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages,
    });

    // Extraer respuesta
    const assistantMessage = response.content[0];
    const messageText = assistantMessage.type === 'text' ? assistantMessage.text : '';

    // Log para monitoreo
    console.log(`[Asistente IA] Usuario: ${req.user.uid}, Tokens: ${response.usage.input_tokens + response.usage.output_tokens}`);

    // Devolver respuesta
    res.json({
      success: true,
      message: messageText,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      }
    });

  } catch (error) {
    console.error('[Asistente IA] Error:', error);

    // Manejar errores de Anthropic
    if (error.status === 429) {
      return res.status(429).json({
        error: 'Límite excedido',
        message: 'Se ha excedido el límite de solicitudes a la API de IA'
      });
    }

    if (error.status === 401) {
      return res.status(500).json({
        error: 'Error del servidor',
        message: 'Error de autenticación con el servicio de IA'
      });
    }

    // Error genérico
    res.status(500).json({
      error: 'Error del servidor',
      message: 'Error al procesar la solicitud. Por favor, intenta de nuevo'
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend API corriendo en puerto ${PORT}`);
});
```

---

## 🚀 Requisitos del Backend

### Dependencias Necesarias

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "@anthropic-ai/sdk": "^0.27.0",
    "firebase-admin": "^12.1.0",
    "express-rate-limit": "^7.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.0"
  }
}
```

### Variables de Entorno

```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=3000
NODE_ENV=production
FIREBASE_PROJECT_ID=tu-proyecto-id

# Opcional: Firebase Service Account (JSON)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173', // Desarrollo
    'http://localhost:5174',
    'https://tu-app.web.app', // Producción
    'https://tu-app.firebaseapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 📊 Monitoreo y Logging

### Métricas Recomendadas

- Número de requests por usuario
- Latencia promedio de respuestas
- Tokens consumidos (costo)
- Rate de errores
- Mensajes procesados por día/hora

### Logs Esenciales

```javascript
// Log de cada request
console.log({
  timestamp: new Date().toISOString(),
  userId: req.user.uid,
  endpoint: '/api/assistant/chat',
  tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  latency: Date.now() - startTime,
  success: true
});
```

---

## ✅ Checklist de Implementación

- [ ] Configurar Firebase Admin SDK
- [ ] Configurar Anthropic SDK
- [ ] Implementar middleware de autenticación
- [ ] Implementar rate limiting
- [ ] Configurar CORS
- [ ] Implementar endpoint `/api/assistant/chat`
- [ ] Validar todos los inputs
- [ ] Manejar todos los códigos de error
- [ ] Implementar logging
- [ ] Implementar monitoreo de costos
- [ ] Configurar variables de entorno
- [ ] Testing (unitario e integración)
- [ ] Documentar API (Swagger/OpenAPI)
- [ ] Deploy en producción

---

¿Necesitas ayuda con la implementación? Este documento cubre todo lo necesario para crear el backend.
