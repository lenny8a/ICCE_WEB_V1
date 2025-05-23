"use client"

import type React from "react"
import { Conteo } from "../../pages/ConteosPage" // Corrected import path
import {
  Check,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  User,
  Calendar,
  Building2,
  Store,
  FileText,
  Package,
} from "lucide-react"

interface ConteoDetailsProps {
  conteoData: Conteo 
  isHandheld: boolean
}

const ConteoDetails: React.FC<ConteoDetailsProps> = ({
  conteoData,
  isHandheld,
}) => {
  const renderConteoStatus = (estado?: string) => {
    let statusConfig = {
      text: "Pendiente",
      icon: <Clock size={16} />,
      className: "badge-yellow", 
    };

    if (estado === "contabilizado") {
      statusConfig = { text: "Contabilizado", icon: <CheckCircle size={16} />, className: "badge-green" };
    } else if (estado === "procesado") {
      statusConfig = { text: "Procesado", icon: <Check size={16} />, className: "badge-blue" };
    }
    
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.className}`}>
        {statusConfig.icon}
        <span>{statusConfig.text}</span>
      </div>
    );
  };

  return (
    <>
      {/* Cabecera del conteo */}
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 ${isHandheld ? "mb-3 gap-2" : ""}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center ${isHandheld ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-primary/10 text-primary`}
          >
            <FileSpreadsheet size={isHandheld ? 16 : 20} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2
                className={`${isHandheld ? "text-base handheld-text-base" : "text-lg"} font-semibold text-gray-800 dark:text-white flex items-center gap-2`}
              >
                <span>Documento:</span>
                <span className="text-primary">{conteoData.IBLNR}</span>
              </h2>
              <div className="ml-2 animate-fadeIn">{renderConteoStatus(conteoData.estado)}</div>
            </div>
            <div
              className={`flex items-center mt-1 ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-500 dark:text-gray-400 gap-2`}
            >
              <span className="flex items-center gap-1">
                <Package size={isHandheld ? 12 : 14} />
                <span>
                  Materiales: <span className="font-medium">{conteoData.MATERIALES.length}</span>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del conteo */}
      <div
        className={`mb-4 bg-gray-50 dark:bg-gray-800/30 ${isHandheld ? "p-2 handheld-p-2" : "p-3"} rounded-lg border border-gray-100 dark:border-gray-700`}
      >
        <div
          className={`grid ${isHandheld ? "grid-cols-2 handheld-grid-cols-1 gap-2 handheld-gap-1" : "grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-3"}`}
        >
          <div className="flex items-center gap-1.5">
            <User size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}>Creado por</p>
              <p className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}>{conteoData.USNAM}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}>Fecha</p>
              <p className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}>{conteoData.BLDAT}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}>Centro</p>
              <p className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}>{conteoData.WERKS}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Store size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}>Almacén</p>
              <p className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}>{conteoData.LGORT}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}>Referencia</p>
              <p className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}>{conteoData.XBLNI}</p>
            </div>
          </div>
        </div>
      </div>

       {conteoData.estado && (
        <div className="mb-4 p-3 rounded-lg border animate-fadeIn"
          style={{
            backgroundColor: conteoData.estado === "contabilizado" ? "rgba(34, 197, 94, 0.1)" : conteoData.estado === "procesado" ? "rgba(59, 130, 246, 0.1)" : "rgba(234, 179, 8, 0.1)",
            borderColor: conteoData.estado === "contabilizado" ? "rgba(34, 197, 94, 0.3)" : conteoData.estado === "procesado" ? "rgba(59, 130, 246, 0.3)" : "rgba(234, 179, 8, 0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {conteoData.estado === "contabilizado" ? <CheckCircle size={24} className="text-green-600 dark:text-green-400" /> : conteoData.estado === "procesado" ? <Check size={24} className="text-blue-600 dark:text-blue-400" /> : <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />}
            </div>
            <div>
              <h3 className="font-medium text-gray-800 dark:text-white">Estado del documento: <span className="font-semibold">{conteoData.estado.charAt(0).toUpperCase() + conteoData.estado.slice(1)}</span></h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {conteoData.estado === "contabilizado" ? "Este documento ha sido contabilizado completamente." : conteoData.estado === "procesado" ? "Este documento ha sido procesado y está pendiente de contabilización." : "Este documento está pendiente de procesamiento."}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConteoDetails;
