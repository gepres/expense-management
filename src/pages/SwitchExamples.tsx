import { Switch } from "@components/common/Input";
import { useState } from "react";
import { Bell, Wifi, Moon, Lock, Volume2 } from "lucide-react";

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

      <div className="space-y-6 max-w-2xl">
        {/* Basic Switch */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Switch Básico</h3>
          <div className="bg-card border border-border rounded-xl p-4">
            <Switch
              checked={switch1}
              onChange={(e) => setSwitch1(e.target.checked)}
              label="Activar función"
            />
          </div>
        </div>

        {/* With Description */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Con Descripción</h3>
          <div className="bg-card border border-border rounded-xl p-4">
            <Switch
              checked={switch2}
              onChange={(e) => setSwitch2(e.target.checked)}
              label="Notificaciones Push"
              description="Recibe alertas sobre tus gastos y presupuestos"
            />
          </div>
        </div>

        {/* With Icon */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Con Icono</h3>
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
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
        </div>

        {/* Disabled State */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Estado Deshabilitado</h3>
          <div className="bg-card border border-border rounded-xl p-4">
            <Switch
              checked={switch5}
              onChange={(e) => setSwitch5(e.target.checked)}
              label="Función no disponible"
              description="Esta opción está deshabilitada temporalmente"
              disabled
            />
          </div>
        </div>

        {/* iOS Settings Style */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Estilo iOS Settings</h3>
          <div className="space-y-2">
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
        </div>

        {/* Props Reference */}
        <div className="mt-8 p-6 bg-muted/50 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Props</h3>
          <div className="space-y-2 text-sm font-mono">
            <div><code>checked: boolean</code> - Estado del switch</div>
            <div><code>onChange: (e) =&gt; void</code> - Callback cuando cambia</div>
            <div><code>label?: string</code> - Texto del label</div>
            <div><code>description?: string</code> - Texto descriptivo</div>
            <div><code>icon?: LucideIcon</code> - Icono opcional</div>
            <div><code>iconColor?: string</code> - Color de fondo del icono</div>
            <div><code>iconClassName?: string</code> - Clases del icono</div>
            <div><code>disabled?: boolean</code> - Deshabilitar switch</div>
            <div><code>containerClassName?: string</code> - Clases del contenedor</div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>💡 Tip:</strong> El Switch es perfecto para opciones de configuración estilo iOS Settings.
              Combínalo con divisores para crear listas de configuración elegantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
