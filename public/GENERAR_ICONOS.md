# Generar Iconos para PWA

Este documento explica cómo generar los iconos necesarios para la PWA.

## Opción 1: Usar una herramienta online (Recomendado)

1. Ve a [RealFaviconGenerator](https://realfavicongenerator.net/) o [Favicon.io](https://favicon.io/)
2. Sube el archivo `icon.svg` de esta carpeta
3. Descarga el paquete generado
4. Extrae los siguientes archivos a la carpeta `public/`:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png` (180x180)
   - `favicon-32x32.png`
   - `favicon-16x16.png`
   - `favicon.ico`

## Opción 2: Usar ImageMagick (si lo tienes instalado)

```bash
# Desde la carpeta public/
magick icon.svg -resize 192x192 pwa-192x192.png
magick icon.svg -resize 512x512 pwa-512x512.png
magick icon.svg -resize 180x180 apple-touch-icon.png
magick icon.svg -resize 32x32 favicon-32x32.png
magick icon.svg -resize 16x16 favicon-16x16.png
magick icon.svg -define icon:auto-resize=16,32,48,64,256 favicon.ico
```

## Opción 3: Usar Node.js (sharp)

```bash
# Instalar sharp
npm install -D sharp sharp-cli

# Generar iconos
npx sharp-cli --input icon.svg --output pwa-192x192.png resize 192 192
npx sharp-cli --input icon.svg --output pwa-512x512.png resize 512 512
npx sharp-cli --input icon.svg --output apple-touch-icon.png resize 180 180
npx sharp-cli --input icon.svg --output favicon-32x32.png resize 32 32
npx sharp-cli --input icon.svg --output favicon-16x16.png resize 16 16
```

## Iconos Necesarios

- ✅ `favicon.svg` - Creado
- ✅ `icon.svg` - Creado
- ⏳ `pwa-192x192.png` - Generar (192x192)
- ⏳ `pwa-512x512.png` - Generar (512x512)
- ⏳ `apple-touch-icon.png` - Generar (180x180)
- ⏳ `favicon-32x32.png` - Generar (32x32)
- ⏳ `favicon-16x16.png` - Generar (16x16)
- ⏳ `favicon.ico` - Generar (multi-size)

## Diseño del Icono

El icono usa un diseño minimalista con:
- Fondo: `#5d6672` (gris mate)
- Símbolo: `$` (dólar) en color claro `#f7f8fa`
- Estilo: Líneas simples y limpias
- Bordes redondeados para una apariencia moderna

## Después de Generar

Una vez generados los iconos, la PWA estará completa y podrás instalarla en dispositivos móviles y escritorio.
