/**
 * Input Components - iOS Style
 * Componentes de entrada estilo iOS con diseño limpio y minimalista
 *
 * ✨ Características:
 * - Input básico con variantes (default, filled, underlined, iOS settings)
 * - TextArea con auto-resize opcional
 * - Select personalizado estilo iOS
 * - InputGroup para agrupar inputs al estilo iOS Settings
 * - Soporte completo para iconos
 * - Estados: focus, disabled, error, success
 * - Labels flotantes opcionales
 * - Animaciones suaves
 */

import { useState, useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';

// ========================================
// INPUT BÁSICO
// ========================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Variantes de estilo
  variant?: 'default' | 'filled' | 'underlined' | 'ios';

  // Estados
  error?: boolean;
  errorMessage?: string;
  success?: boolean;
  successMessage?: string;

  // Label
  label?: string;
  labelFloating?: boolean; // Label flotante (aparece cuando hay valor)
  required?: boolean;

  // Iconos
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconClassName?: string;
  iconColor?: string; // Color personalizado del icono

  // Helper text
  helperText?: string;

  // Contenedor
  containerClassName?: string;

  // Wrapper del input (para cuando hay iconos)
  wrapperClassName?: string;
}

export const Input = ({
    variant = 'default',
    error = false,
    errorMessage,
    success = false,
    successMessage,
    label,
    labelFloating = false,
    required = false,
    icon: Icon,
    iconPosition = 'left',
    iconClassName = '',
    iconColor,
    helperText,
    containerClassName = '',
    wrapperClassName = '',
    className = '',
    disabled,
    value,
    onChange,
    ref,
    ...props
  }: InputProps & { ref?: React.Ref<HTMLInputElement> }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!value);

    useEffect(() => {
      setHasValue(!!value);
    }, [value]);

    // Variantes de estilo base
    const variantClasses = {
      default: `
        px-4 py-2.5 rounded-lg border border-border
        bg-background text-foreground
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
      `,
      filled: `
        px-4 py-2.5 rounded-lg border-0
        bg-muted/50 text-foreground
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-muted
      `,
      underlined: `
        px-0 py-2 border-0 border-b-2 border-border rounded-none
        bg-transparent text-foreground
        focus:outline-none focus:border-primary
      `,
      ios: `
        px-0 py-2 border-0 rounded-none
        bg-transparent text-foreground text-sm font-medium
        focus:outline-none placeholder:text-muted-foreground/50
      `,
    };

    // Estados
    const stateClasses = error
      ? 'border-destructive focus:ring-destructive/50 focus:border-destructive'
      : success
      ? 'border-green-500 focus:ring-green-500/50 focus:border-green-500'
      : '';

    // Clases base del input
    const baseInputClasses = `
      w-full
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantClasses[variant]}
      ${stateClasses}
      ${Icon && iconPosition === 'left' ? 'pl-10' : ''}
      ${Icon && iconPosition === 'right' ? 'pr-10' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    // Determinar icono de estado
    const StateIcon = error
      ? AlertCircle
      : success
      ? CheckCircle2
      : null;

    const stateIconColor = error
      ? 'text-destructive'
      : success
      ? 'text-green-500'
      : '';

    // Label flotante (solo si labelFloating está activo)
    const labelClass = labelFloating
      ? `
          absolute left-3 transition-all duration-200 pointer-events-none
          ${isFocused || hasValue
            ? 'top-0 text-xs text-primary bg-background px-1 -translate-y-1/2'
            : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground'
          }
        `.trim().replace(/\s+/g, ' ')
      : 'block text-sm font-medium text-foreground mb-1.5';

    return (
      <div className={`w-full ${containerClassName}`}>
        {/* Label normal o flotante */}
        {label && !labelFloating && (
          <label className={labelClass}>
            {label} {required && <span className="text-destructive">*</span>}
          </label>
        )}

        {/* Wrapper relativo para iconos y label flotante */}
        <div className={`relative ${wrapperClassName}`}>
          {/* Label flotante dentro del wrapper */}
          {label && labelFloating && (
            <label className={labelClass}>
              {label} {required && <span className="text-destructive">*</span>}
            </label>
          )}

          {/* Icono izquierdo */}
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon className={`h-4 w-4 ${iconColor || 'text-muted-foreground'} ${iconClassName}`} />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            disabled={disabled}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={baseInputClasses}
            {...props}
          />

          {/* Icono derecho o icono de estado */}
          {(Icon && iconPosition === 'right') || StateIcon ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              {StateIcon ? (
                <StateIcon className={`h-4 w-4 ${stateIconColor}`} />
              ) : Icon ? (
                <Icon className={`h-4 w-4 ${iconColor || 'text-muted-foreground'} ${iconClassName}`} />
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Helper text, error o success message */}
        {(helperText || errorMessage || successMessage) && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? 'text-destructive'
                : success
                ? 'text-green-600 dark:text-green-500'
                : 'text-muted-foreground'
            }`}
          >
            {errorMessage || successMessage || helperText}
          </p>
        )}
      </div>
    );
  };

