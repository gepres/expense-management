/**
 * Modal Examples
 * Ejemplos interactivos del componente Modal
 */

import { useState } from 'react';
import Modal, { ModalButton, ModalFooterActions } from '@components/common/Modal';
import Button, { ButtonGroup } from '@components/common/Button';
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { AlertTriangle, Check, Info } from 'lucide-react';

export function ModalExamples() {
  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold mb-4">Modal Component</h2>
        <p className="text-muted-foreground text-lg mb-6">
          Modales con estilo iOS, animaciones suaves y soporte para gestos en móvil.
        </p>
      </div>

      {/* Características */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard
          icon="📱"
          title="iOS Style"
          description="Diseño inspirado en modales nativos de iOS con animaciones suaves"
        />
        <FeatureCard
          icon="👆"
          title="Swipe to Close"
          description="Desliza hacia abajo para cerrar en dispositivos móviles"
        />
        <FeatureCard
          icon="🎨"
          title="Backdrop Blur"
          description="Efecto de desenfoque en el fondo con glassmorphism"
        />
        <FeatureCard
          icon="📐"
          title="Responsive"
          description="Bottom sheet en móvil, modal centrado en desktop"
        />
      </div>

      {/* Ejemplos */}
      <BasicModalExample />
      <ModalSizesExample />
      <ModalWithFooterExample />
      <ConfirmationModalExample />
      <FormModalExample />
      <LongContentModalExample />

      {/* Props Reference */}
      <PropsReference />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-muted/50 rounded-xl border border-border">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// ========================================
// EJEMPLO 1: Modal Básico
// ========================================
function BasicModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">1. Modal Básico</h3>
      <CodePreview
        code={`<Button onClick={() => setIsOpen(true)}>Abrir Modal</Button>

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Básico"
  subtitle="Este es un modal simple"
>
  <p>Contenido del modal...</p>
</Modal>`}
      >
        <Button onClick={() => setIsOpen(true)}>Abrir Modal Básico</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Modal Básico"
          subtitle="Este es un modal simple"
        >
          <p className="text-muted-foreground">
            Este es el contenido del modal. Puedes colocar cualquier contenido aquí.
          </p>
        </Modal>
      </CodePreview>
    </div>
  );
}

// ========================================
// EJEMPLO 2: Tamaños de Modal
// ========================================
function ModalSizesExample() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">2. Tamaños de Modal</h3>
      <CodePreview
        code={`<Button onClick={() => setSize('sm')}>Small</Button>
<Button onClick={() => setSize('lg')}>Large</Button>

<Modal
  isOpen={!!size}
  onClose={() => setSize(null)}
  size={size} // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  title="Modal Size"
>
  ...
</Modal>`}
      >
        <ButtonGroup spacing="normal">
          <Button size="sm" onClick={() => setSize('sm')}>
            Small
          </Button>
          <Button size="sm" onClick={() => setSize('md')}>
            Medium
          </Button>
          <Button size="sm" onClick={() => setSize('lg')}>
            Large
          </Button>
          <Button size="sm" onClick={() => setSize('xl')}>
            Extra Large
          </Button>
          <Button size="sm" onClick={() => setSize('full')}>
            Full
          </Button>
        </ButtonGroup>

        <Modal
          isOpen={size !== null}
          onClose={() => setSize(null)}
          title={`Modal ${size?.toUpperCase()}`}
          size={size || 'md'}
        >
          <p className="text-muted-foreground">
            Este es un modal de tamaño <strong>{size}</strong>.
          </p>
        </Modal>
      </CodePreview>
    </div>
  );
}

// ========================================
// EJEMPLO 3: Modal con Footer
// ========================================
function ModalWithFooterExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">3. Modal con Footer</h3>
      <CodePreview
        code={`<Modal
  title="Confirmar Acción"
  footer={
    <div className="flex gap-3">
      <ModalButton variant="secondary" onClick={onClose}>Cancelar</ModalButton>
      <ModalButton variant="primary" onClick={onConfirm}>Confirmar</ModalButton>
    </div>
  }
>
  ...
</Modal>`}
      >
        <Button onClick={() => setIsOpen(true)}>Abrir Modal con Footer</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Confirmar Acción"
          subtitle="¿Estás seguro de continuar?"
          footer={
            <div className="flex gap-3">
              <ModalButton variant="secondary" onClick={() => setIsOpen(false)}>
                Cancelar
              </ModalButton>
              <ModalButton variant="primary" onClick={() => setIsOpen(false)}>
                Confirmar
              </ModalButton>
            </div>
          }
        >
          <p className="text-muted-foreground">
            Esta acción no se puede deshacer. Por favor confirma para continuar.
          </p>
        </Modal>
      </CodePreview>
    </div>
  );
}

