/**
 * Exportación del panel de Consumo IA → informe para análisis.
 *
 * Genera, a partir de los rollups que YA muestra `ConsumoIATab` (sin red), dos
 * formatos:
 *  - **Markdown**: informe legible + un "brief" de optimización listo para
 *    pegar en una IA (Claude/ChatGPT) y pedirle un plan de reducción de costo.
 *    El brief incluye la economía de tokens correcta (caching, visión) para que
 *    el análisis no caiga en mitos (p. ej. "comprimir bytes baja tokens").
 *  - **JSON**: volcado completo y estructurado (machine-readable).
 *
 * Los rollups `app` (scope `app`, autogenerado) y `usuarios` (suma de scope
 * `user`) son DISJUNTOS, por lo que su suma es el consumo total sin doble conteo.
 */

import type {
  AiUsageRollup,
  AiUsageUserRow,
  AiUsageBucketStat,
  Usuario,
} from '@app-types';
import { MODEL_CHANGELOG } from './modelConfig';

export interface ExportConsumoIAInput {
  mes: string;
  /** Rollup del aplicativo (scope `app`, autogenerado). */
  app: AiUsageRollup | null;
  /** Rollup agregado de usuarios (suma de scope `user`). */
  usuarios: AiUsageRollup | null;
  /** Filas por usuario (para el top y el detalle por usuario). */
  topUsers: AiUsageUserRow[];
  /** Nombres/emails resueltos por userId. */
  names: Record<string, Usuario>;
  /** Marca temporal de generación (ISO). */
  generadoEn: string;
}

/**
 * Metadatos conocidos por feature (de la auditoría del flujo de IA, 2026-06).
 * Permite que el informe ubique cada gasto en su repo/modelo/tipo y que una IA
 * razone sobre la palanca correcta de optimización por feature.
 */
interface FeatureMeta {
  proveedor: string;
  modelo: string;
  tipo: string;
  repo: 'backend' | 'functions';
  pro?: boolean;
}

const FEATURE_META: Record<string, FeatureMeta> = {
  whatsapp_receipt_ocr: { proveedor: 'anthropic', modelo: 'Sonnet (primary)', tipo: 'visión/OCR', repo: 'functions' },
  whatsapp_expense_parse: { proveedor: 'anthropic', modelo: 'Sonnet (primary)', tipo: 'texto', repo: 'functions' },
  whatsapp_date_parse: { proveedor: 'anthropic', modelo: 'Haiku (helper)', tipo: 'texto', repo: 'functions' },
  whatsapp_category_classify: { proveedor: 'anthropic', modelo: 'Haiku (helper)', tipo: 'texto', repo: 'functions' },
  whatsapp_payment_disambiguation: { proveedor: 'anthropic', modelo: 'Haiku (helper)', tipo: 'texto', repo: 'functions' },
  whatsapp_audio_transcribe: { proveedor: 'openai', modelo: 'gpt-4o-mini-transcribe', tipo: 'audio', repo: 'functions' },
  assistant_chat: { proveedor: 'anthropic', modelo: 'Sonnet', tipo: 'chat + contexto de gastos', repo: 'backend' },
  receipt_ocr: { proveedor: 'anthropic', modelo: 'Sonnet (primary)', tipo: 'visión/OCR', repo: 'backend' },
  'shared-receipt-scan': { proveedor: 'anthropic', modelo: 'Sonnet (primary)', tipo: 'visión/OCR', repo: 'backend', pro: true },
  voice_expense: { proveedor: 'anthropic', modelo: 'Sonnet (primary)', tipo: 'texto', repo: 'backend' },
  voice_transcribe: { proveedor: 'openai', modelo: 'gpt-4o-mini-transcribe', tipo: 'audio', repo: 'backend' },
  autocategorize: { proveedor: 'anthropic', modelo: 'Sonnet', tipo: 'texto corto', repo: 'backend' },
  category_classify: { proveedor: 'anthropic', modelo: 'Haiku (helper)', tipo: 'texto corto', repo: 'backend' },
  metrics_insights: { proveedor: 'anthropic', modelo: 'Sonnet (analytics)', tipo: 'texto', repo: 'backend', pro: true },
  metrics_ask: { proveedor: 'anthropic', modelo: 'Sonnet (analytics)', tipo: 'texto', repo: 'backend', pro: true },
  metrics_roast: { proveedor: 'anthropic', modelo: 'Sonnet (analytics)', tipo: 'texto', repo: 'backend', pro: true },
  metrics_image: { proveedor: 'openai', modelo: 'gpt-image-1', tipo: 'imagen (no tokens)', repo: 'backend', pro: true },
};

