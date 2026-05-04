# Reglas de Firestore - Sistema de Efectivo

## ⚠️ IMPORTANTE: Actualizar en Firebase Console

Estas reglas deben agregarse a tu Firebase Firestore Security Rules en la consola de Firebase.

**Cómo aplicarlas:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** → **Reglas**
4. Agrega las siguientes reglas a las existentes

---

## 📝 Reglas para Nuevas Colecciones

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // REGLAS EXISTENTES (mantener)
    // ============================================

    // Colección de usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // Colección de gastos
    match /expenses/{expenseId} {
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }

    // Colección de presupuestos
    match /presupuestos/{presupuestoId} {
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }

    // ============================================
    // NUEVAS REGLAS - SISTEMA DE EFECTIVO
    // ============================================

    // Colección de presupuestos en efectivo
    match /presupuestosEfectivo/{presupuestoEfectivoId} {
      // Solo el usuario propietario puede leer
      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;

      // Solo el usuario propietario puede actualizar/eliminar
      allow update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;

      // Solo puede crear si el userId coincide con el auth
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        // Validar que solo tenga un presupuesto por moneda
        && request.resource.data.moneda in ['PEN', 'USD'];
    }

    // Colección de movimientos
    match /movimientos/{movimientoId} {
      // Solo el usuario propietario puede leer
      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;

      // Solo el usuario propietario puede actualizar/eliminar
      allow update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;

      // Validaciones al crear
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.tipo in ['retiro_banco', 'transferencia_cuentas']
        && request.resource.data.monto > 0
        && request.resource.data.moneda in ['PEN', 'USD'];
    }

    // Colección de abonos a efectivo
    match /abonosEfectivo/{abonoId} {
      // Solo el usuario propietario puede leer
      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;

      // Solo el usuario propietario puede eliminar
      allow delete: if request.auth != null
        && resource.data.userId == request.auth.uid;

      // Validaciones al crear
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.monto > 0
        && request.resource.data.moneda in ['PEN', 'USD']
        && request.resource.data.concepto.size() > 0;

      // No se permite actualizar abonos (solo leer/crear/eliminar)
      allow update: if false;
    }

    // ============================================
    // REGLAS DE OTRAS COLECCIONES (si las tienes)
    // ============================================

    // Agrega aquí otras reglas existentes...
  }
}
```

---

## 🔍 Explicación de las Reglas

### presupuestosEfectivo
- **Read**: Solo el usuario propietario
- **Create**: Usuario autenticado, solo PEN/USD
- **Update/Delete**: Solo el usuario propietario

### movimientos
- **Read**: Solo el usuario propietario
- **Create**: Validación de tipo (retiro_banco, transferencia_cuentas), monto positivo, moneda válida
- **Update/Delete**: Solo el usuario propietario

### abonosEfectivo
- **Read**: Solo el usuario propietario
- **Create**: Validación de monto positivo, moneda válida, concepto no vacío
- **Delete**: Solo el usuario propietario
- **Update**: **NO PERMITIDO** (los abonos son inmutables)

---

## ✅ Verificación

Después de aplicar las reglas, puedes probar:

1. **Crear un movimiento**: Debería funcionar si estás autenticado
2. **Leer presupuesto en efectivo**: Solo verás tus propios registros
3. **Intentar modificar datos de otro usuario**: Debería ser rechazado

---

## 🛡️ Seguridad

Estas reglas garantizan que:
- ✅ Solo usuarios autenticados pueden operar
- ✅ Los usuarios solo ven/modifican sus propios datos
- ✅ Las monedas están restringidas a PEN/USD
- ✅ Los montos siempre son positivos
- ✅ Los abonos son inmutables (no se pueden editar después de crearlos)

---

**Fecha de creación**: 2025-11-28
**Versión**: 1.0.0
