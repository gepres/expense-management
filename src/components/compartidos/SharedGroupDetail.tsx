/**
 * Detalle de Grupo de Gastos Compartidos - Estilo iOS
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SharedService } from '@services/shared';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import type { SharedExpenseGroup, SharedBudget, SharedExpense, GroupStats } from '@types/shared';
import { ArrowLeft, MoreVertical, Plus, TrendingUp, TrendingDown, RefreshCw, Wallet, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomLoader from '@components/common/CustomLoader';
import SharedBudgetsTab from './SharedBudgetsTab';
import SharedExpensesTab from './SharedExpensesTab';
import SharedMembersTab from './SharedMembersTab';
import SharedStatsTab from './SharedStatsTab';
import InviteLinkButton from './InviteLinkButton';

type Tab = 'activity' | 'budgets' | 'expenses' | 'members' | 'stats';

export default function SharedGroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const { getCurrencySymbol } = useConfig();

  const [group, setGroup] = useState<SharedExpenseGroup | null>(null);
  const [budgets, setBudgets] = useState<SharedBudget[]>([]);
  const [expenses, setExpenses] = useState<SharedExpense[]>([]);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('activity');
  const [showMenu, setShowMenu] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [openBudgetForm, setOpenBudgetForm] = useState(false);
  const [openExpenseForm, setOpenExpenseForm] = useState(false);

  const isCreator = group?.createdBy === usuario?.id;

  // Calcular totales desde los datos locales
  const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const remaining = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  useEffect(() => {
    if (id) {
      loadGroupData();
    }
  }, [id]);

  const loadGroupData = async (isRefresh = false) => {
    if (!id) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const groupData = await SharedService.getGroup(id);
      setGroup(groupData);

      // Intentar cargar datos adicionales, pero no fallar si no existen
      try {
        const [budgetsData, expensesData, statsData] = await Promise.all([
          SharedService.getBudgets(id).catch(() => []),
          SharedService.getExpenses(id).catch(() => []),
          SharedService.getStats(id).catch(() => null),
        ]);

        setBudgets(budgetsData || []);
        setExpenses(expensesData || []);
        setStats(statsData);
      } catch (err) {
        console.warn('Error loading additional data:', err);
      }

      if (isRefresh) {
        toast.success('Datos actualizados');
      }
    } catch (error) {
      console.error('Error loading group:', error);
      toast.error('Error al cargar el grupo');
      if (!isRefresh) {
        navigate('/compartidos');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadGroupData(true);
  };

  // Handlers para botones flotantes
  const handleAddBudget = () => {
    setActiveTab('budgets');
    setOpenBudgetForm(true);
  };

  const handleAddExpense = () => {
    setActiveTab('expenses');
    setOpenExpenseForm(true);
  };

  const handleLeaveGroup = async () => {
    if (!id || !confirm('¿Estás seguro de salir del grupo?')) return;

    try {
      await SharedService.leaveGroup(id);
      toast.success('Has salido del grupo');
      navigate('/compartidos');
    } catch (error) {
      toast.error('Error al salir del grupo');
    }
  };

  const handleDeleteGroup = async () => {
    if (!id || !confirm('¿Estás seguro de eliminar este grupo? Esta acción no se puede deshacer.')) return;

    try {
      await SharedService.deleteGroup(id);
      toast.success('Grupo eliminado');
      navigate('/compartidos');
    } catch (error) {
      toast.error('Error al eliminar el grupo');
    }
  };

  if (loading || !group) {
    return (
      <div className="flex items-center justify-center p-12">
        <CustomLoader />
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(group.currency);

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg z-10 -mx-4 px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/compartidos')}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">{group.icon}</span>
            <h1 className="text-lg font-bold truncate max-w-[150px]">{group.name}</h1>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 -mr-2 hover:bg-muted rounded-full transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-20 py-1">
                  {isCreator && (
                    <>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowInviteModal(true);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                      >
                        Invitar miembros
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          // TODO: Open edit modal
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-muted transition-colors"
                      >
                        Editar grupo
                      </button>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDeleteGroup();
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Eliminar grupo
                      </button>
                    </>
                  )}
                  {!isCreator && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        handleLeaveGroup();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Salir del grupo
                    </button>
                  )}
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="mt-4 bg-card border border-border rounded-2xl p-5">
        {/* Balance principal */}
        <div className="text-center mb-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {remaining >= 0 ? 'Disponible' : 'Excedido'}
          </p>
          <div className={`text-3xl font-bold ${remaining < 0 ? 'text-destructive' : ''}`}>
            {currencySymbol} {Math.abs(remaining).toLocaleString()}
          </div>
          {totalBudget > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {percentUsed.toFixed(0)}% del presupuesto usado
            </p>
          )}
        </div>

        {totalBudget > 0 && (
          <>
            {/* Progress Bar */}
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${percentUsed}%`,
                  backgroundColor: percentUsed > 90 ? '#ef4444' : group.color || '#6366f1',
                }}
              />
            </div>

            {/* Stats Row */}
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Aportado:</span>
                <span className="font-medium">{currencySymbol} {totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">Disponible:</span>
                <span className={`font-medium ${remaining < 0 ? 'text-destructive' : ''}`}>
                  {currencySymbol} {remaining.toLocaleString()}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 p-1 bg-muted rounded-xl">
        {[
          { id: 'activity', label: 'Actividad' },
          { id: 'budgets', label: 'Aportes' },
          { id: 'expenses', label: 'Gastos' },
          { id: 'members', label: 'Miembros' },
          { id: 'stats', label: 'Stats' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'activity' && (
          <ActivityTab
            budgets={budgets}
            expenses={expenses}
            currencySymbol={currencySymbol}
          />
        )}
        {activeTab === 'budgets' && (
          <SharedBudgetsTab
            groupId={group.id}
            groupName={group.name}
            budgets={budgets}
            onBudgetsChange={setBudgets}
            currencySymbol={currencySymbol}
            currentUserId={usuario?.id || ''}
            openForm={openBudgetForm}
            onFormClose={() => setOpenBudgetForm(false)}
          />
        )}
        {activeTab === 'expenses' && (
          <SharedExpensesTab
            groupId={group.id}
            groupName={group.name}
            expenses={expenses}
            onExpensesChange={setExpenses}
            openForm={openExpenseForm}
            onFormClose={() => setOpenExpenseForm(false)}
            currencySymbol={currencySymbol}
            currentUserId={usuario?.id || ''}
          />
        )}
        {activeTab === 'members' && (
          <SharedMembersTab
            group={group}
            stats={stats}
            isCreator={isCreator}
            onMemberRemoved={loadGroupData}
            currencySymbol={currencySymbol}
          />
        )}
        {activeTab === 'stats' && (
          <SharedStatsTab
            groupId={group.id}
            stats={stats}
            budgets={budgets}
            expenses={expenses}
            groupColor={group.color}
            currencySymbol={currencySymbol}
          />
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 flex flex-col gap-2">
        <button
          onClick={handleAddBudget}
          className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all active:scale-95"
          title="Agregar aporte"
        >
          <Wallet className="h-5 w-5" />
        </button>
        <button
          onClick={handleAddExpense}
          className="p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all active:scale-95"
          title="Agregar gasto"
        >
          <Receipt className="h-5 w-5" />
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl p-6 shadow-xl border border-border">
            <h3 className="text-lg font-bold mb-4">Invitar miembros</h3>
            <InviteLinkButton groupId={group.id} invitationLink={group.invitationLink} />
            <button
              onClick={() => setShowInviteModal(false)}
              className="w-full mt-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Activity Tab Component (combines budgets and expenses in timeline)
function ActivityTab({
  budgets,
  expenses,
  currencySymbol,
}: {
  budgets: SharedBudget[];
  expenses: SharedExpense[];
  currencySymbol: string;
}) {
  // Combine and sort by date
  const activities = [
    ...budgets.map(b => ({ ...b, type: 'budget' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No hay actividad aún</p>
        <p className="text-sm mt-1">Agrega aportes o gastos para comenzar</p>
      </div>
    );
  }

  // Group by date
  const groupedByDate = activities.reduce((acc, activity) => {
    const date = new Date(activity.createdAt).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, typeof activities>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedByDate).map(([date, items]) => (
        <div key={date}>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            {date}
          </h4>
          <div className="space-y-2">
            {items.map((item) => {
              // Try multiple field names for user name
              const displayName = (item as any).userName || (item as any).name || (item as any).displayName || (item as any).createdByName || 'Usuario';

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.type === 'budget'
                        ? 'bg-green-500/20 text-green-600'
                        : 'bg-red-500/20 text-red-600'
                    }`}
                  >
                    {item.type === 'budget' ? '+' : '-'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Por {displayName}
                    </p>
                  </div>
                  <div className={`text-sm font-semibold ${
                    item.type === 'budget' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.type === 'budget' ? '+' : '-'}{currencySymbol} {item.amount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
