import { ActivityList } from '@components/common/ActivityList';
import { QuickAction, QuickActionGrid } from '@components/common/QuickAction';
import CodePreview from '@components/common/CodePreview';
import { Card } from '@components/common/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/common/Table';
import { UtensilsCrossed, Car, Film, Target, Bot, Settings, Users, TrendingUp, ShoppingCart } from 'lucide-react';
import { Badge } from '@components/common/Badge';

export function DashboardWidgetsExamples() {
  const mockActivities = [
    {
      id: '1',
      icon: UtensilsCrossed,
      title: 'Almuerzo en restaurante',
      subtitle: '15 Nov 2024',
      value: 'S/ 45.00',
      valueSubtext: 'EFECTIVO',
    },
    {
      id: '2',
      icon: Car,
      title: 'Gasolina',
      subtitle: '14 Nov 2024',
      value: 'S/ 120.00',
      valueSubtext: 'TARJETA',
    },
    {
      id: '3',
      icon: Film,
      title: 'Netflix suscripción',
      subtitle: '12 Nov 2024',
      value: '$ 15.99',
      valueSubtext: 'DÉBITO',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Widgets</h2>
        <p className="text-muted-foreground mb-4">
          Componentes complementarios para crear dashboards completos: listas de actividad
          y acciones rápidas.
        </p>
      </div>

      {/* ActivityList Component */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold">ActivityList Component</h3>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">1. Lista Básica</h4>
          <CodePreview
            code={`<ActivityList
  title="Últimos Movimientos"
  items={[
    {
      id: '1',
      icon: UtensilsCrossed,
      title: 'Almuerzo en restaurante',
      subtitle: '15 Nov 2024',
      value: 'S/ 45.00',
      valueSubtext: 'EFECTIVO'
    },
    // ... más items
  ]}
/>`}
          >
            <ActivityList
              title="Últimos Movimientos"
              items={mockActivities}
            />
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">2. Con Header y Footer Actions</h4>
          <CodePreview
            code={`<ActivityList
  title="Actividad Reciente"
  items={items}
  headerAction={{
    label: "Ver todo",
    href: "/gastos"
  }}
  footerAction={{
    label: "+ Agregar nuevo",
    onClick: () => alert('Nuevo')
  }}
/>`}
          >
            <ActivityList
              title="Actividad Reciente"
              items={mockActivities}
              headerAction={{
                label: 'Ver todo',
                onClick: () => alert('Ver todo'),
              }}
              footerAction={{
                label: '+ Agregar nuevo gasto',
                onClick: () => alert('Nuevo gasto'),
              }}
            />
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">3. Con Badges</h4>
          <CodePreview
            code={`<ActivityList
  title="Transacciones"
  items={[
    {
      id: '1',
      icon: ShoppingCart,
      title: 'Compra en supermercado',
      subtitle: 'Hace 2 horas',
      value: 'S/ 250.00',
      badge: <Badge variant="success" size="sm">Nuevo</Badge>
    }
  ]}
/>`}
          >
            <ActivityList
              title="Transacciones"
              items={[
                {
                  id: '1',
                  icon: ShoppingCart,
                  title: 'Compra en supermercado',
                  subtitle: 'Hace 2 horas',
                  value: 'S/ 250.00',
                  badge: <Badge variant="success" size="sm">Nuevo</Badge>,
                },
                {
                  id: '2',
                  icon: TrendingUp,
                  title: 'Ingreso freelance',
                  subtitle: 'Ayer',
                  value: 'S/ 1,500.00',
                  badge: <Badge variant="primary" size="sm">Ingreso</Badge>,
                },
              ]}
            />
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">4. Estado Vacío Personalizado</h4>
          <CodePreview
            code={`<ActivityList
  title="Movimientos"
  items={[]}
  emptyMessage="No hay movimientos registrados"
  emptyIcon={TrendingUp}
/>`}
          >
            <ActivityList
              title="Movimientos"
              items={[]}
              emptyMessage="No hay movimientos registrados este mes"
              emptyIcon={TrendingUp}
            />
          </CodePreview>
        </div>
      </div>

      {/* QuickAction Component */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold">QuickAction Component</h3>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">1. Acciones Rápidas Básicas</h4>
          <CodePreview
            code={`<QuickActionGrid columns={2}>
  <QuickAction
    icon={Target}
    label="Presupuestos"
    iconColor="text-blue-500"
    onClick={() => alert('Presupuestos')}
  />
  <QuickAction
    icon={Bot}
    label="Asistente IA"
    iconColor="text-purple-500"
    href="/asistente"
  />
</QuickActionGrid>`}
          >
            <QuickActionGrid columns={2}>
              <QuickAction
                icon={Target}
                label="Presupuestos"
                iconColor="text-blue-500"
                onClick={() => alert('Presupuestos')}
              />
              <QuickAction
                icon={Bot}
                label="Asistente IA"
                iconColor="text-purple-500"
                onClick={() => alert('Asistente IA')}
              />
            </QuickActionGrid>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">2. Diferentes Tamaños</h4>
          <CodePreview
            code={`<QuickActionGrid columns={3}>
  <QuickAction size="sm" ... />
  <QuickAction size="md" ... />
  <QuickAction size="lg" ... />
</QuickActionGrid>`}
          >
            <QuickActionGrid columns={3}>
              <QuickAction
                size="sm"
                icon={Settings}
                label="Small"
                iconColor="text-gray-500"
              />
              <QuickAction
                size="md"
                icon={Users}
                label="Medium"
                iconColor="text-blue-500"
              />
              <QuickAction
                size="lg"
                icon={TrendingUp}
                label="Large"
                iconColor="text-green-500"
              />
            </QuickActionGrid>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">3. Variantes de Color</h4>
          <CodePreview
            code={`<QuickActionGrid columns={3}>
  <QuickAction variant="default" ... />
  <QuickAction variant="primary" ... />
  <QuickAction variant="success" ... />
  <QuickAction variant="warning" ... />
  <QuickAction variant="danger" ... />
</QuickActionGrid>`}
          >
            <QuickActionGrid columns={3} gap="sm">
              <QuickAction
                variant="default"
                icon={Settings}
                label="Default"
              />
              <QuickAction
                variant="primary"
                icon={Target}
                label="Primary"
              />
              <QuickAction
                variant="success"
                icon={TrendingUp}
                label="Success"
              />
              <QuickAction
                variant="warning"
                icon={ShoppingCart}
                label="Warning"
              />
              <QuickAction
                variant="danger"
                icon={Film}
                label="Danger"
              />
            </QuickActionGrid>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">4. Con Badges</h4>
          <CodePreview
            code={`<QuickAction
  icon={Bot}
  label="Asistente IA"
  iconColor="text-purple-500"
  badge={<Badge variant="error" size="sm" dot />}
/>`}
          >
            <QuickActionGrid columns={2}>
              <QuickAction
                icon={Bot}
                label="Asistente IA"
                iconColor="text-purple-500"
                badge={<Badge variant="error" size="sm" dot />}
              />
              <QuickAction
                icon={Users}
                label="Notificaciones"
                iconColor="text-blue-500"
                badge={<Badge variant="primary" size="sm">3</Badge>}
              />
            </QuickActionGrid>
          </CodePreview>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold">5. Grid con 3 y 4 Columnas</h4>
          <CodePreview
            code={`<QuickActionGrid columns={4} gap="sm">
  <QuickAction icon={Target} label="Presupuestos" />
  <QuickAction icon={Bot} label="IA" />
  <QuickAction icon={Settings} label="Config" />
  <QuickAction icon={Users} label="Usuarios" />
</QuickActionGrid>`}
          >
            <QuickActionGrid columns={4} gap="sm">
              <QuickAction
                icon={Target}
                label="Presupuestos"
                iconColor="text-blue-500"
              />
              <QuickAction
                icon={Bot}
                label="IA"
                iconColor="text-purple-500"
              />
              <QuickAction
                icon={Settings}
                label="Config"
                iconColor="text-gray-500"
              />
              <QuickAction
                icon={Users}
                label="Usuarios"
                iconColor="text-green-500"
              />
            </QuickActionGrid>
          </CodePreview>
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-bold mb-2">📋 ActivityList</h4>
          <p className="text-sm text-muted-foreground">
            Lista de actividades con iconos, valores, acciones header/footer y estado vacío personalizable.
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-bold mb-2">⚡ QuickAction</h4>
          <p className="text-sm text-muted-foreground">
            Botones de acceso rápido con iconos, badges, variantes de color y grid responsive.
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-bold mb-2">🎨 Totalmente Temáticos</h4>
          <p className="text-sm text-muted-foreground">
            Ambos componentes se adaptan automáticamente al modo oscuro/claro.
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-bold mb-2">📱 Mobile-First</h4>
          <p className="text-sm text-muted-foreground">
            Diseñados para funcionar perfectamente en móviles y tablets.
          </p>
        </Card>
      </div>

      {/* Props Reference */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Props Reference</h3>

        {/* ActivityList Props */}
        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">ActivityList Props</h4>
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
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Título del header.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">items</TableCell>
                <TableCell className="font-mono text-xs">ActivityItem[]</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Array de items a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">emptyMessage</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>'No hay elementos'</TableCell>
                <TableCell>Mensaje cuando no hay items.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">emptyIcon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Icono para estado vacío.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">headerAction</TableCell>
                <TableCell className="font-mono text-xs">{`{ label, onClick?, href? }`}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Acción en el header.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">footerAction</TableCell>
                <TableCell className="font-mono text-xs">{`{ label, onClick?, href? }`}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Acción en el footer.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">showDividers</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>true</TableCell>
                <TableCell>Mostrar divisores entre items.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">maxHeight</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Altura máxima con scroll.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* ActivityItem Props */}
        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">ActivityItem Props</h4>
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
                <TableCell className="font-mono text-xs">id</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>ID único del item.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon | ReactNode</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Icono del item.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">iconColor</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Clases de color del icono.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Título principal.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">subtitle</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Subtítulo o descripción.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">value</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Valor a la derecha.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">valueSubtext</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Texto debajo del valor.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">badge</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Badge o etiqueta.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onClick</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al hacer click.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* QuickAction Props */}
        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">QuickAction Props</h4>
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
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Icono de Lucide React.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">label</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Texto del botón.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">iconColor</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Clases de color del icono.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">badge</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Badge de notificación.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onClick</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Callback al hacer click.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">href</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>URL para navegación.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'primary' | 'success' | 'warning' | 'danger'</TableCell>
                <TableCell>'default'</TableCell>
                <TableCell>Variante de color.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                <TableCell>'md'</TableCell>
                <TableCell>Tamaño del botón.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* QuickActionGrid Props */}
        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">QuickActionGrid Props</h4>
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
                <TableCell className="font-mono text-xs">children</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>-</TableCell>
                <TableCell>QuickAction components.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">columns</TableCell>
                <TableCell className="font-mono text-xs">2 | 3 | 4</TableCell>
                <TableCell>2</TableCell>
                <TableCell>Número de columnas.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">gap</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                <TableCell>'md'</TableCell>
                <TableCell>Espaciado entre items.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
