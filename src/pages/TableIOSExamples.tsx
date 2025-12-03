import {
  TableIOS,
  TableIOSSection,
  TableIOSRow,
  TableIOSToggleRow,
} from "@components/common/TableIOS";
import CodePreview from "@components/common/CodePreview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Card } from "@components/common/Card";
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

      <div className="space-y-8">
        {/* Settings Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Configuración</h3>
          <CodePreview
            code={`<TableIOS>
  <TableIOSSection title="Cuenta">
    <TableIOSRow
      icon={<User className="h-5 w-5 text-primary" />}
      label="Perfil"
      value="Juan Pérez"
      chevron
      onClick={() => {}}
    />
    <TableIOSRow
      icon={<Mail className="h-5 w-5 text-blue-500" />}
      label="Email"
      value="juan@example.com"
      chevron
    />
  </TableIOSSection>

  <TableIOSSection 
    title="Preferencias"
    footer="Las notificaciones te mantienen informado."
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
  </TableIOSSection>

  <TableIOSSection>
    <TableIOSRow
      icon={<Trash2 className="h-5 w-5 text-destructive" />}
      label="Eliminar Cuenta"
      destructive
      chevron
    />
  </TableIOSSection>
</TableIOS>`}
          >
            <div className="max-w-md mx-auto">
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
          </CodePreview>
        </div>

        {/* Simple List Example */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lista Simple</h3>
          <CodePreview
            code={`<TableIOS>
  <TableIOSSection title="Categorías">
    <TableIOSRow
      label="Alimentación"
      value="S/ 450.00"
      chevron
    />
    <TableIOSRow
      label="Transporte"
      value="S/ 200.00"
      chevron
    />
  </TableIOSSection>
</TableIOS>`}
          >
            <div className="max-w-md mx-auto">
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
          </CodePreview>
        </div>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">TableIOS</TableCell>
                <TableCell className="font-mono text-xs">grouped</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Activa el estilo agrupado (por defecto true).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableIOSSection</TableCell>
                <TableCell className="font-mono text-xs">title</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Título de la sección.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableIOSSection</TableCell>
                <TableCell className="font-mono text-xs">footer</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Pie de página de la sección.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableIOSRow</TableCell>
                <TableCell className="font-mono text-xs">label</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Texto principal de la fila.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableIOSRow</TableCell>
                <TableCell className="font-mono text-xs">value</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>Valor secundario (lado derecho).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableIOSRow</TableCell>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">ReactNode</TableCell>
                <TableCell>Icono izquierdo.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableIOSRow</TableCell>
                <TableCell className="font-mono text-xs">chevron</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Muestra icono de flecha derecha.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableIOSToggleRow</TableCell>
                <TableCell className="font-mono text-xs">checked</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Estado del switch.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableIOSToggleRow</TableCell>
                <TableCell className="font-mono text-xs">onToggle</TableCell>
                <TableCell className="font-mono text-xs">(checked: boolean) - void</TableCell>
                <TableCell>Callback al cambiar el estado.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
