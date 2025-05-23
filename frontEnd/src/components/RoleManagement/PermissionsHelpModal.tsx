import React from 'react';
import { X, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { ActionType, actionIcons } from '../../types/roleManagement';

interface PermissionsHelpModalProps {
  show: boolean;
  onClose: () => void;
  availableActions: ActionType[]; // Para iterar y mostrar la leyenda
}

const PermissionsHelpModal: React.FC<PermissionsHelpModalProps> = ({ show, onClose, availableActions }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg dark:bg-boxdark sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-black dark:text-white">
            Ayuda: Gestión de Permisos
          </h4>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-meta-4">
            <h5 className="mb-2 font-medium text-black dark:text-white">
              ¿Cómo funciona la matriz de permisos?
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              La matriz de permisos te permite asignar diferentes acciones a cada rol para cada página
              del sistema. Cada celda representa la intersección entre un rol y una página, donde puedes
              activar o desactivar permisos específicos.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-meta-4">
            <h5 className="mb-2 font-medium text-black dark:text-white">Tipos de acciones</h5>
            <ul className="ml-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {availableActions.map((action) => (
                <li key={action} className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success bg-opacity-10 text-success">
                    {actionIcons[action]}
                  </span>
                  <span className="font-medium text-black dark:text-white">
                    {action.charAt(0).toUpperCase() + action.slice(1)}:
                  </span>{" "}
                  {action === ActionType.VIEW && "Permite ver la página y su contenido"}
                  {action === ActionType.MODIFY && "Permite modificar datos en la página"}
                  {action === ActionType.DELETE && "Permite eliminar elementos en la página"}
                  {action === ActionType.ACCOUNT && "Permite contabilizar operaciones"}
                  {action === ActionType.CANCEL && "Permite anular operaciones"}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-meta-4">
            <h5 className="mb-2 font-medium text-black dark:text-white">Consejos</h5>
            <ul className="ml-4 list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>
                Usa el botón "Marcar Todo" para activar o desactivar todas las acciones de una página
                para un rol específico.
              </li>
              <li>Puedes cambiar entre la vista de matriz y lista según tus preferencias.</li>
              <li>Los permisos se aplican inmediatamente al hacer clic en los botones de acción.</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsHelpModal;
