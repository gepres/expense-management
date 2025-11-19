import { useState, useEffect } from 'react';
import { ConfigService, type PaymentMethod } from '../../services/config';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';

export default function MetodosPagoConfig() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Form states
  const [methodId, setMethodId] = useState('');
  const [methodName, setMethodName] = useState('');
  const [methodIcon, setMethodIcon] = useState('');
  const [methodDesc, setMethodDesc] = useState('');

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const data = await ConfigService.getPaymentMethods();
      setMethods(data);
    } catch {
      toast.error('Error al cargar métodos de pago');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (method?: PaymentMethod) => {
    if (method) {
      setEditingMethod(method);
      setMethodId(method.id);
      setMethodName(method.nombre);
      setMethodIcon(method.icono || '');
      setMethodDesc(method.descripcion || '');
    } else {
      setEditingMethod(null);
      setMethodId('');
      setMethodName('');
      setMethodIcon('');
      setMethodDesc('');
    }
    setIsModalOpen(true);
    setShowEmojiPicker(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
    setShowEmojiPicker(false);
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setMethodId(value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodName.trim()) return;
    if (!editingMethod && !methodId.trim()) {
      toast.error('El ID es obligatorio para nuevos métodos');
      return;
    }

    try {
      if (editingMethod) {
        await ConfigService.updatePaymentMethod(editingMethod.id, {
          nombre: methodName,
          icono: methodIcon,
          descripcion: methodDesc
        });
        toast.success('Método de pago actualizado');
      } else {
        await ConfigService.createPaymentMethod({
          id: methodId,
          nombre: methodName,
          icono: methodIcon,
          descripcion: methodDesc
        });
        toast.success('Método de pago creado');
      }
      loadMethods();
      closeModal();
    } catch {
      toast.error('Error al guardar método de pago');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este método de pago?')) return;

    try {
      await ConfigService.deletePaymentMethod(id);
      toast.success('Método de pago eliminado');
      loadMethods();
    } catch {
      toast.error('Error al eliminar método de pago');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Método
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="p-4 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {method.icono || '💳'}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{method.nombre}</h3>
                  <p className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded inline-block">
                    {method.id}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openModal(method)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {method.descripcion && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {method.descripcion}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-xl shadow-xl border border-border">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
              </h2>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID (Identificador único)</label>
                <input
                  type="text"
                  value={methodId}
                  onChange={handleIdChange}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background disabled:opacity-50"
                  placeholder="Ej: efectivo"
                  required
                  disabled={!!editingMethod}
                />
                <p className="text-xs text-muted-foreground">Solo minúsculas, números y guiones bajos.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  value={methodName}
                  onChange={(e) => setMethodName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background"
                  placeholder="Ej: Efectivo"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Icono</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-full px-3 py-2 text-left rounded-md border border-border bg-background flex items-center gap-2"
                  >
                    <span className="text-xl">{methodIcon || '💳'}</span>
                    <span className="text-muted-foreground text-sm">Seleccionar icono</span>
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute z-20 top-full left-0 mt-2">
                      <div className="fixed inset-0 z-10" onClick={() => setShowEmojiPicker(false)} />
                      <div className="relative z-20">
                        <EmojiPicker
                          theme={Theme.AUTO}
                          onEmojiClick={(emojiData) => {
                            setMethodIcon(emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  value={methodDesc}
                  onChange={(e) => setMethodDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background min-h-[80px]"
                  placeholder="Descripción opcional..."
                />
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
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
