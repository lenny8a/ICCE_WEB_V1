import React from 'react';
import { UserInterface, PasswordFormData } from '../../pages/Authentication/UserManagement'; // Ajusta la ruta si mueves las interfaces
import { X, Save, Lock, Key } from 'lucide-react';

interface ChangePasswordModalProps {
  show: boolean;
  onClose: () => void;
  selectedUser: UserInterface | null;
  passwordFormData: PasswordFormData;
  handlePasswordFormChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordFormSubmit: (e: React.FormEvent) => void;
  formErrors: Record<string, string>;
  loading: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  show,
  onClose,
  selectedUser,
  passwordFormData,
  handlePasswordFormChange,
  handlePasswordFormSubmit,
  formErrors,
  loading,
}) => {
  if (!show || !selectedUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-boxdark shadow-2xl">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-t-xl p-6 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-black dark:text-white flex items-center">
              <Lock className="h-5 w-5 mr-2 text-amber-500" />
              Cambiar Contraseña
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Usuario: <span className="font-medium text-primary">{selectedUser.username}</span>
          </p>
        </div>

        <form onSubmit={handlePasswordFormSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Key className="h-4 w-4 inline mr-1" /> Contraseña Actual
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordFormData.currentPassword}
              onChange={handlePasswordFormChange}
              placeholder="Ingresa la contraseña actual"
              className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {formErrors.currentPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <X className="h-4 w-4 mr-1" /> {formErrors.currentPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Key className="h-4 w-4 inline mr-1" /> Nueva Contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordFormData.newPassword}
              onChange={handlePasswordFormChange}
              placeholder="Ingresa la nueva contraseña"
              className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {formErrors.newPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <X className="h-4 w-4 mr-1" /> {formErrors.newPassword}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Key className="h-4 w-4 inline mr-1" /> Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordFormData.confirmPassword}
              onChange={handlePasswordFormChange}
              placeholder="Confirma la nueva contraseña"
              className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <X className="h-4 w-4 mr-1" /> {formErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-stroke dark:border-strokedark">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70 transition-all flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
