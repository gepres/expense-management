# 🔒 Fase 1 — Saneamiento Firestore

> Reescribir reglas de seguridad y desplegar de forma controlada antes de cualquier cambio del modelo multi-cuenta.

- **Fecha:** 2026-04-26
- **Branch:** `feat/multi-cuenta` (los 3 repos)
- **Bloqueante para:** todas las fases siguientes

---

## 🚨 Diagnóstico inicial

Las reglas activas en producción (verificadas por el usuario en Firebase Console):

```javascript
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

**Cualquier usuario autenticado puede leer/escribir cualquier documento**. Esto incluye:

- Gastos de otros usuarios.
- Conversaciones de IA de otros (subcolección `users/{uid}/conversations/.../messages`).
- Datos personales (`users/{uid}/profile`).
- Grupos compartidos a los que NO pertenecen.
- Cola de WhatsApp (sensible).

Es un agujero de seguridad crítico. Fase 1 lo cierra.

---

## 📊 Backup de respaldo

Ejecutado correctamente con la versión mejorada del script. Snapshot disponible en:

```
D:\PROYECTOS\gepres\gastos-backend\backups\firestore-2026-04-26-054232\
```

Total: **635 documentos** (244 top-level + 326 subcolecciones de users + 65 de shared_groups).

Conteo por colección:

| Colección | Docs |
|---|---|
| users | 15 |
| expenses | 82 |
| presupuestos | 21 |
| presupuestosEfectivo | 34 |
| movimientos | 11 |
| abonosEfectivo | 11 |
| receipts | 20 |
| shopping-lists | 0 |
| shared_groups | 14 |
| shared_invitations | 24 |
| whatsapp_queue | 12 |
| users/<uid>/* | 326 (incluye 26 messages de chat) |
| shared_groups/<id>/* | 65 |

---

## 🆕 Nuevas reglas Firestore propuestas

Archivo: **`D:\PROYECTOS\gepres\gastos\firestore.rules.NEW`**

### Resumen del modelo de seguridad

| Colección | Read | Create | Update | Delete |
|---|---|---|---|---|
| `users/{uid}` | propio o admin | propio (sin role≠standard) | propio (sin cambiar role) o admin | solo admin |
| `users/{uid}/**` | propio | propio | propio | propio |
| `expenses` | si `userId==auth.uid` | si `userId==auth.uid` | si dueño | si dueño |
| `presupuestos` | dueño | dueño | dueño | dueño |
| `presupuestosEfectivo` | dueño | dueño | dueño | dueño |
| `movimientos` | dueño | dueño | dueño | dueño |
| `abonosEfectivo` | dueño | dueño | dueño | dueño |
| `receipts` | ⚠️ cualquier auth | ⚠️ cualquier auth | ⚠️ cualquier auth | ⚠️ cualquier auth |
| `shopping-lists` | dueño | dueño | dueño | dueño |
| `shared_groups/{id}` | si `auth.uid in members[]` | si createdBy==auth.uid | solo creador | solo creador |
| `shared_groups/{id}/budgets` | miembro | miembro | dueño aporte o creador | dueño aporte o creador |
| `shared_groups/{id}/expenses` | miembro | miembro | dueño gasto o creador | dueño gasto o creador |
| `shared_groups/{id}/activity` | miembro | denegado | denegado | denegado |
| `shared_invitations` | cualquier auth (preview) | createdBy==auth.uid | solo creador | solo creador |
| `whatsapp_queue` | denegado | denegado | denegado | denegado |
| `* (cualquier otra)` | denegado | denegado | denegado | denegado |

### Detalles importantes

1. **Admin omnipotente sobre `users`**: cualquier admin lee/edita cualquier user. Necesario para el panel `/admin` (aprobar PRO).
2. **`receipts` queda permisivo intencionalmente**: el modelo actual no tiene `userId`. Se marca como TODO para una migración separada — no podemos endurecer sin romper lo que existe.
3. **`shared_groups` usa `members` (array)**: las reglas hacen `auth.uid in members`. Verifiqué que los 14 grupos respaldados tienen ese campo.
4. **`shared_invitations`** es semi-pública para que cualquier user con el token pueda hacer preview. La creación requiere que `createdBy == auth.uid`.
5. **`whatsapp_queue` queda 100% bloqueada para clientes**: solo Cloud Functions (que usan Admin SDK y bypassean reglas).
6. **Catch-all final** deniega cualquier colección no listada → ningún descuido se cuela.

---

## ⚠️ Riesgos detectados durante la revisión

| Riesgo | Mitigación |
|---|---|
| El frontend no envía `userId` al crear un doc → la regla `ownsRequest()` falla | Auditar en Fase 2 los lugares donde se omite `userId` |
| `users/{uid}/categories` etc. quedan ocultas para el backend NestJS si no usa Admin SDK | El backend usa Admin SDK → bypass automático ✅ |
| Si un user se loguea con el panel admin abierto en otro dispositivo, podría ver datos de otros | Es deseable para el rol admin, no es bug |
| Reglas con `get()` cuestan lectura adicional → costo Firestore mayor | Aceptable; volumen actual bajo (15 users, 224 docs top-level) |
| Algún test E2E rompe porque suponía reglas abiertas | Re-ejecutar `npm run test:e2e` después de desplegar |

---

## 🚦 Plan de despliegue (paso a paso)

### Paso 1 — Probar en simulador antes de desplegar

1. Firebase Console → **Firestore → Rules → Playground**.
2. Pega las reglas nuevas en un editor temporal.
3. Simula casos críticos:

| Caso | Path | Auth uid | Op | Esperado |
|---|---|---|---|---|
| Lee mi propio gasto | `/expenses/{algunoMio}` | mi uid | `get` | ✅ allow |
| Leo gasto de otro | `/expenses/{deOtroUser}` | mi uid | `get` | ❌ deny |
| Creo gasto con userId correcto | `/expenses/nuevo` | mi uid + body con `userId: mi uid` | `create` | ✅ allow |
| Creo gasto con userId ajeno | `/expenses/nuevo` | mi uid + body con `userId: otroUid` | `create` | ❌ deny |
| Subo foto a receipts (sin auth) | `/receipts/x` | sin auth | `create` | ❌ deny |
| Subo foto a receipts (auth) | `/receipts/x` | cualquier uid | `create` | ✅ allow |
| Leo mi conversación | `/users/{miUid}/conversations/{any}` | mi uid | `read` | ✅ allow |
| Leo conversación ajena | `/users/{otroUid}/conversations/{any}` | mi uid | `read` | ❌ deny |
| Leo grupo donde estoy | `/shared_groups/{grupoConmigo}` | mi uid | `read` | ✅ allow |
| Leo grupo donde NO estoy | `/shared_groups/{grupoAjeno}` | mi uid | `read` | ❌ deny |
| Cliente lee whatsapp_queue | `/whatsapp_queue/x` | cualquier uid | `read` | ❌ deny |

### Paso 2 — Desplegar

**Opción A — Firebase Console (más simple para 1 vez):**

1. Firestore → Rules → pegar contenido de `firestore.rules.NEW`.
2. **Publish**.

**Opción B — Firebase CLI (mejor para versionar):**

```bash
# Desde el repo frontend
cd D:\PROYECTOS\gepres\gastos

# Reemplazar el archivo viejo
cp firestore.rules.NEW firestore.rules

# Verificar firebase.json apunta a este archivo
cat firebase.json

# Desplegar SOLO reglas (no hosting)
firebase deploy --only firestore:rules
```

> Si prefieres B, antes confirmamos `firebase.json` y `.firebaserc`.

### Paso 3 — Smoke test post-despliegue

1. Abrir app en producción → login con tu cuenta.
2. Verificar que cargan: dashboard, gastos, presupuestos, asistente IA, grupos compartidos.
3. Crear un gasto nuevo → debe persistir.
4. Si algo se rompe → rollback inmediato (paso 4).

### Paso 4 — Plan de rollback

Si algo se cae, revertir desde Firebase Console (las reglas viejas estaban guardadas en historial automático de Firebase):

```
Firestore → Rules → "View history" → Restaurar versión anterior.
```

O bien, redesplegar las reglas viejas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## ✅ Acciones para ti

1. **Revisar** el archivo `D:\PROYECTOS\gepres\gastos\firestore.rules.NEW`.
2. **Probar** los casos del Paso 1 en el Playground de Firebase.
3. Decidir entre Opción A (Console) u Opción B (CLI) para desplegar.
4. **Avísame cuando despliegues** para hacer juntos el smoke test del Paso 3.

Si encuentras algún caso de uso que las reglas bloquean por error, lo ajustamos y volvemos a probar.

---

## 📌 Lo que NO hacemos en Fase 1 (queda para fases posteriores)

- ✗ Añadir `userId` a `receipts` (queda como TODO).
- ✗ Renombrar colecciones (`expenses` se mantiene; `gastos` no existe).
- ✗ Crear colecciones nuevas (`accounts`, `transfers` → Fase 2).
- ✗ Tocar el código del frontend o backend.
- ✗ Migrar datos.

---

## 📊 Estado de Fase 1

| Tarea | Estado |
|---|---|
| Diagnóstico de reglas actuales | ✅ Hecho |
| Backup completo (635 docs) | ✅ Hecho |
| Auditar schemas para escribir reglas | ✅ Hecho |
| Generar `firestore.rules.NEW` | ✅ Hecho |
| Generar checklist de despliegue | ✅ Hecho |
| Probar en Playground | ⏳ Pendiente (tú) |
| Desplegar reglas a producción | ⏳ Pendiente (tú) |
| Smoke test post-despliegue | ⏳ Pendiente (juntos) |
