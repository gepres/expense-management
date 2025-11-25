/**
 * Lista de Grupos de Gastos Compartidos - Estilo iOS
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SharedService } from '@services/shared';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import type { SharedExpenseGroup, GroupStats } from '@app-types/shared';
import { Plus, Users, ChevronRight, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomLoader from '@components/common/CustomLoader';
import CreateSharedGroupModal from './CreateSharedGroupModal';

export default function SharedGroupsList() {
  const { usuario } = useAuth();
  const { getCurrencySymbol } = useConfig();

  const [groups, setGroups] = useState<SharedExpenseGroup[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, GroupStats>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0) {
      loadStats();
    }
  }, [groups]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await SharedService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Error al cargar grupos compartidos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const newStats: Record<string, GroupStats> = {};
    await Promise.all(
      groups.map(async (group) => {
        try {
          const stats = await SharedService.getStats(group.id);
          newStats[group.id] = stats;
        } catch (error) {
          console.error(`Error loading stats for group ${group.id}:`, error);
        }
      })
    );
    setStatsMap(newStats);
  };

  const handleGroupCreated = (newGroup: SharedExpenseGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setShowCreateModal(false);
    toast.success('Grupo creado exitosamente');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <CustomLoader />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gastos Compartidos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra gastos en grupo
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay grupos</h3>
          <p className="text-muted-foreground mb-6">
            Crea un grupo para compartir gastos con amigos o familia
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
          >
            Crear primer grupo
          </button>
        </div>
      )}

      {/* Groups List */}
      <div className="space-y-3">
        {groups.map((group) => {
          const isCreator = group.createdBy === usuario?.id;
          const targetAmount = group.targetAmount || 0;
          const stats = statsMap[group.id];
          const contributed = stats?.totalBudget || 0; // totalBudget in stats is the sum of contributions
          const percentUsed = targetAmount > 0 ? Math.min((contributed / targetAmount) * 100, 100) : 0;
          const currencySymbol = getCurrencySymbol(group.currency);

          return (
            <Link
              key={group.id}
              to={`/compartidos/${group.id}`}
              className="block bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    backgroundColor: (group.color || '#6366f1') + '20',
                  }}
                >
                  {group.icon || '👥'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {group.name}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>

                  {/* Progress */}
                  {targetAmount > 0 && (
                    <div className="mt-2">
                      <div className="flex items-baseline gap-1 text-sm">
                        <span className="font-semibold">
                          {currencySymbol} {contributed.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          de {currencySymbol} {targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentUsed}%`,
                            backgroundColor: group.color || '#6366f1',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {group.members.length} {group.members.length === 1 ? 'persona' : 'personas'}
                    </span>
                    <span>•</span>
                    <span>
                      {isCreator ? 'Creado por ti' : `Por ${group.creatorName || 'Otro usuario'}`}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Create Modal */}
      <CreateSharedGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSaved={handleGroupCreated}
      />
    </div>
  );
}
