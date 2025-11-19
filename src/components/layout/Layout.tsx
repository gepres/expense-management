/**
 * Layout principal de la aplicación
 */

import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useTheme } from '@context/ThemeContext';
import toast from 'react-hot-toast';
import { Wallet, BarChart3, TrendingDown, Target, Upload, Bot, Sun, Moon, LogOut, Settings } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      toast.success('Sesión cerrada exitosamente');
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: BarChart3 },
    { to: '/gastos', label: 'Gastos', icon: TrendingDown },
    { to: '/presupuestos', label: 'Presupuestos', icon: Target },
    { to: '/importar', label: 'Importar', icon: Upload },
    { to: '/asistente', label: 'Asistente IA', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header / Navigation */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                <span className="hidden sm:inline">Gestión de Gastos</span>
                <span className="sm:hidden">Gastos</span>
              </h1>
            </div>

            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
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
            </nav>

            {/* Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-foreground hover:bg-accent transition-colors"
                title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
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
                  <span className="text-sm font-medium text-foreground hidden lg:block">
                    {usuario?.nombre}
                  </span>
                  <svg
                    className={`h-4 w-4 text-foreground transition-transform ${
                      menuUsuarioAbierto ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
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

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Theme Toggle Mobile */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-foreground hover:bg-accent transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Hamburger Menu */}
              <button
                onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                className="p-2 rounded-md text-foreground hover:bg-accent transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {menuMovilAbierto ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {menuMovilAbierto && (
            <div className="md:hidden border-t border-border py-2 animate-slide-in">
              <nav className="flex flex-col space-y-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      onClick={() => setMenuMovilAbierto(false)}
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </NavLink>
                  );
                })}
              </nav>

              {/* User Info Mobile */}
              <div className="border-t border-border mt-2 pt-2 px-3">
                <div className="flex items-center space-x-2 py-2">
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
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {usuario?.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {usuario?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Gestión de Gastos. Todos los derechos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
