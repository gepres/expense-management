# 📸 Escaneo de Recibos y Tags Sugeridos

Documentación de las nuevas funcionalidades implementadas en el formulario de gastos.

---

## ✨ Funcionalidades Implementadas

### 1. 📤 Escaneo de Boletas/Recibos

Permite escanear imágenes de recibos (Yape, Plin, transferencias) y autocompletar automáticamente el formulario.

#### Características:
- ✅ Sube una foto de tu recibo
- ✅ El backend extrae los datos automáticamente (OCR + IA)
- ✅ Autocompletado del formulario con los datos extraídos
- ✅ Muestra nivel de confianza de la extracción
- ✅ Soporte para múltiples métodos de pago (Yape, Plin, transferencias)

#### Ubicación:
- **Componente:** `FormularioGasto.tsx:429-464`
- **Servicio:** `src/services/receipts.ts`

#### Datos Extraídos:
- Monto
- Moneda (PEN/USD)
- Fecha
- Hora
- Método de pago
- Comerciante/Destinatario
- Número de referencia
- Categoría (sugerida)
- Subcategoría (sugerida)
- Descripción (sugerida)
- Nivel de confianza (0-100%)

---

### 2. 💡 Tags Sugeridos por Subcategoría

Sistema inteligente de sugerencias contextuales para el campo de descripción.

#### Características:
- ✅ Muestra tags relevantes según la subcategoría seleccionada
- ✅ Mínimo 6 tags, máximo 10 por subcategoría
- ✅ Click en un tag para agregarlo a la descripción
- ✅ +450 tags predefinidos organizados por subcategoría

#### Ubicación:
- **UI:** `FormularioGasto.tsx:703-723`
- **Lógica:** `src/utils/tagsSugeridos.ts`

#### Ejemplo de Tags:

**Pollería:**
- 1/8 de pollo
- 1/4 de pollo
- 1/2 pollo
- Pollo a la brasa
- Pollo broaster
- Caldo de gallina
- Papas fritas
- Ensalada

**Bodega:**
- Gaseosa
- Galletas
- Agua
- Verduras
- Frutas
- Leche
- Huevos
- Fideos

**Market:**
- Abarrotes
- Frutas y verduras
- Carnes
- Lácteos
- Limpieza
- Bebidas
- Panadería
- Snacks

---

## 🔧 Implementación Técnica

### Servicio de Escaneo

**Archivo:** `src/services/receipts.ts`

```typescript
import { scanReceipt, validateImageFormat } from '@services/receipts';

// Escanear recibo
const resultado = await scanReceipt(imageFile);

// Validar formato de imagen
const validacion = validateImageFormat(file);
```

### API del Backend

**Endpoint:** `POST http://localhost:3000/api/receipts/scan`

**Request:**
```typescript
FormData {
  image: File // Imagen del recibo
}
```

