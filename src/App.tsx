/**
 * Componente principal de la aplicación
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@context/AuthContext';
import { ThemeProvider } from '@context/ThemeContext';
import ErrorAlert from '@components/common/ErrorAlert';

// Componentes que se cargarán de forma lazy
const Login = lazy(() => import('@components/auth/Login'));
const Registro = lazy(() => import('@components/auth/Registro'));
const Dashboard = lazy(() => import('@components/dashboard/Dashboard'));
const Gastos = lazy(() => import('@components/gastos/ListaGastos'));
const NuevoGasto = lazy(() => import('@components/gastos/FormularioGasto'));
const Importar = lazy(() => import('@components/importar/ImportarExcel'));
const AsistenteIA = lazy(() => import('@components/asistente/AsistenteIA'));
const Presupuestos = lazy(() => import('@components/presupuestos/ListaPresupuestos'));
const Layout = lazy(() => import('@components/layout/Layout'));

// ============================================================================
// Componente de carga
// ============================================================================

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Cargando...</p>
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
        </Route>

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

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
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
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
