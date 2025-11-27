import { AlertTriangle } from 'lucide-react';
import Modal, { ModalButton } from './Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  autoClose?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = false,
  isLoading = false,
  autoClose = true,
}: Props) {
  const handleConfirm = () => {
    onConfirm();
    if (autoClose) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
      footer={
        <div className="flex gap-3">
          <ModalButton
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </ModalButton>
          <ModalButton
            variant={isDestructive ? 'destructive' : 'primary'}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              confirmText
            )}
          </ModalButton>
        </div>
      }
    >
      <div className="text-center">
        <div
          className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            isDestructive
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30'
              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
          }`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>

        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Modal>
  );
}
