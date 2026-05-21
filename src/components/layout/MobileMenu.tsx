import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import {
  Settings,
  LogOut,
  Upload,
  Moon,
  Sun,
  X,
  User,
  ChevronRight,
  Users,
  Target,
  ShoppingBag,
  CreditCard,
  Repeat,
  LineChart,
} from 'lucide-react';
import ProBadge from '../common/ProBadge';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const { usuario, isPro, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Gesto swipe-down para cerrar (homologado con Modal.tsx)
  const sheetRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    // Cerrar sesión → landing pública (no /login).
    navigate('/');
  };

  // Solo en móvil y si el scroll del sheet está arriba
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.innerWidth > 640) return;
    if (sheetRef.current && sheetRef.current.scrollTop > 0) return;

    setIsDragging(true);
    setDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const offset = currentY - dragStart;

    // Solo permitir deslizar hacia abajo
    if (offset > 0) {
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Si el deslizamiento es mayor a 100px, cerrar
    if (dragOffset > 100) {
      onClose();
    }

    setDragOffset(0);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-fade-in"
        onClick={onClose}
        style={{
          opacity: isDragging ? 1 - dragOffset / 300 : 1,
        }}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="fixed bottom-0 left-0 right-0 bg-card rounded-t-3xl z-50 p-6 shadow-2xl animate-slide-up border-t border-border/50 max-h-[85vh] overflow-y-auto"
        style={{
          transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div
          className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 transition-all duration-200"
          style={{
            width: isDragging ? '20px' : undefined,
            backgroundColor: isDragging ? 'hsl(var(--primary))' : undefined,
          }}
        />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Menú</h2>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="bg-accent/30 rounded-2xl p-4 mb-6 flex items-center gap-4 border border-border/50">
          <div className="relative">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-background shadow-sm">
              {usuario?.photoURL ? (
                <img src={usuario.photoURL} alt={usuario.nombre} className="h-full w-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            {isPro && (
              <ProBadge
                size="sm"
                showText={false}
                className="absolute -top-2 -right-1 border-2 border-background"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{usuario?.nombre}</p>
            <p className="text-sm text-muted-foreground truncate">{usuario?.email}</p>
          </div>
          <button 
            onClick={() => handleNavigation('/configuracion')}
            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <button
            onClick={() => handleNavigation('/metricas')}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <LineChart className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Métricas</span>
              <ProBadge size="sm" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleNavigation('/cuentas')}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                <CreditCard className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Cuentas</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleNavigation('/compras')}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Compras</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>


          <button
            onClick={() => handleNavigation('/compartidos')}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Gastos Compartidos</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleNavigation('/presupuestos')}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Presupuestos</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleNavigation('/programados')}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <Repeat className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Programados</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleNavigation('/importar')}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Importar Datos</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => handleNavigation('/configuracion')}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform">
                <Settings className="h-5 w-5" />
              </div>
              <span className="font-medium text-foreground">Configuración</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
              <span className="font-medium text-foreground">
                {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
              </span>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors">
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6 bg-primary' : 'translate-x-1'}`} />
            </div>
          </button>

          <div className="h-px bg-border my-4" />

          <button
            data-testid="mobile-logout-button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
