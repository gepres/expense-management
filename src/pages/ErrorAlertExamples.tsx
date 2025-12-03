import ErrorAlert from "@components/common/ErrorAlert";
import { useState } from "react";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Card } from "@components/common/Card";

export function ErrorAlertExamples() {
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [error3, setError3] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">ErrorAlert Component</h2>
        <p className="text-muted-foreground">
          Alertas de error con detección automática de errores de permisos y soluciones sugeridas.
        </p>
      </div>

      <div className="space-y-8">
        {/* Error Standard */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Error Estándar</h3>
          <CodePreview
            code={`const [error, setError] = useState<string | null>(null);

// ...

<Button onClick={() => setError("Mensaje de error")}>
  Mostrar Error
</Button>

<ErrorAlert 
  error={error} 
  onDismiss={() => setError(null)} 
/>`}
          >
            <div className="space-y-4 max-w-md mx-auto">
              <Button onClick={() => setError1("No se pudo conectar con el servidor. Por favor, intenta de nuevo.")}>
                Mostrar Error
              </Button>
              <ErrorAlert error={error1} onDismiss={() => setError1(null)} />
            </div>
          </CodePreview>
        </div>

        {/* Permission Error */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Error de Permisos (con solución)</h3>
          <CodePreview
            code={`// El componente detecta automáticamente palabras clave como "permission"
<ErrorAlert 
  error="Permission denied: Missing or insufficient permissions." 
  onDismiss={handleDismiss} 
/>`}
          >
            <div className="space-y-4 max-w-md mx-auto">
              <Button onClick={() => setError2("Permission denied: Missing or insufficient permissions to access Firestore.")}>
                Mostrar Error de Permisos
              </Button>
              <ErrorAlert error={error2} onDismiss={() => setError2(null)} />
            </div>
          </CodePreview>
        </div>

        {/* Error without dismiss */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Error Persistente</h3>
          <CodePreview
            code={`// Sin onDismiss, la alerta no se puede cerrar
<ErrorAlert error="Este error no se puede cerrar manualmente." />`}
          >
            <div className="space-y-4 max-w-md mx-auto">
              <Button onClick={() => setError3("Este error no se puede cerrar manualmente.")}>
                Mostrar Error Persistente
              </Button>
              <ErrorAlert error={error3} />
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
                <TableCell className="font-mono text-xs">error</TableCell>
                <TableCell className="font-mono text-xs">string | null</TableCell>
                <TableCell>Mensaje de error a mostrar. Si es null, no se renderiza nada.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onDismiss</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell>Callback opcional para cerrar la alerta.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Detección Automática:</strong> Si el mensaje contiene "permission" o "permisos", 
            se muestra automáticamente una guía de solución con enlace a Firebase Console.
          </p>
        </div>
      </div>
    </div>
  );
}
