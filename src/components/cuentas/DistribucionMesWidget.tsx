/**
 * DistribucionMesWidget — muestra cómo se reparten los gastos y asignaciones
 * de UNA cuenta en un mes específico.
 *
 * Modelo Opción B: el "techo" es el saldo de la cuenta. Cada categoría puede
 * tener una sub-reserva (bucket) opcional con `limite`. Si no la tiene, se
 * muestra solo lo gastado sin barra de progreso.
 *
 * Usado por DetalleCuenta para dar al usuario una vista rápida de "en qué
 * categorías estoy gastando este mes" sin tener que ir a /presupuestos.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, ChevronRight, AlertTriangle } from 'lucide-react';
import { usePresupuestos } from '@hooks/usePresupuestos';
import { useGastos } from '@hooks/useGastos';
import { useConfig } from '@context/ConfigContext';
import type {
  Account,
  PresupuestoMensualResumen,
} from '@app-types';
import LoadingSpinner from '@components/common/LoadingSpinner';

interface DistribucionMesWidgetProps {
  account: Account;
}

function formatBalance(value: number, currency: string): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${currency} ${abs}`;
}

function progressColor(porcentaje: number): string {
  if (porcentaje >= 100) return 'bg-rose-500';
  if (porcentaje >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export default function DistribucionMesWidget({ account }: DistribucionMesWidgetProps) {
  const { obtenerResumen } = usePresupuestos();
  const { gastos } = useGastos();
  const { getCategoryLabel } = useConfig();

  const mesActual = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();

  const [resumen, setResumen] = useState<PresupuestoMensualResumen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    void obtenerResumen(account.id, mesActual).then((r) => {
      if (mounted) {
        setResumen(r);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
    // gastos no es dependencia directa pero refrescamos cuando cambian para
    // mantener "gastado" actualizado tras crear/editar/borrar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.id, mesActual, gastos.length]);

  // Mapear gastos del mes por categoría (incluso para categorías sin bucket)
  const gastosPorCategoriaMes = (() => {
    const out = new Map<string, number>();
    for (const g of gastos) {
      if (g.accountId !== account.id) continue;
      const f = new Date(g.fecha);
      const mes = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
      if (mes !== mesActual) continue;
      out.set(g.categoria, (out.get(g.categoria) ?? 0) + g.monto);
    }
    return out;
  })();

  // Combinar buckets (con límite) + categorías sueltas (solo gasto, sin límite)
  const filas: Array<{
    categoria: string;
    gastado: number;
    limite?: number;
    porcentaje?: number;
    excede?: boolean;
  }> = [];

  if (resumen) {
    const categoriasConBucket = new Set<string>();
    for (const b of resumen.categorias) {
      categoriasConBucket.add(b.bucket);
      const gastado = b.gastado ?? 0;
      const techo = b.limite + (b.rolloverEntrada ?? 0);
      const porcentaje = techo > 0 ? (gastado / techo) * 100 : 0;
      filas.push({
        categoria: b.bucket,
        gastado,
        limite: b.limite,
        porcentaje,
        excede: gastado > techo,
      });
    }
    // Categorías con gasto pero sin bucket asignado
    for (const [cat, monto] of gastosPorCategoriaMes) {
      if (categoriasConBucket.has(cat)) continue;
      filas.push({ categoria: cat, gastado: monto });
    }
  } else {
    // Si el resumen no cargó (backend offline), usar solo gastos locales.
    for (const [cat, monto] of gastosPorCategoriaMes) {
      filas.push({ categoria: cat, gastado: monto });
    }
  }

  filas.sort((a, b) => b.gastado - a.gastado);

  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <PieChart className="h-4 w-4 text-primary" />
          Distribución del mes
        </h3>
        <Link
          to="/presupuestos"
          className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
        >
          Asignar <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <LoadingSpinner variant="dots" />
        </div>
      ) : filas.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Sin gastos este mes en esta cuenta.
        </p>
      ) : (
        <div className="space-y-3">
          {filas.map((fila) => (
            <div key={fila.categoria}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-foreground truncate">
                  {getCategoryLabel(fila.categoria)}
                </span>
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    fila.excede ? 'text-rose-600' : 'text-foreground'
                  }`}
                >
                  {formatBalance(fila.gastado, account.currency)}
                  {fila.limite !== undefined && (
                    <span className="text-muted-foreground font-normal">
                      {' / '}
                      {formatBalance(fila.limite, account.currency)}
                    </span>
                  )}
                </span>
              </div>
              {fila.limite !== undefined && fila.porcentaje !== undefined && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${progressColor(fila.porcentaje)}`}
                    style={{ width: `${Math.min(fila.porcentaje, 100)}%` }}
                  />
                </div>
              )}
              {fila.excede && (
                <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 inline-flex items-center gap-1">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Sobregirado {fila.porcentaje?.toFixed(0)}%
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {resumen?.excedeAsignacion && (
        <div className="mt-4 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-100">
          <AlertTriangle className="h-3 w-3 inline mr-1" />
          Tus asignaciones suman más que el saldo actual de la cuenta.
        </div>
      )}
    </div>
  );
}
