/**
 * Exportación visual del módulo de Métricas.
 *
 * - PNG: imagen del nodo (gráficos recharts incluidos) vía `html-to-image`.
 * - PDF: reporte A4 multi-página embebiendo el PNG del dashboard + cabecera.
 *
 * Excel/CSV NO viven aquí: se sirven desde el backend (`AnalyticsService`).
 */

import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/** Color de fondo efectivo (respeta tema claro/oscuro). */
function backgroundColor(): string {
  if (typeof window === 'undefined') return '#ffffff';
  const bg = getComputedStyle(document.body).backgroundColor;
  return bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#ffffff';
}

async function nodoAPng(node: HTMLElement): Promise<string> {
  // Espera a que las fuentes estén listas: si no, el primer render sale
  // con texto/medidas incorrectas (más notorio en desktop).
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      /* ignore */
    }
  }

  const rect = node.getBoundingClientRect();
  const opts = {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: backgroundColor(),
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
    // Evita romper la captura por hojas de estilo de extensiones/fuentes.
    filter: (el: HTMLElement) =>
      !(el instanceof HTMLElement && el.dataset?.exportIgnore === 'true'),
  };

  // El PRIMER render de html-to-image suele salir incompleto (gradientes,
  // imágenes y estilos aún no embebidos), sobre todo en desktop. El
  // workaround recomendado por la librería es renderizar y descartar, y
  // usar el segundo intento.
  await toPng(node, opts);
  await new Promise((r) => setTimeout(r, 90));
  return toPng(node, opts);
}

function descargar(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** Descarga el nodo como PNG. */
export async function exportarPNG(
  node: HTMLElement,
  filename: string,
): Promise<void> {
  const dataUrl = await nodoAPng(node);
  descargar(dataUrl, filename);
}

export type CompartirResultado = 'shared' | 'fallback' | 'cancelled';

/** Descarga directa de un data URL (p.ej. la ilustración IA). */
export function descargarDataUrl(dataUrl: string, filename: string): void {
  descargar(dataUrl, filename);
}

/**
 * Comparte un data URL de imagen.
 * - Móvil / navegadores con Web Share API de archivos → comparte el PNG
 *   directamente (el usuario elige WhatsApp).
 * - Resto → descarga el PNG y abre WhatsApp con el texto (el usuario
 *   adjunta la imagen descargada).
 */
export async function compartirDataUrl(
  dataUrl: string,
  opts: { fileName: string; texto: string },
): Promise<CompartirResultado> {
  // Intento 1: Web Share API con archivo (ideal en móvil).
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], opts.fileName, { type: 'image/png' });
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };
    if (
      typeof nav.share === 'function' &&
      typeof nav.canShare === 'function' &&
      nav.canShare({ files: [file] })
    ) {
      try {
        await nav.share({
          files: [file],
          text: opts.texto,
          title: 'Mi roast financiero',
        });
        return 'shared';
      } catch (err) {
        // El usuario canceló el diálogo de compartir → no es un error.
        if (err instanceof DOMException && err.name === 'AbortError') {
          return 'cancelled';
        }
        // Cualquier otro fallo → caemos al fallback.
      }
    }
  } catch {
    /* sin soporte de File/share → fallback */
  }

  // Fallback: descargar imagen + abrir WhatsApp con el texto.
  descargar(dataUrl, opts.fileName);
  window.open(
    `https://wa.me/?text=${encodeURIComponent(opts.texto)}`,
    '_blank',
    'noopener,noreferrer',
  );
  return 'fallback';
}

/** Comparte un nodo del DOM como imagen (renderiza y delega). */
export async function compartirImagenNodo(
  node: HTMLElement,
  opts: { fileName: string; texto: string },
): Promise<CompartirResultado> {
  const dataUrl = await nodoAPng(node);
  return compartirDataUrl(dataUrl, opts);
}

export interface ReporteMeta {
  periodo: string; // "mayo 2026"
  moneda: string;
  totalGastado: string; // ya formateado
  proyeccion: string;
  vsMesAnterior: string;
}

/**
 * Genera un PDF A4 (vertical) con cabecera + el dashboard como imagen,
 * paginado si excede el alto de página.
 */
export async function exportarReportePDF(
  node: HTMLElement,
  filename: string,
  meta: ReporteMeta,
): Promise<void> {
  const dataUrl = await nodoAPng(node);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const contentW = pageW - margin * 2;

  // Cabecera.
  pdf.setFontSize(18);
  pdf.setTextColor(40, 40, 40);
  pdf.text('Reporte de Métricas', margin, 16);
  pdf.setFontSize(10);
  pdf.setTextColor(110, 110, 110);
  pdf.text(
    `Periodo: ${meta.periodo}  ·  Moneda: ${meta.moneda}`,
    margin,
    23,
  );
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  pdf.text(
    `Total gastado: ${meta.totalGastado}   |   Proyección: ${meta.proyeccion}   |   vs mes anterior: ${meta.vsMesAnterior}`,
    margin,
    31,
  );
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, 35, pageW - margin, 35);

  // Imagen del dashboard, paginada.
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
  });

  const ratio = img.height / img.width;
  const imgWmm = contentW;
  const imgHmm = imgWmm * ratio;

  const headerOffset = 40;
  const firstPageAvail = pageH - headerOffset - margin;
  const fullPageAvail = pageH - margin * 2;

  if (imgHmm <= firstPageAvail) {
    pdf.addImage(dataUrl, 'PNG', margin, headerOffset, imgWmm, imgHmm);
  } else {
    // Slice vertical: renderizamos la imagen completa y la "movemos" hacia
    // arriba en cada página (técnica estándar con clipping por página).
    let renderedMm = 0;
    let first = true;
    while (renderedMm < imgHmm) {
      const avail = first ? firstPageAvail : fullPageAvail;
      const top = first ? headerOffset : margin;
      if (!first) pdf.addPage();
      pdf.addImage(
        dataUrl,
        'PNG',
        margin,
        top - renderedMm,
        imgWmm,
        imgHmm,
      );
      // Tapa el sobrante inferior para que no invada el área fuera de página.
      renderedMm += avail;
      first = false;
    }
  }

  // Pie en la última página.
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    `Generado por Gastos · ${new Date().toLocaleDateString('es-PE')}`,
    margin,
    pageH - 6,
  );

  pdf.save(filename);
}
