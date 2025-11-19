import { useEffect, useRef } from 'react';
import { useGastos } from '@hooks/useGastos';
import { usePresupuestos } from '@hooks/usePresupuestos';
import { formatearMesKey, formatearMoneda } from '@utils/formatters';
import { toast } from 'react-hot-toast';
import { CATEGORIA_LABELS } from '@types';

export default function BudgetMonitor() {
  const { gastos } = useGastos();
  const { presupuestos } = usePresupuestos();
  
  // Store notified states to avoid spamming
  // Format: { [categoriaId]: { warning: boolean, exceeded: boolean } }
  const notifiedRef = useRef<Record<string, { warning: boolean; exceeded: boolean }>>({});

  useEffect(() => {
    // Request notification permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (gastos.length === 0 || presupuestos.length === 0) return;

    const mesActual = formatearMesKey(new Date());
    
    // Filter expenses for current month
    const gastosMes = gastos.filter(g => {
      const fechaGasto = new Date(g.fecha);
      return formatearMesKey(fechaGasto) === mesActual;
    });

    // Calculate totals per category
    const gastosPorCategoria = gastosMes.reduce((acc, gasto) => {
      // Convert to main currency if needed (assuming PEN for simplicity or same currency)
      // In a real app with multi-currency, we'd need conversion rates.
      // For now, we sum by currency match or just sum raw values if simple.
      // Let's assume we match budget currency.
      
      if (!acc[gasto.categoria]) {
        acc[gasto.categoria] = { total: 0, moneda: gasto.moneda };
      }
      acc[gasto.categoria].total += gasto.monto;
      return acc;
    }, {} as Record<string, { total: number; moneda: string }>);

    // Check against budgets
    presupuestos.forEach(presupuesto => {
      const categoria = presupuesto.categoria;
      const gastoActual = gastosPorCategoria[categoria]?.total || 0;
      const limite = presupuesto.limite;
      const porcentaje = (gastoActual / limite) * 100;

      // Initialize notification state for this category if not exists
      if (!notifiedRef.current[categoria]) {
        notifiedRef.current[categoria] = { warning: false, exceeded: false };
      }

      const label = categoria === 'general' ? 'Presupuesto General' : (CATEGORIA_LABELS[categoria as keyof typeof CATEGORIA_LABELS] || categoria);
      const moneda = presupuesto.moneda;

      // Check for Exceeded (> 100%)
      if (porcentaje >= 100) {
        if (!notifiedRef.current[categoria].exceeded) {
          const mensaje = `¡Alerta! Has excedido tu presupuesto de ${label}. (${formatearMoneda(gastoActual, moneda)} / ${formatearMoneda(limite, moneda)})`;
          
          // Toast
          toast.error(mensaje, { duration: 5000, icon: '🚨' });
          
          // PWA Notification
          enviarNotificacion('Presupuesto Excedido', mensaje);

          notifiedRef.current[categoria].exceeded = true;
          notifiedRef.current[categoria].warning = true; // Implicitly warned
        }
      } 
      // Check for Warning (>= 80%)
      else if (porcentaje >= 80) {
        if (!notifiedRef.current[categoria].warning) {
          const mensaje = `Atención: Estás al ${porcentaje.toFixed(0)}% de tu presupuesto de ${label}.`;
          
          // Toast
          toast(mensaje, { icon: '⚠️', duration: 4000 });
          
          // PWA Notification
          enviarNotificacion('Presupuesto Ajustado', mensaje);

          notifiedRef.current[categoria].warning = true;
        }
      }
      // Reset if dropped below (e.g. edited expense)
      else {
        if (notifiedRef.current[categoria].warning || notifiedRef.current[categoria].exceeded) {
           notifiedRef.current[categoria] = { warning: false, exceeded: false };
        }
      }
    });

  }, [gastos, presupuestos]);

  const enviarNotificacion = (titulo: string, cuerpo: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        // Check if service worker is ready (for mobile PWA)
        if (navigator.serviceWorker.controller) {
           navigator.serviceWorker.ready.then(registration => {
             registration.showNotification(titulo, {
               body: cuerpo,
               icon: '/pwa-192x192.png', // Adjust path as needed
               badge: '/pwa-192x192.png',
               vibrate: [100, 50, 100]
             } as NotificationOptions);
           });
        } else {
          // Fallback to local notification
          new Notification(titulo, {
            body: cuerpo,
            icon: '/pwa-192x192.png'
          });
        }
      } catch (e) {
        console.error('Error sending notification', e);
      }
    }
  };

  return null; // Invisible component
}