Input.displayName = 'Input';

// ========================================
// TEXTAREA
// ========================================

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'underlined' | 'ios';
  error?: boolean;
  errorMessage?: string;
  success?: boolean;
  successMessage?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  containerClassName?: string;
  autoResize?: boolean; // Auto ajusta la altura según el contenido
  maxHeight?: number; // Altura máxima en px (para autoResize)
  icon?: LucideIcon;
  iconClassName?: string;
  iconColor?: string;
}

export const TextArea = ({
    variant = 'default',
    error = false,
    errorMessage,
    success = false,
    successMessage,
    label,
    required = false,
    helperText,
    containerClassName = '',
    autoResize = false,
    maxHeight = 300,
    icon: Icon,
    iconClassName = '',
    iconColor,
    className = '',
    disabled,
    onChange,
    ref,
    ...props
  }: TextAreaProps & { ref?: React.Ref<HTMLTextAreaElement> }) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto resize
    useEffect(() => {
      if (autoResize && textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        const scrollHeight = textAreaRef.current.scrollHeight;
        textAreaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      }
    }, [props.value, autoResize, maxHeight]);

    const variantClasses = {
      default: `
        px-4 py-2.5 rounded-lg border border-border
        bg-background text-foreground
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
      `,
      filled: `
        px-4 py-2.5 rounded-lg border-0
        bg-muted/50 text-foreground
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-muted
      `,
      underlined: `
        px-0 py-2 border-0 border-b-2 border-border rounded-none
        bg-transparent text-foreground
        focus:outline-none focus:border-primary
      `,
      ios: `
        px-0 py-2 border-0 rounded-none
        bg-transparent text-foreground text-sm
        focus:outline-none placeholder:text-muted-foreground/50
      `,
    };

    const stateClasses = error
      ? 'border-destructive focus:ring-destructive/50 focus:border-destructive'
      : success
      ? 'border-green-500 focus:ring-green-500/50 focus:border-green-500'
      : '';

    const baseClasses = `
      w-full
      resize-none
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantClasses[variant]}
      ${stateClasses}
      ${Icon ? 'pt-8' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) onChange(e);
      if (autoResize && textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
        const scrollHeight = textAreaRef.current.scrollHeight;
        textAreaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      }
    };

    const StateIcon = error ? AlertCircle : success ? CheckCircle2 : null;
    const stateIconColor = error ? 'text-destructive' : success ? 'text-green-500' : '';

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label} {required && <span className="text-destructive">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Icono */}
          {Icon && (
            <div className="absolute left-3 top-3 pointer-events-none">
              <Icon className={`h-4 w-4 ${iconColor || 'text-muted-foreground'} ${iconClassName}`} />
            </div>
          )}

          <textarea
            ref={(node) => {
              textAreaRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                // @ts-ignore
                ref.current = node;
              }
            }}
            disabled={disabled}
            onChange={handleChange}
            className={baseClasses}
            {...props}
          />

          {/* Icono de estado */}
          {StateIcon && (
            <div className="absolute right-3 top-3 pointer-events-none">
              <StateIcon className={`h-4 w-4 ${stateIconColor}`} />
            </div>
          )}
        </div>

        {(helperText || errorMessage || successMessage) && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? 'text-destructive'
                : success
                ? 'text-green-600 dark:text-green-500'
                : 'text-muted-foreground'
            }`}
          >
            {errorMessage || successMessage || helperText}
          </p>
        )}
      </div>
    );
  };

TextArea.displayName = 'TextArea';

// ========================================
// SELECT
// ========================================

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'filled' | 'underlined' | 'ios';
  error?: boolean;
  errorMessage?: string;
  success?: boolean;
  successMessage?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  containerClassName?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  iconColor?: string;
  placeholder?: string;
}

