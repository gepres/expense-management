/**
 * Script para generar iconos PWA usando sharp
 *
 * Uso:
 * 1. npm install -D sharp
 * 2. node scripts/generate-icons.js
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-16x16.png', size: 16 },
];

async function generateIcons() {
  const svgBuffer = readFileSync(join(publicDir, 'icon.svg'));

  console.log('🎨 Generando iconos para PWA...\n');

  for (const { name, size } of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(join(publicDir, name));

      console.log(`✅ ${name} (${size}x${size}) creado`);
    } catch (error) {
      console.error(`❌ Error al crear ${name}:`, error.message);
    }
  }

  console.log('\n✨ Iconos generados exitosamente!');
  console.log('\nPróximos pasos:');
  console.log('1. Verifica los iconos en la carpeta public/');
  console.log('2. Construye la app: npm run build');
  console.log('3. Prueba la PWA en producción: npm run preview');
}

generateIcons().catch(console.error);
