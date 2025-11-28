# Input Components - iOS Style

Familia completa de componentes de entrada con diseño minimalista inspirado en iOS.

## 📁 Ubicación
- **Componentes**: `src/components/common/Input.tsx`
- **Ejemplos**: `src/components/common/InputExamples.tsx`
- **Documentación**: Ver en `/documentacion` (sección "Inputs & Forms")

## 🎨 Componentes Disponibles

### 1. Input
Input básico con 4 variantes estilísticas.

```tsx
import { Input } from '@components/common/Input';

<Input
  variant="filled"
  label="Email"
  type="email"
  icon={Mail}
  placeholder="tu@email.com"
  error={!!errors.email}
  errorMessage={errors.email}
  required
/>
```

**Variantes**:
- `default` - Estilo tradicional con bordes
- `filled` - Fondo relleno sin borde
- `underlined` - Solo línea inferior (Material Design)
- `ios` - Minimalista sin bordes (iOS Settings)

**Props principales**:
- `variant` - Estilo del input
- `label` - Etiqueta del campo
- `labelFloating` - Label que flota al escribir
- `icon` - Icono de Lucide React
- `iconPosition` - 'left' | 'right'
- `iconColor` - Color personalizado del icono
- `error` / `errorMessage` - Estado de error
- `success` / `successMessage` - Estado de éxito
- `helperText` - Texto de ayuda
- `required` - Campo obligatorio

### 2. TextArea
Área de texto con auto-resize opcional.

```tsx
import { TextArea } from '@components/common/Input';

<TextArea
  variant="filled"
  label="Descripción"
  autoResize
  maxHeight={200}
  icon={AlignLeft}
  placeholder="Escribe una descripción..."
/>
```

**Props adicionales**:
- `autoResize` - Ajusta automáticamente la altura
- `maxHeight` - Altura máxima en px cuando autoResize está activo

### 3. Select
Select personalizado estilo iOS.

```tsx
import { Select } from '@components/common/Input';

<Select
  variant="ios"
  label="Categoría"
  icon={Tag}
  iconColor="text-orange-500"
>
  <option value="">Seleccionar...</option>
  <option value="alimentacion">Alimentación</option>
  <option value="transporte">Transporte</option>
</Select>
```

**Características**:
- Chevron personalizado automático
- Estados de validación
- Iconos izquierdos

### 4. InputGroup
Contenedor estilo iOS Settings para agrupar inputs.

```tsx
import { InputGroup, InputRow } from '@components/common/Input';

<InputGroup
  title="Información Personal"
  description="Actualiza tus datos"
>
  <InputRow label="Nombre" icon={User} iconColor="bg-blue-500/10">
    <Input variant="ios" placeholder="Tu nombre" />
  </InputRow>

  <InputRow label="Email" icon={Mail} iconColor="bg-red-500/10">
    <Input variant="ios" type="email" />
  </InputRow>
</InputGroup>
```

**Props**:
- `title` - Título del grupo
- `description` - Descripción del grupo
- `divided` - Muestra divisores entre items (default: true)

### 5. InputRow
Fila de input para usar dentro de InputGroup.

```tsx
<InputRow
  label="Monto"
  icon={DollarSign}
  iconColor="bg-green-500/10"
  iconClassName="text-green-500"
  description="Monto en soles"
>
  <Input variant="ios" type="number" />
</InputRow>
```

### 6. Switch
Toggle switch estilo iOS.

```tsx
import { Switch } from '@components/common/Input';

<Switch
  label="Notificaciones Push"
  description="Recibe alertas en tiempo real"
  icon={Bell}
  iconColor="bg-purple-500/10"
  iconClassName="text-purple-500"
  checked={enableNotifications}
  onChange={handleChange}
  name="enableNotifications"
/>
```

## 📚 Patrones de Uso

### Formulario iOS Style
Perfecto para pantallas de configuración o ajustes.

