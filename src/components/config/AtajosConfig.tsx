import { useState, useEffect } from 'react';
import { ConfigService, type Shortcut } from '../../services/config';
import { useConfig } from '@context/ConfigContext';
import { Plus, Edit2, Trash2, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AtajosConfig() {
  const {
    categories,
    paymentMethods,
    currencies,
    getCategoryLabel,
    getPaymentMethodLabel,
    getSubcategories
  } = useConfig();

  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [monto, setMonto] = useState('');
  const [moneda, setMoneda] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [recurrente, setRecurrente] = useState(false);

  useEffect(() => {
    loadShortcuts();
  }, []);

  const loadShortcuts = async () => {
    try {
      const data = await ConfigService.getShortcuts();
      setShortcuts(data);
    } catch {
      toast.error('Error al cargar atajos');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (shortcut?: Shortcut) => {
    if (shortcut) {
      setEditingShortcut(shortcut);
      setNombre(shortcut.nombre);
      setCategoria(shortcut.categoria || '');
      setSubcategoria(shortcut.subcategoria || '');
      setMonto(shortcut.monto?.toString() || '');
      setMoneda(shortcut.moneda || '');
      setMetodoPago(shortcut.metodoPago || '');
      setDescripcion(shortcut.descripcion || '');
      setTagsInput(shortcut.tags?.join(', ') || '');
      setRecurrente(shortcut.recurrente || false);
    } else {
      setEditingShortcut(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingShortcut(null);
    resetForm();
  };

  const resetForm = () => {
    setNombre('');
    setCategoria('');
    setSubcategoria('');
    setMonto('');
    setMoneda('');
    setMetodoPago('');
    setDescripcion('');
    setTagsInput('');
    setRecurrente(false);
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 15);
    setNombre(value);
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoria(e.target.value);
    setSubcategoria(''); // Reset subcategoria when categoria changes
  };

  const validateForm = (): boolean => {
    // Nombre es obligatorio
    if (!nombre.trim()) {
      toast.error('El nombre del botón es obligatorio');
      return false;
    }

    // Al menos un campo adicional debe estar completo
    const hasCategoria = !!categoria;
    const hasSubcategoria = !!subcategoria;
    const hasMonto = !!monto && parseFloat(monto) > 0;
    const hasMoneda = !!moneda;
    const hasMetodoPago = !!metodoPago;
    const hasDescripcion = !!descripcion.trim();
    const hasTags = !!tagsInput.trim();
    const hasRecurrente = recurrente;

    const filledFields = [
      hasCategoria,
      hasSubcategoria,
      hasMonto,
      hasMoneda,
      hasMetodoPago,
      hasDescripcion,
      hasTags,
      hasRecurrente
    ].filter(Boolean).length;

    if (filledFields < 1) {
      toast.error('Debes completar al menos un campo adicional');
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
        nombre: nombre.trim(),
      };

      // Solo agregar campos que tienen valor
      if (categoria) data.categoria = categoria;
      if (subcategoria) data.subcategoria = subcategoria;
      if (monto) data.monto = parseFloat(monto);
      if (moneda) data.moneda = moneda;
      if (metodoPago) data.metodoPago = metodoPago;
      if (descripcion.trim()) data.descripcion = descripcion.trim();
      if (tags.length > 0) data.tags = tags;
      if (recurrente) data.recurrente = true;

      if (editingShortcut) {
        await ConfigService.updateShortcut(editingShortcut.id, data);
        toast.success('Atajo actualizado');
      } else {
        await ConfigService.createShortcut(data);
        toast.success('Atajo creado');
      }

      loadShortcuts();
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
      loadShortcuts();
    } catch {
      toast.error('Error al eliminar atajo');
    }
  };

  // Get subcategories for selected category
  const subcategorias = categoria ? getSubcategories(categoria) : [];

  if (loading) return <div>Cargando...</div>;

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
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{shortcut.nombre}</h3>
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
                {shortcut.categoria && (
                  <p>Categoría: <span className="text-foreground">{getCategoryLabel(shortcut.categoria)}</span></p>
                )}
                {shortcut.subcategoria && (
                  <p>Subcategoría: <span className="text-foreground">{shortcut.subcategoria}</span></p>
                )}
                {shortcut.monto && (
                  <p>Monto: <span className="text-foreground font-medium">{shortcut.moneda || ''} {shortcut.monto}</span></p>
                )}
                {shortcut.metodoPago && (
                  <p>Método: <span className="text-foreground">{getPaymentMethodLabel(shortcut.metodoPago)}</span></p>
                )}
                {shortcut.descripcion && (
                  <p className="truncate">Desc: <span className="text-foreground">{shortcut.descripcion}</span></p>
                )}
                {shortcut.recurrente && (
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
              {/* Nombre del botón */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nombre del Botón <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={handleNombreChange}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background"
                  placeholder="Ej: Pollería"
                  required
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  {nombre.length}/15 caracteres
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Completa al menos uno de los siguientes campos:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Categoría */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <select
                      value={categoria}
                      onChange={handleCategoriaChange}
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
                      value={subcategoria}
                      onChange={(e) => setSubcategoria(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                      disabled={!categoria}
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
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
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
                      value={moneda}
                      onChange={(e) => setMoneda(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background"
                    >
                      <option value="">Sin definir</option>
                      {currencies.map((currency) => (
                        <option key={currency.id} value={currency.codigoISO}>
                          {currency.simbolo} {currency.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Método de Pago */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Método de Pago</label>
                    <select
                      value={metodoPago}
                      onChange={(e) => setMetodoPago(e.target.value)}
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
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
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
                      id="recurrente"
                      checked={recurrente}
                      onChange={(e) => setRecurrente(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="recurrente" className="text-sm font-medium cursor-pointer">
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
