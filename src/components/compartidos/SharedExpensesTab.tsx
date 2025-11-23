/**
 * Tab de Gastos del grupo
 */

import { useState, useEffect } from 'react';
import { SharedService } from '@services/shared';
import { useSharedExpenses, createExpenseNotification } from '@context/SharedExpensesContext';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import type { SharedExpense, CreateSharedExpenseDto } from '@app-types/shared';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  groupId: string;
  groupName: string;
  expenses: SharedExpense[];
  onExpensesChange: (expenses: SharedExpense[]) => void;
  currencySymbol: string;
  currentUserId: string;
  openForm?: boolean;
  onFormClose?: () => void;
}

export default function SharedExpensesTab({
  groupId,
  groupName,
  expenses,
  onExpensesChange,
  currencySymbol,
  currentUserId,
  openForm,
  onFormClose,
}: Props) {
  const { usuario } = useAuth();
  const { categories, getSubcategories, paymentMethods, getPaymentMethodLabel } = useConfig();
  const { addNotification } = useSharedExpenses();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Abrir formulario desde botón flotante
  useEffect(() => {
    if (openForm) {
      setShowForm(true);
      onFormClose?.();
    }
  }, [openForm, onFormClose]);
  const [formData, setFormData] = useState<CreateSharedExpenseDto>({
    amount: 0,
    description: '',
    category: '',
    subcategory: '',
    paymentMethod: 'efectivo',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      amount: 0,
      description: '',
      category: '',
      subcategory: '',
      paymentMethod: 'efectivo',
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
    setEditingId(null);
  };

  // Manejar cambio de categoría
  const handleCategoryChange = (categoryName: string) => {
    setFormData(prev => ({ ...prev, category: categoryName, subcategory: '' }));
  };

  // Obtener subcategorías de la categoría seleccionada
  const currentCategory = categories.find(c => c.nombre === formData.category);
  const currentCategoryId = currentCategory?.id || '';
  const subcategories = getSubcategories(currentCategoryId);

  // Obtener sugerencias de la subcategoría seleccionada
  const currentSubcategory = currentCategory?.subcategorias?.find(
    sub => sub.nombre === formData.subcategory
  );
  const suggestions = currentSubcategory?.suggestions_ideas || [];

  // Agregar sugerencia a la descripción
  const addSuggestion = (suggestion: string) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description ? `${prev.description}, ${suggestion}` : suggestion
    }));
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
        const updated = await SharedService.updateExpense(groupId, editingId, formData);
        onExpensesChange(expenses.map(exp => exp.id === editingId ? updated : exp));
        toast.success('Gasto actualizado');
      } else {
        const newExpense = await SharedService.createExpense(groupId, formData);
        onExpensesChange([newExpense, ...expenses]);
        toast.success('Gasto agregado');

        // Send notification
        if (usuario) {
          addNotification(createExpenseNotification(
            groupId,
            groupName,
            usuario.nombre || 'Usuario',
            formData.amount,
            currencySymbol,
            formData.description
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

  const handleEdit = (expense: SharedExpense) => {
    setFormData({
      amount: expense.amount,
      description: expense.description,
      category: expense.category || '',
      subcategory: expense.subcategory || '',
      paymentMethod: expense.paymentMethod || 'efectivo',
      date: expense.createdAt ? new Date(expense.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!confirm('¿Eliminar este gasto?')) return;

    try {
      await SharedService.deleteExpense(groupId, expenseId);
      onExpensesChange(expenses.filter(exp => exp.id !== expenseId));
      toast.success('Gasto eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Gastos</h3>
          <p className="text-sm text-muted-foreground">
            Total: {currencySymbol} {totalExpenses.toLocaleString()}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/50 rounded-xl p-4 space-y-3">
          {/* Monto y Fecha */}
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
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
            />
          </div>

          {/* Categoría y Subcategoría */}
          <div className="flex gap-2">
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="">Categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </select>
            <select
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
              disabled={!formData.category}
            >
              <option value="">Subcategoría</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.nombre}>{sub.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>{method.nombre}</option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción (ej: Decoración navideña)"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            maxLength={100}
          />

          {/* Sugerencias */}
          {formData.subcategory && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Sugerencias para {formData.subcategory}
              </label>
              {suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addSuggestion(suggestion)}
                      className="px-2.5 py-1.5 rounded-full text-xs font-medium bg-background hover:bg-primary hover:text-primary-foreground border border-border transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No hay sugerencias configuradas
                </p>
              )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-50"
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
      {expenses.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No hay gastos aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {expenses.map((expense) => {
            const isOwner = expense.odId === currentUserId;
            // Try multiple field names for user name
            const displayName = (expense as any).userName || (expense as any).name || (expense as any).displayName || (expense as any).createdByName || 'Usuario';
            const displayPhoto = (expense as any).userPhoto || (expense as any).photoURL || (expense as any).photo;

            return (
              <div
                key={expense.id}
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
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-600 font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{expense.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {displayName}
                    {expense.category && ` • ${expense.category}`}
                    {expense.paymentMethod && ` • ${getPaymentMethodLabel(expense.paymentMethod)}`}
                    {' • '}
                    {new Date(expense.createdAt).toLocaleDateString('es-ES')}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-sm font-semibold text-red-600">
                  -{currencySymbol} {expense.amount.toLocaleString()}
                </div>

                {/* Actions */}
                {isOwner && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
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
