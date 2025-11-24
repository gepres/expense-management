# 🔥 Reglas de Firestore Actualizadas

## Nuevos Campos Agregados a la Colección `gastos`

Los siguientes campos opcionales han sido agregados a los documentos de gastos:

```typescript
interface Gasto {
  // ... campos existentes

  // Nuevos campos de información tributaria
  voucherType?: 'boleta' | 'factura' | 'recibo' | 'ticket' | 'nota-debito' | 'nota-credito';
  voucherNumber?: string;        // Número de comprobante (ej: B001-12345)
  ruc?: string;                  // RUC del emisor (obligatorio para facturas)
  igv?: number;                  // Monto de IGV (18% en Perú)
  subtotal?: number;             // Monto sin IGV
  reimbursementStatus?: 'pending' | 'approved' | 'rejected' | 'paid';
}
```

## Reglas de Firestore Actualizadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Función helper para validar gastos
    function isValidGasto(gasto) {
      return gasto.userId is string &&
             gasto.fecha is timestamp &&
             gasto.categoria is string &&
             gasto.monto is number &&
             gasto.monto > 0 &&
             gasto.moneda in ['PEN', 'USD'] &&
             gasto.descripcion is string &&
             gasto.metodoPago is string &&
             gasto.recurrente is bool &&

             // Validaciones de información tributaria (opcionales)
             (!('voucherType' in gasto) ||
              gasto.voucherType in ['boleta', 'factura', 'recibo', 'ticket', 'nota-debito', 'nota-credito']) &&

             (!('voucherNumber' in gasto) || gasto.voucherNumber is string) &&

             (!('ruc' in gasto) ||
              (gasto.ruc is string && gasto.ruc.size() == 11)) &&

             (!('igv' in gasto) ||
              (gasto.igv is number && gasto.igv >= 0)) &&

             (!('subtotal' in gasto) ||
              (gasto.subtotal is number && gasto.subtotal >= 0)) &&

             (!('reimbursementStatus' in gasto) ||
              gasto.reimbursementStatus in ['pending', 'approved', 'rejected', 'paid']);
    }

    // Reglas para la colección de gastos
    match /gastos/{gastoId} {
      // Leer: Solo si es el dueño
      allow read: if request.auth != null &&
                     resource.data.userId == request.auth.uid;

      // Crear: Solo si está autenticado y es el dueño
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid &&
                       isValidGasto(request.resource.data);

      // Actualizar: Solo si es el dueño y mantiene userId
      allow update: if request.auth != null &&
                       resource.data.userId == request.auth.uid &&
                       request.resource.data.userId == request.auth.uid &&
                       isValidGasto(request.resource.data);

      // Eliminar: Solo si es el dueño
      allow delete: if request.auth != null &&
                       resource.data.userId == request.auth.uid;
    }

    // Reglas para usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null &&
                            request.auth.uid == userId;
    }

    // Reglas para presupuestos
    match /presupuestos/{presupuestoId} {
      allow read, write: if request.auth != null &&
                            resource.data.userId == request.auth.uid;
    }
  }
}
```

## Validaciones Específicas

### 1. **voucherType**
- Tipo: String
- Valores permitidos: `'boleta'`, `'factura'`, `'recibo'`, `'ticket'`, `'nota-debito'`, `'nota-credito'`
- Opcional

### 2. **voucherNumber**
- Tipo: String
- Formato libre (ej: "B001-12345", "F001-00012345")
- Opcional

### 3. **ruc**
- Tipo: String
- Longitud: Exactamente 11 caracteres (RUC peruano)
- Opcional, pero recomendado cuando `voucherType === 'factura'`

### 4. **igv**
- Tipo: Number
- Valor: >= 0
- Opcional
- Se calcula automáticamente en el frontend: `igv = monto - subtotal`

### 5. **subtotal**
- Tipo: Number
- Valor: >= 0
- Opcional
- Se calcula automáticamente en el frontend: `subtotal = monto / 1.18`

### 6. **reimbursementStatus**
- Tipo: String
- Valores permitidos: `'pending'`, `'approved'`, `'rejected'`, `'paid'`
- Opcional
- Por defecto: `'pending'`

## Migración de Datos Existentes

Los gastos existentes en la base de datos **NO requieren migración** porque todos los nuevos campos son opcionales. Los documentos existentes seguirán funcionando sin problemas.

## Ejemplo de Documento en Firestore

### Documento con Boleta (mínimo)
```json
{
  "userId": "abc123",
  "fecha": "2024-01-15T14:30:00Z",
  "categoria": "alimentacion",
  "subcategoria": "restaurante",
  "monto": 50.00,
  "moneda": "PEN",
  "descripcion": "Almuerzo en restaurante",
  "metodoPago": "yape",
  "recurrente": false,
  "voucherType": "boleta",
  "voucherNumber": "B001-12345",
  "reimbursementStatus": "pending",
  "createdAt": "2024-01-15T14:35:00Z",
  "updatedAt": "2024-01-15T14:35:00Z"
}
```

### Documento con Factura (completo)
```json
{
  "userId": "abc123",
  "fecha": "2024-01-15T14:30:00Z",
  "categoria": "servicios",
  "subcategoria": "consultoria",
  "monto": 118.00,
  "moneda": "PEN",
  "descripcion": "Servicio de consultoría IT",
  "metodoPago": "transferencia",
  "recurrente": false,
  "voucherType": "factura",
  "voucherNumber": "F001-00012345",
  "ruc": "20123456789",
  "subtotal": 100.00,
  "igv": 18.00,
  "reimbursementStatus": "approved",
  "createdAt": "2024-01-15T14:35:00Z",
  "updatedAt": "2024-01-15T14:35:00Z"
}
```

## Índices Recomendados en Firestore

Para optimizar las consultas, se recomienda crear los siguientes índices compuestos:

### 1. Filtrar por estado de reembolso
```
Collection: gastos
Fields:
  - userId (Ascending)
  - reimbursementStatus (Ascending)
  - fecha (Descending)
```

### 2. Filtrar por tipo de comprobante
```
Collection: gastos
Fields:
  - userId (Ascending)
  - voucherType (Ascending)
  - fecha (Descending)
```

### 3. Facturas por estado de reembolso
```
Collection: gastos
Fields:
  - userId (Ascending)
  - voucherType (Ascending)
  - reimbursementStatus (Ascending)
  - fecha (Descending)
```

## Cómo Actualizar las Reglas

1. Ve a Firebase Console: https://console.firebase.google.com
2. Selecciona tu proyecto
3. Ve a **Firestore Database** > **Rules**
4. Copia y pega las reglas actualizadas
5. Haz clic en **Publish**

---

**Última actualización**: 2024-11-24
**Versión**: 1.0.0
