/**
 * Script de verificación de configuración de Firebase
 * Ejecuta: node check-firebase-config.js
 */

const https = require('https');

const PROJECT_ID = 'expense-app-gepres';

console.log('\n🔍 VERIFICACIÓN DE CONFIGURACIÓN DE FIREBASE\n');
console.log('═'.repeat(60));

// 1. Verificar variables de entorno
console.log('\n1️⃣  Variables de Entorno (.env)');
console.log('─'.repeat(60));

const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

let hasAllVars = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NO DEFINIDA`);
    hasAllVars = false;
  } else {
    console.log(`✅ ${varName}: ${varName.includes('KEY') ? value.substring(0, 10) + '...' : value}`);
  }
});

if (!hasAllVars) {
  console.log('\n⚠️  ADVERTENCIA: Faltan variables de entorno');
  console.log('   Verifica que el archivo .env existe y tiene todas las variables.');
}

// 2. Instrucciones para Firebase Console
console.log('\n2️⃣  Configuración en Firebase Console');
console.log('─'.repeat(60));
console.log('\n📋 PASOS A SEGUIR:\n');

console.log('A. Habilitar Google Sign-In:');
console.log(`   👉 https://console.firebase.google.com/u/0/project/${PROJECT_ID}/authentication/providers`);
console.log('   1. Busca "Google" en la lista de proveedores');
console.log('   2. Click en "Google"');
console.log('   3. Activa el toggle "Enable"');
console.log('   4. Click en "Save"\n');

console.log('B. Autorizar dominios:');
console.log(`   👉 https://console.firebase.google.com/u/0/project/${PROJECT_ID}/authentication/settings`);
console.log('   1. Ve a la sección "Authorized domains"');
console.log('   2. Verifica que estos dominios estén en la lista:');
console.log('      ✓ localhost');
console.log('      ✓ expense-app-gepres.firebaseapp.com');
console.log('   3. Si falta "localhost", haz click en "Add domain" y agrégalo\n');

console.log('C. Verificar que no haya bloqueo de popups:');
console.log('   1. En tu navegador, ve a la configuración de sitio');
console.log('   2. Busca "localhost"');
console.log('   3. Asegúrate que "Popups" esté en "Allow"\n');

// 3. URLs útiles
console.log('\n3️⃣  Enlaces Útiles');
console.log('─'.repeat(60));
console.log(`📊 Dashboard: https://console.firebase.google.com/u/0/project/${PROJECT_ID}/overview`);
console.log(`🔐 Authentication: https://console.firebase.google.com/u/0/project/${PROJECT_ID}/authentication/users`);
console.log(`📝 Firestore: https://console.firebase.google.com/u/0/project/${PROJECT_ID}/firestore`);

// 4. Test manual
console.log('\n4️⃣  Test Manual Recomendado');
console.log('─'.repeat(60));
console.log('\n1. Abre tu aplicación en el navegador');
console.log('2. Abre la consola del navegador (F12 → Console)');
console.log('3. Click en "Iniciar sesión con Google"');
console.log('4. Observa si el popup se abre');
console.log('5. Si el popup se cierra inmediatamente:');
console.log('   - Puede ser que el navegador lo bloqueó');
console.log('   - Verifica el ícono de popup bloqueado en la barra de direcciones');
console.log('   - Permite popups para localhost\n');

console.log('═'.repeat(60));
console.log('\n✅ Verificación completa. Sigue los pasos anteriores.\n');
