/**
 * Hook personalizado para gestionar gastos.
 *
 * - LECTURA: listener `onSnapshot` directo a Firestore → realtime.
 * - MUTATIONS: pasan por el backend NestJS para que la transacción atómica
 *   descuente el monto del bankBalance/cashBalance de la cuenta del usuario.
 *   Sin esto los saldos quedan desincronizados.
 */

import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '@services/firebase';
import {
  ExpensesService,
  gastoFirestoreToGasto,
  type CreateExpenseDto,
  type UpdateExpenseDto,
} from '@services/expenses';
import type { BucketAlert, Gasto, GastoFirestore, FiltrosGastos, Estado } from '@app-types';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import toast from 'react-hot-toast';

/**
 * Lo que el form envía a `crear`: un `Partial<Gasto>` + metadatos de
 * origen IA (Fase 3 learning_log) que NO son propiedades del Gasto, solo
 * viajan al backend para alimentar la bitácora de aprendizaje.
 */
export type CrearGastoInput = Partial<Gasto> & {
  origenIA?: 'voz' | 'imagen';
  categoriaSugerida?: string;
  descripcionOrigen?: string;
};

interface UseGastosReturn {
  gastos: Gasto[];
  estado: Estado<Gasto[]>;
  cargarGastos: () => Promise<void>;
  crear: (gasto: CrearGastoInput) => Promise<Gasto | null>;
  actualizar: (id: string, gasto: Partial<Gasto>) => Promise<void>;
  eliminar: (id: string) => Promise<void>;
  obtenerPorId: (id: string) => Promise<Gasto | null>;
  recargar: () => Promise<void>;
  filtrar: (filtros: FiltrosGastos) => Gasto[];
}

/**
 * Convierte un objeto `Partial<Gasto>` (lo que envía el form) al DTO que el
 * backend espera. Hace la traducción de nombres mínima (Date → ISO string)
 * y filtra campos undefined.
 */
function toCreateDto(gasto: CrearGastoInput): CreateExpenseDto {
  if (!gasto.accountId) throw new Error('accountId es requerido');
  if (gasto.monto === undefined) throw new Error('monto es requerido');
  if (!gasto.fecha) throw new Error('fecha es requerida');
  if (!gasto.categoria) throw new Error('categoria es requerida');
  if (!gasto.metodoPago) throw new Error('metodoPago es requerido');
  if (!gasto.moneda) throw new Error('moneda es requerida');

  const fecha =
    gasto.fecha instanceof Date ? gasto.fecha.toISOString() : String(gasto.fecha);

  const dto: CreateExpenseDto = {
    accountId: gasto.accountId,
    monto: gasto.monto,
    fecha,
    categoria: gasto.categoria,
    metodoPago: gasto.metodoPago,
    moneda: gasto.moneda,
  };
  if (gasto.subcategoria) dto.subcategoria = gasto.subcategoria;
  if (gasto.descripcion) dto.descripcion = gasto.descripcion;
  if (gasto.tags && gasto.tags.length > 0) dto.tags = gasto.tags;
  if (gasto.recurrente) dto.recurrente = gasto.recurrente;
  if (gasto.shoppingListId) dto.shoppingListId = gasto.shoppingListId;
  if (gasto.voucherType) dto.voucherType = gasto.voucherType;
  if (gasto.voucherNumber) dto.voucherNumber = gasto.voucherNumber;
  if (gasto.ruc) dto.ruc = gasto.ruc;
  if (gasto.igv !== undefined) dto.igv = gasto.igv;
  if (gasto.subtotal !== undefined) dto.subtotal = gasto.subtotal;
  if (gasto.reimbursementStatus) dto.reimbursementStatus = gasto.reimbursementStatus;
  if (gasto.origenIA) {
    dto.origenIA = gasto.origenIA;
    if (gasto.categoriaSugerida) dto.categoriaSugerida = gasto.categoriaSugerida;
    if (gasto.descripcionOrigen) dto.descripcionOrigen = gasto.descripcionOrigen;
  }
  return dto;
}

