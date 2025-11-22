import { useState, useEffect } from 'react';
import { ShoppingListService } from '../../services/shopping-list';
import type { ShoppingListItem } from '../../types/shopping-list';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  listId: string;
  initialData: ShoppingListItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ShoppingListItemForm({ listId, initialData, onClose, onSaved }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    quantity: '1',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        amount: initialData.unitPrice ? initialData.unitPrice.toString() : (initialData.amount ? (initialData.amount / (initialData.quantity || 1)).toString() : ''),
        quantity: initialData.quantity ? initialData.quantity.toString() : '1',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const quantity = parseInt(formData.quantity) || 1;
    const unitPrice = parseFloat(formData.amount) || 0;
    const amount = unitPrice * quantity;

    const data = {
      name: formData.name,
      amount: amount > 0 ? amount : undefined,
      quantity: quantity > 1 ? quantity : undefined,
      unitPrice: unitPrice > 0 ? unitPrice : undefined,
    };

    if (initialData) {
      ShoppingListService.updateItem(listId, initialData.id, data);
    } else {
      ShoppingListService.addItem(listId, { ...data });
    }
    onSaved();
  };

  const handleDelete = () => {
    if (!initialData || !confirm('¿Eliminar item?')) return;
    ShoppingListService.deleteItem(listId, initialData.id);
    onSaved();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal/Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-card w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-xl border-t sm:border border-border relative z-10"
        >
          {/* Drag Handle (Mobile Visual) */}
          <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 sm:hidden" />

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">
              {initialData ? 'Editar Item' : 'Nuevo Item'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                placeholder="Ej: Leche"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Precio Unit.</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div className="w-24">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Cantidad</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 pb-safe">
              <button
                type="submit"
                className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold active:scale-95 transition-transform"
              >
                Guardar
              </button>
              {initialData && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-3 bg-destructive/10 text-destructive rounded-xl font-bold active:scale-95 transition-transform"
                >
                  Eliminar
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
