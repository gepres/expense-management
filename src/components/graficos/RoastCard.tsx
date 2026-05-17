/**
 * Roast financiero compartible.
 *
 * Tarjeta sarcástica (estilo "Wrapped") generada por IA a partir de las
 * métricas del periodo. Se puede descargar como PNG o compartir en WhatsApp.
 * Disparo manual (no consume IA hasta que el usuario lo pide). Solo PRO
 * (el módulo entero ya está gated).
 */

import { useRef } from 'react';
import {
  Flame,
  Share2,
  Download,
  Loader2,
  RefreshCw,
  PartyPopper,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMetricasRoast } from '@hooks/useMetricasRoast';
import { SegmentedControl } from '@components/common/SegmentedControl';
import {
  compartirImagenNodo,
  compartirDataUrl,
  descargarDataUrl,
  exportarPNG,
} from '@utils/exportMetricas';
import type { MetricasFiltros, MetricsRoast } from '@app-types';

interface RoastCardProps {
  filtros: MetricasFiltros;
  /** Si false, no muestra el botón generar (p.ej. periodo sin datos). */
  enabled?: boolean;
  /** Si true, muestra el botón de ilustración IA (backend con OPENAI_API_KEY). */
  aiImageEnabled?: boolean;
}

function colorDesastre(v: number): string {
  if (v >= 70) return '#ef4444';
  if (v >= 40) return '#f59e0b';
  return '#10b981';
}

function textoCompartible(r: MetricsRoast): string {
  return [
    r.titulo,
    '',
    ...r.frases.map((f) => `• ${f}`),
    '',
    `🧨 ${r.veredicto}`,
    `Índice de desastre: ${r.puntuacionDesastre}/100`,
    '',
    r.hashtags.join(' '),
    '',
    'Generado con Gastos 💸',
  ].join('\n');
}

