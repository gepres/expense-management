import { useState } from "react";
import { ActionSheet } from "@components/common/ActionSheet";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Edit2, Trash2, Share2, Copy, Download, Eye, EyeOff } from "lucide-react";

export function ActionSheetExamples() {
  const [showBasic, setShowBasic] = useState(false);
  const [showWithIcons, setShowWithIcons] = useState(false);
  const [showDestructive, setShowDestructive] = useState(false);
  const [showWithHeader, setShowWithHeader] = useState(false);
  const [showNoCancel, setShowNoCancel] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">ActionSheet Component</h2>
        <p className="text-muted-foreground">
          Menú de acciones estilo iOS que aparece desde abajo. Ideal para mostrar opciones contextuales.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. ActionSheet Básico</h3>
          <CodePreview
            code={`const [show, setShow] = useState(false);

<ActionSheet
  isOpen={show}
  onClose={() => setShow(false)}
  actions={[
    { label: "Editar", onClick: () => console.log("Edit") },
    { label: "Compartir", onClick: () => console.log("Share") },
    { label: "Eliminar", onClick: () => console.log("Delete"), destructive: true }
  ]}
/>`}
          >
            <Button onClick={() => setShowBasic(true)}>
              Abrir ActionSheet Básico
            </Button>

            <ActionSheet
              isOpen={showBasic}
              onClose={() => setShowBasic(false)}
              actions={[
                { label: "Editar gasto", onClick: () => alert("Editar") },
                { label: "Compartir", onClick: () => alert("Compartir") },
                { label: "Eliminar", onClick: () => alert("Eliminar"), destructive: true },
              ]}
            />
          </CodePreview>
        </div>

        {/* With Icons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Con Iconos</h3>
          <CodePreview
            code={`<ActionSheet
  isOpen={show}
  onClose={() => setShow(false)}
  actions={[
    { label: "Editar", icon: Edit2, onClick: ... },
    { label: "Compartir", icon: Share2, onClick: ... },
    { label: "Copiar", icon: Copy, onClick: ... },
    { label: "Eliminar", icon: Trash2, onClick: ..., destructive: true }
  ]}
/>`}
          >
            <Button onClick={() => setShowWithIcons(true)}>
              ActionSheet con Iconos
            </Button>

            <ActionSheet
              isOpen={showWithIcons}
              onClose={() => setShowWithIcons(false)}
              actions={[
                { label: "Editar", icon: Edit2, onClick: () => alert("Editar") },
                { label: "Compartir", icon: Share2, onClick: () => alert("Compartir") },
                { label: "Copiar enlace", icon: Copy, onClick: () => alert("Copiar") },
                { label: "Descargar", icon: Download, onClick: () => alert("Descargar") },
                { label: "Eliminar", icon: Trash2, onClick: () => alert("Eliminar"), destructive: true },
              ]}
            />
          </CodePreview>
        </div>

        {/* With Header */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Con Título y Descripción</h3>
          <CodePreview
            code={`<ActionSheet
  isOpen={show}
  onClose={() => setShow(false)}
  title="Opciones del Gasto"
  description="Selecciona una acción para este gasto"
  actions={[...]}
/>`}
          >
            <Button onClick={() => setShowWithHeader(true)}>
              ActionSheet con Header
            </Button>

            <ActionSheet
              isOpen={showWithHeader}
              onClose={() => setShowWithHeader(false)}
              title="Opciones del Gasto"
              description="Selecciona una acción para este gasto de S/ 150.00"
              actions={[
                { label: "Ver detalles", icon: Eye, onClick: () => alert("Ver") },
                { label: "Editar", icon: Edit2, onClick: () => alert("Editar") },
                { label: "Ocultar", icon: EyeOff, onClick: () => alert("Ocultar") },
                { label: "Eliminar", icon: Trash2, onClick: () => alert("Eliminar"), destructive: true },
              ]}
            />
          </CodePreview>
        </div>

        {/* Destructive Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Acciones Destructivas</h3>
          <CodePreview
            code={`<ActionSheet
  title="¿Eliminar este gasto?"
  description="Esta acción no se puede deshacer"
  actions={[
    { 
      label: "Eliminar Gasto", 
      onClick: ..., 
      destructive: true 
    }
  ]}
/>`}
          >
            <Button variant="destructive" onClick={() => setShowDestructive(true)}>
              Confirmar Eliminación
            </Button>

            <ActionSheet
              isOpen={showDestructive}
              onClose={() => setShowDestructive(false)}
              title="¿Eliminar este gasto?"
              description="Esta acción no se puede deshacer. El gasto será eliminado permanentemente."
              actions={[
                {
                  label: "Eliminar Gasto",
                  icon: Trash2,
                  onClick: () => alert("Gasto eliminado"),
                  destructive: true,
                },
              ]}
            />
          </CodePreview>
        </div>

        {/* Without Cancel */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Sin Botón Cancelar</h3>
          <CodePreview
            code={`<ActionSheet
  showCancel={false}
  actions={[...]}
/>`}
          >
            <Button onClick={() => setShowNoCancel(true)}>
              Sin Botón Cancelar
            </Button>

            <ActionSheet
              isOpen={showNoCancel}
              onClose={() => setShowNoCancel(false)}
              title="Selecciona una opción"
              showCancel={false}
              actions={[
                { label: "Opción 1", onClick: () => alert("Opción 1") },
                { label: "Opción 2", onClick: () => alert("Opción 2") },
                { label: "Opción 3", onClick: () => alert("Opción 3") },
              ]}
            />
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">👆 Swipe to Dismiss</h4>
            <p className="text-sm text-muted-foreground">
              Desliza hacia abajo para cerrar el ActionSheet en dispositivos táctiles.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">📱 iOS Native Feel</h4>
            <p className="text-sm text-muted-foreground">
              Diseño y animaciones inspiradas en UIActionSheet de iOS.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 Acciones Destructivas</h4>
            <p className="text-sm text-muted-foreground">
              Resalta acciones peligrosas con color rojo para prevenir errores.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">⌨️ Keyboard Support</h4>
            <p className="text-sm text-muted-foreground">
              Cierra con la tecla ESC y soporta navegación por teclado.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">ActionSheet Props</h4>
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
                <TableCell className="font-mono text-xs">isOpen</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Controla la visibilidad del ActionSheet.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onClose</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Callback al cerrar el ActionSheet.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">actions</TableCell>
                <TableCell className="font-mono text-xs">ActionSheetAction[]</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Array de acciones a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Título opcional del ActionSheet.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">description</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Descripción opcional.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">showCancel</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">true</TableCell>
                <TableCell>Mostrar botón de cancelar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">cancelLabel</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">'Cancelar'</TableCell>
                <TableCell>Texto del botón cancelar.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">ActionSheetAction</h4>
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
                <TableCell>Función a ejecutar al hacer clic.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell>Icono opcional a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">destructive</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Si es true, muestra en rojo (acción peligrosa).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">disabled</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Si es true, deshabilita la acción.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
