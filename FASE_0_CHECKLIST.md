# ✅ Fase 0 — Checklist de Pre-requisitos

> Estado de las tareas de la Fase 0 del plan multi-cuenta.
> Lo que está hecho automáticamente y lo que necesita acción tuya.

- **Fecha de inicio:** 2026-04-26
- **Branch en uso (3 repos):** `feat/multi-cuenta`

---

## 🟢 Hecho automáticamente

### 1. Branches creados

```
✅ D:\PROYECTOS\gepres\gastos                       → feat/multi-cuenta
✅ D:\PROYECTOS\gepres\gastos-backend               → feat/multi-cuenta
✅ D:\PROYECTOS\gepres\gastos-firebase-functions    → feat/multi-cuenta
```

> Los archivos `ANALISIS_PROYECTO.md`, `PLAN_MULTI_CUENTA.md` y este checklist viajaron al branch nuevo del frontend (no estaban commiteados aún).

### 2. Script de backup Firestore

```
✅ D:\PROYECTOS\gepres\gastos-backend\scripts\backup-firestore.js
✅ .gitignore actualizado para excluir /backups
```

**Cómo correrlo (cuando estés listo):**

```bash
cd D:\PROYECTOS\gepres\gastos-backend
node scripts/backup-firestore.js
```

**Qué respalda por defecto:**
`users`, `expenses`, `presupuestos`, `presupuestosEfectivo`, `movimientos`, `abonosEfectivo`, `shopping-lists`, `shared_groups`, `shared_invitations`, `whatsapp_queue`.

**Salida:** `backups/firestore-YYYY-MM-DD-HHMMSS/` con un JSON por colección + `_manifest.json` con conteos y tamaños. Los `Timestamp` de Firestore se preservan como `{ __type: 'Timestamp', iso, seconds, nanoseconds }` para reconstrucción posterior.

**Filtrar colecciones específicas:**
```bash
node scripts/backup-firestore.js --collections=expenses,presupuestos
```

---

## 🟡 Necesita acción tuya

### 3. Verificar reglas Firestore desplegadas en producción

**Por qué:** los dos archivos `firestore.rules` que existen en los repos están **inconsistentes** entre sí y ninguno parece reflejar lo que está corriendo en producción.

**Pasos:**