export default function RoastCard({
  filtros,
  enabled = true,
  aiImageEnabled = false,
}: RoastCardProps) {
  const {
    roast,
    loading,
    error,
    tono,
    setTono,
    generar,
    imagen,
    loadingImagen,
    errorImagen,
    generarImagen,
  } = useMetricasRoast(filtros);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileName = `roast_${filtros.year}_${String(filtros.month).padStart(2, '0')}.png`;
  const imgFileName = `roast_ia_${filtros.year}_${String(filtros.month).padStart(2, '0')}.png`;

  const textoImg = roast
    ? textoCompartible(roast)
    : '¡Mira el roast de mis gastos! 😅 Generado con Gastos 💸';

  const handleDescargarImg = () => {
    if (!imagen) return;
    descargarDataUrl(imagen, imgFileName);
    toast.success('Imagen descargada');
  };

  const handleCompartirImg = async () => {
    if (!imagen) return;
    const tId = toast.loading('Preparando para compartir…');
    try {
      const res = await compartirDataUrl(imagen, {
        fileName: imgFileName,
        texto: textoImg,
      });
      if (res === 'shared') toast.success('¡Compartido!', { id: tId });
      else if (res === 'fallback')
        toast.success('Imagen descargada — adjúntala en WhatsApp', {
          id: tId,
          duration: 5000,
        });
      else toast.dismiss(tId);
    } catch {
      toast.error('No se pudo compartir', { id: tId });
    }
  };

  const handleDescargar = async () => {
    if (!cardRef.current) return;
    try {
      await exportarPNG(cardRef.current, fileName);
      toast.success('Imagen descargada');
    } catch {
      toast.error('No se pudo generar la imagen');
    }
  };

  const handleCompartir = async () => {
    if (!cardRef.current || !roast) return;
    const tId = toast.loading('Preparando para compartir…');
    try {
      const res = await compartirImagenNodo(cardRef.current, {
        fileName,
        texto: textoCompartible(roast),
      });
      if (res === 'shared') {
        toast.success('¡Compartido!', { id: tId });
      } else if (res === 'fallback') {
        toast.success(
          'Imagen descargada — adjúntala en el chat de WhatsApp',
          { id: tId, duration: 5000 },
        );
      } else {
        toast.dismiss(tId);
      }
    } catch {
      toast.error('No se pudo compartir', { id: tId });
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Roast de tu mes
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tus gastos, pero con humor. Generá la tarjeta y compártela 😈
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SegmentedControl
            size="sm"
            value={tono}
            onChange={(v) => setTono(v as 'suave' | 'picante')}
            options={[
              { value: 'suave', label: 'Suave' },
              { value: 'picante', label: 'Picante' },
            ]}
          />
          <button
            onClick={() => void generar()}
            disabled={loading || !enabled}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : roast ? (
              <RefreshCw className="h-4 w-4" />
            ) : (
              <Flame className="h-4 w-4" />
            )}
            {roast ? 'Otra' : 'Generar mi roast'}
          </button>
          {aiImageEnabled && (
            <button
              onClick={() => void generarImagen()}
              disabled={loadingImagen || !enabled}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-400 text-purple-600 dark:text-purple-300 text-sm font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors disabled:opacity-50"
              title="Genera una ilustración con IA (OpenAI)"
            >
              {loadingImagen ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Ilustración IA
            </button>
          )}
        </div>
      </div>

      {!enabled && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Registra gastos en este periodo para generar tu roast.
        </p>
      )}

      {enabled && error && (
        <p className="text-sm text-amber-600 dark:text-amber-400 py-3">
          {error}
        </p>
      )}

      {enabled && !roast && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <PartyPopper className="h-12 w-12 text-orange-400 mb-3" />
          <p className="text-sm text-muted-foreground max-w-xs">
            ¿Te atreves? La IA va a roastear tus gastos del mes en una tarjeta
            lista para mandar al grupo de WhatsApp.
          </p>
        </div>
      )}

      {enabled && loading && !roast && (
        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-sm">Afilando los chistes…</p>
        </div>
      )}

      {roast && (
        <div className={loading ? 'opacity-60' : ''}>
          {/* Tarjeta exportable */}
          <div
            ref={cardRef}
            className="mx-auto max-w-md rounded-2xl p-6 text-white relative overflow-hidden"
            style={{
              // Gradiente INLINE con colores explícitos: html-to-image no
              // captura de forma fiable los gradientes de Tailwind (usan
              // CSS custom props), lo que rompía la descarga en desktop.
              backgroundColor: '#9333ea',
              backgroundImage:
                'linear-gradient(135deg, #c026d3 0%, #9333ea 50%, #4338ca 100%)',
            }}
          >
            <div className="absolute -top-8 -right-8 opacity-20">
              <Flame className="h-32 w-32" />
            </div>

            <div className="relative">
              <h3 className="text-xl font-extrabold leading-tight">
                {roast.titulo}
              </h3>

              {/* Medidor de desastre */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-medium opacity-90 mb-1">
                  <span>Índice de desastre</span>
                  <span className="font-bold">
                    {roast.puntuacionDesastre}/100
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(roast.puntuacionDesastre, 100)}%`,
                      backgroundColor: colorDesastre(
                        roast.puntuacionDesastre,
                      ),
                    }}
                  />
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {roast.frases.map((f, i) => (
                  <li key={i} className="text-sm leading-snug flex gap-2">
                    <span aria-hidden>👉</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {roast.veredicto && (
                <p className="mt-4 text-sm font-bold bg-white/15 rounded-lg px-3 py-2">
                  🧨 {roast.veredicto}
                </p>
              )}

              {roast.hashtags.length > 0 && (
                <p className="mt-3 text-xs font-semibold opacity-90">
                  {roast.hashtags.join(' ')}
                </p>
              )}

              <p className="mt-4 text-[10px] uppercase tracking-wider opacity-70 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Generado con Gastos · humor IA
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={handleDescargar}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Download className="h-4 w-4" />
              Descargar PNG
            </button>
            <button
              onClick={handleCompartir}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Share2 className="h-4 w-4" />
              Compartir
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Se comparte una imagen. En PC se descarga y abrís WhatsApp para
            adjuntarla.
          </p>
        </div>
      )}

      {/* Ilustración IA (opcional, OpenAI) */}
      {aiImageEnabled && (loadingImagen || errorImagen || imagen) && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Ilustración IA
          </h3>

          {loadingImagen && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Pintando tu desastre… (~15-30 s)</p>
            </div>
          )}

          {errorImagen && !loadingImagen && (
            <p className="text-sm text-amber-600 dark:text-amber-400 py-3">
              {errorImagen}
            </p>
          )}

          {imagen && !loadingImagen && (
            <div>
              <img
                src={imagen}
                alt="Ilustración IA del roast"
                className="mx-auto max-w-md w-full rounded-2xl border border-border"
              />
              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  onClick={handleDescargarImg}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar PNG
                </button>
                <button
                  onClick={handleCompartirImg}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <Share2 className="h-4 w-4" />
                  Compartir
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
