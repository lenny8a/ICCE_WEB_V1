import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  show: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  show,
  itemName,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <div className="mb-2 text-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-danger" />
          <h4 className="text-xl font-semibold text-black dark:text-white">¿Confirmar eliminación?</h4>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar {itemName}?
          </p>
        </div>
        <div className="mt-6 flex justify-center space-x-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90"
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
