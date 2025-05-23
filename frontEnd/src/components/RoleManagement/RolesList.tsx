import React from 'react';
import { Role } from '../../pages/Authentication/RoleManagement'; // Ajusta la ruta si mueves las interfaces
import { Shield, Settings, Edit, Trash2, AlertCircle } from 'lucide-react';

interface RolesListProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void; // Esta prop es para iniciar el proceso de confirmación
  onSelectRoleForPermissions: (role: Role) => void;
  // loading: boolean; // Ya no se maneja aquí, sino en el componente padre
}

const RolesList: React.FC<RolesListProps> = ({
  roles,
  onEdit,
  onDelete,
  onSelectRoleForPermissions,
}) => {
  if (roles.length === 0) {
    return (
      <div className="border-t border-stroke py-8 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="mb-3 h-16 w-16 text-gray-400" />
          <p className="text-center text-lg font-medium text-black dark:text-white">
            No se encontraron roles
          </p>
          <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay roles disponibles. Crea uno nuevo para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-4 px-4 md:px-6 xl:px-7.5">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-black dark:text-white">Roles Existentes</h4>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary bg-opacity-10 px-3 py-1 text-xs font-medium text-primary">
              Total: {roles.length}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Headers - Hidden on Mobile */}
      <div className="hidden border-t border-stroke py-4.5 px-4 dark:border-strokedark md:grid md:grid-cols-6 md:px-6 xl:px-7.5">
        <div className="col-span-2 flex items-center">
          <p className="font-medium text-black dark:text-white">Nombre</p>
        </div>
        <div className="col-span-2 flex items-center">
          <p className="font-medium text-black dark:text-white">Descripción</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium text-black dark:text-white">Estado</p>
        </div>
        <div className="col-span-1 flex items-center justify-end">
          <p className="font-medium text-black dark:text-white">Acciones</p>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {roles.map((role) => (
          <div
            key={role._id}
            className="border-t border-stroke py-4.5 px-4 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 md:grid md:grid-cols-6 md:px-6 xl:px-7.5"
          >
            {/* Mobile View */}
            <div className="flex flex-col gap-2 md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                    <Shield className="text-primary" size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">{role.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    role.isActive
                      ? "bg-success bg-opacity-10 text-success"
                      : "bg-danger bg-opacity-10 text-danger"
                  }`}
                >
                  {role.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onSelectRoleForPermissions(role)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary transition-colors hover:bg-primary hover:text-white"
                  title="Gestionar permisos"
                >
                  <Settings size={16} />
                </button>
                <button
                  onClick={() => onEdit(role)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 bg-opacity-10 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                  title="Editar rol"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(role._id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-danger bg-opacity-10 text-danger transition-colors hover:bg-danger hover:text-white"
                  title="Eliminar rol"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Desktop View */}
            <div className="col-span-2 hidden items-center md:flex">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                  <Shield className="text-primary" size={20} />
                </span>
                <p className="text-sm font-medium text-black dark:text-white">{role.name}</p>
              </div>
            </div>
            <div className="col-span-2 hidden items-center md:flex">
              <p className="text-sm text-black dark:text-white">{role.description}</p>
            </div>
            <div className="col-span-1 hidden items-center md:flex">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  role.isActive
                    ? "bg-success bg-opacity-10 text-success"
                    : "bg-danger bg-opacity-10 text-danger"
                }`}
              >
                {role.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="col-span-1 hidden items-center justify-end space-x-3.5 md:flex">
              <button
                onClick={() => onSelectRoleForPermissions(role)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary transition-colors hover:bg-primary hover:text-white"
                title="Gestionar permisos"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => onEdit(role)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 bg-opacity-10 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                title="Editar rol"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(role._id)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-danger bg-opacity-10 text-danger transition-colors hover:bg-danger hover:text-white"
                title="Eliminar rol"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesList;
