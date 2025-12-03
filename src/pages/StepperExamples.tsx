import { useState } from "react";
import { Stepper } from "@components/common/Stepper";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";

export function StepperExamples() {
  const [quantity, setQuantity] = useState(5);
  const [price, setPrice] = useState(100);
  const [percentage, setPercentage] = useState(50);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Stepper Component</h2>
        <p className="text-muted-foreground mb-4">
          Control numérico estilizado con botones +/- para incrementar/decrementar valores.
          Incluye 4 variantes visuales, múltiples tamaños, animaciones suaves y formato personalizable.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <Stepper variant="default" value={5} onChange={() => {}} min={0} max={10} />
          <Stepper variant="primary" value={5} onChange={() => {}} min={0} max={10} />
          <Stepper variant="outline" value={5} onChange={() => {}} min={0} max={10} />
          <Stepper variant="filled" value={5} onChange={() => {}} min={0} max={10} />
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Stepper */}
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
                Cantidad: <strong>{quantity}</strong>
              </p>
            </div>
          </CodePreview>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Variantes de Estilo</h3>
          <CodePreview
            code={`<Stepper variant="default" ... />
<Stepper variant="primary" ... />
<Stepper variant="outline" ... />
<Stepper variant="filled" ... />`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <Stepper variant="default" value={quantity} onChange={setQuantity} min={0} max={10} />
                <span className="text-sm text-muted-foreground">Default (subtle)</span>
              </div>
              <div className="flex items-center gap-3">
                <Stepper variant="primary" value={quantity} onChange={setQuantity} min={0} max={10} />
                <span className="text-sm text-muted-foreground">Primary (destacado)</span>
              </div>
              <div className="flex items-center gap-3">
                <Stepper variant="outline" value={quantity} onChange={setQuantity} min={0} max={10} />
                <span className="text-sm text-muted-foreground">Outline (minimalista)</span>
              </div>
              <div className="flex items-center gap-3">
                <Stepper variant="filled" value={quantity} onChange={setQuantity} min={0} max={10} />
                <span className="text-sm text-muted-foreground">Filled (moderno)</span>
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Tamaños</h3>
          <CodePreview
            code={`<Stepper size="sm" ... />
<Stepper size="md" ... />
<Stepper size="lg" ... />`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Stepper variant="primary" size="sm" value={quantity} onChange={setQuantity} min={0} max={10} />
                <span className="text-sm text-muted-foreground">Small</span>
              </div>
              <div className="flex items-center gap-3">
                <Stepper variant="primary" size="md" value={quantity} onChange={setQuantity} min={0} max={10} />
                <span className="text-sm text-muted-foreground">Medium (default)</span>
              </div>
              <div className="flex items-center gap-3">
                <Stepper variant="primary" size="lg" value={quantity} onChange={setQuantity} min={0} max={10} />
                <span className="text-sm text-muted-foreground">Large</span>
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Custom Step */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Incremento Personalizado</h3>
          <CodePreview
            code={`<Stepper
  value={value}
  onChange={setValue}
  min={0}
  max={1000}
  step={50}
/>`}
          >
            <div className="flex flex-col items-center gap-3">
              <Stepper
                value={price}
                onChange={setPrice}
                min={0}
                max={1000}
                step={50}
              />
              <p className="text-sm text-muted-foreground">
                Incremento de 50 en 50
              </p>
            </div>
          </CodePreview>
        </div>

        {/* Custom Format */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Formato Personalizado</h3>
          <CodePreview
            code={`// Precio con moneda
<Stepper
  value={price}
  onChange={setPrice}
  formatValue={(v) => \`S/ \${v}\`}
  step={10}
/>

// Porcentaje
<Stepper
  value={percentage}
  onChange={setPercentage}
  formatValue={(v) => \`\${v}%\`}
  min={0}
  max={100}
  step={5}
/>`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2">
                <Stepper
                  value={price}
                  onChange={setPrice}
                  min={0}
                  max={500}
                  step={10}
                  formatValue={(v) => `S/ ${v}`}
                />
                <span className="text-xs text-muted-foreground">Precio con moneda</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Stepper
                  value={percentage}
                  onChange={setPercentage}
                  min={0}
                  max={100}
                  step={5}
                  formatValue={(v) => `${v}%`}
                />
                <span className="text-xs text-muted-foreground">Porcentaje</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Stepper
                  value={quantity}
                  onChange={setQuantity}
                  min={0}
                  max={50}
                  step={1}
                  formatValue={(v) => `${v} items`}
                />
                <span className="text-xs text-muted-foreground">Items</span>
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Variant Combinations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">6. Combinaciones Destacadas</h3>
          <CodePreview
            code={`// Precio con variante primary
<Stepper
  variant="primary"
  size="lg"
  value={price}
  onChange={setPrice}
  formatValue={(v) => \`S/ \${v}\`}
  step={10}
/>

// Porcentaje con outline
<Stepper
  variant="outline"
  value={percentage}
  onChange={setPercentage}
  formatValue={(v) => \`\${v}%\`}
  step={5}
/>`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <Stepper
                  variant="primary"
                  size="lg"
                  value={price}
                  onChange={setPrice}
                  min={0}
                  max={500}
                  step={10}
                  formatValue={(v) => `S/ ${v}`}
                />
                <span className="text-xs text-muted-foreground">Precio destacado (primary + large)</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Stepper
                  variant="outline"
                  value={percentage}
                  onChange={setPercentage}
                  min={0}
                  max={100}
                  step={5}
                  formatValue={(v) => `${v}%`}
                />
                <span className="text-xs text-muted-foreground">Porcentaje minimalista (outline)</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Stepper
                  variant="filled"
                  size="sm"
                  value={quantity}
                  onChange={setQuantity}
                  min={0}
                  max={50}
                  step={1}
                  formatValue={(v) => `${v} items`}
                />
                <span className="text-xs text-muted-foreground">Items compacto (filled + small)</span>
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Without Value Display */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">7. Sin Mostrar Valor</h3>
          <CodePreview
            code={`<Stepper
  value={value}
  onChange={setValue}
  showValue={false}
/>`}
          >
            <div className="flex flex-col items-center gap-3">
              <Stepper
                variant="primary"
                value={quantity}
                onChange={setQuantity}
                min={0}
                max={10}
                showValue={false}
              />
              <p className="text-sm text-muted-foreground">
                Valor actual: {quantity}
              </p>
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 Variantes de Estilo</h4>
            <p className="text-sm text-muted-foreground">
              4 variantes visuales (default, primary, outline, filled) con animaciones suaves.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">➕➖ Incremento/Decremento</h4>
            <p className="text-sm text-muted-foreground">
              Botones con efectos hover, active y focus ring para mejor feedback visual.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎯 Límites Configurables</h4>
            <p className="text-sm text-muted-foreground">
              Define min, max y step personalizados según tus necesidades.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🔢 Formato Flexible</h4>
            <p className="text-sm text-muted-foreground">
              Personaliza cómo se muestra el valor (moneda, porcentaje, etc.).
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">✨ Animaciones Sutiles</h4>
            <p className="text-sm text-muted-foreground">
              Transiciones suaves, scale en active y estados visuales claros.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">♿ Estados Deshabilitados</h4>
            <p className="text-sm text-muted-foreground">
              Botones se deshabilitan automáticamente en los límites con opacidad reducida.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

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
                <TableCell>Valor mínimo permitido.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">max</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>100</TableCell>
                <TableCell>Valor máximo permitido.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">step</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell>1</TableCell>
                <TableCell>Incremento/decremento por clic.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                <TableCell>'md'</TableCell>
                <TableCell>Tamaño del stepper.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'primary' | 'outline' | 'filled'</TableCell>
                <TableCell>'default'</TableCell>
                <TableCell>Variante de estilo visual.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">showValue</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>true</TableCell>
                <TableCell>Mostrar valor en el centro.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">formatValue</TableCell>
                <TableCell className="font-mono text-xs">(value: number) =&gt; string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Función para formatear el valor mostrado.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">disabled</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>false</TableCell>
                <TableCell>Deshabilita el stepper completamente.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
