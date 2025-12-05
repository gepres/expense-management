/**
 * Button Component
 * Componente de botón reutilizable con todas las variantes del proyecto
 * ✨ Características:
 * - 8 variantes (primary, secondary, destructive, ghost, success, outline, blue, pro)
 * - 5 tamaños (xs, sm, md, lg, xl)
 * - Estados: loading, disabled, active
 * - Tipos especiales: icon-only, pill, floating
 * - Soporte completo para iconos
 * - Animaciones y transiciones suaves
 */

import LoadingSpinner, { LoadingOverlay } from './LoadingSpinner';
import type { LucideIcon } from 'lucide-react';
import { useBreakpoints } from '@/hooks/useBreakpoints';

// Re-export LucideIcon for use in other components
export type { LucideIcon };

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Variantes de color/estilo
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'success' | 'outline' | 'blue' | 'pro';

  // Tamaños
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // Estados
  loading?: boolean;
  loadingText?: string;
  active?: boolean;

  // Tipos especiales
  pill?: boolean;        // Botón redondeado completo (rounded-full)
  iconOnly?: boolean;    // Solo icono (sin texto)
  floating?: boolean;    // FAB (Floating Action Button)
  fullWidth?: boolean;   // Ancho completo

  // Iconos
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconClassName?: string;

  loadingOverlay?: boolean;

  // Spinner personalizado
  spinnerVariant?: 'simple' | 'dots' | 'dots2' | 'dots3' | 'material';

  // Children
  children?: React.ReactNode;
}

const Button = ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    active = false,
    pill = false,
    iconOnly = false,
    floating = false,
    fullWidth = false,
    icon: Icon,
    iconPosition = 'left',
    iconClassName = '',
    spinnerVariant = 'dots3',
    className = '',
    disabled,
    children,
    loadingOverlay,
    ref,
    ...props
  }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) => {
    // Variantes de color
    const variantClasses = {
      primary: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm',
      secondary: 'bg-muted hover:bg-muted/80 text-foreground',
      destructive: 'bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm',
      ghost: 'bg-transparent hover:bg-muted text-foreground',
      success: 'bg-green-500 hover:bg-green-600 text-white shadow-sm',
      outline: 'bg-transparent border-2 border-border hover:bg-accent text-foreground',
      blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
      pro: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:scale-105',
    };

    // Tamaños
    const sizeClasses = {
      xs: iconOnly
        ? 'p-1 h-6 w-6'
        : 'px-2 py-1 text-xs',
      sm: iconOnly
        ? 'p-1.5 h-8 w-8'
        : 'px-2.5 py-1.5 text-xs',
      md: iconOnly
        ? 'p-2 h-10 w-10'
        : 'px-4 py-2 text-sm',
      lg: iconOnly
        ? 'p-2.5 h-12 w-12'
        : 'px-6 py-3 text-sm',
      xl: iconOnly
        ? 'p-3 h-14 w-14'
        : 'px-8 py-3.5 text-base',
    };

    // Tamaños de iconos según tamaño de botón
    const iconSizeClasses = {
      xs: 'h-3 w-3',
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    };

    // Roundness
    const roundnessClass = pill || iconOnly || floating
      ? 'rounded-full'
      : 'rounded-xl';

    // Shadow especial para FAB
    const floatingShadow = floating ? 'shadow-lg shadow-primary/20' : '';

    // Hover scale para FAB
    const floatingHover = floating ? 'hover:scale-105' : '';

    // Estado activo
    const activeClass = active
      ? 'ring-2 ring-primary ring-offset-2 bg-primary/10 border-primary'
      : '';

    // Clases base
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-semibold
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${roundnessClass}
      ${floatingShadow}
      ${floatingHover}
      ${activeClass}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    const { isMobile } = useBreakpoints()

    // Renderizar contenido del botón
    const renderContent = () => {
      if (loading) {
        return (
          <>
            <LoadingSpinner
              variant={spinnerVariant}
              size={size === 'xs' ? 'sm' : size === 'xl' ? 'lg' : 'md'}
            />
            {loadingText && !isMobile  ? <span>{loadingText}</span> : loadingOverlay && <LoadingOverlay variant={spinnerVariant} isOpen={true} />}
            {!loadingText && !iconOnly && children && <span>{children}</span>}
          </>
        );
      }

      if (iconOnly && Icon) {
        return <Icon className={`${iconSizeClasses[size]} ${iconClassName}`} />;
      }

      if (Icon && iconPosition === 'left') {
        return (
          <>
            <Icon className={`${iconSizeClasses[size]} ${iconClassName}`} />
            {children}
          </>
        );
      }

      if (Icon && iconPosition === 'right') {
        return (
          <>
            {children}
            <Icon className={`${iconSizeClasses[size]} ${iconClassName}`} />
          </>
        );
      }

      return children;
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={baseClasses}
        {...props}
      >
        {renderContent()}
      </button>
    );
  };

