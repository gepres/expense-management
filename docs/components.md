# Componentes Comunes

Documentación de los componentes reutilizables en `src/components/common/`.

## Filosofía

- **Reutilizables**: Diseñados para usarse en múltiples contextos
- **Consistentes**: Misma API y comportamiento
- **Accesibles**: Soporte para ARIA labels y estados
- **Personalizables**: Props para adaptar estilos
- **Tipados**: TypeScript estricto con interfaces completas

---

## Button

`src/components/common/Button.tsx`

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'success' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  active?: boolean;
  pill?: boolean;
  iconOnly?: boolean;
  floating?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  spinnerVariant?: 'simple' | 'dots' | 'dots2' | 'dots3' | 'material';
}
```

**Características**:
- 6 variantes de color/estilo
- 5 tamaños predefinidos
- Estados: loading, disabled, active
- Tipos especiales: pill, icon-only, FAB
- Soporte completo para iconos (Lucide)
- Componentes auxiliares: `IconButton`, `FloatingActionButton`, `PillButton`, `ButtonGroup`

**Ejemplo**:
```tsx
<Button variant="primary" size="lg" icon={Check} loading={isSubmitting} loadingText="Guardando...">
  Guardar
</Button>
```

---

## Input Components - iOS Style

`src/components/common/Input.tsx`

### Input

```typescript
interface InputProps {
  variant?: 'default' | 'filled' | 'underlined' | 'ios';
  error?: boolean;
  errorMessage?: string;
  success?: boolean;
  successMessage?: string;
  label?: string;
  labelFloating?: boolean;
  required?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconColor?: string;
  helperText?: string;
}
```

**Variantes**:
- **default**: Estilo tradicional con bordes completos
- **filled**: Fondo relleno sin borde
- **underlined**: Solo línea inferior (Material Design)
- **ios**: Minimalista sin bordes (estilo iOS Settings)

**Ejemplo**:
```tsx
<Input variant="filled" label="Email" type="email" icon={Mail}
  placeholder="tu@email.com" error={!!errors.email} errorMessage={errors.email} required />
```

### TextArea

```typescript
interface TextAreaProps {
  variant?: 'default' | 'filled' | 'underlined' | 'ios';
  autoResize?: boolean;
  maxHeight?: number;
  error?: boolean;
  errorMessage?: string;
  label?: string;
  icon?: LucideIcon;
}
```

**Ejemplo**:
```tsx
<TextArea variant="filled" label="Descripción" autoResize maxHeight={200}
  icon={AlignLeft} placeholder="Escribe una descripción..." />
```

### Select

```typescript
interface SelectProps {
  variant?: 'default' | 'filled' | 'underlined' | 'ios';
  error?: boolean;
  errorMessage?: string;
  label?: string;
  icon?: LucideIcon;
  placeholder?: string;
}
```

**Ejemplo**:
```tsx
<Select variant="ios" label="Categoría" icon={Tag} iconColor="text-orange-500">
  <option value="">Seleccionar...</option>
  <option value="alimentacion">Alimentación</option>
</Select>
```

### InputGroup + InputRow

Replica diseño de iOS Settings (card con divisores).

```typescript
interface InputGroupProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  divided?: boolean;
}

interface InputRowProps {
  label: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  description?: string;
}
```

**Ejemplo**:
```tsx
<InputGroup title="Información Personal" description="Actualiza tus datos">
  <InputRow label="Nombre" icon={User}>
    <Input variant="ios" placeholder="Tu nombre" />
  </InputRow>
  <InputRow label="Email" icon={Mail}>
    <Input variant="ios" type="email" />
  </InputRow>
</InputGroup>
```

### Switch

```typescript
interface SwitchProps {
  label?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  checked?: boolean;
}
```

**Ejemplo**:
```tsx
<Switch label="Notificaciones Push" description="Recibe alertas en tiempo real"
  icon={Bell} iconColor="bg-purple-500/10" checked={enableNotifications} onChange={handleChange} />
```

---

## Otros componentes

| Componente | Ubicación | Uso |
|---|---|---|
| `CustomLoader` | `common/CustomLoader.tsx` | Loader con animaciones |
| `LoadingSpinner` | `common/LoadingSpinner.tsx` | Spinner con variantes (`simple`, `dots`, `dots2`, `dots3`, `material`) |
| `ErrorAlert` | `common/ErrorAlert.tsx` | Mostrar errores |
| `Modal` | `common/Modal.tsx` | Modal base reutilizable |
| `ConfirmationModal` | `common/ConfirmationModal.tsx` | Modal de confirmación |
| `InstallPWA` | `common/InstallPWA.tsx` | Banner para instalar PWA |
| `BudgetMonitor` | `common/BudgetMonitor.tsx` | Monitor con alertas de presupuesto |

---

## Patrones de uso

### Formulario iOS Style

```tsx
<InputGroup title="Nuevo Gasto">
  <InputRow label="Monto" icon={DollarSign} iconColor="bg-green-500/10">
    <Input variant="ios" type="number" placeholder="0.00" />
  </InputRow>
  <InputRow label="Categoría" icon={Tag} iconColor="bg-orange-500/10">
    <Select variant="ios">
      <option value="alimentacion">Alimentación</option>
    </Select>
  </InputRow>
</InputGroup>
```

### Formulario tradicional

```tsx
<form className="space-y-4">
  <Input variant="filled" label="Email" type="email" icon={Mail} required
    error={!!errors.email} errorMessage={errors.email} />
  <TextArea variant="filled" label="Comentario" autoResize maxHeight={200} />
  <Select variant="filled" label="Categoría">
    <option value="">Seleccionar...</option>
  </Select>
  <Button type="submit" fullWidth loading={isSubmitting} loadingText="Guardando...">
    Guardar
  </Button>
</form>
```

---

## Decisiones de diseño

**¿Cuándo usar cada variante de Input?**

| Caso | Variante recomendada |
|---|---|
| Login/Registro | `filled` o `default` |
| Formularios de datos | `default` o `filled` |
| Configuración/Ajustes | `ios` dentro de `InputGroup` |
| Formularios simples | `underlined` |

**¿Por qué InputGroup/InputRow?** Replican el diseño iOS Settings: familiar, limpio, ideal para configuración.
