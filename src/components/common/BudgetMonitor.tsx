/**
 * BudgetMonitor — alertas en tiempo real cuando un presupuesto se acerca al
 * límite o lo excede.
 *
 * Modelo v2: presupuestos por (accountId, mes, bucket) donde
 * bucket ∈ 'general' | <categoria> | 'efectivo'.
 *
 * El cálculo de gastado se hace localmente para evitar pull constante al backend:
 *   - bucket general:    sum(gastos del mes con esa accountId)
 *   - bucket categoria:  sum(gastos del mes con accountId + categoria)
 *   - bucket efectivo:   sum(gastos del mes con accountId + metodoPago='efectivo')
 */

import { useEffect, useRef } from 'react';
import { useGastos } from '@hooks/useGastos';
import { usePresupuestos } from '@hooks/usePresupuestos';
import { formatearMesKey, formatearMoneda } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import { CATEGORIA_LABELS, BUCKET_EFECTIVO } from '@app-types';
import type { Gasto } from '@app-types';

function bucketLabel(bucket: string): string {
  if (bucket === 'general') return 'Presupuesto General';
  if (bucket === BUCKET_EFECTIVO) return 'Efectivo';
  return CATEGORIA_LABELS[bucket as keyof typeof CATEGORIA_LABELS] || bucket;
}

function gastadoDelBucket(
  gastos: Gasto[],
  accountId: string,
  bucket: string,
  mesActual: string,
): number {
  return gastos
    .filter((g) => {
      if (g.accountId !== accountId) return false;
      if (formatearMesKey(new Date(g.fecha)) !== mesActual) return false;
      if (bucket === 'general') return true;
      if (bucket === BUCKET_EFECTIVO) return g.metodoPago === 'efectivo';
      return g.categoria === bucket;
    })
    .reduce((sum, g) => sum + g.monto, 0);
}

export default function BudgetMonitor() {
  const { gastos } = useGastos();
  const { presupuestos } = usePresupuestos();

  // notifiedRef key: `${accountId}::${bucket}`
  const notifiedRef = useRef<Record<string, { warning: boolean; exceeded: boolean }>>(
    {},
  );

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (gastos.length === 0 || presupuestos.length === 0) return;

    const mesActual = formatearMesKey(new Date());

    presupuestos.forEach((presupuesto) => {
      if (presupuesto.mes !== mesActual) return;

      const key = `${presupuesto.accountId}::${presupuesto.bucket}`;
      const gastoActual = gastadoDelBucket(
        gastos,
        presupuesto.accountId,
        presupuesto.bucket,
        mesActual,
      );
      const limite = presupuesto.limite;
      if (limite <= 0) return;
      const porcentaje = (gastoActual / limite) * 100;

      if (!notifiedRef.current[key]) {
        notifiedRef.current[key] = { warning: false, exceeded: false };
      }

      const label = bucketLabel(presupuesto.bucket);
      const moneda = presupuesto.moneda;

      if (porcentaje >= 100) {
        if (!notifiedRef.current[key].exceeded) {
          const mensaje = `¡Alerta! Excediste el presupuesto de ${label}. (${formatearMoneda(gastoActual, moneda)} / ${formatearMoneda(limite, moneda)})`;
          toast.error(mensaje, { duration: 5000, icon: '🚨' });
          enviarNotificacion('Presupuesto Excedido', mensaje);
          notifiedRef.current[key].exceeded = true;
          notifiedRef.current[key].warning = true;
        }
      } else if (porcentaje >= 80) {
        if (!notifiedRef.current[key].warning) {
          const mensaje = `Atención: Estás al ${porcentaje.toFixed(0)}% del presupuesto de ${label}.`;
          toast(mensaje, { icon: '⚠️', duration: 4000 });
          enviarNotificacion('Presupuesto Ajustado', mensaje);
          notifiedRef.current[key].warning = true;
        }
      } else {
        if (
          notifiedRef.current[key].warning ||
          notifiedRef.current[key].exceeded
        ) {
          notifiedRef.current[key] = { warning: false, exceeded: false };
        }
      }
    });
  }, [gastos, presupuestos]);

  const enviarNotificacion = (titulo: string, cuerpo: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(titulo, {
              body: cuerpo,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              vibrate: [100, 50, 100],
            } as NotificationOptions);
          });
        } else {
          new Notification(titulo, { body: cuerpo, icon: '/pwa-192x192.png' });
        }
      } catch (e) {
        console.error('Error sending notification', e);
      }
    }
  };

  return null;
}
