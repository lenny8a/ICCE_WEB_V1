"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import ReservaSearchForm from "../components/Picking/ReservaSearchForm"
import ReservaDetails from "../components/Picking/ReservaDetails"
import PickingModal from "../components/Picking/PickingModal" 
import EditPickingItemModal from "../components/Picking/EditPickingItemModal"
import ExceptionModal from "../components/Picking/ExceptionModal"
import axios from "axios"
import { useToast } from "../hooks/useToast"
import ToastContainer from "../components/ToastContainer"
import { useAuth } from "../context/AuthContext"
import {
  ReservaData,
  MaterialReserva,
  RegisteredItem,
  PickingResponse,
  CaseReserva,
  ExcepcionData as ExcepcionDataType, 
} from "../../types/picking"

const PickingPage = () => { 
  const { reset } = useForm()
  const { toasts, removeToast, success, error } = useToast()

  const [reservaData, setReservaData] = useState<ReservaData | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialReserva | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false) 
  const [processingComplete, setProcessingComplete] = useState(false)

  const [modalRemainingQuantity, setModalRemainingQuantity] = useState("")
  const [modalUpdatedCases, setModalUpdatedCases] = useState<CaseReserva[]>([])
  
  const [allRegisteredItems, setAllRegisteredItems] = useState<RegisteredItem[]>([])
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<RegisteredItem | null>(null)
  
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false) 
  const [isSaving, setIsSaving] = useState(false)   
  const [isEditing, setIsEditing] = useState(false) 
  const [showReserva, setShowReserva] = useState(false)
  const [isPickingExpanded, setIsPickingExpanded] = useState(false)
  
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isReservaProcessed, setIsReservaProcessed] = useState(false)
  const [processedPickingData, setProcessedPickingData] = useState<PickingResponse["data"] | null>(null)

  const [excepciones, setExcepciones] = useState<ExcepcionDataType[]>([])
  const [isLoadingExcepciones, setIsLoadingExcepciones] = useState(false)
  const [isExcepcionModalOpen, setIsExcepcionModalOpen] = useState(false)
  const [selectedExcepcionCase, setSelectedExcepcionCase] = useState<CaseReserva | null>(null)

  interface ReservaForm {
    reserva: string
  }

  const { checkPermission } = useAuth()
  const canModificar = checkPermission("/salida/picking", "modificar")
  const api_url = import.meta.env.VITE_API_URL

  const removeLeadingZeros = (value: string): string => value.replace(/^0+/, "")

  const fetchExcepciones = async () => {
    setIsLoadingExcepciones(true)
    try {
      const response = await axios.get(`${api_url}/api/excepciones`)
      if (response.data.success) {
        const excepcionesActivas = response.data.data.filter((exc: ExcepcionDataType) => exc.active && exc.id !== "00")
        setExcepciones(excepcionesActivas)
      } else {
        console.error("Error al cargar excepciones:", response.data.message)
        setExcepciones([{ _id: "default", id: "00", name: "Sin problemas", active: true }])
      }
    } catch (err) {
      console.error("Error al cargar excepciones:", err)
      setExcepciones([{ _id: "default", id: "00", name: "Sin problemas", active: true }])
    } finally {
      setIsLoadingExcepciones(false)
    }
  }

  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
    `;
    document.head.appendChild(styleElement);
    fetchExcepciones();
    return () => {
      document.head.removeChild(styleElement);
      document.body.style.overflow = "auto"; 
    };
  }, []);

  function processNumericValues(data: any): ReservaData {
    if (!data) return { RESERVA: "", MATERIALES: [] }
    const processedData: ReservaData = {
      RESERVA: data.RESERVA || "",
      MATERIALES: [],
      TIPODOC: data.TIPODOC || "",
      WERKS: data.WERKS || "",
      LGORT: data.LGORT || "",
    }
    if (data.MATERIALES && Array.isArray(data.MATERIALES)) {
      processedData.MATERIALES = data.MATERIALES.map(
        (material: any) => {
          const processedMaterial: MaterialReserva = {
            MATNR: material.MATNR || "",
            MAKTX: material.MAKTX || "",
            MENGE: material.MENGE ? String(Number.parseFloat(material.MENGE) || 0) : "0",
            MEINS: material.MEINS || "",
            CASES: [],
          }
          if (material.CASES && Array.isArray(material.CASES)) {
            processedMaterial.CASES = material.CASES.map(
              (caseItem: any) => ({
                CASE: caseItem.CASE || "",
                UBICACION: caseItem.UBICACION || "",
                CANTIDAD: caseItem.CANTIDAD ? String(Number.parseFloat(caseItem.CANTIDAD) || 0) : "0",
                WERKS: caseItem.WERKS || "",
                LGORT: caseItem.LGORT || "",
              }),
            )
          }
          return processedMaterial
        },
      )
    }
    return processedData
  }

  async function handleSearch(formData: ReservaForm) {
    setIsSearching(true); setShowReserva(false); setNotification(null);
    setAllRegisteredItems([]); setIsReservaProcessed(false); setProcessingComplete(false);
    setReservaData(null); // Clear previous reserva data immediately
    try {
      const response = await axios.post(`${api_url}/salida/reserva`, { reserva: formData.reserva })
      let dataToProcess = response.data
      if (Array.isArray(dataToProcess) && dataToProcess.length > 0) dataToProcess = dataToProcess[0]
      const processedData = processNumericValues(dataToProcess)
      setReservaData(processedData) // Set new data

      const pickingStatus = await axios.get(`${api_url}/salida/picking/${formData.reserva}`)
      if (pickingStatus.data.success && pickingStatus.data.data) {
        const pickingData = pickingStatus.data.data
        setProcessedPickingData(pickingData)
        const isCompleted = pickingData.status === "completed" || pickingData.status === "accounted"
        setProcessingComplete(isCompleted)
        setIsReservaProcessed(isCompleted)
        setNotification({ type: "success", message: isCompleted ? `Este ${processedData?.TIPODOC === "02" ? "orden" : "reserva"} ya ha sido procesado.` : `Esta ${processedData?.TIPODOC === "02" ? "orden" : "reserva"} está pendiente.`})
        if (pickingData.items) {
          const items = pickingData.items.map((item: any) => ({ ...item, id: `${Date.now()}-${Math.random().toString(36).substring(2,9)}` }))
          setAllRegisteredItems(items)
            if (processedData && processedData.MATERIALES) {
              const updatedMaterialesPicking = [...processedData.MATERIALES];
              items.forEach((item: RegisteredItem) => {
                const matIdx = updatedMaterialesPicking.findIndex(m => m.MATNR === item.materialCode);
                if (matIdx !== -1) {
                  const mat = updatedMaterialesPicking[matIdx];
                  updatedMaterialesPicking[matIdx].MENGE = (Number.parseFloat(mat.MENGE) - Number.parseFloat(item.quantity)).toString();
                  const caseIdx = mat.CASES.findIndex(c => c.CASE === item.case && c.UBICACION === item.location);
                  if (caseIdx !== -1) {
                    updatedMaterialesPicking[matIdx].CASES[caseIdx].CANTIDAD = (Number.parseFloat(mat.CASES[caseIdx].CANTIDAD) - Number.parseFloat(item.quantity)).toString();
                  }
                }
              });
              // Ensure we update the state based on the new processedData, not a stale closure
              setReservaData(currentReservaData => currentReservaData ? {...currentReservaData, MATERIALES: updatedMaterialesPicking} : null );
            }
        }
      }
    } catch (err) {
      error("Error al buscar el documento.")
      setReservaData(null) // Clear data on error
    } finally {
      setIsSearching(false)
      setShowReserva(true)
    }
  }

  const handleProcessReserva = async () => {
    if (!reservaData || !allRegisteredItems.length) return
    setIsProcessing(true)
    const isComplete = reservaData.MATERIALES.every(m => Number.parseInt(m.MENGE) === 0);
    const dataToSave = {
        reserva: reservaData.RESERVA,
        items: allRegisteredItems.map(item => ({...item, werks: item.werks || reservaData.WERKS, lgort: item.lgort || reservaData.LGORT })),
        status: isComplete ? "completed" : "pending",
        tipodoc: reservaData.TIPODOC,
    };
    try {
        const response = await axios.post(`${api_url}/salida/picking`, dataToSave);
        setNotification({ type: "success", message: `Reserva ${isComplete ? 'procesada' : 'guardada como pendiente'}.` });
        setProcessingComplete(isComplete);
        setIsReservaProcessed(isComplete);
        if(response.data.data) setProcessedPickingData(response.data.data);
    } catch (err) {
        setNotification({ type: "error", message: "Error al procesar la reserva." });
    } finally {
        setIsProcessing(false);
    }
  }

  const openMaterialModal = (material: MaterialReserva) => {
    if (!canModificar) { error("No tiene permisos."); return; }
    if (!material.CASES.some(c => Number.parseInt(c.CANTIDAD) > 0)) {
        setNotification({ type: "error", message: "No hay cases disponibles." });
        return;
    }
    setSelectedMaterial(material)
    setModalRemainingQuantity(material.MENGE) 
    setModalUpdatedCases([...material.CASES])   
    setIsModalOpen(true)
  }

  const closeModal = () => { 
    setIsModalOpen(false)
    setSelectedMaterial(null) 
  }
  
  const handleModalSave = (modalRegItems: RegisteredItem[], modalUpdCases: CaseReserva[], modalRemQty: string) => {
    if (!reservaData || !selectedMaterial) return;
    setIsSaving(true);

    const updatedMainMateriales = reservaData.MATERIALES.map(mat => 
      mat.MATNR === selectedMaterial.MATNR 
        ? { ...mat, MENGE: modalRemQty, CASES: modalUpdCases } 
        : mat
    );
    
    setReservaData(prev => ({ ...prev!, MATERIALES: updatedMainMateriales }));

    let currentAllRegItems = [...allRegisteredItems];
    modalRegItems.forEach(modalItem => {
        const existingItemIndex = currentAllRegItems.findIndex(
          (item) =>
            item.materialCode === modalItem.materialCode &&
            item.location === modalItem.location &&
            item.case === modalItem.case,
        );

        if (existingItemIndex !== -1) {
            const existingItem = currentAllRegItems[existingItemIndex];
            const newQuantity = Number.parseFloat(existingItem.quantity) + Number.parseFloat(modalItem.quantity);
            currentAllRegItems[existingItemIndex] = { ...existingItem, quantity: newQuantity.toString() };
        } else {
            currentAllRegItems.push(modalItem);
        }
    });
    setAllRegisteredItems(currentAllRegItems.filter(item => Number.parseFloat(item.quantity) > 0));
    
    setIsSaving(false);
    closeModal();
  };

  const handleNewSearch = () => {
    setReservaData(null); setShowReserva(false); reset(); setProcessingComplete(false);
    setAllRegisteredItems([]); setNotification(null);
    setTimeout(() => document.getElementById("reserva")?.focus(), 100);
  }

  const handleDeleteMainItem = (itemId: string) => {
    if (!canModificar) { error("No tiene permisos."); return; }
    const itemToDelete = allRegisteredItems.find(item => item.id === itemId);
    if (!itemToDelete || !reservaData) return;

    const matIdx = reservaData.MATERIALES.findIndex(m => m.MATNR === itemToDelete.materialCode);
    if (matIdx === -1) return;

    const newAllItems = allRegisteredItems.filter(item => item.id !== itemId);
    setAllRegisteredItems(newAllItems);

    const mat = reservaData.MATERIALES[matIdx];
    const itemQty = Number.parseFloat(itemToDelete.quantity);
    const newMatMenge = (Number.parseFloat(mat.MENGE) + itemQty).toString();
    
    const newCases = mat.CASES.map(c => {
      if (c.CASE === itemToDelete.case && c.UBICACION === itemToDelete.location) {
        return { ...c, CANTIDAD: (Number.parseFloat(c.CANTIDAD) + itemQty).toString() };
      }
      return c;
    });
    
    const updatedMateriales = [...reservaData.MATERIALES];
    updatedMateriales[matIdx] = { ...mat, MENGE: newMatMenge, CASES: newCases };
    setReservaData(prev => ({ ...prev!, MATERIALES: updatedMateriales }));

    if (newAllItems.length === 0) setIsPickingExpanded(false);
  }

  const openEditModal = (item: RegisteredItem) => {
    if (!canModificar) { error("No tiene permisos para modificar."); return; }
    setItemToEdit(item);
    setIsEditModalOpen(true);
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setItemToEdit(null);
  }

  const handleSaveEditCallback = (itemId: string, newQuantityValue: string) => {
    const itemToUpdate = allRegisteredItems.find((item) => item.id === itemId)
    if (!itemToUpdate || !reservaData) {
      error("Error al guardar la edición: Item o datos de reserva no encontrados.")
      setIsEditing(false) 
      return
    }
    setIsEditing(true)

    const newQuantityNum = Number.parseFloat(newQuantityValue)
    const oldQuantityNum = Number.parseFloat(itemToUpdate.quantity)
    const quantityDiff = newQuantityNum - oldQuantityNum

    const materialIndex = reservaData.MATERIALES.findIndex((m) => m.MATNR === itemToUpdate.materialCode)
    if (materialIndex === -1) {
      error("Error interno: Material del item no encontrado.")
      setIsEditing(false)
      return
    }

    const materialToUpdateInReserva = { ...reservaData.MATERIALES[materialIndex] }
    let caseToUpdateInMaterial = null
    let caseIndexInMaterial = -1

    if (materialToUpdateInReserva.CASES) {
      caseIndexInMaterial = materialToUpdateInReserva.CASES.findIndex(
        (c) => c.CASE === itemToUpdate.case && c.UBICACION === itemToUpdate.location,
      )
      if (caseIndexInMaterial !== -1) {
        caseToUpdateInMaterial = { ...materialToUpdateInReserva.CASES[caseIndexInMaterial] }
      }
    }
    
    if (quantityDiff > 0 && caseToUpdateInMaterial) {
        const availableInCase = Number.parseFloat(caseToUpdateInMaterial.CANTIDAD);
        if (quantityDiff > availableInCase) {
            error(`No hay suficientes unidades disponibles en el case. Máximo a añadir: ${availableInCase.toFixed(3)}.`);
            setIsEditing(false);
            return;
        }
    }
    const originalSolicitedForLine = Number.parseFloat(materialToUpdateInReserva.MENGE) + oldQuantityNum;
    if (newQuantityNum > originalSolicitedForLine && newQuantityNum !== 0) { 
        error(`La cantidad (${newQuantityNum.toFixed(3)}) excede el total solicitado originalmente para este material (${originalSolicitedForLine.toFixed(3)}).`);
        setIsEditing(false);
        return;
    }

    const updatedAllRegItems = allRegisteredItems
      .map((item) => item.id === itemId ? { ...item, quantity: newQuantityValue } : item)
      .filter(item => Number.parseFloat(item.quantity) > 0); 
    setAllRegisteredItems(updatedAllRegItems);

    const newReservaData = { ...reservaData }
    const newMateriales = [...newReservaData.MATERIALES]
    const targetMaterial = { ...newMateriales[materialIndex] }

    targetMaterial.MENGE = (Number.parseFloat(targetMaterial.MENGE) - quantityDiff).toString()

    if (caseToUpdateInMaterial && caseIndexInMaterial !== -1) {
      targetMaterial.CASES = [...targetMaterial.CASES] 
      targetMaterial.CASES[caseIndexInMaterial] = {
        ...caseToUpdateInMaterial,
        CANTIDAD: (Number.parseFloat(caseToUpdateInMaterial.CANTIDAD) - quantityDiff).toString(),
      }
    }
    
    newMateriales[materialIndex] = targetMaterial
    newReservaData.MATERIALES = newMateriales
    setReservaData(newReservaData)

    success("Cantidad del item actualizada correctamente.")
    setIsEditing(false) 
    closeEditModal() 
  };
  
  const togglePickingExpanded = () => setIsPickingExpanded(!isPickingExpanded);

  const openExcepcionModalWithMaterial = (caseItem: CaseReserva, materialContext: MaterialReserva) => {
    if (!canModificar) { error("No tiene permisos."); return; }
    setSelectedMaterial(materialContext); 
    setSelectedExcepcionCase(caseItem);
    setIsExcepcionModalOpen(true);
  };

  const closeExcepcionModal = () => {
    setIsExcepcionModalOpen(false);
    setSelectedExcepcionCase(null);
  };

  const handleExcepcionSelect = async (excepcion: ExcepcionDataType) => {
    if (!selectedExcepcionCase || !selectedMaterial) return;
    setIsLoading(true); 
    const excepcionData = {
      embal: removeLeadingZeros(selectedExcepcionCase.CASE),
      zexcu_wms: excepcion.id, zexde_wms: excepcion.name,
      matnr: selectedMaterial.MATNR, maktx: selectedMaterial.MAKTX,
      ubicacion: selectedExcepcionCase.UBICACION,
    };
    try {
      const response = await axios.post(`${api_url}/entr/excepcion`, excepcionData);
      if (response.data.CODE) {
         if (isModalOpen && selectedMaterial) { 
            setModalUpdatedCases(prevCases => prevCases.filter(c => !(c.CASE === selectedExcepcionCase.CASE && c.UBICACION === selectedExcepcionCase.UBICACION)));
         }
         if (reservaData && selectedMaterial) { 
            const matIdx = reservaData.MATERIALES.findIndex(m => m.MATNR === selectedMaterial.MATNR);
            if (matIdx !== -1) {
                const newMateriales = [...reservaData.MATERIALES];
                const currentMaterial = {...newMateriales[matIdx]};
                currentMaterial.CASES = currentMaterial.CASES.filter(c => !(c.CASE === selectedExcepcionCase.CASE && c.UBICACION === selectedExcepcionCase.UBICACION));
                
                const caseQty = Number.parseFloat(selectedExcepcionCase.CANTIDAD);
                if (!isNaN(caseQty)) { 
                    currentMaterial.MENGE = (Number.parseFloat(currentMaterial.MENGE) - caseQty).toString();
                }
                newMateriales[matIdx] = currentMaterial;
                setReservaData(prev => ({...prev!, MATERIALES: newMateriales}));
                if (isModalOpen && selectedMaterial.MATNR === currentMaterial.MATNR) {
                    setSelectedMaterial(currentMaterial); 
                    setModalRemainingQuantity(currentMaterial.MENGE); 
                }
            }
         }
        success(`Excepción "${excepcion.name}" registrada.`);
      } else {
        throw new Error(response.data.message || "Error al registrar excepción");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      error(`Error al registrar excepción: ${errorMsg}`);
    } finally {
      setIsLoading(false);
      closeExcepcionModal();
    }
  };

  const isHandheld = typeof window !== "undefined" && window.innerWidth <= 480 && window.innerHeight <= 800;

  return (
    <>
      <Breadcrumb pageName="Picking" />
      <div className={`container mx-auto p-${isHandheld ? "2" : "4"} ${isHandheld ? "max-w-full text-sm" : "max-w-7xl"}`}>
        <ReservaSearchForm
          onSearch={handleSearch}
          isSearching={isSearching}
          isProcessingComplete={processingComplete}
        />
        {reservaData && showReserva && (
          <ReservaDetails
            reservaData={reservaData}
            isReservaProcessed={isReservaProcessed}
            processedPickingData={processedPickingData}
            processingComplete={processingComplete}
            isProcessing={isProcessing}
            canModificar={canModificar}
            notification={notification}
            allRegisteredItems={allRegisteredItems}
            isPickingExpanded={isPickingExpanded}
            onNewSearch={handleNewSearch}
            onProcessReserva={handleProcessReserva}
            onOpenMaterialModal={openMaterialModal}
            onOpenEditModal={openEditModal}
            onDeleteMainItem={handleDeleteMainItem}
            onTogglePickingExpanded={togglePickingExpanded}
            onError={error}
            isSearching={isSearching} // Pass isSearching prop
          />
        )}
         {/* Show skeleton or message when isSearching and no reservaData yet */}
         {isSearching && !reservaData && (
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
        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {isModalOpen && selectedMaterial && (
        <PickingModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={handleModalSave}
          selectedMaterial={selectedMaterial}
          reservaData={reservaData}
          initialRemainingQuantity={modalRemainingQuantity}
          initialUpdatedCases={modalUpdatedCases}
          canModificar={canModificar}
          removeLeadingZeros={removeLeadingZeros}
          onOpenExcepcionModal={openExcepcionModalWithMaterial} 
          toastError={error}
        />
      )}

      <EditPickingItemModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        itemToEdit={itemToEdit}
        reservaData={reservaData}
        onSaveEdit={handleSaveEditCallback}
        canModificar={canModificar}
      />

      <ExceptionModal
        isOpen={isExcepcionModalOpen}
        onClose={closeExcepcionModal}
        selectedExcepcionCase={selectedExcepcionCase}
        selectedMaterial={selectedMaterial} 
        excepciones={excepciones}
        isLoadingExcepciones={isLoadingExcepciones}
        onConfirmExcepcion={handleExcepcionSelect} 
        isLoadingConfirm={isLoading} 
        removeLeadingZeros={removeLeadingZeros}
      />
    </>
  )
}

export default PickingPage; 

[end of frontEnd/src/pages/PickingPage.tsx]
