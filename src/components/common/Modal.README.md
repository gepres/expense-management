# Modal Component - Documentación

Componente Modal reutilizable con diseño iOS para usar globalmente en la aplicación.

## 📦 Archivos

- `Modal.tsx` - Componente principal
- `ModalExample.tsx` - Ejemplos de uso
- `useModal.ts` - Hook personalizado (en `/src/hooks`)

## 🚀 Instalación

Los componentes ya están listos para usar. Solo necesitas importarlos:

```tsx
import Modal, { ModalButton, ModalFooterActions } from '@components/common/Modal';
import { useModal } from '@hooks/useModal';
```

## 📚 Uso Básico

### 1. Modal Simple

```tsx
import { useState } from 'react';
import Modal from '@components/common/Modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Mi Modal"
      >
        <p>Contenido del modal</p>
      </Modal>
    </>
  );
}
```

### 2. Con Hook useModal (Recomendado)

```tsx
import Modal from '@components/common/Modal';
import { useModal } from '@hooks/useModal';

function MyComponent() {
  const modal = useModal();

  return (
    <>
      <button onClick={modal.open}>Abrir Modal</button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Mi Modal"
      >
        <p>Contenido del modal</p>
      </Modal>
    </>
  );
}
```

## 🎨 Props del Modal

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | **Requerido.** Controla si el modal está abierto |
| `onClose` | `() => void` | - | **Requerido.** Función que se ejecuta al cerrar |
| `title` | `string` | - | Título del modal |
| `subtitle` | `string` | - | Subtítulo debajo del título |
| `children` | `ReactNode` | - | **Requerido.** Contenido del modal |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Tamaño del modal |
| `showCloseButton` | `boolean` | `true` | Muestra el botón X de cerrar |
| `closeOnBackdrop` | `boolean` | `true` | Cierra al hacer clic fuera |
| `closeOnEscape` | `boolean` | `true` | Cierra al presionar ESC |
| `footer` | `ReactNode` | - | Contenido del footer (botones) |
| `className` | `string` | `''` | Clases CSS adicionales |

## 📏 Tamaños

```tsx
<Modal size="sm">   {/* max-w-sm (384px) */}
<Modal size="md">   {/* max-w-md (448px) */}
<Modal size="lg">   {/* max-w-lg (512px) */}
<Modal size="xl">   {/* max-w-xl (576px) */}
<Modal size="full"> {/* max-w-full con margen */}
```

## 🎯 Casos de Uso

### Modal de Confirmación

```tsx
import Modal, { ModalFooterActions } from '@components/common/Modal';
import { useModal } from '@hooks/useModal';
import { AlertTriangle } from 'lucide-react';

function DeleteButton() {
  const modal = useModal();

  const handleDelete = () => {
    // Lógica de eliminación
    console.log('Eliminado');
    modal.close();
  };

  return (
    <>
      <button onClick={modal.open}>Eliminar</button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Eliminar elemento"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={modal.close}
            onConfirm={handleDelete}
            cancelText="Cancelar"
            confirmText="Eliminar"
            confirmVariant="destructive"
          />
        }
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

### Modal con Formulario (Estilo iOS)

```tsx
import Modal, { ModalFooterActions } from '@components/common/Modal';
import { useModal } from '@hooks/useModal';
import { AlignLeft, Calendar } from 'lucide-react';
import { useState } from 'react';
import { obtenerFechaLocalISO } from '@utils/formatters';

