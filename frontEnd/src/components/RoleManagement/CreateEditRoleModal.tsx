import React, { useState, useEffect } from 'react';
import { Role } from '../../pages/Authentication/RoleManagement'; // Asumiendo que las interfaces están en RoleManagement.tsx
import { Shield, FileText, Save, X, RefreshCw } from 'lucide-react';

interface CreateEditRoleModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (roleData: { name: string; description: string; isActive?: boolean; _id?: string }) => void;
  roleToEdit: Role | null;
  loading: boolean;
}

const CreateEditRoleModal: React.FC<CreateEditRoleModalProps> = ({
  show,
  onClose,
  onSave,
  roleToEdit,
  loading,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (roleToEdit) {
      setName(roleToEdit.name);
      setDescription(roleToEdit.description);
      setIsActive(roleToEdit.isActive);
    } else {
      // Reset for new role
      setName('');
      setDescription('');
      setIsActive(true);
    }
  }, [roleToEdit, show]);

  const handleSave = () => {
    const roleData: { name: string; description: string; isActive?: boolean; _id?: string } = {
      name,
      description,
    };
    if (roleToEdit) {
      roleData._id = roleToEdit._id;
      roleData.isActive = isActive;
    }
    onSave(roleData);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-black dark:text-white">
            {roleToEdit ? 'Editar Rol' : 'Crear Nuevo Rol'}
          </h4>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2.5 block font-medium text-black dark:text-white">Nombre del Rol</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del rol"
                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>
          <div>
            <label className="mb-2.5 block font-medium text-black dark:text-white">Descripción</label>
            <div className="relative">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción del rol"
                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>
        </div>
        {roleToEdit && (
          <div className="mt-4">
            <label className="mb-2.5 block font-medium text-black dark:text-white">Estado</label>
            <div className="flex items-center space-x-4">
              <label className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  checked={isActive}
                  onChange={() => setIsActive(true)}
                  className="mr-2 h-5 w-5 accent-success"
                />
                <span className="text-sm text-black dark:text-white">Activo</span>
              </label>
              <label className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  checked={!isActive}
                  onChange={() => setIsActive(false)}
                  className="mr-2 h-5 w-5 accent-danger"
                />
                <span className="text-sm text-black dark:text-white">Inactivo</span>
              </label>
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
          >
            <X size={16} />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !name || !description}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                {roleToEdit ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <Save size={16} />
                {roleToEdit ? 'Guardar Cambios' : 'Crear Rol'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEditRoleModal;
