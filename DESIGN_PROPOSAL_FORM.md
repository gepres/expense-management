# 🎨 Propuesta de Diseño - Formulario de Gastos con Información Tributaria

## 📋 Nuevos Campos a Agregar

### Campos de Comprobante
- **voucherType**: Tipo de comprobante (por defecto: "boleta")
  - Opciones: boleta, factura, recibo, ticket, nota-debito, nota-credito
- **voucherNumber**: Número del comprobante (ej: B001-00012345)
- **reimbursementStatus**: Estado de reembolso (por defecto: "pending")
  - Opciones: pending, approved, rejected, paid

### Campos Específicos para Factura (visible solo si voucherType === 'factura')
- **ruc**: RUC del emisor (obligatorio para facturas)
- **igv**: Monto de IGV (18% en Perú)
- **subtotal**: Monto sin IGV

---

## 🖥️ VERSIÓN DESKTOP

### Layout Propuesto (guiado por estilo de ShoppingListItemForm)

```
┌─────────────────────────────────────────────────────────────────┐
│                         NUEVO GASTO                              │
│                                                    [🎤] [📷]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Atajos Rápidos - Grid Horizontal]                            │
│  ┌────────┐ ┌────────┐ ┌────────┐                             │
│  │ 🍽️     │ │ 🚗     │ │ ☕     │  [+]                        │
│  │ Almuer.│ │ Gasolna│ │ Café   │                             │
│  └────────┘ └────────┘ └────────┘                             │
│                                                                  │
│  [Escanear Recibo]                                              │
│  📷 Sube tu recibo y autocompletamos el formulario              │
│  [Subir Boleta (Yape + Plin + Trans.)]                         │
│                                                                  │
│  ┌─────────────────────┬─────────────────────┐                 │
│  │ Fecha *             │ Hora *              │                 │
│  │ [2024-01-15]       │ [14:30]            │                 │
│  └─────────────────────┴─────────────────────┘                 │
│                                                                  │
│  ┌──────────┬──────────┬──────────┐                            │
│  │ Categ. * │ Subcateg.│ Moneda * │                            │
│  │ [Alimen.]│ [Resto]  │ [S/ PEN] │                            │
│  └──────────┴──────────┴──────────┘                            │
│                                                                  │
│  ┌─────────────────────┬─────────────────────┐                 │
│  │ Monto *             │ Método Pago *       │                 │
│  │ [50.00]            │ [Yape]             │                 │
│  └─────────────────────┴─────────────────────┘                 │
│                                                                  │
│  Descripción                                                    │
│  ┌───────────────────────────────────────────┐                 │
│  │ Almuerzo en restaurante...                │                 │
│  │                                            │                 │
│  └───────────────────────────────────────────┘                 │
│                                                                  │
│  💡 Sugerencias para Restaurante              [+]              │
│  [Menú]  [Buffet]  [Comida rápida]  [Comida criolla]          │
│                                                                  │
│  Etiquetas (opcional)                                           │
│  [trabajo, equipo...]                                           │
│                                                                  │
│  ☐ Gasto recurrente                                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🧾 Información Tributaria                               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  ┌─────────────────────┬─────────────────────┐         │   │
│  │  │ Tipo Comprobante    │ Núm. Comprobante    │         │   │
│  │  │ [Boleta ▼]         │ [B001-12345]       │         │   │
│  │  └─────────────────────┴─────────────────────┘         │   │
│  │                                                          │   │
│  │  ┌─────────────────────┐                                │   │
│  │  │ Estado Reembolso    │                                │   │
│  │  │ [Pendiente ▼]      │                                │   │
│  │  └─────────────────────┘                                │   │
│  │                                                          │   │
│  │  ━━━━━ SI ES FACTURA, MOSTRAR: ━━━━━                   │   │
│  │                                                          │   │
│  │  ┌───────────────────────────────────────────┐          │   │
│  │  │ RUC *                                      │          │   │
│  │  │ [20123456789]                             │          │   │
│  │  └───────────────────────────────────────────┘          │   │
│  │                                                          │   │
│  │  ┌─────────────────────┬─────────────────────┐         │   │
│  │  │ Subtotal            │ IGV (18%)           │         │   │
│  │  │ [42.37]            │ [7.63]             │         │   │
│  │  └─────────────────────┴─────────────────────┘         │   │
│  │                                                          │   │
│  │  💡 Tip: El subtotal e IGV se calculan automáticamente  │   │
│  │      basándose en el monto total ingresado              │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              [Guardar Gasto]    [Cancelar]              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Detalles de Diseño Desktop:

1. **Sección "Información Tributaria"** (nueva):
   - Card independiente con borde y fondo `bg-card`
   - Header con ícono 🧾 Receipt
   - Grid de 2 columnas para los campos
   - Animación `slide-in` cuando se cambia a "factura"
   - Tip visual sobre cálculo automático de IGV

2. **Lógica Condicional**:
   - Por defecto: Muestra solo "Tipo Comprobante", "Número" y "Estado Reembolso"
   - Si `voucherType === 'factura'`: Se expande mostrando RUC, Subtotal e IGV

3. **Auto-cálculo**:
   - Cuando el usuario ingresa el monto total y selecciona "Factura"
   - Subtotal = Monto / 1.18
   - IGV = Monto - Subtotal

---

## 📱 VERSIÓN MOBILE

### Layout Propuesto (estilo iOS/Android moderno)

```
┌─────────────────────────────────┐
│                                  │
│   [📷]  NUEVO GASTO      [🎤]   │
│                                  │
│ ───────────────────────────────  │
│                                  │
│  [Atajos - Scroll Horizontal]   │
│  🍽️   🚗   ☕   🛒   [+]        │
│  Alma  Gas  Café Comp            │
│                                  │
│ ───────────────────────────────  │
│                                  │
│     ¿Cuánto gastaste?            │
│                                  │
│        S/ 50.00                  │
│        ──────                    │
│                                  │
│ ───────────────────────────────  │
│                                  │
│  Categoría                       │
│  [Alimen] [Transp] [Entret] →   │
│                                  │
│  Subcategoría                    │
│  [Rest] [Café] [Mercado] →      │
│                                  │
│ ───────────────────────────────  │
│                                  │
│  📝 Descripción (Opcional)       │
│  ┌─────────────────────────────┐│
│  │ Almuerzo en restaurante...  ││
│  └─────────────────────────────┘│
│                                  │
│  💡 [Menú] [Buffet] [Criolla] → │
│                                  │
│ ───────────────────────────────  │
│                                  │
│  ▼ Detalles (Fecha, Pago, etc)  │
│                                  │
│     [Expandible con acordeón]    │
│                                  │
│ ───────────────────────────────  │
│                                  │
│  🧾 Información Tributaria       │
│  ┌─────────────────────────────┐│
│  │ Tipo:   [Boleta ▼]         ││
│  │ Número: [B001-12345]       ││
│  │ Estado: [Pendiente ▼]      ││
│  │                             ││
│  │ ━━ SI ES FACTURA ━━        ││
│  │                             ││
│  │ RUC:     [20123456789]     ││
│  │ Subtotal: [42.37]          ││
│  │ IGV:      [7.63]           ││
│  └─────────────────────────────┘│
│                                  │
│ ═══════════════════════════════  │
│                                  │
│  [  Cancelar  ] [ Guardar ✓ ]   │
│                                  │
└─────────────────────────────────┘
```

### Detalles de Diseño Mobile:

1. **Sección "Información Tributaria"**:
   - Card redondeado (`rounded-2xl`) con padding
   - Diseño vertical para mejor UX en pantallas pequeñas
   - Campos apilados verticalmente
   - Estado de reembolso siempre visible

2. **Ubicación**:
   - Después de la sección "Detalles" (acordeón)
   - Antes de los botones de acción

3. **Campos Condicionales (Factura)**:
   - Se muestran con animación `slide-in-from-top-2`
   - RUC en campo completo (ancho 100%)
   - Subtotal e IGV en grid 2 columnas

4. **Estados Visuales**:
   - Inputs con `bg-muted/50`
   - Bordes suaves `border-border`
   - Labels en `text-muted-foreground`
   - Focus con `ring-primary/20`

---

## 🎯 Flujo de Usuario

### Caso 1: Boleta (Defecto)
1. Usuario llena el formulario normalmente
2. En "Información Tributaria" ve:
   - Tipo: Boleta (por defecto)
   - Número: (opcional)
   - Estado: Pendiente (por defecto)

### Caso 2: Factura
1. Usuario cambia "Tipo Comprobante" a "Factura"
2. Se expanden automáticamente los campos:
   - RUC (obligatorio)
   - Subtotal (auto-calculado)
   - IGV (auto-calculado)
3. Si el monto ya está ingresado, el sistema calcula:
   - Subtotal = Monto / 1.18
   - IGV = Monto - Subtotal

### Caso 3: Usuario Edita Monto con Factura Seleccionada
1. Al escribir en el campo "Monto"
2. Si `voucherType === 'factura'`
3. Se recalculan automáticamente Subtotal e IGV
4. El usuario puede sobrescribir si es necesario

---

## 🎨 Paleta de Colores (según tema actual)

```css
/* Card de Información Tributaria */
.voucher-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 0.75rem; /* rounded-xl */
}

