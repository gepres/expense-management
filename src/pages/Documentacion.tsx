/**
 * Página de Documentación
 * Vista para mostrar ejemplos de componentes (Modal, Button, etc.)
 */

import { useState } from 'react';
import { Book, ChevronRight, Code } from 'lucide-react';
import { PillButton } from '@components/common/Button';

// Importar ejemplos
import { ButtonExamples } from './ButtonExamples';
import { ModalExamples } from './ModalExamples';

type Section = 'intro' | 'buttons' | 'modals' | 'forms' | 'loading';

export default function Documentacion() {
  const [activeSection, setActiveSection] = useState<Section>('intro');

  const sections = [
    { id: 'intro' as Section, label: 'Introducción', icon: Book },
    { id: 'buttons' as Section, label: 'Buttons', icon: Code },
    { id: 'modals' as Section, label: 'Modals', icon: Code },
    { id: 'forms' as Section, label: 'Forms', icon: Code },
    { id: 'loading' as Section, label: 'Loading States', icon: Code },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Documentación</h1>
                <p className="text-xs text-muted-foreground">
                  Componentes y ejemplos de uso
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl
                        text-sm font-medium transition-all
                        ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{section.label}</span>
                      </div>
                      {isActive && <ChevronRight className="h-4 w-4" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Mobile Pills Navigation */}
          <div className="lg:hidden col-span-1">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {sections.map((section) => (
                <PillButton
                  key={section.id}
                  selected={activeSection === section.id}
                  onClick={() => setActiveSection(section.id)}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {section.label}
                </PillButton>
              ))}
            </div>
          </div>

          {/* Content */}
          <main className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border p-6 lg:p-8">
              {activeSection === 'intro' && <IntroSection />}
              {activeSection === 'buttons' && <ButtonExamples />}
              {activeSection === 'modals' && <ModalExamples />}
              {activeSection === 'forms' && <FormsSection />}
              {activeSection === 'loading' && <LoadingSection />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ========================================
// SECCIÓN: INTRODUCCIÓN
// ========================================
function IntroSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Bienvenido a la Documentación</h2>
        <p className="text-muted-foreground text-lg">
          Esta página contiene ejemplos interactivos de todos los componentes reutilizables
          de la aplicación.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
          <h3 className="font-bold text-lg mb-2 text-primary">🎨 Componentes UI</h3>
          <p className="text-sm text-muted-foreground">
            Botones, modales, formularios y más componentes listos para usar.
          </p>
        </div>

        <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-xl">
          <h3 className="font-bold text-lg mb-2 text-green-600">📱 Responsive</h3>
          <p className="text-sm text-muted-foreground">
            Todos los componentes se adaptan automáticamente a móvil y desktop.
          </p>
        </div>

        <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <h3 className="font-bold text-lg mb-2 text-blue-600">⚡ TypeScript</h3>
          <p className="text-sm text-muted-foreground">
            Completamente tipado para mejor experiencia de desarrollo.
          </p>
        </div>

        <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-xl">
          <h3 className="font-bold text-lg mb-2 text-purple-600">♿ Accesible</h3>
          <p className="text-sm text-muted-foreground">
            Soporte completo para teclado, lectores de pantalla y más.
          </p>
        </div>
      </div>

      <div className="border-l-4 border-primary pl-4 py-2">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Usa la navegación lateral para explorar diferentes secciones
          de componentes. Cada sección incluye ejemplos interactivos y código de uso.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Componentes Disponibles</h3>

        <div className="grid gap-3">
          <ComponentCard
            title="Button"
            description="Componente de botón con múltiples variantes, tamaños y estados."
            features={['6 variantes', '5 tamaños', 'Loading states', 'Icon support']}
          />

          <ComponentCard
            title="Modal"
            description="Modal/Dialog con animaciones iOS y soporte para gestos."
            features={['iOS Style', 'Swipe to close', 'Backdrop blur', 'Responsive']}
          />

          <ComponentCard
            title="LoadingSpinner"
            description="Spinners de carga con múltiples estilos y overlay móvil."
            features={['5 variantes', 'Overlay mode', 'Success state', 'Auto-close']}
          />

          <ComponentCard
            title="LoadingScreen"
            description="Pantalla de carga centralizada con mensaje personalizable."
            features={['Full screen', 'Custom message', 'Spinner variants']}
          />
        </div>
      </div>
    </div>
  );
}

function ComponentCard({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors">
      <h4 className="font-bold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="flex flex-wrap gap-2">
        {features.map((feature) => (
          <span
            key={feature}
            className="px-2 py-1 bg-background rounded-md text-xs font-medium"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}

// ========================================
// SECCIÓN: FORMS (Placeholder)
// ========================================
function FormsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-4">Formularios</h2>
        <p className="text-muted-foreground">
          Ejemplos de formularios y componentes de entrada.
        </p>
      </div>

      <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
        <p className="text-muted-foreground">
          Esta sección está en desarrollo. Próximamente incluirá ejemplos de:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• Input fields</li>
          <li>• Select dropdowns</li>
          <li>• Date pickers</li>
          <li>• Form validation</li>
          <li>• File uploads</li>
        </ul>
      </div>
    </div>
  );
}

// ========================================
// SECCIÓN: LOADING STATES (Placeholder)
// ========================================
function LoadingSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-4">Loading States</h2>
        <p className="text-muted-foreground">
          Diferentes estados de carga y feedback visual.
        </p>
      </div>

      <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
        <p className="text-muted-foreground">
          Esta sección está en desarrollo. Próximamente incluirá ejemplos de:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• LoadingSpinner variants</li>
          <li>• LoadingOverlay examples</li>
          <li>• Skeleton loaders</li>
          <li>• Progress indicators</li>
          <li>• Shimmer effects</li>
        </ul>
      </div>
    </div>
  );
}
