import { useState } from "react";
import { DatePicker } from "@components/common/DatePicker";
import { Stepper } from "@components/common/Stepper";
import { ProgressBar, CircularProgress } from "@components/common/ProgressBar";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";

export function Phase4ComponentsExamples() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [quantity, setQuantity] = useState(5);
  const [progress, setProgress] = useState(65);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-2">Phase 4: Low Priority Components</h2>
        <p className="text-muted-foreground">
          Componentes adicionales nice-to-have: DatePicker, Stepper, y ProgressBar.
        </p>
      </div>

      {/* ========== DATEPICKER ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">DatePicker</h2>
          <p className="text-muted-foreground">
            Selector de fecha con calendario desplegable. Alternativa moderna al input date nativo.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. DatePicker Básico</h3>
          <CodePreview
            code={`const [date, setDate] = useState<Date>();

<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Seleccionar fecha"
/>`}
          >
            <div className="max-w-sm">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Seleccionar fecha"
              />
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Con Restricciones de Fecha</h3>
          <CodePreview
            code={`<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date()}
  maxDate={new Date(2024, 11, 31)}
/>`}
          >
            <div className="max-w-sm">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                minDate={new Date()}
                placeholder="Solo fechas futuras"
              />
            </div>
          </CodePreview>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">📅 Calendario Visual</h4>
            <p className="text-sm text-muted-foreground">
              Calendario desplegable con navegación por mes y año.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🚫 Fechas Deshabilitadas</h4>
            <p className="text-sm text-muted-foreground">
              Soporta minDate y maxDate para restringir selección.
            </p>
          </Card>
        </div>
      </section>

      {/* ========== STEPPER ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Stepper</h2>
          <p className="text-muted-foreground">
            Control numérico con botones +/- para incrementar/decrementar valores.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. Stepper Básico</h3>
          <CodePreview
            code={`const [value, setValue] = useState(5);

<Stepper
  value={value}
  onChange={setValue}
  min={0}
  max={10}
/>`}
          >
            <div className="flex flex-col items-center gap-3">
              <Stepper
                value={quantity}
                onChange={setQuantity}
                min={0}
                max={10}
              />
              <p className="text-sm text-muted-foreground">
                Cantidad: {quantity}
              </p>
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Tamaños</h3>
          <CodePreview
            code={`<Stepper size="sm" ... />
<Stepper size="md" ... />
<Stepper size="lg" ... />`}
          >
            <div className="flex flex-wrap items-center gap-4">
              <Stepper size="sm" value={quantity} onChange={setQuantity} min={0} max={10} />
              <Stepper size="md" value={quantity} onChange={setQuantity} min={0} max={10} />
              <Stepper size="lg" value={quantity} onChange={setQuantity} min={0} max={10} />
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Con Formato Personalizado</h3>
          <CodePreview
            code={`<Stepper
  value={value}
  onChange={setValue}
  formatValue={(v) => \`\${v} items\`}
  step={5}
/>`}
          >
            <Stepper
              value={quantity}
              onChange={setQuantity}
              min={0}
              max={50}
              step={5}
              formatValue={(v) => `${v} items`}
            />
          </CodePreview>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">➕➖ Incremento/Decremento</h4>
            <p className="text-sm text-muted-foreground">
              Botones claros para aumentar o disminuir valores.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎯 Límites Configurables</h4>
            <p className="text-sm text-muted-foreground">
              Define min, max y step personalizados.
            </p>
          </Card>
        </div>
      </section>

      {/* ========== PROGRESSBAR ========== */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">ProgressBar</h2>
          <p className="text-muted-foreground">
            Barras de progreso lineales y circulares para visualizar avances.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. ProgressBar Lineal</h3>
          <CodePreview
            code={`<ProgressBar value={65} showLabel />`}
          >
            <div className="space-y-4">
              <ProgressBar value={progress} showLabel />
              <div className="flex gap-2">
                <button
                  onClick={() => setProgress(Math.max(0, progress - 10))}
                  className="px-3 py-1 bg-muted rounded-lg text-sm"
                >
                  -10%
                </button>
                <button
                  onClick={() => setProgress(Math.min(100, progress + 10))}
                  className="px-3 py-1 bg-muted rounded-lg text-sm"
                >
                  +10%
                </button>
              </div>
            </div>
          </CodePreview>
        </div>

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
              <ProgressBar variant="default" value={75} label="Default" showLabel />
              <ProgressBar variant="success" value={90} label="Success" showLabel />
              <ProgressBar variant="warning" value={60} label="Warning" showLabel />
              <ProgressBar variant="error" value={30} label="Error" showLabel />
              <ProgressBar variant="gradient" value={80} label="Gradient" showLabel />
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Tamaños</h3>
          <CodePreview
            code={`<ProgressBar size="sm" value={70} />
<ProgressBar size="md" value={70} />
<ProgressBar size="lg" value={70} />`}
          >
            <div className="space-y-3">
              <ProgressBar size="sm" value={70} label="Small" showLabel />
              <ProgressBar size="md" value={70} label="Medium" showLabel />
              <ProgressBar size="lg" value={70} label="Large" showLabel />
            </div>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Circular Progress</h3>
          <CodePreview
            code={`<CircularProgress value={75} />
<CircularProgress value={90} variant="success" />
<CircularProgress value={50} variant="warning" size={80} />`}
          >
            <div className="flex flex-wrap items-center gap-6">
              <CircularProgress value={75} />
              <CircularProgress value={90} variant="success" />
              <CircularProgress value={50} variant="warning" size={80} />
              <CircularProgress value={progress} variant="error" size={100} />
            </div>
          </CodePreview>
        </div>

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
            <h4 className="font-bold mb-2">🏷️ Labels Opcionales</h4>
            <p className="text-sm text-muted-foreground">
              Muestra porcentaje y/o etiqueta personalizada.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">⚡ Animado</h4>
            <p className="text-sm text-muted-foreground">
              Transiciones suaves al cambiar el valor.
            </p>
          </Card>
        </div>
      </section>

      {/* Props Reference */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Props Reference</h2>

        {/* DatePicker Props */}
        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">DatePicker Props</h4>
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
                <TableCell className="font-mono text-xs">Date</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Fecha seleccionada.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onChange</TableCell>
                <TableCell className="font-mono text-xs">(date: Date) =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al seleccionar fecha.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">minDate</TableCell>
                <TableCell className="font-mono text-xs">Date</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Fecha mínima seleccionable.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">maxDate</TableCell>
                <TableCell className="font-mono text-xs">Date</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Fecha máxima seleccionable.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* Stepper Props */}
        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">Stepper Props</h4>
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
                <TableCell>Valor actual.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onChange</TableCell>
                <TableCell className="font-mono text-xs">(value: number) =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al cambiar valor.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">min</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>0</TableCell>
                <TableCell>Valor mínimo.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">max</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>100</TableCell>
                <TableCell>Valor máximo.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">step</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>1</TableCell>
                <TableCell>Incremento/decremento.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* ProgressBar Props */}
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
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
