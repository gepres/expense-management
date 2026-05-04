# 🎨 Propuesta de Diseño v2 - Formulario de Gastos con Información Tributaria

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

## 🖥️ VERSIÓN DESKTOP (Estilo iOS Settings - ShoppingListDetail)

### Layout Propuesto

```
┌─────────────────────────────────────────────────────────────────┐
│                         NUEVO GASTO                    [🎤] [📷]│
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
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ┌─────────────────────────────┬────────────────────────┐ │  │
│  │ │ 📅 Fecha *                  │ 🕐 Hora *              │ │  │
│  │ │ [2024-01-15]               │ [14:30]               │ │  │
│  │ ├─────────────────────────────┴────────────────────────┤ │  │
│  │ │ 🏷️ Categoría *              │ Subcategoría          │ │  │
│  │ │ [Alimentación ▼]           │ [Restaurante ▼]      │ │  │
│  │ ├─────────────────────────────┼────────────────────────┤ │  │
│  │ │ 💰 Monto *                  │ 💳 Método de Pago *   │ │  │
│  │ │ [50.00]                    │ [Yape ▼]             │ │  │
│  │ ├─────────────────────────────┴────────────────────────┤ │  │
│  │ │ 💵 Moneda *                                          │ │  │
│  │ │ [S/ PEN ▼]                                          │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
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
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🧾 Información Tributaria                                │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ┌─────────────────────────────┬────────────────────────┐ │  │
│  │ │ 📄 Tipo de Comprobante      │ 🔢 Núm. Comprobante   │ │  │
│  │ │ [Boleta ▼]                 │ [B001-12345]         │ │  │
│  │ ├─────────────────────────────┴────────────────────────┤ │  │
│  │ │ 🔄 Estado de Reembolso                               │ │  │
│  │ │ [Pendiente ⏳ ▼]                                     │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ━━━━━━━━━ SI voucherType === 'factura' ━━━━━━━━━             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🏢 Datos de Factura                                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ 🏢 RUC del Emisor *                                  │ │  │
│  │ │ [20123456789]                                        │ │  │
│  │ ├─────────────────────────────┬────────────────────────┤ │  │
│  │ │ 📊 Subtotal                 │ 📈 IGV (18%)          │ │  │
│  │ │ [42.37]                    │ [7.63]               │ │  │
│  │ └─────────────────────────────┴────────────────────────┘ │  │
│  │                                                            │  │
│  │ 💡 Tip: El subtotal e IGV se calculan automáticamente     │  │
│  │     basándose en el monto total (Monto / 1.18)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              [Guardar Gasto]    [Cancelar]              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Código JSX Desktop (Inspirado en ShoppingListDetail)

```tsx
{/* ========== VERSIÓN DESKTOP ========== */}
<div className="hidden md:block space-y-4">
  {/* ... Atajos Rápidos y Escanear (ya existentes) ... */}

  {/* Campos Principales - Estilo iOS Settings */}
  <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
    {/* Fecha y Hora */}
    <div className="flex divide-x divide-border">
      <div className="flex-1 p-3 flex items-center gap-3">
        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
          <Calendar className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground block mb-0.5">Fecha *</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="bg-transparent text-sm w-full focus:outline-none font-medium"
          />
        </div>
      </div>

      <div className="w-1/3 p-3 flex items-center gap-3">
        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
          <Clock className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground block mb-0.5">Hora *</label>
          <input
            type="time"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            className="bg-transparent text-sm w-full focus:outline-none font-medium"
          />
        </div>
      </div>
    </div>

    {/* Categoría y Subcategoría */}
    <div className="flex divide-x divide-border">
      <div className="flex-1 p-3 flex items-center gap-3">
        <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-600">
          <Tag className="h-4 w-4" />
        </div>
        <select
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className="bg-transparent text-sm w-full focus:outline-none appearance-none font-medium"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 p-3">
        <select
          name="subcategoria"
          value={formData.subcategoria}
          onChange={handleChange}
          className="bg-transparent text-sm w-full focus:outline-none appearance-none font-medium"
        >
          <option value="">Subcategoría</option>
          {getSubcategories(formData.categoria).map(sub => (
            <option key={sub.id} value={sub.id}>{sub.nombre}</option>
          ))}
        </select>
      </div>
    </div>

    {/* Monto y Método de Pago */}
    <div className="flex divide-x divide-border">
      <div className="flex-1 p-3 flex items-center gap-3">
        <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600">
          <CircleDollarSign className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground block mb-0.5">Monto *</label>
          <input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            step="0.01"
            placeholder="0.00"
            className="bg-transparent text-sm w-full focus:outline-none font-semibold"
          />
        </div>
      </div>

      <div className="flex-1 p-3 flex items-center gap-3">
        <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600">
          <CreditCard className="h-4 w-4" />
        </div>
        <select
          name="metodoPago"
          value={formData.metodoPago}
          onChange={handleChange}
          className="bg-transparent text-sm w-full focus:outline-none appearance-none font-medium"
        >
          {paymentMethods.map(method => (
            <option key={method.id} value={method.id}>{method.nombre}</option>
          ))}
        </select>
      </div>
    </div>

    {/* Moneda */}
    <div className="p-3 flex items-center gap-3">
      <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-600">
        <Coins className="h-4 w-4" />
      </div>
      <span className="text-sm font-medium flex-1">Moneda</span>
      <select
        name="moneda"
        value={formData.moneda}
        onChange={handleChange}
        className="bg-transparent text-sm focus:outline-none appearance-none font-semibold text-right pr-2"
      >
        {currencies.map(curr => (
          <option key={curr.id} value={curr.codigoISO}>
            {curr.simbolo} {curr.codigoISO}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* ... Descripción, Sugerencias, Tags, Recurrente (ya existentes) ... */}

  {/* ============ NUEVA SECCIÓN: INFORMACIÓN TRIBUTARIA ============ */}
  <div className="bg-card border border-border rounded-xl overflow-hidden">
    <div className="p-3 bg-muted/30 border-b border-border">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <Receipt className="h-4 w-4 text-primary" />
        Información Tributaria
      </h3>
    </div>

    <div className="divide-y divide-border">
      {/* Tipo de Comprobante y Número */}
      <div className="flex divide-x divide-border">
        <div className="flex-1 p-3 flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600">
            <FileText className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground block mb-0.5">
              Tipo de Comprobante
            </label>
            <select
              name="voucherType"
              value={formData.voucherType}
              onChange={handleVoucherTypeChange}
              className="bg-transparent text-sm w-full focus:outline-none appearance-none font-medium"
            >
              <option value="boleta">Boleta</option>
              <option value="factura">Factura</option>
              <option value="recibo">Recibo</option>
              <option value="ticket">Ticket</option>
              <option value="nota-debito">Nota Débito</option>
              <option value="nota-credito">Nota Crédito</option>
            </select>
          </div>
        </div>

        <div className="flex-1 p-3 flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600">
            <Hash className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground block mb-0.5">
              Número de Comprobante
            </label>
            <input
              type="text"
              name="voucherNumber"
              value={formData.voucherNumber}
              onChange={handleChange}
              placeholder="B001-12345"
              className="bg-transparent text-sm w-full focus:outline-none font-medium"
            />
          </div>
        </div>
      </div>

      {/* Estado de Reembolso */}
      <div className="p-3 flex items-center gap-3">
        <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600">
          <RefreshCw className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium flex-1">Estado de Reembolso</span>
        <select
          name="reimbursementStatus"
          value={formData.reimbursementStatus}
          onChange={handleChange as any}
          className="bg-transparent text-sm focus:outline-none appearance-none font-semibold text-right pr-2"
        >
          <option value="pending">⏳ Pendiente</option>
          <option value="approved">✅ Aprobado</option>
          <option value="rejected">❌ Rechazado</option>
          <option value="paid">💰 Pagado</option>
        </select>
      </div>
    </div>
  </div>

  {/* ============ SECCIÓN CONDICIONAL: DATOS DE FACTURA ============ */}
  {formData.voucherType === 'factura' && (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-in slide-in-from-top-2">
      <div className="p-3 bg-amber-500/5 border-b border-border">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Building2 className="h-4 w-4" />
          Datos de Factura
        </h3>
      </div>

      <div className="divide-y divide-border">
        {/* RUC del Emisor */}
        <div className="p-3 flex items-center gap-3">
          <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground block mb-0.5">
              RUC del Emisor *
            </label>
            <input
              type="text"
              name="ruc"
              value={formData.ruc}
              onChange={handleChange}
              placeholder="20123456789"
              maxLength={11}
              className="bg-transparent text-sm w-full focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Subtotal e IGV */}
        <div className="flex divide-x divide-border">
          <div className="flex-1 p-3 flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
              <Calculator className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground block mb-0.5">
                Subtotal
              </label>
              <input
                type="number"
                name="subtotal"
                value={formData.subtotal}
                onChange={handleChange}
                step="0.01"
                className="bg-transparent text-sm w-full focus:outline-none font-semibold"
                readOnly
              />
            </div>
          </div>

          <div className="flex-1 p-3 flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
              <Percent className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground block mb-0.5">
                IGV (18%)
              </label>
              <input
                type="number"
                name="igv"
                value={formData.igv}
                onChange={handleChange}
                step="0.01"
                className="bg-transparent text-sm w-full focus:outline-none font-semibold"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Tip de Auto-cálculo */}
        <div className="p-3 bg-blue-500/5">
          <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              El subtotal e IGV se calculan automáticamente basándose en el monto total (Monto / 1.18)
            </span>
          </p>
        </div>
      </div>
    </div>
  )}

  {/* ... Botones (ya existentes) ... */}
</div>
```

---

## 📱 VERSIÓN MOBILE

### Layout Propuesto (sin cambios respecto a v1)

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
│     ┌─────────────────────────┐ │
│     │ 📅 15/01/2024  🕐 14:30│ │
│     │ 💳 Yape  💵 S/ PEN    │ │
│     │ ☐ Recurrente           │ │
│     └─────────────────────────┘ │
│                                  │
│  🧾 Información Tributaria       │
│  ┌─────────────────────────────┐│
│  │ 📄 Tipo:   [Boleta ▼]     ││
│  │ 🔢 Número: [B001-12345]   ││
│  │ 🔄 Estado: [Pendiente ▼]  ││
│  │                             ││
│  │ ━━ SI ES FACTURA ━━        ││
│  │                             ││
│  │ 🏢 RUC:     [20123456789]  ││
│  │ 📊 Subtotal: [42.37]       ││
│  │ 📈 IGV:      [7.63]        ││
│  │                             ││
│  │ 💡 Auto-calculado          ││
│  └─────────────────────────────┘│
│                                  │
│ ═══════════════════════════════  │
│                                  │
│  [  Cancelar  ] [ Guardar ✓ ]   │
│                                  │
└─────────────────────────────────┘
```

### Mobile ya está implementado en el formulario actual
El código mobile ya existe en las líneas 680-1042 del FormularioGasto.tsx, solo necesitamos agregar la sección de "Información Tributaria" dentro del acordeón "Detalles".

---

## 🎯 Diferencias Clave con el Diseño Anterior

### Desktop:
1. ✅ **Estilo iOS Settings**: Cards con divisores internos (`divide-y divide-border`)
2. ✅ **Campos con íconos de colores**: `bg-blue-500/10 text-blue-600`
3. ✅ **Layout dividido horizontalmente**: `divide-x divide-border`
4. ✅ **Labels pequeños**: `text-[10px] text-muted-foreground`
5. ✅ **Headers de sección**: `bg-muted/30 border-b border-border`
6. ✅ **Animación suave**: `animate-in slide-in-from-top-2` para sección de factura

### Mobile:
- Sin cambios, ya está bien implementado

---

## 🎨 Iconos a Importar

```tsx
import {
  Calendar, Clock, Tag, CreditCard, CircleDollarSign,
  Receipt, FileText, Hash, RefreshCw, Building2,
  Calculator, Percent, Lightbulb, Coins
} from 'lucide-react';
```

---

## 📦 Estructura de Datos Final

```typescript
export type VoucherType = 'boleta' | 'factura' | 'recibo' | 'ticket' | 'nota-debito' | 'nota-credito';
export type ReimbursementStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface GastoFormData {
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
  voucherType: VoucherType;
  voucherNumber?: string;
  ruc?: string;
  igv?: string;
  subtotal?: string;
  reimbursementStatus: ReimbursementStatus;
}
```

---

## ✅ Validaciones

### Tipo Boleta/Recibo/Ticket:
- voucherNumber: Opcional
- reimbursementStatus: Por defecto "pending"

### Tipo Factura:
- ruc: **Obligatorio** (11 dígitos)
- voucherNumber: Opcional
- subtotal: Auto-calculado (readonly)
- igv: Auto-calculado (readonly)
- reimbursementStatus: Por defecto "pending"

### Validación RUC:
```typescript
const validarRUC = (ruc: string): boolean => {
  return /^\d{11}$/.test(ruc);
};
```

---

## 🚀 Próximos Pasos

1. ✅ **Actualizar types/index.ts** con los nuevos tipos
2. ✅ **Modificar FormularioGasto.tsx** con el nuevo diseño
3. ✅ **Actualizar schema de Firestore** para incluir los nuevos campos
4. ✅ **Implementar auto-cálculo** de IGV y Subtotal
5. ✅ **Agregar validaciones** de RUC para facturas

---

**Fecha**: 2025-01-24
**Autor**: Claude Code
**Versión**: 2.0.0 (Estilo iOS Settings)
