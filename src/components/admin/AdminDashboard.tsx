/**
 * Panel de Administración.
 * Tabs: Solicitudes PRO · Cuentas PRO · Consumo IA.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Shield } from 'lucide-react';
import { SegmentedControl } from '@components/common/SegmentedControl';
import SolicitudesProTab from './SolicitudesProTab';
import CuentasProTab from './CuentasProTab';
import ConsumoIATab from './ConsumoIATab';
import DiagnosticoTab from './DiagnosticoTab';

type Tab = 'solicitudes' | 'cuentas' | 'consumo' | 'diagnostico';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('solicitudes');

  useEffect(() => {
    if (!isAdmin) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-full">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestiona usuarios PRO y monitorea el consumo de IA
          </p>
        </div>
      </div>

      <div className="mb-6">
        <SegmentedControl
          fullWidth
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          options={[
            { value: 'solicitudes', label: 'Solicitudes PRO' },
            { value: 'cuentas', label: 'Cuentas PRO' },
            { value: 'consumo', label: 'Consumo IA' },
            { value: 'diagnostico', label: 'Diagnóstico' },
          ]}
        />
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-5">
        {tab === 'solicitudes' && <SolicitudesProTab />}
        {tab === 'cuentas' && <CuentasProTab />}
        {tab === 'consumo' && <ConsumoIATab />}
        {tab === 'diagnostico' && <DiagnosticoTab />}
      </div>
    </div>
  );
}
