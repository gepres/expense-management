# Backend: Programados — Contrato (IMPLEMENTADO ✅)

> **Estado:** implementado en producción (`gastos-backend/src/modules/programados/`).
> Este documento describe el contrato vigente para gastos y transferencias programadas.
> **Última actualización:** 2026-05-11

Cubre dos sub-módulos:
- **Gastos programados** (`/api/programados/gastos`) — generan un `expense` y debitan la cuenta origen.
- **Transferencias programadas** (`/api/programados/transferencias`) — mueven dinero entre cuentas (mismo currency).

El frontend está en `src/components/programados/`, hooks `useGastosProgramados` + `useTransferenciasProgramadas`, services `programados.ts` + `transferencias-programadas.ts`. Apuntan a `VITE_API_BASE_URL` (default `http://localhost:3000/api`).

---

## 1. Modelo Firestore

### Colección: `gastosProgramados`

```typescript
interface GastoProgramadoFirestore {
  userId: string;                // dueño (regla Firestore filtra por esto)
  cuentaOrigenId: string;        // FK a accounts/{id}
  monto: number;                 // > 0
  moneda: 'PEN' | 'USD';
  descripcion: string;           // 3-200 chars
  categoria: string;             // CategoriaGasto
  subcategoria?: string;
  metodoPago: string;            // MetodoPago
  tags?: string[];

  // Schedule
  frecuencia: 'semanal' | 'quincenal' | 'mensual' | 'personalizada' | 'unica';
  diaEjecucion?: number;         // 0-6 si semanal, 1-31 si mensual
  ultimoDiaDelMes?: boolean;     // solo mensual
  intervaloDias?: number;        // solo personalizada, >= 1
  fechaUnica?: Timestamp;        // solo unica
  hora: string;                  // 'HH:mm'
  zonaHoraria: string;           // IANA, ej 'America/Lima'
  fechaInicio: Timestamp;
  fechaFin?: Timestamp;

  // Estado
  activo: boolean;
  proximaEjecucion: Timestamp;   // recalculada al crear/actualizar/ejecutar
  ultimaEjecucion?: Timestamp;
  totalEjecuciones: number;      // contador

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Colección: `ejecucionesProgramadas` (auditoría)

```typescript
interface EjecucionProgramadaFirestore {
  programadaId: string;          // FK a gastosProgramados/{id}
  userId: string;
  tipo: 'gasto' | 'transferencia';
  fechaProgramada: Timestamp;    // cuando debió correr
  fechaEjecutada: Timestamp;     // cuando el cron lo procesó
  estado: 'exitosa' | 'fallida' | 'saldo_insuficiente' | 'cancelada';
  gastoCreadoId?: string;        // si exitosa: ref al gasto generado
  errorMensaje?: string;
}
```

### Reglas Firestore

```javascript
match /gastosProgramados/{id} {
  allow read: if request.auth.uid == resource.data.userId;
  // Solo el backend (Admin SDK) puede escribir.
  allow write: if false;
}

match /ejecucionesProgramadas/{id} {
  allow read: if request.auth.uid == resource.data.userId;
  allow write: if false;
}
```

---

## 2. Endpoints REST

Base: `/api/programados/gastos`

| Método | Path | Body | Respuesta |
|---|---|---|---|
| `GET` | `/` | — | `GastoProgramado[]` |
| `POST` | `/` | `CreateGastoProgramadoDto` | `GastoProgramado` (201) |
| `GET` | `/:id` | — | `GastoProgramado` |
| `PATCH` | `/:id` | `UpdateGastoProgramadoDto` | `GastoProgramado` |
| `DELETE` | `/:id` | — | `{ success: true }` (204) |
| `POST` | `/:id/pause` | — | `GastoProgramado` (activo=false) |
| `POST` | `/:id/resume` | — | `GastoProgramado` (activo=true, recalcula próxima) |

### DTOs (alineados con `src/types/programados.ts`)

```typescript
interface CreateGastoProgramadoDto {
  cuentaOrigenId: string;
  monto: number;
  moneda: 'PEN' | 'USD';
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  metodoPago: string;
  tags?: string[];

  frecuencia: 'semanal' | 'quincenal' | 'mensual' | 'personalizada' | 'unica';
  diaEjecucion?: number;
  ultimoDiaDelMes?: boolean;
  intervaloDias?: number;
  fechaUnica?: string;       // ISO datetime
  hora: string;              // 'HH:mm'
  zonaHoraria: string;
  fechaInicio: string;       // ISO datetime
  fechaFin?: string;         // ISO datetime
}

type UpdateGastoProgramadoDto = Partial<CreateGastoProgramadoDto> & {
  activo?: boolean;
};
```

### Validación (recomendado: `class-validator`)

- `monto > 0`
- `descripcion` 3-200 chars
- `cuentaOrigenId` debe existir y pertenecer al `userId`
- `categoria` debe existir en config del usuario
- `hora` regex `/^([01]?\d|2[0-3]):[0-5]\d$/`
- `zonaHoraria`: validar con `Intl.supportedValuesOf('timeZone')`
- Refines condicionales por `frecuencia` (mismas reglas que `gastoProgramadoFormSchema` del frontend)

### Cálculo de `proximaEjecucion`

Usar la lógica de `src/utils/programados.ts` (frontend) **portada a backend con `date-fns-tz`** para respetar `zonaHoraria`. Esto debe correr:
1. Al crear (POST)
2. Al actualizar campos del schedule (PATCH)
3. Al reanudar (POST /resume)
4. Después de cada ejecución exitosa del cron

---

## 3. Cron de ejecución

### Setup

```typescript
// programados.cron.ts
@Injectable()
export class ProgramadosCron {
  constructor(
    private readonly programadosService: ProgramadosService,
    private readonly gastosService: GastosService,
  ) {}

  @Cron('*/15 * * * *')  // cada 15 minutos
  async procesarPendientes() {
    const ahora = new Date();
    const pendientes = await this.programadosService.findPendientes(ahora);
    for (const p of pendientes) {
      await this.ejecutarUno(p, ahora);
    }
  }
}
```

### Lógica `ejecutarUno`

```
1. LOCK: intentar crear ejecucionesProgramadas/{programadaId}_{fechaProgramada.toISOString()}
   - Si ya existe → skip (idempotencia, evita duplicar si cron corrió 2 veces)
   - Si no, crearlo con estado 'pending' antes de hacer cualquier otra cosa.

2. Validar saldo de cuentaOrigenId (sumar bankBalance + cashBalance):
   - Si insuficiente: actualizar ejecución a 'saldo_insuficiente', NO crear gasto.
     Notificar al usuario (push/toast pendiente — Fase 4).
     NO pausar el schedule.

3. En transacción Firestore:
   a. Crear documento en gastos/ con los datos del programado, usando
      fechaProgramada como fecha del gasto.
   b. Decrementar bankBalance (o cashBalance según metodoPago) de la cuenta.
   c. Actualizar gastosProgramados/{id}:
      - ultimaEjecucion = fechaEjecutada
      - totalEjecuciones += 1
      - proximaEjecucion = recalcular()
      - Si proximaEjecucion === null (frecuencia única o fechaFin alcanzada):
        activo = false
   d. Actualizar la ejecución a 'exitosa' con gastoCreadoId.

4. Si cualquier paso falla: rollback de la transacción + actualizar ejecución a
   'fallida' con errorMensaje. NO pausar el schedule (reintentará al próximo cron).
```

### Idempotencia (clave)

El ID determinístico de la ejecución `{programadaId}_{fechaProgramadaISO}` previene:
- Duplicados por reinicios del backend
- Duplicados por dos workers corriendo el cron al mismo tiempo
- Duplicados al ejecutar manualmente "ejecutar ahora" (Fase 3)

### Manejo de zona horaria

- `fechaProgramada` se almacena en UTC (Firestore Timestamp).
- El cálculo de "¿debe correr ahora?" hace: `proximaEjecucion <= ahoraUTC`.
- El cálculo de la próxima fecha **respeta `zonaHoraria` del programado** usando `date-fns-tz`.
  - Ej: programado `{frecuencia: 'mensual', diaEjecucion: 5, hora: '12:00', zonaHoraria: 'America/Lima'}` debe correr el 5 de cada mes a las 12:00 hora Lima, no UTC.

### Edge cases obligatorios

| Caso | Comportamiento |
|---|---|
| Día 31 en febrero | Usar último día del mes (28/29) |
| `fechaInicio` en el futuro | NO ejecutar antes; primer disparo cuando `ahora >= fechaInicio` |
| `fechaFin` alcanzada | Marcar `activo: false` después de la última ejecución |
| Frecuencia `unica` ya ejecutada | Marcar `activo: false`; no volver a programar |
| Backend caído por horas | Al reiniciar, ejecutar pendientes acumulados (no más de 1 por programado por ciclo) |
| Pausa durante ejecución pendiente | Si `activo: false`, el cron skipea sin crear ejecución |

---

## 4. Endpoint adicional sugerido

```
GET /api/programados/gastos/:id/ejecuciones
  → EjecucionProgramada[]  (historial, para Fase 3)
```

---

## 5. Estado de implementación

- [x] Módulo `programados/` con 2 services, 2 controllers, 1 cron
- [x] `calcularProximaEjecucion` con `date-fns-tz` (zona horaria del usuario)
- [x] 19 tests Jest del cálculo (espejean los 27 de Vitest del frontend)
- [x] Cron con `@nestjs/schedule` cada 30 min (`CronExpression.EVERY_30_MINUTES`)
- [x] Lock idempotente con ID determinístico `{programadaId}_{fechaISO}` en `ejecucionesProgramadas`
- [x] Reglas Firestore para `gastosProgramados`, `transferenciasProgramadas`, `ejecucionesProgramadas`
- [x] 4 índices compuestos en `firestore.indexes.json`
- [x] Endpoint para transferencias programadas con validación de mismo currency y cuentas distintas
- [x] Endpoint HTTP `POST /programados/cron/run` con `CRON_SECRET` + workflow GitHub Actions cada 15 min (para Vercel serverless)
- [x] Endpoint auditoría `GET /:id/ejecuciones` (gastos + transferencias)
- [x] Notificaciones in-app de saldo insuficiente / fallos / FX error (colección `notificaciones`)
- [x] Cross-currency en transferencias programadas (tasa fija + flag `usarTasaActual` con Frankfurter API)
- [ ] Tests E2E del cron (pendiente — se valida manualmente acelerando el cron a `EVERY_MINUTE`)
- [ ] Frontend: UI de notificaciones (badge + panel) y form cross-currency (pendiente — Fase frontend)

---

## 5.1. Trigger en producción (Vercel serverless)

`@nestjs/schedule` requiere un proceso persistente. En Vercel el backend corre
como serverless function (cold-started en cada request) → el `@Cron` interno
**nunca se dispara en prod**. Solución: scheduler externo que invoque un
endpoint HTTP protegido.

### Endpoint

`POST /api/programados/cron/run`

- Auth: header `Authorization: Bearer <CRON_SECRET>` (NO Firebase Auth)
- Body: vacío
- Respuesta: `{ ok: true, startedAt, finishedAt }`
- Internamente llama a `ProgramadosCron.procesarPendientes()` (mismo método
  que el `@Cron` de local). Como cada ejecución usa el lock idempotente
  `ejecucionesProgramadas/{programadaId}_{fechaISO}`, es seguro disparar dos
  veces concurrentemente o reintentar tras fallo.

### Scheduler: GitHub Actions

Workflow: `.github/workflows/cron-programados.yml` — corre cada 15 min con
`workflow_dispatch` habilitado para disparos manuales desde la UI.

**Setup inicial (una vez):**

1. Generar `CRON_SECRET`:
   ```bash
   openssl rand -hex 32
   ```
2. En Vercel dashboard del backend → Settings → Environment Variables, crear
   `CRON_SECRET` con ese valor (todos los entornos) y redeploy.
3. En GitHub repo del backend → Settings → Secrets and variables → Actions,
   crear:
   - `CRON_SECRET` = mismo valor
   - `BACKEND_BASE_URL` = `https://<tu-backend>.vercel.app/api`
4. Tab Actions → "Programados Cron" → "Run workflow" para validar.

**Cuotas:** plan gratuito de GitHub Actions cubre con holgura ~96 corridas
diarias × ~5s cada una.

### Comportamiento esperado de recovery

Cada disparo procesa **1 ejecución por programado** (`findPendientes` +
`for of`). Si el scheduler estuvo caído N períodos, recuperar N pendientes
toma N disparos de 15 min. Ver opción de catch-up en sección 8 si querés que
se ponga al día en una sola corrida.

---

## 5.2. Auditoría — historial de ejecuciones

### Endpoints

```
GET /api/programados/gastos/:id/ejecuciones
GET /api/programados/transferencias/:id/ejecuciones
```

Devuelven hasta 100 ejecuciones del programado, ordenadas por `fechaEjecutada`
descendente. Auth Firebase Bearer. 404 si no existe, 403 si no es del usuario.

Respuesta:
```typescript
Array<{
  id: string;
  programadaId: string;
  userId: string;
  tipo: 'gasto' | 'transferencia';
  fechaProgramada: string;     // ISO
  fechaEjecutada: string;      // ISO
  estado: 'exitosa' | 'fallida' | 'saldo_insuficiente' | 'cancelada' | 'pending';
  gastoCreadoId?: string;
  transferCreadoId?: string;
  errorMensaje?: string;
}>
```

Requiere índice compuesto: `ejecucionesProgramadas (programadaId ASC, userId ASC, fechaEjecutada DESC)`.

---

## 5.3. Notificaciones in-app

Nueva colección `notificaciones`. El cron escribe un doc cuando:
- `saldo_insuficiente`: no había fondos suficientes en la cuenta origen.
- `ejecucion_fallida`: la transacción Firestore falló por otro motivo (incluye errores genéricos del cron).
- `cuenta_destino_eliminada`: solo transferencias; pausa el programado.
- `fx_api_error`: solo transferencias cross-currency con `usarTasaActual: true` cuando Frankfurter no respondió.

### Schema

```typescript
interface NotificacionDocument {
  userId: string;
  tipo: 'saldo_insuficiente' | 'ejecucion_fallida' | 'cuenta_destino_eliminada' | 'fx_api_error';
  programadaId: string;
  programadaTipo: 'gasto' | 'transferencia';
  mensaje: string;                  // texto amigable listo para mostrar
  metadata?: { monto?, moneda?, saldoActual?, ... };
  leida: boolean;
  fechaEjecucionId?: string;        // ref a ejecucionesProgramadas/{id}
  createdAt: Timestamp;
}
```

### Endpoints

```
GET    /api/notificaciones?soloNoLeidas=true   → Notificacion[]
GET    /api/notificaciones/contar-no-leidas    → { count: number }
PATCH  /api/notificaciones/:id/leida           → Notificacion
POST   /api/notificaciones/marcar-todas-leidas → { actualizadas: number }
DELETE /api/notificaciones/:id                 → 204
```

### Reglas Firestore (en `gastos/firestore.rules`)

- Lectura: solo el dueño (`ownsResource()`).
- Update: SOLO el campo `leida` (regla con `affectedKeys().hasOnly(['leida'])`).
- Create: bloqueado al cliente (solo backend via Admin SDK).
- Delete: el dueño puede borrar.

El frontend puede leer con `onSnapshot` directo a Firestore (rápido) y mutar
`leida` o `delete` vía backend o directamente — ambos paths quedan permitidos
por las reglas.

---

## 5.4. Transferencias programadas cross-currency

Hasta esta versión, las transferencias programadas exigían misma moneda en
origen y destino. Ahora soportan **cross-currency** (PEN ↔ USD) con dos modos.

### Campos nuevos en `transferenciasProgramadas`

