import React from 'react';
import { Search, Filter } from 'lucide-react';

interface Role {
  _id: string;
  name: string;
}

interface UserFiltersProps {
  filters: { search: string; status: string; role: string };
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  resetFilters: () => void;
  allRoles: Role[];
  showFilters: boolean;
  // setShowFilters: (show: boolean) => void; // No es necesario si el botón está aquí
  isMobile: boolean; // Para la lógica del botón de filtros si se mantiene aquí
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  handleSearchChange,
  handleFilterChange,
  resetFilters,
  allRoles,
  showFilters, // Se asume que el padre controla esto
  // setShowFilters,
  isMobile,
}) => {
  if (!showFilters) {
    return null;
  }

  return (
    <div className="m-4 md:m-6 p-4 md:p-5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-stroke dark:border-strokedark">
      <div className="flex flex-col md:flex-row flex-wrap gap-4 items-start md:items-end">
        <div className="w-full md:flex-1 md:min-w-[200px]">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Buscar
          </label>
          <div className="relative">
            <input
              type="text"
              id="search"
              placeholder="Buscar por nombre, usuario o email..."
              onChange={handleSearchChange} // Debería usar filters.search y un handler para el debounce
              defaultValue={filters.search} // Para que el resetFilters funcione
              className="w-full rounded-lg border border-stroke bg-white py-3 pl-11 pr-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="w-full md:w-48">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full rounded-lg border border-stroke bg-white py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary appearance-none"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rol
          </label>
          <select
            id="role"
            name="role"
            value={filters.role}
            onChange={handleFilterChange}
            className="w-full rounded-lg border border-stroke bg-white py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary appearance-none"
          >
            <option value="all">Todos</option>
            {allRoles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="w-full md:w-auto py-3 px-4 rounded-lg border border-stroke bg-white text-gray-500 hover:bg-gray-50 dark:border-form-strokedark dark:bg-form-input dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default UserFilters;
