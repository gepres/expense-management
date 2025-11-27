/**
 * Tab de Gastos del grupo
 */

import { useState, useEffect } from 'react';
import { SharedService } from '@services/shared';
import { useSharedExpenses, createExpenseNotification } from '@context/SharedExpensesContext';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import type { SharedExpense, CreateSharedExpenseDto } from '@app-types/shared';
import { Plus, Edit2, Trash2, Calendar, Clock, Tag, CreditCard, AlignLeft, FileText, Hash, Building2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal, { ModalFooterActions, ModalButton } from '@components/common/Modal';

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
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

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
    time: new Date().toTimeString().slice(0, 5),
    voucherType: 'boleta',
    voucherNumber: '',
    ruc: '',
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
      time: new Date().toTimeString().slice(0, 5),
      voucherType: 'boleta',
      voucherNumber: '',
      ruc: '',
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      date: expense.date || (expense.createdAt ? new Date(expense.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
      time: expense.time || new Date().toTimeString().slice(0, 5),
      voucherType: expense.voucherType || 'boleta',
      voucherNumber: expense.voucherNumber || '',
      ruc: expense.ruc || '',
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;

    try {
      await SharedService.deleteExpense(groupId, expenseToDelete);
      onExpensesChange(expenses.filter(exp => exp.id !== expenseToDelete));
      toast.success('Gasto eliminado');
      setExpenseToDelete(null);
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

      {/* Form Modal - iOS Style */}
      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingId ? 'Editar Gasto' : 'Nuevo Gasto'}
        subtitle="Registra un gasto del grupo"
        size="lg"
        footer={
          <div className="flex gap-3">
            <ModalButton variant="secondary" onClick={resetForm}>
              Cancelar
            </ModalButton>
            <ModalButton
              type="submit"
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
            </ModalButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Fecha y Hora */}
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            <div className="flex divide-x divide-border">
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Fecha</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-transparent text-sm w-full focus:outline-none font-medium"
                  />
                </div>
              </div>
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Hora</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="bg-transparent text-sm w-full focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Monto, Categoría, Subcategoría y Método de Pago */}
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                <span className="text-base font-bold">$</span>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">Monto</label>
                <input
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="bg-transparent text-sm w-full focus:outline-none font-medium"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Tag className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none"
                >
                  <option value="">Seleccionar</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-pink-500/10 rounded-lg text-pink-600 dark:text-pink-400">
                <Tag className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">Subcategoría</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  disabled={!formData.category}
                  className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none disabled:opacity-50"
                >
                  <option value="">Seleccionar</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.nombre}>{sub.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400">
                <CreditCard className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">Método de Pago</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                  className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none"
                >
                  {paymentMethods.map(method => (
                    <option key={method.id} value={method.id}>{method.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 flex items-start gap-3">
              <div className="p-1.5 bg-gray-500/10 rounded-lg text-gray-600 dark:text-gray-400 mt-1">
                <AlignLeft className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Decoración navideña"
                  rows={2}
                  maxLength={100}
                  className="bg-transparent text-sm w-full focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Sugerencias */}
          {formData.subcategory && suggestions.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-3">
              <label className="block text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                Sugerencias para {formData.subcategory}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addSuggestion(suggestion)}
                    className="px-2.5 py-1.5 rounded-full text-xs font-medium bg-muted hover:bg-primary hover:text-primary-foreground border border-border transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Información Tributaria */}
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            <div className="flex divide-x divide-border">
              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Tipo de Comprobante</label>
                  <select
                    value={formData.voucherType}
                    onChange={(e) => setFormData(prev => ({ ...prev, voucherType: e.target.value as any }))}
                    className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none"
                  >
                    <option value="boleta">Boleta</option>
                    <option value="factura">Factura</option>
                    <option value="recibo">Recibo</option>
                    <option value="ticket">Ticket</option>
                  </select>
                </div>
              </div>

              <div className="flex-1 p-3 flex items-center gap-3">
                <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-600 dark:text-cyan-400">
                  <Hash className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-0.5">Número</label>
                  <input
                    type="text"
                    value={formData.voucherNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, voucherNumber: e.target.value }))}
                    placeholder="B001-00012345"
                    maxLength={20}
                    className="bg-transparent text-sm w-full focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Campo RUC condicional (solo si es factura) */}
          {formData.voucherType === 'factura' && (
            <div className="bg-card border border-amber-200 dark:border-amber-900 rounded-xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
              <div className="p-3 flex items-center gap-3 bg-amber-500/5">
                <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-0.5">RUC del Emisor</label>
                  <input
                    type="text"
                    value={formData.ruc}
                    onChange={(e) => setFormData(prev => ({ ...prev, ruc: e.target.value }))}
                    placeholder="20123456789"
                    maxLength={11}
                    className="bg-transparent text-sm w-full focus:outline-none font-medium"
                  />
                </div>
              </div>
            </div>
          )}

        </form>
      </Modal>

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
                    {/* {expense.category && ` • ${expense.category}`} */}
                    {' • '}
                    {new Date(expense.createdAt).toLocaleDateString('es-ES')}
                    {' • '}
                    {expense.time}
                    {expense.paymentMethod && ` • ${getPaymentMethodLabel(expense.paymentMethod)}`}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-sm font-semibold text-red-600">
                  -{currencySymbol} {expense.amount.toLocaleString()}
                </div>

                {/* Actions */}
                {isOwner && (
                  <div className="flex gap-1 group-hover:opacity-85 transition-opacity">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => setExpenseToDelete(expense.id)}
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

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="¿Eliminar gasto?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setExpenseToDelete(null)}
            onConfirm={handleDelete}
            cancelText="Cancelar"
            confirmText="Eliminar"
            confirmVariant="destructive"
          />
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. El gasto será eliminado permanentemente.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
