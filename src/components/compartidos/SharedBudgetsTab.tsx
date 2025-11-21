/**
 * Tab de Aportes/Presupuestos del grupo
 */

import { useState, useEffect } from 'react';
import { SharedService } from '@services/shared';
import { useSharedExpenses, createBudgetNotification } from '@context/SharedExpensesContext';
import { useAuth } from '@context/AuthContext';
import type { SharedBudget, CreateSharedBudgetDto } from '@app-types/shared';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  groupId: string;
  groupName: string;
  budgets: SharedBudget[];
  onBudgetsChange: (budgets: SharedBudget[]) => void;
  currencySymbol: string;
  currentUserId: string;
  openForm?: boolean;
  onFormClose?: () => void;
}

export default function SharedBudgetsTab({
  groupId,
  groupName,
  budgets,
  onBudgetsChange,
  currencySymbol,
  currentUserId,
  openForm,
  onFormClose,
}: Props) {
  const { usuario } = useAuth();
  const { addNotification } = useSharedExpenses();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSharedBudgetDto>({
    amount: 0,
    description: '',
    type: 'contribution',
  });
  const [loading, setLoading] = useState(false);

  // Abrir formulario desde botón flotante
  useEffect(() => {
    if (openForm) {
      setShowForm(true);
      onFormClose?.();
    }
  }, [openForm, onFormClose]);

  const resetForm = () => {
    setFormData({ amount: 0, description: '', type: 'contribution' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description.trim()) {
      toast.error('Completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const updated = await SharedService.updateBudget(groupId, editingId, {
          amount: formData.amount,
          description: formData.description,
        });
        onBudgetsChange(budgets.map(b => b.id === editingId ? updated : b));
        toast.success('Aporte actualizado');
      } else {
        const newBudget = await SharedService.createBudget(groupId, formData);
        onBudgetsChange([newBudget, ...budgets]);
        toast.success('Aporte agregado');

        // Send notification
        if (usuario) {
          addNotification(createBudgetNotification(
            groupId,
            groupName,
            usuario.nombre || 'Usuario',
            formData.amount,
            currencySymbol
          ));
        }
      }
      resetForm();
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (budget: SharedBudget) => {
    setFormData({
      amount: budget.amount,
      description: budget.description,
      type: budget.type,
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm('¿Eliminar este aporte?')) return;

    try {
      await SharedService.deleteBudget(groupId, budgetId);
      onBudgetsChange(budgets.filter(b => b.id !== budgetId));
      toast.success('Aporte eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Aportes</h3>
          <p className="text-sm text-muted-foreground">
            Total: {currencySymbol} {totalBudget.toLocaleString()}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/50 rounded-xl p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              placeholder="Monto"
              min="0"
              step="0.01"
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              autoFocus
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'contribution' | 'budget' }))}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="contribution">Aporte</option>
              <option value="budget">Presupuesto</option>
            </select>
          </div>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción (ej: Mi aporte inicial)"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            maxLength={100}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-green-500 text-white rounded-lg font-medium text-sm disabled:opacity-50"
            >
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-muted rounded-lg text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {budgets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay aportes aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {budgets.map((budget) => {
            const isOwner = budget.odId === currentUserId;
            // Try multiple field names for user name
            const displayName = (budget as any).userName || (budget as any).name || (budget as any).displayName || (budget as any).createdByName || 'Usuario';
            const displayPhoto = (budget as any).userPhoto || (budget as any).photoURL || (budget as any).photo;

            return (
              <div
                key={budget.id}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl group"
              >
                {/* Avatar */}
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-600 font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{budget.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {displayName} • {new Date(budget.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-sm font-semibold text-green-600">
                  +{currencySymbol} {budget.amount.toLocaleString()}
                </div>

                {/* Actions */}
                {isOwner && (
                  <div className="flex gap-1 transition-opacity">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-1.5 hover:bg-muted rounded-lg hover:opacity-80 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="p-1.5 hover:bg-destructive/10 hover:opacity-80 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
