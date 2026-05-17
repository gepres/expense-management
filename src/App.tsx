/**
 * Componente principal de la aplicación
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { ThemeProvider, useTheme } from '@context/ThemeContext';
import { ConfigProvider } from '@context/ConfigContext';
import { PreferencesProvider } from '@context/PreferencesContext';
import { SharedExpensesProvider } from '@context/SharedExpensesContext';
import { AccountsProvider } from '@context/AccountsContext';
import ErrorAlert from '@components/common/ErrorAlert';
import CustomLoader from '@components/common/CustomLoader';

// Componentes que se cargarán de forma lazy
const Login = lazy(() => import('@components/auth/Login'));
const Registro = lazy(() => import('@components/auth/Registro'));
const Dashboard = lazy(() => import('@components/dashboard/Dashboard'));
const Gastos = lazy(() => import('@components/gastos/ListaGastos'));
const NuevoGasto = lazy(() => import('@components/gastos/FormularioGasto'));
const Importar = lazy(() => import('@components/importar/ImportarExcel'));
const AsistenteIA = lazy(() => import('@components/asistente/AsistenteIA'));
const Presupuestos = lazy(() => import('@components/presupuestos/ListaPresupuestos'));
const Configuracion = lazy(() => import('@components/config/Configuracion'));
const Layout = lazy(() => import('@components/layout/Layout'));
const AdminDashboard = lazy(() => import('@components/admin/AdminDashboard'));

// Gastos Compartidos
const SharedGroupsList = lazy(() => import('@components/compartidos/SharedGroupsList'));
const SharedGroupDetail = lazy(() => import('@components/compartidos/SharedGroupDetail'));
const JoinGroupPage = lazy(() => import('@components/compartidos/JoinGroupPage'));

// Shopping List
const ShoppingListView = lazy(() => import('@/modules/shopping-list/ShoppingListView'));
const ShoppingListDetail = lazy(() => import('@/modules/shopping-list/ShoppingListDetail'));

// Cuentas (multi-cuenta)
const ListaCuentas = lazy(() => import('@components/cuentas/ListaCuentas'));
const FormularioCuenta = lazy(() => import('@components/cuentas/FormularioCuenta'));
const DetalleCuenta = lazy(() => import('@components/cuentas/DetalleCuenta'));

// Programados (gastos + transferencias recurrentes)
const Programados = lazy(() => import('@components/programados/Programados'));

// Métricas (módulo PRO de gráficos/analytics con IA)
const Metricas = lazy(() => import('@components/graficos/MetricasPage'));

// Documentación
const Documentacion = lazy(() => import('@/pages/Documentacion'));

// ============================================================================
// Componente de carga
// ============================================================================

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <CustomLoader />
        <p className="text-muted-foreground mt-4">Cargando...</p>
      </div>
    </div>
  );
}

// ============================================================================
// Ruta protegida
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <LoadingScreen />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ============================================================================
// Ruta pública (redirige si está autenticado)
// ============================================================================

interface PublicRouteProps {
  children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <LoadingScreen />;
  }

  if (usuario) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// ============================================================================
// Rutas de la aplicación
// ============================================================================

function AppRoutes() {
  const { error } = useAuth();

  return (
    <>
      {error && <ErrorAlert error={error} />}
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/registro"
          element={
            <PublicRoute>
              <Registro />
            </PublicRoute>
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="gastos" element={<Gastos />} />
          <Route path="gastos/nuevo" element={<NuevoGasto />} />
          <Route path="gastos/editar/:id" element={<NuevoGasto />} />
          <Route path="importar" element={<Importar />} />
          <Route path="presupuestos" element={<Presupuestos />} />
          <Route path="asistente" element={<AsistenteIA />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="admin" element={<AdminDashboard />} />

          {/* Gastos Compartidos */}
          <Route path="compartidos" element={<SharedGroupsList />} />
          <Route path="compartidos/:id" element={<SharedGroupDetail />} />

          {/* Cuentas (multi-cuenta) */}
          <Route path="cuentas" element={<ListaCuentas />} />
          <Route path="cuentas/nueva" element={<FormularioCuenta />} />
          <Route path="cuentas/editar/:id" element={<FormularioCuenta />} />
          <Route path="cuentas/:id" element={<DetalleCuenta />} />

          {/* Programados (gastos + transferencias recurrentes) */}
          <Route path="programados" element={<Programados />} />

          {/* Métricas (módulo PRO) */}
          <Route path="metricas" element={<Metricas />} />

          {/* Shopping List */}
          <Route path="compras" element={<ShoppingListView />} />

          {/* Documentación */}
          <Route path="documentacion" element={<Documentacion />} />
          <Route path="compras/:id" element={<ShoppingListDetail />} />
        </Route>

        {/* Ruta para unirse a grupo (semi-pública) */}
        <Route path="/compartidos/unirse/:token" element={<JoinGroupPage />} />

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </>
  );
}
// ============================================================================
// Componente principal
// ============================================================================

function ToasterWithTheme() {
  const { toastInvertido, temaEfectivo } = useTheme();
  
  // Determine toast colors based on inversion setting
  const getToastColors = () => {
    if (toastInvertido) {
      // Inverted: light toasts in dark mode, dark toasts in light mode
      // We use muted colors for the inverted effect while respecting the theme palette
      return temaEfectivo === 'dark' ? {
        background: 'hsl(var(--muted))',
        color: 'hsl(var(--muted-foreground))',
        border: '1px solid hsl(var(--border))',
      } : {
        background: 'hsl(var(--accent))',
        color: 'hsl(var(--accent-foreground))',
        border: '1px solid hsl(var(--border))',
      };
    } else {
      // Normal: follow theme
      return {
        background: 'hsl(var(--card))',
        color: 'hsl(var(--card-foreground))',
        border: '1px solid hsl(var(--border))',
      };
    }
  };

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: getToastColors(),
        success: {
          iconTheme: {
            primary: 'hsl(var(--primary))',
            secondary: 'hsl(var(--primary-foreground))',
          },
        },
        error: {
          iconTheme: {
            primary: 'hsl(var(--destructive))',
            secondary: 'hsl(var(--destructive-foreground))',
          },
        },
      }}
    />
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AccountsProvider>
            <ConfigProvider>
              <PreferencesProvider>
                <SharedExpensesProvider>
                  <AppRoutes />
                  <ToasterWithTheme />
                </SharedExpensesProvider>
              </PreferencesProvider>
            </ConfigProvider>
          </AccountsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
