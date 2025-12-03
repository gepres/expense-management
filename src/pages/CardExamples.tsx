import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/common/Card";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";

export function CardExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Card Component</h2>
        <p className="text-muted-foreground">
          Contenedor versátil para agrupar contenido relacionado.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Basic Card */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Básico</h3>
          <CodePreview
            code={`<Card>
  <CardHeader>
    <CardTitle>Título de la Tarjeta</CardTitle>
    <CardDescription>Descripción opcional de la tarjeta.</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      Contenido principal de la tarjeta.
    </p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Acción</Button>
  </CardFooter>
</Card>`}
          >
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Título de la Tarjeta</CardTitle>
                <CardDescription>Descripción opcional de la tarjeta.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Contenido principal de la tarjeta. Puede incluir texto, imágenes o cualquier otro componente.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Acción</Button>
              </CardFooter>
            </Card>
          </CodePreview>
        </div>

        {/* Hover Effect */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Con Hover Effect</h3>
          <CodePreview
            code={`<Card hover className="cursor-pointer">
  <CardHeader>
    <CardTitle>Tarjeta Interactiva</CardTitle>
    <CardDescription>Pasa el mouse por encima.</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      Efecto de sombra y borde al hacer hover.
    </p>
  </CardContent>
</Card>`}
          >
            <Card hover className="cursor-pointer max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Tarjeta Interactiva</CardTitle>
                <CardDescription>Pasa el mouse por encima.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Esta tarjeta tiene un efecto de sombra y borde al hacer hover, ideal para elementos clickeables.
                </p>
              </CardContent>
            </Card>
          </CodePreview>
        </div>

        {/* Glassmorphism */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Glassmorphism</h3>
          <CodePreview
            code={`<div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-xl">
  <Card glass className="border-white/20">
    <CardHeader>
      <CardTitle>Efecto Cristal</CardTitle>
      <CardDescription>Fondo translúcido con blur.</CardDescription>
    </CardHeader>
  </Card>
</div>`}
          >
            <div className="relative p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl max-w-md mx-auto">
              <Card glass className="border-white/20">
                <CardHeader>
                  <CardTitle>Efecto Cristal</CardTitle>
                  <CardDescription>Fondo translúcido con blur.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Ideal para superponer sobre fondos coloridos o imágenes.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CodePreview>
        </div>

        {/* No Padding */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sin Padding</h3>
          <CodePreview
            code={`<Card noPadding className="overflow-hidden">
  <div className="h-32 bg-muted flex items-center justify-center">
    <span>Imagen / Cover</span>
  </div>
  <div className="p-6">
    <CardTitle>Contenido con Padding</CardTitle>
  </div>
</Card>`}
          >
            <Card noPadding className="overflow-hidden max-w-md mx-auto">
              <div className="h-32 bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Imagen / Cover</span>
              </div>
              <div className="p-6">
                <CardTitle className="mb-2">Contenido con Padding</CardTitle>
                <p className="text-sm text-muted-foreground">
                  El contenedor principal no tiene padding, permitiendo elementos full-width.
                </p>
              </div>
            </Card>
          </CodePreview>
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
                <TableCell className="font-mono text-xs">noPadding</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Elimina el padding por defecto del contenedor.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">hover</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Añade efectos de sombra y borde al pasar el mouse.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">glass</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Aplica efecto de glassmorphism (fondo translúcido y blur).</TableCell>
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
      </div>
    </div>
  );
}
