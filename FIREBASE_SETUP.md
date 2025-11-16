# Configuración de Firebase para la Aplicación de Gastos

## Error 400 en el Registro

Si estás recibiendo un error 400 al intentar registrar usuarios, sigue estos pasos para configurar Firebase correctamente:

## Paso 1: Habilitar Autenticación de Email/Password

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Build** → **Authentication**
4. Haz clic en la pestaña **Sign-in method**
5. Busca **Email/Password** en la lista de proveedores
6. Haz clic en **Email/Password**
7. **Habilita** el interruptor de "Enable"
8. Haz clic en **Save**

**IMPORTANTE:** También habilita **Google** si quieres usar el login con Google:
1. En la misma sección de Sign-in methods
2. Haz clic en **Google**
3. Habilita el interruptor
4. Selecciona un email de soporte del proyecto
5. Guarda los cambios

## Paso 2: Verificar Configuración de la API Key

1. En Firebase Console, ve a **Project Settings** (ícono de engranaje)
2. En la sección **General**, verifica que tu **Web API Key** esté correcta
3. Copia el valor y verifica que coincida con el de tu `.env`:
   ```
   VITE_FIREBASE_API_KEY=TU_API_KEY_AQUI
   ```

## Paso 3: Configurar Dominios Autorizados

1. En Firebase Console, ve a **Authentication** → **Settings**
2. Busca la sección **Authorized domains**
3. Asegúrate de que `localhost` esté en la lista
4. Si vas a desplegar en producción, agrega tu dominio aquí

## Paso 4: Crear Firestore Database

1. En Firebase Console, ve a **Build** → **Firestore Database**
2. Haz clic en **Create database**
3. Selecciona una ubicación (elige la más cercana a tus usuarios)
4. **Importante:** Empieza en **modo de prueba** (test mode) para desarrollo:
   - Las reglas de seguridad se configurarán más adelante
   - Esto permite leer/escribir durante 30 días

5. Haz clic en **Create**

## Paso 5: Configurar Reglas de Firestore (CRÍTICO)

⚠️ **MUY IMPORTANTE**: Sin estas reglas configuradas correctamente, obtendrás errores de permisos al intentar leer datos.

### Opción A: Reglas de Desarrollo (Modo Prueba - Solo para desarrollo local)

**Usa estas reglas SOLO durante desarrollo inicial:**

1. Ve a **Firestore Database** → pestaña **Rules**
2. Reemplaza TODO el contenido con:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // SOLO PARA DESARROLLO - Permite leer/escribir a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Haz clic en **Publish**
4. **IMPORTANTE**: Estas reglas son inseguras para producción. Cámbialas a las reglas de producción más adelante.

### Opción B: Reglas de Producción (Recomendado)

**Usa estas reglas para mayor seguridad:**

1. Ve a **Firestore Database** → pestaña **Rules**
2. Reemplaza TODO el contenido con:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      // Permitir lectura y escritura solo del propio documento
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Reglas para gastos
    match /gastos/{gastoId} {
      // Permitir lectura de gastos propios
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // Permitir creación solo si el userId coincide con el auth
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Permitir actualización y eliminación de gastos propios
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Reglas para presupuestos
    match /presupuestos/{presupuestoId} {
      // Permitir lectura de presupuestos propios
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      // Permitir creación solo si el userId coincide con el auth
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Permitir actualización y eliminación de presupuestos propios
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

3. Haz clic en **Publish**

### ✅ Verificar que las Reglas Están Activas

Después de publicar las reglas:
1. Verás un mensaje de confirmación "Rules published successfully"
2. Las reglas deberían aparecer en el editor
3. No debería haber errores de sintaxis resaltados en rojo

## Paso 6: Configurar Storage (Opcional)

Si vas a usar Storage para imágenes de recibos:

1. Ve a **Build** → **Storage**
2. Haz clic en **Get started**
3. Acepta las reglas de seguridad predeterminadas
4. Selecciona la misma ubicación que Firestore
5. Haz clic en **Done**

## Paso 7: Verificar Variables de Entorno

Asegúrate de que tu archivo `.env` tenga todas las variables correctas:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Anthropic (para el asistente IA - opcional por ahora)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Dónde encontrar cada valor:

1. Ve a **Project Settings** en Firebase Console
2. Scroll hasta **Your apps**
3. Si no tienes una app web, haz clic en el ícono `</>`  para agregar una
4. Registra la app con un nombre (ej: "Gestión de Gastos Web")
5. Copia todos los valores del objeto `firebaseConfig` a tu `.env`

## Paso 8: Reiniciar el Servidor de Desarrollo

Después de modificar el archivo `.env`, **debes reiniciar** el servidor:

```bash
# Detén el servidor actual (Ctrl+C)
# Luego ejecuta:
npm run dev
```

## Verificar la Configuración

Prueba registrar un nuevo usuario:
1. Ve a http://localhost:5174/registro
2. Ingresa nombre, email y contraseña
3. Haz clic en "Crear Cuenta"

Si todo está configurado correctamente:
- El usuario se creará en Firebase Authentication
- Se creará un documento en Firestore en la colección `users`
- Serás redirigido al dashboard

## Solución de Problemas Comunes

### Error 400: "INVALID_EMAIL"
- Verifica que el email tenga un formato válido
- Ejemplo válido: usuario@ejemplo.com

### Error 400: "EMAIL_EXISTS"
- El email ya está registrado
- Usa otro email o ve a Login para iniciar sesión

### Error 400: "WEAK_PASSWORD"
- La contraseña debe tener al menos 6 caracteres
- Recomendado: mínimo 8 caracteres con mayúsculas, minúsculas y números

### Error: "Unsupported field value: undefined"
**Este error aparece al registrar usuarios con email/password**

**Causa:** Firestore no acepta valores `undefined` en los campos.

**Solución:** Ya está arreglado en el código actual. Si registraste un usuario antes del fix:

1. Ve a Firebase Console → **Authentication**
2. Encuentra el usuario problemático
3. Haz clic en los tres puntos (⋮) → **Delete account**
4. Luego ve a **Firestore Database** → colección **users**
5. Encuentra y elimina el documento con el UID del usuario
6. Registra el usuario nuevamente

### Error 403: "API_KEY_INVALID"
- Verifica que la API Key en `.env` sea correcta
- Cópiala nuevamente desde Firebase Console

### Error 403: "PERMISSION_DENIED"
- Email/Password no está habilitado en Authentication
- Sigue el Paso 1 de esta guía

### Error: "The query requires an index"
**Este es un error común al cargar datos**

**Error completo:**
```
The query requires an index. You can create it here:
https://console.firebase.google.com/v1/r/project/...
```

**Causa:** Firestore requiere índices compuestos para consultas que combinan filtros y ordenamiento.

**Solución:**
1. **Copia el enlace completo** del error en la consola del navegador
2. **Pega el enlace en tu navegador** - Se abrirá Firebase Console
3. Haz clic en **"Create Index"** (botón azul)
4. Espera 1-5 minutos (verás un spinner de progreso)
5. Cuando diga "Enabled" en verde, **recarga tu aplicación** (F5)

**Nota:** Este error puede aparecer varias veces (una por cada tipo de consulta). Sigue el mismo proceso cada vez.

Ver **Paso 8** arriba para más detalles sobre índices compuestos.

### Firestore: "Missing or insufficient permissions"
**Este es uno de los errores más comunes**

**Causas:**
1. No has configurado las reglas de Firestore
2. Las reglas están mal configuradas
3. No has publicado las reglas después de editarlas

**Solución:**
1. Ve a Firebase Console → **Firestore Database** → pestaña **Rules**
2. Copia y pega las reglas del **Paso 5** (usa la Opción A para desarrollo)
3. Haz clic en **Publish** (botón azul)
4. Espera el mensaje "Rules published successfully"
5. Recarga la aplicación en el navegador (F5)
6. Intenta hacer login nuevamente

**Verificación rápida:**
```javascript
// Tu archivo de reglas debe empezar con:
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Si estás en desarrollo, usa:
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Si después de publicar las reglas sigues viendo el error:
- Cierra completamente tu navegador
- Abre una ventana de incógnito
- Ve a http://localhost:5174
- Intenta login nuevamente

## Paso 8: Crear Índices Compuestos en Firestore (Importante)

⚠️ **Este paso es necesario para que las consultas funcionen correctamente**

### ¿Qué son los índices compuestos?

Firestore requiere índices para consultas que combinan filtros `where()` con ordenamiento `orderBy()`.

### Cómo crear los índices

**Método 1: Usando el enlace automático (Recomendado)**

Cuando veas un error que dice "The query requires an index. You can create it here: https://console.firebase.google.com/...":

1. Haz clic en el enlace completo
2. Firebase Console se abrirá con la configuración del índice
3. Haz clic en **"Create Index"**
4. Espera 1-2 minutos
5. Recarga tu aplicación

**Método 2: Crear manualmente desde la consola**

1. Ve a Firebase Console → **Firestore Database** → pestaña **Indexes**
2. Haz clic en **"Create Index"**
3. Configura el índice para **gastos**:
   - Collection ID: `gastos`
   - Campo 1: `userId` - Ascending
   - Campo 2: `fecha` - Descending
   - Query scope: Collection
4. Haz clic en **Create**
5. Repite para **presupuestos** si es necesario:
   - Collection ID: `presupuestos`
   - Campo 1: `userId` - Ascending
   - Campo 2: `mes` - Ascending
   - Query scope: Collection

**Método 3: Usando Firebase CLI (Avanzado)**

Si tienes Firebase CLI instalado, puedes desplegar los índices desde el archivo `firestore.indexes.json`:

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Inicializar proyecto (solo la primera vez)
firebase init firestore

# Desplegar índices
firebase deploy --only firestore:indexes
```

El archivo `firestore.indexes.json` ya está incluido en el proyecto con todos los índices necesarios.

### Índices necesarios para esta aplicación

La aplicación necesita los siguientes índices compuestos:

**Para colección `gastos`:**
```
gastos
  - userId (Ascending)
  - fecha (Descending)
```

**Para colección `presupuestos` (opcional):**
```
presupuestos
  - userId (Ascending)
  - mes (Ascending)
```

### ⏱️ Tiempo de creación

- Los índices tardan entre 1-5 minutos en crearse
- Verás un indicador de progreso en Firebase Console
- Una vez completado, aparecerá "Enabled" en verde
- No necesitas reiniciar el servidor, solo recarga la página

### 🔍 Verificar que los índices están activos

1. Ve a Firestore Database → Indexes
2. Los índices deben mostrar estado "Enabled" en verde
3. Si dice "Building", espera unos minutos más

## Próximos Pasos

Una vez que el registro funcione:
1. Prueba el login con email/password
2. Prueba el login con Google
3. Verifica que puedas crear gastos
4. Configura el API Key de Anthropic para el asistente IA

## Seguridad en Producción

**IMPORTANTE:** Las reglas actuales son para desarrollo. Antes de desplegar en producción:

1. Revisa y endurece las reglas de Firestore
2. Habilita App Check para proteger contra abuso
3. Configura restricciones de API Key por dominio
4. Implementa rate limiting si es necesario
5. Revisa los logs de seguridad regularmente

## Recursos Adicionales

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)
