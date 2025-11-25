/**
 * Ejemplos de uso del componente Modal
 * Este archivo muestra diferentes casos de uso del Modal
 */

import { useState } from 'react';
import Modal, { ModalButton, ModalFooterActions } from './Modal';
import { AlertTriangle, Info, CheckCircle, Calendar, AlignLeft } from 'lucide-react';

export default function ModalExample() {
  const [simpleModal, setSimpleModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  // Ejemplo de formulario
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleFormSubmit = () => {
    console.log('Form submitted:', formData);
    setFormModal(false);
    setSuccessModal(true);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Ejemplos de Modal</h1>

      {/* Botones para abrir modales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setSimpleModal(true)}
          className="p-4 bg-primary text-primary-foreground rounded-xl font-medium"
        >
          Modal Simple
        </button>

        <button
          onClick={() => setConfirmModal(true)}
          className="p-4 bg-destructive text-destructive-foreground rounded-xl font-medium"
        >
          Modal de Confirmación
        </button>

        <button
          onClick={() => setFormModal(true)}
          className="p-4 bg-indigo-500 text-white rounded-xl font-medium"
        >
          Modal con Formulario
        </button>

        <button
          onClick={() => setSuccessModal(true)}
          className="p-4 bg-success text-white rounded-xl font-medium"
        >
          Modal de Éxito
        </button>
      </div>

      {/* 1. Modal Simple - Solo información */}
      <Modal
        isOpen={simpleModal}
        onClose={() => setSimpleModal(false)}
        title="Información"
        subtitle="Este es un modal simple con información"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-xl">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                ¿Qué es un modal?
              </h3>
              <p className="text-sm text-muted-foreground">
                Un modal es una ventana emergente que aparece sobre el contenido principal.
                Se usa para mostrar información importante o solicitar una acción del usuario.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Características:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Diseño iOS moderno</li>
              <li>• Responsive (móvil y desktop)</li>
              <li>• Cierra con ESC o backdrop</li>
              <li>• Animaciones suaves</li>
              <li>• Totalmente personalizable</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* 2. Modal de Confirmación - Acción destructiva */}
      <Modal
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        title="Eliminar elemento"
        size="sm"
        footer={
          <ModalFooterActions
            onCancel={() => setConfirmModal(false)}
            onConfirm={() => {
              console.log('Elemento eliminado');
              setConfirmModal(false);
            }}
            cancelText="Cancelar"
            confirmText="Eliminar"
            confirmVariant="destructive"
          />
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">
              ¿Estás seguro?
            </h3>
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. El elemento será eliminado permanentemente.
            </p>
          </div>
        </div>
      </Modal>

      {/* 3. Modal con Formulario - iOS Style */}
      <Modal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title="Nuevo Registro"
        subtitle="Completa los campos requeridos"
        size="md"
        footer={
          <ModalFooterActions
            onCancel={() => setFormModal(false)}
            onConfirm={handleFormSubmit}
            cancelText="Cancelar"
            confirmText="Guardar"
          />
        }
      >
        <form className="space-y-3">
          {/* Título */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                <AlignLeft className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">
                  Título <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ingresa un título"
                  className="bg-transparent text-sm w-full focus:outline-none font-medium"
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3 flex items-center gap-3">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-0.5">
                  Fecha <span className="text-destructive">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-transparent text-sm w-full focus:outline-none font-medium"
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-3 flex items-start gap-3">
              <div className="p-1.5 bg-gray-500/10 rounded-lg text-gray-600 dark:text-gray-400 mt-1">
                <AlignLeft className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground block mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Agrega detalles adicionales (opcional)"
                  rows={3}
                  maxLength={500}
                  className="bg-transparent text-sm w-full focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. Modal de Éxito */}
      <Modal
        isOpen={successModal}
        onClose={() => setSuccessModal(false)}
        size="sm"
        showCloseButton={false}
      >
        <div className="space-y-6 text-center py-4">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-success/10 rounded-full">
              <CheckCircle className="h-16 w-16 text-success" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              ¡Éxito!
            </h3>
            <p className="text-sm text-muted-foreground">
              La operación se completó exitosamente.
            </p>
          </div>

          <ModalButton
            variant="primary"
            onClick={() => setSuccessModal(false)}
          >
            Aceptar
          </ModalButton>
        </div>
      </Modal>
    </div>
  );
}
