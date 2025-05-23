"use client"

import type React from "react"
import { Material } from "../../pages/ConteosPage" // Adjusted path
import { Package, Plus, Edit2, Eye, Trash2, Check } from "lucide-react"

interface MaterialCardListProps {
  materials: Material[]
  type: "pending" | "processed"
  onOpenConteoModal?: (material: Material) => void
  onModifyMaterial?: (material: Material) => void
  onViewProcessedCases?: (material: Material) => void
  onDeleteMaterialProcessing?: (material: Material) => void
  isHandheld: boolean
  canModify: boolean
  conteoStatus?: string
}

const MaterialCardList: React.FC<MaterialCardListProps> = ({
  materials,
  type,
  onOpenConteoModal,
  onModifyMaterial,
  onViewProcessedCases,
  onDeleteMaterialProcessing,
  isHandheld,
  canModify,
  conteoStatus,
}) => {
  
  const getButtonTitle = (actionType: "Realizar Conteo" | "Modificar Conteo" | "Borrar Procesamiento") => {
    if (!canModify) return "No tiene permisos para esta acción";
    if (conteoStatus === "procesado" || conteoStatus === "contabilizado") {
      return "El conteo ya está procesado/contabilizado y no puede modificarse";
    }
    if (actionType === "Realizar Conteo") return "Iniciar conteo para este material";
    if (actionType === "Modificar Conteo") return "Modificar conteo de este material";
    if (actionType === "Borrar Procesamiento") return "Eliminar procesamiento de este material";
    return "";
  };
  
  const isActionsDisabled = conteoStatus === "procesado" || conteoStatus === "contabilizado" || !canModify;

  return (
    <div
      className={`grid grid-cols-1 ${isHandheld ? "md:grid-cols-1 handheld-grid-cols-1 gap-1 handheld-gap-1" : "md:grid-cols-2 gap-2"}`}
    >
      {materials.map((material, index) => (
        <div
          key={material.MATNR}
          className={`bg-white dark:bg-boxdark border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md animate-slideInRight hover-card ${isHandheld ? "handheld-p-2" : ""}`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div
            className={`${isHandheld ? "p-2 handheld-p-2" : "p-3"} flex flex-col sm:flex-row justify-between items-start sm:items-center ${type === "processed" ? "border-l-4 border-green-500" : "border-l-4 border-primary"}`}
          >
            <div className="flex items-start mb-3 sm:mb-0 gap-3">
              <div
                className={`flex items-center justify-center ${isHandheld ? "w-6 h-6" : "w-8 h-8"} rounded-full ${type === "processed" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-primary/10 text-primary"} flex-shrink-0`}
              >
                {type === "processed" ? <Check size={isHandheld ? 12 : 16} /> : <Package size={isHandheld ? 12 : 16} />}
              </div>
              <div>
                <p
                  className={`font-medium text-gray-800 dark:text-white flex items-center gap-1.5 ${isHandheld ? "text-xs handheld-text-xs" : ""}`}
                >
                  {material.MATNR}
                </p>
                <p
                  className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-600 dark:text-gray-400 line-clamp-1`}
                >
                  {material.MAKTX}
                </p>
              </div>
            </div>

            {type === "pending" && onOpenConteoModal && (
              <button
                onClick={() => onOpenConteoModal(material)}
                disabled={isActionsDisabled}
                title={getButtonTitle("Realizar Conteo")}
                className={`bg-primary hover:bg-primary/90 text-white ${isHandheld ? "py-1 px-2 handheld-py-1 handheld-px-2 text-xs handheld-text-xs" : "py-1.5 px-3 text-sm"} rounded-md transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-start disabled:opacity-75 disabled:cursor-not-allowed`}
              >
                <Plus size={isHandheld ? 12 : 14} />
                Realizar Conteo
              </button>
            )}

            {type === "processed" && (
              <div
                className={`flex flex-wrap gap-2 w-full sm:w-auto ${isHandheld ? "mt-1 handheld-gap-1" : ""}`}
              >
                <button
                  onClick={() => onModifyMaterial && onModifyMaterial(material)}
                  disabled={isActionsDisabled}
                  title={getButtonTitle("Modificar Conteo")}
                  className={`bg-yellow-500 hover:bg-yellow-600 text-white ${isHandheld ? "px-2 py-0.5 text-[10px] handheld-text-xs" : "px-2 py-1 text-xs"} rounded transition-colors flex items-center gap-1 disabled:opacity-75 disabled:cursor-not-allowed`}
                >
                  <Edit2 size={isHandheld ? 10 : 12} />
                  Modificar
                </button>
                <button
                  onClick={() => onViewProcessedCases && onViewProcessedCases(material)}
                  title="Ver cases procesados para este material"
                  className={`bg-blue-500 hover:bg-blue-600 text-white ${isHandheld ? "px-2 py-0.5 text-[10px] handheld-text-xs" : "px-2 py-1 text-xs"} rounded transition-colors flex items-center gap-1`}
                >
                  <Eye size={isHandheld ? 10 : 12} />
                  Ver Cases
                </button>
                <button
                  onClick={() => onDeleteMaterialProcessing && onDeleteMaterialProcessing(material)}
                  disabled={isActionsDisabled}
                  title={getButtonTitle("Borrar Procesamiento")}
                  className={`bg-red-500 hover:bg-red-600 text-white ${isHandheld ? "px-2 py-0.5 text-[10px] handheld-text-xs" : "px-2 py-1 text-xs"} rounded transition-colors flex items-center gap-1 disabled:opacity-75 disabled:cursor-not-allowed`}
                >
                  <Trash2 size={isHandheld ? 10 : 12} />
                  Borrar
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialCardList;
