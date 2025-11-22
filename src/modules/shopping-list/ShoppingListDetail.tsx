import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useConfig } from '@context/ConfigContext';
import { ShoppingListService } from '../../services/shopping-list';
import type { ShoppingList, ShoppingListItem } from '../../types/shopping-list';
import { ArrowLeft, MoreVertical, Trash2, CheckSquare, Square, Plus, Calendar, Clock, Tag, CreditCard, ChevronDown, ChevronRight, Receipt } from 'lucide-react';
import SmartNoteInput from './SmartNoteInput.tsx';
import ShoppingListItemForm from './ShoppingListItemForm.tsx';
import toast from 'react-hot-toast';

export default function ShoppingListDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { categories, getSubcategories, paymentMethods, currencies, getCurrencySymbol } = useConfig();
  
  const [list, setList] = useState<ShoppingList | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    if (id) loadList();
  }, [id]);

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
    if (!id) return;
    ShoppingListService.updateList(id, data);
    loadList();
  };

  const handleToggleItem = (itemId: string, checked: boolean) => {
    if (!id) return;
    ShoppingListService.updateItem(id, itemId, { checked });
    loadList();
  };

  const handleDeleteList = () => {
    if (!id || !confirm('¿Eliminar lista?')) return;
    ShoppingListService.deleteList(id);
    navigate('/compras');
  };

  const handleSaveAsExpense = () => {
    // TODO: Implement save as expense logic
    // This would likely open a modal or navigate to expense form with pre-filled data
    toast.success('Funcionalidad pendiente: Guardar como gasto');
  };

  if (!list) return <div>Cargando...</div>;

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
          <input
            type="text"
            value={list.name}
            onChange={(e) => handleUpdateList({ name: e.target.value })}
            className="bg-transparent font-bold text-lg focus:outline-none focus:underline w-full"
          />
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-muted rounded-full">
            <MoreVertical className="h-5 w-5" />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-20 py-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleDeleteList();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 inline mr-2" /> Eliminar lista
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
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
                    className="bg-transparent text-sm w-full focus:outline-none appearance-none"
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
                    className="bg-transparent text-sm w-full focus:outline-none appearance-none disabled:opacity-50"
                    disabled={!list.category}
                  >
                    <option value="">Subcategoría</option>
                    {list.category && getSubcategories(categories.find(c => c.nombre === list.category)?.id || '').map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
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
                    className="bg-transparent text-sm w-full focus:outline-none appearance-none"
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
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Totals Summary */}
        <div className="flex justify-between items-center px-2">
          <p className="text-xs text-muted-foreground">Total Estimado</p>
          <p className={`font-bold ${list.budget && totalEstimated > list.budget ? 'text-destructive' : 'text-primary'}`}>
            {getCurrencySymbol(list.currency || 'PEN')} {totalEstimated.toFixed(2)}
          </p>
        </div>

        {/* Smart Note Input */}
        <SmartNoteInput listId={list.id} onItemsAdded={loadList} />

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
              >
                {item.checked ? <CheckSquare className="h-6 w-6" /> : <Square className="h-6 w-6" />}
              </button>
              
              <div 
                className="flex-1 min-w-0"
                onClick={() => {
                  setEditingItem(item);
                  setShowItemForm(true);
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
        <button
          onClick={() => {
            setEditingItem(null);
            setShowItemForm(true);
          }}
          className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" /> Agregar item manualmente
        </button>

        {/* Save as Expense Button (FAB) */}
        <div className="fixed bottom-24 right-4 z-50">
          <button
            onClick={handleSaveAsExpense}
            className="h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
            title={`Guardar como Gasto (S/ ${totalChecked.toFixed(2)})`}
          >
            <Receipt className="h-6 w-6" />
          </button>
        </div>
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
    </div>
  );
}
