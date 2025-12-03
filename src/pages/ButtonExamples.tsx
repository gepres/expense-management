/**
 * Ejemplos de uso del componente Button
 */

import { useState } from 'react';
import Button, {
  ButtonGroup,
  IconButton,
  PillButton,
} from '@components/common/Button';
import CodePreview from "@components/common/CodePreview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Card } from "@components/common/Card";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Check,
  Download,
  Upload,
  Settings,
  Search,
} from 'lucide-react';

export function ButtonExamples() {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('food');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
  };

  const categories = [
    { id: 'food', label: 'Alimentación' },
    { id: 'transport', label: 'Transporte' },
    { id: 'entertainment', label: 'Entretenimiento' },
    { id: 'health', label: 'Salud' },
  ];

  const items = [
    { id: 1, name: 'Gasto 1', amount: 100 },
    { id: 2, name: 'Gasto 2', amount: 200 },
  ];

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Button Component</h2>
        <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6">
          Componente de botón completo con múltiples variantes, tamaños y estados.
        </p>

        {/* Características */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-bold mb-1">7 Variantes</h3>
            <p className="text-sm text-muted-foreground">
              Primary, secondary, destructive, ghost, success, outline y blue
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <div className="text-2xl mb-2">📏</div>
            <h3 className="font-bold mb-1">5 Tamaños</h3>
            <p className="text-sm text-muted-foreground">
              Desde extra small (xs) hasta extra large (xl)
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-bold mb-1">Estados Dinámicos</h3>
            <p className="text-sm text-muted-foreground">
              Loading, disabled y active con animaciones suaves
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <div className="text-2xl mb-2">🔧</div>
            <h3 className="font-bold mb-1">Tipos Especiales</h3>
            <p className="text-sm text-muted-foreground">
              Icon-only, pill, floating (FAB) y full-width
            </p>
          </div>
        </div>
      </div>

      {/* 1. Variantes de Color */}
      <div className="space-y-4">
        <h3 className="text-lg sm:text-xl font-bold">1. Variantes de Color</h3>
        <CodePreview
          code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="success">Success</Button>
<Button variant="blue">Blue</Button>
<Button variant="outline">Outline</Button>`}
        >
          <div className="flex flex-col md:flex-row gap-2 flex-wrap">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="blue">Blue</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </CodePreview>
      </div>

      {/* 2. Tamaños */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">2. Tamaños</h3>
        <CodePreview
          code={`<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>`}
        >
          <div className="flex flex-col items-start gap-2">
            <Button size="xs">Extra Small (xs)</Button>
            <Button size="sm">Small (sm)</Button>
            <Button size="md">Medium (md) - Default</Button>
            <Button size="lg">Large (lg)</Button>
            <Button size="xl">Extra Large (xl)</Button>
          </div>
        </CodePreview>
      </div>

      {/* 3. Con Iconos */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">3. Botones con Iconos</h3>
        <CodePreview
          code={`<Button icon={Plus}>Agregar</Button>
<Button icon={Save} variant="success">Guardar</Button>
<Button icon={Download} iconPosition="right">Descargar</Button>`}
        >
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <Button icon={Plus} iconPosition="left">
              Agregar
            </Button>
            <Button icon={Save} variant="success">
              Guardar
            </Button>
            <Button icon={Trash2} variant="destructive">
              Eliminar
            </Button>
            <Button icon={Download} iconPosition="right">
              Descargar
            </Button>
          </div>
        </CodePreview>
      </div>

      {/* 4. Estados de Carga */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">4. Estados de Carga</h3>
        <CodePreview
          code={`<Button loading loadingText="Guardando...">Guardar</Button>
<Button loading spinnerVariant="dots3">Loading</Button>`}
        >
          <div className="flex flex-col sm:flex-row gap-2">
            <Button loading loadingText="Guardando...">
              Guardar
            </Button>
            <Button loading spinnerVariant="dots3" loadingText="Dots 3">
              Dots 3
            </Button>
          </div>
        </CodePreview>
      </div>

      {/* 5. Icon Only */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">5. Botones Solo Icono</h3>
        <CodePreview
          code={`<IconButton icon={Edit2} size="sm" label="Editar" />
<IconButton icon={Trash2} variant="destructive" label="Eliminar" />`}
        >
          <div className="flex flex-wrap gap-2">
            <IconButton icon={Edit2} size="sm" label="Editar" />
            <IconButton icon={Edit2} size="md" label="Editar" />
            <IconButton icon={Plus} variant="primary" label="Agregar" />
            <IconButton icon={Trash2} variant="destructive" label="Eliminar" />
            <IconButton icon={Check} variant="success" label="Confirmar" />
          </div>
        </CodePreview>
      </div>

      {/* 6. Pill Buttons */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">6. Botones Pill</h3>
        <CodePreview
          code={`<PillButton selected={true} onClick={...}>Alimentación</PillButton>
<PillButton selected={false} onClick={...}>Transporte</PillButton>`}
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <PillButton
                key={cat.id}
                selected={selectedCategory === cat.id}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </PillButton>
            ))}
          </div>
        </CodePreview>
      </div>

      {/* 7. Estados */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">7. Estados</h3>
        <CodePreview
          code={`<Button disabled>Disabled</Button>
<Button active>Active</Button>`}
        >
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button variant="secondary" disabled>
              Disabled Secondary
            </Button>
            <Button active>Active State</Button>
          </div>
        </CodePreview>
      </div>

      {/* 8. Full Width */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">8. Full Width</h3>
        <CodePreview
          code={`<Button fullWidth variant="primary">Botón Ancho Completo</Button>
<ButtonGroup fullWidth>
  <Button>50%</Button>
  <Button>50%</Button>
</ButtonGroup>`}
        >
          <div className="space-y-4 max-w-md mx-auto">
            <Button fullWidth variant="primary">
              Botón Ancho Completo
            </Button>
            <ButtonGroup fullWidth>
              <Button variant="secondary">50%</Button>
              <Button variant="primary">50%</Button>
            </ButtonGroup>
          </div>
        </CodePreview>
      </div>

      {/* 9. Button Groups */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">9. Button Groups</h3>
        <CodePreview
          code={`<ButtonGroup spacing="tight">
  <Button size="sm">Tight</Button>
  <Button size="sm">Spacing</Button>
</ButtonGroup>

<ButtonGroup orientation="vertical">
  <Button icon={Settings}>Configuración</Button>
  <Button icon={Search}>Buscar</Button>
</ButtonGroup>`}
        >
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <ButtonGroup spacing="tight">
                <Button size="sm">Tight</Button>
                <Button size="sm">Spacing</Button>
              </ButtonGroup>
              <ButtonGroup spacing="normal">
                <Button size="sm">Normal</Button>
                <Button size="sm">Spacing</Button>
              </ButtonGroup>
            </div>
            <div className="max-w-xs">
              <ButtonGroup orientation="vertical" spacing="normal">
                <Button fullWidth icon={Settings}>
                  Configuración
                </Button>
                <Button fullWidth icon={Search}>
                  Buscar
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </CodePreview>
      </div>

      {/* 10. Ejemplo en Formulario */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">10. Ejemplo en Formulario</h3>
        <CodePreview
          code={`<form onSubmit={handleSubmit}>
  <input className="..." />
  <ButtonGroup fullWidth>
    <Button variant="secondary" disabled={loading}>Cancelar</Button>
    <Button type="submit" loading={loading}>Guardar</Button>
  </ButtonGroup>
</form>`}
        >
          <div className="max-w-md mx-auto">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Descripción del gasto"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
              />
              <ButtonGroup fullWidth>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loading}
                  icon={X}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  loadingText="Guardando..."
                  icon={Save}
                >
                  Guardar
                </Button>
              </ButtonGroup>
            </form>
          </div>
        </CodePreview>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Props Reference</h3>
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
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'primary' | 'secondary' | 'destructive' | 'ghost' | 'success' | 'outline' | 'blue'</TableCell>
                <TableCell>Estilo visual del botón.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'xs' | 'sm' | 'md' | 'lg' | 'xl'</TableCell>
                <TableCell>Tamaño del botón.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">loading</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Muestra estado de carga.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">loadingText</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Texto a mostrar durante la carga.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell>Icono a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">iconPosition</TableCell>
                <TableCell className="font-mono text-xs">'left' | 'right'</TableCell>
                <TableCell>Posición del icono.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">fullWidth</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Ocupa el 100% del ancho disponible.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">active</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Fuerza el estado activo.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
