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
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: backgroundColor(),
    // Evita romper la captura por hojas de estilo de extensiones/fuentes.
    filter: (el) =>
      !(el instanceof HTMLElement && el.dataset?.exportIgnore === 'true'),
  });
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
