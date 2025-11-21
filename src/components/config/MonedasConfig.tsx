import { useState, useEffect } from 'react';
import { ConfigService, type Currency } from '../../services/config';
import { useConfig } from '@context/ConfigContext';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MonedasConfig() {
  const { reloadCurrencies } = useConfig();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [newCode, setNewCode] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  
  // Edit states
  const [editCode, setEditCode] = useState('');
  const [editSymbol, setEditSymbol] = useState('');
  const [editName, setEditName] = useState('');

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newSymbol.trim() || !newName.trim()) return;

    try {
      await ConfigService.createCurrency({
        codigoISO: newCode,
        simbolo: newSymbol,
        nombre: newName
      });
      toast.success('Moneda creada');
      setNewCode('');
      setNewSymbol('');
      setNewName('');
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

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta moneda?')) return;

    try {
      await ConfigService.deleteCurrency(id);
      toast.success('Moneda eliminada');
      loadCurrencies();
    } catch {
      toast.error('Error al eliminar moneda');
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="Código (ej: USD)"
          className="px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Símbolo (ej: $)"
          className="px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre"
          className="px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </form>

      <div className="grid gap-4">
        {currencies.map((currency) => (
          <div
            key={currency.id}
            className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
          >
            {editingId === currency.id ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  className="px-2 py-1 rounded border border-border bg-background"
                />
                <input
                  type="text"
                  value={editSymbol}
                  onChange={(e) => setEditSymbol(e.target.value)}
                  className="px-2 py-1 rounded border border-border bg-background"
                />
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-2 py-1 rounded border border-border bg-background"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleUpdate(currency.id)}
                    className="p-2 text-green-500 hover:bg-green-500/10 rounded"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-4 items-center text-foreground">
                  <span className="font-bold w-16">{currency.codigoISO}</span>
                  <span className="text-muted-foreground w-8">{currency.simbolo}</span>
                  <span className="flex-1 max-[600px]:w-14 max-[600px]:truncate">{currency.nombre}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(currency.id);
                      setEditCode(currency.codigoISO);
                      setEditSymbol(currency.simbolo);
                      setEditName(currency.nombre);
                    }}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(currency.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
