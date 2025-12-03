import ConfirmationModal from "@components/common/ConfirmationModal";
import { useState } from "react";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Card } from "@components/common/Card";

export function ConfirmationModalExamples() {
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmWithLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowModal3(false);
      alert("Acción completada!");
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">ConfirmationModal Component</h2>
        <p className="text-muted-foreground">
          Modal de confirmación para acciones importantes con variantes destructivas y estados de carga.
        </p>
      </div>

      <div className="space-y-8">
        {/* Standard Confirmation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Confirmación Estándar</h3>
          <CodePreview
            code={`<ConfirmationModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleConfirm}
  title="¿Continuar con esta acción?"
  description="Esta acción guardará los cambios."
  confirmText="Guardar"
  cancelText="Cancelar"
/>`}
          >
            <div className="max-w-md mx-auto">
              <Button onClick={() => setShowModal1(true)}>
                Abrir Confirmación
              </Button>
              <ConfirmationModal
                isOpen={showModal1}
                onClose={() => setShowModal1(false)}
                onConfirm={() => {
                  alert("Confirmado!");
                  setShowModal1(false);
                }}
                title="¿Continuar con esta acción?"
                description="Esta acción guardará los cambios realizados."
                confirmText="Guardar"
                cancelText="Cancelar"
              />
            </div>
          </CodePreview>
        </div>

        {/* Destructive Confirmation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Confirmación Destructiva</h3>
          <CodePreview
            code={`<ConfirmationModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="¿Eliminar este gasto?"
  description="Esta acción no se puede deshacer."
  confirmText="Eliminar"
  isDestructive
/>`}
          >
            <div className="max-w-md mx-auto">
              <Button variant="destructive" onClick={() => setShowModal2(true)}>
                Eliminar Item
              </Button>
              <ConfirmationModal
                isOpen={showModal2}
                onClose={() => setShowModal2(false)}
                onConfirm={() => {
                  alert("Eliminado!");
                  setShowModal2(false);
                }}
                title="¿Eliminar este gasto?"
                description="Esta acción no se puede deshacer. El gasto será eliminado permanentemente."
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDestructive
              />
            </div>
          </CodePreview>
        </div>

        {/* With Loading State */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Con Estado de Carga</h3>
          <CodePreview
            code={`<ConfirmationModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleAsyncAction}
  title="¿Procesar?"
  description="Esto tomará unos segundos."
  isLoading={isLoading}
  autoClose={false}
/>`}
          >
            <div className="max-w-md mx-auto">
              <Button onClick={() => setShowModal3(true)}>
                Acción con Loading
              </Button>
              <ConfirmationModal
                isOpen={showModal3}
                onClose={() => setShowModal3(false)}
                onConfirm={handleConfirmWithLoading}
                title="¿Procesar esta acción?"
                description="Esto tomará unos segundos en completarse."
                confirmText="Procesar"
                cancelText="Cancelar"
                isLoading={isLoading}
                autoClose={false}
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
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">isOpen</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Controla la visibilidad del modal.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onClose</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Callback al cerrar o cancelar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onConfirm</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Callback al confirmar la acción.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Título del modal.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">description</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Mensaje descriptivo.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">confirmText</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">"Confirmar"</TableCell>
                <TableCell>Texto del botón de confirmación.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">isDestructive</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Aplica estilo rojo al botón de confirmación.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">isLoading</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Muestra spinner en el botón de confirmación.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
