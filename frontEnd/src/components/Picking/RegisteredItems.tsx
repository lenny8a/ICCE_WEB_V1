"use client"

import { RegisteredItem } from "../../types/picking"

interface RegisteredItemsProps {
  items: RegisteredItem[]
  isMobile: boolean
  isPickingExpanded: boolean
  processingComplete: boolean
  canModificar: boolean
  onTogglePickingExpanded: () => void
  onOpenEditModal: (item: RegisteredItem) => void
  onDeleteMainItem: (itemId: string) => void
}

const RegisteredItems = ({
  items,
  isMobile,
  isPickingExpanded,
  processingComplete,
  canModificar,
  onTogglePickingExpanded,
  onOpenEditModal,
  onDeleteMainItem,
}: RegisteredItemsProps) => {

  const getActionTitle = (action: "Modificar" | "Eliminar") => {
    if (!canModificar) return "No tiene permisos para esta acción";
    if (processingComplete) return "El picking ya ha sido procesado";
    return `${action} item`;
  };

  return (
    <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border-l-4 border-primary shadow-sm transition-all duration-500 hover:shadow-md animate-fadeIn">
      {/* Cabecera con botón para desplegar/contraer */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
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
            className="mr-3 text-primary"
          >
            <path d="M20 5H8.5L7 7H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"></path>
            <path d="M9 14v-3"></path>
            <path d="M12 15v-4"></path>
            <path d="M15 16v-5"></path>
          </svg>
          Elementos en Picking{" "}
          <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
            {items.length}
          </span>
        </h3>
        <button
          onClick={onTogglePickingExpanded}
          className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-all duration-300"
          aria-label={isPickingExpanded ? "Contraer" : "Expandir"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-primary transition-transform duration-500 ${isPickingExpanded ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Contenido desplegable */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isPickingExpanded ? "block opacity-100 mt-4" : "hidden opacity-0 mt-0"
        }`}
      >
        {items.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic animate-in fade-in duration-700">
            No hay elementos registrados en picking
          </div>
        ) : (
          <>
            {/* Tabla para pantallas medianas y grandes con diseño mejorado */}
            <div className="hidden sm:block overflow-x-auto">
              <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                <table className="w-full table-auto animate-in fade-in duration-700">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                      <th
                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
                      >
                        Material
                      </th>
                      <th
                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
                      >
                        Descripción
                      </th>
                      <th
                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
                      >
                        Ubicación
                      </th>
                      <th
                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
                      >
                        Case
                      </th>
                      <th
                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 text-right`}
                      >
                        Cantidad
                      </th>
                      <th
                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 text-center`}
                      >
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 animate-in fade-in-50 slide-in-from-bottom-10"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td
                          className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200 font-medium`}
                        >
                          {item.material}
                        </td>
                        <td
                          className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200`}
                        >
                          {item.materialDesc}
                        </td>
                        <td
                          className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200`}
                        >
                          {item.location}
                        </td>
                        <td
                          className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200`}
                        >
                          {item.case}
                        </td>
                        <td
                          className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200 text-right font-semibold`}
                        >
                          {item.quantity}
                        </td>
                        <td
                          className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-center`}
                        >
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => onOpenEditModal(item)}
                              className="bg-amber-400 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-secondary/90 transition-all duration-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] flex items-center gap-1 disabled:opacity-75 disabled:cursor-not-allowed"
                              title={getActionTitle("Modificar")}
                              disabled={!canModificar || processingComplete}
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
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                              </svg>
                              Modificar
                            </button>
                            <button
                              onClick={() => onDeleteMainItem(item.id)}
                              className="bg-danger text-white px-3 py-1.5 rounded-lg text-xs hover:bg-danger/90 transition-all duration-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] flex items-center gap-1 disabled:opacity-75 disabled:cursor-not-allowed"
                              title={getActionTitle("Eliminar")}
                              disabled={!canModificar || processingComplete}
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
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                <line x1="10" x2="10" y1="11" y2="17"></line>
                                <line x1="14" x2="14" y1="11" y2="17"></line>
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vista de tarjetas para móviles con diseño mejorado */}
            <div className="sm:hidden space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in-50 zoom-in-90"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white text-base">
                        {item.material}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {item.materialDesc}
                      </p>
                    </div>
                    <div className="bg-primary/10 px-2 py-1 rounded-full">
                      <p className="font-bold text-primary text-sm">{item.quantity}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Ubicación:</p>
                      <p className="font-medium text-gray-800 dark:text-white">{item.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Case:</p>
                      <p className="font-medium text-gray-800 dark:text-white truncate">{item.case}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => onOpenEditModal(item)}
                      className="bg-secondary text-white px-2 py-1.5 rounded-lg text-xs flex-1 hover:bg-secondary/90 transition-all duration-300 shadow-sm flex items-center justify-center gap-1 disabled:opacity-75 disabled:cursor-not-allowed"
                      disabled={!canModificar || processingComplete}
                      title={getActionTitle("Modificar")}
                    >
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
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      </svg>
                      Modificar
                    </button>
                    <button
                      onClick={() => onDeleteMainItem(item.id)}
                      className="bg-danger text-white px-2 py-1.5 rounded-lg text-xs flex-1 hover:bg-danger/90 transition-all duration-300 shadow-sm flex items-center justify-center gap-1 disabled:opacity-75 disabled:cursor-not-allowed"
                      disabled={!canModificar || processingComplete}
                      title={getActionTitle("Eliminar")}
                    >
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
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" x2="10" y1="11" y2="17"></line>
                        <line x1="14" x2="14" y1="11" y2="17"></line>
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default RegisteredItems