function toUpdateDto(gasto: Partial<Gasto>): UpdateExpenseDto {
  const dto: UpdateExpenseDto = {};
  if (gasto.accountId !== undefined) dto.accountId = gasto.accountId;
  if (gasto.monto !== undefined) dto.monto = gasto.monto;
  if (gasto.fecha !== undefined) {
    dto.fecha =
      gasto.fecha instanceof Date ? gasto.fecha.toISOString() : String(gasto.fecha);
  }
  if (gasto.categoria !== undefined) dto.categoria = gasto.categoria;
  if (gasto.subcategoria !== undefined) dto.subcategoria = gasto.subcategoria;
  if (gasto.metodoPago !== undefined) dto.metodoPago = gasto.metodoPago;
  if (gasto.moneda !== undefined) dto.moneda = gasto.moneda;
  if (gasto.descripcion !== undefined) dto.descripcion = gasto.descripcion;
  if (gasto.tags !== undefined) dto.tags = gasto.tags;
  if (gasto.recurrente !== undefined) dto.recurrente = gasto.recurrente;
  if (gasto.voucherType !== undefined) dto.voucherType = gasto.voucherType;
  if (gasto.voucherNumber !== undefined) dto.voucherNumber = gasto.voucherNumber;
  if (gasto.ruc !== undefined) dto.ruc = gasto.ruc;
  if (gasto.igv !== undefined) dto.igv = gasto.igv;
  if (gasto.subtotal !== undefined) dto.subtotal = gasto.subtotal;
  if (gasto.reimbursementStatus !== undefined)
    dto.reimbursementStatus = gasto.reimbursementStatus;
  return dto;
}

/**
 * Toast de alerta cuando una mutación dejó al bucket categoría sobregirado.
 * No bloquea: el gasto ya está persistido. Solo informa al usuario que
 * superó la asignación de la categoría para ese mes.
 */
function notifyBucketAlert(
  alert: BucketAlert | null | undefined,
  bucketLabel: string,
  currency: string,
): void {
  if (!alert?.excede) return;
  const overage = alert.gastado - alert.limite;
  toast(
    `⚠️ "${bucketLabel}" sobregirado en ${currency} ${overage.toFixed(2)} (${alert.porcentaje.toFixed(0)}%)`,
    { icon: '⚠️', duration: 5000 },
  );
}

