import { useTheme } from '@context/ThemeContext';
import { Moon, Sun, Monitor, Check } from 'lucide-react';

export default function AparienciaConfig() {
  const { tema, setTema } = useTheme();

  const themes = [
    {
      id: 'light',
      name: 'Claro',
      icon: Sun,
      description: 'Ideal para ambientes iluminados'
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground mb-2">Apariencia</h2>
        <p className="text-muted-foreground">
          Personaliza cómo se ve la aplicación en tu dispositivo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = tema === themeOption.id;

          return (
            <button
              key={themeOption.id}
              onClick={() => setTema(themeOption.id)}
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

      <div className="mt-8 p-6 rounded-xl bg-muted/50 border border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">Vista Previa</h3>
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border max-w-sm mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20"></div>
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
