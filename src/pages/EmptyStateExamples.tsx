import { EmptyState } from "@components/common/EmptyState";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Inbox, ShoppingCart, FileText, Plus, Search, Users, Calendar } from "lucide-react";

export function EmptyStateExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">EmptyState Component</h2>
        <p className="text-muted-foreground">
          Estado vacío con ilustración y mensaje. Ideal para cuando no hay datos que mostrar.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. EmptyState Básico</h3>
          <CodePreview
            code={`<EmptyState
  icon={Inbox}
  title="No hay gastos"
  description="Comienza agregando tu primer gasto"
  action={{
    label: "Agregar Gasto",
    onClick: () => console.log("Add"),
    icon: Plus
  }}
/>`}
          >
            <Card className="bg-muted/30">
              <EmptyState
                icon={Inbox}
                title="No hay gastos este mes"
                description="Comienza agregando tu primer gasto para llevar un control de tus finanzas"
                action={{
                  label: "Agregar Gasto",
                  onClick: () => alert("Agregar gasto"),
                  icon: Plus,
                }}
              />
            </Card>
          </CodePreview>
        </div>

        {/* Without Action */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Sin Acción</h3>
          <CodePreview
            code={`<EmptyState
  icon={Search}
  title="No se encontraron resultados"
  description="Intenta con otros términos de búsqueda"
/>`}
          >
            <Card className="bg-muted/30">
              <EmptyState
                icon={Search}
                title="No se encontraron resultados"
                description="Intenta con otros términos de búsqueda o ajusta los filtros"
              />
            </Card>
          </CodePreview>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Tamaños</h3>
          <CodePreview
            code={`<EmptyState size="sm" ... />
<EmptyState size="md" ... />
<EmptyState size="lg" ... />`}
          >
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-muted/30">
                <EmptyState
                  icon={FileText}
                  title="Sin documentos"
                  size="sm"
                />
              </Card>
              <Card className="bg-muted/30">
                <EmptyState
                  icon={ShoppingCart}
                  title="Carrito vacío"
                  description="Agrega productos para continuar"
                  size="md"
                />
              </Card>
              <Card className="bg-muted/30">
                <EmptyState
                  icon={Inbox}
                  title="Sin mensajes"
                  description="No tienes mensajes nuevos en este momento"
                  size="lg"
                  action={{
                    label: "Actualizar",
                    onClick: () => alert("Actualizar"),
                  }}
                />
              </Card>
            </div>
          </CodePreview>
        </div>

        {/* Different Icons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Diferentes Iconos</h3>
          <CodePreview
            code={`<EmptyState icon={ShoppingCart} ... />
<EmptyState icon={Users} ... />
<EmptyState icon={Calendar} ... />`}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-muted/30">
                <EmptyState
                  icon={ShoppingCart}
                  title="Carrito vacío"
                  description="Añade productos a tu carrito"
                  size="sm"
                />
              </Card>
              <Card className="bg-muted/30">
                <EmptyState
                  icon={Users}
                  title="Sin contactos"
                  description="Invita a tus amigos"
                  size="sm"
                />
              </Card>
              <Card className="bg-muted/30">
                <EmptyState
                  icon={Calendar}
                  title="Sin eventos"
                  description="No hay eventos programados"
                  size="sm"
                />
              </Card>
              <Card className="bg-muted/30">
                <EmptyState
                  icon={FileText}
                  title="Sin reportes"
                  description="Genera tu primer reporte"
                  size="sm"
                />
              </Card>
            </div>
          </CodePreview>
        </div>

        {/* Real World Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Ejemplos del Mundo Real</h3>
          <CodePreview
            code={`// Lista de gastos vacía
<EmptyState
  icon={Inbox}
  title="No hay gastos registrados"
  description="Empieza a registrar tus gastos para ver un resumen aquí"
  action={{
    label: "Registrar Gasto",
    icon: Plus,
    onClick: () => openModal()
  }}
/>

// Búsqueda sin resultados
<EmptyState
  icon={Search}
  title="No encontramos gastos"
  description="Intenta buscar con otros términos o categorías"
  size="sm"
/>

// Categoría sin gastos
<EmptyState
  icon={ShoppingCart}
  title="Sin gastos en Comida"
  description="No has registrado gastos en esta categoría este mes"
  size="md"
/>`}
          >
            <div className="space-y-4">
              <Card className="bg-muted/30">
                <EmptyState
                  icon={Inbox}
                  title="No hay gastos registrados"
                  description="Empieza a registrar tus gastos para ver un resumen aquí"
                  action={{
                    label: "Registrar Gasto",
                    icon: Plus,
                    onClick: () => alert("Abrir modal de nuevo gasto"),
                  }}
                />
              </Card>

              <Card className="bg-muted/30">
                <EmptyState
                  icon={Search}
                  title="No encontramos gastos"
                  description='No hay resultados para "restaurante" en este mes'
                  size="sm"
                />
              </Card>
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 Customizable</h4>
            <p className="text-sm text-muted-foreground">
              Personaliza el icono, título, descripción y acción según tus necesidades.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">📏 Multiple Sizes</h4>
            <p className="text-sm text-muted-foreground">
              Tres tamaños disponibles (sm, md, lg) para diferentes contextos.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🔘 Optional Action</h4>
            <p className="text-sm text-muted-foreground">
              Incluye un botón de acción opcional para guiar al usuario.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎯 User Guidance</h4>
            <p className="text-sm text-muted-foreground">
              Ayuda a los usuarios a entender qué hacer cuando no hay contenido.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">EmptyState Props</h4>
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
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Título principal del estado vacío.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">description</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Descripción opcional.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Icono a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">illustration</TableCell>
                <TableCell className="font-mono text-xs">React.ReactNode</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Ilustración personalizada (en lugar de icono).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">action</TableCell>
                <TableCell className="font-mono text-xs">{`{ label, onClick, icon? }`}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Botón de acción opcional.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                <TableCell>'md'</TableCell>
                <TableCell>Tamaño del EmptyState.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
