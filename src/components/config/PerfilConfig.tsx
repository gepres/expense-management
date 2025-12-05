import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/firebase';
import { User, Mail, Camera, Save, MessageCircle, CheckCircle, AlertCircle, Trash2, AlertTriangle, Shield, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { ContainerLoadingButton } from '../common/Button';
import ConfirmationModal from '../common/ConfirmationModal';
import ProRequestButton from '../user/ProRequestButton';

export default function PerfilConfig() {
  const { usuario, isAdmin, isPro } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [photoURL, setPhotoURL] = useState(usuario?.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setLoading(true);
    try {
      await authService.actualizarPerfil({
        nombre,
        photoURL: photoURL || undefined
      });
      toast.success('Perfil actualizado correctamente');
      // Recargar la página para actualizar el contexto (o implementar un método de recarga en el contexto)
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await authService.deleteAccount();
      toast.success('Cuenta eliminada correctamente');
      window.location.href = '/login';
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar la cuenta');
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const isWhatsAppLinked = !!usuario?.whatsappPhone;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="relative inline-block">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-xl">
            {photoURL ? (
              <img src={photoURL} alt="Perfil" className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-primary" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors">
            <Camera className="h-4 w-4" />
          </div>
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground flex justify-center">{usuario?.nombre}
         {
          isPro && (
            <div className="ml-2 flex  items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-success text-xs font-medium">
              <Crown className="h-5 w-5 text-amber-500 fill-amber-500" />
              PRO
          </div>
          )
         }
        </h2>
        <p className="text-sm text-muted-foreground">{usuario?.email}</p>

        {/* WhatsApp Status Badge */}
        <div className="mt-3 inline-flex items-center gap-2">
          {isWhatsAppLinked ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
              <CheckCircle className="h-3.5 w-3.5" />
              WhatsApp vinculado
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              WhatsApp no vinculado
            </div>
          )}
          <Link 
            to="/configuracion?tab=whatsapp"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Configurar
          </Link>
        </div>

        {/* Admin Dashboard Link */}
        {isAdmin && (
          <div className="my-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Shield className="w-5 h-5" />
              Panel de Administración
            </Link>
          </div>
        )}

        {/* Pro Request Button */}
        {
          (!isAdmin && !isPro) && (
            <ProRequestButton />
          )
        }
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <User className="h-4 w-4" /> Nombre Completo
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="Tu nombre"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </label>
          <input
            type="email"
            value={usuario?.email || ''}
            disabled
            className="w-full px-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Camera className="h-4 w-4" /> URL de Foto (Opcional)
          </label>
          <input
            type="url"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholder="https://ejemplo.com/foto.jpg"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
               <ContainerLoadingButton isLoading={loading} loadingText="Guardando..." text=""/>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </> 
            )}
          </button>
        </div>
      </form>

      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-lg font-bold text-destructive mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Zona de Peligro
        </h3>
        
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h4 className="font-medium text-destructive mb-2">Eliminar Cuenta</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="¿Estás seguro?"
        description="Esta acción eliminará permanentemente tu cuenta y todos tus datos asociados. No se puede deshacer."
        confirmText="Sí, eliminar cuenta"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={deleteLoading}
        autoClose={false}
      />
    </div>
  );
}
