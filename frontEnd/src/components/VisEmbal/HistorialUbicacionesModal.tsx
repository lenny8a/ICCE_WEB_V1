import React from 'react';
import { X as XIcon, Package, Calendar, Filter as FilterIcon, ArrowDownUp, AlertCircle } from 'lucide-react'; // Renombrado X y Filter
import type { UbicacionLog, Data } from '../../types/visEmbalTypes'; // Importar tipos

interface HistorialUbicacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: UbicacionLog[];
  embalData: Data; 
  formatDate: (dateString: string) => string;
  dateFilter: "all" | "today" | "week" | "month";
  setDateFilter: (filter: "all" | "today" | "week" | "month") => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  filteredLogs: UbicacionLog[];
}

const HistorialUbicacionesModal: React.FC<HistorialUbicacionesModalProps> = ({
  isOpen,
  onClose,
  logs, // Se usa para determinar si hay logs en general, no para mostrar
  embalData,
  formatDate,
  dateFilter,
  setDateFilter,
  sortOrder,
  setSortOrder,
  filteredLogs,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-0 touch-none"
      style={{
        willChange: "transform",
        backfaceVisibility: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        style={{ userSelect: "none" }}
      ></div>

      <div className="relative w-full h-full bg-white dark:bg-boxdark flex flex-col z-[60] md:max-w-4xl md:max-h-[90vh] md:rounded-xl md:shadow-2xl md:my-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-xl">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate flex items-center">
              <History className="mr-2 text-blue-500 h-5 w-5" />
              Historial de Ubicaciones
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              Case: {embalData.EMBAL} {embalData.MATNR && embalData.MAKTX ? `| ${embalData.MATNR} - ${embalData.MAKTX}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <FilterIcon className="mr-2 text-primary h-4 w-4" />
              Filtros
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
              {filteredLogs.length} registros
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "week" | "month")}
                className="w-full rounded-md border border-gray-200 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary text-xs sm:text-sm"
              >
                <option value="all">Todos los períodos</option>
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
              </select>
            </div>
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="w-full rounded-md border border-gray-200 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary text-xs sm:text-sm"
              >
                <option value="desc">Más reciente primero</option>
                <option value="asc">Más antiguo primero</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div
          className="overflow-y-auto flex-grow"
          style={{ contain: "content", contentVisibility: "auto" }}
        >
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
                <AlertCircle className="w-12 h-12 mb-2 text-gray-400 dark:text-gray-500" />
                {logs.length === 0
                  ? "No hay registros de cambios de ubicación para este case."
                  : "No se encontraron registros que coincidan con los filtros aplicados."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-5">
                    <tr>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <Calendar className="inline-block mr-1 h-3.5 w-3.5" />Fecha
                      </th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <MapPin className="inline-block mr-1 h-3.5 w-3.5" />Ubic. Anterior
                      </th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <MapPin className="inline-block mr-1 h-3.5 w-3.5 text-green-500" />Ubic. Nueva
                      </th>
                      <th scope="col" className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <Info className="inline-block mr-1 h-3.5 w-3.5" />Usuario
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                          {formatDate(log.fecha)}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                          {log.ubicacionAnterior || <span className="text-gray-400 italic">N/A</span>}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-xs font-medium text-blue-600 dark:text-blue-400">
                          {log.ubicacionNueva || <span className="text-gray-400 italic">N/A</span>}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300">
                          {log.usuario}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botón de cerrar */}
        <div className="sticky bottom-0 z-10 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistorialUbicacionesModal;
