import ErrorAlert from "@components/common/ErrorAlert";
import { useState } from "react";
import Button from "@components/common/Button";

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

      <div className="space-y-6">
        {/* Error Standard */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Error Estándar</h3>
          <Button onClick={() => setError1("No se pudo conectar con el servidor. Por favor, intenta de nuevo.")}>
            Mostrar Error
          </Button>
          <ErrorAlert error={error1} onDismiss={() => setError1(null)} />
        </div>

        {/* Permission Error */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Error de Permisos (con solución)</h3>
          <Button onClick={() => setError2("Permission denied: Missing or insufficient permissions to access Firestore.")}>
            Mostrar Error de Permisos
          </Button>
          <ErrorAlert error={error2} onDismiss={() => setError2(null)} />
        </div>

        {/* Error without dismiss */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Error sin botón de cerrar</h3>
          <Button onClick={() => setError3("Este error no se puede cerrar manualmente.")}>
            Mostrar Error Persistente
          </Button>
          <ErrorAlert error={error3} />
        </div>

        {/* Props Reference */}
        <div className="mt-8 p-6 bg-muted/50 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Props</h3>
          <div className="space-y-2 text-sm">
            <div>
              <code className="bg-muted px-2 py-1 rounded">error</code>
              <span className="text-muted-foreground ml-2">: string | null - Mensaje de error a mostrar</span>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">onDismiss</code>
              <span className="text-muted-foreground ml-2">?: () =&gt; void - Callback para cerrar la alerta</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Detección Automática:</strong> Si el mensaje contiene "permission" o "permisos", 
              se muestra automáticamente una guía de solución con enlace a Firebase Console.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
