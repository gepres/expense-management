import { useTheme } from '@context/ThemeContext';
import { Moon, Sun, Monitor, Check, Sunset, Palette } from 'lucide-react';

export default function AparienciaConfig() {
  const { tema, setTema, palette, setPalette, toastInvertido, setToastInvertido } = useTheme();

  const themes = [
    {
      id: 'light',
      name: 'Claro',
      icon: Sun,
      description: 'Ideal para ambientes iluminados'
    },
    {
      id: 'medium',
      name: 'Medio',
      icon: Sunset,
      description: 'Un tono gris suave, ni muy claro ni muy oscuro'
    },
    {
      id: 'dark',
      name: 'Oscuro',
      icon: Moon,
      description: 'Menos fatiga visual en la noche'
    },
    {
      id: 'system',
      name: 'Sistema',
      icon: Monitor,
      description: 'Se adapta a tu dispositivo'
    }
  ] as const;

  const palettes = [
    {
      id: 'default',
      name: 'Estándar',
      description: 'Tonos fríos y neutros (Azul/Gris)',
      color: '#64748b' // Slate-500
    },
    {
      id: 'beige',
      name: 'Cálido / Beige',
      description: 'Tonos cálidos y papel (Sepia/Crema)',
      color: '#d6cbb2' // Warm beige
    }
  ] as const;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">Apariencia</h2>
        <p className="text-muted-foreground">
          Personaliza cómo se ve la aplicación en tu dispositivo.
        </p>
      </div>

      {/* Modo (Tema) */}
      <h3 className="text-sm font-semibold text-foreground mb-4">Modo</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = tema === themeOption.id;

          return (
            <button
              key={themeOption.id}
              onClick={() => setTema(themeOption.id as any)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all hover:bg-accent ${
                isSelected
                  ? 'border-primary bg-accent/50'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-primary">
                  <Check className="h-4 w-4" />
                </div>
              )}
              
              <div className={`p-3 rounded-full w-fit mb-3 ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="h-6 w-6" />
              </div>
              
              <h3 className="font-semibold text-foreground mb-1">{themeOption.name}</h3>
              <p className="text-xs text-muted-foreground">{themeOption.description}</p>
            </button>
          );
        })}
      </div>

      {/* Paleta de Colores */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4" /> Paleta de Colores
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {palettes.map((paletteOption) => {
            const isSelected = palette === paletteOption.id;

            return (
              <button
                key={paletteOption.id}
                onClick={() => setPalette(paletteOption.id as any)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all hover:bg-accent ${
                  isSelected
                    ? 'border-primary bg-accent/50'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-primary">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                
                <div 
                  className="w-full h-16 rounded-lg mb-3 border border-border shadow-sm"
                  style={{ backgroundColor: paletteOption.color }}
                />
                
                <h3 className="font-semibold text-foreground mb-1">{paletteOption.name}</h3>
                <p className="text-xs text-muted-foreground">{paletteOption.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Theme Toggle */}
      <div className="p-6 rounded-xl bg-muted/50 border border-border mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Notificaciones Invertidas
            </h3>
            <p className="text-xs text-muted-foreground">
              En modo oscuro, las notificaciones serán claras. En modo claro, las notificaciones serán oscuras.
            </p>
          </div>
          <button
            onClick={() => setToastInvertido(!toastInvertido)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              toastInvertido ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                toastInvertido ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="p-6 rounded-xl bg-muted/50 border border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">Vista Previa</h3>
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border max-w-sm mx-auto transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Check className="h-5 w-5" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="h-4 w-24 bg-foreground/10 rounded"></div>
              <div className="h-3 w-16 bg-foreground/10 rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-8 w-full bg-primary/10 rounded"></div>
            <div className="h-8 w-full bg-accent rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
