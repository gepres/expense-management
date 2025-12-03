import { Card } from "@/components/common/Card";
import { Banner } from "@components/common/Banner";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Info, CheckCircle, AlertTriangle, AlertOctagon, Sparkles } from "lucide-react";

export function BannerExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Banner Component</h2>
        <p className="text-muted-foreground">
          Componente para destacar información importante o llamadas a la acción.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Default */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Básico</h3>
          <CodePreview
            code={`<Banner
  title="Banner Estándar"
  description="Un banner simple para información general."
  hover
/>`}
          >
            <Banner
              title="Banner Estándar"
              description="Un banner simple para información general."
              hover
            />
          </CodePreview>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Variantes</h3>
          <CodePreview
            code={`<Banner
  variant="info"
  icon={Info}
  title="Información"
  description="Mensaje informativo."
/>

<Banner
  variant="success"
  icon={CheckCircle}
  title="Éxito"
  description="Operación completada."
/>

<Banner
  variant="warning"
  icon={AlertTriangle}
  title="Advertencia"
  description="Atención requerida."
/>

<Banner
  variant="error"
  icon={AlertOctagon}
  title="Error"
  description="Algo salió mal."
/>`}
          >
            <div className="space-y-4">
              <Banner
                variant="info"
                icon={Info}
                title="Información"
                description="Este es un mensaje informativo para el usuario."
                hover
              />
              <Banner
                variant="success"
                icon={CheckCircle}
                title="Operación Exitosa"
                description="Los cambios se han guardado correctamente."
                hover
              />
              <Banner
                variant="warning"
                icon={AlertTriangle}
                title="Advertencia"
                description="Tu presupuesto está cerca del límite."
                hover
              />
              <Banner
                variant="error"
                icon={AlertOctagon}
                title="Error"
                description="No se pudo conectar con el servidor."
                hover
              />
            </div>
          </CodePreview>
        </div>

        {/* With Action */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Con Acción</h3>
          <CodePreview
            code={`<Banner
  variant="gradient"
  icon={Sparkles}
  title="Nueva Funcionalidad"
  description="Sincroniza tus gastos con IA."
  action={
    <Button size="sm" variant="primary">
      Probar Ahora
    </Button>
  }
/>`}
          >
            <Banner
              variant="gradient"
              icon={Sparkles}
              title="Nueva Funcionalidad"
              description="Ahora puedes sincronizar tus gastos automáticamente con IA. Haz clic para más información."
              hover
              onClick={() => alert('Banner clickeado!')}
              action={
                <Button size="sm" variant="primary">
                  Probar Ahora
                </Button>
              }
            />
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
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'info' | 'success' | 'warning' | 'error' | 'gradient'</TableCell>
                <TableCell className="font-mono text-xs">'default'</TableCell>
                <TableCell>Estilo visual del banner.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Título principal del banner.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">description</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Texto descriptivo secundario.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Icono a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">action</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Elemento de acción (botón, link, etc.).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">hover</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Habilita efectos de hover.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
