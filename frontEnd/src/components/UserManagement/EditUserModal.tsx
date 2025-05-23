import React from 'react';
import { UserInterface, Role, UserFormData } from '../../pages/Authentication/UserManagement'; // Ajusta la ruta si mueves las interfaces
import { X, Save, Lock, Edit, User, UserCog, Mail, Shield, Users } from 'lucide-react';

interface EditUserModalProps {
  show: boolean;
  onClose: () => void;
  selectedUser: UserInterface | null;
  userFormData: UserFormData;
  handleUserFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleUserFormSubmit: (e: React.FormEvent) => void;
  formErrors: Record<string, string>;
  allRoles: Role[];
  loading: boolean;
  openPasswordModal: (user: UserInterface) => void; // Para el botón de cambiar contraseña
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  onClose,
  selectedUser,
  userFormData,
  handleUserFormChange,
  handleUserFormSubmit,
  formErrors,
  allRoles,
  loading,
  openPasswordModal,
}) => {
  if (!show || !selectedUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-boxdark shadow-2xl max-h-[90vh] overflow-y-auto my-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-t-xl p-6 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-black dark:text-white flex items-center">
              <Edit className="h-5 w-5 mr-2 text-primary" />
              Editar Usuario
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Modificando información de:{" "}
            <span className="font-medium text-primary">{selectedUser.username}</span>
          </p>
        </div>

        <form onSubmit={handleUserFormSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <User className="h-4 w-4 inline mr-1" /> Nombre
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={userFormData.firstName}
                onChange={handleUserFormChange}
                placeholder="Nombre"
                className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              {formErrors.firstName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <X className="h-4 w-4 mr-1" /> {formErrors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <User className="h-4 w-4 inline mr-1" /> Apellido
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={userFormData.lastName}
                onChange={handleUserFormChange}
                placeholder="Apellido"
                className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              {formErrors.lastName && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <X className="h-4 w-4 mr-1" /> {formErrors.lastName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <UserCog className="h-4 w-4 inline mr-1" /> Nombre de Usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={userFormData.username}
                onChange={handleUserFormChange}
                placeholder="Nombre de usuario"
                className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              {formErrors.username && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <X className="h-4 w-4 mr-1" /> {formErrors.username}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Mail className="h-4 w-4 inline mr-1" /> Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userFormData.email}
                onChange={handleUserFormChange}
                placeholder="Correo electrónico"
                className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <X className="h-4 w-4 mr-1" /> {formErrors.email}
                </p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="roles" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Shield className="h-4 w-4 inline mr-1" /> Roles
              </label>
              <select
                id="roles"
                name="roles"
                multiple
                value={userFormData.roles}
                onChange={handleUserFormChange}
                className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                size={4} // Muestra 4 opciones a la vez
              >
                {allRoles.map((role) => (
                  <option key={role._id} value={role._id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500">
                <Users className="h-4 w-4 inline mr-1" /> Mantén presionado Ctrl (o Cmd en Mac) para
                seleccionar múltiples roles.
              </p>
              {formErrors.roles && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <X className="h-4 w-4 mr-1" /> {formErrors.roles}
                </p>
              )}
            </div>
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
              type="button"
              onClick={() => {
                onClose(); // Cierra el modal actual
                openPasswordModal(selectedUser); // Abre el modal de contraseña
              }}
              className="rounded-lg bg-amber-500 py-2 px-4 text-sm font-medium text-white hover:bg-amber-600 transition-all flex items-center"
            >
              <Lock className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70 transition-all flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
