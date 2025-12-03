import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/common/Card";
import Button from "@components/common/Button";

export function CardExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Card Component</h2>
        <p className="text-muted-foreground">
          Contenedor versátil para agrupar contenido relacionado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Card */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Básico</h3>
          <Card>
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
        </div>

        {/* Hover Effect */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Con Hover Effect</h3>
          <Card hover className="cursor-pointer">
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
        </div>

        {/* Glassmorphism */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Glassmorphism</h3>
          <div className="relative p-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
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
        </div>

        {/* No Padding */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sin Padding</h3>
          <Card noPadding className="overflow-hidden">
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
        </div>
      </div>
    </div>
  );
}
