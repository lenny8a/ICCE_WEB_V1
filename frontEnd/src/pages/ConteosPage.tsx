"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { useToast } from "../hooks/useToast"
import ToastContainer from "../components/ToastContainer"
import { useForm } from "react-hook-form" 
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import { useDeviceDetect } from "../hooks/use-device-detect"
import "../css/conteosStyles.css"; 
import ConteoSearchForm from "../components/Conteos/ConteoSearchForm";
import ConteoDetails from "../components/Conteos/ConteoDetails"; 
import MaterialTabs from "../components/Conteos/MaterialTabs";
import MaterialCardList from "../components/Conteos/MaterialCardList";
import ConteoRegistrationModal, { ConteoMaterialData } from "../components/Conteos/ConteoRegistrationModal";
import ProcessedCasesModal from "../components/Conteos/ProcessedCasesModal";
import ConfirmProcessModal from "../components/Conteos/ConfirmProcessModal"; 

import {
  AlertCircle,
  ArrowLeft,
  Clipboard, 
  ClipboardCheck, 
  Edit2, 
  Eye, 
  Filter, 
  Loader2,
  Package, 
  Plus, 
  RefreshCw,
  Save,
  Trash2, 
  X, 
  BarChart4,
  MapPin, 
} from "lucide-react"

import { useAuth } from "../context/AuthContext"

export interface Case {
  CASE: string
  WERKS: string
  LGORT: string
  UBICACION: string
  CANTIDAD: string
  EXCEP: string
}

export interface Material {
  MATNR: string
  MAKTX: string
  MENGE: string
  MEINS: string
  CASES: Case[]
}

export interface Conteo {
  IBLNR: string
  WERKS: string
  LGORT: string
  BLDAT: string
  USNAM: string
  XBLNI: string
  MATERIALES: Material[]
  estado?: string
}

export interface ConteoCase { 
  case: string
  ubicacion: string
  cantidad: string
  estado: "pendiente" | "registrado"
  excepcion: string
  color?: "red" | "green"
  werks?: string
  lgort?: string
  diferencia?: number 
}

export interface ConteoFormValues {
  conteo: string;
}


const ConteosPage: React.FC = () => {
  const { isHandheld } = useDeviceDetect()
  const { reset: resetMainForm } = useForm(); 

  const [isSearching, setIsSearching] = useState(false)
  const [conteoData, setConteoData] = useState<Conteo | null>(null)
  const [procesados, setProcesados] = useState<Material[]>([])
  const [showConteo, setShowConteo] = useState(false)
  
  const [isConteoModalOpen, setIsConteoModalOpen] = useState(false) 
  const [selectedMaterialForModal, setSelectedMaterialForModal] = useState<Material | null>(null) 
  const [initialConteoMaterialData, setInitialConteoMaterialData] = useState<ConteoMaterialData>({
    ubicacion: "", case: "", cantidad: "", excepcion: "00",
    casesRegistrados: [], casesPendientes: [],
  });

  const [isSavingModalData, setIsSavingModalData] = useState(false); 
  const [isSavingGlobal, setIsSavingGlobal] = useState(false)
  const { toasts, removeToast, success, error } = useToast()
  const { checkPermission } = useAuth()
  const [materialCasesMap, setMaterialCasesMap] = useState<Record<string, ConteoCase[]>>({})
  
  const [materialForProcessedCasesModal, setMaterialForProcessedCasesModal] = useState<Material | null>(null); 
  const [isViewProcessedModalOpen, setIsViewProcessedModalOpen] = useState(false); 
  
  const [activeTab, setActiveTab] = useState<"pending" | "processed">("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPendingMaterials, setFilteredPendingMaterials] = useState<Material[]>([])
  const [filteredProcessedMaterials, setFilteredProcessedMaterials] = useState<Material[]>([])
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isProcessingDocument, setIsProcessingDocument] = useState(false) 
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean
    message: string
    position: { top: number; left: number }
  }>({
    visible: false,
    message: "",
    position: { top: 0, left: 0 },
  })

  const canView = checkPermission("/cont/conteos", "visualizar")
  const canModify = checkPermission("/cont/conteos", "modificar")
  const canProcess = checkPermission("/cont/conteos", "contabilizar")

  useEffect(() => {
    if (!conteoData) return
    const pendingMaterials = conteoData.MATERIALES
      ? conteoData.MATERIALES.filter((m) => !procesados.some((p) => p.MATNR === m.MATNR))
      : []
    if (searchTerm.trim() === "") {
      setFilteredPendingMaterials(pendingMaterials)
      setFilteredProcessedMaterials(procesados)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredPendingMaterials(
        pendingMaterials.filter((m) => m.MATNR.toLowerCase().includes(term) || m.MAKTX.toLowerCase().includes(term)),
      )
      setFilteredProcessedMaterials(
        procesados.filter((m) => m.MATNR.toLowerCase().includes(term) || m.MAKTX.toLowerCase().includes(term)),
      )
    }
  }, [conteoData, procesados, searchTerm])

  useEffect(() => {
    if (!canView) {
      error("No tienes permisos para acceder a esta página")
    }
  }, [canView, error])

  const handleSearch = async (formData: ConteoFormValues) => { 
    if (!canView) { error("No tienes permisos para ver documentos de inventario"); return; }
    setIsSearching(true); setShowConteo(false); setConteoData(null);
    setProcesados([]); setMaterialCasesMap({}); 
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cont/conteo`, { conteo: formData.conteo })
      let dataToProcess = response.data
      if (Array.isArray(dataToProcess) && dataToProcess.length > 0) dataToProcess = dataToProcess[0]
      if (dataToProcess) {
        if (!dataToProcess.MATERIALES) dataToProcess.MATERIALES = []
        setConteoData(dataToProcess) 
        
        let dbData = null
        try {
          const dbResponse = await axios.post(`${import.meta.env.VITE_API_URL}/cont/get-conteo-db`, { conteo: formData.conteo })
          if (dbResponse.data && dbResponse.status === 200) dbData = dbResponse.data
        } catch (dbError) { console.log("No se encontró el conteo en la BD (normal si es nuevo)", dbError); }

        if (dbData && dbData.estado) {
          setConteoData(currentData => currentData ? { ...currentData, estado: dbData.estado } : null);
        }

        const materialesProcesadosDb: Material[] = []
        const casesMapDb: Record<string, ConteoCase[]> = {}
        if (dbData && dbData.materiales && dbData.materiales.length > 0) {
          dbData.materiales.forEach((materialDb: any) => {
            const materialOriginal = (dataToProcess.MATERIALES as Material[]).find((m: Material) => m.MATNR === materialDb.MATNR)
            if (materialOriginal) {
              materialesProcesadosDb.push(materialOriginal)
              if (materialDb.casesRegistrados && materialDb.casesRegistrados.length > 0) {
                casesMapDb[materialDb.MATNR] = materialDb.casesRegistrados.map((c: any) => ({
                  case: c.case, ubicacion: c.ubicacion, cantidad: c.cantidad,
                  estado: "registrado", excepcion: c.excepcion || "00",
                  color: c.diferencia === 0 ? "green" : "red",
                  werks: c.werks || dataToProcess.WERKS, lgort: c.lgort || dataToProcess.LGORT,
                  diferencia: c.diferencia,
                }))
              } else { casesMapDb[materialDb.MATNR] = [] }
            }
          })
        }
        setProcesados(materialesProcesadosDb);
        setMaterialCasesMap(casesMapDb);
        setActiveTab(materialesProcesadosDb.length > 0 ? "processed" : "pending");
        success(materialesProcesadosDb.length > 0 ? `Conteo cargado con ${materialesProcesadosDb.length} materiales procesados.` : "Conteo cargado.");

      } else { error(`No se encontró el documento de inventario.`); }
    } catch (error_er) {
      error(`Error al buscar documento: ${error_er instanceof Error ? error_er.message : String(error_er)}`);
      setConteoData(null);
    } finally {
      setIsSearching(false); setShowConteo(true);
    }
  }
  
  const openConteoModal = (material: Material) => {
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") {
      error(`No se pueden realizar modificaciones. El conteo está en estado: ${conteoData.estado}`); return;
    }
    if (!canModify) { error("No tienes permisos para modificar."); return; }

    setSelectedMaterialForModal(material);
    
    const initialCasesRegistrados = materialCasesMap[material.MATNR] || [];
    const initialCasesPendientes = material.CASES
      .filter(c => !initialCasesRegistrados.some(rc => rc.case.replace(/^0+/, "") === c.CASE.replace(/^0+/, "")))
      .map(c => ({
        case: c.CASE, ubicacion: c.UBICACION, cantidad: "", estado: "pendiente" as "pendiente",
        excepcion: c.EXCEP || "00", werks: conteoData?.WERKS || "", lgort: conteoData?.LGORT || ""
      }));

    setInitialConteoMaterialData({
      ubicacion: "", case: "", cantidad: "", excepcion: "00",
      casesRegistrados: initialCasesRegistrados,
      casesPendientes: initialCasesPendientes,
    });
    setIsConteoModalOpen(true);
  };

  const closeConteoModal = () => {
    setIsConteoModalOpen(false);
    setSelectedMaterialForModal(null);
  };

  const handleSaveConteoFromModal = (updatedConteoMaterialData: ConteoMaterialData) => {
    if (!selectedMaterialForModal) return; 
    setIsSavingModalData(true);
    
    if (!procesados.some(m => m.MATNR === selectedMaterialForModal.MATNR)) {
      setProcesados(prev => [...prev, selectedMaterialForModal]);
    }
    
    setMaterialCasesMap(prevMap => ({
      ...prevMap,
      [selectedMaterialForModal.MATNR]: updatedConteoMaterialData.casesRegistrados,
    }));

    success(`Conteo para material ${selectedMaterialForModal.MATNR} guardado.`);
    setIsSavingModalData(false);
    closeConteoModal();
  };

  const handleNewSearch = () => {
    setConteoData(null); setShowConteo(false); resetMainForm({ conteo: "" }); 
    setProcesados([]); setMaterialCasesMap({}); setActiveTab("pending"); setSearchTerm("");
  }
  
  const handleEditProcessedCase = (caseItem: ConteoCase, material: Material | null) => {
    if (!material) return;
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") {
      error(`No se pueden realizar modificaciones. El conteo está en estado: ${conteoData.estado}`); return;
    }
    if (!canModify) { error("No tienes permisos para modificar."); return; }
    
    closeViewProcessedCasesModal(); 
    setSelectedMaterialForModal(material); 

    const currentRegisteredCases = materialCasesMap[material.MATNR] || [];
    const otherRegisteredCases = currentRegisteredCases.filter(c => c.case.replace(/^0+/, "") !== caseItem.case.replace(/^0+/, ""));
    
    const pendingCases: ConteoCase[] = material.CASES.filter(
      (c_1) => !currentRegisteredCases.some((rc) => rc.case.replace(/^0+/, "") === c_1.CASE.replace(/^0+/, "")) || 
              (c_1.CASE.replace(/^0+/, "") === caseItem.case.replace(/^0+/, "")) 
    ).map((c_2) => ({
      case: c_2.CASE, ubicacion: c_2.UBICACION, cantidad: "", estado: "pendiente",
      excepcion: c_2.EXCEP || "00", werks: conteoData?.WERKS || "", lgort: conteoData?.LGORT || ""
    }));

    setInitialConteoMaterialData({
      ubicacion: caseItem.ubicacion, 
      case: caseItem.case,
      cantidad: caseItem.cantidad,
      excepcion: caseItem.excepcion,
      casesRegistrados: otherRegisteredCases, 
      casesPendientes: pendingCases,
    });
    setIsConteoModalOpen(true); 
  }

  const procesarConteo = () => {
    if (procesados.length === 0) { error("No hay materiales procesados para procesar"); return; }
    if (conteoData?.estado === "procesado") { error("Este conteo ya ha sido procesado."); return; }
    if (!canProcess) { error("No tienes permisos para procesar."); return; }
    setIsProcessModalOpen(true);
  }

  const handleConfirmProcess = async () => {
    if (!canProcess) { error("No tienes permisos para procesar."); setIsProcessModalOpen(false); return; }
    setIsProcessingDocument(true);
    try {
      if (procesados.length === 0) { error("No hay materiales procesados."); setIsProcessModalOpen(false); setIsProcessingDocument(false); return; }
      const dataToSave = { conteoData, materialCasesMap, usuarioCreador: "usuario_actual", estado: "procesado" };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cont/save-conteo`, dataToSave);
      if (response.status === 200 || response.status === 201) {
        const conteoId = response.data.conteo?._id || response.data.conteo?.id;
        if (conteoId) {
          const processResponse = await axios.post(`${import.meta.env.VITE_API_URL}/cont/procesar-conteo`, { conteoId, usuarioProcesador: "usuario_actual" });
          if (processResponse.status !== 200) console.warn("Conteo guardado pero problema al procesar.");
        }
        setConteoData((prevData) => prevData ? { ...prevData, estado: "procesado" } : null);
        success("Conteo procesado correctamente. Estado: procesado");
      } else {
        error("Error al procesar el conteo");
      }
    } catch (err) {
      error("Error al procesar el conteo: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessingDocument(false); setIsProcessModalOpen(false);
    }
  }
  
  const closeProcessModal = () => setIsProcessModalOpen(false);

  const viewProcessedCases = (material: Material) => {
    const casesList = materialCasesMap[material.MATNR];
    if (!casesList || casesList.length === 0) {
      error(`No hay cases registrados para el material ${material.MATNR}`); return;
    }
    setMaterialForProcessedCasesModal(material); 
    setIsViewProcessedModalOpen(true); 
    document.body.style.overflow = "hidden";
  }

  const closeViewProcessedCasesModal = () => {
    setIsViewProcessedModalOpen(false); 
    setMaterialForProcessedCasesModal(null); 
    document.body.style.overflow = "auto";
  }

  const deleteMaterialProcessing = (material: Material) => {
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") {
      error(`No se pueden realizar modificaciones. El conteo está en estado: ${conteoData.estado}`); return;
    }
    if (!canModify) { error("No tienes permisos para eliminar materiales."); return; }
    setProcesados((prev) => prev.filter((m) => m.MATNR !== material.MATNR));
    setMaterialCasesMap((prev) => { const newMap = { ...prev }; delete newMap[material.MATNR]; return newMap; });
    success(`Material ${material.MATNR} eliminado de procesados`);
  }

  const handleSaveAllToDB = async () => {
    if (procesados.length === 0) { error("No hay materiales procesados para guardar"); return; }
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") {
      error(`No se pueden realizar modificaciones. El conteo está en estado: ${conteoData.estado}`); return;
    }
    if (!canModify) { error("No tienes permisos para guardar."); return; }
    setIsSavingGlobal(true);
    try {
      const dataToSave = { conteoData, materialCasesMap, usuarioCreador: "usuario_actual" };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cont/save-conteo`, dataToSave);
      if (response.status === 200 || response.status === 201) {
        setConteoData((prevData) => prevData ? { ...prevData, estado: "pendiente" } : null);
        success("Conteo guardado correctamente. Estado: pendiente");
      } else {
        error("Error al guardar el conteo");
      }
    } catch (err) {
      error("Error al guardar el conteo: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSavingGlobal(false);
    }
  }

  const handleStateClick = (e: React.MouseEvent, caseItem: ConteoCase) => {
    e.stopPropagation();
    if (caseItem.diferencia === undefined) return;
    let message = caseItem.diferencia === 0 ? "La cantidad coincide." : 
                  caseItem.diferencia > 0 ? `Sobra: ${caseItem.diferencia}` : `Falta: ${Math.abs(caseItem.diferencia)}`;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipInfo({ visible: true, message, position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX }});
    setTimeout(() => setTooltipInfo((prev) => ({ ...prev, visible: false })), 3000);
  }
  
  const getSaveAllButtonTitle = () => {
    if (!canModify) return "No tiene permisos para guardar";
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") return "Conteo ya procesado/contabilizado";
    if (procesados.length === 0) return "No hay materiales procesados para guardar";
    return "Guardar conteo actual en base de datos";
  };

  const getProcesarButtonTitle = () => {
    if (!canProcess) return "No tiene permisos para procesar";
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") return "Conteo ya procesado/contabilizado";
    if (procesados.length === 0 && conteoData?.estado !== 'pendiente') return "Guarde el conteo con al menos un material procesado antes de contabilizar";
    if (procesados.length === 0 && conteoData?.estado === 'pendiente' && materialCasesMap && Object.keys(materialCasesMap).length === 0) return "No hay conteos guardados para procesar";
    return "Procesar y finalizar conteo";
  };


  return (
    <>
      <Breadcrumb pageName="Documentos de Inventario" />
      <div className="grid grid-cols-1 gap-4 mt-4">
        <ConteoSearchForm onSearch={handleSearch} isSearching={isSearching} />

        {isSearching && !conteoData && (
          <div className="flex flex-col items-center justify-center p-10 mt-6 rounded-xl border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
            <Loader2 size={48} className="animate-spin text-primary mb-4" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              Buscando documento...
            </p>
          </div>
        )}

        {!isSearching && conteoData && showConteo && (
          <div 
            className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-boxdark overflow-hidden transition-all duration-300 animate-fadeIn ${isHandheld ? "handheld-container" : ""}`}
          >
            <div className={`${isHandheld ? "p-2 sm:p-3" : "p-4 sm:p-6"}`}>
              <ConteoDetails 
                conteoData={conteoData} 
                isHandheld={isHandheld} 
              />
              
              <div
                className={`flex ${isHandheld ? "flex-col handheld-flex-col gap-1 handheld-gap-1" : "flex-col sm:flex-row"} items-start sm:items-center gap-2 w-full sm:w-auto mb-6`}
              >
                <button 
                  onClick={handleSaveAllToDB} 
                  disabled={ isSavingGlobal || procesados.length === 0 || conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado" || !canModify } 
                  title={getSaveAllButtonTitle()}
                  className={`bg-blue-500 text-white ${isHandheld ? "px-3 py-1.5 handheld-py-1 handheld-px-2 handheld-text-xs" : "px-4 py-2"} rounded-md text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-blue-600 transition-all duration-300 font-medium disabled:opacity-75 disabled:cursor-not-allowed`}
                >
                  {isSavingGlobal ? ( <> <Loader2 size={isHandheld ? 14 : 16} className="animate-spin" /> <span>Guardando...</span> </>
                  ) : ( <> <Save size={isHandheld ? 14 : 16} /> <span>Guardar en BD</span> </>
                  )}
                </button>
                <button 
                  onClick={procesarConteo} 
                  disabled={ isProcessingDocument || conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado" || !canProcess || (procesados.length === 0 && (!materialCasesMap || Object.keys(materialCasesMap).length === 0)) } 
                  title={getProcesarButtonTitle()}
                  className={`bg-success text-white ${isHandheld ? "px-3 py-1.5 handheld-py-1 handheld-px-2 handheld-text-xs" : "px-4 py-2"} rounded-md text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-success/90 transition-all duration-300 font-medium disabled:opacity-75 disabled:cursor-not-allowed`}
                >
                  {isProcessingDocument ? ( <> <Loader2 size={isHandheld ? 14 : 16} className="animate-spin" /> <span>Procesando...</span> </>
                  ) : ( <> <BarChart4 size={isHandheld ? 14 : 16} /> <span>Procesar Conteo</span> </>
                  )}
                </button>
                <button onClick={handleNewSearch} className={`bg-primary text-white ${isHandheld ? "px-3 py-1.5 handheld-py-1 handheld-px-2 handheld-text-xs" : "px-4 py-2"} rounded-md text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-300 font-medium`}>
                  <RefreshCw size={isHandheld ? 14 : 16} />
                  <span>Nueva búsqueda</span>
                </button>
              </div>
              
              <MaterialTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                pendingCount={(conteoData?.MATERIALES?.length || 0) - procesados.length}
                processedCount={procesados.length}
                isHandheld={isHandheld}
              />

              {activeTab === "pending" ? (
                <div className={`space-y-2 ${isHandheld ? "max-h-[50vh] handheld-max-h-60vh" : "max-h-[60vh]"} overflow-y-auto custom-scrollbar pr-1`}>
                  {filteredPendingMaterials.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                      <Clipboard size={isHandheld ? 20 : 24} className="text-gray-400 mb-2" />
                      <p className={`text-gray-500 dark:text-gray-400 ${isHandheld ? "text-xs handheld-text-xs" : ""}`}>{searchTerm ? "No se encontraron materiales con ese término" : "No hay materiales pendientes por procesar"}</p>
                    </div>
                  ) : (
                    <MaterialCardList materials={filteredPendingMaterials} type="pending" onOpenConteoModal={openConteoModal} isHandheld={isHandheld} canModify={canModify} conteoStatus={conteoData?.estado} />
                  )}
                </div>
              ) : (
                <div className={`space-y-2 ${isHandheld ? "max-h-[50vh] handheld-max-h-60vh" : "max-h-[60vh]"} overflow-y-auto custom-scrollbar pr-1`}>
                  {filteredProcessedMaterials.length === 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                      <ClipboardCheck size={isHandheld ? 20 : 24} className="text-gray-400 mb-2" />
                      <p className={`text-gray-500 dark:text-gray-400 ${isHandheld ? "text-xs handheld-text-xs" : ""}`}>{searchTerm ? "No se encontraron materiales con ese término" : "No hay materiales procesados"}</p>
                    </div>
                  ) : (
                     <MaterialCardList materials={filteredProcessedMaterials} type="processed" onModifyMaterial={handleEditProcessedCase} onViewProcessedCases={viewProcessedCases} onDeleteMaterialProcessing={deleteMaterialProcessing} isHandheld={isHandheld} canModify={canModify} conteoStatus={conteoData?.estado} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {isConteoModalOpen && selectedMaterialForModal && conteoData && (
        <ConteoRegistrationModal
          isOpen={isConteoModalOpen}
          onClose={closeConteoModal}
          selectedMaterial={selectedMaterialForModal}
          conteoData={conteoData}
          initialConteoMaterial={initialConteoMaterialData}
          onSave={handleSaveConteoFromModal}
          isSaving={isSavingModalData}
          canModify={canModify}
          isHandheld={isHandheld}
        />
      )}

      <ProcessedCasesModal
        isOpen={isViewProcessedModalOpen}
        onClose={closeViewProcessedCasesModal}
        viewingMaterial={materialForProcessedCasesModal}
        processedCases={materialForProcessedCasesModal ? materialCasesMap[materialForProcessedCasesModal.MATNR] || [] : []}
        onEditProcessedCase={handleEditProcessedCase}
        onCaseStateClick={handleStateClick}
        isHandheld={isHandheld}
        canModify={canModify}
        conteoStatus={conteoData?.estado}
      />
      
      <ConfirmProcessModal
        isOpen={isProcessModalOpen}
        onClose={closeProcessModal}
        onConfirm={handleConfirmProcess}
        isProcessing={isProcessingDocument}
        canProcess={canProcess}
      />

      {tooltipInfo.visible && (
        <div className="fixed z-[9999] bg-gray-800 text-white px-3 py-2 rounded-md shadow-lg text-xs max-w-[250px] animate-fadeIn" style={{ top: `${tooltipInfo.position.top}px`, left: `${tooltipInfo.position.left}px`, transform: "translateX(-50%)", }}>{tooltipInfo.message}</div>
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

export default ConteosPage;
