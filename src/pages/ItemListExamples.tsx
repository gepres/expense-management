import { ItemList } from "@components/common/ItemList";
import { ShoppingCart, UtensilsCrossed, Car, CreditCard, Calendar, Trash2 } from "lucide-react";
import { IconButton } from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Card } from "@components/common/Card";

export function ItemListExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">ItemList Component</h2>
        <p className="text-muted-foreground">
          Componente de lista optimizado para móviles, estilo tarjeta iOS.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Item */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Básico</h3>
          <CodePreview
            code={`<ItemList
  icon={<ShoppingCart className="h-5 w-5" />}
  title="Supermercado Metro"
  subtitle="Compras semanales"
  amount="S/ 150.00"
  onClick={() => {}}
/>`}
          >
            <div className="max-w-md mx-auto">
              <ItemList
                icon={<ShoppingCart className="h-5 w-5" />}
                title="Supermercado Metro"
                subtitle="Compras semanales"
                amount="S/ 150.00"
                onClick={() => alert('Item clickeado')}
              />
            </div>
          </CodePreview>
        </div>

        {/* With Tags and Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Con Tags y Acciones</h3>
          <CodePreview
            code={`<ItemList
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
      <span className="badge-secondary">Alimentación</span>
      <span className="badge-muted">Tarjeta</span>
    </>
  }
  actions={
    <IconButton
      icon={Trash2}
      size="sm"
      variant="ghost"
      className="text-destructive"
    />
  }
/>`}
          >
            <div className="max-w-md mx-auto">
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
          </CodePreview>
        </div>

        {/* Transport Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Con Monto Destacado</h3>
          <CodePreview
            code={`<ItemList
  icon={<Car className="h-5 w-5" />}
  title="Uber a Oficina"
  amount="S/ 18.50"
  amountClassName="text-destructive"
  tags={<span>Transporte</span>}
/>`}
          >
            <div className="max-w-md mx-auto">
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
          </CodePreview>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Título principal del item.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">subtitle</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>Subtítulo o metadatos (fecha, hora).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">amount</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Monto a mostrar en el lado derecho.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>Icono principal.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">tags</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>Etiquetas o badges.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">actions</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>Botones de acción adicionales.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onClick</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell>Callback al hacer click en el item.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
