# 📊 Archivos de Categorías y Catálogos

Este documento describe los archivos creados para definir las categorías, subcategorías y catálogos del sistema.

---

## 📁 Archivos Creados

### 1. **`categorias.json`**

**Formato:** JSON
**Uso:** Backend / Base de datos
**Descripción:** Estructura completa de datos en formato JSON

Contiene:
- ✅ 9 categorías principales con subcategorías
- ✅ 57 subcategorías distribuidas
- ✅ 7 métodos de pago (incluye Yape y Plin para Perú)
- ✅ 2 monedas (PEN y USD)
- ✅ Categoría especial "Presupuesto General"
- ✅ Metadatos (versión, fecha de actualización)

**Ejemplo de uso:**

```javascript
// Node.js
const categorias = require('./categorias.json');
console.log(categorias.categorias); // Array de categorías
console.log(categorias.metodosPago); // Array de métodos de pago
```

**Importar a base de datos:**

```javascript
// MongoDB
await db.collection('categorias').insertMany(categorias.categorias);

// Firestore
categorias.categorias.forEach(async (cat) => {
  await db.collection('categorias').doc(cat.id).set(cat);
});
```

---

### 2. **`CATEGORIAS.md`**

**Formato:** Markdown
**Uso:** Documentación / Referencia
**Descripción:** Documentación completa y legible de todas las categorías

Incluye:
- 📋 Listado detallado de todas las categorías
- 🎨 Iconos, colores y descripciones
- 📊 Tablas de subcategorías organizadas
- 💳 Métodos de pago disponibles
- 💱 Monedas soportadas
- 📈 Estadísticas (totales)
- 🔧 Ejemplos de uso en el backend
- 📝 Historial de versiones

**Uso:** Consulta para desarrolladores y documentación del proyecto.

---

### 3. **`categorias-types.ts`**

**Formato:** TypeScript
**Uso:** Frontend / Backend TypeScript
**Descripción:** Tipos y utilidades TypeScript para validación y type-safety

Contiene:
- ✅ Interfaces TypeScript completas
- ✅ Tipos literales para IDs
- ✅ Funciones de validación
- ✅ Helpers para crear mapas
- ✅ Type-safe subcategorías por categoría

**Ejemplo de uso:**

```typescript
import {
  isCategoriaValida,
  isMonedaValida,
  crearMapasCategorias
} from './categorias-types';
import categoriasData from './categorias.json';

// Validar
if (isCategoriaValida('alimentacion')) {
  console.log('Categoría válida');
}

// Crear mapas para acceso rápido
const { categorias, metodosPago, monedas } = crearMapasCategorias(categoriasData);
const cat = categorias.get('alimentacion');
console.log(cat?.nombre); // "Alimentación"
```

---

## 🚀 Cómo Usar en el Backend

### Opción 1: Servir Directamente desde JSON (Simple)

```javascript
const express = require('express');
const categoriasData = require('./categorias.json');

const app = express();

// Endpoint para obtener categorías
app.get('/api/categorias', (req, res) => {
  res.json({
    success: true,
    data: categoriasData.categorias
  });
});

// Endpoint para obtener métodos de pago
app.get('/api/metodos-pago', (req, res) => {
  res.json({
    success: true,
    data: categoriasData.metodosPago
  });
});

// Endpoint para obtener monedas
app.get('/api/monedas', (req, res) => {
  res.json({
    success: true,
    data: categoriasData.monedas
  });
});
```

### Opción 2: Importar a Base de Datos (Escalable)

```javascript
const categoriasData = require('./categorias.json');

// Script de importación (ejecutar una sola vez)
async function importarCategorias() {
  // MongoDB
  await db.collection('categorias').insertMany(categoriasData.categorias);
  await db.collection('metodos_pago').insertMany(categoriasData.metodosPago);
  await db.collection('monedas').insertMany(categoriasData.monedas);

  console.log('✅ Categorías importadas exitosamente');
}

// Luego usar en endpoints
app.get('/api/categorias', async (req, res) => {
  const categorias = await db.collection('categorias').find().toArray();
  res.json({ success: true, data: categorias });
});
```

---

## 🔍 Validación

### Validar al Crear Gastos

