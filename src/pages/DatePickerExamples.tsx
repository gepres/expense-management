import { useState } from "react";
import { DatePicker } from "@components/common/DatePicker";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";

export function DatePickerExamples() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [futureDate, setFutureDate] = useState<Date>();
  const [pastDate, setPastDate] = useState<Date>();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">DatePicker Component</h2>
        <p className="text-muted-foreground">
          Selector de fecha con calendario desplegable. Alternativa moderna al input date nativo.
        </p>
      </div>
      

      <div className="space-y-8">
        {/* Basic DatePicker */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. DatePicker Básico</h3>
          <CodePreview
            minHeight="400px"
            classNamePreview="!justify-start"
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
              {selectedDate && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Fecha seleccionada: {selectedDate.toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </CodePreview>
        </div>

        {/* Future Dates Only */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Solo Fechas Futuras</h3>
          <CodePreview
            minHeight="400px"
            classNamePreview="!justify-start"
            code={`<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date()}
  placeholder="Solo fechas futuras"
/>`}
          >
            <div className="max-w-sm">
              <DatePicker
                value={futureDate}
                onChange={setFutureDate}
                minDate={new Date()}
                placeholder="Solo fechas futuras"
              />
            </div>
          </CodePreview>
        </div>

        {/* Past Dates Only */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Solo Fechas Pasadas</h3>
          <CodePreview
            minHeight="400px"
            classNamePreview="!justify-start"
            code={`<DatePicker
  value={date}
  onChange={setDate}
  maxDate={new Date()}
  placeholder="Solo fechas pasadas"
/>`}
          >
            <div className="max-w-sm">
              <DatePicker
                value={pastDate}
                onChange={setPastDate}
                maxDate={new Date()}
                placeholder="Solo fechas pasadas"
              />
            </div>
          </CodePreview>
        </div>

        {/* Date Range */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Rango de Fechas</h3>
          <CodePreview
            minHeight="400px"
            classNamePreview="!justify-start"
            code={`<DatePicker
  value={date}
  onChange={setDate}
  minDate={new Date(2024, 0, 1)}
  maxDate={new Date(2024, 11, 31)}
  placeholder="Solo año 2024"
/>`}
          >
            <div className="max-w-sm">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                minDate={new Date(2024, 0, 1)}
                maxDate={new Date(2024, 11, 31)}
                placeholder="Solo año 2024"
              />
            </div>
          </CodePreview>
        </div>

        {/* Disabled */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Deshabilitado</h3>
          <CodePreview
            minHeight="400px"
            classNamePreview="!justify-start"
            code={`<DatePicker
  value={date}
  onChange={setDate}
  disabled
/>`}
          >
            <div className="max-w-sm">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                disabled
                placeholder="DatePicker deshabilitado"
              />
            </div>
          </CodePreview>
        </div>

        {/* Features */}
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

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎯 Día Actual Destacado</h4>
            <p className="text-sm text-muted-foreground">
              El día actual se muestra en negrita con color primario.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">✨ Animación Suave</h4>
            <p className="text-sm text-muted-foreground">
              Calendario aparece con animación fade-in y slide-in.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

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
              <TableRow>
                <TableCell className="font-mono text-xs">placeholder</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>'Seleccionar fecha'</TableCell>
                <TableCell>Texto placeholder cuando no hay fecha.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">disabled</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Deshabilita el DatePicker.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
