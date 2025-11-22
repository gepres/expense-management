import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingListService } from '../../services/shopping-list';
import type { ShoppingList } from '../../types/shopping-list';
import { Plus, ShoppingCart, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ShoppingListView() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    const data = ShoppingListService.getLists();
    // Sort by date desc
    setLists(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  const handleCreate = () => {
    const name = `Lista de compras ${format(new Date(), 'dd/MM')}`;
    const newList = ShoppingListService.createList({ name });
    navigate(`/compras/${newList.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Listas de Compras</h1>
          <p className="text-muted-foreground">Gestiona tus compras del mercado</p>
        </div>
        <button
          onClick={handleCreate}
          className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">No tienes listas</p>
          <p className="text-sm">Crea una nueva lista para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => {
            const itemCount = list.items.length;
            const checkedCount = list.items.filter(i => i.checked).length;
            const progress = itemCount > 0 ? (checkedCount / itemCount) * 100 : 0;

            return (
              <button
                key={list.id}
                onClick={() => navigate(`/compras/${list.id}`)}
                className="w-full bg-card border border-border rounded-xl p-4 text-left hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {list.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(list.createdAt), "d 'de' MMMM", { locale: es })}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{checkedCount} de {itemCount} items</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
