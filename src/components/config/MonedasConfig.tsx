import { useState, useEffect } from 'react';
import { ConfigService, type Currency } from '../../services/config';
import { useConfig } from '@context/ConfigContext';
import { Plus, Edit2, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal, { ModalFooterActions } from '@components/common/Modal';
import LoadingScreen from '@components/common/LoadingScreen';

export default function MonedasConfig() {
  const { reloadCurrencies } = useConfig();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newCode, setNewCode] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');

  // Edit states
  const [editCode, setEditCode] = useState('');
  const [editSymbol, setEditSymbol] = useState('');
  const [editName, setEditName] = useState('');

  // Delete confirmation state
  const [currencyToDelete, setCurrencyToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = async () => {
    try {
      const data = await ConfigService.getCurrencies();
      setCurrencies(data);
      // Sincronizar con el contexto global
      await reloadCurrencies();
    } catch {
      toast.error('Error al cargar monedas');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setNewCode('');
    setNewSymbol('');
    setNewName('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNewCode('');
    setNewSymbol('');
    setNewName('');
  };

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCode.trim() || !newSymbol.trim() || !newName.trim()) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    try {
      await ConfigService.createCurrency({
        id: newCode,
        codigoISO: newCode,
        simbolo: newSymbol,
        nombre: newName,
        icono: ''
      });
      toast.success('Moneda creada');
      closeModal();
      loadCurrencies();
    } catch {
      toast.error('Error al crear moneda');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editCode.trim() || !editSymbol.trim() || !editName.trim()) return;

    try {
      await ConfigService.updateCurrency(id, {
        codigoISO: editCode,
        simbolo: editSymbol,
        nombre: editName
      });
      toast.success('Moneda actualizada');
      setEditingId(null);
      loadCurrencies();
    } catch {
      toast.error('Error al actualizar moneda');
    }
  };

  const handleDelete = async () => {
    if (!currencyToDelete) return;

    try {
      await ConfigService.deleteCurrency(currencyToDelete);
      toast.success('Moneda eliminada');
      setCurrencyToDelete(null);
      loadCurrencies();
    } catch {
      toast.error('Error al eliminar moneda');
    }
  };

  if (loading) return <LoadingScreen message="Cargando monedas..." />;

  return (
    <div className="space-y-6">
      {/* Botón para abrir modal */}
      <div className="flex justify-end">
        <button
          onClick={openModal}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Moneda
        </button>
      </div>

      {/* Lista de monedas - iOS Style Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground px-1">Monedas Configuradas</h3>
        {currencies.map((currency) => (
          <div
            key={currency.id}
            className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
          >
            {editingId === currency.id ? (
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Código ISO</label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base border-b border-border/50 pb-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Símbolo</label>
                  <input
                    type="text"
                    value={editSymbol}
                    onChange={(e) => setEditSymbol(e.target.value)}
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base border-b border-border/50 pb-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nombre</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base border-b border-border/50 pb-2"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdate(currency.id)}
                    className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 font-medium"
                  >
                    <Save className="h-4 w-4" />
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 text-muted-foreground hover:text-foreground rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4">
                <div className="flex gap-4 items-center flex-1">
                  <span className="font-bold text-base w-16">{currency.codigoISO}</span>
                  <span className="text-2xl w-10">{currency.simbolo}</span>
                  <span className="flex-1 text-sm text-muted-foreground truncate w-[75px]">{currency.nombre}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingId(currency.id);
                      setEditCode(currency.codigoISO);
                      setEditSymbol(currency.simbolo);
                      setEditName(currency.nombre);
                    }}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrencyToDelete(currency.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Creación/Edición */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Nueva Moneda"
        size="md"
        footer={
          <ModalFooterActions
            onCancel={closeModal}
            onConfirm={handleCreate}
            confirmText="Crear Moneda"
          />
        }
      >
        <form onSubmit={handleCreate} className="space-y-6">
          {/* iOS Style Card */}
          <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border/50">
            {/* Código ISO */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Código ISO <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                placeholder="Ej: USD"
                required
                maxLength={3}
              />
              <p className="text-xs text-muted-foreground mt-1">3 caracteres, mayúsculas</p>
            </div>

            {/* Símbolo */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Símbolo <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                placeholder="Ej: $"
                required
                maxLength={3}
              />
            </div>

            {/* Nombre */}
            <div className="p-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Nombre <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                placeholder="Ej: Dólar Estadounidense"
                required
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!currencyToDelete}
        onClose={() => setCurrencyToDelete(null)}
        title="¿Eliminar moneda?"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setCurrencyToDelete(null)}
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
              Esta acción no se puede deshacer. La moneda será eliminada permanentemente.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