/* Campos de Input */
.voucher-input {
  background: hsl(var(--muted) / 0.5);
  border: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
}

/* Labels */
.voucher-label {
  color: hsl(var(--muted-foreground));
  font-size: 0.75rem;
  font-weight: 500;
}

/* Animación cuando aparece RUC/IGV/Subtotal */
.animate-in {
  animation: slideInFromTop 200ms ease-out;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## ✅ Validaciones

### Tipo Boleta/Recibo/Ticket:
- voucherNumber: Opcional
- reimbursementStatus: Opcional (defecto: pending)

### Tipo Factura:
- ruc: **Obligatorio** (11 dígitos para Perú)
- voucherNumber: Obligatorio
- subtotal: Auto-calculado (editable)
- igv: Auto-calculado (editable)
- reimbursementStatus: Opcional

### Formato de Validación RUC:
```typescript
const validarRUC = (ruc: string): boolean => {
  return /^\d{11}$/.test(ruc); // Exactamente 11 dígitos numéricos
};
```

---

## 📦 Estructura de Datos Final

```typescript
interface GastoFormData {
  // ... campos existentes
  fecha: string;
  hora: string;
  categoria: CategoriaGasto;
  subcategoria?: string;
  monto: string;
  moneda: Moneda;
  descripcion: string;
  metodoPago: MetodoPago;
  tags?: string[];
  recurrente?: boolean;
  shoppingListId?: string;

  // ✨ NUEVOS CAMPOS
  voucherType: 'boleta' | 'factura' | 'recibo' | 'ticket' | 'nota-debito' | 'nota-credito';
  voucherNumber?: string;
  ruc?: string; // Solo obligatorio si voucherType === 'factura'
  igv?: string; // Solo visible si voucherType === 'factura'
  subtotal?: string; // Solo visible si voucherType === 'factura'
  reimbursementStatus: 'pending' | 'approved' | 'rejected' | 'paid';
}
```

---

## 🚀 Implementación Sugerida

### 1. Actualizar `types/index.ts`:
```typescript
export type VoucherType = 'boleta' | 'factura' | 'recibo' | 'ticket' | 'nota-debito' | 'nota-credito';
export type ReimbursementStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface GastoFormData {
  // ... campos existentes
  voucherType: VoucherType;
  voucherNumber?: string;
  ruc?: string;
  igv?: string;
  subtotal?: string;
  reimbursementStatus: ReimbursementStatus;
}
```

### 2. Modificar `FormularioGasto.tsx`:
- Agregar campos al estado inicial
- Agregar handler `handleVoucherTypeChange`
- Agregar auto-cálculo de IGV y Subtotal
- Renderizar la nueva sección "Información Tributaria"

### 3. Actualizar Firestore:
- Modificar el schema de `Gasto` en Firestore para incluir los nuevos campos
- Actualizar `gastosService.crear()` y `gastosService.actualizar()`

---

## 📐 Medidas y Espaciados

### Desktop:
- Card: `p-4` (16px)
- Gap entre campos: `gap-4` (16px)
- Border radius: `rounded-xl` (12px)

### Mobile:
- Card: `p-3` (12px)
- Gap entre campos: `gap-3` (12px)
- Border radius: `rounded-2xl` (16px)

---

## 🎭 Estados de Reembolso (con íconos)

```typescript
const REIMBURSEMENT_STATUS_LABELS = {
  pending: { label: 'Pendiente', color: 'text-yellow-600', icon: '⏳' },
  approved: { label: 'Aprobado', color: 'text-green-600', icon: '✅' },
  rejected: { label: 'Rechazado', color: 'text-red-600', icon: '❌' },
  paid: { label: 'Pagado', color: 'text-blue-600', icon: '💰' },
};
```

---

## 💡 Mejoras Futuras (Opcionales)

1. **OCR para Facturas**:
   - Escanear factura física
   - Extraer automáticamente: RUC, número de comprobante, IGV, subtotal

2. **Validación SUNAT**:
   - Consultar RUC en API de SUNAT
   - Validar que el comprobante existe

3. **Exportación Contable**:
   - Generar reporte de gastos con facturas
   - Exportar en formato para contadores

4. **Dashboard de Reembolsos**:
   - Vista especial para gastos reembolsables
   - Filtros por estado de reembolso

---

## 📝 Notas Técnicas

1. **Performance**: Los cálculos de IGV/Subtotal son instantáneos (O(1))
2. **Accesibilidad**: Todos los campos tienen labels y son navegables con teclado
3. **Responsive**: Grid se adapta a 1 columna en mobile
4. **Compatibilidad**: No requiere librerías adicionales

---

## ✨ Resumen Visual

### Desktop:
```
+----------------+
| FORM EXISTENTE |
+----------------+
| 🧾 INFO TRIB   |
| ┌────────────┐ |
| │ Tipo/Núm   │ |
| │ Estado     │ |
| │ [SI FACT]  │ |
| │ RUC/IGV    │ |
| └────────────┘ |
+----------------+
| [Guardar] [X]  |
+----------------+
```

### Mobile:
```
+----------+
| FORM     |
| MOBILE   |
| EXISTENTE|
+----------+
| 🧾 TRIB  |
| ┌──────┐ |
| │ Tipo │ |
| │ Núm  │ |
| │ RUC  │ |
| └──────┘ |
+----------+
| [Botones]|
+----------+
```

---

**Fecha**: 2025-01-24
**Autor**: Claude Code
**Versión**: 1.0.0