const EMPTY_BUCKET: AiUsageBucketStat = { tokens: 0, calls: 0, costUsd: 0 };

function mergeBuckets(
  maps: Array<Record<string, AiUsageBucketStat> | undefined>,
): Record<string, AiUsageBucketStat> {
  const out: Record<string, AiUsageBucketStat> = {};
  for (const map of maps) {
    if (!map) continue;
    for (const [k, v] of Object.entries(map)) {
      const cur = out[k] ?? { ...EMPTY_BUCKET };
      out[k] = {
        tokens: cur.tokens + (v?.tokens ?? 0),
        calls: cur.calls + (v?.calls ?? 0),
        costUsd: cur.costUsd + (v?.costUsd ?? 0),
      };
    }
  }
  return out;
}

function fmtTok(n: number): string {
  return (n || 0).toLocaleString('es-PE');
}

function fmtUsd(n: number): string {
  return `$${(n || 0).toFixed(4)}`;
}

function perCall(tokens: number, calls: number): string {
  return calls > 0 ? Math.round(tokens / calls).toLocaleString('es-PE') : '—';
}

function share(part: number, total: number): string {
  return total > 0 ? `${((part / total) * 100).toFixed(1)}%` : '—';
}

interface Totales {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  calls: number;
}

function totalsOf(r: AiUsageRollup | null): Totales {
  return {
    totalTokens: r?.totalTokens ?? 0,
    inputTokens: r?.inputTokens ?? 0,
    outputTokens: r?.outputTokens ?? 0,
    estimatedCostUsd: r?.estimatedCostUsd ?? 0,
    calls: r?.calls ?? 0,
  };
}

function sumTotals(a: Totales, b: Totales): Totales {
  return {
    totalTokens: a.totalTokens + b.totalTokens,
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    estimatedCostUsd: a.estimatedCostUsd + b.estimatedCostUsd,
    calls: a.calls + b.calls,
  };
}

function featureRows(
  buckets: Record<string, AiUsageBucketStat>,
  totalTokens: number,
): string[] {
  const entries = Object.entries(buckets).sort(
    (a, b) => b[1].tokens - a[1].tokens,
  );
  if (entries.length === 0) return ['| _(sin datos)_ |  |  |  |  |  |  |  |  |'];
  return entries.map(([label, v]) => {
    const m = FEATURE_META[label];
    const meta = m
      ? `${m.proveedor} · ${m.modelo}${m.pro ? ' · PRO' : ''}`
      : '—';
    const tipo = m ? `${m.tipo} (${m.repo})` : '—';
    return `| \`${label}\` | ${meta} | ${tipo} | ${fmtTok(v.tokens)} | ${share(v.tokens, totalTokens)} | ${v.calls} | ${perCall(v.tokens, v.calls)} | ${fmtUsd(v.costUsd)} | ${v.calls > 0 ? fmtUsd(v.costUsd / v.calls) : '—'} |`;
  });
}

function providerRows(buckets: Record<string, AiUsageBucketStat>): string[] {
  const entries = Object.entries(buckets).sort(
    (a, b) => b[1].costUsd - a[1].costUsd,
  );
  if (entries.length === 0) return ['| _(sin datos)_ |  |  |  |'];
  return entries.map(
    ([label, v]) =>
      `| ${label} | ${fmtTok(v.tokens)} | ${v.calls} | ${fmtUsd(v.costUsd)} |`,
  );
}

