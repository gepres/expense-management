/**
 * Configuración Avanzada
 * Opciones avanzadas como autoguardado
 */

import { usePreferences } from '@context/PreferencesContext';
import { Save, Mic, Receipt, Lightbulb } from 'lucide-react';

export default function AvanzadaConfig() {
  const { preferences, updatePreference } = usePreferences();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Configuración Avanzada</h2>
        <p className="text-muted-foreground">
          Personaliza el comportamiento de las funciones avanzadas
        </p>
      </div>

      {/* Autoguardado */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Save className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Autoguardado</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Configura cuándo guardar automáticamente los gastos después del autocompletado
        </p>

        <div className="space-y-4">
          {/* Autoguardado después de entrada de voz */}
          <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Mic className="h-4 w-4 text-primary" />
                <label
                  htmlFor="autoSaveVoice"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Autoguardar después de entrada de voz
                </label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Guarda automáticamente el gasto después de completar los datos por voz.
                Si está desactivado, deberás revisar y guardar manualmente.
              </p>
            </div>
            <div className="ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="autoSaveVoice"
                  checked={preferences.autoSaveAfterVoice}
                  onChange={(e) => updatePreference('autoSaveAfterVoice', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Autoguardado después de escaneo de boleta */}
          <div className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-4 w-4 text-primary" />
                <label
                  htmlFor="autoSaveReceipt"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Autoguardar después de escaneo de boleta
                </label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Guarda automáticamente el gasto después de escanear una boleta o recibo.
                Si está desactivado, podrás revisar y ajustar los datos antes de guardar.
              </p>
            </div>
            <div className="ml-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="autoSaveReceipt"
                  checked={preferences.autoSaveAfterReceipt}
                  onChange={(e) => updatePreference('autoSaveAfterReceipt', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Nota informativa */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <strong> Recomendación:</strong> Mantén el autoguardado desactivado si prefieres revisar
            </div>
            los datos antes de guardar. Actívalo si confías en la precisión del autocompletado y quieres
            ahorrar tiempo.
          </p>
        </div>
      </div>

      {/* Estado actual */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-2">Estado Actual</h4>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Autoguardado por voz:</span>
            <span className={preferences.autoSaveAfterVoice ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
              {preferences.autoSaveAfterVoice ? 'Activado ✓' : 'Desactivado'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Autoguardado por boleta:</span>
            <span className={preferences.autoSaveAfterReceipt ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
              {preferences.autoSaveAfterReceipt ? 'Activado ✓' : 'Desactivado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