export function useGastos(): UseGastosReturn {
  const { usuario } = useAuth();
  const { getCategoryLabel } = useConfig();
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [estado, setEstado] = useState<Estado<Gasto[]>>({
    data: null,
    estado: 'idle',
    error: null,
  });

  // ==========================================================================
  // REALTIME LISTENER
  // ==========================================================================

  useEffect(() => {
    if (!usuario) {
      setGastos([]);
      setEstado({ data: [], estado: 'success', error: null });
      return;
    }

    setEstado((prev) => ({ ...prev, estado: 'loading' }));

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', usuario.id),
      orderBy('fecha', 'desc'),
    );

    const unsub: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) =>
          gastoFirestoreToGasto(doc.id, doc.data() as GastoFirestore),
        );
        setGastos(items);
        setEstado({ data: items, estado: 'success', error: null });
      },
      (error) => {
        console.error('[useGastos] Listener error:', error);
        setEstado({ data: null, estado: 'error', error: error.message });
        toast.error('Error al sincronizar gastos');
      },
    );

    return () => unsub();
  }, [usuario]);

  // Compatibilidad con consumidores que esperan `cargarGastos()` / `recargar()`.
  // Con el listener realtime no hace falta hacer nada — los datos ya están
  // actualizados — pero mantenemos las funciones para no romper la API.
  const cargarGastos = useCallback(async () => {
    /* noop: realtime listener mantiene los datos sincronizados */
  }, []);
  const recargar = useCallback(async () => {
    /* noop */
  }, []);

  // ==========================================================================
  // MUTATIONS (vía backend para descuento atómico de saldo)
  // ==========================================================================

  const crear = useCallback(
    async (gastoData: CrearGastoInput): Promise<Gasto | null> => {
      if (!usuario) {
        toast.error('Debes iniciar sesión');
        return null;
      }
      try {
        const dto = toCreateDto(gastoData);
        const result = await ExpensesService.create(dto);
        notifyBucketAlert(
          result.bucketAlert,
          getCategoryLabel(result.gasto.categoria),
          result.gasto.moneda,
        );
        return result.gasto;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Error al crear gasto';
        toast.error(errorMsg);
        return null;
      }
    },
    [usuario, getCategoryLabel],
  );

  const actualizar = useCallback(
    async (id: string, gastoData: Partial<Gasto>): Promise<void> => {
      try {
        const dto = toUpdateDto(gastoData);
        const result = await ExpensesService.update(id, dto);
        notifyBucketAlert(
          result.bucketAlert,
          getCategoryLabel(result.gasto.categoria),
          result.gasto.moneda,
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Error al actualizar gasto';
        toast.error(errorMsg);
        throw error;
      }
    },
    [getCategoryLabel],
  );

  const eliminar = useCallback(async (id: string): Promise<void> => {
    try {
      await ExpensesService.remove(id);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Error al eliminar gasto';
      toast.error(errorMsg);
      throw error;
    }
  }, []);

  const obtenerPorId = useCallback(
    async (id: string): Promise<Gasto | null> => {
      // 1. Cache local del listener — la mayoría de los casos.
      const cached = gastos.find((g) => g.id === id);
      if (cached) return cached;

      // 2. Fallback: lectura directa a Firestore. Cubre la race condition
      //    cuando el usuario abre /gastos/editar/:id antes de que el
      //    onSnapshot haya cargado, o cuando navega desde un deep-link.
      //    No depende del backend NestJS (importante si está caído).
      try {
        const snap = await getDoc(doc(db, 'expenses', id));
        if (!snap.exists()) return null;
        const data = snap.data() as GastoFirestore;
        // Defensa: solo el dueño puede leer (lo refuerzan las rules,
        // pero validamos también en cliente para no exponer otra UID).
        if (usuario && data.userId !== usuario.id) return null;
        return gastoFirestoreToGasto(snap.id, data);
      } catch (error) {
        console.error('[useGastos] obtenerPorId fallback error:', error);
        return null;
      }
    },
    [gastos, usuario],
  );

  // ==========================================================================
  // FILTRADO LOCAL
  // ==========================================================================

  const filtrar = useCallback(
    (filtros: FiltrosGastos): Gasto[] => {
      return gastos.filter((gasto) => {
        if (filtros.fechaInicio && gasto.fecha < filtros.fechaInicio) return false;
        if (filtros.fechaFin && gasto.fecha > filtros.fechaFin) return false;
        if (filtros.categorias && filtros.categorias.length > 0) {
          if (!filtros.categorias.includes(gasto.categoria)) return false;
        }
        if (filtros.montoMin !== undefined && gasto.monto < filtros.montoMin)
          return false;
        if (filtros.montoMax !== undefined && gasto.monto > filtros.montoMax)
          return false;
        if (filtros.metodoPago && gasto.metodoPago !== filtros.metodoPago)
          return false;
        if (filtros.busqueda) {
          const busqueda = filtros.busqueda.toLowerCase();
          const coincide =
            gasto.descripcion.toLowerCase().includes(busqueda) ||
            gasto.categoria.toLowerCase().includes(busqueda) ||
            gasto.metodoPago.toLowerCase().includes(busqueda);
          if (!coincide) return false;
        }
        return true;
      });
    },
    [gastos],
  );

  return {
    gastos,
    estado,
    cargarGastos,
    crear,
    actualizar,
    eliminar,
    obtenerPorId,
    recargar,
    filtrar,
  };
}

export default useGastos;
