import React from 'react';
import StatusBadge from '../StatusBadge'; // Asumiendo que StatusBadge es reutilizable
import { UserInterface } from '../../pages/Authentication/UserManagement'; // Ajusta la ruta si mueves las interfaces
import { X, Eye, Edit, User, UserCog, Mail, Shield } from 'lucide-react';

interface UserDetailsModalProps {
  show: boolean;
  onClose: () => void;
  selectedUser: UserInterface | null;
  openEditModal: (user: UserInterface) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  show,
  onClose,
  selectedUser,
  openEditModal,
}) => {
  if (!show || !selectedUser) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-boxdark shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-t-xl p-4 sm:p-6 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-semibold text-black dark:text-white flex items-center">
              <Eye className="h-5 w-5 mr-2 text-indigo-500" />
              Detalles del Usuario
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2 sm:mb-0">
                <User className="h-12 w-12 sm:h-14 sm:w-14 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="flex flex-col items-center sm:items-start gap-2">
                <h4 className="text-xl font-semibold text-black dark:text-white text-center sm:text-left">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-center sm:text-left">
                  @{selectedUser.username}
                </p>
                <StatusBadge status={selectedUser.isActive ? "Activo" : "Inactivo"} />
              </div>
            </div>

            <div className="border-t border-stroke dark:border-strokedark my-1"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre de Usuario</p>
                <p className="text-sm font-medium text-black dark:text-white flex items-center">
                  <UserCog className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  <span className="truncate">{selectedUser.username}</span>
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Correo Electrónico</p>
                <p className="text-sm font-medium text-black dark:text-white flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  <span className="truncate">{selectedUser.email}</span>
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre Completo</p>
                <p className="text-sm font-medium text-black dark:text-white flex items-center">
                  <User className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                  <span className="truncate">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </span>
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID de Usuario</p>
                <p className="text-sm font-medium text-black dark:text-white flex items-center">
                  <span className="truncate">{selectedUser._id}</span>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Roles Asignados</p>
              <div className="flex flex-wrap gap-2">
                {selectedUser.roles.length > 0 ? (
                  selectedUser.roles.map((role) => (
                    <span
                      key={role._id}
                      className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center"
                    >
                      <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                      {role.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">No tiene roles asignados</span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all flex items-center justify-center"
              >
                <X className="h-4 w-4 mr-2" />
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose(); // Cierra este modal
                  openEditModal(selectedUser); // Abre el modal de edición
                }}
                className="rounded-lg bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 transition-all flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Usuario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
