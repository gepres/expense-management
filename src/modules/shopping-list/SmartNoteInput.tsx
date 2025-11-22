import { useState } from 'react';
import { ShoppingListService } from '../../services/shopping-list';
import { Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  listId: string;
  onItemsAdded: () => void;
}

export default function SmartNoteInput({ listId, onItemsAdded }: Props) {
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const parseAndAdd = () => {
    if (!text.trim()) return;

    const lines = text.split('\n').filter(line => line.trim());
    let addedCount = 0;

    lines.forEach(line => {
      // Regex strategies
      // 1. "item - price x quantity" or "item - price"
      // Matches: "oregano-2.20x2", "bolsas - 11.00", "atun - 4.50x2"
      const matchPriceQty = line.match(/^(.*?)(?:[-–\s]+)(\d+(?:\.\d{1,2})?)(?:[xX*](\d+))?$/);
      
      // 2. "item, price x quantity"
      // Matches: "atun, 4x2"
      const matchComma = line.match(/^(.*?)(?:[,]+)(\d+(?:\.\d{1,2})?)(?:[xX*](\d+))?$/);

      const match = matchPriceQty || matchComma;

      if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2]);
        const quantity = match[3] ? parseInt(match[3]) : 1;
        
        // If quantity > 1, the price is usually unit price, so total amount = price * quantity
        // OR the user might mean "total price x quantity"?
        // Usually "2.20x2" means 2.20 each, 2 items.
        // So amount = price * quantity.
        
        const amount = price * quantity;

        ShoppingListService.addItem(listId, {
          name,
          amount,
          quantity,
          unitPrice: price,
        });
        addedCount++;
      } else {
        // Fallback: just add as name
        ShoppingListService.addItem(listId, {
          name: line.trim(),
        });
        addedCount++;
      }
    });

    toast.success(`${addedCount} items agregados`);
    setText('');
    setIsExpanded(false);
    onItemsAdded();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
      <div 
        className="flex items-center gap-2 mb-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-primary">Nota Inteligente</h3>
      </div>
      
      {isExpanded ? (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Escribe tu lista aquí...
Ejemplos:
- bolsas - 11.00
- oregano-2.20x2
- atun, 4x2`}
            className="w-full h-32 p-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              onClick={parseAndAdd}
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2"
            >
              Procesar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <p 
          className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          Toca para escribir una lista rápida y la IA la organizará por ti.
        </p>
      )}
    </div>
  );
}
