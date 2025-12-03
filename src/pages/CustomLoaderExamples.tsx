import CustomLoader from "@components/common/CustomLoader";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";

export function CustomLoaderExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">CustomLoader Component</h2>
        <p className="text-muted-foreground">
          Loader animado personalizado con CSS puro, utilizado para pantallas de carga principales o secciones importantes.
        </p>
      </div>

      <div className="space-y-8">
        {/* Live Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vista Previa</h3>
          <CodePreview
            code={`<div className="flex justify-center p-8">
  <CustomLoader />
</div>`}
          >
            <div className="flex justify-center items-center p-12 bg-muted/30 rounded-xl">
              <CustomLoader />
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🎨 CSS Puro</h4>
            <p className="text-sm text-muted-foreground">
              Implementado completamente con CSS y keyframes, sin dependencias externas de librerías de animación.
            </p>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-bold mb-2">🌈 Theme Aware</h4>
            <p className="text-sm text-muted-foreground">
              Utiliza variables CSS (`--primary`) para adaptarse automáticamente al color principal del tema actual (incluyendo modo oscuro).
            </p>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-bold mb-2">🔄 Animación Fluida</h4>
            <p className="text-sm text-muted-foreground">
              Animación de rotación y escala compuesta por dos elementos pseudo-clase (`:before`, `:after`) orbitando.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">📦 Encapsulado</h4>
            <p className="text-sm text-muted-foreground">
              Estilos inyectados localmente mediante etiqueta `style` dentro del componente para evitar conflictos globales.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
