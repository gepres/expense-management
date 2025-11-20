import { useState, useEffect } from 'react';
import { ConfigService, type Shortcut } from '../../services/config';
import { useConfig } from '@context/ConfigContext';
import { Plus, Edit2, Trash2, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';

export default function AtajosConfig() {
  const {
    categories,
    paymentMethods,
    currencies,
    shortcuts,
    getCategoryLabel,
    getPaymentMethodLabel,
    getSubcategories,
    reloadShortcuts
  } = useConfig();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const openModal = (shortcut?: Shortcut) => {
    if (shortcut) {
      setEditingShortcut(shortcut);
      setName(shortcut.name);
      setIcon(shortcut.icon || '');
      setCategory(shortcut.category || '');
      setSubcategory(shortcut.subcategory || '');
      setAmount(shortcut.amount?.toString() || '');
      setCurrency(shortcut.currency || '');
      setPaymentMethod(shortcut.paymentMethod || '');
      setDescription(shortcut.description || '');
      setTagsInput(shortcut.tags?.join(', ') || '');
      setIsRecurring(shortcut.isRecurring || false);
    } else {
      setEditingShortcut(null);
      resetForm();
    }
    setIsModalOpen(true);
    setShowEmojiPicker(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShortcut(null);
    setShowEmojiPicker(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setIcon('');
    setCategory('');
    setSubcategory('');
    setAmount('');
    setCurrency('');
    setPaymentMethod('');
    setDescription('');
    setTagsInput('');
    setIsRecurring(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 15);
    setName(value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubcategory(''); // Reset subcategory when category changes
  };

  const validateForm = (): boolean => {
    // Name es obligatorio
    if (!name.trim()) {
      toast.error('El nombre del botón es obligatorio');
      return false;
    }

    // Al menos 2 campos adicionales deben estar completos
    const hasIcon = !!icon;
    const hasCategory = !!category;
    const hasSubcategory = !!subcategory;
    const hasAmount = !!amount && parseFloat(amount) > 0;
    const hasCurrency = !!currency;
    const hasPaymentMethod = !!paymentMethod;
    const hasDescription = !!description.trim();
    const hasTags = !!tagsInput.trim();
    const hasIsRecurring = isRecurring;

    const filledFields = [
      hasIcon,
      hasCategory,
      hasSubcategory,
      hasAmount,
      hasCurrency,
      hasPaymentMethod,
      hasDescription,
      hasTags,
      hasIsRecurring
    ].filter(Boolean).length;

    if (filledFields < 2) {
      toast.error('Debes completar al menos 2 campos adicionales');
      return false;
    }

    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);

    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const data: any = {
        name: name.trim(),
      };

      // Solo agregar campos que tienen valor
      if (icon) data.icon = icon;
      if (category) data.category = category;
      if (subcategory) data.subcategory = subcategory;
      if (amount) data.amount = parseFloat(amount);
      if (currency) data.currency = currency;
      if (paymentMethod) data.paymentMethod = paymentMethod;
      if (description.trim()) data.description = description.trim();
      if (tags.length > 0) data.tags = tags;
      if (isRecurring) data.isRecurring = true;

      if (editingShortcut) {
        await ConfigService.updateShortcut(editingShortcut.id, data);
        toast.success('Atajo actualizado');
      } else {
        await ConfigService.createShortcut(data);
        toast.success('Atajo creado');
      }

      await reloadShortcuts();
      closeModal();
    } catch {
      toast.error('Error al guardar atajo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este atajo?')) return;

    try {
      await ConfigService.deleteShortcut(id);
      toast.success('Atajo eliminado');
      await reloadShortcuts();
    } catch {
      toast.error('Error al eliminar atajo');
    }
  };

  // Get subcategories for selected category
  const subcategorias = category ? getSubcategories(category) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Atajo
        </button>
      </div>

      {shortcuts.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium text-foreground mb-2">No hay atajos</p>
          <p className="text-sm text-muted-foreground mb-4">
            Crea atajos para agilizar el registro de gastos frecuentes
          </p>
          <button
            onClick={() => openModal()}
            className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Crear mi primer atajo
          </button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.id}
              className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                    {shortcut.icon || <Zap className="h-5 w-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{shortcut.name}</h3>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openModal(shortcut)}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(shortcut.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Preview of shortcut data */}
              <div className="space-y-1 text-xs text-muted-foreground">
                {shortcut.category && (
                  <p>Categoría: <span className="text-foreground">{getCategoryLabel(shortcut.category)}</span></p>
                )}
                {shortcut.subcategory && (
                  <p>Subcategoría: <span className="text-foreground">{shortcut.subcategory}</span></p>
                )}
                {shortcut.amount && (
                  <p>Monto: <span className="text-foreground font-medium">{shortcut.currency || ''} {shortcut.amount}</span></p>
                )}
                {shortcut.paymentMethod && (
                  <p>Método: <span className="text-foreground">{getPaymentMethodLabel(shortcut.paymentMethod)}</span></p>
                )}
                {shortcut.description && (
                  <p className="truncate">Desc: <span className="text-foreground">{shortcut.description}</span></p>
                )}
                {shortcut.isRecurring && (
                  <p className="text-primary font-medium">Recurrente</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-xl shadow-xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
              <h2 className="text-xl font-bold">
                {editingShortcut ? 'Editar Atajo' : 'Nuevo Atajo'}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Nombre del botón e Icono */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium">
                    Nombre del Botón <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    placeholder="Ej: Pollería"
                    required
                    maxLength={15}
                  />
                  <p className="text-xs text-muted-foreground">
                    {name.length}/15 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Icono</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="w-full px-3 py-2 text-left rounded-md border border-border bg-background flex items-center gap-2 h-[42px]"
                    >
                      <span className="text-xl">{icon || '😊'}</span>
                    </button>
                    {showEmojiPicker && (
                      <div className="absolute z-20 top-full right-0 mt-2">
                        <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                        <div className="relative z-20">
                          <EmojiPicker
                            theme={Theme.AUTO}
                            onEmojiClick={(emojiData) => {
                              setIcon(emojiData.emoji);
                              setShowEmojiPicker(false);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Completa al menos 2 de los siguientes campos:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Categoría */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={category}
                      onChange={handleCategoryChange}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    >
                      <option value="">Sin definir</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategoría */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subcategoría</label>
                    <select
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                      disabled={!category}
                    >
                      <option value="">Sin definir</option>
                      {subcategorias.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Monto */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Monto</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {/* Moneda */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Moneda</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    >
                      <option value="">Sin definir</option>
                      {currencies.map((curr) => (
                        <option key={curr.id} value={curr.codigoISO}>
                          {curr.simbolo} {curr.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Método de Pago */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Método de Pago</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    >
                      <option value="">Sin definir</option>
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Descripción</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                      placeholder="Descripción predeterminada..."
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Etiquetas</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                      placeholder="trabajo, urgente (separadas por comas)"
                    />
                  </div>

                  {/* Recurrente */}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium cursor-pointer">
                      Gasto recurrente
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
