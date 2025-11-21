/**
 * Página para unirse a un grupo mediante invitación
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SharedService } from '@services/shared';
import { useAuth } from '@context/AuthContext';
import type { InvitePreview } from '@types/shared';
import { Users, Calendar, UserPlus, AlertCircle } from 'lucide-react';
import CustomLoader from '@components/common/CustomLoader';
import toast from 'react-hot-toast';

export default function JoinGroupPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      verifyInvitation();
    }
  }, [token]);

  const verifyInvitation = async () => {
    try {
      setLoading(true);
      const data = await SharedService.verifyInvitation(token!);
      setPreview(data);
    } catch (err: any) {
      setError(err.message || 'Invitación no válida');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!usuario) {
      // Save token and redirect to login
      sessionStorage.setItem('pendingGroupInvite', token!);
      navigate(`/auth/login?redirect=/compartidos/unirse/${token}`);
      return;
    }

    setJoining(true);
    try {
      const result = await SharedService.acceptInvitation(token!);
      toast.success(result.message);
      navigate(`/compartidos/${result.groupId}`);
    } catch (err: any) {
      toast.error(err.message || 'Error al unirse al grupo');
    } finally {
      setJoining(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <CustomLoader />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
        <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm w-full shadow-xl">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Invitación no válida</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium w-full transition-all active:scale-[0.98]"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  // Success state - show preview
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm w-full shadow-xl">
        {/* Group Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-4xl"
          style={{
            backgroundColor: (preview?.groupColor || '#6366f1') + '20',
          }}
        >
          {preview?.groupIcon || '👥'}
        </div>

        {/* Group Info */}
        <h2 className="text-2xl font-bold mb-1">{preview?.groupName}</h2>
        <p className="text-muted-foreground mb-6">
          <span className="font-medium">{preview?.creatorName}</span> te invitó a unirte
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{preview?.membersCount} miembros</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Expira{' '}
              {preview?.expiresAt
                ? new Date(preview.expiresAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })
                : ''}
            </span>
          </div>
        </div>

        {/* Join Button */}
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          {joining ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
              <span>Uniéndose...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              <span>{usuario ? 'Unirse al grupo' : 'Iniciar sesión y unirse'}</span>
            </>
          )}
        </button>

        {!usuario && (
          <p className="text-xs text-muted-foreground mt-3">
            Necesitas una cuenta para unirte
          </p>
        )}

        {/* Cancel */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
