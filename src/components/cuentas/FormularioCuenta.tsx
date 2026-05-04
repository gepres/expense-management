/**
 * FormularioCuenta — crear o editar una cuenta.
 *
 * Modo edición:
 *  - Carga la cuenta existente.
 *  - NO permite cambiar `currency` (rompería el saldo). Si se necesita, archivar y crear nueva.
 *
 * Soporta tipo "bank" con dropdown de bancos peruanos pre-cargados + texto libre.
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Wallet,
  Building2,
  Banknote,
  Tag,
  Hash,
  Palette,
  Star,
  Save,
  AlertTriangle,
  ChevronLeft,
  CreditCard,
  Calendar,
  User,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { useAccountsContext } from '@context/AccountsContext';
import { useConfig } from '@context/ConfigContext';
import {
  ACCOUNT_TYPES,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPE_ICONS,
  BANCOS_PERU,
  type AccountType,
  type CreateAccountDto,
  type EncryptedCardData,
  type UpdateAccountDto,
} from '@app-types';
import {
  decryptCardField,
  detectCardBrand,
  encryptCardField,
  isCardExpired,
  maskCardNumber,
  normalizeCardNumber,
} from '@utils/card-crypto';
import { Input, Select, InputGroup, InputRow, Switch } from '@components/common/Input';
import Button from '@components/common/Button';
import CustomLoader from '@components/common/CustomLoader';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { useTheme } from '@context/ThemeContext';

const DEFAULT_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6b7280', // gray
];

interface FormState {
  name: string;
  type: AccountType;
  bank: string;
  bankCustom: string; // si elige "Otro"
  currency: string;
  icon: string;
  color: string;
  initialBankBalance: string;
  initialCashBalance: string;
  includeInTotal: boolean;
  isDefault: boolean;
  creditLimit: string;
  // --- Datos de tarjeta (solo type='card') ---
  cardNumber: string;
  cardHolder: string;
  cardExpMonth: string;
  cardExpYear: string;
}

const INITIAL: FormState = {
  name: '',
  type: 'bank',
  bank: '',
  bankCustom: '',
  currency: 'PEN',
  icon: '',
  color: DEFAULT_COLORS[1],
  initialBankBalance: '0',
  initialCashBalance: '0',
  includeInTotal: true,
  isDefault: false,
  creditLimit: '',
  cardNumber: '',
  cardHolder: '',
  cardExpMonth: '',
  cardExpYear: '',
};

export default function FormularioCuenta() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { obtenerPorId, crear, actualizar, accounts, estado } = useAccountsContext();
  const { currencies } = useConfig();
  const { temaEfectivo } = useTheme();
  const { usuario } = useAuth();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [loadingDoc, setLoadingDoc] = useState(isEdit);
  const [showEmoji, setShowEmoji] = useState(false);
  // Cuando el usuario abre la sección de tarjeta en modo edición, descifra
  // el número original (UX: poder editarlo). Si decide cambiarlo, se vuelve
  // a cifrar al guardar.
  const [revealCard, setRevealCard] = useState(false);
  const [originalCardData, setOriginalCardData] = useState<EncryptedCardData | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  // Flag para auto-seleccionar isDefault solo una vez en modo creación.
  const [defaultAutoSeeded, setDefaultAutoSeeded] = useState(false);

  // Cargar cuenta en edición
  useEffect(() => {
    if (!id) return;
    const acc = obtenerPorId(id);
    if (!acc) {
      // Si aún no llegó por listener, esperar un poco
      if (accounts.length === 0) return;
      toast.error('Cuenta no encontrada');
      navigate('/cuentas');
      return;
    }
    const isPredefinedBank = acc.bank
      ? (BANCOS_PERU as readonly string[]).includes(acc.bank)
      : false;
    setForm({
      name: acc.name,
      type: acc.type,
      bank: isPredefinedBank ? (acc.bank ?? '') : acc.bank ? 'Otro' : '',
      bankCustom: !isPredefinedBank ? acc.bank ?? '' : '',
      currency: acc.currency,
      icon: acc.icon ?? '',
      color: acc.color ?? DEFAULT_COLORS[1],
      initialBankBalance: String(acc.initialBankBalance),
      initialCashBalance: String(acc.initialCashBalance),
      includeInTotal: acc.includeInTotal,
      isDefault: acc.isDefault,
      creditLimit: acc.creditLimit !== undefined ? String(acc.creditLimit) : '',
      // Solo cargamos los campos NO sensibles al editar. El número se mantiene
      // cifrado hasta que el usuario haga click en "Revelar" o decida cambiarlo.
      cardNumber: '',
      cardHolder: acc.cardData?.holderName ?? '',
      cardExpMonth: acc.cardData ? String(acc.cardData.expMonth) : '',
      cardExpYear: acc.cardData ? String(acc.cardData.expYear) : '',
    });
    setOriginalCardData(acc.cardData ?? null);
    setLoadingDoc(false);
  }, [id, obtenerPorId, accounts, navigate]);

  /**
   * Revela el número de tarjeta original (descifrándolo) para que el usuario
   * pueda verlo o editarlo. Si la clave fallara, mostramos error.
   */
  const handleRevealCard = async () => {
    if (!originalCardData || !usuario) return;
    if (revealCard) {
      // Toggle off: ocultar
      setRevealCard(false);
      setForm((prev) => ({ ...prev, cardNumber: '' }));
      return;
    }
    setCardError(null);
    try {
      const plain = await decryptCardField(
        originalCardData.cardNumberEnc,
        usuario.id,
      );
      setForm((prev) => ({ ...prev, cardNumber: plain }));
      setRevealCard(true);
    } catch (err) {
      console.error('Decrypt failed:', err);
      setCardError(
        'No se pudo descifrar el número. La clave no coincide o el dato está corrupto.',
      );
    }
  };

  // Modo creación: si es la PRIMERA cuenta del usuario, isDefault arranca en
  // true. Si ya existen cuentas, queda false (el usuario decide explicitamente).
  // Solo se aplica una vez tras cargar el listener para no pisar la elección
  // manual del usuario en re-renders posteriores.
  useEffect(() => {
    if (isEdit) return;
    if (defaultAutoSeeded) return;
    if (estado.estado === 'loading') return;
    setForm((prev) => ({ ...prev, isDefault: accounts.length === 0 }));
    setDefaultAutoSeeded(true);
  }, [isEdit, defaultAutoSeeded, estado.estado, accounts.length]);

  const isBankType = form.type === 'bank' || form.type === 'savings';
  const isCardType = form.type === 'card';
  // Tipos que pueden tener datos de tarjeta asociados: tanto las tarjetas
  // de crédito como las cuentas bancarias (que vienen con tarjeta de débito).
  const supportsCardData = isCardType || isBankType;

  // Lista de monedas disponibles del config + fallback a PEN/USD
  const availableCurrencies = useMemo(() => {
    if (currencies && currencies.length > 0) return currencies;
    return [
      { id: 'PEN', codigoISO: 'PEN', simbolo: 'S/', nombre: 'Soles' },
      { id: 'USD', codigoISO: 'USD', simbolo: '$', nombre: 'Dólares' },
    ];
  }, [currencies]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Resuelve los datos de tarjeta a persistir según el estado del form:
   *  - type !== 'card' → null (no se guarda nada)
   *  - sin número nuevo y existe original → mantener original (refresca holder/exp)
   *  - con número nuevo → cifrar y reemplazar
   *  - sin número y sin original → null
   */
  const buildCardData = async (): Promise<EncryptedCardData | undefined | null> => {
    if (!supportsCardData) return null; // null = limpiar campo
    if (!usuario) return undefined;

    const newNumber = normalizeCardNumber(form.cardNumber);
    const expMonth = parseInt(form.cardExpMonth, 10);
    const expYear = parseInt(form.cardExpYear, 10);
    const holder = form.cardHolder.trim();

    // Si no hay número nuevo y no había datos originales → no guardamos tarjeta
    if (!newNumber && !originalCardData) return undefined;

    // Caso edición: usuario solo modificó holder/exp pero no tocó el número
    if (!newNumber && originalCardData) {
      if (!holder) {
        setCardError('Falta el nombre del titular');
        throw new Error('card validation');
      }
      if (!expMonth || !expYear) {
        setCardError('Falta fecha de vencimiento');
        throw new Error('card validation');
      }
      return {
        ...originalCardData,
        holderName: holder,
        expMonth,
        expYear,
      };
    }

    // Hay número nuevo: validar y cifrar
    if (newNumber.length < 13 || newNumber.length > 19 || !/^\d+$/.test(newNumber)) {
      setCardError('Número de tarjeta inválido (13–19 dígitos)');
      throw new Error('card validation');
    }
    if (!holder) {
      setCardError('Falta el nombre del titular');
      throw new Error('card validation');
    }
    if (!expMonth || expMonth < 1 || expMonth > 12) {
      setCardError('Mes de vencimiento inválido (1–12)');
      throw new Error('card validation');
    }
    if (!expYear || expYear < new Date().getFullYear()) {
      setCardError('Año de vencimiento inválido');
      throw new Error('card validation');
    }
    if (isCardExpired(expMonth, expYear)) {
      setCardError('La tarjeta está vencida');
      throw new Error('card validation');
    }

    const cardNumberEnc = await encryptCardField(newNumber, usuario.id);
    return {
      cardNumberEnc,
      cardLast4: newNumber.slice(-4),
      holderName: holder,
      expMonth,
      expYear,
      brand: detectCardBrand(newNumber),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError(null);

    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    const initialBankBalance = parseFloat(form.initialBankBalance) || 0;
    const initialCashBalance = parseFloat(form.initialCashBalance) || 0;
    const bankName = form.bank === 'Otro' ? form.bankCustom.trim() : form.bank;

    setLoading(true);

    try {
      const cardData = await buildCardData();

      if (isEdit && id) {
        const dto: UpdateAccountDto = {
          name: form.name.trim(),
          type: form.type,
          bank: isBankType && bankName ? bankName : undefined,
          icon: form.icon || undefined,
          color: form.color,
          includeInTotal: form.includeInTotal,
          isDefault: form.isDefault,
          creditLimit: isCardType && form.creditLimit ? parseFloat(form.creditLimit) : undefined,
        };
        if (cardData !== undefined) dto.cardData = cardData ?? undefined;
        const result = await actualizar(id, dto);
        if (result) {
          toast.success('Cuenta actualizada');
          navigate(`/cuentas/${id}`);
        }
      } else {
        const dto: CreateAccountDto = {
          name: form.name.trim(),
          type: form.type,
          bank: isBankType && bankName ? bankName : undefined,
          currency: form.currency.toUpperCase(),
          icon: form.icon || undefined,
          color: form.color,
          initialBankBalance,
          initialCashBalance,
          includeInTotal: form.includeInTotal,
          isDefault: form.isDefault,
          creditLimit:
            isCardType && form.creditLimit ? parseFloat(form.creditLimit) : undefined,
        };
        if (cardData) dto.cardData = cardData;
        const result = await crear(dto);
        if (result) {
          navigate(`/cuentas/${result.id}`);
        }
      }
    } catch (err) {
      // Validation card errors ya muestran cardError. Otros errores → toast.
      if (!(err instanceof Error && err.message === 'card validation')) {
        const msg = err instanceof Error ? err.message : 'Error al guardar';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingDoc) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <CustomLoader />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            {isEdit ? 'Editar cuenta' : 'Nueva cuenta'}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit
              ? 'No puedes cambiar la moneda. Archiva y crea una nueva si lo necesitas.'
              : 'Configura el saldo inicial y el tipo de cuenta.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <InputGroup title="Datos básicos">
          <InputRow label="Nombre" icon={Tag} iconColor="bg-blue-500/10">
            <Input
              variant="ios"
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ej: BCP Soles, Yape Personal..."
              maxLength={50}
              required
            />
          </InputRow>

          <InputRow label="Tipo" icon={Wallet} iconColor="bg-purple-500/10">
            <Select
              variant="ios"
              value={form.type}
              onChange={(e) => update('type', e.target.value as AccountType)}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ACCOUNT_TYPE_ICONS[t]} {ACCOUNT_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </InputRow>

          {isBankType && (
            <>
              <InputRow label="Banco" icon={Building2} iconColor="bg-orange-500/10">
                <Select
                  variant="ios"
                  value={form.bank}
                  onChange={(e) => update('bank', e.target.value)}
                >
                  <option value="">Sin especificar</option>
                  {BANCOS_PERU.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  <option value="Otro">Otro (escribir)</option>
                </Select>
              </InputRow>
              {form.bank === 'Otro' && (
                <InputRow label="Nombre del banco" icon={Hash}>
                  <Input
                    variant="ios"
                    type="text"
                    value={form.bankCustom}
                    onChange={(e) => update('bankCustom', e.target.value)}
                    placeholder="Ej: Banco XYZ"
                    maxLength={50}
                  />
                </InputRow>
              )}
            </>
          )}

          <InputRow label="Moneda" icon={Banknote} iconColor="bg-green-500/10">
            <Select
              variant="ios"
              value={form.currency}
              onChange={(e) => update('currency', e.target.value)}
              disabled={isEdit}
            >
              {availableCurrencies.map((c) => (
                <option key={c.id} value={c.codigoISO}>
                  {c.simbolo} {c.codigoISO} — {c.nombre}
                </option>
              ))}
            </Select>
          </InputRow>
        </InputGroup>

        {/* Saldos iniciales */}
        <InputGroup
          title="Saldos iniciales"
          description={
            isEdit
              ? 'Los saldos actuales se calculan automáticamente desde gastos y movimientos. Los saldos de apertura no se modifican desde aquí.'
              : 'Cuánto hay HOY en la cuenta bancaria y cuánto ya retiraste y aún tienes en efectivo.'
          }
        >
          <InputRow label="🏦 En cuenta bancaria" icon={Banknote}>
            <Input
              variant="ios"
              type="number"
              step="0.01"
              value={form.initialBankBalance}
              onChange={(e) => update('initialBankBalance', e.target.value)}
              placeholder="0.00"
              disabled={isEdit}
            />
          </InputRow>

          <InputRow label="💵 En efectivo (retirado)" icon={Banknote}>
            <Input
              variant="ios"
              type="number"
              step="0.01"
              value={form.initialCashBalance}
              onChange={(e) => update('initialCashBalance', e.target.value)}
              placeholder="0.00"
              disabled={isEdit}
            />
          </InputRow>

          {isCardType && (
            <InputRow label="Límite de crédito" icon={AlertTriangle} iconColor="bg-amber-500/10">
              <Input
                variant="ios"
                type="number"
                step="0.01"
                value={form.creditLimit}
                onChange={(e) => update('creditLimit', e.target.value)}
                placeholder="0.00"
              />
            </InputRow>
          )}
        </InputGroup>

        {/* Datos de tarjeta (cards y banks: ambos suelen tener tarjeta asociada) */}
        {supportsCardData && (
          <InputGroup
            title={
              isCardType
                ? 'Datos de tarjeta (opcional)'
                : 'Tarjeta de débito asociada (opcional)'
            }
            description="Guarda los datos para tenerlos siempre a mano. El número se cifra antes de subirlo. NUNCA almacenamos el CVC."
          >
            <InputRow label="Número" icon={CreditCard} iconColor="bg-blue-500/10">
              <div className="flex items-center gap-2 w-full">
                <Input
                  variant="ios"
                  type={revealCard || !originalCardData ? 'text' : 'password'}
                  inputMode="numeric"
                  value={
                    !originalCardData || revealCard || form.cardNumber
                      ? form.cardNumber
                      : maskCardNumber(originalCardData.cardLast4)
                  }
                  onChange={(e) =>
                    update('cardNumber', e.target.value.replace(/[^\d\s-]/g, ''))
                  }
                  placeholder="•••• •••• •••• ••••"
                  maxLength={23}
                  autoComplete="off"
                  readOnly={!!originalCardData && !revealCard}
                />
                {originalCardData && (
                  <button
                    type="button"
                    onClick={handleRevealCard}
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title={revealCard ? 'Ocultar' : 'Revelar y editar'}
                  >
                    {revealCard ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </InputRow>

            <InputRow label="Titular" icon={User} iconColor="bg-purple-500/10">
              <Input
                variant="ios"
                type="text"
                value={form.cardHolder}
                onChange={(e) => update('cardHolder', e.target.value.toUpperCase())}
                placeholder="JUAN PEREZ"
                maxLength={50}
                autoComplete="cc-name"
              />
            </InputRow>

            <InputRow label="Vencimiento" icon={Calendar} iconColor="bg-orange-500/10">
              <div className="flex items-center gap-2 w-full">
                <Input
                  variant="ios"
                  type="number"
                  min="1"
                  max="12"
                  value={form.cardExpMonth}
                  onChange={(e) => update('cardExpMonth', e.target.value)}
                  placeholder="MM"
                  className="w-16"
                  autoComplete="cc-exp-month"
                />
                <span className="text-muted-foreground">/</span>
                <Input
                  variant="ios"
                  type="number"
                  min={new Date().getFullYear()}
                  max="2099"
                  value={form.cardExpYear}
                  onChange={(e) => update('cardExpYear', e.target.value)}
                  placeholder="AAAA"
                  className="w-24"
                  autoComplete="cc-exp-year"
                />
              </div>
            </InputRow>
          </InputGroup>
        )}

        {/* Disclaimer de seguridad para tarjetas */}
        {supportsCardData && (
          <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3 flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-100 space-y-1">
              <p className="font-semibold">Cómo protegemos tus datos</p>
              <ul className="list-disc ml-4 space-y-0.5">
                <li>El número se cifra con AES-GCM antes de subirlo (PBKDF2 250k iteraciones).</li>
                <li>Nunca pedimos ni almacenamos el CVC.</li>
                <li>Solo verás los últimos 4 dígitos en listados.</li>
                <li>El número completo solo se descifra en este dispositivo cuando lo pidas.</li>
              </ul>
            </div>
          </div>
        )}

        {cardError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{cardError}</span>
          </div>
        )}

        {/* Apariencia */}
        <InputGroup title="Apariencia">
          <InputRow label="Icono" icon={Hash}>
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="text-2xl px-3 py-1 hover:bg-muted rounded-lg"
            >
              {form.icon || ACCOUNT_TYPE_ICONS[form.type]}
            </button>
          </InputRow>

          {showEmoji && (
            <div className="px-3 pb-3">
              <EmojiPicker
                onEmojiClick={(e) => {
                  update('icon', e.emoji);
                  setShowEmoji(false);
                }}
                theme={temaEfectivo === 'dark' ? Theme.DARK : Theme.LIGHT}
                width="100%"
                height={350}
              />
            </div>
          )}

          <InputRow label="Color" icon={Palette}>
            <div className="flex flex-wrap gap-2 px-1 py-1">
              {DEFAULT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => update('color', c)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform ${
                    form.color === c
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </InputRow>
        </InputGroup>

        {/* Opciones */}
        <InputGroup title="Opciones">
          <Switch
            label="Cuenta predeterminada"
            description="Aparece preseleccionada al crear gastos"
            icon={Star}
            iconColor="bg-amber-500/10"
            checked={form.isDefault}
            onChange={(e) => update('isDefault', e.target.checked)}
          />
          <Switch
            label="Sumar al patrimonio total"
            description="Si lo desactivas, esta cuenta no contará en el resumen del Dashboard"
            icon={Wallet}
            iconColor="bg-emerald-500/10"
            checked={form.includeInTotal}
            onChange={(e) => update('includeInTotal', e.target.checked)}
          />
        </InputGroup>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => navigate(-1)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            icon={Save}
            loading={loading}
            loadingText="Guardando..."
          >
            {isEdit ? 'Guardar cambios' : 'Crear cuenta'}
          </Button>
        </div>
      </form>
    </div>
  );
}
