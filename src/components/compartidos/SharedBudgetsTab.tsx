/**
 * Tab de Aportes/Presupuestos del grupo
 */

import { useState, useEffect } from 'react';
import { SharedService } from '@services/shared';
import { useSharedExpenses, createBudgetNotification } from '@context/SharedExpensesContext';
import { useAuth } from '@context/AuthContext';
import { useConfig } from '@context/ConfigContext';
import type { SharedBudget, CreateSharedBudgetDto } from '@app-types/shared';
import { Plus, Edit2, Trash2, Calendar, Clock, FileText, Hash, Building2, CreditCard, AlignLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal, { ModalFooterActions } from '@components/common/Modal';

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
  const { paymentMethods, getPaymentMethodLabel } = useConfig();
  const { addNotification } = useSharedExpenses();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateSharedBudgetDto>({
    amount: 0,
    description: '',
    paymentMethod: 'efectivo',
    type: 'contribution',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    voucherType: 'boleta',
    voucherNumber: '',
    ruc: '',
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
    setFormData({
      amount: 0,
      description: '',
      paymentMethod: 'efectivo',
      type: 'contribution',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      voucherType: 'boleta',
      voucherNumber: '',
      ruc: '',
    });
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
          paymentMethod: formData.paymentMethod,
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
      paymentMethod: budget.paymentMethod || 'efectivo',
      type: budget.type,
      date: budget.date || new Date().toISOString().split('T')[0],
      time: budget.time || new Date().toTimeString().slice(0, 5),
      voucherType: budget.voucherType || 'boleta',
      voucherNumber: budget.voucherNumber || '',
      ruc: budget.ruc || '',
    });
    setEditingId(budget.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!budgetToDelete) return;

    try {
      await SharedService.deleteBudget(groupId, budgetToDelete);
      onBudgetsChange(budgets.filter(b => b.id !== budgetToDelete));
      toast.success('Aporte eliminado');
      setBudgetToDelete(null);
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

      {/* Form - iOS Style */}
      {showForm && (
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

          {/* Monto, Tipo y Método de Pago */}
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
                <FileText className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'contribution' | 'budget' }))}
                  className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none"
                >
                  <option value="contribution">Aporte</option>
                  <option value="budget">Presupuesto</option>
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
                  placeholder="Ej: Mi aporte inicial"
                  rows={2}
                  maxLength={100}
                  className="bg-transparent text-sm w-full focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

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

          {/* Botones de acción */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium text-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Agregar'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 bg-muted rounded-xl text-sm font-medium transition-all active:scale-95"
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
                    {budget.paymentMethod && ` • ${getPaymentMethodLabel(budget.paymentMethod)}`}
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
                      onClick={() => setBudgetToDelete(budget.id)}
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

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        title="¿Eliminar aporte?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setBudgetToDelete(null)}
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
              Esta acción no se puede deshacer. El aporte será eliminado permanentemente.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
