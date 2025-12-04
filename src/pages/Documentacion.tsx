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
import InputExamples from '@components/common/InputExamples';
import LoadingExamples from '@components/common/LoadingExamples';
import { CardExamples } from './CardExamples';
import { BannerExamples } from './BannerExamples';
import { TableExamples } from './TableExamples';
import { ItemListExamples } from './ItemListExamples';
import { TableIOSExamples } from './TableIOSExamples';
import { ErrorAlertExamples } from './ErrorAlertExamples';
import { ConfirmationModalExamples } from './ConfirmationModalExamples';
import { SwitchExamples } from './SwitchExamples';
import { BudgetMonitorExamples } from './BudgetMonitorExamples';
import { InstallPWAExamples } from './InstallPWAExamples';
import { EditNameModalExamples } from './EditNameModalExamples';
import { CustomLoaderExamples } from './CustomLoaderExamples';
import { SegmentedControlExamples } from './SegmentedControlExamples';
import { ToastExamples } from './ToastExamples';
import { ActionSheetExamples } from './ActionSheetExamples';
import { BadgeExamples } from './BadgeExamples';
import { SearchBarExamples } from './SearchBarExamples';
import { SwipeableListItemExamples } from './SwipeableListItemExamples';
import { EmptyStateExamples } from './EmptyStateExamples';
import { ChipExamples } from './ChipExamples';
import { DatePickerExamples } from './DatePickerExamples';
import { StepperExamples } from './StepperExamples';
import { ProgressBarExamples } from './ProgressBarExamples';
import { StatCardExamples } from './StatCardExamples';
import { DashboardWidgetsExamples } from './DashboardWidgetsExamples';
import { Layout, Table as TableIcon, List, CreditCard, AlertCircle, ToggleLeft, Bell, Download, Edit3, Loader2, LayoutDashboard, MessageSquare, Menu, Hash, Search, GripVertical, Inbox, Tags, Calendar as CalendarIcon, PlusCircle, TrendingUp, BarChart2, Zap } from 'lucide-react';

type Section = 'intro' | 'buttons' | 'modals' | 'forms' | 'loading' | 'cards' | 'banners' | 'tables' | 'lists' | 'tableios' | 'alerts' | 'confirmations' | 'switches' | 'budgetmonitor' | 'installpwa' | 'editnamemodal' | 'customloader' | 'segmentedcontrol' | 'toast' | 'actionsheet' | 'badge' | 'searchbar' | 'swipeable' | 'emptystate' | 'chip' | 'datepicker' | 'stepper' | 'progressbar' | 'statcard' | 'dashboardwidgets';

