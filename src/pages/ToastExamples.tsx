import { useState } from "react";
import { useToast, Toast, ToastProvider } from "@components/common/Toast";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";

// Wrapper component to use the toast hook
function ToastDemoContent() {
  const { showToast } = useToast();
  const [showStandaloneToast, setShowStandaloneToast] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Toast Component</h2>
        <p className="text-muted-foreground">
          Notificaciones temporales estilo iOS que aparecen en la parte superior de la pantalla con animación suave.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. Tipos de Toast</h3>
          <CodePreview
            code={`const { showToast } = useToast();

// Success
showToast({ message: "¡Operación exitosa!", type: "success" });

// Error
showToast({ message: "Error al procesar", type: "error" });

// Warning
showToast({ message: "Advertencia importante", type: "warning" });

// Info
showToast({ message: "Información útil", type: "info" });`}
          >
            <div className="flex flex-wrap gap-3">
              <Button
                variant="success"
                onClick={() =>
                  showToast({
                    message: "¡Gasto guardado exitosamente!",
                    type: "success",
                  })
                }
              >
                Success Toast
              </Button>

              <Button
                variant="destructive"
                onClick={() =>
                  showToast({
                    message: "Error al eliminar el gasto",
                    type: "error",
                  })
                }
              >
                Error Toast
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  showToast({
                    message: "Estás cerca del límite de tu presupuesto",
                    type: "warning",
                  })
                }
              >
                Warning Toast
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  showToast({
                    message: "Recuerda revisar tus gastos mensuales",
                    type: "info",
                  })
                }
              >
                Info Toast
              </Button>
            </div>
          </CodePreview>
        </div>

        {/* With Action */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Toast con Acción</h3>
          <CodePreview
            code={`showToast({
  message: "Gasto eliminado",
  type: "success",
  action: {
    label: "Deshacer",
    onClick: () => {
      // Restore the deleted item
      console.log("Undo delete");
    }
  }
});`}
          >
            <Button
              onClick={() =>
                showToast({
                  message: "Gasto eliminado correctamente",
                  type: "success",
                  action: {
                    label: "Deshacer",
                    onClick: () => {
                      alert("Acción deshecha!");
                    },
                  },
                })
              }
            >
              Toast con Acción
            </Button>
          </CodePreview>
        </div>

        {/* Custom Duration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Duración Personalizada</h3>
          <CodePreview
            code={`// Short duration (2 seconds)
showToast({ message: "Mensaje rápido", duration: 2000 });

// Long duration (8 seconds)
showToast({ message: "Mensaje largo", duration: 8000 });

// Persistent (no auto-dismiss)
showToast({ message: "Requiere acción manual", duration: 0 });`}
          >
            <div className="flex flex-wrap gap-3">
              <Button
                size="sm"
                onClick={() =>
                  showToast({
                    message: "Este mensaje desaparece rápido (2s)",
                    type: "info",
                    duration: 2000,
                  })
                }
              >
                Corta (2s)
              </Button>

              <Button
                size="sm"
                onClick={() =>
                  showToast({
                    message: "Este mensaje permanece más tiempo (8s)",
                    type: "info",
                    duration: 8000,
                  })
                }
              >
                Larga (8s)
              </Button>

              <Button
                size="sm"
                onClick={() =>
                  showToast({
                    message: "Este mensaje no se cierra automáticamente",
                    type: "warning",
                    duration: 0,
                  })
                }
              >
                Persistente
              </Button>
            </div>
          </CodePreview>
        </div>

        {/* Non-dismissible */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. No Descartable</h3>
          <CodePreview
            code={`showToast({
  message: "Procesando pago...",
  type: "info",
  dismissible: false,
  duration: 3000
});`}
          >
            <Button
              onClick={() =>
                showToast({
                  message: "Procesando pago, por favor espera...",
                  type: "info",
                  dismissible: false,
                  duration: 3000,
                })
              }
            >
              Toast No Descartable
            </Button>
          </CodePreview>
        </div>

        {/* Standalone Toast */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Toast Standalone</h3>
          <p className="text-sm text-muted-foreground">
            Componente Toast independiente para uso sin el provider (útil para casos específicos).
          </p>
          <CodePreview
            code={`import { Toast } from "@components/common/Toast";

const [show, setShow] = useState(false);

{show && (
  <Toast
    message="Toast standalone"
    type="success"
    onDismiss={() => setShow(false)}
  />
)}`}
          >
            <div className="space-y-4">
              <Button onClick={() => setShowStandaloneToast(!showStandaloneToast)}>
                {showStandaloneToast ? "Ocultar" : "Mostrar"} Toast Standalone
              </Button>

              {showStandaloneToast && (
                <Toast
                  message="Este es un toast standalone (sin provider)"
                  type="success"
                  onDismiss={() => setShowStandaloneToast(false)}
                  action={{
                    label: "Ver más",
                    onClick: () => alert("Acción ejecutada"),
                  }}
                />
              )}
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🎯 Animaciones Suaves</h4>
            <p className="text-sm text-muted-foreground">
              Aparece desde arriba con animación slide-in y se desvanece suavemente al salir.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">📱 iOS Style</h4>
            <p className="text-sm text-muted-foreground">
              Diseño inspirado en notificaciones de iOS con backdrop blur y colores semánticos.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🔔 Auto-dismiss</h4>
            <p className="text-sm text-muted-foreground">
              Se cierra automáticamente después de la duración especificada (configurable).
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">⚡ Context API</h4>
            <p className="text-sm text-muted-foreground">
              Usa React Context para mostrar toasts desde cualquier parte de la app.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">useToast Hook</h4>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Method</TableHead>
                <TableHead>Parameters</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">showToast</TableCell>
                <TableCell className="font-mono text-xs">(toast: ToastOptions) =&gt; void</TableCell>
                <TableCell>Muestra un nuevo toast.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">dismissToast</TableCell>
                <TableCell className="font-mono text-xs">(id: string) =&gt; void</TableCell>
                <TableCell>Cierra un toast específico por ID.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">Toast Options</h4>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">message</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Mensaje a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">type</TableCell>
                <TableCell className="font-mono text-xs">'success' | 'error' | 'warning' | 'info'</TableCell>
                <TableCell className="font-mono text-xs">'info'</TableCell>
                <TableCell>Tipo de notificación.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">duration</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell className="font-mono text-xs">4000</TableCell>
                <TableCell>Duración en ms (0 = persistente).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">dismissible</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">true</TableCell>
                <TableCell>Si se puede cerrar manualmente.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">action</TableCell>
                <TableCell className="font-mono text-xs">{`{ label: string, onClick: () => void }`}</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Acción opcional (ej. "Deshacer").</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Setup Instructions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configuración</h3>
        <Card className="p-6">
          <h4 className="font-bold mb-3">1. Envolver la app con ToastProvider</h4>
          <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
            <code>{`import { ToastProvider } from '@components/common/Toast';

function App() {
  return (
    <ToastProvider>
      {/* Tu aplicación */}
    </ToastProvider>
  );
}`}</code>
          </pre>

          <h4 className="font-bold mb-3 mt-6">2. Usar el hook en cualquier componente</h4>
          <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-xs">
            <code>{`import { useToast } from '@components/common/Toast';

function MyComponent() {
  const { showToast } = useToast();

  const handleSave = () => {
    // ... save logic
    showToast({
      message: "¡Guardado exitosamente!",
      type: "success"
    });
  };

  return <button onClick={handleSave}>Guardar</button>;
}`}</code>
          </pre>
        </Card>
      </div>
    </div>
  );
}

// Main export with provider wrapper
export function ToastExamples() {
  return (
    <ToastProvider>
      <ToastDemoContent />
    </ToastProvider>
  );
}
