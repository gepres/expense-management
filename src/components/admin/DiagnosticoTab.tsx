/**
 * Tab: Diagnóstico de uso (analítica de flujos).
 *
 * Fase 0 — métricas DERIVABLES de colecciones existentes (snapshot agregado
 * del backend, `GET /usage-events/admin/snapshot`). El origen de gastos,
 * los funnels de abandono y la navegación llegan en las Fases 1-2.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Receipt,
  Repeat,
  MessageCircle,
  Sparkles,
  UsersRound,
  ScanLine,
  ListChecks,
  RefreshCw,
  Loader2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AnalyticsEventsService } from '@services/analyticsEvents';
import type { UsageSnapshot } from '@app-types';

function fmt(n: number): string {
  return (n || 0).toLocaleString('es-PE');
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-muted rounded-lg">
          <Icon className={`h-4 w-4 ${accent}`} />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground">{fmt(value)}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function Bar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {fmt(value)} · {pct}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function DiagnosticoTab() {
  const [snap, setSnap] = useState<UsageSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      setSnap(await AnalyticsEventsService.getSnapshot(force));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el diagnóstico',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && !snap) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const ejec = snap?.recurrentes.ejecuciones;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Diagnóstico de uso · {snap?.mes}
          </h3>
          {snap && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Generado {new Date(snap.generatedAt).toLocaleString('es-PE')} ·
              caché 5 min
            </p>
          )}
        </div>
        <button
          onClick={() => void load(true)}
          className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
          aria-label="Refrescar"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm flex items-start gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {snap && (
        <div className={loading ? 'opacity-60' : ''}>
          {/* KPIs por feature */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              icon={Users}
              label="Usuarios"
              value={snap.usuarios.total}
              sub={`${fmt(snap.usuarios.conWhatsapp)} con WhatsApp · ${fmt(snap.usuarios.admins)} admin`}
              accent="text-indigo-500"
            />
            <StatCard
              icon={Receipt}
              label="Gastos"
              value={snap.gastos.total}
              sub={`${fmt(snap.gastos.esteMes)} este mes`}
              accent="text-emerald-500"
            />
            <StatCard
              icon={MessageCircle}
              label="Bot WhatsApp"
              value={snap.whatsapp.llamadosTotal}
              sub={`${fmt(snap.whatsapp.pendientes)} en cola · ${fmt(snap.whatsapp.vinculados)} vinculados`}
              accent="text-green-500"
            />
            <StatCard
              icon={Sparkles}
              label="Chat IA"
              value={snap.chat.conversaciones}
              sub={`${fmt(snap.chat.mensajes)} mensajes`}
              accent="text-violet-500"
            />
            <StatCard
              icon={Repeat}
              label="Recurrentes activos"
              value={
                snap.recurrentes.gastos.activos +
                snap.recurrentes.transferencias.activos
              }
              sub={`${fmt(snap.recurrentes.gastos.total + snap.recurrentes.transferencias.total)} en total`}
              accent="text-amber-500"
            />
            <StatCard
              icon={UsersRound}
              label="Grupos"
              value={snap.grupos.total}
              accent="text-blue-500"
            />
            <StatCard
              icon={ScanLine}
              label="Recibos escaneados"
              value={snap.recibos.total}
              accent="text-rose-500"
            />
            <StatCard
              icon={ListChecks}
              label="Listas de compra"
              value={snap.listas.total}
              accent="text-cyan-500"
            />
          </div>

          {/* Salud del cron de programados */}
          {ejec && (
            <div className="bg-card border border-border rounded-xl p-5 mt-5">
              <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Repeat className="h-4 w-4 text-amber-500" />
                Cron de programados · {fmt(ejec.total)} ejecuciones
              </h4>
              <div className="space-y-2.5">
                <Bar
                  label="Exitosas"
                  value={ejec.exitosa}
                  total={ejec.total}
                  color="bg-emerald-500"
                />
                <Bar
                  label="Fallidas"
                  value={ejec.fallida}
                  total={ejec.total}
                  color="bg-red-500"
                />
                <Bar
                  label="Saldo insuficiente"
                  value={ejec.saldoInsuficiente}
                  total={ejec.total}
                  color="bg-amber-500"
                />
                <Bar
                  label="Pendientes"
                  value={ejec.pending}
                  total={ejec.total}
                  color="bg-muted-foreground/40"
                />
              </div>
            </div>
          )}

          {/* Recurrentes — detalle activos/pausados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Gastos programados
              </p>
              <p className="text-sm text-foreground">
                {fmt(snap.recurrentes.gastos.activos)} activos ·{' '}
                {fmt(snap.recurrentes.gastos.pausados)} pausados
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Transferencias programadas
              </p>
              <p className="text-sm text-foreground">
                {fmt(snap.recurrentes.transferencias.activos)} activos ·{' '}
                {fmt(snap.recurrentes.transferencias.pausados)} pausados
              </p>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-3">
            Fase 0 · métricas derivables. El origen de gastos, los funnels de
            abandono y la navegación llegan en las Fases 1-2.
          </p>
        </div>
      )}
    </div>
  );
}
