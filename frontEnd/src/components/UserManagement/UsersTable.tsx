import React from 'react';
import StatusBadge from '../StatusBadge'; // Asumiendo que StatusBadge es reutilizable
import { UserInterface } from '../../pages/Authentication/UserManagement'; // Ajusta la ruta si mueves las interfaces
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  Lock,
  CheckCircle2,
  Mail,
} from 'lucide-react';

interface UsersTableProps {
  users: UserInterface[];
  requestSort: (key: string) => void;
  getSortDirectionIndicator: (key: string) => JSX.Element | null;
  openEditModal: (user: UserInterface) => void;
  openPasswordModal: (user: UserInterface) => void;
  openDetailsModal: (user: UserInterface) => void;
  showConfirmation: (userId: string, isActive: boolean, username: string) => void;
  isMobile: boolean;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  requestSort,
  getSortDirectionIndicator,
  openEditModal,
  openPasswordModal,
  openDetailsModal,
  showConfirmation,
  isMobile,
}) => {
  return (
    <>
      {/* Cabecera de la tabla para desktop */}
      <div className="hidden md:grid md:grid-cols-12 border-t border-stroke py-4.5 px-4 md:px-6 dark:border-strokedark text-sm font-medium bg-gray-50 dark:bg-gray-800">
        <div className="col-span-2 flex items-center cursor-pointer" onClick={() => requestSort("username")}>
          <p className="font-medium">Usuario {getSortDirectionIndicator("username")}</p>
        </div>
        <div className="col-span-3 flex items-center cursor-pointer" onClick={() => requestSort("name")}>
          <p className="font-medium">Nombre Completo {getSortDirectionIndicator("name")}</p>
        </div>
        <div className="col-span-3 flex items-center cursor-pointer" onClick={() => requestSort("email")}>
          <p className="font-medium">Correo {getSortDirectionIndicator("email")}</p>
        </div>
        <div className="col-span-2 flex items-center cursor-pointer" onClick={() => requestSort("status")}>
          <p className="font-medium">Estado {getSortDirectionIndicator("status")}</p>
        </div>
        <div className="col-span-2 flex items-center">
          <p className="font-medium">Acciones</p>
        </div>
      </div>

      {/* Cuerpo de la tabla / Lista de usuarios */}
      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user._id}
            className="border-t border-stroke py-4 px-4 md:px-6 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 transition-colors"
          >
            {/* Vista móvil - Tarjeta */}
            <div className="md:hidden flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-black dark:text-white">{user.username}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <StatusBadge status={user.isActive ? "Activo" : "Inactivo"} />
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                {user.email}
              </p>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => showConfirmation(user._id, user.isActive, user.username)}
                  className={`p-2 rounded-md ${
                    user.isActive
                      ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                  } transition-colors`}
                  title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                >
                  {user.isActive ? <Trash2 className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => openEditModal(user)}
                  className="p-2 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Editar usuario"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => openPasswordModal(user)}
                  className="p-2 rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  title="Cambiar contraseña"
                >
                  <Lock className="h-5 w-5" />
                </button>
                <button
                  onClick={() => openDetailsModal(user)}
                  className="p-2 rounded-md text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Vista desktop - Grid */}
            <div className="hidden md:grid md:grid-cols-12">
              <div className="col-span-2 flex items-center">
                <p className="text-sm text-black dark:text-white">{user.username}</p>
              </div>
              <div className="col-span-3 flex items-center">
                <p className="text-sm text-black dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div className="col-span-3 flex items-center">
                <p className="text-sm text-black dark:text-white">{user.email}</p>
              </div>
              <div className="col-span-2 flex items-center">
                <StatusBadge status={user.isActive ? "Activo" : "Inactivo"} />
              </div>
              <div className="col-span-2 flex items-center space-x-3">
                <button
                  onClick={() => showConfirmation(user._id, user.isActive, user.username)}
                  className={`p-1.5 rounded-md ${
                    user.isActive
                      ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                  } transition-colors`}
                  title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                >
                  {user.isActive ? <Trash2 className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => openEditModal(user)}
                  className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Editar usuario"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => openPasswordModal(user)}
                  className="p-1.5 rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  title="Cambiar contraseña"
                >
                  <Lock className="h-5 w-5" />
                </button>
                <button
                  onClick={() => openDetailsModal(user)}
                  className="p-1.5 rounded-md text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  title="Ver detalles"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))
      ) : null}
    </>
  );
};

export default UsersTable;
