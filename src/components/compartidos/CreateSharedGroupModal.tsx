/**
 * Modal para crear un nuevo grupo de gastos compartidos
 */

import { useState } from 'react';
import { SharedService } from '@services/shared';
import { useConfig } from '@context/ConfigContext';
import type { SharedExpenseGroup, CreateSharedGroupDto } from '@app-types/shared';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface Props {
  onClose: () => void;
  onCreated: (group: SharedExpenseGroup) => void;
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6b7280', // Gray
];

const PRESET_ICONS = ['👥', '🎄', '✈️', '🏠', '🎉', '🍽️', '💒', '🎓', '⚽', '🎁'];

export default function CreateSharedGroupModal({ onClose, onCreated }: Props) {
  const { currencies } = useConfig();

  const [formData, setFormData] = useState<CreateSharedGroupDto>({
    name: '',
    description: '',
    icon: '👥',
    color: '#6366f1',
    targetAmount: undefined,
    currency: 'PEN',
  });

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const newGroup = await SharedService.createGroup({
        ...formData,
        targetAmount: formData.targetAmount || undefined,
      });
      onCreated(newGroup);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Error al crear el grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">Nuevo Grupo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Icon & Name */}
          <div className="flex gap-3">
            {/* Icon Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 border-border hover:border-primary transition-colors"
                style={{ backgroundColor: formData.color + '20' }}
              >
                {formData.icon}
              </button>
              {showEmojiPicker && (
                <div className="absolute z-20 top-full left-0 mt-2">
                  <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                  <div className="relative">
                    <EmojiPicker
                      theme={Theme.AUTO}
                      onEmojiClick={(data) => {
                        setFormData(prev => ({ ...prev, icon: data.emoji }));
                        setShowEmojiPicker(false);
                      }}
                      width={280}
                      height={350}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Name Input */}
            <div className="flex-1">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nombre del grupo"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                maxLength={50}
                autoFocus
              />
            </div>
          </div>

          {/* Quick Icons */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Iconos rápidos
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                    formData.icon === icon
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ej: Gastos para la cena de navidad"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Target Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Meta (opcional)
              </label>
              <input
                type="number"
                value={formData.targetAmount || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  targetAmount: e.target.value ? parseFloat(e.target.value) : undefined
                }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.codigoISO}>
                    {currency.simbolo} {currency.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {loading ? 'Creando...' : 'Crear Grupo'}
          </button>
        </form>
      </div>
    </div>
  );
}
