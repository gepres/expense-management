import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { Crown, Loader2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button';

export default function ProRequestButton() {
  const { usuario, requestProRole, isPro } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!usuario) return null;

  if (isPro) {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
        <Crown className="w-5 h-5" />
        <span className="font-medium">Eres usuario PRO</span>
      </div>
    );
  }

  const handleRequest = async () => {
    try {
      setLoading(true);
      await requestProRole();
      toast.success('Solicitud enviada correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const renderStatus = () => {
    switch (usuario.proRequestStatus) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-medium">Solicitud pendiente de aprobación</span>
          </div>
        );
      case 'approved':
        // Should be handled by isPro check above, but as fallback
        return (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Solicitud aprobada</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Solicitud rechazada</span>
            </div>
            <button
              onClick={handleRequest}
              disabled={loading}
              className="text-sm text-primary hover:underline self-start"
            >
              Intentar nuevamente
            </button>
          </div>
        );
      default:
        return (
          <Button
            onClick={handleRequest}
            loading={loading}
            variant="pro"
            className="m-auto"
            icon={Crown}
          >
            Solicitar cuenta PRO
          </Button>
        );
    }
  };

  return (
    <div className="mt-4">
      {renderStatus()}
      {usuario.proRequestStatus === 'none' && (
        <p className="text-xs text-muted-foreground mt-2">
          Accede a funciones avanzadas solicitando tu cuenta PRO.
        </p>
      )}
    </div>
  );
}
