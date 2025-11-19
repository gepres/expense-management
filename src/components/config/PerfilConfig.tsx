import { useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/firebase';
import { User, Mail, Camera, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PerfilConfig() {
  const { usuario } = useAuth();
  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [photoURL, setPhotoURL] = useState(usuario?.photoURL || '');
  const [loading, setLoading] = useState(false);

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
        <h2 className="mt-4 text-xl font-bold text-foreground">{usuario?.nombre}</h2>
        <p className="text-sm text-muted-foreground">{usuario?.email}</p>
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
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
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
    </div>
  );
}
