import { useState } from 'react';
import { StatCard } from '@components/common/StatCard';
import CodePreview from '@components/common/CodePreview';
import { Card } from '@components/common/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@components/common/Table';
import { TrendingDown, Wallet, Target, Users, ShoppingCart, DollarSign } from 'lucide-react';

export function StatCardExamples() {
  const [percentage] = useState(75);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">StatCard Component</h2>
        <p className="text-muted-foreground mb-4">
          Tarjetas de estadísticas con iconos, valores y barras de progreso opcionales.
          Perfectas para dashboards y paneles de control.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Ejemplo Básico"
            value="S/ 1,250"
            icon={Wallet}
            iconColor="blue"
          />
          <StatCard
            title="Con Progreso"
            value="75%"
            icon={Target}
            iconColor="green"
            progress={{
              percentage: 75,
              label: '75% completado',
            }}
          />
          <StatCard
            title="Con Subtitle"
            value="2,450"
            icon={Users}
            iconColor="purple"
            subtitle={
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>+12% este mes</span>
              </div>
            }
          />
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. Variantes de Color</h3>
          <CodePreview
            code={`<StatCard
  title="Gastos del Mes"
  value="S/ 1,250"
  icon={TrendingDown}
  iconColor="red"
/>

<StatCard
  title="Presupuesto"
  value="S/ 3,000"
  icon={Wallet}
  iconColor="blue"
/>

<StatCard
  title="Disponible"
  value="S/ 1,750"
  icon={Target}
  iconColor="green"
/>`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Gastos del Mes"
                value="S/ 1,250"
                icon={TrendingDown}
                iconColor="red"
              />
              <StatCard
                title="Presupuesto"
                value="S/ 3,000"
                icon={Wallet}
                iconColor="blue"
              />
              <StatCard
                title="Disponible"
                value="S/ 1,750"
                icon={Target}
                iconColor="green"
              />
            </div>
          </CodePreview>
        </div>

        {/* With Progress */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Con Barra de Progreso</h3>
          <CodePreview
            code={`<StatCard
  title="Presupuesto Mensual"
  value="S/ 3,000"
  icon={Wallet}
  iconColor="blue"
  progress={{
    percentage: 75,
    label: "75% usado"
  }}
/>`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="Presupuesto Mensual"
                value="S/ 3,000"
                icon={Wallet}
                iconColor="blue"
                progress={{
                  percentage: 75,
                  label: '75% usado',
                }}
              />
              <StatCard
                title="Objetivo de Ahorro"
                value="S/ 5,000"
                icon={Target}
                iconColor="green"
                progress={{
                  percentage: 45,
                  color: 'green',
                  label: '45% completado',
                }}
              />
            </div>
          </CodePreview>
        </div>

        {/* With Subtitle */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Con Subtitle Personalizado</h3>
          <CodePreview
            code={`<StatCard
  title="Gastos del Mes"
  value="S/ 1,250"
  icon={TrendingDown}
  iconColor="red"
  subtitle={
    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
      <span className="bg-background/50 px-2 py-1 rounded border border-border">
        S/ 1,000
      </span>
      <span className="bg-background/50 px-2 py-1 rounded border border-border">
        $ 250
      </span>
    </div>
  }
/>`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="Gastos del Mes"
                value="S/ 1,250"
                icon={TrendingDown}
                iconColor="red"
                subtitle={
                  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                    <span className="bg-background/50 px-2 py-1 rounded border border-border">
                      S/ 1,000
                    </span>
                    <span className="bg-background/50 px-2 py-1 rounded border border-border">
                      $ 250
                    </span>
                  </div>
                }
              />
              <StatCard
                title="Usuarios Activos"
                value="2,450"
                icon={Users}
                iconColor="purple"
                subtitle={
                  <p className="text-xs text-green-600">
                    +12.5% vs mes anterior
                  </p>
                }
              />
            </div>
          </CodePreview>
        </div>

        {/* With Footer */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Con Footer Personalizado</h3>
          <CodePreview
            code={`<StatCard
  title="Disponible"
  value="S/ 1,750"
  icon={Target}
  iconColor="green"
  footer={
    <p className="text-xs text-muted-foreground">
      ¡Vas bien este mes!
    </p>
  }
/>`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                title="Disponible"
                value="S/ 1,750"
                icon={Target}
                iconColor="green"
                footer={
                  <p className="text-xs text-muted-foreground">
                    ¡Vas bien este mes!
                  </p>
                }
              />
              <StatCard
                title="Total Ventas"
                value="S/ 12,500"
                icon={ShoppingCart}
                iconColor="blue"
                footer={
                  <p className="text-xs text-red-500">
                    -5% vs semana anterior
                  </p>
                }
              />
            </div>
          </CodePreview>
        </div>

        {/* Colors Showcase */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Paleta de Colores Completa</h3>
          <CodePreview
            code={`<StatCard iconColor="red" ... />
<StatCard iconColor="blue" ... />
<StatCard iconColor="green" ... />
<StatCard iconColor="yellow" ... />
<StatCard iconColor="purple" ... />
<StatCard iconColor="orange" ... />`}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard
                title="Red"
                value="1,234"
                icon={TrendingDown}
                iconColor="red"
              />
              <StatCard
                title="Blue"
                value="5,678"
                icon={Wallet}
                iconColor="blue"
              />
              <StatCard
                title="Green"
                value="9,012"
                icon={Target}
                iconColor="green"
              />
              <StatCard
                title="Yellow"
                value="3,456"
                icon={DollarSign}
                iconColor="yellow"
              />
              <StatCard
                title="Purple"
                value="7,890"
                icon={Users}
                iconColor="purple"
              />
              <StatCard
                title="Orange"
                value="2,345"
                icon={ShoppingCart}
                iconColor="orange"
              />
            </div>
          </CodePreview>
        </div>

        {/* Complete Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">6. Ejemplo Completo (Dashboard)</h3>
          <CodePreview
            code={`<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <StatCard
    title="Gastos del Mes"
    value="S/ 1,250"
    icon={TrendingDown}
    iconColor="red"
    subtitle={
      <div className="flex gap-3 text-xs">
        <span>S/ 1,000</span>
        <span>$ 250</span>
      </div>
    }
  />

  <StatCard
    title="Presupuesto General"
    value="S/ 3,000"
    icon={Wallet}
    iconColor="blue"
    progress={{
      percentage: ${percentage},
      label: "${percentage}% usado"
    }}
  />

  <StatCard
    title="Disponible"
    value="S/ 1,750"
    icon={Target}
    iconColor="green"
    footer={
      <p className="text-xs text-muted-foreground">
        ¡Vas bien este mes!
      </p>
    }
  />
</div>`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Gastos del Mes"
                value="S/ 1,250"
                icon={TrendingDown}
                iconColor="red"
                subtitle={
                  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground">
                    <span className="bg-background/50 px-2 py-1 rounded border border-border">
                      S/ 1,000
                    </span>
                    <span className="bg-background/50 px-2 py-1 rounded border border-border">
                      $ 250
                    </span>
                  </div>
                }
              />

              <StatCard
                title="Presupuesto General"
                value="S/ 3,000"
                icon={Wallet}
                iconColor="blue"
                progress={{
                  percentage: percentage,
                  label: `${percentage}% usado`,
                }}
              />

              <StatCard
                title="Disponible"
                value="S/ 1,750"
                icon={Target}
                iconColor="green"
                footer={
                  <p className="text-xs text-muted-foreground">
                    ¡Vas bien este mes!
                  </p>
                }
              />
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">📊 Visualización Clara</h4>
            <p className="text-sm text-muted-foreground">
              Iconos grandes con efecto hover, valores destacados y animaciones sutiles.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 6 Colores Disponibles</h4>
            <p className="text-sm text-muted-foreground">
              Red, blue, green, yellow, purple y orange con variantes dark mode.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">📈 Barra de Progreso</h4>
            <p className="text-sm text-muted-foreground">
              Barra de progreso opcional con porcentaje y label personalizable.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🔧 Totalmente Personalizable</h4>
            <p className="text-sm text-muted-foreground">
              Subtitle, footer y progress con contenido React totalmente personalizable.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">StatCard Props</h4>
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
                <TableCell>Título de la tarjeta.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">value</TableCell>
                <TableCell className="font-mono text-xs">string | number</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Valor principal a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Icono de Lucide React.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">iconColor</TableCell>
                <TableCell className="font-mono text-xs">'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'</TableCell>
                <TableCell>'blue'</TableCell>
                <TableCell>Color del icono y tema.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">subtitle</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Contenido debajo del valor.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">footer</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Contenido al final de la tarjeta.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">progress</TableCell>
                <TableCell className="font-mono text-xs">{`{ percentage, color?, label? }`}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Configuración de barra de progreso.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'gradient'</TableCell>
                <TableCell>'default'</TableCell>
                <TableCell>Variante de fondo.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