1. Abre [Firebase Console](https://console.firebase.google.com/) → tu proyecto.
2. **Firestore Database** → pestaña **Rules**.
3. Copia las reglas activas y pégamelas en el chat (o guárdalas en `D:\PROYECTOS\gepres\gastos\firestore.rules.PROD.txt`).
4. Mientras estás ahí, verifica también:
   - **Firestore Database → Data**: ¿la colección se llama `expenses` o `gastos`? Confirma cuál tiene datos reales.
   - **Indexes**: lista los índices compuestos existentes (los necesito para no romper queries actuales).

> Hasta que no tenga las reglas reales no puedo arrancar Fase 1 (saneamiento). Es el bloqueante #1.

### 4. Correr el backup

Una vez verificadas las reglas en Firebase Console, **antes** de cualquier modificación:

```bash
cd D:\PROYECTOS\gepres\gastos-backend
node scripts/backup-firestore.js
```

Si la salida termina con `✅ Backup completo: X documentos`, perfecto. Pasa el contenido del `_manifest.json` para confirmar.

---

## 🔵 Decisiones de diseño — confirmadas

Tus respuestas (incorporadas al plan):

| # | Decisión | Tu respuesta |
|---|---|---|
| 1 | Tipos de cuenta | Banco principalmente (bancos de Perú), también `cash`, `wallet`, `card`, `savings`, `other` |
| 2 | Tarjetas de crédito | Opción A (saldo negativo, modelo simple) |
| 3 | `PresupuestoEfectivo` post-migración | Se borra después de migración + grace period de 1 release |
| 4 | `Movimiento` → `Transfer` único | Sí. Retiro de banco = Transfer banco → efectivo |
| 5 | `metodoPago` en gasto | Se conserva |
| 6 | Conversión de moneda | Manual (usuario ingresa monto destino o tipo de cambio) |
| 7 | Cuenta por defecto | Sí, marcada con `isDefault: true` |
| 8 | Migración automática | Sí, idempotente, en login |
| 9 | Gastos compartidos asociados a cuenta personal | NO en v1 |
| 10 | UI mobile | Bottom sheet tipo iOS Wallet |

---

## ⚠️ Pregunta nueva que surgió de tu respuesta #1

Mencionaste:

> "en banco tiene q ser los banco de peru y si la cuenta es **en soles o dólares o ambas**"

Eso introduce el concepto de **cuenta multi-moneda** (común en banca peruana: una cuenta BCP que tiene saldo en PEN y en USD a la vez). Hay 3 maneras de modelarlo:

### Opción A — Una `Account` = una moneda (más simple)

```
Account "BCP Soles"   currency=PEN  balance=1500
Account "BCP Dólares" currency=USD  balance=300
        ↑ comparten campo bank="BCP" para agruparlas en UI
```

- **Pro:** modelo limpio, saldos simples, fácil de calcular.
- **Contra:** el usuario crea 2 cuentas para representar 1 cuenta bancaria real.

### Opción B — `Account` con saldos por moneda

```
Account "BCP" bank="BCP" balances={ PEN: 1500, USD: 300 }
```

- **Pro:** refleja la realidad bancaria peruana.
- **Contra:** complica TODO: gastos, transfers, recálculos, queries, agregaciones, índices. Requiere repensar muchas cosas.

### Opción C — `Account` parent + sub-cuentas por moneda

```
Account "BCP" bank="BCP" type="bank"
  └─ SubAccount currency=PEN balance=1500
  └─ SubAccount currency=USD balance=300
```

- **Pro:** flexibilidad máxima.
- **Contra:** complejidad innecesaria para un MVP.

### 🟢 Recomiendo: **Opción A** (con UI inteligente)

- En la UI, cuando creas una cuenta de tipo `bank` con banco "BCP", te ofrece "¿soles, dólares o ambas?" y si eliges "ambas" crea automáticamente 2 `Account` agrupadas.
- En el dashboard se agrupan visualmente bajo "BCP" (como tarjetas hijas).
- Los gastos seleccionan una cuenta+moneda específica.
- **Mantenemos el modelo simple internamente, ofrecemos la experiencia "multi-moneda" en la capa visual.**

**¿Confirmas Opción A o prefieres otra?**

---

## 📋 Lista de bancos peruanos para el form

Para que la UI esté lista al crear cuenta tipo `bank`:

```ts
const BANCOS_PERU = [
  'BCP',
  'BBVA',
  'Interbank',
  'Scotiabank',
  'Banco de la Nación',
  'BanBif',
  'Pichincha',
  'Banco Falabella',
  'Banco Ripley',
  'Banco GNB',
  'ICBC',
  'Citibank',
  'Alfin',
  'Mibanco',
  'Compartamos',
  'Otro',
];
```

(Reuso lo que ya está en `FormularioMovimiento.tsx` + agrego Mibanco y Compartamos.)

**¿Quieres agregar/quitar alguno?**

---

## ➡️ Próximos pasos (en orden)

1. **Tú:** Pegas reglas Firestore reales de producción (sección 3).
2. **Tú:** Corres el script de backup y me confirmas conteos (sección 4).
3. **Tú:** Confirmas Opción A para multi-moneda (sección "Pregunta nueva").
4. **Tú:** Validas/ajustas la lista de bancos.
5. **Yo:** Actualizo `PLAN_MULTI_CUENTA.md` con todas las decisiones finales.
6. **Yo:** Arranco **Fase 1 (saneamiento Firestore)** apenas tenga las reglas reales.

---

## 📊 Resumen del estado de Fase 0

| Tarea | Estado |
|---|---|
| Crear branch en 3 repos | ✅ Hecho |
| Script de backup | ✅ Listo, sin ejecutar |
| Verificar reglas Firestore en Console | ⏳ Pendiente (tú) |
| Correr backup contra producción | ⏳ Pendiente (tú) |
| Confirmar decisiones §3 | ✅ Hecho (10/10) |
| Aclarar modelo cuenta multi-moneda | ⏳ Pendiente (tú) |
| Validar lista de bancos | ⏳ Pendiente (tú) |

> **Bloqueante para Fase 1:** las reglas Firestore reales de producción.
