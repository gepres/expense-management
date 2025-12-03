import {
  TableIOS,
  TableIOSSection,
  TableIOSRow,
  TableIOSToggleRow,
} from "@components/common/TableIOS";
import { Settings, Bell, Lock, User, Mail, Smartphone, Trash2 } from "lucide-react";
import { useState } from "react";

export function TableIOSExamples() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">iOS-Style Table</h2>
        <p className="text-muted-foreground">
          Tablas estilo iOS con secciones agrupadas, perfectas para configuraciones y listas.
        </p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* Settings Example */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Ejemplo: Configuración</h3>
          <TableIOS>
            <TableIOSSection title="Cuenta">
              <TableIOSRow
                icon={<User className="h-5 w-5 text-primary" />}
                label="Perfil"
                value="Juan Pérez"
                chevron
                onClick={() => alert('Ir a perfil')}
              />
              <TableIOSRow
                icon={<Mail className="h-5 w-5 text-blue-500" />}
                label="Email"
                value="juan@example.com"
                chevron
                onClick={() => alert('Editar email')}
              />
              <TableIOSRow
                icon={<Smartphone className="h-5 w-5 text-green-500" />}
                label="Teléfono"
                value="+51 999 999 999"
                chevron
                onClick={() => alert('Editar teléfono')}
              />
            </TableIOSSection>

            <TableIOSSection 
              title="Preferencias"
              footer="Las notificaciones te mantienen informado sobre tus gastos y presupuestos."
            >
              <TableIOSToggleRow
                icon={<Bell className="h-5 w-5 text-yellow-500" />}
                label="Notificaciones"
                checked={notifications}
                onToggle={setNotifications}
              />
              <TableIOSToggleRow
                icon={<Settings className="h-5 w-5 text-gray-500" />}
                label="Modo Oscuro"
                checked={darkMode}
                onToggle={setDarkMode}
              />
              <TableIOSToggleRow
                icon={<Lock className="h-5 w-5 text-purple-500" />}
                label="Auto-guardar"
                checked={autoSave}
                onToggle={setAutoSave}
              />
            </TableIOSSection>

            <TableIOSSection>
              <TableIOSRow
                icon={<Trash2 className="h-5 w-5 text-destructive" />}
                label="Eliminar Cuenta"
                destructive
                chevron
                onClick={() => alert('Eliminar cuenta')}
              />
            </TableIOSSection>
          </TableIOS>
        </div>

        {/* Simple List Example */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Ejemplo: Lista Simple</h3>
          <TableIOS>
            <TableIOSSection title="Categorías">
              <TableIOSRow
                label="Alimentación"
                value="S/ 450.00"
                chevron
                onClick={() => {}}
              />
              <TableIOSRow
                label="Transporte"
                value="S/ 200.00"
                chevron
                onClick={() => {}}
              />
              <TableIOSRow
                label="Entretenimiento"
                value="S/ 150.00"
                chevron
                onClick={() => {}}
              />
            </TableIOSSection>
          </TableIOS>
        </div>

        {/* Without Icons */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Ejemplo: Sin Iconos</h3>
          <TableIOS>
            <TableIOSSection title="Información">
              <TableIOSRow
                label="Versión"
                value="1.0.0"
              />
              <TableIOSRow
                label="Última actualización"
                value="Hace 2 días"
              />
              <TableIOSRow
                label="Términos y Condiciones"
                chevron
                onClick={() => {}}
              />
            </TableIOSSection>
          </TableIOS>
        </div>
      </div>
    </div>
  );
}
