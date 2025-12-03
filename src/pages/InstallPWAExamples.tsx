import InstallPWA from "@components/common/InstallPWA";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";

export function InstallPWAExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">InstallPWA Component</h2>
        <p className="text-muted-foreground">
          Banner promocional para invitar al usuario a instalar la aplicación como PWA (Progressive Web App).
        </p>
      </div>

      <div className="space-y-8">
        {/* Live Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Ejemplo en Vivo</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este componente detecta automáticamente si la app es instalable. Si no lo es (o ya está instalada), muestra instrucciones manuales o se oculta.
            <br />
            <strong>Nota:</strong> En este entorno de desarrollo, es probable que veas la versión de "Instrucciones" o nada si ya es PWA.
          </p>
          
          <CodePreview
            code={`// Simplemente renderiza el componente en tu layout o página
<InstallPWA />`}
          >
            <div className="max-w-md mx-auto">
              <InstallPWA />
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🕵️‍♂️ Detección Automática</h4>
            <p className="text-sm text-muted-foreground">
              Utiliza el hook `usePWAInstall` para detectar el evento `beforeinstallprompt` y determinar si el navegador soporta la instalación nativa.
            </p>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-bold mb-2">📱 Instrucciones Manuales</h4>
            <p className="text-sm text-muted-foreground">
              Si la instalación automática no está disponible (ej. iOS Safari, Firefox), ofrece instrucciones paso a paso específicas para el navegador detectado.
            </p>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 Diseño Integrado</h4>
            <p className="text-sm text-muted-foreground">
              Diseñado con un gradiente sutil y estilo acorde a la aplicación para no ser intrusivo.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">❌ Descartable</h4>
            <p className="text-sm text-muted-foreground">
              El usuario puede cerrar el banner manualmente si no desea instalar la app en ese momento.
            </p>
          </Card>
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
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Este componente no acepta props públicas. Gestiona su estado internamente.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