export default function Documentacion() {
  const [activeSection, setActiveSection] = useState<Section>('intro');

  const sections = [
    { id: 'intro' as Section, label: 'Introducción', icon: Book },
    { id: 'buttons' as Section, label: 'Buttons', icon: Code },
    { id: 'modals' as Section, label: 'Modals', icon: Code },
    { id: 'forms' as Section, label: 'Inputs & Forms', icon: Code },
    { id: 'loading' as Section, label: 'Loading States', icon: Code },
    { id: 'cards' as Section, label: 'Cards', icon: CreditCard },
    { id: 'banners' as Section, label: 'Banners', icon: Layout },
    { id: 'tables' as Section, label: 'Tables', icon: TableIcon },
    { id: 'tableios' as Section, label: 'iOS Tables', icon: TableIcon },
    { id: 'lists' as Section, label: 'Item Lists', icon: List },
    { id: 'alerts' as Section, label: 'Error Alerts', icon: AlertCircle },
    { id: 'confirmations' as Section, label: 'Confirmations', icon: AlertCircle },
    { id: 'switches' as Section, label: 'Switches', icon: ToggleLeft },
    { id: 'budgetmonitor' as Section, label: 'Budget Monitor', icon: Bell },
    { id: 'installpwa' as Section, label: 'Install PWA', icon: Download },
    { id: 'editnamemodal' as Section, label: 'Edit Name Modal', icon: Edit3 },
    { id: 'customloader' as Section, label: 'Custom Loader', icon: Loader2 },
    { id: 'segmentedcontrol' as Section, label: 'Segmented Control', icon: LayoutDashboard },
    { id: 'toast' as Section, label: 'Toast', icon: MessageSquare },
    { id: 'actionsheet' as Section, label: 'Action Sheet', icon: Menu },
    { id: 'badge' as Section, label: 'Badge', icon: Hash },
    { id: 'searchbar' as Section, label: 'Search Bar', icon: Search },
    { id: 'swipeable' as Section, label: 'Swipeable List', icon: GripVertical },
    { id: 'emptystate' as Section, label: 'Empty State', icon: Inbox },
    { id: 'chip' as Section, label: 'Chip / Tag', icon: Tags },
    { id: 'datepicker' as Section, label: 'Date Picker', icon: CalendarIcon },
    { id: 'stepper' as Section, label: 'Stepper', icon: PlusCircle },
    { id: 'progressbar' as Section, label: 'Progress Bar', icon: TrendingUp },
    { id: 'statcard' as Section, label: 'Stat Card', icon: BarChart2 },
    { id: 'dashboardwidgets' as Section, label: 'Dashboard Widgets', icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border backdrop-blur-sm bg-card/95">
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
              {activeSection === 'forms' && <InputExamples />}
              {activeSection === 'loading' && <LoadingExamples />}
              {activeSection === 'cards' && <CardExamples />}
              {activeSection === 'banners' && <BannerExamples />}
              {activeSection === 'tables' && <TableExamples />}
              {activeSection === 'tableios' && <TableIOSExamples />}
              {activeSection === 'lists' && <ItemListExamples />}
              {activeSection === 'alerts' && <ErrorAlertExamples />}
              {activeSection === 'confirmations' && <ConfirmationModalExamples />}
              {activeSection === 'switches' && <SwitchExamples />}
              {activeSection === 'budgetmonitor' && <BudgetMonitorExamples />}
              {activeSection === 'installpwa' && <InstallPWAExamples />}
              {activeSection === 'editnamemodal' && <EditNameModalExamples />}
              {activeSection === 'customloader' && <CustomLoaderExamples />}
              {activeSection === 'segmentedcontrol' && <SegmentedControlExamples />}
              {activeSection === 'toast' && <ToastExamples />}
              {activeSection === 'actionsheet' && <ActionSheetExamples />}
              {activeSection === 'badge' && <BadgeExamples />}
              {activeSection === 'searchbar' && <SearchBarExamples />}
              {activeSection === 'swipeable' && <SwipeableListItemExamples />}
              {activeSection === 'emptystate' && <EmptyStateExamples />}
              {activeSection === 'chip' && <ChipExamples />}
              {activeSection === 'datepicker' && <DatePickerExamples />}
              {activeSection === 'stepper' && <StepperExamples />}
              {activeSection === 'progressbar' && <ProgressBarExamples />}
              {activeSection === 'statcard' && <StatCardExamples />}
              {activeSection === 'dashboardwidgets' && <DashboardWidgetsExamples />}
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
        <p className="text-muted-foreground text-lg mb-2">
          Librería completa de <strong className="text-foreground">35+ componentes UI reutilizables</strong> con
          ejemplos interactivos, código de uso y mejores prácticas.
        </p>
        <p className="text-muted-foreground">
          Todos los componentes están completamente tipados, optimizados para móviles
          y siguen las mejores prácticas de diseño iOS/Material Design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
          <h3 className="font-bold text-lg mb-2 text-primary">🎨 35+ Componentes</h3>
          <p className="text-sm text-muted-foreground">
            Buttons, modals, forms, tables, steppers, stat cards, dashboard widgets y mucho más.
            Múltiples variantes y tamaños para cada componente.
          </p>
        </div>

        <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-xl">
          <h3 className="font-bold text-lg mb-2 text-green-600">📱 Mobile-First</h3>
          <p className="text-sm text-muted-foreground">
            Diseño iOS-inspired con gestures, animaciones suaves y adaptación
            automática a todos los dispositivos.
          </p>
        </div>

        <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl">
          <h3 className="font-bold text-lg mb-2 text-blue-600">⚡ TypeScript + DX</h3>
          <p className="text-sm text-muted-foreground">
            Completamente tipado con interfaces claras, autocompletado perfecto
            y documentación inline para máxima productividad.
          </p>
        </div>

        <div className="p-6 bg-purple-500/5 border border-purple-500/20 rounded-xl">
          <h3 className="font-bold text-lg mb-2 text-purple-600">✨ Animaciones Pulidas</h3>
          <p className="text-sm text-muted-foreground">
            Transiciones suaves, efectos hover/active, scale effects y feedback
            visual claro en cada interacción.
          </p>
        </div>
      </div>

      <div className="border-l-4 border-primary pl-4 py-2">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> Usa la navegación lateral (o los pills en móvil) para explorar
          los componentes. Cada sección incluye <strong className="text-foreground">ejemplos interactivos,
          código de uso completo y tabla de props</strong> con todos los parámetros disponibles.
        </p>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-muted/50 rounded-xl border border-border">
          <div className="text-3xl font-bold text-primary">35+</div>
          <div className="text-xs text-muted-foreground mt-1">Componentes</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-xl border border-border">
          <div className="text-3xl font-bold text-green-600">100%</div>
          <div className="text-xs text-muted-foreground mt-1">TypeScript</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-xl border border-border">
          <div className="text-3xl font-bold text-blue-600">iOS</div>
          <div className="text-xs text-muted-foreground mt-1">Design System</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-xl border border-border">
          <div className="text-3xl font-bold text-purple-600">70+</div>
          <div className="text-xs text-muted-foreground mt-1">Variantes</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Catálogo de Componentes</h3>

        <div className="grid gap-3">
          <ComponentCard
            title="Button"
            description="Componente de botón con múltiples variantes, tamaños y estados."
            features={['7 variantes', '5 tamaños', 'Loading states', 'Icon support']}
          />

          <ComponentCard
            title="Modal"
            description="Modal/Dialog con animaciones iOS y soporte para gestos."
            features={['iOS Style', 'Swipe to close', 'Backdrop blur', 'Responsive']}
          />

          <ComponentCard
            title="LoadingSpinner"
            description="Spinners de carga con 7 variantes diferentes estilo iOS."
            features={['7 variantes', '3 tamaños', 'iOS style', 'Inline support']}
          />

          <ComponentCard
            title="LoadingOverlay"
            description="Overlay modal con glassmorphism para bloquear UI durante operaciones."
            features={['Glassmorphism', 'Success state', 'Auto-close', 'Mobile optimized']}
          />

          <ComponentCard
            title="LoadingScreen"
            description="Pantalla de carga centralizada con CustomLoader."
            features={['Full screen mode', 'Custom message', 'Centered layout']}
          />

          <ComponentCard
            title="CustomLoader"
            description="Loader personalizado con animación de bolas."
            features={['Unique design', 'Theme aware', 'Smooth animation']}
          />

          <ComponentCard
            title="Input Components"
            description="Familia completa de inputs estilo iOS con múltiples variantes."
            features={['4 variantes', 'Floating labels', 'Auto-resize', 'iOS Style', 'Validation states']}
          />

          <ComponentCard
            title="Card"
            description="Contenedor versátil con soporte para header, content, footer y glassmorphism."
            features={['Header/Footer', 'Glassmorphism', 'Hover effects', 'No padding mode']}
          />

          <ComponentCard
            title="Banner"
            description="Componente para destacar información o alertas con variantes de color."
            features={['6 variantes', 'Icon support', 'Action slot', 'Gradient mode']}
          />

          <ComponentCard
            title="Table"
            description="Tablas responsivas y estilizadas para datos tabulares."
            features={['Responsive', 'Styled headers', 'Hover rows', 'Footer support']}
          />

          <ComponentCard
            title="iOS Table"
            description="Tablas estilo iOS con secciones agrupadas, perfectas para configuraciones."
            features={['Grouped sections', 'Toggle switches', 'iOS Style', 'Chevron navigation']}
          />

          <ComponentCard
            title="ItemList"
            description="Componente de lista optimizado para móviles estilo tarjeta iOS."
            features={['Mobile optimized', 'iOS Style', 'Tags support', 'Actions slot']}
          />

          <ComponentCard
            title="ErrorAlert"
            description="Alertas de error con detección automática de permisos y soluciones."
            features={['Auto-detect permissions', 'Dismissible', 'Solution guides', 'Dark mode']}
          />

          <ComponentCard
            title="ConfirmationModal"
            description="Modal de confirmación para acciones importantes con estados de carga."
            features={['Destructive variant', 'Loading states', 'Auto-close', 'Customizable']}
          />

          <ComponentCard
            title="Switch"
            description="Toggle switch estilo iOS para activar/desactivar opciones."
            features={['iOS Style', 'With icons', 'Disabled state', 'Label & description']}
          />

          <ComponentCard
            title="BudgetMonitor"
            description="Componente lógico para monitorear presupuestos y enviar alertas."
            features={['Invisible', 'Real-time monitoring', 'Toast alerts', 'PWA notifications']}
          />

          <ComponentCard
            title="InstallPWA"
            description="Banner promocional para instalación de PWA."
            features={['Auto-detection', 'Manual instructions', 'Dismissible', 'Native install']}
          />

          <ComponentCard
            title="EditNameModal"
            description="Modal especializado para renombrar elementos."
            features={['Input validation', 'Auto-focus', 'Custom title', 'Callback support']}
          />

          <ComponentCard
            title="SegmentedControl"
            description="Control segmentado estilo iOS para cambiar entre vistas."
            features={['iOS Style', 'Smooth animations', 'Multiple sizes', 'Full width mode']}
          />

          <ComponentCard
            title="Toast"
            description="Notificaciones toast con múltiples variantes y animaciones."
            features={['5 variantes', 'Auto-dismiss', 'Promise support', 'Theme aware']}
          />

          <ComponentCard
            title="ActionSheet"
            description="Menú de acciones estilo iOS que se desliza desde abajo."
            features={['iOS Style', 'Swipe to close', 'Destructive actions', 'Backdrop blur']}
          />

          <ComponentCard
            title="Badge"
            description="Insignias para contar notificaciones y destacar información."
            features={['6 variantes', '3 tamaños', 'Dot mode', 'Max count']}
          />

          <ComponentCard
            title="SearchBar"
            description="Barra de búsqueda estilo iOS con animaciones y cancelación."
            features={['iOS Style', 'Cancel button', 'Clear button', 'Debounce']}
          />

          <ComponentCard
            title="SwipeableListItem"
            description="Item de lista con acciones al deslizar (swipe gestures)."
            features={['Swipe actions', 'Left & Right', 'Haptic feedback', 'Customizable']}
          />

          <ComponentCard
            title="EmptyState"
            description="Estados vacíos ilustrados para mejorar la UX cuando no hay datos."
            features={['Icon support', 'Action buttons', 'Customizable', 'Responsive']}
          />

          <ComponentCard
            title="Chip / Tag"
            description="Etiquetas interactivas para filtros, tags y selección múltiple."
            features={['6 variantes', '3 tamaños', 'Removable', 'Icon support']}
          />

          <ComponentCard
            title="DatePicker"
            description="Selector de fechas nativo HTML5 estilizado para consistencia."
            features={['Native HTML5', '4 variantes', 'iOS Style', 'Range support']}
          />

          <ComponentCard
            title="Stepper"
            description="Control numérico estilizado con botones +/- para valores precisos."
            features={['4 variantes', '3 tamaños', 'Smooth animations', 'Custom format', 'Scale effect']}
          />

          <ComponentCard
            title="ProgressBar"
            description="Barras de progreso animadas con múltiples variantes y modos."
            features={['6 variantes', '3 tamaños', 'Striped mode', 'Animated', 'Label support']}
          />

          <ComponentCard
            title="StatCard"
            description="Tarjetas de estadísticas para dashboards con iconos y barras de progreso."
            features={['6 colores', 'Progress bar', 'Subtitle & footer', 'Hover effects', 'Background icon']}
          />

          <ComponentCard
            title="ActivityList"
            description="Lista de actividad reciente con iconos, valores y acciones."
            features={['Header/Footer actions', 'Badges support', 'Empty state', 'Clickable items']}
          />

          <ComponentCard
            title="QuickAction"
            description="Botones de acceso rápido con iconos para dashboards."
            features={['5 variantes', '3 tamaños', 'Grid responsive', 'Badge support', 'Hover effects']}
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
