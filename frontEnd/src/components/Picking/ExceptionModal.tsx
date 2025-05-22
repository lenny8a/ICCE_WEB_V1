"use client"

import { useState, useEffect } from "react"
import { CaseReserva, MaterialReserva, ExcepcionData as ExcepcionDataType } from "../../types/picking"

interface ExceptionModalProps {
  isOpen: boolean
  onClose: () => void
  selectedExcepcionCase: CaseReserva | null
  selectedMaterial: MaterialReserva | null
  excepciones: ExcepcionDataType[]
  isLoadingExcepciones: boolean
  onConfirmExcepcion: (excepcion: ExcepcionDataType) => void
  isLoadingConfirm: boolean 
  removeLeadingZeros: (value: string) => string
  canModificar: boolean // Added canModificar prop
}

const ExceptionModal = ({
  isOpen,
  onClose,
  selectedExcepcionCase,
  selectedMaterial,
  excepciones,
  isLoadingExcepciones,
  onConfirmExcepcion,
  isLoadingConfirm,
  removeLeadingZeros,
  canModificar, // Destructure canModificar
}: ExceptionModalProps) => {
  const [localSelectedExcepcion, setLocalSelectedExcepcion] = useState<ExcepcionDataType | null>(null)

  useEffect(() => {
    if (isOpen) {
      setLocalSelectedExcepcion(null) 
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleConfirm = () => {
    if (localSelectedExcepcion && canModificar) { // Check canModificar before confirming
      onConfirmExcepcion(localSelectedExcepcion)
    }
  }

  const getConfirmButtonTitle = () => {
    if (!canModificar) return "No tiene permisos para registrar excepciones";
    if (!localSelectedExcepcion) return "Seleccione un tipo de excepción";
    if (isLoadingConfirm) return "Procesando...";
    return "Registrar Excepción";
  };

  if (!isOpen || !selectedExcepcionCase) { 
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn" onClick={!isLoadingConfirm ? onClose : undefined} style={{ userSelect: "none" }}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col z-[110] animate-scaleIn">
        <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-amber-500">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Registrar Excepción
          </h2>
          <button onClick={!isLoadingConfirm ? onClose : undefined} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Cerrar" disabled={isLoadingConfirm}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">
          {selectedExcepcionCase && (
            <div className="mb-5 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Case:</p><p className="font-medium text-gray-800 dark:text-white">{removeLeadingZeros(selectedExcepcionCase.CASE)}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Ubicación:</p><p className="font-medium text-gray-800 dark:text-white">{selectedExcepcionCase.UBICACION}</p></div>
              </div>
              {selectedMaterial && ( 
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Material:</p><p className="font-medium text-gray-800 dark:text-white">{selectedMaterial.MATNR}</p></div>
                  <div><p className="text-xs text-gray-500 dark:text-gray-400">Cant. Disp.:</p><p className="font-bold text-primary">{selectedExcepcionCase.CANTIDAD}</p></div>
                </div>
              )}
            </div>
          )}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Seleccione el tipo de excepción:</h3>
            {isLoadingExcepciones ? (
              <div className="flex items-center justify-center py-4">
                <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Cargando excepciones...</span>
              </div>
            ) : excepciones.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">No hay excepciones disponibles</div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                {excepciones.map((excepcion) => (
                  <div key={excepcion._id}
                    className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${localSelectedExcepcion?._id === excepcion._id ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"}`}
                    onClick={() => setLocalSelectedExcepcion(excepcion)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 ${localSelectedExcepcion?._id === excepcion._id ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"}`}></div>
                        <span className="font-medium text-gray-800 dark:text-white">{excepcion.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Código: {excepcion.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={!isLoadingConfirm ? onClose : undefined} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" disabled={isLoadingConfirm}>Cancelar</button>
            <button 
              type="button" 
              onClick={handleConfirm} 
              disabled={!localSelectedExcepcion || isLoadingConfirm || !canModificar}
              title={getConfirmButtonTitle()}
              className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:hover:shadow-sm disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingConfirm ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                  <span>Registrar Excepción</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExceptionModal
