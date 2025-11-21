# Configuración de Variables de Entorno en Firebase Hosting

## Problema
Si ves el error `Firebase: Error (auth/invalid-api-key)` después de desplegar en Firebase Hosting, significa que las variables de entorno no están siendo leídas correctamente.

## Solución

### Opción 1: Usar archivo `.env` (Desarrollo Local)

1. Crea un archivo `.env` en la raíz del proyecto:
```bash
cp .env.example .env
```

2. Edita `.env` con tus valores reales de Firebase Console:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_API_BASE_URL=https://tu-api.com/api
```

### Opción 2: Variables de Entorno en Build (Firebase Hosting)

**IMPORTANTE**: Vite solo incluye variables que comienzan con `VITE_` en el build final.

Las variables de entorno deben estar disponibles **durante el build**, no en tiempo de ejecución.

#### Método 1: GitHub Actions / CI/CD

Si usas GitHub Actions, agrega las variables como secrets y úsalas en el workflow:

```yaml
- name: Build
  env:
    VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
    VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
    VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
    VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
    VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
    VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
  run: npm run build
```

#### Método 2: Build Local antes de Deploy

1. Crea un archivo `.env.production` con tus variables de producción:
```env
VITE_FIREBASE_API_KEY=tu_api_key_produccion
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
# ... resto de variables
```

2. Haz el build localmente:
```bash
npm run build
```

3. Despliega el build generado:
```bash
firebase deploy --only hosting
```

#### Método 3: Hardcodear valores (NO RECOMENDADO para API keys sensibles)

Si las variables no son sensibles, puedes crear un archivo `src/config/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Y usarlo en `src/services/firebase.ts`.

### Opción 3: Firebase Environment Config (Experimental)

Firebase tiene soporte experimental para variables de entorno:

```bash
firebase functions:config:set env.firebase_api_key="AIzaSy..."
```

Pero esto es principalmente para Cloud Functions, no para Hosting.

## Verificación

Después de configurar las variables, verifica en la consola del navegador:

1. Deberías ver: `🔧 Inicializando Firebase con configuración:`
2. Seguido de: `✅ Firebase inicializado correctamente`

Si ves `❌ Variables de entorno de Firebase faltantes:`, significa que las variables no están disponibles durante el build.

## Debugging

Para verificar qué variables están disponibles, puedes agregar temporalmente en `src/services/firebase.ts`:

```typescript
console.log('Variables disponibles:', {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'Definida' : 'NO DEFINIDA',
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'Definida' : 'NO DEFINIDA',
  // ... resto
});
```

## Notas Importantes

1. **Las variables `VITE_*` se incrustan en el código durante el build**, no son secretas.
2. **No subas `.env` a Git** - está en `.gitignore`.
3. **Para producción, usa CI/CD o build local** con las variables correctas.
4. **Firebase Hosting no soporta variables de entorno en tiempo de ejecución** - todo debe estar en el build.