Button.displayName = 'Button';

export default Button;

/**
 * ButtonGroup Component
 * Agrupa múltiples botones con espaciado consistente
 */
export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'tight' | 'normal' | 'loose';
  fullWidth?: boolean;
  className?: string;
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  spacing = 'normal',
  fullWidth = false,
  className = '',
}: ButtonGroupProps) {
  const spacingClasses = {
    tight: orientation === 'horizontal' ? 'gap-1' : 'gap-1',
    normal: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    loose: orientation === 'horizontal' ? 'gap-4' : 'gap-4',
  };

  const orientationClass = orientation === 'horizontal' ? 'flex-row' : 'flex-col';

  return (
    <div
      className={`flex ${orientationClass} ${spacingClasses[spacing]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * IconButton Component
 * Atajo para crear botones solo con icono
 */
export interface IconButtonProps extends Omit<ButtonProps, 'iconOnly'> {
  icon: LucideIcon;
  label?: string; // Para accesibilidad (aria-label)
}

export function IconButton({ icon, label, ...props }: IconButtonProps) {
  return (
    <Button
      iconOnly
      icon={icon}
      aria-label={label}
      {...props}
    />
  );
}

/**
 * FloatingActionButton Component
 * Botón flotante (FAB) para acciones principales
 */
export interface FABProps extends Omit<ButtonProps, 'floating' | 'iconOnly'> {
  icon: LucideIcon;
  label?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  icon,
  label,
  position = 'bottom-right',
  className = '',
  ...props
}: FABProps) {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-6 right-6',
    'top-left': 'fixed top-6 left-6',
  };

  return (
    <Button
      floating
      iconOnly
      icon={icon}
      aria-label={label}
      size="lg"
      className={`${positionClasses[position]} z-50 ${className}`}
      {...props}
    />
  );
}

/**
 * PillButton Component
 * Botón en forma de píldora para categorías/tags
 */
export interface PillButtonProps extends Omit<ButtonProps, 'pill'> {
  selected?: boolean;
}

export function PillButton({ selected, ...props }: PillButtonProps) {
  return (
    <Button
      pill
      active={selected}
      size="sm"
      variant={selected ? 'primary' : 'outline'}
      {...props}
    />
  );
}

/**
 * LoadingButton Component
 * Botón con estado de carga simplificado
 */
export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
}

export function LoadingButton({ isLoading, loadingText, variant, ...props }: LoadingButtonProps) {
  return <Button loading={isLoading} loadingText={loadingText} variant={variant} {...props} />;
}


export function ContainerLoadingButton({ isLoading, loadingText, text }: { isLoading: boolean, loadingText: string, text?: React.ReactNode }) {

  const { isMobile } = useBreakpoints()
  return <div>
    {
      isLoading ? (
        <>
        {
        !isMobile ? (
          <div className='flex items-center justify-center gap-2'>
          <LoadingSpinner variant="dots3" size="md"/>
          <span>{loadingText}</span>
          </div>
        ) : (
          <div className='flex items-center justify-center gap-2 py-2'>
            <LoadingSpinner variant="dots3" size="md"/>
          </div>
        )
        }
        </>
      ) : (
        <>
        <span>{text || ''}</span>
        </>
      )
    }
  </div>;
}