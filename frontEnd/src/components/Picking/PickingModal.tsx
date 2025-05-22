"use client"

import { useState, useEffect, useRef } from "react"
import {
  MaterialReserva,
  ReservaData,
  CaseReserva,
  RegisteredItem,
  // ExcepcionData, // Not used directly here, but onOpenExcepcionModal needs its type
} from "../../types/picking"

interface PickingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    modalRegisteredItems: RegisteredItem[],
    modalUpdatedCases: CaseReserva[],
    modalRemainingQuantity: string,
  ) => void
  selectedMaterial: MaterialReserva | null
  reservaData: ReservaData | null
  initialRemainingQuantity: string
  initialUpdatedCases: CaseReserva[]
  canModificar: boolean
  removeLeadingZeros: (value: string) => string
  onOpenExcepcionModal: (caseItem: CaseReserva, material: MaterialReserva) => void
  toastError: (message: string) => void
}

const PickingModal = ({
  isOpen,
  onClose,
  onSave,
  selectedMaterial,
  reservaData,
  initialRemainingQuantity,
  initialUpdatedCases,
  canModificar,
  removeLeadingZeros,
  onOpenExcepcionModal,
  toastError,
}: PickingModalProps) => {
  const [localRegisteredItems, setLocalRegisteredItems] = useState<RegisteredItem[]>([])
  const [localUpdatedCases, setLocalUpdatedCases] = useState<CaseReserva[]>([])
  const [localRemainingQuantity, setLocalRemainingQuantity] = useState("")

  const [scannedCase, setScannedCase] = useState("")
  const [quantityToRegister, setQuantityToRegister] = useState("")
  const [scanStep, setScanStep] = useState<"case" | "quantity">("case")
  const [scanError, setScanError] = useState("")
  const [selectedCaseForScan, setSelectedCaseForScan] = useState<CaseReserva | null>(null)
  const [isModalItemsExpanded, setIsModalItemsExpanded] = useState(false)
  const [isSavingModal, setIsSavingModal] = useState(false)

  const caseInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && selectedMaterial) {
      setLocalRemainingQuantity(initialRemainingQuantity)
      // Ensure a deep copy of cases to avoid modifying the parent's state directly
      setLocalUpdatedCases(initialUpdatedCases.map(c => ({...c}))) 
      setLocalRegisteredItems([]) 
      setScannedCase("")
      setQuantityToRegister("")
      setSelectedCaseForScan(null)
      setScanStep("case")
      setScanError("")
      setIsModalItemsExpanded(false)
      setTimeout(() => caseInputRef.current?.focus(), 100)
      document.body.style.overflow = "hidden"
    } else if (!isOpen) { // Ensure this only runs when isOpen becomes false
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen, selectedMaterial, initialRemainingQuantity, initialUpdatedCases])

  const resetScanProcess = () => {
    setScannedCase("")
    setQuantityToRegister("")
    setScanStep("case")
    setScanError("")
    setSelectedCaseForScan(null)
    setTimeout(() => caseInputRef.current?.focus(), 100)
  }

  const handleInternalCaseScan = () => {
    if (!selectedMaterial) return

    const normalizedCase = removeLeadingZeros(scannedCase)
    const foundCase = localUpdatedCases.find(
      (caseItem) => removeLeadingZeros(caseItem.CASE) === normalizedCase && Number.parseInt(caseItem.CANTIDAD) > 0,
    )

    if (!foundCase) {
      setScanError("El case escaneado no existe o no tiene cantidad disponible.")
      return
    }
    setSelectedCaseForScan(foundCase)
    setScanError("")
    setScanStep("quantity")
    setTimeout(() => quantityInputRef.current?.focus(), 100)
  }

  const handleInternalQuantityRegister = () => {
    if (!selectedMaterial || !selectedCaseForScan) return

    const quantity = Number.parseFloat(quantityToRegister)
    const remaining = Number.parseFloat(localRemainingQuantity)
    const caseQuantity = Number.parseFloat(selectedCaseForScan.CANTIDAD)

    if (isNaN(quantity) || quantity <= 0) {
      setScanError("Ingrese una cantidad válida mayor a cero.")
      return
    }
    if (quantity > remaining) {
      setScanError(`La cantidad no puede exceder el total restante (${remaining.toFixed(3)}).`)
      return
    }
    if (quantity > caseQuantity) {
      setScanError(`La cantidad no puede exceder lo disponible en esta ubicación (${caseQuantity.toFixed(3)}).`)
      return
    }

    const existingItemIndex = localRegisteredItems.findIndex(
      (item) => item.case === selectedCaseForScan.CASE && item.location === selectedCaseForScan.UBICACION,
    )

    let newLocalRegisteredItems = [...localRegisteredItems]
    if (existingItemIndex !== -1) {
      const existingItem = newLocalRegisteredItems[existingItemIndex]
      const newQuantity = Number.parseFloat(existingItem.quantity) + quantity
      newLocalRegisteredItems[existingItemIndex] = { ...existingItem, quantity: newQuantity.toString() }
    } else {
      newLocalRegisteredItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        material: selectedMaterial.MATNR,
        materialCode: selectedMaterial.MATNR, 
        materialDesc: selectedMaterial.MAKTX, 
        location: selectedCaseForScan.UBICACION,
        quantity: quantityToRegister,
        case: selectedCaseForScan.CASE,
        werks: selectedCaseForScan.WERKS || reservaData?.WERKS,
        lgort: selectedCaseForScan.LGORT || reservaData?.LGORT,
      })
    }
    setLocalRegisteredItems(newLocalRegisteredItems)

    const updatedCasesList = localUpdatedCases.map((caseItem) =>
      caseItem.CASE === selectedCaseForScan.CASE && caseItem.UBICACION === selectedCaseForScan.UBICACION
        ? { ...caseItem, CANTIDAD: (caseQuantity - quantity).toString() }
        : caseItem,
    )
    setLocalUpdatedCases(updatedCasesList)
    setLocalRemainingQuantity((remaining - quantity).toString())
    resetScanProcess()
  }

  const handleInternalDeleteModalItem = (itemId: string) => {
    const itemToDelete = localRegisteredItems.find((item) => item.id === itemId)
    if (!itemToDelete) return

    const currentRemaining = Number.parseFloat(localRemainingQuantity)
    const itemQuantity = Number.parseFloat(itemToDelete.quantity)
    setLocalRemainingQuantity((currentRemaining + itemQuantity).toString())

    const updatedCasesList = localUpdatedCases.map((caseItem) => {
      if (caseItem.CASE === itemToDelete.case && caseItem.UBICACION === itemToDelete.location) {
        const currentCaseQuantity = Number.parseFloat(caseItem.CANTIDAD)
        return { ...caseItem, CANTIDAD: (currentCaseQuantity + itemQuantity).toString() }
      }
      return caseItem
    })
    setLocalUpdatedCases(updatedCasesList)

    setLocalRegisteredItems(localRegisteredItems.filter((item) => item.id !== itemId))
    if (localRegisteredItems.length === 1) setIsModalItemsExpanded(false) 
  }

  const handleInternalSave = async () => {
    if (!canModificar) {
      toastError("No tiene permisos para guardar cambios")
      return
    }
    if (localRegisteredItems.length === 0) {
      toastError("Debe registrar al menos un item antes de guardar.")
      return;
    }
    setIsSavingModal(true)
    await new Promise(resolve => setTimeout(resolve, 500)); 
    onSave(localRegisteredItems, localUpdatedCases, localRemainingQuantity)
    setIsSavingModal(false)
    // onClose(); // Parent will call onClose from its onSave logic if needed
  }

  const toggleLocalModalItemsExpanded = () => {
    setIsModalItemsExpanded(!isModalItemsExpanded)
  }
  
  const getSaveButtonTitle = () => {
    if (!canModificar) return "No tiene permisos para guardar";
    if (localRegisteredItems.length === 0) return "Debe registrar al menos un item";
    return "Guardar cambios";
  }


  if (!isOpen || !selectedMaterial) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
        onClick={!isSavingModal ? onClose : undefined} // Prevent closing if saving
        style={{ userSelect: "none" }}
      ></div>
      <div className="relative w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-3xl bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col max-h-[90vh] z-[60] animate-scaleIn">
        <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-xl">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary">
                <path d="M20 5H8.5L7 7H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"></path>
                <path d="M9 14v-3"></path><path d="M12 15v-4"></path><path d="M15 16v-5"></path>
              </svg>
              Registro de Picking
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
              {reservaData?.TIPODOC === "02" ? "Orden: " : "Reserva: "}
              {reservaData?.RESERVA} | Material: {selectedMaterial.MATNR}
            </p>
          </div>
          <button onClick={!isSavingModal ? onClose : undefined} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Cerrar" disabled={isSavingModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-5 overflow-y-auto flex-grow">
          <div className="mb-4 sm:mb-5 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-xl flex justify-between items-center shadow-sm animate-fadeIn">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Material: <span className="font-semibold text-gray-800 dark:text-white">{selectedMaterial.MATNR}</span>
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-1">{selectedMaterial.MAKTX}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 dark:text-gray-400">Cantidad pendiente:</span>
              <span className="text-lg sm:text-xl font-bold text-primary">
                {localRemainingQuantity} <span className="text-xs">{selectedMaterial.MEINS}</span>
              </span>
            </div>
          </div>

          <div className="mb-4 sm:mb-5 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white text-base flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-500">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                  <path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>
                </svg>
                Cases Disponibles
              </h3>
              <span className="bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                {localUpdatedCases.filter((c) => Number.parseInt(c.CANTIDAD) > 0).length} cases
              </span>
            </div>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                    <circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
                <input type="text" className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
                  placeholder="Buscar case o ubicación..."
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    document.querySelectorAll("[data-case-row]").forEach(row => {
                      const caseText = row.getAttribute("data-case-text")?.toLowerCase() || "";
                      const locationText = row.getAttribute("data-location-text")?.toLowerCase() || "";
                      if (caseText.includes(searchTerm) || locationText.includes(searchTerm)) {
                        row.classList.remove("hidden");
                      } else {
                        row.classList.add("hidden");
                      }
                    });
                  }} />
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
              <table className="w-full table-auto">
                <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Case</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Centro</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Almacén</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Ubicación</th>
                    <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Cantidad</th>
                    <th className="py-2 px-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 w-20">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {localUpdatedCases.filter(c => Number.parseInt(c.CANTIDAD) > 0).map((caseItem, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      data-case-row data-case-text={removeLeadingZeros(caseItem.CASE)} data-location-text={caseItem.UBICACION}>
                      <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200 font-medium">{removeLeadingZeros(caseItem.CASE)}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200">{caseItem.WERKS}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200">{caseItem.LGORT}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200">{caseItem.UBICACION}</td>
                      <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200 text-right font-semibold">{caseItem.CANTIDAD}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => { setSelectedCaseForScan(caseItem); setScanStep("quantity"); setTimeout(() => quantityInputRef.current?.focus(), 100); }}
                            className="inline-flex items-center justify-center p-1 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors" title="Seleccionar case">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                            </svg>
                          </button>
                          <button onClick={() => onOpenExcepcionModal(caseItem, selectedMaterial)}
                            className="inline-flex items-center justify-center p-1 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors" title="Registrar excepción">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0-3.42 0z"></path>
                              <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-5 sm:mb-6 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm animate-fadeIn">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-white text-base flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary">
                  <path d="M2 9V5c0-1.1.9-2 2-2h4"></path><path d="M9 2h6"></path><path d="M20 9V5c0-1.1-.9-2-2-2h-4"></path>
                  <path d="M5 22h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2z"></path>
                  <path d="M6 18h.01"></path><path d="M10 18h.01"></path><path d="M14 18h.01"></path><path d="M18 18h.01"></path>
                </svg>
                Escanear case
              </h3>
              <button type="button" onClick={resetScanProcess} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg text-xs transition-colors flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path>
                </svg>
                Resetear
              </button>
            </div>
            <div className="space-y-4">
              <div className={`${scanStep !== "case" ? "opacity-50" : ""} transition-opacity duration-300`}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Escanear código de case</label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                        <path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path>
                      </svg>
                    </div>
                    <input ref={caseInputRef} type="text" value={scannedCase} onChange={(e) => setScannedCase(e.target.value)} placeholder="Escanee el código del case"
                      className="w-full rounded-l-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-800 outline-none transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                      disabled={scanStep !== "case"} onKeyDown={(e) => e.key === "Enter" && handleInternalCaseScan()} />
                  </div>
                  <button type="button" onClick={handleInternalCaseScan} disabled={scanStep !== "case" || !scannedCase}
                    className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 transition-all duration-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                    </svg>
                    Verificar
                  </button>
                </div>
              </div>
              <div className={`${scanStep !== "quantity" ? "opacity-50" : ""} transition-opacity duration-300`}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cantidad a registrar</label>
                {selectedCaseForScan && (
                  <div className="mb-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-md inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                    </svg>
                    Case: <span className="font-semibold ml-1">{removeLeadingZeros(selectedCaseForScan.CASE)}</span> |
                    Ubicación: <span className="font-semibold ml-1">{selectedCaseForScan.UBICACION}</span> | Disponible: <span className="font-semibold ml-1">{selectedCaseForScan.CANTIDAD}</span>
                  </div>
                )}
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <line x1="12" x2="12" y1="8" y2="16"></line><line x1="8" x2="16" y1="12" y2="12"></line>
                      </svg>
                    </div>
                    <input ref={quantityInputRef} type="number" min="1" value={quantityToRegister} onChange={(e) => setQuantityToRegister(e.target.value)} placeholder="Ingrese la cantidad"
                      className="w-full rounded-l-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                      disabled={scanStep !== "quantity"} onKeyDown={(e) => e.key === "Enter" && handleInternalQuantityRegister()} />
                  </div>
                  <button type="button" onClick={handleInternalQuantityRegister} disabled={scanStep !== "quantity" || !quantityToRegister}
                    className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 transition-all duration-300 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path><path d="M12 5v14"></path>
                    </svg>
                    Registrar
                  </button>
                </div>
              </div>
              {scanError && (
                <div className="mt-2 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm animate-in fade-in slide-in-from-top-5 duration-300">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line>
                    </svg>
                    {scanError}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mb-5 sm:mb-6 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm animate-fadeIn">
            <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 cursor-pointer" onClick={toggleLocalModalItemsExpanded}>
              <h3 className="font-semibold text-gray-800 dark:text-white text-base flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary">
                  <path d="M20 5H8.5L7 7H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"></path>
                  <path d="M9 14v-3"></path><path d="M12 15v-4"></path><path d="M15 16v-5"></path>
                </svg>
                Elementos Registrados <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">{localRegisteredItems.length}</span>
              </h3>
              <button type="button" className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-all duration-300" aria-label={isModalItemsExpanded ? "Contraer" : "Expandir"}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-primary transition-transform duration-500 ${isModalItemsExpanded ? "rotate-180" : ""}`}>
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>
            <div className={`transition-all duration-500 ease-in-out ${isModalItemsExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}>
              {localRegisteredItems.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">No hay elementos registrados</div>
              ) : (
                <div className="p-4 space-y-2">
                  {localRegisteredItems.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 hover:shadow-sm transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-5" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{item.material}</p>
                          <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                            <p className="text-gray-600 dark:text-gray-400"><span className="text-xs text-gray-500 dark:text-gray-500">Ubicación:</span> {item.location}</p>
                            <p className="text-gray-600 dark:text-gray-400"><span className="text-xs text-gray-500 dark:text-gray-500">Case:</span> {item.case}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 px-3 py-1 rounded-full"><p className="font-bold text-primary">{item.quantity}</p></div>
                          <button onClick={() => handleInternalDeleteModalItem(item.id)} className="text-danger hover:text-danger/80 p-1 rounded-full hover:bg-danger/10 transition-colors" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancelar</button>
            <button 
              type="button" 
              onClick={handleInternalSave} 
              disabled={localRegisteredItems.length === 0 || isSavingModal || !canModificar}
              title={getSaveButtonTitle()}
              className="px-5 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:hover:shadow-sm disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSavingModal ? (
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
      </div>
    </div>
  )
}

export default PickingModal

[end of frontEnd/src/components/Picking/PickingModal.tsx]
