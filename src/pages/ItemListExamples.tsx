import { ItemList } from "@components/common/ItemList";
import { ShoppingCart, UtensilsCrossed, Car, CreditCard, Calendar, Trash2 } from "lucide-react";
import { IconButton } from "@components/common/Button";

export function ItemListExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">ItemList Component</h2>
        <p className="text-muted-foreground">
          Componente de lista optimizado para móviles, estilo tarjeta iOS.
        </p>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Basic Item */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Básico</h3>
          <ItemList
            icon={<ShoppingCart className="h-5 w-5" />}
            title="Supermercado Metro"
            subtitle="Compras semanales"
            amount="S/ 150.00"
            onClick={() => alert('Item clickeado')}
          />
        </div>

        {/* With Tags and Actions */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Con Tags y Acciones</h3>
          <ItemList
            icon={<UtensilsCrossed className="h-5 w-5" />}
            title="Almuerzo Ejecutivo"
            subtitle={
              <>
                <Calendar className="h-3 w-3" />
                <span>Hoy, 1:30 PM</span>
              </>
            }
            amount="S/ 25.00"
            tags={
              <>
                <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-secondary/80 text-secondary-foreground backdrop-blur-sm">
                  Alimentación
                </span>
                <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  Tarjeta
                </span>
              </>
            }
            actions={
              <IconButton
                icon={Trash2}
                size="sm"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10"
                label="Eliminar"
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Eliminar");
                }}
              />
            }
            onClick={() => alert('Item clickeado')}
          />
        </div>

        {/* Transport Example */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Con Monto Destacado</h3>
          <ItemList
            icon={<Car className="h-5 w-5" />}
            title="Uber a Oficina"
            subtitle={
              <>
                <Calendar className="h-3 w-3" />
                <span>Hace 2 horas</span>
              </>
            }
            amount="S/ 18.50"
            amountClassName="text-destructive"
            tags={
              <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-secondary/80 text-secondary-foreground backdrop-blur-sm">
                Transporte
              </span>
            }
          />
        </div>

        {/* Multiple Items Example */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Lista de Items</h3>
          <div className="space-y-3">
            <ItemList
              icon={<ShoppingCart className="h-5 w-5" />}
              title="Farmacia"
              amount="S/ 45.00"
              tags={
                <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground">
                  Salud
                </span>
              }
            />
            <ItemList
              icon={<UtensilsCrossed className="h-5 w-5" />}
              title="Café Starbucks"
              amount="S/ 12.50"
              tags={
                <span className="text-[10px] font-medium px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground">
                  Alimentación
                </span>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
