import { useState } from "react";
import { SegmentedControl } from "@components/common/SegmentedControl";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { LayoutGrid, List, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function SegmentedControlExamples() {
  const [view, setView] = useState("grid");
  const [period, setPeriod] = useState("month");
  const [transactionType, setTransactionType] = useState("all");
  const [size, setSize] = useState("md");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">SegmentedControl Component</h2>
        <p className="text-muted-foreground">
          Control segmentado estilo iOS para cambiar entre vistas o filtros. Ideal para navegación entre opciones relacionadas.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. Uso Básico</h3>
          <CodePreview
            code={`const [view, setView] = useState("grid");

<SegmentedControl
  options={[
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" }
  ]}
  value={view}
  onChange={setView}
/>`}
          >
            <div className="flex flex-col items-center gap-4">
              <SegmentedControl
                options={[
                  { value: "grid", label: "Grid" },
                  { value: "list", label: "List" },
                ]}
                value={view}
                onChange={setView}
              />
              <p className="text-sm text-muted-foreground">
                Vista seleccionada: <strong>{view}</strong>
              </p>
            </div>
          </CodePreview>
        </div>

        {/* With Icons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Con Iconos</h3>
          <CodePreview
            code={`<SegmentedControl
  options={[
    { value: "grid", label: <><LayoutGrid className="h-4 w-4" /> Grid</> },
    { value: "list", label: <><List className="h-4 w-4" /> List</> }
  ]}
  value={view}
  onChange={setView}
/>`}
          >
            <SegmentedControl
              options={[
                { 
                  value: "grid", 
                  label: (
                    <div className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4" />
                      <span>Grid</span>
                    </div>
                  )
                },
                { 
                  value: "list", 
                  label: (
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      <span>List</span>
                    </div>
                  )
                },
              ]}
              value={view}
              onChange={setView}
            />
          </CodePreview>
        </div>

        {/* Multiple Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Múltiples Opciones</h3>
          <CodePreview
            code={`<SegmentedControl
  options={[
    { value: "day", label: "Día" },
    { value: "week", label: "Semana" },
    { value: "month", label: "Mes" },
    { value: "year", label: "Año" }
  ]}
  value={period}
  onChange={setPeriod}
/>`}
          >
            <div className="flex flex-col items-center gap-4">
              <SegmentedControl
                options={[
                  { value: "day", label: "Día" },
                  { value: "week", label: "Semana" },
                  { value: "month", label: "Mes" },
                  { value: "year", label: "Año" },
                ]}
                value={period}
                onChange={setPeriod}
              />
              <p className="text-sm text-muted-foreground">
                Período seleccionado: <strong>{period}</strong>
              </p>
            </div>
          </CodePreview>
        </div>

        {/* Transaction Type Filter */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Filtro de Transacciones</h3>
          <CodePreview
            code={`<SegmentedControl
  options={[
    { value: "all", label: <><Minus /> Todos</> },
    { value: "income", label: <><TrendingUp /> Ingresos</> },
    { value: "expense", label: <><TrendingDown /> Gastos</> }
  ]}
  value={transactionType}
  onChange={setTransactionType}
/>`}
          >
            <div className="flex flex-col items-center gap-4">
              <SegmentedControl
                options={[
                  { 
                    value: "all", 
                    label: (
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4" />
                        <span>Todos</span>
                      </div>
                    )
                  },
                  { 
                    value: "income", 
                    label: (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span>Ingresos</span>
                      </div>
                    )
                  },
                  { 
                    value: "expense", 
                    label: (
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        <span>Gastos</span>
                      </div>
                    )
                  },
                ]}
                value={transactionType}
                onChange={setTransactionType}
              />
              <p className="text-sm text-muted-foreground">
                Tipo seleccionado: <strong>{transactionType}</strong>
              </p>
            </div>
          </CodePreview>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Tamaños</h3>
          <CodePreview
            code={`<SegmentedControl size="sm" ... />
<SegmentedControl size="md" ... />
<SegmentedControl size="lg" ... />`}
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Small</span>
                <SegmentedControl
                  size="sm"
                  options={[
                    { value: "sm", label: "Small" },
                    { value: "md", label: "Medium" },
                    { value: "lg", label: "Large" },
                  ]}
                  value={size}
                  onChange={setSize}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Medium (Default)</span>
                <SegmentedControl
                  size="md"
                  options={[
                    { value: "sm", label: "Small" },
                    { value: "md", label: "Medium" },
                    { value: "lg", label: "Large" },
                  ]}
                  value={size}
                  onChange={setSize}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-muted-foreground">Large</span>
                <SegmentedControl
                  size="lg"
                  options={[
                    { value: "sm", label: "Small" },
                    { value: "md", label: "Medium" },
                    { value: "lg", label: "Large" },
                  ]}
                  value={size}
                  onChange={setSize}
                />
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Full Width */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">6. Ancho Completo</h3>
          <CodePreview
            code={`<SegmentedControl
  fullWidth
  options={[...]}
  value={period}
  onChange={setPeriod}
/>`}
          >
            <div className="max-w-md mx-auto">
              <SegmentedControl
                fullWidth
                options={[
                  { value: "day", label: "Día" },
                  { value: "week", label: "Semana" },
                  { value: "month", label: "Mes" },
                ]}
                value={period}
                onChange={setPeriod}
              />
            </div>
          </CodePreview>
        </div>

        {/* Disabled Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">7. Opciones Deshabilitadas</h3>
          <CodePreview
            code={`<SegmentedControl
  options={[
    { value: "day", label: "Día" },
    { value: "week", label: "Semana", disabled: true },
    { value: "month", label: "Mes" }
  ]}
  value={period}
  onChange={setPeriod}
/>`}
          >
            <SegmentedControl
              options={[
                { value: "day", label: "Día" },
                { value: "week", label: "Semana", disabled: true },
                { value: "month", label: "Mes" },
              ]}
              value={period}
              onChange={setPeriod}
            />
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🎯 Animación Fluida</h4>
            <p className="text-sm text-muted-foreground">
              El indicador se desliza suavemente entre opciones con animación ease-out.
            </p>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-bold mb-2">📱 iOS Style</h4>
            <p className="text-sm text-muted-foreground">
              Diseño inspirado en UISegmentedControl de iOS con glassmorphism.
            </p>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-bold mb-2">🔧 Flexible</h4>
            <p className="text-sm text-muted-foreground">
              Soporta texto, iconos, o combinaciones. ReactNode como label.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">♿ Accesible</h4>
            <p className="text-sm text-muted-foreground">
              Botones nativos con estados disabled y navegación por teclado.
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
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">options</TableCell>
                <TableCell className="font-mono text-xs">SegmentedControlOption[]</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Array de opciones a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">value</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Valor de la opción seleccionada.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onChange</TableCell>
                <TableCell className="font-mono text-xs">(value: string) =&gt; void</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Callback al cambiar la selección.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                <TableCell className="font-mono text-xs">'md'</TableCell>
                <TableCell>Tamaño del control.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">fullWidth</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Si es true, ocupa el 100% del ancho.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">className</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Clases CSS adicionales.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">SegmentedControlOption</h4>
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
                <TableCell className="font-mono text-xs">value</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Valor único de la opción.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">label</TableCell>
                <TableCell className="font-mono text-xs">React.ReactNode</TableCell>
                <TableCell>Contenido a mostrar (texto, icono, etc.).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">disabled</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Si es true, la opción no se puede seleccionar.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
