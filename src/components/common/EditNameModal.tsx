import { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import Modal, { ModalButton } from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newName: string) => void;
  initialName: string;
  title?: string;
}

export default function EditNameModal({
  isOpen,
  onClose,
  onSave,
  initialName,
  title = 'Editar Nombre',
}: Props) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={true}
      footer={
        <div className="flex gap-3">
          <ModalButton variant="secondary" onClick={onClose}>
            Cancelar
          </ModalButton>
          <ModalButton
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={!name.trim()}
          >
            Guardar
          </ModalButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Edit2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">
              Ingresa un nuevo nombre para identificar mejor este elemento
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Nombre de la lista"
            autoFocus
          />
        </div>
      </form>
    </Modal>
  );
}