function CreateForm() {
  const modal = useModal();
  const [formData, setFormData] = useState({
    title: '',
    date: obtenerFechaLocalISO(),
  });

  const handleSubmit = () => {
    console.log('Submit:', formData);
    modal.close();
  };

  return (
    <>
      <button onClick={modal.open}>Crear Nuevo</button>

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Nuevo Registro"
        subtitle="Completa los campos"
        footer={
          <ModalFooterActions
            onCancel={modal.close}
            onConfirm={handleSubmit}
            confirmText="Guardar"
          />
        }
      >
        <form className="space-y-3">
          {/* Título */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <AlignLeft className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">
                  Título <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ingresa un título"
                  className="bg-transparent text-sm w-full focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-transparent text-sm w-full focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
```

### Modal con Datos Dinámicos

```tsx
import Modal, { ModalButton } from '@components/common/Modal';
import { useModalWithData } from '@hooks/useModal';

interface Item {
  id: string;
  name: string;
}

function ItemList() {
  const modal = useModalWithData<Item>();

  const items: Item[] = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ];

  return (
    <>
      {items.map((item) => (
        <button key={item.id} onClick={() => modal.open(item)}>
          Ver {item.name}
        </button>
      ))}

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={modal.data?.name}
        footer={<ModalButton onClick={modal.close}>Cerrar</ModalButton>}
      >
        <p>ID: {modal.data?.id}</p>
      </Modal>
    </>
  );
}
```

## 🎨 Componentes Helper

### ModalButton

Botón prediseñado para usar en el modal:

```tsx
import { ModalButton } from '@components/common/Modal';

<ModalButton variant="primary" onClick={handleClick}>
  Aceptar
</ModalButton>

<ModalButton variant="secondary" onClick={handleClick}>
  Cancelar
</ModalButton>

<ModalButton variant="destructive" onClick={handleClick}>
  Eliminar
</ModalButton>

<ModalButton variant="ghost" onClick={handleClick}>
  Omitir
</ModalButton>
```

**Props:**
- `variant`: `'primary' | 'secondary' | 'destructive' | 'ghost'`
- `onClick`: `() => void`
- `disabled`: `boolean`
- `type`: `'button' | 'submit' | 'reset'`

### ModalFooterActions

Footer con dos botones (cancelar y confirmar):

```tsx
import { ModalFooterActions } from '@components/common/Modal';

<ModalFooterActions
  onCancel={() => console.log('Cancelar')}
  onConfirm={() => console.log('Confirmar')}
  cancelText="Cancelar"
  confirmText="Guardar"
  confirmVariant="primary" // o "destructive"
  disabled={false}
/>
```

## 🪝 Hooks

### useModal()

Hook básico para manejar el estado del modal:

```tsx
const modal = useModal(initialState?: boolean);

modal.isOpen  // Estado actual
modal.open()  // Abrir modal
modal.close() // Cerrar modal
modal.toggle() // Alternar estado
```

### useModalWithData<T>()

Hook para modales que necesitan datos:

```tsx
const modal = useModalWithData<DataType>();

modal.isOpen        // Estado actual
modal.data          // Datos actuales (null si cerrado)
modal.open(data)    // Abrir con datos
modal.close()       // Cerrar y limpiar datos
```

## 🎭 Características

✅ **Diseño iOS moderno**
- Bordes redondeados
- Animaciones dinámicas con efecto bounce en móvil
- Backdrop blur con fade out al deslizar
- Responsive (móvil desde abajo, desktop centrado)
- **Swipe down to close** - Desliza hacia abajo para cerrar en móvil
- Drag handle interactivo con feedback visual

✅ **Accesibilidad**
- Cierra con tecla ESC
- Cierra al hacer clic fuera (configurable)
- Previene scroll del body cuando está abierto
- ARIA labels

✅ **Personalizable**
- 5 tamaños predefinidos
- Footer customizable
- Clases CSS adicionales
- Variantes de botones

✅ **Optimizado**
- Animaciones GPU-accelerated
- Limpieza automática de eventos
- TypeScript completo

## 🎨 Colores y Estilos

El modal usa las variables CSS del tema:

```css
--background
--foreground
--card
--border
--primary
--destructive
--success
--muted
```

Soporta modo oscuro automáticamente.

## 📱 Responsive

- **Móvil**:
  - Modal desde abajo con animación bounce
  - Altura máxima 90vh
  - Drag handle para cerrar deslizando
  - Swipe down gesture (deslizar >100px para cerrar)
  - Feedback visual al arrastrar (handle cambia de color)
  - Backdrop se desvanece al arrastrar
- **Desktop**:
  - Centrado con zoom-in
  - Bordes redondeados completos
  - Sin gestos de deslizamiento
- **Tablet**: Transición suave entre ambos modos

## 🔧 Tips

1. **Usa `useModal()` para código más limpio:**
   ```tsx
   // ❌ Más código
   const [isOpen, setIsOpen] = useState(false);
   <button onClick={() => setIsOpen(true)}>

   // ✅ Más limpio
   const modal = useModal();
   <button onClick={modal.open}>
   ```

2. **Usa `useModalWithData()` para editar/eliminar:**
   ```tsx
   const editModal = useModalWithData<Item>();
   // Al abrir, pasa el item
   editModal.open(item);
   // Dentro del modal, accede con editModal.data
   ```

3. **Footer personalizado:**
   ```tsx
   <Modal
     footer={
       <div className="flex gap-3">
         <button>Botón 1</button>
         <button>Botón 2</button>
         <button>Botón 3</button>
       </div>
     }
   />
   ```

4. **Sin botón de cerrar:**
   ```tsx
   <Modal showCloseButton={false} closeOnBackdrop={false} closeOnEscape={false}>
     {/* Solo se cierra con botones internos */}
   </Modal>
   ```

## 📝 Ejemplo Completo

Ver `ModalExample.tsx` para ejemplos completos y funcionales.

## 🐛 Troubleshooting

**El modal no se cierra:**
- Verifica que `onClose` esté correctamente conectado
- Asegúrate de actualizar `isOpen` cuando se cierra

**El modal no tiene scroll:**
- El contenido debe ser más alto que `max-h-[90vh]`
- Verifica que el contenido no tenga `overflow: hidden`

**Animaciones no funcionan:**
- Verifica que Tailwind CSS esté configurado correctamente
- Asegúrate de tener las animaciones habilitadas

**El modal aparece detrás de otros elementos:**
- Verifica que ningún elemento tenga `z-index` mayor a 50
- El modal usa `z-50` por defecto

## 📄 Licencia

Parte del proyecto Gastos - Gestión de Finanzas Personales
