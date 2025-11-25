/**
 * Modal para crear o editar un grupo de gastos compartidos
 */

import { useState, useEffect } from 'react';
import { SharedService } from '@services/shared';
import { useConfig } from '@context/ConfigContext';
import type { SharedExpenseGroup, CreateSharedGroupDto } from '@app-types/shared';
import { X, Type, AlignLeft, Target, Coins, Smile, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface Props {
  onClose: () => void;
  onSaved: (group: SharedExpenseGroup) => void;
  initialData?: SharedExpenseGroup;
  isEditing?: boolean;
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

export default function CreateSharedGroupModal({ onClose, onSaved, initialData, isEditing = false }: Props) {
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

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        icon: initialData.icon || '👥',
        color: initialData.color || '#6366f1',
        targetAmount: initialData.targetAmount,
        currency: initialData.currency,
      });
    }
  }, [initialData, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      let savedGroup: SharedExpenseGroup;
      
      if (isEditing && initialData) {
        savedGroup = await SharedService.updateGroup(initialData.id, {
          ...formData,
          targetAmount: formData.targetAmount || undefined,
        });
        toast.success('Grupo actualizado exitosamente');
      } else {
        savedGroup = await SharedService.createGroup({
          ...formData,
          targetAmount: formData.targetAmount || undefined,
        });
        toast.success('Grupo creado exitosamente');
      }
      
      onSaved(savedGroup);
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error(isEditing ? 'Error al actualizar el grupo' : 'Error al crear el grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl border border-border max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-card z-10 px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">{isEditing ? 'Editar Grupo' : 'Nuevo Grupo'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form - iOS Style */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Nombre del Grupo */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <Type className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">
                  Nombre del Grupo <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Viaje a la playa"
                  className="bg-transparent text-sm w-full focus:outline-none font-medium"
                  maxLength={50}
                  autoFocus={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3 flex items-start gap-3">
              <div className="p-1.5 bg-gray-500/10 rounded-lg text-gray-600 dark:text-gray-400 mt-1">
                <AlignLeft className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ej: Gastos para la cena de navidad"
                  rows={2}
                  maxLength={200}
                  className="bg-transparent text-sm w-full focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Icono del Grupo */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400">
                  <Smile className="h-4 w-4" />
                </div>
                <label className="text-[10px] text-muted-foreground">
                  Icono del Grupo
                </label>
              </div>

              {/* Icon Selector */}
              <div className="flex gap-2 mb-3">
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

                {/* Quick Icons */}
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground mb-2">Iconos rápidos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-base transition-all ${
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
              </div>
            </div>
          </div>

          {/* Color del Grupo */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                  <Palette className="h-4 w-4" />
                </div>
                <label className="text-[10px] text-muted-foreground">
                  Color del Grupo
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-9 h-9 rounded-full transition-all ${
                      formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Meta y Moneda */}
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                <Target className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">Meta (opcional)</label>
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
                  className="bg-transparent text-sm w-full focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400">
                <Coins className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">
                  Moneda <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="bg-transparent text-sm w-full focus:outline-none font-medium appearance-none disabled:opacity-50"
                  disabled={isEditing}
                >
                  {currencies.map((currency) => (
                    <option key={currency.id} value={currency.codigoISO}>
                      {currency.simbolo} {currency.nombre}
                    </option>
                  ))}
                </select>
                {isEditing && (
                  <p className="text-[9px] text-muted-foreground mt-1">
                    La moneda no se puede cambiar
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? (isEditing ? 'Guardando...' : 'Creando...') : (isEditing ? 'Guardar Cambios' : 'Crear Grupo')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
