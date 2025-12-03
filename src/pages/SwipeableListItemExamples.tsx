import { SwipeableListItem } from "@components/common/SwipeableListItem";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Edit2, Trash2, Archive, Star, Check } from "lucide-react";

export function SwipeableListItemExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">SwipeableListItem Component</h2>
        <p className="text-muted-foreground">
          Item de lista con acciones al deslizar (swipe). Perfecto para listas de gastos, tareas, emails, etc.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. Acciones a la Derecha</h3>
          <p className="text-sm text-muted-foreground">
            Desliza hacia la izquierda para revelar las acciones.
          </p>
          <CodePreview
            code={`<SwipeableListItem
  rightActions={[
    { 
      label: "Editar", 
      icon: Edit2, 
      color: "primary", 
      onClick: () => console.log("Edit") 
    },
    { 
      label: "Eliminar", 
      icon: Trash2, 
      color: "error", 
      onClick: () => console.log("Delete") 
    }
  ]}
>
  <div className="p-4">
    Contenido del item
  </div>
</SwipeableListItem>`}
          >
            <div className="space-y-2">
              <SwipeableListItem
                rightActions={[
                  { label: "Editar", icon: Edit2, color: "primary", onClick: () => alert("Editar gasto") },
                  { label: "Eliminar", icon: Trash2, color: "error", onClick: () => alert("Eliminar gasto") },
                ]}
              >
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="font-medium">Supermercado</p>
                  <p className="text-sm text-muted-foreground">S/ 150.00 • Hoy</p>
                </div>
              </SwipeableListItem>

              <SwipeableListItem
                rightActions={[
                  { label: "Editar", icon: Edit2, color: "primary", onClick: () => alert("Editar") },
                  { label: "Eliminar", icon: Trash2, color: "error", onClick: () => alert("Eliminar") },
                ]}
              >
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="font-medium">Transporte</p>
                  <p className="text-sm text-muted-foreground">S/ 25.00 • Ayer</p>
                </div>
              </SwipeableListItem>
            </div>
          </CodePreview>
        </div>

        {/* Left Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Acciones a la Izquierda</h3>
          <p className="text-sm text-muted-foreground">
            Desliza hacia la derecha para revelar las acciones.
          </p>
          <CodePreview
            code={`<SwipeableListItem
  leftActions={[
    { 
      label: "Marcar", 
      icon: Check, 
      color: "success", 
      onClick: () => console.log("Mark") 
    }
  ]}
>
  ...
</SwipeableListItem>`}
          >
            <SwipeableListItem
              leftActions={[
                { label: "Completar", icon: Check, color: "success", onClick: () => alert("Completado") },
              ]}
            >
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="font-medium">Pagar factura de luz</p>
                <p className="text-sm text-muted-foreground">Pendiente</p>
              </div>
            </SwipeableListItem>
          </CodePreview>
        </div>

        {/* Both Sides */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Acciones en Ambos Lados</h3>
          <CodePreview
            code={`<SwipeableListItem
  leftActions={[
    { label: "Favorito", icon: Star, color: "warning", onClick: ... }
  ]}
  rightActions={[
    { label: "Archivar", icon: Archive, color: "primary", onClick: ... },
    { label: "Eliminar", icon: Trash2, color: "error", onClick: ... }
  ]}
>
  ...
</SwipeableListItem>`}
          >
            <SwipeableListItem
              leftActions={[
                { label: "Favorito", icon: Star, color: "warning", onClick: () => alert("Añadido a favoritos") },
              ]}
              rightActions={[
                { label: "Archivar", icon: Archive, color: "primary", onClick: () => alert("Archivado") },
                { label: "Eliminar", icon: Trash2, color: "error", onClick: () => alert("Eliminado") },
              ]}
            >
              <div className="p-4 bg-card border border-border rounded-lg">
                <p className="font-medium">Desliza en ambas direcciones</p>
                <p className="text-sm text-muted-foreground">← Favorito | Archivar / Eliminar →</p>
              </div>
            </SwipeableListItem>
          </CodePreview>
        </div>

        {/* Color Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Variantes de Color</h3>
          <CodePreview
            code={`// Colores disponibles:
color: "primary"   // Azul
color: "success"   // Verde
color: "warning"   // Amarillo
color: "error"     // Rojo`}
          >
            <div className="space-y-2">
              <SwipeableListItem
                rightActions={[
                  { label: "Primary", color: "primary", onClick: () => {} },
                ]}
              >
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="text-sm">Desliza para ver color Primary (azul)</p>
                </div>
              </SwipeableListItem>

              <SwipeableListItem
                rightActions={[
                  { label: "Success", color: "success", onClick: () => {} },
                ]}
              >
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="text-sm">Desliza para ver color Success (verde)</p>
                </div>
              </SwipeableListItem>

              <SwipeableListItem
                rightActions={[
                  { label: "Warning", color: "warning", onClick: () => {} },
                ]}
              >
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="text-sm">Desliza para ver color Warning (amarillo)</p>
                </div>
              </SwipeableListItem>

              <SwipeableListItem
                rightActions={[
                  { label: "Error", color: "error", onClick: () => {} },
                ]}
              >
                <div className="p-4 bg-card border border-border rounded-lg">
                  <p className="text-sm">Desliza para ver color Error (rojo)</p>
                </div>
              </SwipeableListItem>
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">👆 Touch Gestures</h4>
            <p className="text-sm text-muted-foreground">
              Detecta gestos táctiles para revelar acciones de forma natural en dispositivos móviles.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎯 Threshold Control</h4>
            <p className="text-sm text-muted-foreground">
              Umbral configurable para activar acciones (default: 80px).
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">↩️ Auto Reset</h4>
            <p className="text-sm text-muted-foreground">
              Vuelve a su posición original automáticamente si no se alcanza el umbral.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 Smooth Animations</h4>
            <p className="text-sm text-muted-foreground">
              Transiciones suaves al deslizar y revelar acciones.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">SwipeableListItem Props</h4>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">children</TableCell>
                <TableCell className="font-mono text-xs">React.ReactNode</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Contenido del item.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">leftActions</TableCell>
                <TableCell className="font-mono text-xs">SwipeAction[]</TableCell>
                <TableCell>[]</TableCell>
                <TableCell>Acciones al deslizar a la derecha.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">rightActions</TableCell>
                <TableCell className="font-mono text-xs">SwipeAction[]</TableCell>
                <TableCell>[]</TableCell>
                <TableCell>Acciones al deslizar a la izquierda.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">threshold</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>80</TableCell>
                <TableCell>Distancia en px para activar acción.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">SwipeAction</h4>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">label</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Texto de la acción.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onClick</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell>Función a ejecutar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell>Icono opcional.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">color</TableCell>
                <TableCell className="font-mono text-xs">'primary' | 'success' | 'warning' | 'error'</TableCell>
                <TableCell>Color de la acción.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
