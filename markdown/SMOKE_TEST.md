# 🧪 Smoke test — flujo end-to-end multi-cuenta

> Checklist manual para validar Fase 6 antes de merge a `main`.
> Tiempo estimado: 25–35 min. Marca cada paso al pasarlo. Si alguno falla, anotá el error en la columna "Resultado".

---

## 🚀 Pre-flight

| ✅ | Acción | Resultado esperado |
|---|---|---|
| ☐ | Backend levantado: `cd ../gastos-backend && npm run start:dev` | Logs muestran `🚀 Application is running on: http://localhost:3000` y `🔓 CORS enabled for: ...localhost:5173` |
| ☐ | Frontend levantado: `npm run dev` | Vite imprime `➜  Local:   http://localhost:5173/` |
| ☐ | Firestore rules + indexes desplegados | `firebase deploy --only firestore:rules,firestore:indexes` sin errores |
| ☐ | Login con usuario de test | Redirige a `/dashboard` |

---

## 1️⃣ Cuentas — crear, editar, default, archivar

| ✅ | Paso | Resultado esperado |
|---|---|---|
| ☐ | Borrar todas las cuentas existentes (si hay) | `/cuentas` vacía |
| ☐ | Crear "BCP Soles" (type=bank, currency=PEN, saldo bank=1000, cash=0) | Switch "Cuenta predeterminada" arranca en **true** (#18). Saldo total S/1000 |
| ☐ | Crear "BBVA USD" (type=bank, currency=USD, saldo bank=200, cash=0) | Switch arranca en **false** (no es la primera) |
| ☐ | En `/cuentas`, click en la estrella de BBVA USD | BCP pierde el ⭐, BBVA queda como default (#17) |
| ☐ | Volver a marcar BCP como default | BBVA pierde el ⭐ (atomicidad backend) |
| ☐ | Editar BCP — agregar datos de tarjeta (número, titular, vencimiento) | Sección "Tarjeta de débito asociada" visible en bank (#30). Banner azul de seguridad |
| ☐ | Guardar y volver a `/cuentas` | Card BCP muestra chip `<CreditCard /> •••• XXXX <Copy />` (#27) |
| ☐ | Click en el chip → Modal "Datos de tarjeta" | Card visual estilo plástico. Botón "Revelar y copiar número" |
| ☐ | Click revelar → toast "Copiado al portapapeles" | Número descifrado y en clipboard. Sin CVC en ningún lado |

---

## 2️⃣ Movimientos — Income, Withdraw, Deposit, Transfer

| ✅ | Paso | Resultado esperado |
|---|---|---|
| ☐ | Desde `/cuentas` o `DetalleCuenta` BCP → botón **Ingreso** verde | Modal `IncomeModal` abre |
| ☐ | Origen=Cuenta sueldo, monto=3000, destino=bank, descripción="Sueldo abril" | Preview verde "Saldo total = Presupuesto del mes: S/4000" |
| ☐ | Confirmar | Toast "Ingreso registrado. Tu presupuesto general aumentó." Saldo BCP ahora S/4000 |
| ☐ | Botón **Retirar** → monto=200 | Saldo bank=3800, cash=200. Toast "Retiro registrado" |
| ☐ | Botón **Depositar** → monto=50 | bank=3850, cash=150 |
| ☐ | Modal Transferencia entre cuentas (`<TransferModal />`) | Selectors "Desde" y "Hacia" funcionan (#16 fix portal). Cross-currency PEN→USD muestra TC |
| ☐ | Transfer 100 PEN BCP→BBVA con TC=0.27 | BCP -100 (PEN), BBVA +27 (USD). Tx atómica |

---

## 3️⃣ Historial — revertir, eliminar

| ✅ | Paso | Resultado esperado |
|---|---|---|
| ☐ | En `DetalleCuenta` BCP, click en ⋮ del **Ingreso** | Menu se ve completo, NO tapado por card padre (#29 portal) |
| ☐ | Opciones: Revertir, Eliminar | Ambas visibles |
| ☐ | Click **Revertir** | Toast "Movimiento revertido". Aparece nueva fila azul "Reverso" + badge amber "Revertido" en original. Strikethrough en monto original |
| ☐ | Click ⋮ del Ingreso revertido | "Revertir" YA NO aparece (canRevert=false). Solo "Eliminar" |
| ☐ | Eliminar el Ingreso revertido | Confirmation modal → confirmar → ambos (original + reversal) desaparecen. Saldo restaurado |
| ☐ | Eliminar un retiro NO revertido | Saldo se restaura: bank +monto, cash -monto |

---

## 4️⃣ Gastos — crear, editar, sub-reservas

| ✅ | Paso | Resultado esperado |
|---|---|---|
| ☐ | `/gastos/nuevo` → seleccionar cuenta BCP | SelectorCuenta abre dropdown sin cortarse (#19 portal) en desktop y mobile |
| ☐ | Categoría=alimentación, monto=200, descripción="Almuerzo" | Botón Guardar habilitado |
| ☐ | Crear gasto | Toast "Gasto creado". Saldo BCP -200 |
| ☐ | Editar el gasto desde `/gastos` (click row) | Carga sin error "Gasto no encontrado" (#1 fix fallback Firestore) |
| ☐ | Cambiar monto a 250, guardar | Saldo se ajusta correctamente (revert old + apply new) |
| ☐ | Ir a `/presupuestos`, asignar S/300 a "Alimentación" en cuenta BCP | Solo aparecen categorías (no efectivo, no general) (#15) |
| ☐ | Modal "Nuevo presupuesto" muestra "Máx. asignable" calculado dinámicamente | Saldo BCP - asignado actual |
| ☐ | Crear gasto de S/100 más en alimentación → total S/350 (excede 300) | Toast "Gasto creado" + Toast amber "⚠️ Alimentación sobregirado en PEN 50.00 (116%)" (#14) |
| ☐ | En `DetalleCuenta` BCP, ver widget "Distribución del mes" | Barra alimentación roja con tag "Sobregirado 116%" |

---

## 5️⃣ Dashboard

| ✅ | Paso | Resultado esperado |
|---|---|---|
| ☐ | Ir a `/dashboard` | Cards renderizan SIN errores |
| ☐ | Card "Presupuesto del Mes" | Muestra solo cuenta default (BCP) con ⭐ + nombre + saldo (#20) |
| ☐ | Card "Gastos del Mes" | Solo gastos de BCP (cuenta default) |
| ☐ | Card "Efectivo en bolsillo" | Suma cashBalance de TODAS las cuentas activas (#21) |
| ☐ | Si cashBalance ≤ 0: card amber con "⚠️ No tienes efectivo. Considera retirar..." | OK |
| ☐ | AIInsights (si user es PRO) | Ícono refresh manual visible. Caché 5 min, indica "hace X min" |
| ☐ | Click refresh insights | Spinner gira, llamada al backend, actualiza |

---

## 6️⃣ Presupuesto — sub-reservas + warning amber

| ✅ | Paso | Resultado esperado |
|---|---|---|
| ☐ | `/presupuestos` con cuenta BCP seleccionada | Header muestra Saldo / Gastado mes / Disponible (3-col grid) + barra de progreso |
| ☐ | Crear sub-reserva "Transporte" S/100 | Si totalAsignado > saldo: warning amber pero permite (#10) |
| ☐ | El bucket general LEGACY (si existe en datos viejos): banner "Tienes un presupuesto General antiguo, podés borrarlo" | OK |

---

## 7️⃣ Reporte de gastos multi-cuenta

| ✅ | Paso | Resultado esperado |
|---|---|---|
| ☐ | `/gastos` → botón "Descargar" → modal de export | Sección "Cuentas a incluir" con checklist (#11) |
| ☐ | Sin selección → "Sin filtro: incluye TODAS (N)" | Default deja vacío = todas |
| ☐ | Seleccionar solo BCP, formato Excel, descargar | `reporte_gastos_YYYY_MM_1cuentas.xlsx` |
| ☐ | Abrir Excel | Hoja "Gastos" con columna **Cuenta** + Banco. Hoja "Resumen" con totales por cuenta+moneda. Hoja "Por Moneda" con totales globales |
| ☐ | Filtro por mes vacío + sugerencia | Banner azul "No hay gastos en X. Tienes en Y → [Ver Y]" funciona |

---

## 8️⃣ Backend offline graceful

| ✅ | Paso | Resultado esperado |
|---|---|---|
| ☐ | Detener el backend (Ctrl+C en terminal) | OK |
| ☐ | Recargar `/presupuestos` | Banner amber `<BackendOfflineBanner />` con guía + botón Reintentar (#2) |
| ☐ | Volver a levantar backend, click Reintentar | Banner desaparece, datos cargan |
| ☐ | Editar gasto sin backend | Funciona igual (fallback Firestore en `obtenerPorId` #1) |

---

## 9️⃣ Configuración

| ✅ | Paso | Resultado esperado |
|---|---|---|
| ☐ | `/configuracion` — verificar tabs | Métodos de Pago tiene icono `CreditCard` (#4) — antes faltaba |
| ☐ | Tab Categorías: crear, editar, eliminar | Funciona vía backend |
| ☐ | Tab Apariencia: dark mode | Funciona |
| ☐ | Tab Avanzada: exportar JSON | OK |

---

## 🎯 Validaciones generales

| ✅ | Check | OK |
|---|---|---|
| ☐ | Type-check frontend pasa: `npx tsc -p tsconfig.app.json --noEmit` | exit 0 |
| ☐ | Type-check backend pasa: `cd ../gastos-backend && npx tsc -p tsconfig.build.json --noEmit` | exit 0 |
| ☐ | Build de producción frontend: `npm run build` | sin errores |
| ☐ | No hay warnings en console del navegador (refresh `/dashboard`, `/cuentas`, `/gastos`, `/presupuestos`) | OK |
| ☐ | No hay queries Firestore con índice faltante en consola del backend | OK |

---

## 🐛 Bugs conocidos

(Listar acá si encontrás algo nuevo durante el smoke)

| Ruta | Descripción | Severidad |
|---|---|---|
| | | |

---

**Última corrida:** _____________  
**Resultado:** ☐ All pass · ☐ Pasa con warnings · ☐ Bloqueante encontrado