const ANALYSIS_PROMPT = `## Pregunta para la IA (pega este archivo completo en Claude o ChatGPT)

Actúa como **experto en optimización de costos de la API de Claude (Anthropic)** y de IA en general. Analiza el consumo de arriba y entrega un **plan priorizado para reducir el gasto sin perder calidad**. Ten en cuenta estas reglas de economía de tokens (son correctas, no las contradigas):

1. **Right-sizing de modelo** — la palanca más grande. Revisa qué features usan un modelo más caro del necesario. El OCR de comprobantes corre en **Sonnet** ($3/$15 por 1M); **Haiku 4.5** ($1/$5) también tiene visión y suele bastar para recibos → ~3× más barato. Es un cambio de variable de entorno (\`ANTHROPIC_MODEL_PRIMARY\`), reversible, a validar con precisión.
2. **Prompt caching (\`cache_control\`)** — solo sirve si el **prefijo es estable y supera el mínimo cacheable** (Sonnet 4.6/Haiku: 2048 tok; otros Opus: 4096). El prompt de OCR (~550 tok) está por DEBAJO del mínimo → cachearlo no ahorra nada. Donde SÍ aplica: el **chat**, cuyo \`system\` + contexto de gastos del mes se reenvía cada turno; mover el contexto a una posición estable y cacheada hace que los turnos 2..N lo lean a ~0.1× del precio.
3. **Tokens de visión (OCR)** — el costo de una imagen depende de sus **DIMENSIONES** (≈ ancho×alto/750, recortado a ~1568px lado largo en Sonnet), **NO de los bytes**. Bajar la calidad JPEG **no** reduce tokens; reducir la resolución sí (con riesgo de legibilidad del recibo). Anthropic ya reescala server-side a ~1568px, así que enviar más grande no cuesta más tokens (solo ancho de banda).
4. **Historial de conversación** — ¿se reenvía TODO el historial en cada turno? Limitar a los últimos N turnos acota el costo en chats largos.
5. **Consolidación de llamadas** — una acción puede disparar varias llamadas (en WhatsApp: OCR → parse → fecha → categoría → método de pago). Evaluar unir lo posible en una sola respuesta estructurada.
6. **Caché de resultados** (distinto del prompt caching) — ¿se recalculan respuestas idénticas? (insights y roast ya cachean 24h).
7. **\`max_tokens\`** — ¿están dimensionados al output real o sobredimensionados?

**Entrega**: una tabla priorizada con columnas *Palanca · Feature(s) afectada(s) · Impacto ($ estimado) · Esfuerzo · Riesgo de calidad*, y los cambios concretos por feature.`;

/** Construye el informe Markdown (legible + brief para IA). */
export function buildConsumoIAMarkdown(input: ExportConsumoIAInput): string {
  const { mes, app, usuarios, topUsers, names, generadoEn } = input;

  const appT = totalsOf(app);
  const userT = totalsOf(usuarios);
  const total = sumTotals(appT, userT);

  const byFeature = mergeBuckets([app?.byFeature, usuarios?.byFeature]);
  const byProvider = mergeBuckets([app?.byProvider, usuarios?.byProvider]);

  const lines: string[] = [];
  lines.push(`# Informe de Consumo de IA — ${mes}`);
  lines.push('');
  lines.push(`> Generado: ${generadoEn}`);
  lines.push(
    '> Fuente: rollups mensuales `aiUsageAppMonthly` (aplicativo) + `aiUsageMonthly` (usuarios). Costos **estimados** con tarifas configuradas (no factura real del vendor).',
  );
  lines.push('');

  lines.push('## Resumen');
  lines.push('');
  lines.push(
    '| Ámbito | Tokens | Entrada | Salida | Costo (USD) | Llamadas | Tok/llamada |',
  );
  lines.push('|---|---:|---:|---:|---:|---:|---:|');
  lines.push(
    `| Aplicativo (autogenerado) | ${fmtTok(appT.totalTokens)} | ${fmtTok(appT.inputTokens)} | ${fmtTok(appT.outputTokens)} | ${fmtUsd(appT.estimatedCostUsd)} | ${appT.calls} | ${perCall(appT.totalTokens, appT.calls)} |`,
  );
  lines.push(
    `| Usuarios (suma) | ${fmtTok(userT.totalTokens)} | ${fmtTok(userT.inputTokens)} | ${fmtTok(userT.outputTokens)} | ${fmtUsd(userT.estimatedCostUsd)} | ${userT.calls} | ${perCall(userT.totalTokens, userT.calls)} |`,
  );
  lines.push(
    `| **Total** | **${fmtTok(total.totalTokens)}** | ${fmtTok(total.inputTokens)} | ${fmtTok(total.outputTokens)} | **${fmtUsd(total.estimatedCostUsd)}** | ${total.calls} | ${perCall(total.totalTokens, total.calls)} |`,
  );
  lines.push('');

  lines.push('## Consolidado por feature (aplicativo + usuarios)');
  lines.push('');
  lines.push(
    '| Feature | Proveedor · Modelo | Tipo (repo) | Tokens | % | Llamadas | Tok/llamada | Costo USD | USD/llamada |',
  );
  lines.push('|---|---|---|---:|---:|---:|---:|---:|---:|');
  for (const row of featureRows(byFeature, total.totalTokens)) lines.push(row);
  lines.push('');

  lines.push('## Consolidado por proveedor');
  lines.push('');
  lines.push('| Proveedor | Tokens | Llamadas | Costo USD |');
  lines.push('|---|---:|---:|---:|');
  for (const row of providerRows(byProvider)) lines.push(row);
  lines.push('');

  lines.push(`## Top usuarios (${Math.min(topUsers.length, 15)})`);
  lines.push('');
  lines.push('| # | Usuario | Email | Tokens | Costo USD | Llamadas |');
  lines.push('|---:|---|---|---:|---:|---:|');
  topUsers.slice(0, 15).forEach((u, i) => {
    const meta = names[u.userId];
    const nombre = meta?.nombre ?? u.nombre ?? '—';
    const email = meta?.email ?? u.email ?? u.userId;
    lines.push(
      `| ${i + 1} | ${nombre} | ${email} | ${fmtTok(u.totalTokens)} | ${fmtUsd(u.estimatedCostUsd)} | ${u.calls} |`,
    );
  });
  if (topUsers.length === 0) lines.push('| — | _(sin datos)_ |  |  |  |  |');
  lines.push('');

  lines.push('## Contexto técnico (arquitectura del consumo de IA)');
  lines.push('');
  lines.push(
    '- **Backend NestJS** (`gastos-backend`): chat asistente, OCR web/compartidos, voz, métricas PRO, generación de imagen (OpenAI).',
  );
  lines.push(
    '- **Firebase Functions** (`gastos-firebase-functions`): bot de WhatsApp (OCR de recibos + parseo/clasificación), transcripción de audio (OpenAI).',
  );
  lines.push(
    '- Modelos por *tier* (paquete compartido `@gastos/expense-ai`): `primary` = Claude Sonnet (visión + parseo), `helper` = Claude Haiku 4.5 (clasificaciones acotadas). `thinking` desactivado, `effort: low` donde aplica.',
  );
  lines.push(
    '- Contabilización: cada llamada escribe `aiUsageEvents` + incrementa `aiUsageMonthly/{uid}_{mes}` (usuario) y `aiUsageAppMonthly/{mes}` (app). Costo estimado con tarifas por modelo.',
  );
  lines.push('');

  if (MODEL_CHANGELOG.length > 0) {
    lines.push('## Cambios de modelo recientes');
    lines.push('');
    for (const c of MODEL_CHANGELOG) {
      lines.push(`- **${c.fecha}** — ${c.titulo}`);
      if (c.detalle) lines.push(`  - ${c.detalle}`);
      lines.push(
        `  - Afecta: ${c.afecta.join(', ')} (todos los usuarios de esas funciones)`,
      );
    }
    lines.push('');
  }

  lines.push(ANALYSIS_PROMPT);
  lines.push('');

  return lines.join('\n');
}

