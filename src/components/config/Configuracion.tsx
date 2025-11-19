import { useState } from 'react';
import CategoriasConfig from './CategoriasConfig';
import MetodosPagoConfig from './MetodosPagoConfig';
import MonedasConfig from './MonedasConfig';
import { Layers, CreditCard, Coins } from 'lucide-react';

type Tab = 'categorias' | 'metodos' | 'monedas';

export default function Configuracion() {
  const [activeTab, setActiveTab] = useState<Tab>('categorias');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Administra las opciones generales de la aplicación</p>
      </div>

      <div className="flex space-x-1 rounded-xl bg-muted p-1">
        <button
          onClick={() => setActiveTab('categorias')}
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 transition-all ${
            activeTab === 'categorias'
              ? 'bg-background text-foreground shadow'
              : 'text-muted-foreground hover:bg-background/[0.12] hover:text-foreground'
          }`}
        >
          <Layers className="h-4 w-4" />
          Categorías
        </button>
        <button
          onClick={() => setActiveTab('metodos')}
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 transition-all ${
            activeTab === 'metodos'
              ? 'bg-background text-foreground shadow'
              : 'text-muted-foreground hover:bg-background/[0.12] hover:text-foreground'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Métodos de Pago
        </button>
        <button
          onClick={() => setActiveTab('monedas')}
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 transition-all ${
            activeTab === 'monedas'
              ? 'bg-background text-foreground shadow'
              : 'text-muted-foreground hover:bg-background/[0.12] hover:text-foreground'
          }`}
        >
          <Coins className="h-4 w-4" />
          Monedas
        </button>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        {activeTab === 'categorias' && <CategoriasConfig />}
        {activeTab === 'metodos' && <MetodosPagoConfig />}
        {activeTab === 'monedas' && <MonedasConfig />}
      </div>
    </div>
  );
}
