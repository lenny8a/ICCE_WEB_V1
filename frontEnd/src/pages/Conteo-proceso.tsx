import type React from "react"
import { useState } from "react"
import { useToast } from "../hooks/useToast"
import axios from "axios"
import { Check, CheckCircle, Clock, Edit2, FileText, Package, Save, X } from "lucide-react"

// Interfaces para TypeScript
export interface Case {
  CASE: string
  UBICACION: string
  CANTIDAD: string
  CANTIDAD_CONTADA?: string
  ESTADO?: "pendiente" | "procesado" | "contabilizado"
  DIFERENCIA?: number
  FECHA_CONTEO?: string
  USUARIO_CONTEO?: string
  EXCEP?: string
}

export interface Material {
  MATNR: string
  MAKTX: string
  MENGE: string
  MEINS: string
  CASES: Case[]
  ESTADO?: "pendiente" | "procesado" | "contabilizado"
  FECHA_PROCESO?: string
  USUARIO_PROCESO?: string
  FECHA_CONTABILIZACION?: string
  USUARIO_CONTABILIZACION?: string
}

export interface Conteo {
  IBLNR: string
  WERKS: string
  LGORT: string
  BLDAT: string
  USNAM: string
  XBLNI: string
  MATERIALES: Material[]
  ESTADO?: "pendiente" | "procesado" | "contabilizado"
  FECHA_PROCESO?: string
  USUARIO_PROCESO?: string
  FECHA_CONTABILIZACION?: string
  USUARIO_CONTABILIZACION?: string
}

interface ProcesarConteoProps {
  conteo: Conteo
  onConteoUpdated: (updatedConteo: Conteo) => void
  onClose: () => void
}

