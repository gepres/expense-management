import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '@context/ConfigContext';
import { ShoppingListService } from '../../services/shopping-list';
import type { ShoppingList, ShoppingListItem } from '../../types/shopping-list';
import { ArrowLeft, MoreVertical, Trash2, CheckSquare, Square, Plus, Calendar, Clock, Tag, CreditCard, ChevronDown, ChevronRight, Receipt, Edit2, FileText, Hash, Building2, AlignLeft } from 'lucide-react';
import SmartNoteInput from './SmartNoteInput.tsx';
import ShoppingListItemForm from './ShoppingListItemForm.tsx';
import ConfirmationModal from '@components/common/ConfirmationModal';
import EditNameModal from '@components/common/EditNameModal';
import toast from 'react-hot-toast';

import { useAuth } from '@context/AuthContext';
import { useGastos } from '@hooks/useGastos';

export default function ShoppingListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories, getSubcategories, paymentMethods, currencies, getCurrencySymbol } = useConfig();
  const { usuario } = useAuth();
  const { crear } = useGastos();
  
  const [list, setList] = useState<ShoppingList | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [creatingExpense, setCreatingExpense] = useState(false);
  
  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  useEffect(() => {
    if (id) loadList();
  }, [id]);

 
  
  // Ref to track notified state to avoid spamming toasts
  const lastNotificationRef = useRef<'none' | 'warning' | 'error'>('none');

  useEffect(() => {
    if (!list || !list.budget || list.budget <= 0) return;

    const totalEstimated = list.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const percentage = (totalEstimated / list.budget) * 100;

    if (percentage >= 100) {
      if (lastNotificationRef.current !== 'error') {
        toast.error(`¡Has excedido tu presupuesto de ${getCurrencySymbol(list.currency || 'PEN')} ${list.budget}!`, {
          icon: '🚨',
          duration: 4000
        });
        lastNotificationRef.current = 'error';
      }
    } else if (percentage >= 90) {
      if (lastNotificationRef.current !== 'warning') {
        toast('¡Estás cerca de tu límite de presupuesto!', {
          icon: '⚠️',
          duration: 4000,
        });
        lastNotificationRef.current = 'warning';
      }
    } else {
      lastNotificationRef.current = 'none';
    }
  }, [list]);

  const loadList = () => {
    if (!id) return;
    const data = ShoppingListService.getList(id);
    if (data) {
      setList(data);
    } else {
      toast.error('Lista no encontrada');
      navigate('/compras');
    }
  };

  const handleUpdateList = (data: Partial<ShoppingList>) => {
    if (!id || list?.status === 'archived') return;
    ShoppingListService.updateList(id, data);
    loadList();
  };

  const handleToggleItem = (itemId: string, checked: boolean) => {
    if (!id || list?.status === 'archived') return;
    ShoppingListService.updateItem(id, itemId, { checked });
    
    // Check if all items are now checked to auto-update status
    const updatedList = ShoppingListService.getList(id);
    if (updatedList && updatedList.items.length > 0) {
      const allChecked = updatedList.items.every(item => item.checked);
      const anyChecked = updatedList.items.some(item => item.checked);
      
      if (allChecked && updatedList.status !== 'completed') {
        ShoppingListService.updateList(id, { status: 'completed' });
        toast.success('¡Lista completada! 🎉');
      } else if (!allChecked && anyChecked && updatedList.status === 'completed') {
        // If user unchecks an item from a completed list, revert to active
        ShoppingListService.updateList(id, { status: 'active' });
      }
    }
    
    loadList();
  };

  const handleDeleteList = () => {
    if (!id) return;
    ShoppingListService.deleteList(id);
    navigate('/compras');
  };

  const handleSaveAsExpense = () => {
    if (!list) return;
    
    const totalChecked = list.items
      .filter(i => i.checked)
      .reduce((sum, item) => sum + (item.amount || 0), 0);

    if (totalChecked === 0) {
      toast.error('No hay items marcados con monto para guardar');
      return;
    }

    setShowFinishModal(true);
  };

  const handleConfirmFinish = async () => {
    if (!list || !usuario) {
      if (!usuario) toast.error('Debes iniciar sesión para guardar gastos');
      return;
    }

    setCreatingExpense(true);
    try {
      const checkedItems = list.items.filter(i => i.checked);
      const totalChecked = checkedItems.reduce((sum, item) => sum + (item.amount || 0), 0);

      // Format description: "Compras: item1-price; item2-price..."
      const itemsDescription = checkedItems
        .map(item => `${item.name}-${(item.amount || 0).toFixed(2)}`)
        .join('; ');
      
      const description = `Compras: ${itemsDescription}`;

      const fechaHora = new Date(`${list.date || new Date().toISOString().split('T')[0]}T${list.time || new Date().toTimeString().slice(0, 5)}:00`);

      const expenseData: any = {
        userId: usuario.id,
        fecha: fechaHora,
        categoria: list.category ? categories.find(c => c.nombre === list.category)?.id : 'alimentacion', // Default fallback
        monto: totalChecked,
        moneda: list.currency || 'PEN',
        descripcion: description,
        metodoPago: list.paymentMethod || 'efectivo', // Default fallback
        recurrente: false,
        tags: ['shopping-list'],
        shoppingListId: list.id,
      };

      if (list.subcategory) {
        expenseData.subcategoria = list.subcategory;
      }

      await crear(expenseData);
      
      // Update local list status to archived
      ShoppingListService.updateList(list.id, { status: 'archived' });
      
      toast.success('Gasto creado y lista archivada');
      navigate('/gastos');
      
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Error al crear el gasto');
    } finally {
      setCreatingExpense(false);
      setShowFinishModal(false);
    }
  };

  if (!list) return <div>Cargando...</div>;

  const isArchived = list.status === 'archived';
  const totalEstimated = list.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const totalChecked = list.items.filter(i => i.checked).reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="max-w-2xl mx-auto pb-24 bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-lg z-10 px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/compras')} className="p-2 -ml-2 hover:bg-muted rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div 
            className="flex-1"
            onClick={() => !isArchived && setShowEditNameModal(true)}
          >
            <h1 className="font-bold text-lg truncate">{list.name}</h1>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-muted rounded-full">
            <MoreVertical className="h-5 w-5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-20 py-1">
                {!isArchived && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditNameModal(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" /> Editar nombre
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Eliminar lista
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`p-4 space-y-6 ${isArchived ? 'opacity-80 pointer-events-none' : ''}`}>
        {/* General Details (iOS Style Group) */}
        <div className="space-y-2">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground w-full"
          >
            {showDetails ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Detalles Generales
          </button>
          
          {showDetails && (
            <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
              {/* Fecha y Hora */}
              <div className="flex divide-x divide-border">
                <div className="flex-1 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    value={list.date || ''}
                    onChange={(e) => handleUpdateList({ date: e.target.value })}
                    className="bg-transparent text-sm w-full focus:outline-none"
                    disabled={isArchived}
                  />
                </div>
                <div className="w-1/3 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
                    <Clock className="h-4 w-4" />
                  </div>
                  <input
                    type="time"
                    value={list.time || ''}
                    onChange={(e) => handleUpdateList({ time: e.target.value })}
                    className="bg-transparent text-sm w-full focus:outline-none"
                    disabled={isArchived}
                  />
                </div>
              </div>

              {/* Categoría y Subcategoría */}
              <div className="flex divide-x divide-border">
                <div className="flex-1 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-600">
                    <Tag className="h-4 w-4" />
                  </div>
                  <select
                    value={list.category || ''}
                    onChange={(e) => handleUpdateList({ category: e.target.value, subcategory: '' })}
                    className={`bg-transparent text-sm w-full focus:outline-none appearance-none ${
                      list.category ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                    disabled={isArchived}
                  >
                    <option value="">Categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 p-3">
                  <select
                    value={list.subcategory || ''}
                    onChange={(e) => handleUpdateList({ subcategory: e.target.value })}
                    className={`bg-transparent text-sm w-full focus:outline-none appearance-none disabled:opacity-50 ${
                      list.subcategory ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                    disabled={!list.category || isArchived}
                  >
                    <option value="">Subcategoría</option>
                    {list.category && getSubcategories(categories.find(c => c.nombre === list.category)?.id || '').map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Método de Pago y Moneda */}
              <div className="flex divide-x divide-border">
                <div className="flex-1 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <select
                    value={list.paymentMethod || ''}
                    onChange={(e) => handleUpdateList({ paymentMethod: e.target.value })}
                    className={`bg-transparent text-sm w-full focus:outline-none appearance-none ${
                      list.paymentMethod ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }`}
                    disabled={isArchived}
                  >
                    <option value="">Método de Pago</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>{method.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/3 p-3">
                  <select
                    value={list.currency || 'PEN'}
                    onChange={(e) => handleUpdateList({ currency: e.target.value })}
                    className="bg-transparent text-sm w-full focus:outline-none appearance-none font-medium text-right pr-2"
                    disabled={isArchived}
                  >
                    {currencies.map(curr => (
                      <option key={curr.id} value={curr.id}>{curr.simbolo} {curr.codigoISO}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Presupuesto */}
              <div className="p-3 flex items-center justify-between">
                <span className="text-sm font-medium">Presupuesto</span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground text-sm">{getCurrencySymbol(list.currency || 'PEN')}</span>
                  <input
                    type="number"
                    value={list.budget || ''}
                    onChange={(e) => handleUpdateList({ budget: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    className="bg-transparent font-semibold w-24 text-right focus:outline-none focus:bg-muted/50 rounded px-1"
                    disabled={isArchived}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="p-3 flex items-start gap-3">
                <div className="p-1.5 bg-gray-500/10 rounded-lg text-gray-600 dark:text-gray-400 mt-1">
                  <AlignLeft className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground block mb-1">Descripción</label>
                  <textarea
                    value={list.description || ''}
                    onChange={(e) => handleUpdateList({ description: e.target.value })}
                    placeholder="Ej: Compras del mes, Insumos de oficina..."
                    rows={2}
                    className="bg-transparent text-sm w-full focus:outline-none resize-none"
                    disabled={isArchived}
                  />
                </div>
              </div>

              {/* Tipo de Comprobante y Número */}
              <div className="flex divide-x divide-border">
                <div className="flex-1 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <FileText className="h-4 w-4" />
                  </div>
                   {/* list.voucherType ? 'text-foreground font-medium' : 'text-muted-foreground' */}
                  <select
                    value={list.voucherType || 'boleta'}
                    onChange={(e) => handleUpdateList({ voucherType: e.target.value as any })}
                    className={`bg-transparent text-sm w-full focus:outline-none appearance-none ${
                     'text-foreground font-medium'
                    }`}
                    disabled={isArchived}
                  >
                    <option value="">Tipo de Comprobante</option>
                    <option value="boleta">Boleta</option>
                    <option value="factura">Factura</option>
                    <option value="recibo">Recibo</option>
                    <option value="ticket">Ticket</option>
                  </select>
                </div>

                <div className="flex-1 p-3 flex items-center gap-3">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Hash className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={list.voucherNumber || ''}
                    onChange={(e) => handleUpdateList({ voucherNumber: e.target.value })}
                    placeholder="Número"
                    className="bg-transparent text-sm w-full focus:outline-none font-medium"
                    disabled={isArchived}
                  />
                </div>
              </div>

              {/* RUC (solo si es factura) */}
              {list.voucherType === 'factura' && (
                <div className="p-3 flex items-center gap-3 bg-amber-500/5 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-muted-foreground block mb-0.5">RUC del Emisor</label>
                    <input
                      type="text"
                      value={list.ruc || ''}
                      onChange={(e) => handleUpdateList({ ruc: e.target.value })}
                      placeholder="20123456789"
                      maxLength={11}
                      className="bg-transparent text-sm w-full focus:outline-none font-medium"
                      disabled={isArchived}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Totals Summary */}
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col">
            <p className="text-xs text-muted-foreground">Total Estimado</p>
            {list.budget && list.budget > 0 && (
             <div>
               <div className="flex items-center gap-1 text-xs mt-0.5">
                <span className={`${
                  totalEstimated > list.budget ? 'text-destructive' : 
                  totalEstimated >= list.budget * 0.9 ? 'text-yellow-600' : 'text-muted-foreground'
                }`}>
                  {Math.round((totalEstimated / list.budget) * 100)}% del presupuesto
                </span>
              </div>
               {totalEstimated > list.budget && (
                 <div className="flex items-center gap-1 text-xs text-destructive">
                   <span>Excede por</span>
                   <span>{getCurrencySymbol(list.currency || 'PEN')} {(totalEstimated - list.budget).toFixed(2)}</span>
                 </div>
               )}
               {totalEstimated < list.budget && (
                 <div className="flex items-center gap-1 text-xs text-green-600">
                   <span>Por debajo por</span>
                   <span>{getCurrencySymbol(list.currency || 'PEN')} {(list.budget - totalEstimated).toFixed(2)}</span>
                 </div>
               )}
              </div>
            )}
          </div>
          <p className={`font-bold text-lg ${
            list.budget && totalEstimated > list.budget ? 'text-destructive' : 
            list.budget && totalEstimated >= list.budget * 0.9 ? 'text-yellow-600' : 'text-primary'
          }`}>
            {getCurrencySymbol(list.currency || 'PEN')} {totalEstimated.toFixed(2)}
          </p>
        </div>

        {/* Smart Note Input */}
        {!isArchived && <SmartNoteInput listId={list.id} onItemsAdded={loadList} />}

        {/* Items List */}
        <div className="space-y-2">
          {list.items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 bg-card border border-border rounded-xl transition-all ${
                item.checked ? 'opacity-60 bg-muted/30' : ''
              }`}
            >
              <button
                onClick={() => handleToggleItem(item.id, !item.checked)}
                className={`flex-shrink-0 ${item.checked ? 'text-primary' : 'text-muted-foreground'}`}
                disabled={isArchived}
              >
                {item.checked ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
              </button>
              
              <div 
                className="flex-1 min-w-0"
                onClick={() => {
                  if (!isArchived) {
                    setEditingItem(item);
                    setShowItemForm(true);
                  }
                }}
              >
                <p className={`font-medium truncate ${item.checked ? 'line-through' : ''}`}>
                  {item.name}
                </p>
                {(item.quantity || item.amount) && (
                  <p className="text-xs text-muted-foreground">
                    {item.quantity && `${item.quantity} un. `}
                    {item.amount && `• S/ ${item.amount.toFixed(2)}`}
                  </p>
                )}
              </div>

              <div className="text-sm font-semibold">
                {item.amount ? `S/ ${item.amount.toFixed(2)}` : '-'}
              </div>
            </div>
          ))}
        </div>

        {/* Manual Add Button */}
        {!isArchived && (
          <button
            onClick={() => {
              setEditingItem(null);
              setShowItemForm(true);
            }}
            className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-5 w-5" /> Agregar item manualmente
          </button>
        )}

        {/* Save as Expense Button (FAB) */}
        {!isArchived && (
          <div className="fixed bottom-24 right-4 z-50">
            <button
              onClick={handleSaveAsExpense}
              className="h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              title={`Guardar como Gasto (S/ ${totalChecked.toFixed(2)})`}
            >
              <Receipt className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>

      {/* Item Form Modal */}
      <AnimatePresence>
        {showItemForm && (
          <ShoppingListItemForm
            key="item-form"
            listId={list.id}
            initialData={editingItem}
            onClose={() => setShowItemForm(false)}
            onSaved={() => {
              loadList();
              setShowItemForm(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteList}
        title="¿Eliminar lista?"
        description="Esta acción no se puede deshacer. Se perderán todos los items de la lista."
        confirmText="Eliminar"
        isDestructive={true}
      />

      {/* Finish Confirmation Modal */}
      <ConfirmationModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleConfirmFinish}
        title="¿Terminar compras?"
        description="¿Estás seguro de terminar estas compras? Después no podrás editar la lista, solo visualizarla."
        confirmText="Sí, terminar"
        cancelText="Cancelar"
        isDestructive={false}
        isLoading={creatingExpense}
        autoClose={false}
      />

      {/* Edit Name Modal */}
      <EditNameModal
        isOpen={showEditNameModal}
        onClose={() => setShowEditNameModal(false)}
        onSave={(newName) => handleUpdateList({ name: newName })}
        initialName={list.name}
      />
    </div>
  );
}
