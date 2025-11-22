import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

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
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card w-full max-w-sm rounded-2xl shadow-xl border border-border relative z-10 overflow-hidden"
          >
            <div className="p-6 text-center">
              <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                isDestructive ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
              }`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {description}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl font-medium border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    if (autoClose) onClose();
                  }}
                  disabled={isLoading}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-colors flex items-center justify-center gap-2 ${
                    isDestructive 
                      ? 'bg-destructive hover:bg-destructive/90' 
                      : 'bg-primary hover:bg-primary/90'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
