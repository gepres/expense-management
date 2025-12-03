import { useState } from 'react';
import {
  Input,
  TextArea,
  Select,
  InputGroup,
  InputRow,
} from './Input';
import CodePreview from "@components/common/CodePreview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Card } from "@components/common/Card";
import {
  Mail,
  Lock,
  User,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  AlignLeft,
} from 'lucide-react';

export default function InputExamples() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    amount: '',
    category: '',
    description: '',
    date: '',
    enableNotifications: true,
    darkMode: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Input Components - iOS Style</h1>
        <p className="text-muted-foreground">
          Componentes de entrada con diseño limpio y minimalista inspirado en iOS
        </p>
      </div>

      {/* ========== VARIANTES DE INPUT ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Variantes de Input</h2>

        <div className="grid md:grid-cols-1 gap-8">
          {/* Default */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Default</h3>
            <CodePreview
              code={`<Input
  label="Input Default"
  type="email"
  placeholder="tu@email.com"
  icon={Mail}
  helperText="Estilo por defecto"
/>`}
            >
              <div className="max-w-md mx-auto">
                <Input
                  label="Input Default"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                  helperText="Estilo por defecto con bordes"
                />
              </div>
            </CodePreview>
          </div>

          {/* Filled */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Filled</h3>
            <CodePreview
              code={`<Input
  variant="filled"
  label="Input Filled"
  placeholder="Usuario"
  icon={User}
/>`}
            >
              <div className="max-w-md mx-auto">
                <Input
                  variant="filled"
                  label="Input Filled"
                  name="username"
                  placeholder="Usuario"
                  icon={User}
                  value={formData.username}
                  onChange={handleChange}
                  helperText="Estilo con fondo relleno"
                />
              </div>
            </CodePreview>
          </div>

          {/* Underlined */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Underlined</h3>
            <CodePreview
              code={`<Input
  variant="underlined"
  label="Input Underlined"
  type="password"
  icon={Lock}
/>`}
            >
              <div className="max-w-md mx-auto">
                <Input
                  variant="underlined"
                  label="Input Underlined"
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                  helperText="Estilo con línea inferior"
                />
              </div>
            </CodePreview>
          </div>

          {/* iOS */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">iOS Style</h3>
            <CodePreview
              code={`<Input
  variant="ios"
  label="Input iOS"
  type="number"
  placeholder="0.00"
  icon={DollarSign}
  iconColor="text-green-500"
/>`}
            >
              <div className="max-w-md mx-auto">
                <Input
                  variant="ios"
                  label="Input iOS"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  icon={DollarSign}
                  iconColor="text-green-500"
                  value={formData.amount}
                  onChange={handleChange}
                  helperText="Estilo minimalista iOS"
                />
              </div>
            </CodePreview>
          </div>
        </div>
      </section>

      {/* ========== ESTADOS ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Estados</h2>
        <CodePreview
          code={`<Input
  label="Error State"
  error
  errorMessage="Mensaje de error"
/>

<Input
  label="Success State"
  success
  successMessage="Mensaje de éxito"
/>

<Input
  label="Disabled State"
  disabled
/>`}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Input con Error"
              placeholder="Ingresa un email válido"
              icon={Mail}
              error
              errorMessage="Este email ya está registrado"
            />
            <Input
              label="Input con Success"
              placeholder="Email disponible"
              icon={Mail}
              success
              successMessage="Email disponible"
              value="usuario@email.com"
              readOnly
            />
            <Input
              label="Input Deshabilitado"
              placeholder="No editable"
              icon={Lock}
              disabled
              value="Campo bloqueado"
            />
            <Input
              label="Input Requerido"
              placeholder="Campo obligatorio"
              icon={User}
              required
              helperText="Este campo es obligatorio"
            />
          </div>
        </CodePreview>
      </section>

      {/* ========== TEXTAREA ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">TextArea</h2>
        <CodePreview
          code={`<TextArea
  label="Descripción"
  placeholder="Escribe..."
  rows={4}
  autoResize
/>`}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <TextArea
              label="Descripción"
              placeholder="Escribe una descripción..."
              rows={4}
              icon={AlignLeft}
              helperText="Máximo 500 caracteres"
            />
            <TextArea
              variant="filled"
              label="Comentario (Auto-resize)"
              placeholder="Escribe algo..."
              autoResize
              maxHeight={200}
              helperText="Se ajusta automáticamente al contenido"
            />
          </div>
        </CodePreview>
      </section>

      {/* ========== SELECT ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Select</h2>
        <CodePreview
          code={`<Select
  label="Categoría"
  icon={Tag}
>
  <option value="">Seleccionar...</option>
  <option value="1">Opción 1</option>
</Select>`}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <Select
              label="Categoría"
              name="category"
              icon={Tag}
              value={formData.category}
              onChange={handleChange}
              helperText="Selecciona una categoría"
            >
              <option value="">Seleccionar...</option>
              <option value="alimentacion">Alimentación</option>
              <option value="transporte">Transporte</option>
              <option value="entretenimiento">Entretenimiento</option>
            </Select>
            <Select
              variant="filled"
              label="Método de Pago"
              icon={CreditCard}
              iconColor="text-blue-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="yape">Yape</option>
            </Select>
          </div>
        </CodePreview>
      </section>

      {/* ========== INPUT GROUP ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Input Group (iOS Settings)</h2>
        <CodePreview
          code={`<InputGroup title="Información Personal">
  <InputRow label="Nombre" icon={User}>
    <Input variant="ios" placeholder="Tu nombre" />
  </InputRow>
  
  <InputRow label="Email" icon={Mail}>
    <Input variant="ios" type="email" />
  </InputRow>
</InputGroup>`}
        >
          <div className="max-w-md mx-auto">
            <InputGroup title="Información Personal" description="Actualiza tus datos personales">
              <InputRow label="Nombre" icon={User} iconColor="bg-blue-500/10" iconClassName="text-blue-500">
                <Input variant="ios" placeholder="Tu nombre" />
              </InputRow>

              <InputRow label="Email" icon={Mail} iconColor="bg-red-500/10" iconClassName="text-red-500">
                <Input variant="ios" type="email" placeholder="tu@email.com" />
              </InputRow>

              <InputRow label="Fecha" icon={Calendar} iconColor="bg-orange-500/10" iconClassName="text-orange-500">
                <Input variant="ios" type="date" />
              </InputRow>
            </InputGroup>
          </div>
        </CodePreview>
      </section>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">variant</TableCell>
                <TableCell className="font-mono text-xs">'default' | 'filled' | 'underlined' | 'ios'</TableCell>
                <TableCell className="font-mono text-xs">'default'</TableCell>
                <TableCell>Estilo visual del input.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">label</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Etiqueta del campo.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">labelFloating</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Activa el label flotante animado.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">error</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell className="font-mono text-xs">false</TableCell>
                <TableCell>Indica estado de error.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">errorMessage</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Mensaje de error a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell className="font-mono text-xs">-</TableCell>
                <TableCell>Icono a mostrar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">iconPosition</TableCell>
                <TableCell className="font-mono text-xs">'left' | 'right'</TableCell>
                <TableCell className="font-mono text-xs">'left'</TableCell>
                <TableCell>Posición del icono.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
