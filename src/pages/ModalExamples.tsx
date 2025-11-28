/**
 * Modal Examples
 * Ejemplos interactivos del componente Modal
 */

import { useState } from 'react';
import Modal, { ModalButton, ModalFooterActions } from '@components/common/Modal';
import Button, { ButtonGroup } from '@components/common/Button';
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
    <ExampleSection
      title="1. Modal Básico"
      description="Modal simple con título, contenido y botón de cierre"
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

      <CodeBlock>{`<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Básico"
  subtitle="Este es un modal simple"
>
  <p>Contenido del modal...</p>
</Modal>`}</CodeBlock>
    </ExampleSection>
  );
}

// ========================================
// EJEMPLO 2: Tamaños de Modal
// ========================================
function ModalSizesExample() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);

  return (
    <ExampleSection
      title="2. Tamaños de Modal"
      description="Diferentes tamaños: sm, md, lg, xl, full"
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

      <CodeBlock>{`<Modal
  isOpen={isOpen}
  onClose={onClose}
  size="lg"  // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  title="Modal Large"
>
  <p>Contenido...</p>
</Modal>`}</CodeBlock>
    </ExampleSection>
  );
}

// ========================================
// EJEMPLO 3: Modal con Footer
// ========================================
function ModalWithFooterExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ExampleSection
      title="3. Modal con Footer"
      description="Modal con botones de acción en el footer"
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

      <CodeBlock>{`<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirmar Acción"
  footer={
    <div className="flex gap-3">
      <ModalButton variant="secondary" onClick={onCancel}>
        Cancelar
      </ModalButton>
      <ModalButton variant="primary" onClick={onConfirm}>
        Confirmar
      </ModalButton>
    </div>
  }
>
  <p>Contenido...</p>
</Modal>`}</CodeBlock>
    </ExampleSection>
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
    <ExampleSection
      title="4. Modales de Confirmación"
      description="Modales con íconos y diferentes variantes"
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

      <CodeBlock>{`<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="¿Eliminar elemento?"
  size="sm"
  footer={
    <ModalFooterActions
      onCancel={onClose}
      onConfirm={handleDelete}
      cancelText="Cancelar"
      confirmText="Eliminar"
      confirmVariant="destructive"
    />
  }
>
  <div className="text-center">
    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="h-8 w-8 text-red-600" />
    </div>
    <p>Esta acción no se puede deshacer...</p>
  </div>
</Modal>`}</CodeBlock>
    </ExampleSection>
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
    <ExampleSection
      title="5. Modal con Formulario"
      description="Formulario completo dentro de un modal"
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

      <CodeBlock>{`<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Nuevo Usuario"
  footer={
    <div className="flex gap-3">
      <ModalButton variant="secondary" onClick={onClose}>
        Cancelar
      </ModalButton>
      <ModalButton variant="primary" onClick={handleSubmit}>
        Guardar
      </ModalButton>
    </div>
  }
>
  <form onSubmit={handleSubmit} className="space-y-4">
    <input type="text" placeholder="Nombre" />
    <input type="email" placeholder="Email" />
  </form>
</Modal>`}</CodeBlock>
    </ExampleSection>
  );
}

// ========================================
// EJEMPLO 6: Modal con Contenido Largo
// ========================================
function LongContentModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ExampleSection
      title="6. Modal con Contenido Largo"
      description="El contenido largo se hace scroll automáticamente"
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
    </ExampleSection>
  );
}

// ========================================
// REFERENCIA DE PROPS
// ========================================
function PropsReference() {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Props Reference</h3>

      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <h4 className="font-bold mb-4">Modal Props</h4>
        <div className="space-y-3 text-sm">
          <PropRow
            name="isOpen"
            type="boolean"
            required
            description="Controla si el modal está visible"
          />
          <PropRow
            name="onClose"
            type="() => void"
            required
            description="Función que se ejecuta al cerrar el modal"
          />
          <PropRow
            name="title"
            type="string"
            description="Título del modal"
          />
          <PropRow
            name="subtitle"
            type="string"
            description="Subtítulo opcional"
          />
          <PropRow
            name="size"
            type="'sm' | 'md' | 'lg' | 'xl' | 'full'"
            description="Tamaño del modal (default: 'md')"
          />
          <PropRow
            name="showCloseButton"
            type="boolean"
            description="Mostrar botón X de cierre (default: true)"
          />
          <PropRow
            name="closeOnBackdrop"
            type="boolean"
            description="Cerrar al hacer clic fuera (default: true)"
          />
          <PropRow
            name="closeOnEscape"
            type="boolean"
            description="Cerrar con tecla ESC (default: true)"
          />
          <PropRow
            name="footer"
            type="React.ReactNode"
            description="Contenido del footer (botones de acción)"
          />
          <PropRow
            name="className"
            type="string"
            description="Clases CSS adicionales"
          />
        </div>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 border border-border">
        <h4 className="font-bold mb-4">ModalButton Props</h4>
        <div className="space-y-3 text-sm">
          <PropRow
            name="variant"
            type="'primary' | 'secondary' | 'destructive' | 'ghost'"
            description="Variante del botón (default: 'primary')"
          />
          <PropRow
            name="disabled"
            type="boolean"
            description="Deshabilitar botón"
          />
          <PropRow
            name="loading"
            type="boolean"
            description="Mostrar estado de carga"
          />
          <PropRow
            name="type"
            type="'button' | 'submit' | 'reset'"
            description="Tipo de botón HTML (default: 'button')"
          />
        </div>
      </div>
    </div>
  );
}

function PropRow({
  name,
  type,
  required,
  description,
}: {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-start gap-2 py-2 border-b border-border last:border-0">
      <div className="md:w-1/3">
        <code className="font-mono text-xs bg-background px-2 py-1 rounded">
          {name}
          {required && <span className="text-red-500 ml-1">*</span>}
        </code>
      </div>
      <div className="md:w-1/3">
        <code className="font-mono text-xs text-muted-foreground">{type}</code>
      </div>
      <div className="md:w-1/3 text-muted-foreground">{description}</div>
    </div>
  );
}

// ========================================
// UTILIDADES
// ========================================
function ExampleSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto text-sm border border-border">
        <code className="font-mono">{children}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 bg-background rounded text-xs font-medium border border-border hover:bg-accent transition-colors"
      >
        {copied ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  );
}
