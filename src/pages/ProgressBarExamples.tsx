import { useState } from "react";
import { ProgressBar, CircularProgress } from "@components/common/ProgressBar";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";

export function ProgressBarExamples() {
  const [progress, setProgress] = useState(65);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">ProgressBar Component</h2>
        <p className="text-muted-foreground">
          Barras de progreso lineales y circulares para visualizar avances, cargas y porcentajes.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic ProgressBar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. ProgressBar Lineal Básico</h3>
          <CodePreview
            code={`<ProgressBar value={65} showLabel />`}
          >
            <div className="space-y-4">
              <ProgressBar value={progress} showLabel />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                >
                  -10%
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                >
                  +10%
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setProgress(0)}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Variantes de Color</h3>
          <CodePreview
            code={`<ProgressBar variant="default" value={75} />
<ProgressBar variant="success" value={90} />
<ProgressBar variant="warning" value={60} />
<ProgressBar variant="error" value={30} />
<ProgressBar variant="gradient" value={80} />`}
          >
            <div className="space-y-3">
              <ProgressBar variant="default" value={75} label="Default (Primary)" showLabel />
              <ProgressBar variant="success" value={90} label="Success (Verde)" showLabel />
              <ProgressBar variant="warning" value={60} label="Warning (Amarillo)" showLabel />
              <ProgressBar variant="error" value={30} label="Error (Rojo)" showLabel />
              <ProgressBar variant="gradient" value={80} label="Gradient (Multicolor)" showLabel />
            </div>
          </CodePreview>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Tamaños</h3>
          <CodePreview
            code={`<ProgressBar size="sm" value={70} />
<ProgressBar size="md" value={70} />
<ProgressBar size="lg" value={70} />`}
          >
            <div className="space-y-3">
              <ProgressBar size="sm" value={70} label="Small (1px)" showLabel />
              <ProgressBar size="md" value={70} label="Medium (2px)" showLabel />
              <ProgressBar size="lg" value={70} label="Large (3px)" showLabel />
            </div>
          </CodePreview>
        </div>

        {/* With Custom Label */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Con Etiqueta Personalizada</h3>
          <CodePreview
            code={`<ProgressBar 
  value={progress} 
  label="Descargando archivo..." 
  showLabel 
/>

<ProgressBar 
  value={progress} 
  label="Subiendo fotos" 
  variant="success"
  showLabel 
/>`}
          >
            <div className="space-y-3">
              <ProgressBar 
                value={progress} 
                label="Descargando archivo..." 
                showLabel 
              />
              <ProgressBar 
                value={progress} 
                label="Subiendo fotos" 
                variant="success"
                showLabel 
              />
              <ProgressBar 
                value={progress} 
                label="Procesando datos" 
                variant="gradient"
                showLabel 
              />
            </div>
          </CodePreview>
        </div>

        {/* Animated */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Animado (Pulsante)</h3>
          <CodePreview
            code={`<ProgressBar 
  value={progress} 
  animated 
  label="Cargando..."
  showLabel 
/>`}
          >
            <ProgressBar 
              value={progress} 
              animated 
              label="Cargando..."
              showLabel 
            />
          </CodePreview>
        </div>

        {/* Circular Progress */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">6. Circular Progress</h3>
          <CodePreview
            code={`<CircularProgress value={75} />
<CircularProgress value={90} variant="success" />
<CircularProgress value={50} variant="warning" size={80} />`}
          >
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <CircularProgress value={75} />
                <span className="text-xs text-muted-foreground">Default</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CircularProgress value={90} variant="success" />
                <span className="text-xs text-muted-foreground">Success</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CircularProgress value={50} variant="warning" size={80} />
                <span className="text-xs text-muted-foreground">Warning (80px)</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CircularProgress value={progress} variant="error" size={100} />
                <span className="text-xs text-muted-foreground">Error (100px)</span>
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Circular Without Label */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">7. Circular Sin Etiqueta</h3>
          <CodePreview
            code={`<CircularProgress 
  value={progress} 
  showLabel={false}
  size={60}
/>`}
          >
            <div className="flex justify-center">
              <CircularProgress 
                value={progress} 
                showLabel={false}
                size={60}
              />
            </div>
          </CodePreview>
        </div>

        {/* Real World Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">8. Ejemplos del Mundo Real</h3>
          <CodePreview
            code={`// Progreso de presupuesto
<ProgressBar 
  value={85} 
  variant={85 > 80 ? "warning" : "success"}
  label="Presupuesto Mensual"
  showLabel
/>

// Carga de archivo
<ProgressBar 
  value={45} 
  label="archivo.pdf (45%)"
  variant="gradient"
  showLabel
/>

// Meta de ahorro
<CircularProgress 
  value={67} 
  variant="success"
  size={150}
/>`}
          >
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">Progreso de Presupuesto</p>
                <ProgressBar 
                  value={85} 
                  variant={85 > 80 ? "warning" : "success"}
                  label="Presupuesto Mensual"
                  showLabel
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Carga de Archivo</p>
                <ProgressBar 
                  value={45} 
                  label="archivo.pdf"
                  variant="gradient"
                  showLabel
                />
              </div>

              <div className="flex flex-col items-center">
                <p className="text-sm font-medium mb-3">Meta de Ahorro</p>
                <CircularProgress 
                  value={67} 
                  variant="success"
                  size={150}
                />
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">📊 Múltiples Variantes</h4>
            <p className="text-sm text-muted-foreground">
              Lineal y circular con diferentes colores semánticos.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 Gradientes</h4>
            <p className="text-sm text-muted-foreground">
              Soporte para gradientes de color en barras lineales.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🏷️ Labels Flexibles</h4>
            <p className="text-sm text-muted-foreground">
              Muestra porcentaje y/o etiqueta personalizada.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">⚡ Animaciones Suaves</h4>
            <p className="text-sm text-muted-foreground">
              Transiciones suaves al cambiar el valor.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">ProgressBar Props</h4>
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
                <TableCell className="font-mono text-xs">value</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Valor actual del progreso.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">max</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>100</TableCell>
                <TableCell>Valor máximo.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                <TableCell>'md'</TableCell>
                <TableCell>Tamaño de la barra (altura).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'success' | 'warning' | 'error' | 'gradient'</TableCell>
                <TableCell>'default'</TableCell>
                <TableCell>Variante de color.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">showLabel</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Mostrar porcentaje.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">label</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Etiqueta personalizada.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">animated</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Animación pulsante.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">CircularProgress Props</h4>
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
                <TableCell className="font-mono text-xs">value</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Valor actual del progreso.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">max</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>100</TableCell>
                <TableCell>Valor máximo.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>120</TableCell>
                <TableCell>Tamaño del círculo en px.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">strokeWidth</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>8</TableCell>
                <TableCell>Grosor del trazo.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'success' | 'warning' | 'error'</TableCell>
                <TableCell>'default'</TableCell>
                <TableCell>Variante de color.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">showLabel</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>true</TableCell>
                <TableCell>Mostrar porcentaje en el centro.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
