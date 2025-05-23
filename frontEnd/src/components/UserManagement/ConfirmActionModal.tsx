import React from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';

interface ConfirmActionModalProps {
  show: boolean;
  username: string;
  isActive: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  show,
  username,
  isActive,
  onConfirm,
  onCancel,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark shadow-xl">
        <div className="flex items-center mb-4">
          {isActive ? (
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
          ) : (
            <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
          )}
          <h3 className="text-xl font-semibold text-black dark:text-white">Confirmar acción</h3>
        </div>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          ¿Estás seguro que deseas {isActive ? "desactivar" : "activar"} al usuario{" "}
          <span className="font-semibold text-black dark:text-white">{username}</span>?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="rounded-md bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md py-2 px-4 text-sm font-medium text-white transition-all ${
              isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;