/** Construye el volcado JSON estructurado (machine-readable). */
export function buildConsumoIAJson(input: ExportConsumoIAInput): string {
  const { mes, app, usuarios, topUsers, names, generadoEn } = input;
  const appT = totalsOf(app);
  const userT = totalsOf(usuarios);

  const payload = {
    mes,
    generadoEn,
    fuente: {
      app: 'aiUsageAppMonthly',
      usuarios: 'aiUsageMonthly',
      nota: 'Costos estimados con tarifas configuradas, no factura real del vendor.',
    },
    resumen: {
      aplicativo: appT,
      usuarios: userT,
      total: sumTotals(appT, userT),
    },
    consolidadoPorFeature: mergeBuckets([app?.byFeature, usuarios?.byFeature]),
    consolidadoPorProveedor: mergeBuckets([
      app?.byProvider,
      usuarios?.byProvider,
    ]),
    aplicativoPorFeature: app?.byFeature ?? {},
    usuariosPorFeature: usuarios?.byFeature ?? {},
    topUsuarios: topUsers.slice(0, 100).map((u) => ({
      userId: u.userId,
      nombre: names[u.userId]?.nombre ?? u.nombre ?? null,
      email: names[u.userId]?.email ?? u.email ?? null,
      totalTokens: u.totalTokens,
      inputTokens: u.inputTokens,
      outputTokens: u.outputTokens,
      estimatedCostUsd: u.estimatedCostUsd,
      calls: u.calls,
      byFeature: u.byFeature,
      byProvider: u.byProvider,
    })),
    featureMeta: FEATURE_META,
    cambiosModelo: MODEL_CHANGELOG,
  };

  return JSON.stringify(payload, null, 2);
}

/** Descarga un archivo de texto en el navegador (patrón estándar del proyecto). */
export function downloadConsumoIA(
  filename: string,
  content: string,
  mime: string,
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
