import { useState } from 'react';
import CategoriasConfig from './CategoriasConfig';
import MetodosPagoConfig from './MetodosPagoConfig';
import MonedasConfig from './MonedasConfig';
import PerfilConfig from './PerfilConfig';
import AparienciaConfig from './AparienciaConfig';
import { Layers, CreditCard, Coins, User, Palette } from 'lucide-react';

type Tab = 'perfil' | 'apariencia' | 'categorias' | 'metodos' | 'monedas';

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState<Tab>('perfil');

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'apariencia', label: 'Apariencia', icon: Palette },
    { id: 'categorias', label: 'Categorías', icon: Layers },
    { id: 'metodos', label: 'Métodos de Pago', icon: CreditCard },
    { id: 'monedas', label: 'Monedas', icon: Coins },
  ] as const;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra tu perfil y las opciones de la aplicación</p>
      </div>

      {/* Tabs Navigation */}
      <div className="overflow-x-auto pb-2 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex space-x-1 rounded-xl bg-muted p-1 min-w-full md:min-w-0 w-max md:w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-1 min-w-fit md:min-w-[100px] rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 transition-all whitespace-nowrap px-4 ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow'
                    : 'text-muted-foreground hover:bg-background/[0.12] hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        {activeTab === 'perfil' && <PerfilConfig />}
        {activeTab === 'apariencia' && <AparienciaConfig />}
        {activeTab === 'categorias' && <CategoriasConfig />}
        {activeTab === 'metodos' && <MetodosPagoConfig />}
        {activeTab === 'monedas' && <MonedasConfig />}
      </div>
    </div>
  );
}
