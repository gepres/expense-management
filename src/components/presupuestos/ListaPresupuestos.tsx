/**
 * Vista de Presupuestos v2 — multi-cuenta con buckets y rollover.
 *
 * Modelo:
 *   Cuenta (BCP Soles, presupuesto general 1000)
 *     ├── Categoria Alimentación: 500
 *     ├── Categoria Transporte:   200
 *     └── Bucket Efectivo:        100
 *
 * Validación: limiteGeneral >= Σ(categorias) + efectivo.
 * Rollover: el sobrante (positivo o negativo) del general del mes M se
 * acumula en el general del mes M+1 como `rolloverEntrada`.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccountsContext } from '@context/AccountsContext';
import { useConfig } from '@context/ConfigContext';
import { usePresupuestos } from '@hooks/usePresupuestos';
import {
  BUCKET_EFECTIVO,
  CATEGORIA_LABELS,
  type Account,
  type CategoriaGasto,
  type Presupuesto,
  type PresupuestoBucket,
  type PresupuestoMensualResumen,
} from '@app-types';
import {
  Plus,
  Target,
  Wallet,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import Modal, { ModalFooterActions } from '@components/common/Modal';
import { Input, Select, InputGroup, InputRow } from '@components/common/Input';
import Button from '@components/common/Button';
import AccountIcon from '@components/cuentas/AccountIcon';
import CustomLoader from '@components/common/CustomLoader';
import ConfirmationModal from '@components/common/ConfirmationModal';
import BackendOfflineBanner from '@components/common/BackendOfflineBanner';

interface FormState {
  bucket: PresupuestoBucket;
  limite: string;
}

const INITIAL_FORM: FormState = { bucket: 'general', limite: '' };

function bucketLabel(bucket: string): string {
  if (bucket === 'general') return 'Presupuesto General';
  if (bucket === BUCKET_EFECTIVO) return 'Efectivo';
  return CATEGORIA_LABELS[bucket as CategoriaGasto] ?? bucket;
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
  if (porcentaje >= 100) return 'bg-red-500';
  if (porcentaje >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

export default function ListaPresupuestos() {
  const { activeAccounts, defaultAccount, estado: estadoCuentas } = useAccountsContext();
  const { categories } = useConfig();
  const {
    presupuestos,
    estado,
    crear,
    actualizar,
    eliminar,
    obtenerResumen,
    backendOffline,
  } = usePresupuestos();

  const [mesActual, setMesActual] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [accountId, setAccountId] = useState<string>('');
  const [resumen, setResumen] = useState<PresupuestoMensualResumen | null>(null);
  const [loadingResumen, setLoadingResumen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Presupuesto | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Presupuesto | null>(null);

  // Pre-seleccionar la cuenta default cuando cargan
  useEffect(() => {
    if (!accountId && activeAccounts.length > 0) {
      setAccountId(defaultAccount?.id ?? activeAccounts[0].id);
    }
  }, [accountId, activeAccounts, defaultAccount]);

  const account: Account | undefined = useMemo(
    () => activeAccounts.find((a) => a.id === accountId),
    [activeAccounts, accountId],
  );

  // Disponible máximo a asignar al bucket actual (modal):
  //   = saldo cuenta − (otras asignaciones)
  // Si estamos editando, excluimos el limite actual del bucket que editamos
  // para que el usuario pueda modificarlo libremente.
  const disponibleMax = useMemo(() => {
    if (!resumen) return null;
    const reservadoOtros = editing
      ? resumen.totalAsignado - editing.limite
      : resumen.totalAsignado;
    return resumen.accountBalance - reservadoOtros;
  }, [resumen, editing]);

  const limiteIngresado = parseFloat(form.limite || '0');
  const excedeMax =
    disponibleMax !== null && limiteIngresado > 0 && limiteIngresado > disponibleMax;

  // Pull resumen del mes cada vez que cambia cuenta o mes (o cuando cambian
  // los presupuestos, para refrescar tras crear/editar/borrar).
  const refreshResumen = async () => {
    if (!accountId) {
      setResumen(null);
      return;
    }
    setLoadingResumen(true);
    try {
      const data = await obtenerResumen(accountId, mesActual);
      setResumen(data);
    } finally {
      setLoadingResumen(false);
    }
  };

  useEffect(() => {
    void refreshResumen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, mesActual, presupuestos]);

  // Buckets ya en uso para esta cuenta + mes (para evitar duplicados al crear)
  const bucketsUsados = useMemo(() => {
    return new Set(
      presupuestos
        .filter((p) => p.accountId === accountId && p.mes === mesActual)
        .map((p) => p.bucket),
    );
  }, [presupuestos, accountId, mesActual]);

  // Modelo Opción B: el bucket 'general' ya no se ofrece (la cuenta ES el
  // presupuesto general). El bucket 'efectivo' se administra desde la vista
  // de cuentas (Retirar/Depositar). Esta vista solo gestiona sub-reservas
  // por CATEGORÍA del usuario.
  const bucketsDisponibles = useMemo(() => {
    const disponibles: { value: PresupuestoBucket; label: string }[] = [];
    for (const cat of categories) {
      if (!bucketsUsados.has(cat.id)) {
        disponibles.push({ value: cat.id, label: cat.nombre });
      }
    }
    return disponibles;
  }, [bucketsUsados, categories]);

  const handleNuevo = () => {
    setEditing(null);
    const primer = bucketsDisponibles[0]?.value;
    if (!primer) return;
    setForm({ bucket: primer, limite: '' });
    setModalOpen(true);
  };

  const handleEditar = (p: Presupuesto) => {
    setEditing(p);
    setForm({ bucket: p.bucket, limite: String(p.limite) });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!accountId) return;
    const limiteNum = parseFloat(form.limite);
    if (!isFinite(limiteNum) || limiteNum < 0) return;

    setSubmitting(true);
    try {
      if (editing) {
        await actualizar(editing.id, { limite: limiteNum });
      } else {
        await crear({
          accountId,
          mes: mesActual,
          bucket: form.bucket,
          limite: limiteNum,
        });
      }
      setModalOpen(false);
      setEditing(null);
      setForm(INITIAL_FORM);
      void refreshResumen();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await eliminar(confirmDelete.id);
      setConfirmDelete(null);
      void refreshResumen();
    } catch {
      // toast ya emitido
    }
  };

  if (estadoCuentas.estado === 'loading' && activeAccounts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <CustomLoader />
      </div>
    );
  }

  if (activeAccounts.length === 0) {
    return (
      <div className="bg-card border border-dashed border-border rounded-xl p-10 text-center">
        <CreditCard className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <p className="font-medium text-foreground">No tienes cuentas activas</p>
        <p className="text-sm text-muted-foreground mt-1">
          Los presupuestos se asignan por cuenta. Crea una primero.
        </p>
        <Link to="/cuentas/nueva" className="inline-block mt-4">
          <Button variant="primary" icon={Plus}>
            Crear cuenta
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-7 w-7 text-primary" />
            Presupuestos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            El saldo de cada cuenta es tu presupuesto del mes. Asigna sub-reservas por categoría.
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleNuevo}
          disabled={!accountId || bucketsDisponibles.length === 0}
        >
          Nuevo
        </Button>
      </div>

      {/* Banner cuando backend está caído */}
      {backendOffline && (
        <BackendOfflineBanner
          context="No se pudo cargar el resumen mensual."
          onRetry={() => void refreshResumen()}
          retrying={loadingResumen}
        />
      )}

      {/* Selectores: cuenta + mes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-3">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Cuenta
          </label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {activeAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.currency})
              </option>
            ))}
          </select>
        </div>
        <div className="bg-card border border-border rounded-xl p-3">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Mes
          </label>
          <input
            type="month"
            value={mesActual}
            onChange={(e) => setMesActual(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* Resumen mensual */}
      {loadingResumen ? (
        <div className="flex items-center justify-center py-12">
          <CustomLoader />
        </div>
      ) : resumen && account ? (
        <ResumenSection
          account={account}
          resumen={resumen}
          onEdit={handleEditar}
          onDelete={(p) => setConfirmDelete(p)}
          onRefresh={refreshResumen}
        />
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {estado.estado === 'loading'
            ? 'Cargando…'
            : 'Selecciona una cuenta para ver su presupuesto'}
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          setForm(INITIAL_FORM);
        }}
        title={editing ? 'Editar presupuesto' : 'Nuevo presupuesto'}
        subtitle={
          account
            ? `${account.name} · ${mesActual}`
            : undefined
        }
        size="md"
        footer={
          <ModalFooterActions
            onCancel={() => {
              setModalOpen(false);
              setEditing(null);
            }}
            onConfirm={handleSubmit}
            confirmText={
              submitting ? 'Guardando...' : editing ? 'Guardar' : 'Crear'
            }
            disabled={submitting || !form.limite}
          />
        }
      >
        <InputGroup>
          <InputRow label="Categoría">
            {editing ? (
              <span className="text-sm font-medium text-foreground">
                {bucketLabel(editing.bucket)}
              </span>
            ) : bucketsDisponibles.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                Todas las categorías ya tienen presupuesto este mes.
              </span>
            ) : (
              <Select
                variant="ios"
                value={form.bucket}
                onChange={(e) =>
                  setForm({ ...form, bucket: e.target.value as PresupuestoBucket })
                }
              >
                {bucketsDisponibles.map((b) => (
                  <option key={b.value} value={b.value}>
                    {b.label}
                  </option>
                ))}
              </Select>
            )}
          </InputRow>
          <InputRow label={`Límite${account ? ` (${account.currency})` : ''}`}>
            <Input
              variant="ios"
              type="number"
              step="0.01"
              min="0"
              value={form.limite}
              onChange={(e) => setForm({ ...form, limite: e.target.value })}
              placeholder="0.00"
              required
            />
          </InputRow>
        </InputGroup>

        {/* Panel de "máximo asignable" (Opción B) */}
        {resumen && account && disponibleMax !== null && (
          <div
            className={`mt-3 p-3 rounded-lg border ${
              excedeMax
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                : 'bg-muted/40 border-border'
            }`}
          >
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Saldo cuenta</p>
                <p className="font-bold text-foreground">
                  {formatBalance(resumen.accountBalance, account.currency)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Ya asignado</p>
                <p className="font-bold text-foreground">
                  {formatBalance(
                    editing
                      ? resumen.totalAsignado - editing.limite
                      : resumen.totalAsignado,
                    account.currency,
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Máx. asignable</p>
                <p
                  className={`font-bold ${
                    disponibleMax < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatBalance(disponibleMax, account.currency)}
                </p>
              </div>
            </div>
            {excedeMax && (
              <p className="text-[11px] text-amber-900 dark:text-amber-100 mt-2 flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                Estás asignando{' '}
                {formatBalance(limiteIngresado - disponibleMax, account.currency)}{' '}
                más que el saldo disponible. Podés continuar pero conviene ajustar.
              </p>
            )}
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="¿Eliminar este presupuesto?"
        description={
          confirmDelete
            ? `Vas a eliminar el presupuesto de "${bucketLabel(confirmDelete.bucket)}" del mes ${confirmDelete.mes}.`
            : ''
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        isDestructive
      />
    </div>
  );
}

// ============================================================================
// Sub-componente: ResumenSection (cabecera + categorías + efectivo)
// ============================================================================

interface ResumenSectionProps {
  account: Account;
  resumen: PresupuestoMensualResumen;
  onEdit: (p: Presupuesto) => void;
  onDelete: (p: Presupuesto) => void;
  onRefresh: () => void;
}

function ResumenSection({
  account,
  resumen,
  onEdit,
  onDelete,
  onRefresh,
}: ResumenSectionProps) {
  const moneda = resumen.moneda;
  const general = resumen.general; // legacy
  const efectivo = resumen.efectivo;
  const categorias = resumen.categorias;
  const accountBalance = resumen.accountBalance;
  const disponibleReal = accountBalance - resumen.totalGastado;
  const porcentajeGastado = accountBalance > 0 ? (resumen.totalGastado / accountBalance) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Cabecera "cuenta = presupuesto" — Opción B */}
      <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/30 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <AccountIcon account={account} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-lg truncate">{account.name}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Saldo de la cuenta = Presupuesto del mes
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 rounded-md hover:bg-muted text-muted-foreground"
            title="Refrescar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Saldo</p>
            <p className="text-xl font-bold text-foreground mt-0.5">
              {formatBalance(accountBalance, moneda)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Gastado mes</p>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {formatBalance(resumen.totalGastado, moneda)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-muted-foreground tracking-wider">Disponible</p>
            <p
              className={`text-xl font-bold mt-0.5 ${
                disponibleReal < 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatBalance(disponibleReal, moneda)}
            </p>
          </div>
        </div>

        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${progressColor(porcentajeGastado)}`}
            style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 text-right">
          {porcentajeGastado.toFixed(1)}% del saldo gastado este mes
        </p>
      </div>

      {/* Aviso amber si totalAsignado > saldo cuenta (no bloquea) */}
      {resumen.excedeAsignacion && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-900 dark:text-amber-100">
            La suma de tus asignaciones (
            <strong>{formatBalance(resumen.totalAsignado, moneda)}</strong>) excede el saldo de la cuenta (
            <strong>{formatBalance(accountBalance, moneda)}</strong>). Podés seguir, pero conviene ajustar.
          </p>
        </div>
      )}

      {/* Disponible sin asignar (info) */}
      {!resumen.excedeAsignacion && resumen.disponibleSinAsignar !== accountBalance && (
        <div className="text-xs text-muted-foreground px-1">
          Sin asignar a categorías:{' '}
          <strong className={resumen.disponibleSinAsignar < 0 ? 'text-destructive' : 'text-foreground'}>
            {formatBalance(resumen.disponibleSinAsignar, moneda)}
          </strong>
        </div>
      )}

      {/* Bucket general LEGACY (read-only banner) */}
      {general && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
          <p className="text-xs text-amber-900 dark:text-amber-100 mb-2 font-medium">
            ⚠️ Tienes un presupuesto "General" antiguo (modelo viejo). Podés borrarlo —
            ahora el saldo de la cuenta cumple ese rol.
          </p>
          <BucketCard
            presupuesto={general}
            onEdit={() => onEdit(general)}
            onDelete={() => onDelete(general)}
          />
        </div>
      )}

      {/* Bucket efectivo */}
      {efectivo ? (
        <BucketCard
          presupuesto={efectivo}
          onEdit={() => onEdit(efectivo)}
          onDelete={() => onDelete(efectivo)}
          icon={<Wallet className="h-4 w-4" />}
        />
      ) : null}

      {/* Categorías */}
      {categorias.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Sub-reservas por categoría
          </p>
          {categorias.map((p) => (
            <BucketCard
              key={p.id}
              presupuesto={p}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p)}
            />
          ))}
        </div>
      ) : (
        !efectivo &&
        !general && (
          <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
            <Target className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-medium text-foreground">Sin sub-reservas asignadas</p>
            <p className="text-xs text-muted-foreground mt-1">
              Crea una para limitar tus gastos por categoría (opcional).
            </p>
          </div>
        )
      )}
    </div>
  );
}

// ============================================================================
// Sub-componente: BucketCard
// ============================================================================

interface BucketCardProps {
  presupuesto: Presupuesto;
  isHero?: boolean;
  icon?: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}

function BucketCard({ presupuesto, isHero, icon, onEdit, onDelete }: BucketCardProps) {
  const gastado = presupuesto.gastado ?? 0;
  const rollover = presupuesto.rolloverEntrada ?? 0;
  const techoEfectivo = presupuesto.limite + rollover;
  const disponible = techoEfectivo - gastado;
  const porcentaje = techoEfectivo > 0 ? (gastado / techoEfectivo) * 100 : 0;
  const moneda = presupuesto.moneda;

  return (
    <div
      className={`bg-card border rounded-xl p-4 ${
        isHero
          ? 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent'
          : 'border-border'
      }`}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-bold text-foreground truncate ${
                isHero ? 'text-lg' : 'text-base'
              }`}
            >
              {bucketLabel(presupuesto.bucket)}
            </h3>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                title="Editar"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                title="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Info de rollover (solo bucket general) */}
          {rollover !== 0 && presupuesto.bucket === 'general' && (
            <p
              className={`text-xs mt-1 flex items-center gap-1 ${
                rollover > 0 ? 'text-emerald-600' : 'text-destructive'
              }`}
            >
              {rollover > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              Rollover del mes anterior: {rollover > 0 ? '+' : ''}
              {formatBalance(rollover, moneda)}
            </p>
          )}

          {/* Montos */}
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <p className={`font-bold ${isHero ? 'text-2xl' : 'text-lg'} text-foreground`}>
              {formatBalance(gastado, moneda)}
              <span className="text-sm font-normal text-muted-foreground">
                {' '}
                / {formatBalance(techoEfectivo, moneda)}
              </span>
            </p>
            <p
              className={`text-sm font-bold ${
                disponible < 0 ? 'text-destructive' : 'text-emerald-600'
              }`}
            >
              {disponible >= 0 ? 'queda ' : 'excede '}
              {formatBalance(Math.abs(disponible), moneda)}
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${progressColor(porcentaje)}`}
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">
            {porcentaje.toFixed(1)}% usado
          </p>
        </div>
      </div>
    </div>
  );
}
