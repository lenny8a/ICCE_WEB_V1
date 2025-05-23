import React from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import ErrorMessage from '../ErrorMessage'; // Ajusta la ruta según tu estructura
import { viewEmbalForm } from '../../types'; // Ajusta la ruta según tu estructura
import { Search as SearchIcon, Package, Info, MapPin, Calendar, AlertTriangle, History } from 'lucide-react';
import type { Data, DataGroup } from '../../types/visEmbalTypes'; // Importar tipos

interface DesktopViewProps {
  register: UseFormRegister<viewEmbalForm>;
  handleSubmit: ReturnType<typeof useForm<viewEmbalForm>>['handleSubmit'];
  handleView: (data: viewEmbalForm) => void; // Renombrado para consistencia
  errors: FieldErrors<viewEmbalForm>;
  isLoading: boolean;
  count: Data;
  dataGroups: DataGroup[];
  hasHistorial: boolean;
  isLoadingLogs: boolean;
  openHistorialModal: () => void;
}

const DesktopView: React.FC<DesktopViewProps> = ({
  register,
  handleSubmit,
  handleView,
  errors,
  isLoading,
  count,
  dataGroups,
  hasHistorial,
  isLoadingLogs,
  openHistorialModal,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <Package className="text-primary mr-2 h-5 w-5" />
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Consultar Case</h2>
            </div>
            <form id="form1" onSubmit={handleSubmit(handleView)}>
              <div className="flex items-center">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon className="text-gray-500 dark:text-gray-400 h-4 w-4" />
                  </div>
                  <input
                    id="embal"
                    type="text"
                    placeholder="Número de case"
                    className="w-full rounded-l-md border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary text-sm"
                    {...register("embal", { required: "El número de case es obligatorio" })}
                    disabled={isLoading}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1 rounded-r-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <SearchIcon size={16} />
                  )}
                  <span>Buscar</span>
                </button>
              </div>
              {errors.embal && <ErrorMessage>{errors.embal.message}</ErrorMessage>}
            </form>
          </div>
        </div>

        {count.EMBAL && (
          <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-scaleIn">
            <div className="p-4">
              <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-md border-l-4 border-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="text-primary mr-3 h-6 w-6" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Case: {count.EMBAL}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {count.MATNR} - {count.MAKTX}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={openHistorialModal}
                    disabled={!hasHistorial || isLoadingLogs}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                      hasHistorial && !isLoadingLogs
                        ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                    title={hasHistorial ? "Ver historial de ubicaciones" : "No hay historial disponible"}
                  >
                    {isLoadingLogs ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Cargando...</span>
                      </>
                    ) : (
                      <>
                        <History size={14} />
                        <span>{hasHistorial ? "Ver historial" : "Sin historial"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dataGroups.map((group, groupIndex) => {
                  const hasValues = group.items.some((item) => item.value);
                  if (!hasValues) return null;
                  return (
                    <div
                      key={groupIndex}
                      className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center">
                        {group.icon}
                        <h4 className="font-semibold text-gray-800 dark:text-white">{group.title}</h4>
                      </div>
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {group.items.map((item, itemIndex) =>
                          item.value ? (
                            <div key={itemIndex} className="px-4 py-2.5 flex flex-col sm:flex-row sm:justify-between">
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {item.label}:
                              </span>
                              <span className="text-sm font-medium text-gray-800 dark:text-white break-words">
                                {item.value}
                              </span>
                            </div>
                          ) : null,
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DesktopView;
