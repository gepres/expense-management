# Debugging - Entrada de Voz para Gastos

## Problema Reportado
Los gastos se guardan con éxito (aparece el toast de confirmación) pero no aparecen en el listado ni en la base de datos.

## Logs Agregados para Debugging

He agregado logs en la consola del navegador para ayudarte a identificar el problema:

### 1. En el Servicio de Voz (`src/services/voice.ts`)
```
📝 Respuesta del backend (voz): {...}
✅ Datos mapeados: {...}
```

### 2. En el Formulario (`FormularioGasto.tsx`)
```
💾 Datos del gasto a guardar: {...}
📋 FormData actual: {...}
```

## Cómo Debuggear

### Paso 1: Abre la Consola del Navegador
1. Presiona `F12` o `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
2. Ve a la pestaña "Console"

### Paso 2: Prueba la Entrada de Voz
1. Ve a "Nuevo Gasto"
2. Haz clic en el botón del micrófono
3. Di: "Gasté 50 soles en almuerzo"
4. Observa los logs en la consola

### Paso 3: Revisa los Logs

#### Log 1: Respuesta del Backend
```javascript
📝 Respuesta del backend (voz): {
  amount: 50,           // ← Puede ser "amount" en lugar de "monto"
  currency: "PEN",      // ← Puede ser "currency" en lugar de "moneda"
  category: "alimentacion",  // ← Puede ser "category" en lugar de "categoria"
  description: "Almuerzo",
  confidence: 0.95
}
```

**¿Qué revisar?**
- ¿Los nombres de los campos coinciden con lo esperado?
- ¿El backend usa inglés (amount, category) o español (monto, categoria)?

#### Log 2: Datos Mapeados
```javascript
✅ Datos mapeados: {
  monto: 50,
  moneda: "PEN",
  categoria: "alimentacion",
  subcategoria: undefined,
  descripcion: "Almuerzo",
  metodoPago: undefined,
  fecha: undefined,
  confidence: 0.95
}
```

**¿Qué revisar?**
- ¿Los datos se mapearon correctamente?
- ¿Hay campos `undefined` que deberían tener valores?

#### Log 3: Datos a Guardar
```javascript
💾 Datos del gasto a guardar: {
  userId: "abc123",
  fecha: Date,
  categoria: "alimentacion",
  monto: 50,
  moneda: "PEN",
  descripcion: "Almuerzo",
  metodoPago: "efectivo",
  recurrente: false
}
```

**¿Qué revisar?**
- ¿Todos los campos requeridos están presentes?
- ¿La fecha es válida?
- ¿El userId existe?

#### Log 4: FormData Actual
```javascript
📋 FormData actual: {
  fecha: "2025-11-20",
  hora: "14:30",
  categoria: "alimentacion",
  subcategoria: "",
  monto: "50",
  moneda: "PEN",
  descripcion: "Almuerzo",
  metodoPago: "efectivo",
  recurrente: false
}
```

## Problemas Comunes y Soluciones

### Problema 1: Campos con Nombres Diferentes

**Síntoma**: El backend devuelve `amount` pero el frontend espera `monto`

**Solución**: Ya implementado en `voice.ts` con mapeo flexible:
```typescript
monto: rawData.monto || rawData.amount || 0
```

Si el backend usa otros nombres, agrégalos al mapeo.

### Problema 2: Categoría Inválida

**Síntoma**: La categoría no coincide con las válidas

**Categorías válidas**:
- alimentacion
- transporte
- entretenimiento
- salud
- servicios
- compras
- educacion
- vivienda
- otros

**Solución**: Verifica que el backend devuelva una categoría válida.

### Problema 3: Método de Pago Inválido

**Métodos válidos**:
- efectivo
- tarjeta_debito
- tarjeta_credito
- transferencia
- yape
- plin
- otros

**Solución**: Si el backend devuelve "cash", mapéalo a "efectivo".

### Problema 4: Fecha Inválida

**Síntoma**: La fecha es `undefined` o tiene formato incorrecto

**Formato esperado**: `YYYY-MM-DD` (ej: "2025-11-20")

**Solución**: El código ya usa la fecha actual si no se proporciona:
```typescript
fecha: expenseData.fecha || formattedDate
```

### Problema 5: Moneda Inválida

**Monedas válidas**: `PEN` o `USD`

**Solución**: El código ya usa `PEN` por defecto:
```typescript
moneda: rawData.moneda || rawData.currency || 'PEN'
```

## Verificar en la Base de Datos

### Firebase Firestore
1. Ve a Firebase Console
2. Firestore Database
3. Colección `gastos`
4. Busca por `userId` del usuario actual
5. Verifica si el documento existe

### Campos Requeridos en Firestore
```javascript
{
  userId: string,
  fecha: Timestamp,
  categoria: string,
  monto: number,
  moneda: string,
  descripcion: string,
  metodoPago: string,
  recurrente: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Posibles Causas del Problema

### 1. Error Silencioso en el Backend
- El backend devuelve 200 OK pero no guarda en la DB
- Revisa los logs del servidor NestJS

### 2. Validación Fallida
- Firestore rechaza el documento por campos inválidos
- Revisa la consola de Firebase

### 3. Permisos de Firestore
- Las reglas de seguridad bloquean la escritura
- Verifica las reglas en Firebase Console

### 4. Usuario No Autenticado
- El `userId` es inválido o `null`
- Verifica que `usuario.id` exista en el log

## Siguiente Paso

1. **Reproduce el error** con la consola abierta
2. **Copia todos los logs** que aparecen
3. **Comparte los logs** para análisis
4. **Verifica Firebase Console** si el documento existe

## Ejemplo de Logs Completos

```
📝 Respuesta del backend (voz): {amount: 50, currency: 'PEN', category: 'alimentacion', ...}
✅ Datos mapeados: {monto: 50, moneda: 'PEN', categoria: 'alimentacion', ...}
💾 Datos del gasto a guardar: {userId: 'abc123', fecha: Wed Nov 20 2025, ...}
📋 FormData actual: {fecha: '2025-11-20', hora: '14:30', ...}
```

Con estos logs podremos identificar exactamente dónde está el problema.