```tsx
<InputGroup title="Nuevo Gasto">
  <InputRow label="Monto" icon={DollarSign} iconColor="bg-green-500/10">
    <Input variant="ios" type="number" placeholder="0.00" />
  </InputRow>

  <InputRow label="Categoría" icon={Tag} iconColor="bg-orange-500/10">
    <Select variant="ios">
      <option value="alimentacion">Alimentación</option>
      <option value="transporte">Transporte</option>
    </Select>
  </InputRow>

  <div className="px-3">
    <TextArea
      variant="ios"
      label="Descripción"
      autoResize
      placeholder="¿En qué gastaste?"
    />
  </div>
</InputGroup>
```

### Formulario Tradicional
Para formularios de login, registro, etc.

```tsx
<form className="space-y-4">
  <Input
    variant="filled"
    label="Email"
    type="email"
    icon={Mail}
    required
    error={!!errors.email}
    errorMessage={errors.email}
  />

  <Input
    variant="filled"
    label="Contraseña"
    type="password"
    icon={Lock}
    required
  />

  <Button type="submit" fullWidth loading={isSubmitting}>
    Iniciar Sesión
  </Button>
</form>
```

### Configuración con Switches
Para toggles en configuración.

```tsx
<InputGroup title="Preferencias">
  <Switch
    label="Modo Oscuro"
    icon={Moon}
    iconColor="bg-indigo-500/10"
    checked={darkMode}
    onChange={(e) => setDarkMode(e.target.checked)}
  />

  <Switch
    label="Notificaciones"
    description="Recibe alertas de presupuesto"
    icon={Bell}
    iconColor="bg-purple-500/10"
    checked={notifications}
    onChange={(e) => setNotifications(e.target.checked)}
  />
</InputGroup>
```

## 🎯 ¿Cuándo usar cada variante?

### default
- ✅ Formularios tradicionales
- ✅ Compatible con todos los diseños
- ✅ Mayor contraste visual

### filled
- ✅ Formularios modernos
- ✅ Menos ruido visual
- ✅ Ideal para formularios largos
- ✅ Login/Registro

### underlined
- ✅ Minimalista Material Design
- ✅ Espacios reducidos
- ✅ Formularios compactos

### ios
- ✅ Configuración/Ajustes
- ✅ Listas estilo iOS Settings
- ✅ Ultra-minimalista
- ✅ Debe usarse dentro de InputGroup

## 🎨 Personalización de Iconos

Los iconos se pueden personalizar con colores específicos:

```tsx
// Iconos con colores de fondo
<InputRow
  icon={DollarSign}
  iconColor="bg-green-500/10"
  iconClassName="text-green-500"
>
  ...
</InputRow>

// Colores disponibles comunes:
// - bg-blue-500/10 + text-blue-500
// - bg-green-500/10 + text-green-500
// - bg-orange-500/10 + text-orange-500
// - bg-red-500/10 + text-red-500
// - bg-purple-500/10 + text-purple-500
// - bg-indigo-500/10 + text-indigo-500
```

## ⚠️ Notas Importantes

1. **Variant iOS**: Siempre usar dentro de `InputGroup` para mejor apariencia
2. **Auto-resize**: Solo disponible en `TextArea`, requiere `maxHeight` para límite
3. **Labels flotantes**: Solo funcionan en variant `default` y `filled`
4. **Iconos**: Deben ser de Lucide React para consistencia
5. **Validación**: Los estados error/success muestran iconos automáticos

## 📖 Ver Ejemplos Completos

Para ver todos los ejemplos interactivos:
1. Ejecuta la aplicación: `npm run dev`
2. Ve a `/documentacion`
3. Selecciona la sección "Inputs & Forms"

## 🔗 Referencias

- **CLAUDE.md**: Sección "Componentes Comunes"
- **InputExamples.tsx**: Ejemplos completos de uso
- **Lucide React**: https://lucide.dev/icons
