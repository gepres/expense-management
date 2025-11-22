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
    const errors: string[] = [];

    lines.forEach((line, index) => {
      try {
        // Limpiar la línea de caracteres extraños
        const cleanLine = line.trim().replace(/[–—]/g, '-');
        
        // Regex mejorada que maneja:
        // - Guiones con o sin espacios: "item - precio" o "item-precio"
        // - Dos puntos pegados: "item -:precio"
        // - Espacios antes de x: "precio x cantidad" o "preciox cantidad"
        // - Comas: "item, precio"
        // Captura: nombre (grupo 1), precio (grupo 2), cantidad opcional (grupo 3)
        const match = cleanLine.match(
          /^(.*?)[-–—:,\s]+(\d+(?:[.,]\d{1,2})?)\s*(?:[xX*×]\s*(\d+))?$/
        );

        if (match) {
          const name = match[1].trim();
          // Normalizar precio: cambiar coma por punto si existe
          const priceStr = match[2].replace(',', '.');
          const price = parseFloat(priceStr);
          const quantity = match[3] ? parseInt(match[3]) : 1;
          
          // Validaciones
          if (!name) {
            errors.push(`Línea ${index + 1}: nombre vacío`);
            return;
          }
          
          if (isNaN(price) || price <= 0) {
            errors.push(`Línea ${index + 1}: precio inválido (${match[2]})`);
            return;
          }
          
          if (isNaN(quantity) || quantity <= 0) {
            errors.push(`Línea ${index + 1}: cantidad inválida (${match[3]})`);
            return;
          }

          const amount = price * quantity;

          ShoppingListService.addItem(listId, {
            name,
            amount,
            quantity,
            unitPrice: price,
          });
          addedCount++;
        } else {
          // Fallback: verificar si tiene al menos un nombre válido
          const fallbackName = cleanLine.trim();
          if (fallbackName.length > 0) {
            ShoppingListService.addItem(listId, {
              name: fallbackName,
            });
            addedCount++;
          }
        }
      } catch (error) {
        errors.push(`Línea ${index + 1}: error al procesar`);
      }
    });

    // Mostrar resultados
    if (addedCount > 0) {
      toast.success(`${addedCount} item${addedCount !== 1 ? 's' : ''} agregado${addedCount !== 1 ? 's' : ''}`);
    }
    
    if (errors.length > 0) {
      toast.error(`${errors.length} error${errors.length !== 1 ? 'es' : ''} encontrado${errors.length !== 1 ? 's' : ''}`, {
        duration: 4000,
      });
      console.error('Errores de parsing:', errors);
    }

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
- Bolsas - 11.00
- Orégano - 2.20
- Atún - 3.90 x 2
- Aceite, 6.80`}
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
              className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
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