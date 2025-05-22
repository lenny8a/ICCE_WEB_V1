"use client"

import { useState, useEffect, useRef } from "react"
import { RegisteredItem, ReservaData } from "../../types/picking" 

interface EditPickingItemModalProps {
  isOpen: boolean
  onClose: () => void
  itemToEdit: RegisteredItem | null
  reservaData: ReservaData | null 
  onSaveEdit: (itemId: string, newQuantity: string) => void 
  canModificar: boolean
}

const EditPickingItemModal = ({
  isOpen,
  onClose,
  itemToEdit,
  reservaData,
  onSaveEdit,
  canModificar,
}: EditPickingItemModalProps) => {
  const [currentEditQuantity, setCurrentEditQuantity] = useState("")
  const [currentEditError, setCurrentEditError] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const editQuantityInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && itemToEdit) {
      setCurrentEditQuantity(itemToEdit.quantity)
      setCurrentEditError("")
      setIsSavingEdit(false)
      setTimeout(() => {
        editQuantityInputRef.current?.focus()
      }, 100) 
      document.body.style.overflow = "hidden"
    } else if (!isOpen) {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto" 
    }
  }, [isOpen, itemToEdit])

  const handleInternalSave = () => {
    if (!itemToEdit || !reservaData || !canModificar) {
      setCurrentEditError("No se puede guardar el cambio.")
      return
    }

    setCurrentEditError("") 
    const newQuantityNum = Number.parseFloat(currentEditQuantity)
    const oldQuantityNum = Number.parseFloat(itemToEdit.quantity)

    if (isNaN(newQuantityNum)) {
      setCurrentEditError("Por favor ingrese una cantidad numérica válida.")
      return
    }
    if (newQuantityNum < 0) { 
      setCurrentEditError("La cantidad no puede ser negativa.")
      return
    }

    const quantityDiff = newQuantityNum - oldQuantityNum
    if (quantityDiff === 0 && newQuantityNum !==0 ) { 
        onClose(); 
        return;
    }
    
    const material = reservaData.MATERIALES.find(m => m.MATNR === itemToEdit.materialCode)
    if (!material) {
      setCurrentEditError("Error: Material del item no encontrado en los datos de la reserva.")
      return
    }

    const caseItem = material.CASES.find(c => c.CASE === itemToEdit.case && c.UBICACION === itemToEdit.location)

    if (quantityDiff > 0) { 
      const availableInCase = caseItem ? Number.parseFloat(caseItem.CANTIDAD) : 0;
      if (quantityDiff > availableInCase) {
        setCurrentEditError(`No hay suficientes unidades disponibles en el case. Máximo a añadir: ${availableInCase.toFixed(3)}.`);
        return;
      }
    }
    
    const maxAllowedForThisLineBasedOnSAP = Number.parseFloat(material.MENGE) + oldQuantityNum;
     if (newQuantityNum > maxAllowedForThisLineBasedOnSAP) {
         setCurrentEditError(`La cantidad (${newQuantityNum.toFixed(3)}) excede el total solicitado para este material (${maxAllowedForThisLineBasedOnSAP.toFixed(3)}).`);
         return;
    }

    setIsSavingEdit(true)
    setTimeout(() => {
      onSaveEdit(itemToEdit.id, currentEditQuantity)
    }, 800) 
  }
  
  const calculateDisplayValues = () => {
    if (!itemToEdit || !reservaData) return { displayAvailableInCase: "N/A", displayTotalSolicitado: "N/A" };

    const material = reservaData.MATERIALES.find(m => m.MATNR === itemToEdit.materialCode);
    if (!material) return { displayAvailableInCase: "N/A", displayTotalSolicitado: "N/A" };
    
    const caseItem = material.CASES.find(c => c.CASE === itemToEdit.case && c.UBICACION === itemToEdit.location);
    const availableInCase = caseItem ? Number.parseFloat(caseItem.CANTIDAD) : 0;
    const currentItemQuantity = Number.parseFloat(itemToEdit.quantity);
    
    const totalSolicitadoAprox = Number.parseFloat(material.MENGE) + currentItemQuantity;

    return {
      displayAvailableInCase: availableInCase.toFixed(3),
      displayTotalSolicitado: totalSolicitadoAprox.toFixed(3)
    };
  }

  const { displayAvailableInCase, displayTotalSolicitado } = calculateDisplayValues();

  const getSaveButtonTitle = () => {
    if (!canModificar) return "No tiene permisos para guardar cambios";
    if (!currentEditQuantity || Number.parseFloat(currentEditQuantity) <= 0) return "Ingrese una cantidad válida mayor a cero"; // Updated condition
    if (isSavingEdit) return "Guardando...";
    return "Guardar Cambios";
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn" onClick={!isSavingEdit ? onClose : undefined} style={{ userSelect: "none" }}></div>
      <div className="relative w-full max-w-md bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col z-[110] animate-scaleIn">
        <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Modificar Cantidad</h2>
          <button onClick={!isSavingEdit ? onClose : undefined} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Cerrar" disabled={isSavingEdit}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
        {itemToEdit && (
          <div className="p-4 sm:p-6">
            <div className="mb-5 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Material:</p><p className="font-medium text-gray-800 dark:text-white">{itemToEdit.material}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Ubicación:</p><p className="font-medium text-gray-800 dark:text-white">{itemToEdit.location}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Case:</p><p className="font-medium text-gray-800 dark:text-white">{itemToEdit.case}</p></div>
                <div><p className="text-xs text-gray-500 dark:text-gray-400">Cant. Actual:</p><p className="font-bold text-primary">{itemToEdit.quantity}</p></div>
              </div>
              {reservaData && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Disponible Adicional en Case:</p>
                  <p className="font-medium text-green-600 dark:text-green-400">{displayAvailableInCase}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Solicitado para Material (aprox.):</p>
                  <p className="font-medium text-blue-600 dark:text-blue-400">{displayTotalSolicitado}</p>
                </div>
              )}
            </div>
            <div className="mb-5">
              <label htmlFor="editQuantityModal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nueva Cantidad</label>
              <div className="relative">
                <input ref={editQuantityInputRef} type="number" id="editQuantityModal" min="0" value={currentEditQuantity}
                  onChange={(e) => setCurrentEditQuantity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                  disabled={isSavingEdit || !canModificar} />
              </div>
              {currentEditError && <p className="mt-2 text-sm text-danger animate-in fade-in slide-in-from-top-5 duration-300">{currentEditError}</p>}
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={!isSavingEdit ? onClose : undefined} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" disabled={isSavingEdit}>Cancelar</button>
              <button 
                type="button" 
                onClick={handleInternalSave} 
                disabled={!currentEditQuantity || Number.parseFloat(currentEditQuantity) < 0 || isSavingEdit || !canModificar} // Ensure quantity is not empty and not negative for disabling
                title={getSaveButtonTitle()}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:hover:shadow-sm disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSavingEdit ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    <span>Guardar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditPickingItemModal
