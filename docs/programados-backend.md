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
- [ ] Tests E2E del cron (pendiente — se valida manualmente acelerando el cron a `EVERY_MINUTE`)
- [ ] Notificaciones push en saldo insuficiente (pendiente — Fase 4)
- [ ] Cross-currency transfers programadas (pendiente — Fase 2.5)

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