export const Select = ({
    variant = 'default',
    error = false,
    errorMessage,
    success = false,
    successMessage,
    label,
    required = false,
    helperText,
    containerClassName = '',
    icon: Icon,
    iconClassName = '',
    iconColor,
    className = '',
    disabled,
    placeholder,
    children,
    ref,
    ...props
  }: SelectProps & { ref?: React.Ref<HTMLSelectElement> }) => {
    const variantClasses = {
      default: `
        px-4 py-2.5 pr-10 rounded-lg border border-border
        bg-background text-foreground
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
      `,
      filled: `
        px-4 py-2.5 pr-10 rounded-lg border-0
        bg-muted/50 text-foreground
        focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-muted
      `,
      underlined: `
        px-0 py-2 pr-8 border-0 border-b-2 border-border rounded-none
        bg-transparent text-foreground
        focus:outline-none focus:border-primary
      `,
      ios: `
        px-0 py-2 pr-8 border-0 rounded-none
        bg-transparent text-foreground text-sm font-medium
        focus:outline-none appearance-none
      `,
    };

    const stateClasses = error
      ? 'border-destructive focus:ring-destructive/50 focus:border-destructive'
      : success
      ? 'border-green-500 focus:ring-green-500/50 focus:border-green-500'
      : '';

    const baseClasses = `
      w-full
      appearance-none
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantClasses[variant]}
      ${stateClasses}
      ${Icon ? 'pl-10' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    const StateIcon = error ? AlertCircle : success ? CheckCircle2 : null;
    const stateIconColor = error ? 'text-destructive' : success ? 'text-green-500' : '';

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label} {required && <span className="text-destructive">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Icono izquierdo */}
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon className={`h-4 w-4 ${iconColor || 'text-muted-foreground'} ${iconClassName}`} />
            </div>
          )}

          <select ref={ref} disabled={disabled} className={baseClasses} {...props}>
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          {/* Chevron o icono de estado */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {StateIcon ? (
              <StateIcon className={`h-4 w-4 ${stateIconColor}`} />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {(helperText || errorMessage || successMessage) && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? 'text-destructive'
                : success
                ? 'text-green-600 dark:text-green-500'
                : 'text-muted-foreground'
            }`}
          >
            {errorMessage || successMessage || helperText}
          </p>
        )}
      </div>
    );
  };

Select.displayName = 'Select';

// ========================================
// INPUT GROUP (Estilo iOS Settings)
// ========================================

export interface InputGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  divided?: boolean; // Si true, muestra divisores entre items
}

/**
 * InputGroup - Agrupa inputs al estilo iOS Settings
 * Crea un contenedor con fondo card, bordes redondeados y divisores opcionales
 */
export function InputGroup({ children, title, description, className = '', divided = true }: InputGroupProps) {
  // Wrapper para cada child con divisor
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={`w-full ${className}`}>
      {/* Título y descripción del grupo */}
      {(title || description) && (
        <div className="mb-2 px-1">
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      )}

      {/* Contenedor tipo iOS Settings */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {divided ? (
          <div className="divide-y divide-border">
            {childrenArray.map((child, index) => (
              <div key={index} className="p-3">
                {child}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 space-y-3">{children}</div>
        )}
      </div>
    </div>
  );
}

// ========================================
// INPUT ROW (Para usar dentro de InputGroup)
// ========================================

export interface InputRowProps {
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconClassName?: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

/**
 * InputRow - Fila de input estilo iOS Settings
 * Para usar dentro de InputGroup
 */
export function InputRow({
  label,
  icon: Icon,
  iconColor,
  iconClassName = '',
  children,
  description,
  className = '',
}: InputRowProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icono */}
      {Icon && (
        <div className={`p-1.5 rounded-lg ${iconColor || 'bg-primary/10'}`}>
          <Icon className={`h-4 w-4 ${iconClassName || 'text-primary'}`} />
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 flex items-center justify-between gap-3">
        <div className="flex-shrink-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <div className="flex-1 max-w-xs">{children}</div>
      </div>
    </div>
  );
}

// ========================================
// CHECKBOX SWITCH (Estilo iOS)
// ========================================

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconClassName?: string;
  containerClassName?: string;
}

export const Switch = ({
    label,
    description,
    icon: Icon,
    iconColor,
    iconClassName = '',
    containerClassName = '',
    className = '',
    checked,
    disabled,
    ref,
    ...props
  }: SwitchProps & { ref?: React.Ref<HTMLInputElement> }) => {
    return (
      <div className={`flex items-center justify-between ${containerClassName}`}>
        {/* Label e icono */}
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-1.5 rounded-lg ${iconColor || 'bg-primary/10'}`}>
              <Icon className={`h-4 w-4 ${iconClassName || 'text-primary'}`} />
            </div>
          )}
          <div>
            {label && <p className="text-sm font-medium text-foreground">{label}</p>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>

        {/* Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              w-11 h-6 bg-muted rounded-full peer
              peer-checked:bg-primary
              peer-focus:ring-2 peer-focus:ring-primary/50
              peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
              after:content-['']
              after:absolute after:top-[2px] after:left-[2px]
              after:bg-white after:rounded-full
              after:h-5 after:w-5
              after:transition-all
              peer-checked:after:translate-x-5
              transition-colors
              ${className}
            `}
          />
        </label>
      </div>
    );
  };

Switch.displayName = 'Switch';

// ========================================
// EXPORTS
// ========================================

export default Input;
