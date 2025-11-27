import { useState } from 'react';
import { ConfigService, type Shortcut } from '../../services/config';
import { useConfig } from '@context/ConfigContext';
import { Plus, Edit2, Trash2, Zap, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import Modal, { ModalFooterActions } from '@components/common/Modal';
import LoadingScreen from '../common/LoadingScreen';

export default function AtajosConfig() {
  const {
    categories,
    paymentMethods,
    currencies,
    shortcuts,
    getCategoryLabel,
    getPaymentMethodLabel,
    getSubcategories,
    reloadShortcuts,
    loadingShortcuts,
  } = useConfig();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [saving, setSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [shortcutToDelete, setShortcutToDelete] = useState<string | null>(null);

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

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();

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

  const handleDelete = async () => {
    if (!shortcutToDelete) return;

    try {
      await ConfigService.deleteShortcut(shortcutToDelete);
      toast.success('Atajo eliminado');
      setShortcutToDelete(null);
      await reloadShortcuts();
    } catch {
      toast.error('Error al eliminar atajo');
    }
  };

  // Get subcategories for selected category
  const subcategorias = category ? getSubcategories(category) : [];
  
  if (loadingShortcuts) return <LoadingScreen message="Cargando atajos..." />;

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
                    onClick={() => setShortcutToDelete(shortcut.id)}
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
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingShortcut ? 'Editar Atajo' : 'Nuevo Atajo'}
        size="lg"
        footer={
          <ModalFooterActions
            onCancel={closeModal}
            onConfirm={handleSave}
            confirmText={saving ? 'Guardando...' : 'Guardar'}
            disabled={saving}
          />
        }
      >
        <form onSubmit={handleSave} className="space-y-6">
          {/* Nombre del botón e Icono - iOS Style Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Nombre del Botón <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base p-0"
                  placeholder="Ej: Pollería"
                  required
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {name.length}/15 caracteres
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icono</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-full bg-transparent border-0 focus:outline-none text-left flex items-center gap-2 h-[42px]"
                  >
                    <span className="text-3xl">{icon || '😊'}</span>
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
          </div>

          {/* Instrucción */}
          <p className="text-sm text-muted-foreground px-1">
            Completa al menos 2 de los siguientes campos:
          </p>

          {/* Campos opcionales - iOS Style Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border/50">
            {/* Categoría */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoría</label>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
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
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subcategoría</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                disabled={!category}
              >
                <option value="">Sin definir</option>
                {subcategorias.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Monto */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Monto</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            {/* Moneda */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
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
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Método de Pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
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
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                placeholder="Descripción predeterminada..."
              />
            </div>

            {/* Tags */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Etiquetas</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                placeholder="trabajo, urgente (separadas por comas)"
              />
            </div>

            {/* Recurrente */}
            <div className="p-4 flex items-center gap-3">
              <label htmlFor="isRecurring" className="flex-1 text-sm font-medium cursor-pointer">
                Gasto recurrente
              </label>
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!shortcutToDelete}
        onClose={() => setShortcutToDelete(null)}
        title="¿Eliminar atajo?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setShortcutToDelete(null)}
            onConfirm={handleDelete}
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
              Esta acción no se puede deshacer. El atajo será eliminado permanentemente.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
