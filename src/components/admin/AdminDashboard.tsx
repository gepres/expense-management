import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/firebase';
import type { Usuario } from '@app-types';
import { Check, X, Loader2, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadRequests();
  }, [isAdmin, navigate]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const pendingRequests = await authService.getPendingProRequests();
      setRequests(pendingRequests);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      setProcessingId(userId);
      await authService.approveProRequest(userId);
      toast.success('Solicitud aprobada');
      setRequests(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error(error);
      toast.error('Error al aprobar solicitud');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setProcessingId(userId);
      await authService.rejectProRequest(userId);
      toast.success('Solicitud rechazada');
      setRequests(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error(error);
      toast.error('Error al rechazar solicitud');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-primary/10 rounded-full">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona usuarios y permisos</p>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Solicitudes de Rol PRO
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              {requests.length}
            </span>
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No hay solicitudes pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.nombre}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.nombre}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registrado: {user.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      iconOnly
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50 rounded-full"
                      onClick={() => handleReject(user.id)}
                      loading={processingId === user.id}
                      disabled={processingId !== null && processingId !== user.id}
                      icon={X}
                      title="Rechazar"
                    />
                    <Button
                      iconOnly
                      variant="ghost"
                      className="text-green-600 hover:bg-green-50 rounded-full"
                      onClick={() => handleApprove(user.id)}
                      loading={processingId === user.id}
                      disabled={processingId !== null && processingId !== user.id}
                      icon={Check}
                      title="Aprobar"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
