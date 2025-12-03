import { Badge, BadgeWrapper } from "@components/common/Badge";
import Button from "@components/common/Button";
import { IconButton } from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Bell, Mail, ShoppingCart, AlertCircle } from "lucide-react";

export function BadgeExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Badge Component</h2>
        <p className="text-muted-foreground">
          Insignias numéricas para notificaciones y contadores. Estilo iOS con variantes de color y tamaños.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Badges */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. Badges Básicos</h3>
          <CodePreview
            code={`<Badge>New</Badge>
<Badge count={5} />
<Badge count={99} />
<Badge count={150} maxCount={99} />`}
          >
            <div className="flex flex-wrap items-center gap-4">
              <Badge>New</Badge>
              <Badge count={5} />
              <Badge count={23} />
              <Badge count={99} />
              <Badge count={150} maxCount={99} />
            </div>
          </CodePreview>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. Variantes de Color</h3>
          <CodePreview
            code={`<Badge variant="default" count={5} />
<Badge variant="primary" count={10} />
<Badge variant="success" count={3} />
<Badge variant="warning" count={7} />
<Badge variant="error" count={12} />
<Badge variant="info" count={8} />`}
          >
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant="default" count={5} />
              <Badge variant="primary" count={10} />
              <Badge variant="success" count={3} />
              <Badge variant="warning" count={7} />
              <Badge variant="error" count={12} />
              <Badge variant="info" count={8} />
            </div>
          </CodePreview>
        </div>

        {/* Sizes */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. Tamaños</h3>
          <CodePreview
            code={`<Badge size="sm" count={5} />
<Badge size="md" count={10} />
<Badge size="lg" count={15} />`}
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <Badge size="sm" count={5} variant="error" />
                <span className="text-xs text-muted-foreground">Small</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge size="md" count={10} variant="error" />
                <span className="text-xs text-muted-foreground">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Badge size="lg" count={15} variant="error" />
                <span className="text-xs text-muted-foreground">Large</span>
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Dot Badges */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">4. Badges de Punto</h3>
          <CodePreview
            code={`<Badge dot variant="error" />
<Badge dot variant="success" />
<Badge dot variant="warning" pulse />`}
          >
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Badge dot variant="error" />
                <span className="text-sm">Error</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge dot variant="success" />
                <span className="text-sm">Success</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge dot variant="warning" pulse />
                <span className="text-sm">Warning (Pulse)</span>
              </div>
            </div>
          </CodePreview>
        </div>

        {/* With Icons */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">5. Con Iconos (BadgeWrapper)</h3>
          <CodePreview
            code={`<BadgeWrapper badge={<Badge count={5} variant="error" />}>
  <IconButton icon={Bell} label="Notificaciones" />
</BadgeWrapper>

<BadgeWrapper badge={<Badge count={12} variant="primary" />}>
  <IconButton icon={Mail} label="Mensajes" />
</BadgeWrapper>`}
          >
            <div className="flex flex-wrap items-center gap-6">
              <BadgeWrapper badge={<Badge count={5} variant="error" size="sm" />}>
                <IconButton icon={Bell} variant="ghost" label="Notificaciones" />
              </BadgeWrapper>

              <BadgeWrapper badge={<Badge count={12} variant="primary" size="sm" />}>
                <IconButton icon={Mail} variant="ghost" label="Mensajes" />
              </BadgeWrapper>

              <BadgeWrapper badge={<Badge count={3} variant="success" size="sm" />}>
                <IconButton icon={ShoppingCart} variant="ghost" label="Carrito" />
              </BadgeWrapper>

              <BadgeWrapper badge={<Badge dot variant="error" pulse />}>
                <IconButton icon={AlertCircle} variant="ghost" label="Alertas" />
              </BadgeWrapper>
            </div>
          </CodePreview>
        </div>

        {/* Badge Positions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">6. Posiciones del Badge</h3>
          <CodePreview
            code={`<BadgeWrapper 
  badge={<Badge count={5} />} 
  position="top-right"
>
  <Button>Top Right</Button>
</BadgeWrapper>

<BadgeWrapper 
  badge={<Badge count={5} />} 
  position="top-left"
>
  <Button>Top Left</Button>
</BadgeWrapper>`}
          >
            <div className="flex flex-wrap items-center gap-6">
              <BadgeWrapper badge={<Badge count={5} variant="error" size="sm" />} position="top-right">
                <Button variant="outline">Top Right</Button>
              </BadgeWrapper>

              <BadgeWrapper badge={<Badge count={5} variant="error" size="sm" />} position="top-left">
                <Button variant="outline">Top Left</Button>
              </BadgeWrapper>

              <BadgeWrapper badge={<Badge count={5} variant="error" size="sm" />} position="bottom-right">
                <Button variant="outline">Bottom Right</Button>
              </BadgeWrapper>

              <BadgeWrapper badge={<Badge count={5} variant="error" size="sm" />} position="bottom-left">
                <Button variant="outline">Bottom Left</Button>
              </BadgeWrapper>
            </div>
          </CodePreview>
        </div>

        {/* Text Badges */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">7. Badges de Texto</h3>
          <CodePreview
            code={`<Badge variant="success">Nuevo</Badge>
<Badge variant="primary">Pro</Badge>
<Badge variant="warning">Beta</Badge>
<Badge variant="error">Urgente</Badge>`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="success">Nuevo</Badge>
              <Badge variant="primary">Pro</Badge>
              <Badge variant="warning">Beta</Badge>
              <Badge variant="error">Urgente</Badge>
              <Badge variant="info">v2.0</Badge>
              <Badge variant="default">Gratis</Badge>
            </div>
          </CodePreview>
        </div>

        {/* Real World Examples */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">8. Ejemplos Reales</h3>
          <CodePreview
            code={`// Navigation with notification badges
<nav>
  <BadgeWrapper badge={<Badge count={3} variant="error" />}>
    <Button icon={Bell}>Notificaciones</Button>
  </BadgeWrapper>
</nav>

// Status indicators
<Badge dot variant="success" /> En línea
<Badge dot variant="error" /> Desconectado`}
          >
            <div className="space-y-6">
              {/* Navigation Example */}
              <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-xl">
                <BadgeWrapper badge={<Badge count={3} variant="error" size="sm" />}>
                  <Button icon={Bell} variant="ghost">
                    Notificaciones
                  </Button>
                </BadgeWrapper>

                <BadgeWrapper badge={<Badge count={12} variant="primary" size="sm" />}>
                  <Button icon={Mail} variant="ghost">
                    Mensajes
                  </Button>
                </BadgeWrapper>

                <BadgeWrapper badge={<Badge dot variant="success" pulse />}>
                  <Button icon={ShoppingCart} variant="ghost">
                    Carrito
                  </Button>
                </BadgeWrapper>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-col gap-3 p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Badge dot variant="success" />
                  <span className="text-sm">Usuario en línea</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge dot variant="error" />
                  <span className="text-sm">Usuario desconectado</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge dot variant="warning" pulse />
                  <span className="text-sm">Usuario ausente</span>
                </div>
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🔢 Contadores Inteligentes</h4>
            <p className="text-sm text-muted-foreground">
              Muestra "99+" automáticamente cuando el contador excede el máximo (configurable).
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">📍 Posicionamiento Flexible</h4>
            <p className="text-sm text-muted-foreground">
              BadgeWrapper permite posicionar badges en cualquier esquina con offsets personalizados.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">💫 Animación Pulse</h4>
            <p className="text-sm text-muted-foreground">
              Opción de animación pulsante para llamar la atención en notificaciones importantes.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 Variantes Semánticas</h4>
            <p className="text-sm text-muted-foreground">
              Colores predefinidos para success, error, warning, info y más.
            </p>
          </Card>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">Badge Props</h4>
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
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'</TableCell>
                <TableCell className="font-mono text-xs">'default'</TableCell>
                <TableCell>Variante de color del badge.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg'</TableCell>
                <TableCell className="font-mono text-xs">'md'</TableCell>
                <TableCell>Tamaño del badge.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">count</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Número a mostrar en el badge.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">maxCount</TableCell>
                <TableCell className="font-mono text-xs">number</TableCell>
                <TableCell className="font-mono text-xs">99</TableCell>
                <TableCell>Número máximo antes de mostrar "+".</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">dot</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Muestra solo un punto sin número.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">pulse</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Añade animación pulsante.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">showZero</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Muestra el badge cuando count es 0.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">BadgeWrapper Props</h4>
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
                <TableCell className="font-mono text-xs">React.ReactNode</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Elemento sobre el que se posiciona el badge.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">badge</TableCell>
                <TableCell className="font-mono text-xs">React.ReactNode</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>El badge a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">position</TableCell>
                <TableCell className="font-mono text-xs">'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'</TableCell>
                <TableCell className="font-mono text-xs">'top-right'</TableCell>
                <TableCell>Posición del badge.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">offset</TableCell>
                <TableCell className="font-mono text-xs">{`{ x?: number, y?: number }`}</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Offset personalizado en píxeles.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
