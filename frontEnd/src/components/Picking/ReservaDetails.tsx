"use client"

import { useDeviceDetect } from "../../hooks/use-device-detect" 
import {
  ReservaData,
  PickingResponse,
  MaterialReserva,
  RegisteredItem,
} from "../../types/picking"
import MaterialList from "./MaterialList"
import RegisteredItems from "./RegisteredItems" 

interface ReservaDetailsProps {
  reservaData: ReservaData
  isReservaProcessed: boolean
  processedPickingData: PickingResponse["data"] | null
  processingComplete: boolean
  isProcessing: boolean 
  canModificar: boolean
  notification: { type: "success" | "error"; message: string } | null
  allRegisteredItems: RegisteredItem[]
  isPickingExpanded: boolean
  onNewSearch: () => void
  onProcessReserva: () => void
  onOpenMaterialModal: (material: MaterialReserva) => void
  onOpenEditModal: (item: RegisteredItem) => void
  onDeleteMainItem: (itemId: string) => void
  onTogglePickingExpanded: () => void
  onError: (message: string) => void
  isSearching?: boolean; // Added isSearching prop
}

const ReservaDetails = ({
  reservaData,
  isReservaProcessed,
  processedPickingData,
  processingComplete,
  isProcessing,
  canModificar,
  notification,
  allRegisteredItems,
  isPickingExpanded,
  onNewSearch,
  onProcessReserva,
  onOpenMaterialModal,
  onOpenEditModal,
  onDeleteMainItem,
  onTogglePickingExpanded,
  onError,
  isSearching, // Destructure isSearching
}: ReservaDetailsProps) => {
  const { isMobile } = useDeviceDetect()

  if (isSearching) {
    return (
      <div className="mt-6 rounded-xl border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark animate-pulse">
        <div className="p-7">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-10"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const getProcesarButtonTitle = () => {
    if (!canModificar) return "No tiene permisos para procesar documentos";
    if (isReservaProcessed && processedPickingData?.status === "completed") return `El documento ya fue procesado`;
    if (allRegisteredItems.length === 0 && processedPickingData?.status !== "pending") return "Debe registrar al menos un item para procesar";
    return "";
  };

  return (
    <div className="rounded-xl border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark overflow-hidden transition-all duration-700 animate-scaleIn">
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-1">
        <div className="bg-white dark:bg-boxdark p-5 sm:p-7 rounded-lg">
          {/* Cabecera de la reserva con diseño mejorado */}
          <div
            className={`flex ${isMobile ? "flex-col" : "flex-row"} justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0`}
          >
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-full mr-4 animate-in spin-in-3 duration-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                  <path d="m3.3 7 8.7 5 8.7-5"></path>
                  <path d="M12 22V12"></path>
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white animate-fadeIn">
                  {reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"} {reservaData.RESERVA}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transform motion-safe:animate-fadeIn motion-safe:animate-slideInLeft motion-safe:delay-100">
                  {isReservaProcessed && (processedPickingData?.status === "completed" || processedPickingData?.status === "accounted") ? (
                    <span className="flex items-center text-green-600 dark:text-green-400">
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
                        className="mr-1"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      {reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"} ya procesada
                    </span>
                  ) : (
                    `${reservaData.MATERIALES.length} materiales disponibles`
                  )}
                </p>
              </div>
            </div>
            {processingComplete ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <div className="bg-success/10 text-success px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
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
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Procesado correctamente
                </div>
                <button
                  onClick={onNewSearch}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-9 9z"></path>
                    <path d="M3 12h18"></path>
                    <path d="M12 3v18"></path>
                  </svg>
                  Nueva búsqueda
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (!canModificar) {
                      onError("No tiene permisos para procesar documentos")
                      return
                    }
                    onProcessReserva()
                  }}
                  disabled={
                    isProcessing ||
                    (allRegisteredItems.length === 0 && processedPickingData?.status !== "pending") || // Allow processing if pending, even with 0 items to allow status change
                    (isReservaProcessed && processedPickingData?.status === "completed") ||
                    !canModificar
                  }
                  title={getProcesarButtonTitle()}
                  className="bg-success text-white px-5 py-3 rounded-lg text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-success/90 transition-all duration-500 shadow-md hover:shadow-lg hover:translate-y-[-2px] font-medium animate-in fade-in slide-in-from-right-8 disabled:bg-gray-400 disabled:hover:shadow-md disabled:hover:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14"></path>
                        <path d="M12 5v14"></path>
                      </svg>
                      <span>
                        {processedPickingData?.status === "pending"
                          ? `Actualizar ${reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}`
                          : `Procesar ${reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}`}
                      </span>
                    </>
                  )}
                </button>
                {notification && (
                  <div
                    className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-right-5 duration-300 ${
                      notification.type === "success"
                        ? "bg-success/10 text-success border border-success/30"
                        : "bg-danger/10 text-danger border border-danger/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {notification.type === "success" ? (
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      ) : (
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" x2="12" y1="8" y2="12"></line>
                          <line x1="12" x2="12.01" y1="16" y2="16"></line>
                        </svg>
                      )}
                      {notification.message}
                    </div>
                  </div>
                )}
              </div>
            )}
            {!canModificar && !processingComplete && ( // Show only if not allowed and not already complete
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm animate-in fade-in slide-in-from-top-5 duration-300">
                <div className="flex items-center gap-2">
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" x2="12" y1="8" y2="12"></line>
                    <line x1="12" x2="12.01" y1="16" y2="16"></line>
                  </svg>
                  Modo de solo visualización. No tiene permisos para modificar.
                </div>
              </div>
            )}
          </div>

          {/* Mostrar el detalle de la reserva procesada si ya existe */}
          {isReservaProcessed &&
            processedPickingData &&
            (processedPickingData.status === "completed" || processedPickingData.status === "accounted") && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border-l-4 border-green-500 shadow-sm">
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
                    className="mr-3 text-green-500"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}{" "}
                  {processedPickingData.status === "accounted" ? "Contabilizada" : "Procesada"}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}:</span>{" "}
                      {processedPickingData.reserva}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Estado:</span>
                      <span
                        className={`ml-1 font-medium ${
                          processedPickingData.status === "completed"
                            ? "text-green-600 dark:text-green-400"
                            : processedPickingData.status === "pending"
                              ? "text-amber-600 dark:text-amber-400"
                              : processedPickingData.status === "accounted"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {processedPickingData.status === "completed"
                          ? "Completado"
                          : processedPickingData.status === "pending"
                            ? "Pendiente"
                            : processedPickingData.status === "accounted"
                              ? "Contabilizado"
                              : processedPickingData.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Total de items:</span> {processedPickingData.totalItems}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Procesado por:</span> {processedPickingData.createdBy}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Fecha de procesamiento:</span>{" "}
                      {new Date(processedPickingData.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-green-100 dark:bg-green-800/30 text-left">
                        <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Material</th>
                        <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Descripción</th>
                        <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Ubicación</th>
                        <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Case</th>
                        <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300 text-right">
                          Cantidad
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedPickingData.items.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-green-200 dark:border-green-800/30 hover:bg-green-50 dark:hover:bg-green-800/20"
                        >
                          <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{item.material}</td>
                          <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{item.materialDesc}</td>
                          <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{item.location}</td>
                          <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{item.case}</td>
                          <td className="py-2 px-3 text-gray-800 dark:text-gray-200 text-right font-semibold">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          {/* Mostrar información de reserva pendiente si existe y está pendiente */}
          {processedPickingData && processedPickingData.status === "pending" && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border-l-4 border-amber-500 shadow-sm">
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
                  className="mr-3 text-amber-500"
                >
                  <path d="M12 9v4"></path>
                  <path d="M12 17h.01"></path>
                  <path d="M3.34 17a10 10 0 1 1 17.32 0"></path>
                </svg>
                {reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"} en Proceso
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}:</span>{" "}
                    {processedPickingData.reserva}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Estado:</span>
                    <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">Pendiente</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Items registrados:</span> {processedPickingData.totalItems}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Iniciado por:</span> {processedPickingData.createdBy}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Fecha de inicio:</span>{" "}
                    {new Date(processedPickingData.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Última actualización:</span>{" "}
                    {new Date(processedPickingData.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center">
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
                    className="mr-2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" x2="12" y1="8" y2="12"></line>
                    <line x1="12" x2="12.01" y1="16" y2="16"></line>
                  </svg>
                  {`Este ${reservaData?.TIPODOC === "02" ? "orden" : "reserva"} está en proceso. Puede continuar procesándola más tarde.`}
                </p>
              </div>
            </div>
          )}

          {(!isReservaProcessed || (processedPickingData && processedPickingData.status === "pending")) && (
            <MaterialList
              materials={reservaData.MATERIALES}
              tipodoc={reservaData.TIPODOC}
              isMobile={isMobile}
              processingComplete={processingComplete} // This is the main processingComplete
              canModificar={canModificar}
              onOpenMaterialModal={onOpenMaterialModal}
            />
          )}

          {(!isReservaProcessed || (processedPickingData && processedPickingData.status === "pending") || allRegisteredItems.length > 0) && (
            <RegisteredItems
              items={allRegisteredItems}
              isMobile={isMobile}
              isPickingExpanded={isPickingExpanded}
              processingComplete={processingComplete} // This is the main processingComplete
              canModificar={canModificar}
              onTogglePickingExpanded={onTogglePickingExpanded}
              onOpenEditModal={onOpenEditModal}
              onDeleteMainItem={onDeleteMainItem}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ReservaDetails

[end of frontEnd/src/components/Picking/ReservaDetails.tsx]
