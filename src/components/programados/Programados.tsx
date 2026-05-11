/**
 * Página /programados — wrapper con tabs:
 *   1. Gastos programados (recurrentes)
 *   2. Transferencias programadas (entre cuentas)
 */

import { useState } from 'react';
import { Repeat } from 'lucide-react';
import { SegmentedControl } from '@components/common/SegmentedControl';
import ListaGastosProgramados from './ListaGastosProgramados';
import ListaTransferenciasProgramadas from './ListaTransferenciasProgramadas';

type Tab = 'gastos' | 'transferencias';

const OPTIONS = [
  { value: 'gastos', label: 'Gastos' },
  { value: 'transferencias', label: 'Transferencias' },
];

export default function Programados() {
  const [tab, setTab] = useState<Tab>('gastos');

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24">
      {/* Header común */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Repeat className="h-6 w-6 text-primary" />
          Programados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {tab === 'gastos'
            ? 'Gastos recurrentes que se ejecutan automáticamente'
            : 'Transferencias automáticas entre tus cuentas'}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <SegmentedControl
          options={OPTIONS}
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          fullWidth
        />
      </div>

      {/* Contenido */}
      {tab === 'gastos' ? (
        <ListaGastosProgramados />
      ) : (
        <ListaTransferenciasProgramadas />
      )}
    </div>
  );
}
