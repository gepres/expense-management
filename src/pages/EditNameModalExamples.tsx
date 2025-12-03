import { useState } from "react";
import Button from "@components/common/Button";
import EditNameModal from "@components/common/EditNameModal";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";

export function EditNameModalExamples() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentName, setCurrentName] = useState("Mi Lista de Compras");

  const handleSave = (newName: string) => {
    setCurrentName(newName);
    alert(`Nombre actualizado a: ${newName}`);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">EditNameModal Component</h2>
        <p className="text-muted-foreground">
          Modal especializado para editar nombres o títulos de elementos (listas, categorías, etc.).
        </p>
      </div>

      <div className="space-y-8">
        {/* Live Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ejemplo Interactivo</h3>
          <CodePreview
            code={`const [isOpen, setIsOpen] = useState(false);
const [name, setName] = useState("Mi Lista");

<Button onClick={() => setIsOpen(true)}>
  Editar Nombre
</Button>

<EditNameModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSave={(newName) => {
    setName(newName);
    // Guardar en backend...
  }}
  initialName={name}
  title="Renombrar Lista"
/>`}
          >
            <div className="flex flex-col items-center gap-4 p-8 bg-muted/30 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Nombre actual:</p>
                <p className="text-xl font-bold">{currentName}</p>
              </div>
              
              <Button onClick={() => setIsOpen(true)}>
                Editar Nombre
              </Button>

              <EditNameModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSave={handleSave}
                initialName={currentName}
                title="Renombrar Elemento"
              />
            </div>
          </CodePreview>
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
                  <TableCell className="font-mono text-xs">-</TableCell>
                  <TableCell>Controla la visibilidad del modal.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">onClose</TableCell>
                  <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                  <TableCell className="font-mono text-xs">-</TableCell>
                  <TableCell>Callback para cerrar el modal.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">onSave</TableCell>
                  <TableCell className="font-mono text-xs">(newName: string) =&gt; void</TableCell>
                  <TableCell className="font-mono text-xs">-</TableCell>
                  <TableCell>Callback con el nuevo nombre al guardar.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">initialName</TableCell>
                  <TableCell className="font-mono text-xs">string</TableCell>
                  <TableCell className="font-mono text-xs">-</TableCell>
                  <TableCell>Valor inicial del input.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs">title</TableCell>
                  <TableCell className="font-mono text-xs">string</TableCell>
                  <TableCell className="font-mono text-xs">'Editar Nombre'</TableCell>
                  <TableCell>Título del modal.</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