const ProcesarConteo: React.FC<ProcesarConteoProps> = ({ conteo, onConteoUpdated, onClose }) => {
  const [processingConteo, setProcessingConteo] = useState<Conteo>({ ...conteo })
  const [isProcessing, setIsProcessing] = useState(false)
  const [isContabilizing, setIsContabilizing] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [editingCase, setEditingCase] = useState<Case | null>(null)
  const { success, error } = useToast()

  // Estado para controlar la vista actual
  const [activeView, setActiveView] = useState<"summary" | "detail">("summary")

  // Estado para filtrar materiales
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "processed" | "accounted">("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Función para filtrar materiales según los criterios
  const getFilteredMaterials = () => {
    return processingConteo.MATERIALES.filter((material) => {
      // Filtrar por estado
      if (filterStatus === "pending" && material.ESTADO !== "pendiente") return false
      if (filterStatus === "processed" && material.ESTADO !== "procesado") return false
      if (filterStatus === "accounted" && material.ESTADO !== "contabilizado") return false

      // Filtrar por término de búsqueda
      if (
        searchTerm &&
        !material.MATNR.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !material.MAKTX.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      return true
    })
  }

  // Función para procesar el conteo completo - Implementación directa con axios
  const handleProcessConteo = async () => {
    try {
      setIsProcessing(true)

      // Actualizar el estado del conteo a "procesado" usando axios directamente
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cont/update-status`, {
        iblnr: processingConteo.IBLNR,
        estado: "procesado",
        usuario: "USUARIO_ACTUAL", // Aquí deberías usar el usuario actual del sistema
      })

      if (response.data) {
        setProcessingConteo(response.data)
        onConteoUpdated(response.data)
        success("Conteo procesado correctamente")
      } else {
        throw new Error("No se recibió respuesta del servidor")
      }
    } catch (err) {
      console.error("Error al procesar conteo:", err)
      error("Error al procesar el conteo. Intente nuevamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Función para contabilizar el conteo - Implementación directa con axios
  const handleAccountConteo = async () => {
    try {
      setIsContabilizing(true)

      // Verificar que todos los materiales estén procesados
      const pendingMaterials = processingConteo.MATERIALES.filter(
        (m) => m.ESTADO !== "procesado" && m.ESTADO !== "contabilizado",
      )

      if (pendingMaterials.length > 0) {
        error("No se puede contabilizar. Hay materiales pendientes de procesar.")
        setIsContabilizing(false)
        return
      }

      // Actualizar el estado del conteo a "contabilizado" usando axios directamente
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cont/update-status`, {
        iblnr: processingConteo.IBLNR,
        estado: "contabilizado",
        usuario: "USUARIO_ACTUAL", // Aquí deberías usar el usuario actual del sistema
      })

      if (response.data) {
        setProcessingConteo(response.data)
        onConteoUpdated(response.data)
        success("Conteo contabilizado correctamente")
      } else {
        throw new Error("No se recibió respuesta del servidor")
      }
    } catch (err) {
      console.error("Error al contabilizar conteo:", err)
      error("Error al contabilizar el conteo. Intente nuevamente.")
    } finally {
      setIsContabilizing(false)
    }
  }

  // Función para editar un material
  const handleEditMaterial = (material: Material) => {
    setEditingMaterial({ ...material })
    setActiveView("detail")
  }

  // Función para editar un case específico
  const handleEditCase = (caseItem: Case) => {
    setEditingCase({ ...caseItem })
  }

  // Función para guardar cambios en un case - Implementación directa con axios
  const handleSaveCase = async () => {
    if (!editingCase || !editingMaterial) return

    try {
      // Actualizar el case en el material
      const updatedCases = editingMaterial.CASES.map((c) => (c.CASE === editingCase.CASE ? editingCase : c))

      // Llamar a la API directamente para actualizar el material
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cont/update-material`, {
        iblnr: processingConteo.IBLNR,
        matnr: editingMaterial.MATNR,
        cases: updatedCases,
      })

      if (response.data) {
        // Actualizar el estado local
        const updatedMaterials = processingConteo.MATERIALES.map((m) =>
          m.MATNR === editingMaterial.MATNR ? { ...m, CASES: updatedCases } : m,
        )

        setProcessingConteo({
          ...processingConteo,
          MATERIALES: updatedMaterials,
        })

        // Actualizar el material que se está editando
        setEditingMaterial({
          ...editingMaterial,
          CASES: updatedCases,
        })

        setEditingCase(null)
        success("Case actualizado correctamente")
      } else {
        throw new Error("No se recibió respuesta del servidor")
      }
    } catch (err) {
      console.error("Error al guardar case:", err)
      error("Error al guardar los cambios. Intente nuevamente.")
    }
  }

  // Función para cancelar la edición de un case
  const handleCancelEditCase = () => {
    setEditingCase(null)
  }

  // Función para volver a la vista de resumen
  const handleBackToSummary = () => {
    setEditingMaterial(null)
    setEditingCase(null)
    setActiveView("summary")
  }

  // Calcular estadísticas del conteo
  const getConteoStats = () => {
    const total = processingConteo.MATERIALES.length
    const processed = processingConteo.MATERIALES.filter(
      (m) => m.ESTADO === "procesado" || m.ESTADO === "contabilizado",
    ).length
    const accounted = processingConteo.MATERIALES.filter((m) => m.ESTADO === "contabilizado").length

    return {
      total,
      processed,
      accounted,
      pending: total - processed,
    }
  }

  // Renderizar el estado del conteo
  const renderConteoStatus = () => {
    const status = processingConteo.ESTADO || "pendiente"

    switch (status) {
      case "contabilizado":
        return (
          <div className="flex items-center gap-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1.5 rounded-full text-sm font-medium">
            <CheckCircle size={16} />
            <span>Contabilizado</span>
          </div>
        )
      case "procesado":
        return (
          <div className="flex items-center gap-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium">
            <Check size={16} />
            <span>Procesado</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-3 py-1.5 rounded-full text-sm font-medium">
            <Clock size={16} />
            <span>Pendiente</span>
          </div>
        )
    }
  }

  // Renderizar el estado de un material
  const renderMaterialStatus = (material: Material) => {
    const status = material.ESTADO || "pendiente"

    switch (status) {
      case "contabilizado":
        return (
          <div className="flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            <span>Contabilizado</span>
          </div>
        )
      case "procesado":
        return (
          <div className="flex items-center gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
            <Check size={12} />
            <span>Procesado</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-full text-xs font-medium">
            <Clock size={12} />
            <span>Pendiente</span>
          </div>
        )
    }
  }

  return (
    <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            Procesar Conteo: {processingConteo.IBLNR}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Estado:</span>
            {renderConteoStatus()}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {processingConteo.ESTADO !== "contabilizado" && (
            <>
              {processingConteo.ESTADO !== "procesado" ? (
                <button
                  onClick={handleProcessConteo}
                  disabled={isProcessing}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Procesar Conteo</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleAccountConteo}
                  disabled={isContabilizing}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
                >
                  {isContabilizing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Contabilizando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Contabilizar</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}

          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors"
          >
            <X size={16} />
            <span>Cerrar</span>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        {activeView === "summary" ? (
          <>
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Materiales</div>
                <div className="text-2xl font-semibold text-gray-800 dark:text-white">{getConteoStats().total}</div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-lg p-4 border border-yellow-200 dark:border-yellow-900/30">
                <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Pendientes</div>
                <div className="text-2xl font-semibold text-yellow-700 dark:text-yellow-400">
                  {getConteoStats().pending}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-900/30">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Procesados</div>
                <div className="text-2xl font-semibold text-blue-700 dark:text-blue-400">
                  {getConteoStats().processed - getConteoStats().accounted}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/10 rounded-lg p-4 border border-green-200 dark:border-green-900/30">
                <div className="text-sm text-green-600 dark:text-green-400 mb-1">Contabilizados</div>
                <div className="text-2xl font-semibold text-green-700 dark:text-green-400">
                  {getConteoStats().accounted}
                </div>
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    filterStatus === "all"
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  Todos
                </button>

                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    filterStatus === "pending"
                      ? "bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                      : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/40"
                  }`}
                >
                  Pendientes
                </button>

                <button
                  onClick={() => setFilterStatus("processed")}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    filterStatus === "processed"
                      ? "bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                      : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40"
                  }`}
                >
                  Procesados
                </button>

                <button
                  onClick={() => setFilterStatus("accounted")}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    filterStatus === "accounted"
                      ? "bg-green-200 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                      : "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40"
                  }`}
                >
                  Contabilizados
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 px-3 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Lista de materiales */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {getFilteredMaterials().length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                  <Package size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No se encontraron materiales con los filtros actuales
                  </p>
                </div>
              ) : (
                getFilteredMaterials().map((material, index) => (
                  <div
                    key={material.MATNR}
                    className="bg-white dark:bg-boxdark border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-primary" />
                          <h3 className="font-medium text-gray-800 dark:text-white">{material.MATNR}</h3>
                          {renderMaterialStatus(material)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{material.MAKTX}</p>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {material.CASES.length} cases | {material.MEINS}
                        </div>
                      </div>

                      <button
                        onClick={() => handleEditMaterial(material)}
                        disabled={processingConteo.ESTADO === "contabilizado"}
                        className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 ${
                          processingConteo.ESTADO === "contabilizado"
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                            : "bg-primary hover:bg-primary/90 text-white"
                        }`}
                      >
                        <Edit2 size={14} />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Vista de detalle del material */}
            {editingMaterial && (
              <div className="animate-fadeIn">
                {/* Cabecera del material */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={handleBackToSummary}
                    className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
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
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                    <span>Volver</span>
                  </button>

                  <div>{renderMaterialStatus(editingMaterial)}</div>
                </div>

                {/* Información del material */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Material</p>
                      <p className="font-medium text-gray-800 dark:text-white">{editingMaterial.MATNR}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Descripción</p>
                      <p className="font-medium text-gray-800 dark:text-white">{editingMaterial.MAKTX}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Unidad de Medida</p>
                      <p className="font-medium text-gray-800 dark:text-white">{editingMaterial.MEINS}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Cases</p>
                      <p className="font-medium text-gray-800 dark:text-white">{editingMaterial.CASES.length}</p>
                    </div>
                  </div>
                </div>

                {/* Lista de cases */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Cases</h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Case
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Ubicación
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Cantidad Original
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Cantidad Contada
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Diferencia
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {editingMaterial.CASES.map((caseItem, index) => (
                          <tr
                            key={index}
                            className={editingCase?.CASE === caseItem.CASE ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">
                              {caseItem.CASE}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                              {caseItem.UBICACION}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right">
                              {caseItem.CANTIDAD}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                              {editingCase?.CASE === caseItem.CASE ? (
                                <input
                                  type="text"
                                  value={editingCase.CANTIDAD_CONTADA || ""}
                                  onChange={(e) =>
                                    setEditingCase({
                                      ...editingCase,
                                      CANTIDAD_CONTADA: e.target.value,
                                      DIFERENCIA: Number(e.target.value) - Number(editingCase.CANTIDAD.trim()),
                                    })
                                  }
                                  className="w-24 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-1 px-2 text-sm text-gray-800 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-right"
                                />
                              ) : (
                                <span
                                  className={`${
                                    caseItem.DIFERENCIA && caseItem.DIFERENCIA !== 0
                                      ? caseItem.DIFERENCIA > 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                      : "text-gray-600 dark:text-gray-300"
                                  }`}
                                >
                                  {caseItem.CANTIDAD_CONTADA || "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                              {editingCase?.CASE === caseItem.CASE ? (
                                <span
                                  className={`${
                                    editingCase.DIFERENCIA && editingCase.DIFERENCIA !== 0
                                      ? editingCase.DIFERENCIA > 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                      : "text-gray-600 dark:text-gray-300"
                                  }`}
                                >
                                  {editingCase.DIFERENCIA || 0}
                                </span>
                              ) : (
                                <span
                                  className={`${
                                    caseItem.DIFERENCIA && caseItem.DIFERENCIA !== 0
                                      ? caseItem.DIFERENCIA > 0
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                      : "text-gray-600 dark:text-gray-300"
                                  }`}
                                >
                                  {caseItem.DIFERENCIA || "-"}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                              {editingCase?.CASE === caseItem.CASE ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={handleSaveCase}
                                    className="p-1 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={handleCancelEditCase}
                                    className="p-1 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleEditCase(caseItem)}
                                  disabled={processingConteo.ESTADO === "contabilizado"}
                                  className={`p-1 rounded-full ${
                                    processingConteo.ESTADO === "contabilizado"
                                      ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50"
                                  } transition-colors`}
                                >
                                  <Edit2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProcesarConteo
