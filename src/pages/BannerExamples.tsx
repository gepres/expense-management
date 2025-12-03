import { Banner } from "@components/common/Banner";
import Button from "@components/common/Button";
import { Info, CheckCircle, AlertTriangle, AlertOctagon, Sparkles, Wallet } from "lucide-react";

export function BannerExamples() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Banner Component</h2>
        <p className="text-muted-foreground">
          Componente para destacar información importante o llamadas a la acción.
        </p>
      </div>

      <div className="space-y-6">
        {/* Default */}
        <Banner
          title="Banner Estándar"
          description="Un banner simple para información general."
          hover
        />

        {/* Info */}
        <Banner
          variant="info"
          icon={Info}
          title="Información"
          description="Este es un mensaje informativo para el usuario."
          hover
        />

        {/* Success */}
        <Banner
          variant="success"
          icon={CheckCircle}
          title="Operación Exitosa"
          description="Los cambios se han guardado correctamente."
          hover
        />

        {/* Warning */}
        <Banner
          variant="warning"
          icon={AlertTriangle}
          title="Advertencia"
          description="Tu presupuesto está cerca del límite."
          hover
          action={
            <Button size="sm" variant="outline" className="bg-white/50">
              Ver Detalles
            </Button>
          }
        />

        {/* Error */}
        <Banner
          variant="error"
          icon={AlertOctagon}
          title="Error"
          description="No se pudo conectar con el servidor."
          hover
        />

        {/* Gradient (Feature Highlight) - Clickable */}
        <Banner
          variant="gradient"
          icon={Sparkles}
          title="Nueva Funcionalidad"
          description="Ahora puedes sincronizar tus gastos automáticamente con IA. Haz clic para más información."
          hover
          onClick={() => alert('Banner clickeado!')}
          action={
            <Button size="sm" variant="primary">
              Probar Ahora
            </Button>
          }
        />

        {/* Custom Icon (Wallet) */}
        <Banner
          variant="info"
          icon={Wallet}
          title="Movimientos de Efectivo"
          description="Gestiona tu dinero en efectivo de forma manual."
          hover
        />
      </div>
    </div>
  );
}