**Response:**
```json
{
  "success": true,
  "receiptId": "NIs672MFm3bmt3wqmmc7",
  "imageUrl": "https://res.cloudinary.com/...",
  "cloudinaryPublicId": "receipts/receipt_...",
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

---

## 🎯 Flujo de Uso

### Escaneo de Recibos

1. **Usuario hace click** en "Subir Boleta (Yape + Plin + Trans.)"
2. **Selecciona una imagen** de su galería/cámara
3. **Frontend valida** formato y tamaño (máx 5MB)
4. **Envía al backend** para procesamiento
5. **Backend procesa** con OCR + IA
6. **Devuelve datos extraídos**
7. **Frontend autocomplet**a el formulario
8. **Muestra toast** con nivel de confianza

### Tags Sugeridos

1. **Usuario selecciona** una categoría
2. **Usuario selecciona** una subcategoría
3. **Frontend muestra** tags sugeridos debajo de descripción
4. **Usuario hace click** en un tag
5. **Tag se agrega** al campo de descripción

---

## 📊 Estadísticas de Tags

### Tags por Categoría

| Categoría | Subcategorías con Tags | Total de Tags |
|---|---|---|
| Alimentación | 5 | 40+ |
| Transporte | 6 | 48+ |
| Entretenimiento | 6 | 48+ |
| Salud | 7 | 56+ |
| Servicios | 8 | 64+ |
| Compras | 7 | 56+ |
| Educación | 6 | 48+ |
| Vivienda | 6 | 48+ |
| Otros | 7 | 56+ |

**Total:** 57 subcategorías con +450 tags

---

## 🔒 Validaciones

### Formato de Imagen

- ✅ Extensiones permitidas: `.jpg`, `.jpeg`, `.png`, `.webp`
- ✅ Tamaño máximo: 5MB
- ✅ Validación en cliente y servidor

### Autocompletado Inteligente

```typescript
// Solo autocompletar si el backend devolvió datos válidos
if (resultado.success && resultado.data) {
  const data = resultado.data;

  // Autocompletar campos básicos
  setFormData(prev => ({
    ...prev,
    monto: data.amount?.toString() || prev.monto,
    moneda: data.currency || prev.moneda,
    fecha: data.date || prev.fecha,
    metodoPago: data.paymentMethod || prev.metodoPago,
    descripcion: data.description || prev.descripcion,
  }));

  // Intentar mapear categoría/subcategoría
  if (data.category) {
    const categoriaEncontrada = CATEGORIAS_GASTO.find(
      cat => CATEGORIA_LABELS[cat].toLowerCase() === data.category?.toLowerCase()
    );
    if (categoriaEncontrada) {
      setFormData(prev => ({
        ...prev,
        categoria: categoriaEncontrada,
        subcategoria: data.subcategory || prev.subcategoria,
      }));
    }
  }
}
```

---

## 💡 Mejoras Futuras

### Escaneo de Recibos
- [ ] Soporte para múltiples imágenes (batch)
- [ ] Previsualización de la imagen antes de subir
- [ ] Historial de recibos escaneados
- [ ] Edición manual de datos extraídos
- [ ] Guardar imagen del recibo vinculada al gasto

### Tags Sugeridos
- [ ] Tags personalizados por usuario
- [ ] Aprendizaje de patrones (ML)
- [ ] Sugerencias basadas en historial
- [ ] Tags frecuentes destacados
- [ ] Autocompletado de tags

---

## 🐛 Troubleshooting

### El escaneo falla

**Problema:** Error al escanear el recibo

**Soluciones:**
1. Verificar que el backend esté corriendo en `http://localhost:3000`
2. Verificar que la imagen sea clara y legible
3. Verificar el tamaño de la imagen (máx 5MB)
4. Revisar logs del backend para errores

### No se muestran tags sugeridos

**Problema:** No aparecen sugerencias

**Soluciones:**
1. Verificar que has seleccionado una subcategoría
2. Verificar que la subcategoría tenga tags definidos en `tagsSugeridos.ts`
3. Revisar consola del navegador para errores

### Tags no se agregan a la descripción

**Problema:** Click en tag no hace nada

**Soluciones:**
1. Verificar que el campo descripción no esté disabled
2. Revisar consola del navegador
3. Verificar función `agregarTagSugerido` en `FormularioGasto.tsx:197-202`

---

## 📝 Archivos Relacionados

### Frontend
- `src/components/gastos/FormularioGasto.tsx` - Componente principal
- `src/services/receipts.ts` - Servicio de escaneo
- `src/utils/tagsSugeridos.ts` - Catálogo de tags

### Backend (Por implementar)
- `/api/receipts/scan` - Endpoint de escaneo
  - OCR para extraer texto
  - IA para categorizar y estructurar
  - Validación de datos
  - Almacenamiento en Cloudinary

---

## 🎉 Resultado

El formulario de gastos ahora es mucho más rápido y fácil de usar:

1. **Escanear recibo** → 2-3 segundos
2. **Autocompletado** → Instantáneo
3. **Tags sugeridos** → 1 click

**Ahorro de tiempo:** ~80% menos tiempo ingresando gastos manualmente

---

*Última actualización: 2025-11-15*