```typescript
import { isCategoriaValida, isMonedaValida, isMetodoPagoValido } from './categorias-types';

// En tu endpoint POST /api/gastos
app.post('/api/gastos', async (req, res) => {
  const { categoria, subcategoria, moneda, metodoPago } = req.body;

  // Validar categoría
  if (!isCategoriaValida(categoria)) {
    return res.status(400).json({
      error: 'Categoría inválida',
      message: `La categoría "${categoria}" no existe`
    });
  }

  // Validar moneda
  if (!isMonedaValida(moneda)) {
    return res.status(400).json({
      error: 'Moneda inválida',
      message: `La moneda "${moneda}" no está soportada`
    });
  }

  // Validar método de pago
  if (!isMetodoPagoValido(metodoPago)) {
    return res.status(400).json({
      error: 'Método de pago inválido',
      message: `El método de pago "${metodoPago}" no existe`
    });
  }

  // Continuar con la creación del gasto...
});
```

---

## 📊 Estructura de Datos

### Categoría

```typescript
{
  id: string;              // "alimentacion"
  nombre: string;          // "Alimentación"
  icono: string;           // "🍔"
  color: string;           // "#FF6B6B"
  descripcion: string;     // "Gastos relacionados con..."
  subcategorias: [         // Array de subcategorías
    {
      id: string;          // "supermercado"
      nombre: string;      // "Supermercado"
      descripcion: string; // "Compras de abarrotes..."
    }
  ]
}
```

### Método de Pago

```typescript
{
  id: string;          // "yape"
  nombre: string;      // "Yape"
  icono: string;       // "📱"
  descripcion: string; // "Pago con Yape (Perú)"
}
```

### Moneda

```typescript
{
  id: string;        // "PEN"
  nombre: string;    // "Soles Peruanos"
  simbolo: string;   // "S/"
  icono: string;     // "🇵🇪"
  codigoISO: string; // "PEN"
}
```

---

## 📈 Estadísticas

- **Categorías principales:** 9
- **Subcategorías totales:** 57
- **Métodos de pago:** 7
- **Monedas:** 2

### Distribución de Subcategorías

| Categoría | Subcategorías |
|---|---|
| Alimentación | 5 |
| Transporte | 6 |
| Entretenimiento | 6 |
| Salud | 7 |
| Servicios | 8 |
| Compras | 7 |
| Educación | 6 |
| Vivienda | 6 |
| Otros | 7 |

---

## 🔄 Actualizar Categorías

1. **Editar `categorias.json`**
   - Agregar/modificar categorías o subcategorías
   - Actualizar la versión y fecha

2. **Actualizar `CATEGORIAS.md`**
   - Documentar los cambios

3. **Actualizar `categorias-types.ts`** (si agregaste nuevas categorías)
   - Agregar IDs a los tipos literales
   - Actualizar las constantes

4. **Actualizar Backend**
   - Re-importar datos a la base de datos
   - O reiniciar el servidor si usas JSON directo

---

## 📝 Notas Importantes

1. **IDs únicos:** Todos los IDs usan `snake_case` (e.g., `tarjeta_credito`)
2. **Subcategorías opcionales:** No es obligatorio especificar una subcategoría
3. **Categoría General:** Es especial, no tiene subcategorías, se usa para presupuestos
4. **Métodos de pago locales:** Incluye Yape y Plin (específicos de Perú)
5. **Extensible:** Puedes agregar más categorías/métodos fácilmente

---

## 🎯 Endpoints Sugeridos para el Backend

```
GET  /api/categorias              - Todas las categorías con subcategorías
GET  /api/categorias/:id          - Una categoría específica
GET  /api/categorias/:id/subcategorias - Subcategorías de una categoría
GET  /api/metodos-pago            - Todos los métodos de pago
GET  /api/monedas                 - Todas las monedas
```

Ver especificación completa en **`BACKEND_API_SPEC.md`** sección "Categorías y Catálogos".

---

## ✅ Checklist de Implementación

- [ ] Revisar `categorias.json`
- [ ] Leer `CATEGORIAS.md` para entender la estructura
- [ ] Importar tipos de `categorias-types.ts` (si usas TypeScript)
- [ ] Decidir estrategia: ¿servir JSON directo o importar a BD?
- [ ] Implementar endpoints de catálogos
- [ ] Implementar validaciones en endpoints de gastos/presupuestos
- [ ] Probar endpoints con Postman/Insomnia
- [ ] Documentar en README del backend

---

## 🆘 Soporte

Si necesitas:
- **Agregar categorías:** Edita `categorias.json` y actualiza la documentación
- **Modificar subcategorías:** Edita el array de subcategorías de la categoría correspondiente
- **Agregar métodos de pago:** Agrega al array `metodosPago` en el JSON
- **Agregar monedas:** Agrega al array `monedas` en el JSON

**Recuerda actualizar la versión y fecha** en `categorias.json` después de hacer cambios.
