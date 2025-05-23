"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clipboard,
  ClipboardCheck,
  Edit2,
  FileText,
  Filter,
  Loader2,
  MapPin,
  Package,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react"
import { Material, Conteo } from "../../pages/ConteosPage" 
import { ConteoCase, ConteoMaterialData } from "../../types/conteos"; 

interface ConteoRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  selectedMaterial: Material | null
  conteoData: Conteo | null 
  initialConteoMaterial: ConteoMaterialData
  onSave: (updatedConteoMaterialData: ConteoMaterialData) => void
  isSaving: boolean 
  canModify: boolean
  isHandheld: boolean
}

const ConteoRegistrationModal: React.FC<ConteoRegistrationModalProps> = ({
  isOpen,
  onClose,
  selectedMaterial,
  conteoData,
  initialConteoMaterial,
  onSave,
  isSaving,
  canModify,
  isHandheld,
}) => {
  const {
    register: registerConteo,
    handleSubmit: handleSubmitConteo,
    reset: resetConteoForm,
    setValue: setValueConteoForm,
    watch: watchConteoForm,
    formState: { errors: errorsConteoForm },
  } = useForm({
    defaultValues: {
      ubicacion: initialConteoMaterial?.ubicacion || "",
      case: initialConteoMaterial?.case || "",
      cantidad: initialConteoMaterial?.cantidad || "",
      excepcion: initialConteoMaterial?.excepcion || "00",
    },
  })

  const ubicacionRef = useRef<HTMLInputElement>(null)
  const caseRef = useRef<HTMLInputElement>(null)
  const cantidadRef = useRef<HTMLInputElement>(null)

  const [currentConteoMaterialData, setCurrentConteoMaterialData] = useState<ConteoMaterialData>(initialConteoMaterial);
  const [editingCase, setEditingCase] = useState<ConteoCase | null>(null)
  const [ubicacionError, setUbicacionError] = useState<string | null>(null)
  const [caseError, setCaseError] = useState<string | null>(null)
  const [combinationError, setCombinationError] = useState<string | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<"available" | "processed">("available")
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; message: string; position: { top: number; left: number } }>({ visible: false, message: "", position: { top: 0, left: 0 } });

  useEffect(() => {
    if (isOpen) {
      const deepCopiedInitialData = JSON.parse(JSON.stringify(initialConteoMaterial));
      setCurrentConteoMaterialData(deepCopiedInitialData);

      const isEditingExisting = 
        deepCopiedInitialData.case && 
        deepCopiedInitialData.ubicacion &&
        deepCopiedInitialData.casesRegistrados.some(
          (c: ConteoCase) => removeLeadingZeros(c.case) === removeLeadingZeros(deepCopiedInitialData.case) && c.ubicacion === deepCopiedInitialData.ubicacion
        );

      if (isEditingExisting) {
        const caseToEdit = deepCopiedInitialData.casesRegistrados.find(
            (c: ConteoCase) => removeLeadingZeros(c.case) === removeLeadingZeros(deepCopiedInitialData.case) && c.ubicacion === deepCopiedInitialData.ubicacion
        );
        setEditingCase(caseToEdit || null);
        resetConteoForm({ 
            ubicacion: deepCopiedInitialData.ubicacion, 
            case: deepCopiedInitialData.case, 
            cantidad: deepCopiedInitialData.cantidad, 
            excepcion: deepCopiedInitialData.excepcion || "00" 
        });
      } else {
         resetConteoForm({ ubicacion: "", case: "", cantidad: "", excepcion: "00" });
         setEditingCase(null);
      }
      setUbicacionError(null);
      setCaseError(null);
      setCombinationError(null);
      setActiveModalTab("available");
      document.body.style.overflow = "hidden";
      setTimeout(() => ubicacionRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, initialConteoMaterial, resetConteoForm]);
  
  const ubicacionValue = watchConteoForm("ubicacion")
  const caseValue = watchConteoForm("case")

  useEffect(() => {
    if (ubicacionValue && caseValue && !editingCase) {
      validateCaseUbicacionCombination(caseValue, ubicacionValue);
    }
  }, [ubicacionValue, caseValue, editingCase]);


  const registerWithRefModal = (name: "ubicacion" | "case" | "cantidad" | "excepcion", options: any, ref: React.RefObject<HTMLInputElement>) => {
    return {
      ...registerConteo(name, options),
      ref: (e: HTMLInputElement) => {
        registerConteo(name).ref(e);
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = e;
      },
    };
  };
  
  const removeLeadingZeros = (value: string): string => value.replace(/^0+/, "");


  const validateUbicacion = (ubicacion: string): boolean => {
    if (!selectedMaterial) return false;
    const ubicacionExists = selectedMaterial.CASES.some((c) => c.UBICACION === ubicacion);
    if (!ubicacionExists) {
      setUbicacionError(`La ubicación ${ubicacion} no existe para este material.`);
      return false;
    }
    setUbicacionError(null);
    return true;
  };

  const validateCase = (caseVal: string): boolean => {
    if (!selectedMaterial) return false;
    if (!caseVal || caseVal.trim() === "") {
      setCaseError("El case no puede estar vacío.");
      return false;
    }
    const normalizedCase = removeLeadingZeros(caseVal);
    const foundCase = selectedMaterial.CASES.find((c) => removeLeadingZeros(c.CASE) === normalizedCase);
    if (!foundCase) {
      setCaseError(`El case ${caseVal} no existe para este material.`);
      return false;
    }
    if (foundCase.EXCEP) setValueConteoForm("excepcion", foundCase.EXCEP);
    setCaseError(null);
    return true;
  };

  const validateCaseUbicacionCombination = (caseVal: string, ubicacionVal: string): boolean => {
    if (!selectedMaterial || !caseVal || !ubicacionVal) return false;
    const normalizedCase = removeLeadingZeros(caseVal);
    const foundCase = selectedMaterial.CASES.find((c) => removeLeadingZeros(c.CASE) === normalizedCase);
    if (!foundCase) { setCombinationError(null); return false; } 
    if (foundCase.UBICACION !== ubicacionVal) {
      setCombinationError(`El case ${caseVal} no corresponde a la ubicación ${ubicacionVal}. Ubicación correcta: ${foundCase.UBICACION}.`);
      return false;
    }
    setCombinationError(null);
    return true;
  };

  const handleInternalConteoSubmit = (data: any) => {
    const normalizedCase = removeLeadingZeros(data.case);
    data.case = normalizedCase;

    if (!validateCase(data.case) || !validateUbicacion(data.ubicacion) || !validateCaseUbicacionCombination(data.case, data.ubicacion)) {
      return;
    }
    if (!editingCase && currentConteoMaterialData.casesRegistrados.some(c => removeLeadingZeros(c.case) === normalizedCase)) {
      setCaseError(`El case ${data.case} ya ha sido registrado.`); return;
    }

    const originalCaseData = selectedMaterial?.CASES.find(c => removeLeadingZeros(c.CASE) === normalizedCase);
    if (!originalCaseData) { return; } 

    const enteredQuantity = Number.parseFloat(data.cantidad);
    const originalQuantity = Number.parseFloat(originalCaseData.CANTIDAD.trim());
    const quantityDifference = enteredQuantity - originalQuantity;
    const stateColor = enteredQuantity === originalQuantity ? "green" : "red";

    const newRegisteredCase: ConteoCase = {
      case: data.case, ubicacion: data.ubicacion, cantidad: data.cantidad, estado: "registrado",
      excepcion: data.excepcion || originalCaseData.EXCEP || "00", color: stateColor,
      werks: conteoData?.WERKS || "", lgort: conteoData?.LGORT || "", diferencia: quantityDifference,
    };

    setCurrentConteoMaterialData(prev => {
      let updatedRegisteredCases;
      if (editingCase) {
        updatedRegisteredCases = prev.casesRegistrados.map(c => removeLeadingZeros(c.case) === removeLeadingZeros(editingCase.case) && c.ubicacion === editingCase.ubicacion ? newRegisteredCase : c);
      } else {
        updatedRegisteredCases = [...prev.casesRegistrados, newRegisteredCase];
      }
      return {
        ...prev,
        casesRegistrados: updatedRegisteredCases.sort((a,b) => a.case.localeCompare(b.case)),
        casesPendientes: prev.casesPendientes.filter(c => removeLeadingZeros(c.case) !== normalizedCase),
      };
    });

    setEditingCase(null);
    resetConteoForm({ ubicacion: "", case: "", cantidad: "", excepcion: "00" });
    setUbicacionError(null); setCaseError(null); setCombinationError(null);
    setTimeout(() => ubicacionRef.current?.focus(), 100);
  };

  const handleInternalEditCase = (caseItem: ConteoCase) => {
    setEditingCase(caseItem);
    resetConteoForm({
      ubicacion: caseItem.ubicacion, case: caseItem.case,
      cantidad: caseItem.cantidad, excepcion: caseItem.excepcion,
    });
    setUbicacionError(null); setCaseError(null); setCombinationError(null);
    setActiveModalTab("processed"); 
    setTimeout(() => ubicacionRef.current?.focus(), 100);
  };

  const handleInternalCancelEdit = () => {
    setEditingCase(null);
    resetConteoForm({ ubicacion: "", case: "", cantidad: "", excepcion: "00" });
    setUbicacionError(null); setCaseError(null); setCombinationError(null);
  };

  const handleInternalDeleteCase = (caseItem: ConteoCase) => {
    if (!canModify) { alert("No tiene permisos para eliminar."); return; }
    const originalCaseData = selectedMaterial?.CASES.find(c => removeLeadingZeros(c.CASE) === removeLeadingZeros(caseItem.case) && c.UBICACION === caseItem.ubicacion);
    
    setCurrentConteoMaterialData(prev => {
      const updatedRegistered = prev.casesRegistrados.filter(c => !(removeLeadingZeros(c.case) === removeLeadingZeros(caseItem.case) && c.ubicacion === caseItem.ubicacion));
      let updatedPendientes = [...prev.casesPendientes];
      if(originalCaseData && !updatedPendientes.some(p => removeLeadingZeros(p.case) === removeLeadingZeros(originalCaseData.CASE) && p.ubicacion === originalCaseData.UBICACION)){
        updatedPendientes.push({
            case: originalCaseData.CASE, ubicacion: originalCaseData.UBICACION, cantidad: "", estado: "pendiente",
            excepcion: originalCaseData.EXCEP || "00", werks: conteoData?.WERKS || "", lgort: conteoData?.LGORT || "",
        });
      }
      return {
        ...prev,
        casesRegistrados: updatedRegistered,
        casesPendientes: updatedPendientes.sort((a,b) => a.case.localeCompare(b.case)),
      };
    });
    if(editingCase && removeLeadingZeros(editingCase.case) === removeLeadingZeros(caseItem.case) && editingCase.ubicacion === caseItem.ubicacion){
        handleInternalCancelEdit();
    }
  };
  
  const handleInternalSaveModal = () => {
    if (!canModify) { alert("No tiene permisos para guardar."); return; }
    if (currentConteoMaterialData.casesRegistrados.length === 0 && !editingCase) { 
      alert("Debe registrar al menos un case antes de guardar."); return;
    }
    onSave(currentConteoMaterialData);
  };

  const handleStateClick = (e: React.MouseEvent, caseItem: ConteoCase) => {
    e.stopPropagation();
    if (caseItem.diferencia === undefined) return;
    let message = caseItem.diferencia === 0 ? "La cantidad coincide." : 
                  caseItem.diferencia > 0 ? `Sobra: ${caseItem.diferencia}` : `Falta: ${Math.abs(caseItem.diferencia)}`;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipInfo({ visible: true, message, position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX }});
    setTimeout(() => setTooltipInfo((prev) => ({ ...prev, visible: false })), 3000);
  }

  const getSaveButtonTitle = () => {
    if (!canModify) return "No tiene permisos para guardar";
    if (currentConteoMaterialData.casesRegistrados.length === 0 && !editingCase) return "Debe registrar al menos un case";
    if (isSaving) return "Guardando...";
    return "Guardar Conteo de Material";
  };

  const commonTabStyles = `text-sm rounded-t-lg transition-colors flex items-center gap-2 border-b-2 ${isHandheld ? "py-1.5 px-3 handheld-py-1 handheld-px-2 handheld-text-xs" : "py-2 px-4"}`;
  const activeTabStyles = "bg-white dark:bg-boxdark border-primary text-primary font-semibold";
  const inactiveTabStyles = "border-transparent text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:border-primary/30";


  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden ${isHandheld ? "p-1" : "p-2 sm:p-4"} pt-16 ml-0 lg:ml-72.5 touch-none`}>
      <div className="fixed inset-0 bg-black/50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn" onClick={!isSaving ? onClose : undefined} style={{ userSelect: "none" }}></div>
      <div className={`relative w-full ${isHandheld ? "max-w-full handheld-modal" : "max-w-3xl"} bg-white dark:bg-boxdark rounded-lg shadow-lg transform transition-all mx-auto flex flex-col max-h-[90vh] z-[110] animate-scaleIn`}>
        <div className={`sticky top-0 z-10 flex justify-between items-center ${isHandheld ? "px-3 py-2 handheld-modal-header" : "px-4 sm:px-6 py-3"} border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-lg`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center ${isHandheld ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-primary/10 text-primary`}><Package size={isHandheld ? 16 : 18} /></div>
            <div>
              <h2 className={`${isHandheld ? "text-base handheld-text-base" : "text-lg"} font-medium text-gray-800 dark:text-white flex items-center gap-2`}>
                <span>Registrar Conteo</span>
                <span className={`${isHandheld ? "text-[10px] handheld-text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"} bg-primary/10 text-primary rounded-full`}>{conteoData?.IBLNR}</span>
              </h2>
              <p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-500 dark:text-gray-400 truncate max-w-[200px] xs:max-w-[250px] sm:max-w-xs md:max-w-sm lg:max-w-md`}>
                {selectedMaterial?.MATNR} - {selectedMaterial?.MAKTX}
              </p>
            </div>
          </div>
          <button onClick={!isSaving ? onClose : undefined} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Cerrar" disabled={isSaving}><X size={isHandheld ? 16 : 18} /></button>
        </div>
        <div className={`${isHandheld ? "p-3 handheld-modal-content" : "p-4 sm:p-6"} overflow-y-auto flex-grow custom-scrollbar`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
            <button onClick={() => setActiveModalTab("available")} className={`${commonTabStyles} ${activeModalTab === "available" ? activeTabStyles : inactiveTabStyles}`}>
              <Clipboard size={isHandheld ? 14 : 16} />Cases Disponibles
              <span className={`inline-flex items-center justify-center ${isHandheld ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"} font-medium rounded-full ${activeModalTab === 'available' ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{currentConteoMaterialData.casesPendientes.length}</span>
            </button>
            <button onClick={() => setActiveModalTab("processed")} className={`${commonTabStyles} ${activeModalTab === "processed" ? activeTabStyles : inactiveTabStyles}`}>
              <ClipboardCheck size={isHandheld ? 14 : 16} />Cases Registrados
              <span className={`inline-flex items-center justify-center ${isHandheld ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"} font-medium rounded-full ${activeModalTab === 'processed' ? 'bg-primary/10 text-primary' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{currentConteoMaterialData.casesRegistrados.length}</span>
            </button>
          </div>
          <div className={`mb-4 sm:mb-6 bg-gray-50 dark:bg-gray-800/30 ${isHandheld ? "p-3 handheld-p-2" : "p-5"} rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm`}>
            <h3 className={`${isHandheld ? "text-sm handheld-text-sm" : "text-base"} font-medium text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2`}>
              {editingCase ? <Edit2 size={isHandheld ? 14 : 16} /> : <Plus size={isHandheld ? 14 : 16} />}
              {editingCase ? "Editar Case" : "Registrar Nuevo Case"}
            </h3>
            <form onSubmit={handleSubmitConteo(handleInternalConteoSubmit)} className={`mb-2 ${isHandheld ? "handheld-compact-form" : ""}`}>
              <div className={`grid grid-cols-1 ${isHandheld ? "sm:grid-cols-1 gap-3 handheld-gap-1" : "sm:grid-cols-2 gap-4"} mb-3`}>
                <div>
                  <label htmlFor="modal_ubicacion" className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-700 dark:text-white mb-1.5 flex items-center gap-1`}><MapPin size={isHandheld ? 12 : 14} />Ubicación</label>
                  <div className="relative"><input id="modal_ubicacion" type="text" className={`w-full rounded-md border ${ubicacionError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary focus:ring-primary"} bg-white ${isHandheld ? "py-1.5 handheld-py-1 text-sm handheld-text-xs" : "py-2"} px-3 text-gray-800 outline-none transition focus:ring-1 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white`} placeholder="Ingrese ubicación" {...registerWithRefModal("ubicacion", { required: "La ubicación es obligatoria" }, ubicacionRef)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); caseRef.current?.focus(); } }} /></div>
                  {ubicacionError && <p className={`mt-1 ${isHandheld ? "text-[10px] handheld-text-xs" : "text-xs"} text-red-500 flex items-center gap-1`}><AlertCircle size={isHandheld ? 10 : 12} />{ubicacionError}</p>}
                </div>
                <div>
                  <label htmlFor="modal_case" className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-700 dark:text-white mb-1.5 flex items-center gap-1`}><Package size={isHandheld ? 12 : 14} />Case</label>
                  <div className="relative"><input id="modal_case" type="text" className={`w-full rounded-md border ${caseError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary focus:ring-primary"} bg-white ${isHandheld ? "py-1.5 handheld-py-1 text-sm handheld-text-xs" : "py-2"} px-3 text-gray-800 outline-none transition focus:ring-1 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white`} placeholder="Ingrese case" {...registerWithRefModal("case", { required: "El case es obligatorio" }, caseRef)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); cantidadRef.current?.focus(); } }} onChange={(e) => setValueConteoForm('case', e.target.value, { shouldValidate: true })} /></div>
                  {caseError && <p className={`mt-1 ${isHandheld ? "text-[10px] handheld-text-xs" : "text-xs"} text-red-500 flex items-center gap-1`}><AlertCircle size={isHandheld ? 10 : 12} />{caseError}</p>}
                </div>
              </div>
              {combinationError && <div className="mb-3"><p className={`${isHandheld ? "text-xs handheld-text-xs p-2" : "text-sm p-3"} text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800 flex items-start gap-2`}><AlertCircle size={isHandheld ? 14 : 16} className="mt-0.5 flex-shrink-0" /><span>{combinationError}</span></p></div>}
              <div className={`grid grid-cols-1 ${isHandheld ? "sm:grid-cols-1 gap-3 handheld-gap-1" : "sm:grid-cols-2 gap-4"} mb-3`}>
                <div>
                  <label htmlFor="modal_cantidad" className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-700 dark:text-white mb-1.5 flex items-center gap-1`}><Filter size={isHandheld ? 12 : 14} />Cantidad</label>
                  <div className="relative"><input id="modal_cantidad" type="number" className={`w-full rounded-md border ${errorsConteoForm.cantidad ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary focus:ring-primary"} bg-white ${isHandheld ? "py-1.5 handheld-py-1 text-sm handheld-text-xs" : "py-2"} px-3 text-gray-800 outline-none transition focus:ring-1 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white`} placeholder="Ingrese cantidad" {...registerWithRefModal("cantidad", { required: "La cantidad es obligatoria", valueAsNumber: true, validate: value => !isNaN(value) && Number.isFinite(value) && value >= 0 || "Cantidad inválida" }, cantidadRef)} /></div>
                  {errorsConteoForm.cantidad && <p className={`mt-1 ${isHandheld ? "text-[10px] handheld-text-xs" : "text-xs"} text-red-500 flex items-center gap-1`}><AlertCircle size={isHandheld ? 10 : 12} />{errorsConteoForm.cantidad.message}</p>}
                </div>
                <div>
                  <label htmlFor="modal_excepcion" className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-700 dark:text-white mb-1.5 flex items-center gap-1`}><AlertCircle size={isHandheld ? 12 : 14} />Excepción</label>
                  <input id="modal_excepcion" type="text" className={`w-full rounded-md border border-gray-300 bg-gray-100 ${isHandheld ? "py-1.5 handheld-py-1 text-sm handheld-text-xs" : "py-2"} px-3 text-gray-800 outline-none transition disabled:cursor-default dark:border-gray-600 dark:bg-gray-700 dark:text-white`} placeholder="Código de excepción" {...registerConteo("excepcion")} defaultValue="00" readOnly />
                </div>
              </div>
              <div className={`flex gap-3 ${isHandheld ? "mt-3" : "mt-4"}`}>
                {editingCase && <button type="button" onClick={handleInternalCancelEdit} className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white ${isHandheld ? "py-1.5 handheld-py-1 text-xs handheld-text-xs" : "py-2"} px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 font-medium`}><X size={isHandheld ? 14 : 16} />Cancelar</button>}
                <button type="submit" className={`${editingCase ? "flex-1" : "w-full"} ${editingCase ? "bg-yellow-500 hover:bg-yellow-600" : "bg-primary hover:bg-primary/90"} text-white ${isHandheld ? "py-1.5 handheld-py-1 text-xs handheld-text-xs" : "py-2"} px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-75 disabled:cursor-not-allowed`} disabled={!canModify || isSaving} title={!canModify ? "No tiene permisos" : (editingCase ? "Actualizar conteo del case" : "Registrar nuevo case")}>
                  {editingCase ? <Edit2 size={isHandheld ? 14 : 16} /> : <Plus size={isHandheld ? 14 : 16} />}{editingCase ? "Actualizar" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
          {activeModalTab === "available" ? (
            <div className="mb-4">
              <h3 className={`${isHandheld ? "text-sm handheld-text-sm" : "text-base"} font-medium text-gray-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-2`}><Clipboard size={isHandheld ? 14 : 16} />Cases Disponibles</h3>
              {currentConteoMaterialData.casesPendientes.length > 0 ? (
                <div className={`grid grid-cols-1 ${isHandheld ? "sm:grid-cols-1 gap-2 handheld-gap-1" : "sm:grid-cols-2 gap-2"} max-h-[20vh] sm:max-h-[25vh] overflow-y-auto custom-scrollbar pr-1`}>
                  {currentConteoMaterialData.casesPendientes.map((caseItem, index) => (
                    <div key={caseItem.case + index + '-pending'} className={`bg-white dark:bg-boxdark border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-2 sm:p-3 transition-all duration-300 hover:border-primary/30 hover-card animate-fadeIn`} style={{ animationDelay: `${index * 30}ms` }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5`}><Package size={isHandheld ? 12 : 14} className="text-primary" /><span>Case: {removeLeadingZeros(caseItem.case)}</span></p>
                          <p className={`${isHandheld ? "text-[10px] handheld-text-xs" : "text-xs"} text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1`}><MapPin size={isHandheld ? 10 : 12} /><span>Ubicación: {caseItem.ubicacion}</span></p>
                        </div>
                        {caseItem.excepcion !== "00" && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium badge-yellow">Exc: {caseItem.excepcion}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : ( <div className="text-center py-6 sm:py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"><Clipboard size={isHandheld ? 20 : 24} className="text-gray-400 mb-2" /><p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-500 dark:text-gray-400`}>No hay cases disponibles para este material</p></div>)}
            </div>
          ) : (
            <div className="mb-4">
              <h3 className={`${isHandheld ? "text-sm handheld-text-sm" : "text-base"} font-medium text-gray-800 dark:text-white mb-2 sm:mb-3 flex items-center gap-2`}><ClipboardCheck size={isHandheld ? 14 : 16} />Cases Registrados</h3>
              {currentConteoMaterialData.casesRegistrados.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 max-h-[20vh] sm:max-h-[25vh] custom-scrollbar">
                  <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${isHandheld ? "handheld-compact-table" : ""}`}>
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-1">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Case</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ubicación</th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {currentConteoMaterialData.casesRegistrados.map((caseItem, index) => (
                        <tr key={caseItem.case + index + '-registered'} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => handleInternalEditCase(caseItem)}>
                          <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-800 dark:text-white"><div className="flex items-center gap-1.5"><Package size={isHandheld ? 12 : 14} className="text-primary" />{removeLeadingZeros(caseItem.case)}</div></td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300"><div className="flex items-center gap-1.5"><FileText size={isHandheld ? 12 : 14} className="text-gray-400" />{caseItem.ubicacion}</div></td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-right"><span className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded">{caseItem.cantidad}</span></td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-center">
                            <div className="flex justify-center items-center gap-2">
                              <div onClick={(e) => handleStateClick(e, caseItem)} title={caseItem.diferencia === 0 ? "Cantidad coincide" : `Diferencia: ${caseItem.diferencia}`} className={`w-5 h-5 rounded-full flex items-center justify-center ${caseItem.color === "red" ? "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400"} cursor-pointer hover:ring-1 hover:ring-offset-1 hover:ring-gray-300 transition-all`}>{caseItem.color === "red" ? <AlertCircle size={12} /> : <Check size={12} />}</div>
                              <button type="button" onClick={(e) => { e.stopPropagation(); handleInternalDeleteCase(caseItem); }} title={!canModify ? "No tiene permisos" : "Eliminar case"} className="w-5 h-5 rounded-full bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400 cursor-pointer hover:bg-red-200 dark:hover:bg-red-800/50 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canModify}><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : ( <div className="text-center py-6 sm:py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"><ClipboardCheck size={isHandheld ? 20 : 24} className="text-gray-400 mb-2" /><p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-500 dark:text-gray-400`}>No hay cases registrados para este material</p></div>)}
            </div>
          )}
        </div>
        <div className={`sticky bottom-0 z-10 flex justify-between ${isHandheld ? "px-3 py-2 handheld-modal-footer" : "px-4 sm:px-6 py-3"} border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-b-lg`}>
          <button onClick={onClose} className={`px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md transition-colors flex items-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed`} disabled={isSaving}>
            <ArrowLeft size={16} />
            Volver
          </button>
          <button 
            onClick={handleInternalSaveModal} 
            disabled={isSaving || currentConteoMaterialData.casesRegistrados.length === 0 || !canModify} 
            title={getSaveButtonTitle()}
            className={`px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors flex items-center gap-2 font-medium disabled:opacity-75 disabled:cursor-not-allowed text-sm`}
          >
            {isSaving ? (<><Loader2 size={16} className="animate-spin" /><span>Guardando...</span></>) : (<><Save size={16} />Guardar</>)}
          </button>
        </div>
      </div>
       {tooltipInfo.visible && (
        <div className="fixed z-[9999] bg-gray-800 text-white px-3 py-2 rounded-md shadow-lg text-xs max-w-[250px] animate-fadeIn" style={{ top: `${tooltipInfo.position.top}px`, left: `${tooltipInfo.position.left}px`, transform: "translateX(-50%)", }}>{tooltipInfo.message}</div>
      )}
    </div>
  )
}

export default ConteoRegistrationModal;
