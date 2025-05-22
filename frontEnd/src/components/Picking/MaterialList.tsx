"use client"

import { MaterialReserva } from "../../types/picking"

interface MaterialListProps {
  materials: MaterialReserva[]
  tipodoc?: string
  isMobile: boolean
  processingComplete: boolean
  canModificar: boolean
  onOpenMaterialModal: (material: MaterialReserva) => void
}

const MaterialList = ({
  materials,
  tipodoc,
  isMobile,
  processingComplete,
  canModificar,
  onOpenMaterialModal,
}: MaterialListProps) => {

  const getButtonTitle = () => {
    if (!canModificar) return "No tiene permisos para esta acción";
    if (processingComplete) return "El picking ya ha sido procesado";
    return "Ver ubicaciones del material";
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border-l-4 border-secondary mb-6 shadow-sm transition-all duration-500 hover:shadow-md animate-fadeIn">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-3 text-secondary"
        >
          <path d="M5 8h14"></path>
          <path d="M5 12h14"></path>
          <path d="M5 16h14"></path>
        </svg>
        Materiales de la {tipodoc === "02" ? "Entrega" : "Reserva"}
      </h3>

      {/* Tabla de materiales para pantallas medianas y grandes con diseño mejorado */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left">
              <th
                className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 rounded-tl-lg`}
              >
                Material
              </th>
              <th
                className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
              >
                Descripción
              </th>
              <th
                className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 text-right`}
              >
                Cantidad
              </th>
              <th
                className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 text-center rounded-tr-lg`}
              >
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {materials.map((material, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ${
                  processingComplete ? "opacity-70" : ""
                } animate-slideInRight`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <td
                  className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200 font-medium`}
                >
                  {material.MATNR}
                </td>
                <td
                  className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200`}
                >
                  {material.MAKTX}
                </td>
                <td
                  className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200 text-right font-semibold`}
                >
                  {material.MENGE}{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-400">{material.MEINS}</span>
                </td>
                <td className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-center`}>
                  {material.CASES.some((caseItem) => Number.parseInt(caseItem.CANTIDAD) > 0) ? (
                    <button
                      onClick={() => onOpenMaterialModal(material)}
                      className={`bg-primary text-white px-${isMobile ? "2" : "3"} py-${isMobile ? "1" : "2"} rounded-lg text-sm hover:bg-primary/90 transition-all duration-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] flex items-center justify-center gap-2 mx-auto disabled:opacity-75 disabled:cursor-not-allowed`}
                      disabled={processingComplete || !canModificar}
                      title={getButtonTitle()}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      Ver ubicaciones
                    </button>
                  ) : (
                    <div className="text-danger text-xs font-medium bg-danger/10 px-3 py-2 rounded-lg flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" x2="12" y1="8" y2="12"></line>
                        <line x1="12" x2="12.01" y1="16" y2="16"></line>
                      </svg>
                      No cases disponibles
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas para móviles con diseño mejorado */}
      <div className="sm:hidden space-y-2 animate-in fade-in duration-1000 delay-300">
        {materials.map((material, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in-50 slide-in-from-right-10"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800 dark:text-white text-base">{material.MATNR}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                  {material.MAKTX}
                </p>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                <p className="font-bold text-primary text-sm">
                  {material.MENGE}{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-400">{material.MEINS}</span>
                </p>
              </div>
            </div>
            <div className="mt-3">
              {material.CASES.some((caseItem) => Number.parseInt(caseItem.CANTIDAD) > 0) ? (
                <button
                  onClick={() => onOpenMaterialModal(material)}
                  className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs w-full hover:bg-primary/90 transition-all duration-300 shadow-sm flex items-center justify-center gap-1 disabled:opacity-75 disabled:cursor-not-allowed"
                  disabled={processingComplete || !canModificar}
                  title={getButtonTitle()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Ver ubicaciones
                </button>
              ) : (
                <div className="text-danger text-xs font-medium bg-danger/10 px-3 py-1.5 rounded-lg flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" x2="12" y1="8" y2="12"></line>
                    <line x1="12" x2="12.01" y1="16" y2="16"></line>
                  </svg>
                  No cases disponibles
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MaterialList