| Campo | Tipo | Descripción |
|---|---|---|
| `monedaDestino?` | `'PEN' \| 'USD'` | Moneda de la cuenta destino. Si difiere de `moneda` → cross-currency activo. |
| `exchangeRate?` | `number` | Tasa fija definida al crear (default). El cron multiplica `monto × exchangeRate` para acreditar al destino. |
| `usarTasaActual?` | `boolean` | Si `true`, el cron consulta Frankfurter al ejecutar e ignora `exchangeRate`. |

### Validación al crear/editar

- `cuenta_origen.currency === moneda` (sin cambios).
- `cuenta_destino.currency === monedaDestino ?? moneda`.
- Si `monedaDestino !== moneda`:
  - O `exchangeRate > 0`, O `usarTasaActual === true`. Sin uno de los dos → 400.

### Comportamiento del cron

1. **Antes** del `runTransaction` (porque fetch externo NO debe estar en una
   transacción Firestore):
   - Si `usarTasaActual: true` → `fxService.getRate(moneda, monedaDestino)`.
     - Frankfurter (`https://api.frankfurter.app/latest`), gratis, sin key.
     - Cache en memoria 1 hora.
     - Si falla → marca ejecución `fallida` con `errorMensaje: "FX: ..."`,
       crea notificación tipo `fx_api_error` y NO toca saldos. Avanza
       `proximaEjecucion` en el siguiente tick (pero igual el lock queda
       creado para este disparo, lo que es OK porque sería un retry).
   - Si `usarTasaActual: false`/undefined → usa `exchangeRate` del doc.
2. `amountConverted = monto × exchangeRate` redondeado a 2 decimales.
3. Tx: debita `from.bankBalance - monto`, acredita `to.bankBalance + amountConverted`,
   crea `transfers` doc con `amount`, `amountConverted`, `exchangeRate`,
   `fromCurrency`, `toCurrency` (idénticos al schema de transfers manuales).

### Limitaciones conscientes

- Frankfurter no incluye PEN nativamente como moneda base estable; en tests
  reales puede convenir alternar a otra API. La implementación deja el método
  `getRate` cambiable sin tocar el cron.
- Sin "tasa máxima aceptable" todavía — toda variación de FX impacta sin filtro.
- Si la API estuvo caída con `usarTasaActual: true` por horas, los disparos
  acumulan ejecuciones `fallida` (una por tick). El usuario los ve en el
  endpoint de auditoría y como notificaciones.

---

## 6. Coordinación frontend ↔ backend

End-to-end funcionando:
1. Usuario crea programación en `/programados` → `POST /api/programados/{gastos|transferencias}` → backend valida + persiste.
2. Cron del backend cada 30 min revisa pendientes → crea `expense`/`transfer` real en transacción atómica.
3. Frontend ve el documento generado vía `onSnapshot` existente de `useGastos`/`useTransfers` — sin código adicional.
4. Cada ejecución queda registrada en `ejecucionesProgramadas` (auditoría).

## 7. Endpoints completos

### Gastos programados (`/api/programados/gastos`)

| Método | Path | Body | Respuesta |
|---|---|---|---|
| `GET` | `/` | — | `GastoProgramado[]` |
| `POST` | `/` | `CreateGastoProgramadoDto` | `GastoProgramado` (201) |
| `GET` | `/:id` | — | `GastoProgramado` |
| `PATCH` | `/:id` | `UpdateGastoProgramadoDto` | `GastoProgramado` |
| `DELETE` | `/:id` | — | (204) |
| `POST` | `/:id/pause` | — | `GastoProgramado` (`activo: false`) |
| `POST` | `/:id/resume` | — | `GastoProgramado` (`activo: true`, recalcula próxima) |

### Transferencias programadas (`/api/programados/transferencias`)

Mismos endpoints pero con `cuentaDestinoId` en el DTO y sin `categoria`/`subcategoria`/`metodoPago`. Validación adicional:
- `cuentaOrigenId !== cuentaDestinoId`
- Ambas cuentas deben tener el mismo `currency` que el monto

### Auditoría (sugerido para Fase 3)

```
GET /api/programados/{gastos|transferencias}/:id/ejecuciones
  → EjecucionProgramada[]
```
No implementado todavía.
