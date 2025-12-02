/**
 * Context para gestionar el presupuesto en efectivo globalmente
 */

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { usePresupuestoEfectivo as usePresupuestoEfectivoHook } from '@hooks/usePresupuestoEfectivo';
import type {
  PresupuestoEfectivo,
  AbonoEfectivo,
  Moneda,
  Estado,
  TransaccionEfectivo,
} from '@app-types';

interface PresupuestoEfectivoContextType {
  presupuestosEfectivo: Record<Moneda, PresupuestoEfectivo | null>;
  abonos: AbonoEfectivo[];
  estado: Estado<Record<Moneda, PresupuestoEfectivo | null>>;
  cargarPresupuestos: () => Promise<void>;
  obtenerSaldo: (moneda: Moneda) => number;
  abonar: (monto: number, moneda: Moneda, concepto: string, movimientoId?: string) => Promise<AbonoEfectivo | null>;
  descontar: (monto: number, moneda: Moneda) => Promise<boolean>;
  obtenerHistorial: (moneda: Moneda, fechaInicio?: Date, fechaFin?: Date) => Promise<TransaccionEfectivo[]>;
  recargar: () => Promise<void>;
}

const PresupuestoEfectivoContext = createContext<PresupuestoEfectivoContextType | undefined>(undefined);

interface PresupuestoEfectivoProviderProps {
  children: ReactNode;
}

export function PresupuestoEfectivoProvider({ children }: PresupuestoEfectivoProviderProps) {
  const presupuestoEfectivoData = usePresupuestoEfectivoHook();

  return (
    <PresupuestoEfectivoContext.Provider value={presupuestoEfectivoData}>
      {children}
    </PresupuestoEfectivoContext.Provider>
  );
}

export function usePresupuestoEfectivo() {
  const context = useContext(PresupuestoEfectivoContext);
  if (context === undefined) {
    throw new Error('usePresupuestoEfectivo must be used within a PresupuestoEfectivoProvider');
  }
  return context;
}
