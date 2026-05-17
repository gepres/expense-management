/**
 * Tab: cuentas PRO/admin — datos importantes, WhatsApp vinculado y
 * gestión (revocar PRO). Muestra el consumo IA del mes por usuario.
 */

import { useState, useEffect, useCallback } from 'react';
import { authService } from '@services/firebase';
import { useAuth } from '@context/AuthContext';
import {
  AiUsageAdminService,
  currentMonthKey,
} from '@services/aiUsageAdmin';
import type { Usuario, AiUsageUserRow } from '@app-types';
import {
  Loader2,
  User,
  Smartphone,
  SmartphoneNfc,
  ShieldCheck,
  Cpu,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import ProBadge from '../common/ProBadge';
import ConfirmationModal from '../common/ConfirmationModal';
import QuotaAdjustModal from './QuotaAdjustModal';
import { formatearFechaCorta, formatearMoneda } from '@utils/formatters';

export default function CuentasProTab() {
  const { usuario } = useAuth();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [usageByUid, setUsageByUid] = useState<Record<string, AiUsageUserRow>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmUser, setConfirmUser] = useState<Usuario | null>(null);
  // Búsqueda por email para activar PRO directamente.
  const [searchEmail, setSearchEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Usuario[] | null>(null);
  const [confirmGrant, setConfirmGrant] = useState<Usuario | null>(null);
  const [ajustar, setAjustar] = useState<{
    userId: string;
    nombre: string;
    used: number;
  } | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const pros = await authService.getProUsers();
      pros.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setUsers(pros);
      // 1 query: top consumo del mes → mapa uid→rollup (best-effort).
      try {
        const top = await AiUsageAdminService.getTopUsers(
          currentMonthKey(),
          100,
        );
        const map: Record<string, AiUsageUserRow> = {};
        top.forEach((r) => {
          map[r.userId] = r;
        });
        setUsageByUid(map);
      } catch {
        /* rules sin desplegar o sin datos → se omite el consumo */
      }
    } catch {
      toast.error('Error al cargar cuentas PRO');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revocar = async (u: Usuario) => {
    setConfirmUser(null);
    try {
      setProcessingId(u.id);
      await authService.revokeProRole(u.id);
      toast.success(`PRO revocado a ${u.nombre}`);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch {
      toast.error('No se pudo revocar PRO');
    } finally {
      setProcessingId(null);
    }
  };

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = searchEmail.trim();
    if (!email) return;
    try {
      setSearching(true);
      const res = await authService.searchUsersByEmail(email);
      setSearchResults(res);
      if (res.length === 0) toast('Sin resultados para ese email');
    } catch {
      toast.error('Error al buscar el usuario');
    } finally {
      setSearching(false);
    }
  };

  const activar = async (u: Usuario) => {
    setConfirmGrant(null);
    try {
      setProcessingId(u.id);
      await authService.grantProRole(u.id);
      toast.success(`PRO activado para ${u.nombre}`);
      setSearchResults(null);
      setSearchEmail('');
      await load();
    } catch {
      toast.error('No se pudo activar PRO');
    } finally {
      setProcessingId(null);
    }
  };

  const SearchPanel = (
    <form onSubmit={buscar} className="mb-5">
      <label className="block text-sm font-medium mb-1">
        Activar PRO por email
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="correo@ejemplo.com (exacto)"
          className="flex-1 px-3 py-2 rounded-lg border bg-background text-sm"
        />
        <Button
          type="submit"
          variant="outline"
          size="sm"
          loading={searching}
          disabled={!searchEmail.trim()}
        >
          <Search className="h-4 w-4 mr-1" />
          Buscar
        </Button>
      </div>

      {searchResults && searchResults.length > 0 && (
        <div className="mt-3 space-y-2">
          {searchResults.map((u) => {
            const yaPro = u.role === 'pro' || u.role === 'admin';
            return (
              <div
                key={u.id}
                className="p-3 bg-muted/50 rounded-lg border flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate flex items-center gap-2">
                    {u.nombre}
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        <ShieldCheck className="h-3 w-3" />
                        ADMIN
                      </span>
                    ) : (
                      u.role === 'pro' && <ProBadge size="sm" />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {u.email}
                  </p>
                </div>
                {yaPro ? (
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    Ya es {u.role === 'admin' ? 'admin' : 'PRO'}
                  </span>
                ) : (
                  <Button
                    variant="pro"
                    size="sm"
                    loading={processingId === u.id}
                    disabled={processingId !== null}
                    onClick={() => setConfirmGrant(u)}
                    className="flex-shrink-0"
                  >
                    Activar PRO
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
      {searchResults && searchResults.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          No se encontró ningún usuario con ese email.
        </p>
      )}
    </form>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {SearchPanel}

      {users.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No hay cuentas PRO ni admin</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground mb-4">
            {users.length} cuenta(s) · consumo IA del mes en curso
          </p>
          <div className="space-y-3">
        {users.map((u) => {
          const usage = usageByUid[u.id];
          const esAdmin = u.role === 'admin';
          const esYo = u.id === usuario?.id;
          return (
            <div
              key={u.id}
              className="p-4 bg-muted/50 rounded-lg border flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {u.photoURL ? (
                  <img
                    src={u.photoURL}
                    alt={u.nombre}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate flex items-center gap-2">
                    {u.nombre}
                    {esAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        <ShieldCheck className="h-3 w-3" />
                        ADMIN
                      </span>
                    ) : (
                      <ProBadge size="sm" />
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {u.email}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    {u.whatsappPhone ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <SmartphoneNfc className="h-3 w-3" />
                        {u.whatsappPhone}
                        {u.whatsappLinkedAt &&
                          ` · ${formatearFechaCorta(u.whatsappLinkedAt)}`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 opacity-70">
                        <Smartphone className="h-3 w-3" />
                        WhatsApp no vinculado
                      </span>
                    )}
                    <span>Alta: {formatearFechaCorta(u.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> IA / mes
                  </p>
                  {usage ? (
                    <p className="text-sm font-semibold text-foreground">
                      {usage.totalTokens.toLocaleString('es-PE')} tok ·{' '}
                      {formatearMoneda(usage.estimatedCostUsd, 'USD')}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
                {!esAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={processingId !== null}
                    onClick={() =>
                      setAjustar({
                        userId: u.id,
                        nombre: u.nombre,
                        used: usage?.totalTokens ?? 0,
                      })
                    }
                  >
                    Ajustar cuota
                  </Button>
                )}
                {!esAdmin && !esYo && (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={processingId === u.id}
                    disabled={processingId !== null}
                    onClick={() => setConfirmUser(u)}
                  >
                    Revocar PRO
                  </Button>
                )}
              </div>
            </div>
          );
        })}
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={confirmUser !== null}
        onClose={() => setConfirmUser(null)}
        onConfirm={() => confirmUser && revocar(confirmUser)}
        title="Revocar cuenta PRO"
        description={`¿Quitar el rol PRO a ${confirmUser?.nombre ?? ''}? Volverá a 'standard' y perderá el acceso a las funciones PRO.`}
        confirmText="Revocar"
        isDestructive
      />

      <ConfirmationModal
        isOpen={confirmGrant !== null}
        onClose={() => setConfirmGrant(null)}
        onConfirm={() => confirmGrant && activar(confirmGrant)}
        title="Activar cuenta PRO"
        description={`¿Otorgar el rol PRO a ${confirmGrant?.nombre ?? ''} (${confirmGrant?.email ?? ''})? Tendrá acceso a todas las funciones PRO.`}
        confirmText="Activar PRO"
      />

      {ajustar && (
        <QuotaAdjustModal
          userId={ajustar.userId}
          nombre={ajustar.nombre}
          usedTokens={ajustar.used}
          onClose={() => setAjustar(null)}
          onApplied={() => void load()}
        />
      )}
    </>
  );
}
