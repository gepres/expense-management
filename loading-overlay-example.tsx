/**
 * EJEMPLO DE USO: LoadingOverlay Component
 *
 * Este archivo muestra diferentes formas de usar el LoadingOverlay
 * en tu aplicación con estilo iOS nativo.
 */

import { LoadingOverlay, useLoadingOverlay } from '@components/common/LoadingSpinner';
import { useState } from 'react';

// ========================================
// EJEMPLO 1: Uso Básico
// ========================================
function BasicExample() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);

    // Simular operación async
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
  };

  return (
    <>
      <button onClick={handleAction}>
        Ejecutar Acción
      </button>

      <LoadingOverlay
        isOpen={isLoading}
        variant="dots"
        message="Guardando gasto..."
        submessage="Por favor espera"
      />
    </>
  );
}

// ========================================
// EJEMPLO 2: Con Hook (Recomendado)
// ========================================
function HookExample() {
  const loading = useLoadingOverlay();

  const handleSave = async () => {
    // Mostrar loading
    loading.showLoading('Guardando...', 'Procesando tu solicitud');

    try {
      // Simular operación
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mostrar éxito
      loading.showSuccessState(
        '¡Guardado!',
        'El gasto se guardó correctamente',
        2000 // Auto-cierra en 2 segundos
      );
    } catch (error) {
      loading.hideLoading();
      // Manejar error...
    }
  };

  return (
    <>
      <button onClick={handleSave}>
        Guardar Gasto
      </button>

      <LoadingOverlay
        isOpen={loading.isLoading}
        variant="dots"
        message={loading.loadingMessage}
        submessage={loading.loadingSubmessage}
        success={loading.showSuccess}
      />
    </>
  );
}

// ========================================
// EJEMPLO 3: Con Diferentes Variantes
// ========================================
function VariantsExample() {
  const [variant, setVariant] = useState<'dots' | 'simple' | 'material'>('dots');
  const [isLoading, setIsLoading] = useState(false);

  const testVariant = (v: 'dots' | 'simple' | 'material') => {
    setVariant(v);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <>
      <div className="flex gap-2">
        <button onClick={() => testVariant('dots')}>
          Dots Bounce
        </button>
        <button onClick={() => testVariant('simple')}>
          Simple Spinner
        </button>
        <button onClick={() => testVariant('material')}>
          Material Spinner
        </button>
      </div>

      <LoadingOverlay
        isOpen={isLoading}
        variant={variant}
        message="Probando spinner..."
        submessage={`Variante: ${variant}`}
      />
    </>
  );
}

// ========================================
// EJEMPLO 4: Con Cierre Manual
// ========================================
function ManualCloseExample() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <button onClick={() => setIsLoading(true)}>
        Abrir Overlay
      </button>

      <LoadingOverlay
        isOpen={isLoading}
        onClose={() => setIsLoading(false)}
        variant="dots"
        message="Toca fuera para cerrar"
        closeOnBackdrop={true}
      />
    </>
  );
}

// ========================================
// EJEMPLO 5: En SharedExpensesTab (Real)
// ========================================
function SharedExpensesTabExample() {
  const loading = useLoadingOverlay();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mostrar overlay de carga
    loading.showLoading('Guardando gasto...', 'Sincronizando con el grupo');

    try {
      // Tu lógica de guardado aquí
      const newExpense = await SharedService.createExpense(groupId, formData);

      // Mostrar éxito
      loading.showSuccessState(
        '¡Gasto agregado!',
        'Se notificó a los miembros del grupo',
        2000
      );

      // Actualizar estado
      onExpensesChange([newExpense, ...expenses]);
      resetForm();
    } catch (error) {
      loading.hideLoading();
      toast.error('Error al guardar');
    }
  };

  return (
    <>
      {/* Tu formulario existente */}
      <form onSubmit={handleSubmit}>
        {/* ... campos ... */}
        <button type="submit">Guardar</button>
      </form>

      {/* Overlay - Solo aparece en móvil/tablet */}
      <LoadingOverlay
        isOpen={loading.isLoading}
        variant="dots"
        message={loading.loadingMessage}
        submessage={loading.loadingSubmessage}
        success={loading.showSuccess}
        mobileOnly={true} // Solo se muestra en móvil/tablet
      />
    </>
  );
}

// ========================================
// EJEMPLO 6: Mostrar en Desktop y Móvil
// ========================================
function DesktopMobileExample() {
  const loading = useLoadingOverlay();

  const handleLongOperation = async () => {
    loading.showLoading(
      'Procesando...',
      'Esta operación puede tardar unos segundos'
    );

    await new Promise(resolve => setTimeout(resolve, 3000));

    loading.showSuccessState('¡Completado!', undefined, 1500);
  };

  return (
    <>
      <button onClick={handleLongOperation}>
        Operación Larga
      </button>

      {/* Mostrar en todos los dispositivos */}
      <LoadingOverlay
        isOpen={loading.isLoading}
        variant="material"
        message={loading.loadingMessage}
        submessage={loading.loadingSubmessage}
        success={loading.showSuccess}
        mobileOnly={false} // Se muestra en todos los dispositivos
      />
    </>
  );
}

// ========================================
// PROPIEDADES DISPONIBLES
// ========================================
/*

LoadingOverlay Props:
----------------------
isOpen: boolean           - Controla si el overlay está visible
onClose?: () => void      - Callback al cerrar (solo si closeOnBackdrop=true)
variant?: 'dots' | 'simple' | 'material'  - Tipo de spinner
message?: string          - Mensaje principal (default: "Cargando...")
submessage?: string       - Mensaje secundario opcional
success?: boolean         - Mostrar checkmark verde de éxito
closeOnBackdrop?: boolean - Permitir cerrar al tocar fuera (default: false)
mobileOnly?: boolean      - Solo mostrar en móvil/tablet (default: true)

useLoadingOverlay Hook:
-----------------------
isLoading                 - Estado actual de loading
loadingMessage            - Mensaje actual
loadingSubmessage         - Submensaje actual
showSuccess               - Estado de éxito
showLoading(msg?, submsg?) - Mostrar loading
hideLoading()             - Ocultar loading
showSuccessState(msg?, submsg?, duration?) - Mostrar éxito y auto-cerrar

*/

// ========================================
// TIPS DE USO
// ========================================
/*

✅ CUÁNDO USAR LoadingOverlay:

1. Operaciones que tardan > 1 segundo (guardar, eliminar, actualizar)
2. Cuando necesitas bloquear la interacción del usuario
3. Feedback visual importante en móviles
4. Operaciones críticas (pagos, envíos importantes)

❌ CUÁNDO NO USAR LoadingOverlay:

1. Operaciones muy rápidas (< 500ms) - usar spinner inline
2. Navegación entre páginas - usar el loader de ruta
3. Desktop si no es crítico - usar spinner en botón

🎨 VARIANTES RECOMENDADAS:

- 'dots': Estilo iOS clásico - RECOMENDADO para la mayoría de casos
- 'simple': Spinner circular simple - Para operaciones rápidas
- 'material': Spinner Material Design - Para operaciones largas

📱 RESPONSIVE:

Por defecto, el overlay solo se muestra en móvil/tablet (< 768px).
Para mostrar en desktop también, usa: mobileOnly={false}

*/

export {
  BasicExample,
  HookExample,
  VariantsExample,
  ManualCloseExample,
  SharedExpensesTabExample,
  DesktopMobileExample,
};
