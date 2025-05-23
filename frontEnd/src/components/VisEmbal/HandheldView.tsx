import React from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import ErrorMessage from '../ErrorMessage'; // Ajusta la ruta según tu estructura
import { viewEmbalForm } from '../../types'; // Ajusta la ruta según tu estructura
import { Search as SearchIcon, Package, Info, MapPin, Calendar, AlertTriangle, History, X as XIcon } from 'lucide-react'; // Renombrado X
import type { Data, DataGroup } from '../../types/visEmbalTypes'; // Importar tipos

interface HandheldViewProps {
  register: UseFormRegister<viewEmbalForm>;
  handleSubmit: ReturnType<typeof useForm<viewEmbalForm>>['handleSubmit'];
  handleView: (data: viewEmbalForm) => void; // Renombrado de handleview para consistencia
  errors: FieldErrors<viewEmbalForm>;
  isLoading: boolean;
  count: Data;
  dataGroups: DataGroup[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasHistorial: boolean;
  isLoadingLogs: boolean;
  openHistorialModal: () => void;
}

const HandheldView: React.FC<HandheldViewProps> = ({
  register,
  handleSubmit,
  handleView,
  errors,
  isLoading,
  count,
  dataGroups,
  activeTab,
  setActiveTab,
  hasHistorial,
  isLoadingLogs,
  openHistorialModal,
}) => {
  return (
    <div className="p-2">
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-primary text-white py-2 px-3 rounded-t-md flex items-center justify-between">
          <h1 className="text-lg font-bold">Visualizar Case</h1>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-md shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-3 pb-2">
            <form id="form1" onSubmit={handleSubmit(handleView)}>
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <Package className="text-primary mr-2 h-4 w-4" />
                  <label htmlFor="embal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Número de case:
                  </label>
                </div>
                <div className="flex items-center">
                  <div className="relative flex-grow">
                    <input
                      id="embal"
                      type="text"
                      placeholder="Escanee o ingrese el case"
                      className="w-full rounded-l-md border border-gray-200 bg-transparent py-2.5 pl-3 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary text-base touch-manipulation"
                      {...register("embal", { required: "El número de case es obligatorio" })}
                      disabled={isLoading}
                      autoComplete="off"
                      inputMode="text"
                      enterKeyHint="search"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 rounded-r-md bg-primary px-4 py-2.5 font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg
                        className="h-5 w-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <SearchIcon size={20} />
                    )}
                  </button>
                </div>
                {errors.embal && <ErrorMessage>{errors.embal.message}</ErrorMessage>}
              </div>
            </form>
          </div>
        </div>

        {count.EMBAL && (
          <div className="bg-white dark:bg-boxdark rounded-md shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-3 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="text-primary mr-2 h-5 w-5" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">{count.EMBAL}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-1">
                      {count.MATNR} - {count.MAKTX}
                    </p>
                  </div>
                </div>
                {hasHistorial && (
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
                        <svg
                          className="animate-spin h-3.5 w-3.5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Cargando...</span>
                      </>
                    ) : (
                      <>
                        <History size={14} />
                        <span>Historial</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {dataGroups.map((group) => {
                const hasValues = group.items.some((item) => item.value);
                if (!hasValues) return null;
                return (
                  <button
                    key={group.id}
                    className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 ${
                      activeTab === group.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab(group.id)}
                  >
                    {group.title}
                  </button>
                );
              })}
            </div>

            <div className="p-3">
              {dataGroups.map((group) => {
                const hasValues = group.items.some((item) => item.value);
                if (!hasValues || activeTab !== group.id) return null;
                return (
                  <div key={group.id} className="space-y-2">
                    {group.items.map(
                      (item, itemIndex) =>
                        item.value && (
                          <div
                            key={itemIndex}
                            className="flex flex-col border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0"
                          >
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              {item.label}:
                            </span>
                            <span className="text-base font-medium text-gray-800 dark:text-white break-words">
                              {item.value}
                            </span>
                          </div>
                        ),
                    )}
                  </div>
                );
              })}
            </div>
            {hasHistorial && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={openHistorialModal}
                  disabled={!hasHistorial || isLoadingLogs}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-md font-medium text-base hover:bg-blue-600 transition-colors"
                >
                  <History size={18} />
                  Ver Historial de Ubicaciones
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HandheldView;
