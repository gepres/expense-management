/**
 * Layout principal de la aplicación
 */

import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import toast from 'react-hot-toast';
import { Wallet, BarChart3, TrendingDown, Target, Upload, Bot, Sun, Moon, LogOut, Settings, MoreHorizontal, Home, Users, Bell, AlertCircle, ShoppingBag, BanknoteArrowDown, CreditCard, Repeat, LineChart, type LucideIcon } from 'lucide-react';
import MobileMenu from './MobileMenu';
import ProBadge from '../common/ProBadge';
import BudgetMonitor from '../common/BudgetMonitor';
import NotificationsPanel from '../compartidos/NotificationsPanel';
import NotificacionesSistemaPanel from '../compartidos/NotificacionesSistemaPanel';
import { useSharedExpenses } from '@context/SharedExpensesContext';
import { useNotificaciones } from '@hooks/useNotificaciones';
import { usePageTracking } from '@hooks/usePageTracking';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useSharedExpenses();
  const { noLeidasCount: sistemaNoLeidas } = useNotificaciones();
  usePageTracking(); // navegación (page-views + sesión) — Fase 2 diagnóstico
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sistemaPanelOpen, setSistemaPanelOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      // Al cerrar sesión vuelve a la landing pública (HomeGate con
      // `usuario=null` + ruta `/` → <LandingPage/>), no al /login.
      navigate('/');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  // Nav primario (siempre visible en desktop)
  const desktopLinks = [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/cuentas', label: 'Cuentas', icon: CreditCard },
    { to: '/gastos', label: 'Gastos', icon: TrendingDown },
    { to: '/presupuestos', label: 'Presupuestos', icon: Target },
    { to: '/asistente', label: 'Asistente IA', icon: Bot },
  ];

  // Nav secundario (en dropdown "Más" del desktop)
  const desktopMoreLinks: {
    to: string;
    label: string;
    icon: LucideIcon;
    badge?: string;
  }[] = [
    { to: '/metricas', label: 'Métricas', icon: LineChart, badge: 'PRO' },
    { to: '/programados', label: 'Programados', icon: Repeat },
    { to: '/compras', label: 'Compras', icon: ShoppingBag },
    { to: '/compartidos', label: 'Compartidos', icon: Users },
    { to: '/importar', label: 'Importar', icon: Upload },
  ];

  const mobileLinks = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/gastos', label: 'Gastos', icon: TrendingDown },
    { to: '/gastos/nuevo', label: 'Nuevo Gasto', icon: BanknoteArrowDown },
    { to: '/asistente', label: 'IA', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <BudgetMonitor />
      {/* Desktop Header */}
      <header className="hidden md:block bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                <span>Gestión de Gastos</span>
              </h1>
            </div>

            {/* Navigation - Desktop */}
            <nav className="flex items-center space-x-1">
              {desktopLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                );
              })}

              {/* Dropdown "Más" para opciones secundarias */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreMenuOpen((v) => !v)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground ${
                    moreMenuOpen ? 'bg-accent' : ''
                  }`}
                  aria-haspopup="true"
                  aria-expanded={moreMenuOpen}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  Más
                </button>

                {moreMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMoreMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-md shadow-lg z-20 py-1">
                      {desktopMoreLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setMoreMenuOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                isActive
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-foreground hover:bg-accent'
                              }`
                            }
                          >
                            <Icon className="h-4 w-4" />
                            {link.label}
                            {link.badge && (
                              <ProBadge size="sm" className="ml-auto" />
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Actions - Desktop */}
            <div className="flex items-center space-x-4">
              {/* Alertas del sistema (programados, FX, etc.) */}
              <button
                onClick={() => setSistemaPanelOpen(true)}
                className="p-2 rounded-md text-foreground hover:bg-accent transition-colors relative"
                title="Alertas del sistema"
              >
                <AlertCircle className="h-5 w-5" />
                {sistemaNoLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {sistemaNoLeidas > 9 ? '9+' : sistemaNoLeidas}
                  </span>
                )}
              </button>

              {/* Notificaciones de gastos compartidos */}
              <button
                onClick={() => setNotificationsOpen(true)}
                className="p-2 rounded-md text-foreground hover:bg-accent transition-colors relative"
                title="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-foreground hover:bg-accent transition-colors"
                title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <div className="relative">
                <button
                  data-testid="user-menu-trigger"
                  onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors"
                >
                  {usuario?.photoURL ? (
                    <img
                      src={usuario.photoURL}
                      alt={usuario.nombre}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                      {usuario?.nombre?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* <span className="text-sm font-medium text-foreground">
                    {usuario?.nombre}
                  </span> */}
                  {(usuario?.role === 'pro' || usuario?.role === 'admin') && (
                    <ProBadge
                      size="sm"
                      showText={false}
                      className="absolute -top-1 -right-1"
                    />
                  )}
                </button>

                {menuUsuarioAbierto && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuUsuarioAbierto(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-20 py-1">
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground">
                          {usuario?.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {usuario?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setMenuUsuarioAbierto(false);
                          navigate('/configuracion');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Configuración
                      </button>
                      <button
                        data-testid="desktop-logout-button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header (Logo Only) */}
      <header className="md:hidden bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-40 px-4 h-14 flex items-center justify-center">
        <h1 className="text-lg font-bold text-primary flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          {(() => {
            const { pathname } = useLocation();
            return <span>{pathname === '/gastos/nuevo' ? 'Nuevo Gasto' : 'Gestión de Gastos'}</span>;
          })()}

        </h1>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-lg border-t border-border z-40 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{link.label}</span>
              </NavLink>
            );
          })}
          
          <button
            data-testid="mobile-menu-trigger"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              mobileMenuOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MoreHorizontal className="h-6 w-6" />
            <span className="text-[10px] font-medium">Más</span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Sheet */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Notifications Panel */}
      <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />

      {/* Alertas del sistema (programados) */}
      <NotificacionesSistemaPanel
        isOpen={sistemaPanelOpen}
        onClose={() => setSistemaPanelOpen(false)}
      />
    </div>
  );
}

