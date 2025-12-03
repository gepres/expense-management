import { Switch } from "@components/common/Input";
import { useState } from "react";
import { Bell, Wifi, Moon, Lock, Volume2 } from "lucide-react";
import CodePreview from "@components/common/CodePreview";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { Card } from "@components/common/Card";

export function SwitchExamples() {
  const [switch1, setSwitch1] = useState(false);
  const [switch2, setSwitch2] = useState(true);
  const [switch3, setSwitch3] = useState(false);
  const [switch4, setSwitch4] = useState(true);
  const [switch5, setSwitch5] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [wifi, setWifi] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoLock, setAutoLock] = useState(true);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Switch Component (iOS Style)</h2>
        <p className="text-muted-foreground">
          Toggle switch estilo iOS para activar/desactivar opciones.
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Switch */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Switch Básico</h3>
          <CodePreview
            code={`<Switch
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
  label="Activar función"
/>`}
          >
            <div className="bg-card border border-border rounded-xl p-4 max-w-md mx-auto">
              <Switch
                checked={switch1}
                onChange={(e) => setSwitch1(e.target.checked)}
                label="Activar función"
              />
            </div>
          </CodePreview>
        </div>

        {/* With Description */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Con Descripción</h3>
          <CodePreview
            code={`<Switch
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
  label="Notificaciones Push"
  description="Recibe alertas sobre tus gastos"
/>`}
          >
            <div className="bg-card border border-border rounded-xl p-4 max-w-md mx-auto">
              <Switch
                checked={switch2}
                onChange={(e) => setSwitch2(e.target.checked)}
                label="Notificaciones Push"
                description="Recibe alertas sobre tus gastos y presupuestos"
              />
            </div>
          </CodePreview>
        </div>

        {/* With Icon */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Con Icono</h3>
          <CodePreview
            code={`<Switch
  label="Modo Oscuro"
  description="Cambia la apariencia"
  icon={Moon}
  iconColor="bg-purple-100 dark:bg-purple-900/30"
  iconClassName="text-purple-600 dark:text-purple-400"
/>`}
          >
            <div className="bg-card border border-border rounded-xl p-4 space-y-3 max-w-md mx-auto">
              <Switch
                checked={switch3}
                onChange={(e) => setSwitch3(e.target.checked)}
                label="Modo Oscuro"
                description="Cambia la apariencia de la aplicación"
                icon={Moon}
                iconColor="bg-purple-100 dark:bg-purple-900/30"
                iconClassName="text-purple-600 dark:text-purple-400"
              />
              <div className="border-t border-border pt-3">
                <Switch
                  checked={switch4}
                  onChange={(e) => setSwitch4(e.target.checked)}
                  label="Sonido"
                  icon={Volume2}
                  iconColor="bg-blue-100 dark:bg-blue-900/30"
                  iconClassName="text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
          </CodePreview>
        </div>

        {/* Disabled State */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Estado Deshabilitado</h3>
          <CodePreview
            code={`<Switch
  label="Función no disponible"
  description="Esta opción está deshabilitada"
  disabled
/>`}
          >
            <div className="bg-card border border-border rounded-xl p-4 max-w-md mx-auto">
              <Switch
                checked={switch5}
                onChange={(e) => setSwitch5(e.target.checked)}
                label="Función no disponible"
                description="Esta opción está deshabilitada temporalmente"
                disabled
              />
            </div>
          </CodePreview>
        </div>

        {/* iOS Settings Style */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Estilo iOS Settings</h3>
          <CodePreview
            code={`<div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
  <div className="p-4">
    <Switch label="Notificaciones" icon={Bell} />
  </div>
  <div className="p-4">
    <Switch label="Wi-Fi" icon={Wifi} />
  </div>
</div>`}
          >
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4">
                Configuración
              </h4>
              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                <div className="p-4">
                  <Switch
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    label="Notificaciones"
                    description="Alertas sobre gastos y presupuestos"
                    icon={Bell}
                    iconColor="bg-red-100 dark:bg-red-900/30"
                    iconClassName="text-red-600 dark:text-red-400"
                  />
                </div>
                <div className="p-4">
                  <Switch
                    checked={wifi}
                    onChange={(e) => setWifi(e.target.checked)}
                    label="Sincronización Wi-Fi"
                    description="Sincronizar solo cuando estés conectado a Wi-Fi"
                    icon={Wifi}
                    iconColor="bg-blue-100 dark:bg-blue-900/30"
                    iconClassName="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="p-4">
                  <Switch
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    label="Modo Oscuro"
                    icon={Moon}
                    iconColor="bg-purple-100 dark:bg-purple-900/30"
                    iconClassName="text-purple-600 dark:text-purple-400"
                  />
                </div>
                <div className="p-4">
                  <Switch
                    checked={autoLock}
                    onChange={(e) => setAutoLock(e.target.checked)}
                    label="Bloqueo Automático"
                    description="Requiere autenticación después de 5 minutos"
                    icon={Lock}
                    iconColor="bg-yellow-100 dark:bg-yellow-900/30"
                    iconClassName="text-yellow-600 dark:text-yellow-400"
                  />
                </div>
              </div>
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
                <TableHead>Prop</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">checked</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Estado del switch (controlado).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">onChange</TableCell>
                <TableCell className="font-mono text-xs">(e) =&gt; void</TableCell>
                <TableCell>Callback cuando cambia el estado.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">label</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Texto del label principal.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">description</TableCell>
                <TableCell className="font-mono text-xs">string</TableCell>
                <TableCell>Texto descriptivo secundario.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">icon</TableCell>
                <TableCell className="font-mono text-xs">LucideIcon</TableCell>
                <TableCell>Icono opcional a la izquierda.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">disabled</TableCell>
                <TableCell className="font-mono text-xs">boolean</TableCell>
                <TableCell>Deshabilita la interacción.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>💡 Tip:</strong> El Switch es perfecto para opciones de configuración estilo iOS Settings.
            Combínalo con divisores para crear listas de configuración elegantes.
          </p>
        </div>
      </div>
    </div>
  );
}
