import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/common/Table";
import { IconButton } from "@components/common/Button";
import CodePreview from "@components/common/CodePreview";
import { Card } from "@components/common/Card";
import { Edit2, Trash2 } from "lucide-react";

export function TableExamples() {
  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Pagado",
      totalAmount: "$250.00",
      paymentMethod: "Tarjeta de Crédito",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pendiente",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "No Pagado",
      totalAmount: "$350.00",
      paymentMethod: "Transferencia",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Table Component</h2>
        <p className="text-muted-foreground">
          Tablas responsivas para mostrar datos tabulares.
        </p>
      </div>

      <div className="space-y-8">
        <CodePreview
          code={`<Table>
  <TableCaption>Lista de facturas recientes.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Factura</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead>Método</TableHead>
      <TableHead className="text-right">Monto</TableHead>
      <TableHead className="text-center">Acciones</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.map((invoice) => (
      <TableRow key={invoice.invoice}>
        <TableCell className="font-medium">{invoice.invoice}</TableCell>
        <TableCell>{invoice.paymentStatus}</TableCell>
        <TableCell>{invoice.paymentMethod}</TableCell>
        <TableCell className="text-right">{invoice.totalAmount}</TableCell>
        <TableCell className="text-center">
          <IconButton icon={Edit2} size="sm" variant="ghost" />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell className="text-right">$2,500.00</TableCell>
      <TableCell />
    </TableRow>
  </TableFooter>
</Table>`}
        >
          <div className="border rounded-xl p-4 bg-background">
            <Table>
              <TableCaption>Lista de facturas recientes.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Factura</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.invoice}>
                    <TableCell className="font-medium">{invoice.invoice}</TableCell>
                    <TableCell>{invoice.paymentStatus}</TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell className="text-right">{invoice.totalAmount}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <IconButton icon={Edit2} size="sm" variant="ghost" label="Editar" />
                        <IconButton icon={Trash2} size="sm" variant="ghost" className="text-destructive hover:text-destructive" label="Eliminar" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3}>Total</TableCell>
                  <TableCell className="text-right">$750.00</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CodePreview>
      </div>

      {/* Props Reference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Props Reference</h3>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">Table</TableCell>
                <TableCell>Contenedor principal de la tabla.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableHeader</TableCell>
                <TableCell>Encabezado de la tabla (thead).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableBody</TableCell>
                <TableCell>Cuerpo de la tabla (tbody).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableFooter</TableCell>
                <TableCell>Pie de tabla (tfoot).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableRow</TableCell>
                <TableCell>Fila de la tabla (tr).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableHead</TableCell>
                <TableCell>Celda de encabezado (th).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableCell</TableCell>
                <TableCell>Celda de datos (td).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TableCaption</TableCell>
                <TableCell>Título o descripción de la tabla (caption).</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
