import React from 'react';
import { Page } from '../../pages/Authentication/RoleManagement'; // Ajusta la ruta si mueves las interfaces
import { FileCode, Eye, Edit, Trash2, AlertCircle, Link as LinkIcon } from 'lucide-react';

interface PagesListProps {
  pages: Page[];
  onEdit: (page: Page) => void;
  onDelete: (pageId: string) => void;
  onShowInfo: (pageId: string) => void;
  // loading: boolean; // Ya no se maneja aquí, sino en el componente padre
}

const PagesList: React.FC<PagesListProps> = ({
  pages,
  onEdit,
  onDelete,
  onShowInfo,
}) => {
  if (pages.length === 0) {
    return (
      <div className="border-t border-stroke py-8 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="mb-3 h-16 w-16 text-gray-400" />
          <p className="text-center text-lg font-medium text-black dark:text-white">
            No se encontraron páginas
          </p>
          <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
            No hay páginas disponibles. Crea una nueva para comenzar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-4 px-4 md:px-6 xl:px-7.5">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-black dark:text-white">Páginas Disponibles</h4>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary bg-opacity-10 px-3 py-1 text-xs font-medium text-primary">
              Total: {pages.length}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-success bg-opacity-10 px-3 py-1 text-xs font-medium text-success">
              Activas: {pages.filter(p => p.isActive).length}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop Headers - Hidden on Mobile */}
      <div className="hidden border-t border-stroke py-4.5 px-4 dark:border-strokedark md:grid md:grid-cols-12 md:px-6 xl:px-7.5">
        <div className="col-span-4 flex items-center">
          <p className="font-medium text-black dark:text-white">Nombre / Ruta</p>
        </div>
        <div className="col-span-5 flex items-center">
          <p className="font-medium text-black dark:text-white">Descripción</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium text-black dark:text-white">Estado</p>
        </div>
        <div className="col-span-2 flex items-center justify-end">
          <p className="font-medium text-black dark:text-white">Acciones</p>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {pages.map((page) => (
          <div
            key={page._id}
            className="border-t border-stroke py-4 px-4 transition-colors hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 md:grid md:grid-cols-12 md:px-6 xl:px-7.5"
          >
            {/* Mobile View */}
            <div className="flex flex-col gap-2 md:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                    <FileCode className="text-primary" size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">{page.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{page.path}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    page.isActive
                      ? "bg-success bg-opacity-10 text-success"
                      : "bg-danger bg-opacity-10 text-danger"
                  }`}
                >
                  {page.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                {page.description}
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => onShowInfo(page._id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary transition-colors hover:bg-primary hover:text-white"
                  title="Ver detalles"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => onEdit(page)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 bg-opacity-10 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                  title="Editar página"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(page._id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-danger bg-opacity-10 text-danger transition-colors hover:bg-danger hover:text-white"
                  title="Eliminar página"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Desktop View */}
            <div className="col-span-4 hidden items-center md:flex">
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                    <FileCode className="text-primary" size={20} />
                  </span>
                  <p className="text-sm font-medium text-black dark:text-white">{page.name}</p>
                </div>
                <p className="mt-1 ml-13 text-xs text-gray-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <LinkIcon size={12} />
                    {page.path}
                  </span>
                </p>
              </div>
            </div>
            <div className="col-span-5 hidden items-center md:flex">
              <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                {page.description}
              </p>
            </div>
            <div className="col-span-1 hidden items-center md:flex">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  page.isActive
                    ? "bg-success bg-opacity-10 text-success"
                    : "bg-danger bg-opacity-10 text-danger"
                }`}
              >
                {page.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="col-span-2 hidden items-center justify-end md:flex">
              <div className="flex space-x-2">
                <button
                  onClick={() => onShowInfo(page._id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary transition-colors hover:bg-primary hover:text-white"
                  title="Ver detalles"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onEdit(page)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 bg-opacity-10 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                  title="Editar página"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => onDelete(page._id)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-danger bg-opacity-10 text-danger transition-colors hover:bg-danger hover:text-white"
                  title="Eliminar página"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesList;
