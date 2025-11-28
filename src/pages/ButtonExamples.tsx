/**
 * Ejemplos de uso del componente Button
 */

import { useState } from 'react';
import Button, {
  ButtonGroup,
  IconButton,
  PillButton,
} from '@components/common/Button';
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
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Button Component</h2>
        <p className="text-muted-foreground text-lg mb-6">
          Componente de botón completo con múltiples variantes, tamaños y estados.
        </p>

        {/* Características */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-xl border border-border">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-bold mb-1">6 Variantes</h3>
            <p className="text-sm text-muted-foreground">
              Primary, secondary, destructive, ghost, success y outline
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
        <div>
          <h3 className="text-xl font-bold">1. Variantes de Color</h3>
          <p className="text-sm text-muted-foreground">
            6 variantes para diferentes tipos de acciones
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl">
          <ButtonGroup>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="outline">Outline</Button>
          </ButtonGroup>
        </div>
      </div>

      {/* 2. Tamaños */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">2. Tamaños</h3>
          <p className="text-sm text-muted-foreground">
            5 tamaños disponibles: xs, sm, md (default), lg, xl
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl">
          <ButtonGroup orientation="vertical" spacing="normal">
            <Button size="xs">Extra Small (xs)</Button>
            <Button size="sm">Small (sm)</Button>
            <Button size="md">Medium (md) - Default</Button>
            <Button size="lg">Large (lg)</Button>
            <Button size="xl">Extra Large (xl)</Button>
          </ButtonGroup>
        </div>
      </div>

      {/* 3. Con Iconos */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">3. Botones con Iconos</h3>
          <p className="text-sm text-muted-foreground">
            Iconos a la izquierda o derecha del texto
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Icono a la izquierda (default)</p>
            <ButtonGroup>
              <Button icon={Plus} iconPosition="left">
                Agregar
              </Button>
              <Button icon={Save} variant="success">
                Guardar
              </Button>
              <Button icon={Trash2} variant="destructive">
                Eliminar
              </Button>
            </ButtonGroup>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Icono a la derecha</p>
            <ButtonGroup>
              <Button icon={Download} iconPosition="right">
                Descargar
              </Button>
              <Button icon={Upload} iconPosition="right" variant="outline">
                Subir
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </div>

      {/* 4. Estados de Carga */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">4. Estados de Carga</h3>
          <p className="text-sm text-muted-foreground">
            Diferentes spinners y estados loading
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Con texto de carga</p>
            <ButtonGroup>
              <Button loading loadingText="Guardando...">
                Guardar
              </Button>
              {/* <LoadingButton isLoading loadingText="Procesando...">
                Procesar
              </LoadingButton>
              <Button  loadingText="Eliminando..." variant="destructive">
                Eliminar
              </Button> */}
            </ButtonGroup>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Diferentes spinners</p>
            <ButtonGroup>
              <Button loading spinnerVariant="dots3" loadingText="Dots 3">
                Dots 3
              </Button>
              {/* <Button loading spinnerVariant="simple" loadingText="Simple">
                Simple
              </Button>
              <Button loading spinnerVariant="material" loadingText="Material">
                Material
              </Button> */}
            </ButtonGroup>
          </div>
        </div>
      </div>

      {/* 5. Icon Only */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">5. Botones Solo Icono</h3>
          <p className="text-sm text-muted-foreground">
            Perfectos para acciones rápidas y listas
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Diferentes tamaños</p>
            <ButtonGroup>
              <IconButton icon={Edit2} size="xs" label="Editar" />
              <IconButton icon={Edit2} size="sm" label="Editar" />
              <IconButton icon={Edit2} size="md" label="Editar" />
              <IconButton icon={Edit2} size="lg" label="Editar" />
              <IconButton icon={Edit2} size="xl" label="Editar" />
            </ButtonGroup>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Diferentes variantes</p>
            <ButtonGroup>
              <IconButton icon={Plus} variant="primary" label="Agregar" />
              <IconButton icon={Edit2} variant="ghost" label="Editar" />
              <IconButton icon={Trash2} variant="destructive" label="Eliminar" />
              <IconButton icon={Check} variant="success" label="Confirmar" />
            </ButtonGroup>
          </div>
        </div>
      </div>

      {/* 6. Pill Buttons */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">6. Botones Pill (Categorías)</h3>
          <p className="text-sm text-muted-foreground">
            Ideales para filtros y categorías seleccionables
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl">
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
        </div>
      </div>

      {/* 7. Estados */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">7. Estados (Disabled, Active)</h3>
          <p className="text-sm text-muted-foreground">
            Disabled para bloquear interacción, Active para resaltar selección
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Disabled</p>
            <ButtonGroup>
              <Button disabled>Primary Disabled</Button>
              <Button variant="secondary" disabled>
                Secondary Disabled
              </Button>
              <Button variant="destructive" disabled>
                Destructive Disabled
              </Button>
            </ButtonGroup>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Active (Selected)</p>
            <ButtonGroup>
              <Button active>Seleccionado</Button>
              <Button>Normal</Button>
              <Button>Normal</Button>
            </ButtonGroup>
          </div>
        </div>
      </div>

      {/* 8. Full Width */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">8. Full Width</h3>
          <p className="text-sm text-muted-foreground">
            Botones que ocupan todo el ancho disponible
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl max-w-md space-y-4">
          <Button fullWidth variant="primary">
            Botón Ancho Completo
          </Button>
          <ButtonGroup fullWidth>
            <Button variant="secondary">50%</Button>
            <Button variant="primary">50%</Button>
          </ButtonGroup>
        </div>
      </div>

      {/* 9. Button Groups */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">9. Button Groups</h3>
          <p className="text-sm text-muted-foreground">
            Agrupa botones con espaciado consistente
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Horizontal (Default)</p>
            <ButtonGroup orientation="horizontal" spacing="normal">
              <Button variant="secondary">Cancelar</Button>
              <Button variant="primary">Guardar</Button>
            </ButtonGroup>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Vertical</p>
            <ButtonGroup orientation="vertical" spacing="normal">
              <Button fullWidth icon={Settings}>
                Configuración
              </Button>
              <Button fullWidth icon={Search}>
                Buscar
              </Button>
              <Button fullWidth icon={Download}>
                Descargar
              </Button>
            </ButtonGroup>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Different Spacings</p>
            <div className="space-y-2">
              <ButtonGroup spacing="tight">
                <Button size="sm">Tight</Button>
                <Button size="sm">Spacing</Button>
              </ButtonGroup>
              <ButtonGroup spacing="normal">
                <Button size="sm">Normal</Button>
                <Button size="sm">Spacing</Button>
              </ButtonGroup>
              <ButtonGroup spacing="loose">
                <Button size="sm">Loose</Button>
                <Button size="sm">Spacing</Button>
              </ButtonGroup>
            </div>
          </div>
        </div>
      </div>

      {/* 10. Ejemplo en Formulario */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">10. Ejemplo en Formulario</h3>
          <p className="text-sm text-muted-foreground">Uso real en un formulario</p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl max-w-md">
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
      </div>

      {/* 11. Acciones en Lista */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xl font-bold">11. Acciones en Lista</h3>
          <p className="text-sm text-muted-foreground">
            Botones de acción para items en listas
          </p>
        </div>
        <div className="p-6 bg-muted/30 rounded-xl space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-card border border-border rounded-xl group hover:border-primary/50 transition-colors"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">S/ {item.amount}</p>
              </div>

              <ButtonGroup spacing="tight">
                <IconButton
                  icon={Edit2}
                  variant="ghost"
                  size="sm"
                  label="Editar"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <IconButton
                  icon={Trash2}
                  variant="ghost"
                  size="sm"
                  label="Eliminar"
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                />
              </ButtonGroup>
            </div>
          ))}
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Props Reference</h3>

        <div className="bg-muted/50 rounded-xl p-6 border border-border space-y-6">
          <div>
            <h4 className="font-bold mb-4 text-lg">Button Props</h4>
            <div className="space-y-2 text-sm font-mono bg-background p-4 rounded-lg">
              <p>variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'success' | 'outline'</p>
              <p>size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'</p>
              <p>loading?: boolean</p>
              <p>loadingText?: string</p>
              <p>active?: boolean</p>
              <p>pill?: boolean</p>
              <p>iconOnly?: boolean</p>
              <p>floating?: boolean</p>
              <p>fullWidth?: boolean</p>
              <p>icon?: LucideIcon</p>
              <p>iconPosition?: 'left' | 'right'</p>
              <p>spinnerVariant?: 'simple' | 'dots' | 'dots2' | 'dots3' | 'material'</p>
              <p className="text-muted-foreground mt-2">+ Todos los props nativos de HTMLButtonElement</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">ButtonGroup Props</h4>
            <div className="space-y-2 text-sm font-mono bg-background p-4 rounded-lg">
              <p>children: React.ReactNode</p>
              <p>orientation?: 'horizontal' | 'vertical'</p>
              <p>spacing?: 'tight' | 'normal' | 'loose'</p>
              <p>fullWidth?: boolean</p>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">Auxiliary Components</h4>
            <div className="space-y-2 text-sm">
              <p>
                <code className="bg-background px-2 py-1 rounded">IconButton</code> - Botón solo con icono
              </p>
              <p>
                <code className="bg-background px-2 py-1 rounded">FloatingActionButton</code> - FAB flotante
              </p>
              <p>
                <code className="bg-background px-2 py-1 rounded">PillButton</code> - Botón tipo píldora
              </p>
              <p>
                <code className="bg-background px-2 py-1 rounded">LoadingButton</code> - Botón con loading simplificado
              </p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg">
          <p className="text-sm">
            <strong>Tip:</strong> Consulta el componente{' '}
            <code className="bg-background px-2 py-1 rounded text-xs">Button.tsx</code> para ver la
            implementación completa y todos los detalles de cada prop.
          </p>
        </div>
      </div>

      {/* Guía de Uso */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold">Guía de Uso Rápida</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <h4 className="font-bold mb-3">📌 Cuándo usar cada variante</h4>
            <div className="space-y-2 text-sm">
              <p>
                <strong>primary:</strong> Acción principal (Guardar, Confirmar)
              </p>
              <p>
                <strong>secondary:</strong> Acciones secundarias (Cancelar)
              </p>
              <p>
                <strong>destructive:</strong> Acciones destructivas (Eliminar)
              </p>
              <p>
                <strong>ghost:</strong> Acciones sutiles (Editar)
              </p>
              <p>
                <strong>success:</strong> Confirmaciones positivas
              </p>
              <p>
                <strong>outline:</strong> Alternativa visual sin fondo
              </p>
            </div>
          </div>

          <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
            <h4 className="font-bold mb-3 text-green-600">✅ Mejores Prácticas</h4>
            <div className="space-y-2 text-sm">
              <p>• Usa IconButton para acciones sin texto</p>
              <p>• Usa PillButton para categorías/filtros</p>
              <p>• Siempre proporciona loadingText cuando loading=true</p>
              <p>• Usa label en IconButton para accesibilidad</p>
              <p>• Prefiere fullWidth en modales móviles</p>
              <p>• Agrupa botones relacionados con ButtonGroup</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
