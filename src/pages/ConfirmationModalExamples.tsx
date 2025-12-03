import ConfirmationModal from "@components/common/ConfirmationModal";
import { useState } from "react";
import Button from "@components/common/Button";

export function ConfirmationModalExamples() {
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmWithLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowModal3(false);
      alert("Acción completada!");
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">ConfirmationModal Component</h2>
        <p className="text-muted-foreground">
          Modal de confirmación para acciones importantes con variantes destructivas y estados de carga.
        </p>
      </div>

      <div className="space-y-6">
        {/* Standard Confirmation */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Confirmación Estándar</h3>
          <Button onClick={() => setShowModal1(true)}>
            Abrir Confirmación
          </Button>
          <ConfirmationModal
            isOpen={showModal1}
            onClose={() => setShowModal1(false)}
            onConfirm={() => {
              alert("Confirmado!");
              setShowModal1(false);
            }}
            title="¿Continuar con esta acción?"
            description="Esta acción guardará los cambios realizados."
            confirmText="Guardar"
            cancelText="Cancelar"
          />
        </div>

        {/* Destructive Confirmation */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Confirmación Destructiva</h3>
          <Button variant="destructive" onClick={() => setShowModal2(true)}>
            Eliminar Item
          </Button>
          <ConfirmationModal
            isOpen={showModal2}
            onClose={() => setShowModal2(false)}
            onConfirm={() => {
              alert("Eliminado!");
              setShowModal2(false);
            }}
            title="¿Eliminar este gasto?"
            description="Esta acción no se puede deshacer. El gasto será eliminado permanentemente."
            confirmText="Eliminar"
            cancelText="Cancelar"
            isDestructive
          />
        </div>

        {/* With Loading State */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Con Estado de Carga</h3>
          <Button onClick={() => setShowModal3(true)}>
            Acción con Loading
          </Button>
          <ConfirmationModal
            isOpen={showModal3}
            onClose={() => setShowModal3(false)}
            onConfirm={handleConfirmWithLoading}
            title="¿Procesar esta acción?"
            description="Esto tomará unos segundos en completarse."
            confirmText="Procesar"
            cancelText="Cancelar"
            isLoading={isLoading}
            autoClose={false}
          />
        </div>

        {/* Props Reference */}
        <div className="mt-8 p-6 bg-muted/50 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Props</h3>
          <div className="space-y-2 text-sm font-mono">
            <div><code>isOpen: boolean</code> - Estado del modal</div>
            <div><code>onClose: () =&gt; void</code> - Callback para cerrar</div>
            <div><code>onConfirm: () =&gt; void</code> - Callback de confirmación</div>
            <div><code>title: string</code> - Título del modal</div>
            <div><code>description: string</code> - Descripción/mensaje</div>
            <div><code>confirmText?: string</code> - Texto del botón confirmar (default: "Confirmar")</div>
            <div><code>cancelText?: string</code> - Texto del botón cancelar (default: "Cancelar")</div>
            <div><code>isDestructive?: boolean</code> - Estilo destructivo (rojo)</div>
            <div><code>isLoading?: boolean</code> - Estado de carga</div>
            <div><code>autoClose?: boolean</code> - Cerrar automáticamente al confirmar (default: true)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
