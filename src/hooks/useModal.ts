/**
 * Hook personalizado para manejar el estado de modales
 * Simplifica el uso de modales con gestión de estado incluida
 */

import { useState, useCallback } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

/**
 * Hook para manejar el estado de un modal
 *
 * @param initialState - Estado inicial del modal (por defecto: false)
 * @returns Objeto con el estado y funciones para controlar el modal
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const modal = useModal();
 *
 *   return (
 *     <>
 *       <button onClick={modal.open}>Abrir Modal</button>
 *       <Modal isOpen={modal.isOpen} onClose={modal.close}>
 *         Contenido del modal
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 */
export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Hook para manejar múltiples modales con datos asociados
 * Útil cuando necesitas pasar datos al abrir el modal
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const deleteModal = useModalWithData<{ id: string; name: string }>();
 *
 *   const handleDelete = (item: Item) => {
 *     deleteModal.open({ id: item.id, name: item.name });
 *   };
 *
 *   const confirmDelete = () => {
 *     if (deleteModal.data) {
 *       deleteItem(deleteModal.data.id);
 *       deleteModal.close();
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={() => handleDelete(item)}>Eliminar</button>
 *       <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close}>
 *         ¿Eliminar {deleteModal.data?.name}?
 *       </Modal>
 *     </>
 *   );
 * }
 * ```
 */
export function useModalWithData<T = any>() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((modalData: T) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Limpiar datos después de cerrar (con pequeño delay para animación)
    setTimeout(() => setData(null), 300);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
  };
}
