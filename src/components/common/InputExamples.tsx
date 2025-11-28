/**
 * Input Components - Ejemplos de Uso
 *
 * Este archivo muestra todos los casos de uso de los componentes Input
 * Para ver estos ejemplos, importa este componente en cualquier ruta de tu app
 */

import { useState } from 'react';
import {
  Input,
  TextArea,
  Select,
  InputGroup,
  InputRow,
  Switch,
} from './Input';
import {
  Mail,
  Lock,
  User,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  CreditCard,
  AlignLeft,
  Bell,
  Globe,
  Palette,
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
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Input Components - iOS Style</h1>
        <p className="text-muted-foreground">
          Componentes de entrada con diseño limpio y minimalista inspirado en iOS
        </p>
      </div>

      {/* ========== VARIANTES DE INPUT ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Variantes de Input</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Default */}
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

          {/* Filled */}
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

          {/* Underlined */}
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

          {/* iOS */}
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
      </section>

      {/* ========== ESTADOS ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Estados de Input</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Error */}
          <Input
            label="Input con Error"
            placeholder="Ingresa un email válido"
            icon={Mail}
            error
            errorMessage="Este email ya está registrado"
          />

          {/* Success */}
          <Input
            label="Input con Success"
            placeholder="Email disponible"
            icon={Mail}
            success
            successMessage="Email disponible"
            value="usuario@email.com"
          />

          {/* Disabled */}
          <Input
            label="Input Deshabilitado"
            placeholder="No editable"
            icon={Lock}
            disabled
            value="Campo bloqueado"
          />

          {/* Required */}
          <Input
            label="Input Requerido"
            placeholder="Campo obligatorio"
            icon={User}
            required
            helperText="Este campo es obligatorio"
          />
        </div>
      </section>

      {/* ========== LABEL FLOTANTE ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Label Flotante</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <Input
            variant="default"
            label="Email"
            labelFloating
            placeholder="tu@email.com"
            type="email"
          />

          <Input
            variant="filled"
            label="Contraseña"
            labelFloating
            placeholder="Ingresa tu contraseña"
            type="password"
          />
        </div>
      </section>

      {/* ========== TEXTAREA ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">TextArea</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Default */}
          <TextArea
            label="Descripción"
            placeholder="Escribe una descripción..."
            rows={4}
            icon={AlignLeft}
            helperText="Máximo 500 caracteres"
          />

          {/* Auto Resize */}
          <TextArea
            variant="filled"
            label="Comentario (Auto-resize)"
            placeholder="Escribe algo..."
            autoResize
            maxHeight={200}
            helperText="Se ajusta automáticamente al contenido"
          />

          {/* iOS Style */}
          <TextArea
            variant="ios"
            label="Notas"
            placeholder="Tus notas aquí..."
            rows={3}
          />

          {/* Con error */}
          <TextArea
            label="Descripción con error"
            placeholder="Escribe algo..."
            error
            errorMessage="La descripción es demasiado corta"
            rows={4}
          />
        </div>
      </section>

      {/* ========== SELECT ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Select</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Default */}
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

          {/* Filled */}
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

          {/* iOS */}
          <Select variant="ios" label="Mes" icon={Calendar}>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
          </Select>

          {/* Con error */}
          <Select
            label="Horario"
            icon={Clock}
            error
            errorMessage="Debes seleccionar un horario"
          >
            <option value="">Seleccionar...</option>
            <option value="morning">Mañana</option>
            <option value="afternoon">Tarde</option>
            <option value="night">Noche</option>
          </Select>
        </div>
      </section>

      {/* ========== INPUT GROUP (iOS Settings Style) ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Input Group - iOS Settings Style</h2>

        {/* Ejemplo 1: Información Personal */}
        <InputGroup title="Información Personal" description="Actualiza tus datos personales">
          <InputRow label="Nombre" icon={User} iconColor="bg-blue-500/10" iconClassName="text-blue-500">
            <Input variant="ios" placeholder="Tu nombre" />
          </InputRow>

          <InputRow label="Email" icon={Mail} iconColor="bg-red-500/10" iconClassName="text-red-500">
            <Input variant="ios" type="email" placeholder="tu@email.com" />
          </InputRow>

          <InputRow label="Fecha de Nacimiento" icon={Calendar} iconColor="bg-orange-500/10" iconClassName="text-orange-500">
            <Input variant="ios" type="date" />
          </InputRow>
        </InputGroup>

        {/* Ejemplo 2: Configuración de Notificaciones */}
        <InputGroup title="Notificaciones" description="Gestiona tus preferencias de notificación">
          <Switch
            label="Notificaciones Push"
            description="Recibe alertas en tiempo real"
            icon={Bell}
            iconColor="bg-purple-500/10"
            iconClassName="text-purple-500"
            checked={formData.enableNotifications}
            onChange={handleChange}
            name="enableNotifications"
          />

          <Switch
            label="Modo Oscuro"
            description="Activa el tema oscuro"
            icon={Palette}
            iconColor="bg-indigo-500/10"
            iconClassName="text-indigo-500"
            checked={formData.darkMode}
            onChange={handleChange}
            name="darkMode"
          />

          <Switch
            label="Idioma"
            description="Cambiar idioma de la app"
            icon={Globe}
            iconColor="bg-green-500/10"
            iconClassName="text-green-500"
          />
        </InputGroup>

        {/* Ejemplo 3: Configuración de Gasto */}
        <InputGroup title="Detalles del Gasto" divided={false}>
          <Input
            variant="ios"
            label="Monto"
            icon={DollarSign}
            iconColor="text-green-500"
            placeholder="0.00"
            type="number"
          />

          <Select variant="ios" label="Categoría" icon={Tag} iconColor="text-orange-500">
            <option value="">Seleccionar...</option>
            <option value="alimentacion">Alimentación</option>
            <option value="transporte">Transporte</option>
          </Select>

          <TextArea
            variant="ios"
            label="Descripción"
            icon={AlignLeft}
            iconColor="text-blue-500"
            placeholder="¿En qué gastaste?"
            rows={3}
            autoResize
          />
        </InputGroup>
      </section>

      {/* ========== ICONOS PERSONALIZADOS ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Iconos Personalizados</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Input
            label="Icono Izquierdo"
            icon={Mail}
            iconPosition="left"
            iconColor="text-blue-500"
            placeholder="Email"
          />

          <Input
            label="Icono Derecho"
            icon={Calendar}
            iconPosition="right"
            iconColor="text-orange-500"
            placeholder="Fecha"
          />

          <Input
            label="Sin Icono"
            placeholder="Solo texto"
          />
        </div>
      </section>

      {/* ========== COMBINACIONES ========== */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Combinaciones Avanzadas</h2>

        {/* Formulario de Login */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Formulario de Login</h3>

          <Input
            variant="filled"
            label="Email"
            type="email"
            icon={Mail}
            placeholder="tu@email.com"
            required
          />

          <Input
            variant="filled"
            label="Contraseña"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            required
          />

          <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Iniciar Sesión
          </button>
        </div>

        {/* Formulario de Gasto */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold mb-4">Nuevo Gasto</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              variant="default"
              label="Monto"
              type="number"
              icon={DollarSign}
              iconColor="text-green-500"
              placeholder="0.00"
              required
            />

            <Select
              variant="default"
              label="Categoría"
              icon={Tag}
              iconColor="text-orange-500"
              required
            >
              <option value="">Seleccionar...</option>
              <option value="alimentacion">Alimentación</option>
              <option value="transporte">Transporte</option>
            </Select>
          </div>

          <TextArea
            label="Descripción"
            icon={AlignLeft}
            placeholder="¿En qué gastaste?"
            rows={3}
            autoResize
          />

          <Input
            variant="default"
            label="Fecha"
            type="date"
            icon={Calendar}
            iconColor="text-blue-500"
            required
          />

          <button className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Guardar Gasto
          </button>
        </div>
      </section>
    </div>
  );
}
