import { useState } from "react";
import Button from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/common/Table";
import { toast } from "react-hot-toast";

export function BudgetMonitorExamples() {
  const simulateWarning = () => {
    toast("Atención: Estás al 85% de tu presupuesto de Alimentación.", { icon: '⚠️', duration: 4000 });
  };

  const simulateExceeded = () => {
    toast.error("¡Alerta! Has excedido tu presupuesto de Transporte. (S/ 150.00 / S/ 100.00)", { duration: 5000, icon: '🚨' });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">BudgetMonitor Component</h2>
        <p className="text-muted-foreground">
          Componente lógico (invisible) que monitorea los gastos en tiempo real y envía notificaciones cuando se acercan o exceden los límites del presupuesto.
        </p>
      </div>

      <div className="space-y-8">
        {/* Simulation */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Simulación de Alertas</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Este componente no tiene interfaz visual propia, pero genera las siguientes notificaciones:
          </p>
          
          <CodePreview
            code={`// Uso en el layout principal
<BudgetMonitor />

// Lógica interna (simplificada)
useEffect(() => {
  if (porcentaje >= 100) {
    toast.error("¡Presupuesto Excedido!", { icon: '🚨' });
    enviarNotificacionPWA(...);
  } else if (porcentaje >= 80) {
    toast("Presupuesto al 80%", { icon: '⚠️' });
  }
}, [gastos, presupuestos]);`}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={simulateWarning} variant="secondary">
                Simular Alerta (80%)
              </Button>
              <Button onClick={simulateExceeded} variant="destructive">
                Simular Exceso (100%)
              </Button>
            </div>
          </CodePreview>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="font-bold mb-2">🔔 Notificaciones Toast</h4>
            <p className="text-sm text-muted-foreground">
              Muestra alertas visuales inmediatas dentro de la aplicación utilizando `react-hot-toast`.
            </p>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-bold mb-2">📱 Notificaciones PWA</h4>
            <p className="text-sm text-muted-foreground">
              Envía notificaciones push nativas si la app está instalada y tiene permisos, incluso en segundo plano (dependiendo del soporte del navegador).
            </p>
          </Card>
          
          <Card className="p-4">
            <h4 className="font-bold mb-2">🧠 Estado Inteligente</h4>
            <p className="text-sm text-muted-foreground">
              Mantiene un registro de las alertas enviadas para evitar spam. Solo notifica una vez por umbral (80% y 100%) hasta que el estado se reinicia.
            </p>
          </Card>

          <Card className="p-4">
            <h4 className="font-bold mb-2">📅 Filtrado Mensual</h4>
            <p className="text-sm text-muted-foreground">
              Automáticamente filtra los gastos del mes actual para compararlos con los presupuestos definidos.
            </p>
          </Card>
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
                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                  Este componente no acepta props. Consume datos directamente de los hooks `useGastos` y `usePresupuestos`.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
