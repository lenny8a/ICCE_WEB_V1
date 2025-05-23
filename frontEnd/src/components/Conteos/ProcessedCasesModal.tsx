"use client"

import type React from "react"
import { Material } from "../../pages/Conteos" // Adjust path if Conteos.tsx is moved or Material type is centralized
import { ConteoCase } from "../../pages/Conteos" // Adjust path for ConteoCase type
import { X, ClipboardCheck, Package, FileText, AlertCircle, Check, Edit2 } from "lucide-react"

interface ProcessedCasesModalProps {
  isOpen: boolean
  onClose: () => void
  viewingMaterial: Material | null
  processedCases: ConteoCase[]
  onEditProcessedCase: (caseItem: ConteoCase, material: Material) => void
  onCaseStateClick: (event: React.MouseEvent, caseItem: ConteoCase) => void // Callback for state click
  isHandheld: boolean
  canModify: boolean
  conteoStatus?: string
}

const ProcessedCasesModal: React.FC<ProcessedCasesModalProps> = ({
  isOpen,
  onClose,
  viewingMaterial,
  processedCases,
  onEditProcessedCase,
  onCaseStateClick,
  isHandheld,
  canModify,
  conteoStatus,
}) => {
  if (!isOpen || !viewingMaterial) return null;

  const isEditDisabled = conteoStatus === "procesado" || conteoStatus === "contabilizado" || !canModify;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${isHandheld ? "p-1" : "p-2 sm:p-4"} pt-16 ml-0 lg:ml-72.5 touch-none`}>
      <div className="fixed inset-0 bg-black/50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn" onClick={onClose} style={{ userSelect: "none" }}></div>
      <div className={`relative w-full ${isHandheld ? "max-w-full handheld-modal" : "max-w-2xl"} bg-white dark:bg-boxdark rounded-lg shadow-lg transform transition-all mx-auto flex flex-col max-h-[90vh] z-[60] animate-scaleIn`}>
        <div className={`sticky top-0 z-10 flex justify-between items-center ${isHandheld ? "px-3 py-2 handheld-modal-header" : "px-4 sm:px-6 py-3"} border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-lg`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center ${isHandheld ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400`}><ClipboardCheck size={isHandheld ? 16 : 18} /></div>
            <div>
              <h2 className={`${isHandheld ? "text-base handheld-text-base" : "text-lg"} font-medium text-gray-800 dark:text-white`}>Cases Procesados</h2>
              <p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-500 dark:text-gray-400 truncate max-w-[250px] sm:max-w-[400px]`}>{viewingMaterial.MATNR} - {viewingMaterial.MAKTX}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Cerrar"><X size={isHandheld ? 16 : 18} /></button>
        </div>
        <div className={`${isHandheld ? "p-3 handheld-modal-content" : "p-4 sm:p-6"} overflow-y-auto flex-grow custom-scrollbar`}>
          {processedCases.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${isHandheld ? "handheld-compact-table" : ""}`}>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Case</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ubicación</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cantidad</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {processedCases.map((caseItem, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 animate-slideInUp" style={{ animationDelay: `${index * 30}ms` }}>
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-800 dark:text-white"><div className="flex items-center gap-1.5"><Package size={isHandheld ? 12 : 14} className="text-primary" />{caseItem.case}</div></td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300"><div className="flex items-center gap-1.5"><FileText size={isHandheld ? 12 : 14} className="text-gray-400" />{caseItem.ubicacion}</div></td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-right"><span className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded">{caseItem.cantidad}</span></td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-center">
                        <div className="flex justify-center items-center gap-2">
                          <div onClick={(e) => onCaseStateClick(e, caseItem)} title="Click para ver diferencia" className={`w-5 h-5 rounded-full flex items-center justify-center ${caseItem.color === "red" ? "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400"} cursor-pointer hover:ring-1 hover:ring-offset-1 hover:ring-gray-300 transition-all`}>{caseItem.color === "red" ? <AlertCircle size={12} /> : <Check size={12} />}</div>
                          <button
                            onClick={() => onEditProcessedCase(caseItem, viewingMaterial)}
                            title={isEditDisabled ? (conteoStatus === "procesado" || conteoStatus === "contabilizado" ? "Conteo ya procesado/contabilizado" : "No tiene permisos") : "Editar case"}
                            disabled={isEditDisabled}
                            className="w-5 h-5 rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
              <ClipboardCheck size={isHandheld ? 20 : 24} className="text-gray-400 mb-2" />
              <p className={`text-gray-500 dark:text-gray-400 ${isHandheld ? "text-xs handheld-text-xs" : ""}`}>No hay cases procesados para este material.</p>
            </div>
          )}
        </div>
        <div className={`sticky bottom-0 z-10 flex justify-end ${isHandheld ? "px-3 py-2 handheld-modal-footer" : "px-4 sm:px-6 py-3"} border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-b-lg`}>
          <button onClick={onClose} className={`${isHandheld ? "px-3 py-1.5 text-xs handheld-text-xs" : "px-4 py-2 text-sm"} bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md transition-colors font-medium flex items-center gap-2`}><X size={isHandheld ? 14 : 16} />Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default ProcessedCasesModal;