// ========================================
// EJEMPLO 4: Modal de Confirmación
// ========================================
function ConfirmationModalExample() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showDanger, setShowDanger] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">4. Modales de Confirmación</h3>
      <CodePreview
        code={`// Success
<Modal footer={<ModalButton variant="success">Entendido</ModalButton>}>
  <Check className="text-green-600" />
  <p>Operación exitosa</p>
</Modal>

// Warning
<Modal footer={<ModalFooterActions onConfirm={...} />}>
  <Info className="text-yellow-600" />
  <p>Advertencia...</p>
</Modal>

// Danger
<Modal footer={<ModalFooterActions confirmVariant="destructive" />}>
  <AlertTriangle className="text-red-600" />
  <p>Eliminar elemento...</p>
</Modal>`}
      >
        <ButtonGroup>
          <Button variant="success" onClick={() => setShowSuccess(true)}>
            Success
          </Button>
          <Button variant="outline" onClick={() => setShowWarning(true)}>
            Warning
          </Button>
          <Button variant="destructive" onClick={() => setShowDanger(true)}>
            Danger
          </Button>
        </ButtonGroup>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title="¡Operación Exitosa!"
          size="sm"
          footer={
            <ModalButton variant="success" onClick={() => setShowSuccess(false)} className="w-full">
              Entendido
            </ModalButton>
          }
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-muted-foreground">
              Tu operación se completó correctamente.
            </p>
          </div>
        </Modal>

        {/* Warning Modal */}
        <Modal
          isOpen={showWarning}
          onClose={() => setShowWarning(false)}
          title="Atención"
          size="sm"
          footer={
            <ModalFooterActions
              onCancel={() => setShowWarning(false)}
              onConfirm={() => setShowWarning(false)}
              cancelText="Cancelar"
              confirmText="Continuar"
            />
          }
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
              <Info className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-muted-foreground">
              Esta acción puede tener consecuencias. ¿Deseas continuar?
            </p>
          </div>
        </Modal>

        {/* Danger Modal */}
        <Modal
          isOpen={showDanger}
          onClose={() => setShowDanger(false)}
          title="¿Eliminar elemento?"
          size="sm"
          footer={
            <ModalFooterActions
              onCancel={() => setShowDanger(false)}
              onConfirm={() => setShowDanger(false)}
              cancelText="Cancelar"
              confirmText="Eliminar"
              confirmVariant="destructive"
            />
          }
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-muted-foreground">
              Esta acción no se puede deshacer. El elemento será eliminado permanentemente.
            </p>
          </div>
        </Modal>
      </CodePreview>
    </div>
  );
}

// ========================================
// EJEMPLO 5: Modal con Formulario
// ========================================
function FormModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">5. Modal con Formulario</h3>
      <CodePreview
        code={`<Modal title="Nuevo Usuario">
  <form onSubmit={handleSubmit}>
    <input ... />
    <input ... />
  </form>
</Modal>`}
      >
        <Button onClick={() => setIsOpen(true)}>Abrir Formulario</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Nuevo Usuario"
          subtitle="Completa los datos del usuario"
          footer={
            <div className="flex gap-3">
              <ModalButton variant="secondary" onClick={() => setIsOpen(false)}>
                Cancelar
              </ModalButton>
              <ModalButton variant="primary" type="submit" onClick={handleSubmit}>
                Guardar
              </ModalButton>
            </div>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="juan@ejemplo.com"
              />
            </div>
          </form>
        </Modal>
      </CodePreview>
    </div>
  );
}

// ========================================
// EJEMPLO 6: Modal con Contenido Largo
// ========================================
function LongContentModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">6. Modal con Contenido Largo</h3>
      <CodePreview
        code={`<Modal title="Términos">
  <div className="space-y-4">
    <p>Contenido largo...</p>
    <p>Contenido largo...</p>
    ...
  </div>
</Modal>`}
      >
        <Button onClick={() => setIsOpen(true)}>Abrir Modal con Scroll</Button>

        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Términos y Condiciones"
          subtitle="Por favor lee los términos antes de continuar"
          footer={
            <ModalButton variant="primary" onClick={() => setIsOpen(false)} className="w-full">
              Aceptar
            </ModalButton>
          }
        >
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
              aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur.
            </p>
            <p>
              Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
              deserunt mollit anim id est laborum.
            </p>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
              doloremque laudantium.
            </p>
            <p>
              Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
              architecto beatae vitae dicta sunt explicabo.
            </p>
            <p>
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed
              quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
          </div>
        </Modal>
      </CodePreview>
    </div>
  );
}

// ========================================
// REFERENCIA DE PROPS
// ========================================
function PropsReference() {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Props Reference</h3>

      <div className="space-y-6">
        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">Modal Props</h4>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">isOpen</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="text-red-500">Yes</TableCell>
                <TableCell>Controla si el modal está visible.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onClose</TableCell>
                <TableCell className="font-mono text-xs">() =&gt; void</TableCell>
                <TableCell className="text-red-500">Yes</TableCell>
                <TableCell>Función que se ejecuta al cerrar el modal.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Título del modal.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">subtitle</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Subtítulo opcional.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">size</TableCell>
                <TableCell className="font-mono text-xs">'sm' | 'md' | 'lg' | 'xl' | 'full'</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Tamaño del modal (default: 'md').</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">showCloseButton</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Mostrar botón X de cierre (default: true).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">closeOnBackdrop</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Cerrar al hacer clic fuera (default: true).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">closeOnEscape</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Cerrar con tecla ESC (default: true).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">footer</TableCell>
                <TableCell className="font-mono text-xs">React.ReactNode</TableCell>
                <TableCell>-</TableCell>
                <TableCell>Contenido del footer (botones de acción).</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-4 border-b border-border">
            <h4 className="font-bold">ModalButton Props</h4>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'primary' | 'secondary' | 'destructive' | 'ghost'</TableCell>
                <TableCell>Variante del botón (default: 'primary').</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">disabled</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Deshabilitar botón.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">loading</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Mostrar estado de carga.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">type</TableCell>
                <TableCell className="font-mono text-xs">'button' | 'submit' | 'reset'</TableCell>
                <TableCell>Tipo de botón HTML (default: 'button').</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
