import { useState, useEffect } from 'react';
import { ConfigService, type PaymentMethod } from '../../services/config';
import { useConfig } from '@context/ConfigContext';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import Modal, { ModalFooterActions } from '@components/common/Modal';

export default function MetodosPagoConfig() {
  const { reloadPaymentMethods } = useConfig();
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

  // Delete confirmation state
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const data = await ConfigService.getPaymentMethods();
      setMethods(data);
      // Sincronizar con el contexto global
      await reloadPaymentMethods();
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

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
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

  const handleDelete = async () => {
    if (!methodToDelete) return;

    try {
      await ConfigService.deletePaymentMethod(methodToDelete);
      toast.success('Método de pago eliminado');
      setMethodToDelete(null);
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
                  onClick={() => setMethodToDelete(method.id)}
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
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingMethod ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
        size="md"
        footer={
          <ModalFooterActions
            onCancel={closeModal}
            onConfirm={handleSave}
            confirmText="Guardar Cambios"
          />
        }
      >
        <form onSubmit={handleSave} className="space-y-6">
          {/* iOS Style Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border/50">
            {/* ID */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                ID (Identificador único)
              </label>
              <input
                type="text"
                value={methodId}
                onChange={handleIdChange}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base disabled:opacity-50"
                placeholder="Ej: efectivo"
                required
                disabled={!!editingMethod}
              />
              <p className="text-xs text-muted-foreground mt-1">Solo minúsculas, números y guiones bajos.</p>
            </div>

            {/* Nombre */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre</label>
              <input
                type="text"
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                placeholder="Ej: Efectivo"
                required
              />
            </div>

            {/* Icono */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Icono</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="bg-transparent border-0 focus:outline-none text-left flex items-center gap-2"
                >
                  <span className="text-3xl">{methodIcon || '💳'}</span>
                  <span className="text-muted-foreground text-sm">Seleccionar</span>
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

            {/* Descripción */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Descripción</label>
              <textarea
                value={methodDesc}
                onChange={(e) => setMethodDesc(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base resize-none min-h-[60px]"
                placeholder="Descripción opcional..."
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!methodToDelete}
        onClose={() => setMethodToDelete(null)}
        title="¿Eliminar método de pago?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setMethodToDelete(null)}
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
              Esta acción no se puede deshacer. El método de pago será eliminado permanentemente.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
