import { useState, useEffect } from "react"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import { useToast } from "../hooks/useToast"
import ToastContainer from "../components/ToastContainer"
import axios from "axios"
import {
  Search,
  Filter,
  RefreshCw,
  Package,
  Building2,
  Warehouse,
  FileText,
  AlertCircle,
  Edit2,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

// Interfaces
interface CaseExcepcion {
  EMBAL: string
  ZUBIC: string
  MATNR: string
  MAKTX?: string
  MENGE: string
  ERFME: string
  ZUSER: string
  WERKS: string
  LGORT: string
  ZFECH: string
  ZHORA: string
  ZEXCU_WMS: string
  ZEXDE_WMS: string
}

interface ExcepcionData {
  _id: string
  id: string
  name: string
  active: boolean
}

const MantenimientoExcepcionesCase = () => {
  const [casesExcepciones, setCasesExcepciones] = useState<CaseExcepcion[]>([])
  const [filteredCases, setFilteredCases] = useState<CaseExcepcion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [excepciones, setExcepciones] = useState<ExcepcionData[]>([])
  const [isLoadingExcepciones, setIsLoadingExcepciones] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCase, setSelectedCase] = useState<CaseExcepcion | null>(null)
  const [selectedExcepcion, setSelectedExcepcion] = useState<ExcepcionData | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [expandedCase, setExpandedCase] = useState<string | null>(null)
  const [filterOptions, setFilterOptions] = useState({
    excepcion: "all",
    ubicacion: "all",
    centro: "all",
  })
  const [availableFilters, setAvailableFilters] = useState({
    excepciones: new Set<string>(),
    ubicaciones: new Set<string>(),
    centros: new Set<string>(),
  })
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  const { toasts, removeToast, success, error } = useToast()
  const api_url = import.meta.env.VITE_API_URL

  // Cargar los datos al montar el componente
  useEffect(() => {
    fetchCasesExcepciones()
    fetchExcepciones()
  }, [])

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters()
  }, [casesExcepciones, searchTerm, filterOptions])

  // Función para cargar los cases con excepciones
  const fetchCasesExcepciones = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${api_url}/entr/caseEx`)

      if (response.data) {
        const casesData = Array.isArray(response.data) ? response.data : [response.data]
        setCasesExcepciones(casesData)

        // Extraer valores únicos para los filtros
        const excepciones = new Set<string>()
        const ubicaciones = new Set<string>()
        const centros = new Set<string>()

        casesData.forEach((caseItem) => {
          if (caseItem.ZEXCU_WMS) excepciones.add(caseItem.ZEXCU_WMS)
          if (caseItem.ZUBIC) ubicaciones.add(caseItem.ZUBIC)
          if (caseItem.WERKS) centros.add(caseItem.WERKS)
        })

        setAvailableFilters({
          excepciones,
          ubicaciones,
          centros,
        })
      } else {
        setCasesExcepciones([])
        error("No se encontraron cases con excepciones")
      }
    } catch (err) {
      console.error("Error al cargar cases con excepciones:", err)
      error("Error al cargar los cases con excepciones")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cargar las excepciones disponibles
  const fetchExcepciones = async () => {
    try {
      setIsLoadingExcepciones(true)
      const response = await axios.get(`${api_url}/api/excepciones`)

      if (response.data.success) {
        // Filtrar solo las excepciones activas
        const excepcionesActivas = response.data.data.filter((exc: ExcepcionData) => exc.active)
        setExcepciones(excepcionesActivas)
      } else {
        console.error("Error al cargar excepciones:", response.data.message)
        setExcepciones([])
      }
    } catch (error) {
      console.error("Error al cargar excepciones:", error)
      setExcepciones([])
    } finally {
      setIsLoadingExcepciones(false)
    }
  }

  // Función para aplicar filtros
  const applyFilters = () => {
    let result = [...casesExcepciones]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (caseItem) =>
          caseItem.EMBAL.toLowerCase().includes(term) ||
          caseItem.MATNR.toLowerCase().includes(term) ||
          (caseItem.MAKTX && caseItem.MAKTX.toLowerCase().includes(term)) ||
          caseItem.ZUBIC.toLowerCase().includes(term) ||
          caseItem.ZEXDE_WMS.toLowerCase().includes(term),
      )
    }

    // Filtrar por código de excepción
    if (filterOptions.excepcion !== "all") {
      result = result.filter((caseItem) => caseItem.ZEXCU_WMS === filterOptions.excepcion)
    }

    // Filtrar por ubicación
    if (filterOptions.ubicacion !== "all") {
      result = result.filter((caseItem) => caseItem.ZUBIC === filterOptions.ubicacion)
    }

    // Filtrar por centro
    if (filterOptions.centro !== "all") {
      result = result.filter((caseItem) => caseItem.WERKS === filterOptions.centro)
    }

    // Ordenar por fecha descendente (más reciente primero)
    result.sort((a, b) => {
      const dateA = new Date(`${a.ZFECH} ${a.ZHORA}`).getTime()
      const dateB = new Date(`${b.ZFECH} ${b.ZHORA}`).getTime()
      return dateB - dateA
    })

    setFilteredCases(result)
  }

  // Función para abrir el modal de edición
  const openEditModal = (caseItem: CaseExcepcion) => {
    setSelectedCase(caseItem)
    setSelectedExcepcion(excepciones.find((exc) => exc.id === caseItem.ZEXCU_WMS) || null)
    setIsModalOpen(true)
    // Bloquear scroll del body
    document.body.style.overflow = "hidden"
  }

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedCase(null)
    setSelectedExcepcion(null)
    // Restaurar scroll del body
    document.body.style.overflow = "auto"
  }

  // Función para actualizar la excepción
  const handleUpdateExcepcion = async () => {
    if (!selectedCase || !selectedExcepcion) return

    try {
      setIsUpdating(true)

      const excepcionData = {
        embal: selectedCase.EMBAL,
        zexcu_wms: selectedExcepcion.id,
        zexde_wms: selectedExcepcion.name,
        matnr: selectedCase.MATNR,
        maktx: selectedCase.MAKTX,
        ubicacion: selectedCase.ZUBIC,
      }

      const response = await axios.post(`${api_url}/entr/excepcion`, excepcionData)

      if (response.data) {
        // Actualizar el estado local
        setCasesExcepciones((prevCases) =>
          prevCases.map((caseItem) =>
            caseItem.EMBAL === selectedCase.EMBAL
              ? { ...caseItem, ZEXCU_WMS: selectedExcepcion.id, ZEXDE_WMS: selectedExcepcion.name }
              : caseItem,
          ),
        )

        success(`Excepción actualizada correctamente para el case ${selectedCase.EMBAL}`)
        closeModal()
      } else {
        throw new Error("Error al actualizar la excepción")
      }
    } catch (err) {
      console.error("Error al actualizar excepción:", err)
      error("Error al actualizar la excepción. Intente nuevamente.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Función para formatear fecha
  const formatDate = (date: string, time: string) => {
    try {
      // Convertir formato DD.MM.YYYY a YYYY-MM-DD para crear un objeto Date
      const parts = date.split(".")
      if (parts.length !== 3) return `${date} ${time}`

      const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]} ${time}`
      return new Date(formattedDate).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return `${date} ${time}`
    }
  }

  // Función para alternar la expansión de un case
  const toggleCaseExpansion = (embal: string) => {
    setExpandedCase(expandedCase === embal ? null : embal)
  }

  // Función para refrescar los datos
  const refreshData = () => {
    fetchCasesExcepciones()
  }

  // Función para resetear los filtros
  const resetFilters = () => {
    setSearchTerm("")
    setFilterOptions({
      excepcion: "all",
      ubicacion: "all",
      centro: "all",
    })
  }

  // Función para eliminar ceros a la izquierda
  const removeLeadingZeros = (value: string): string => {
    return value.replace(/^0+/, "")
  }

  return (
    <>
      <Breadcrumb pageName="Mantenimiento de Cases con Excepciones" />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="grid grid-cols-1 gap-4">
        {/* Sección de filtros y búsqueda */}
        <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <AlertCircle size={20} className="text-primary mr-2" />
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Cases con Excepciones</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Búsqueda */}
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={16} className="text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar por case, material o ubicación"
                  className="w-full rounded-md border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Botón de filtros */}
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className="flex items-center justify-center gap-1 rounded-md bg-gray-100 dark:bg-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Filter size={16} />
                <span>Filtros</span>
                {isFilterPanelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {/* Botón de refrescar */}
              <button
                onClick={refreshData}
                className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                <span>{isLoading ? "Cargando..." : "Refrescar"}</span>
              </button>
            </div>

            {/* Panel de filtros avanzados */}
            {isFilterPanelOpen && (
              <div className="bg-gray-50 dark:bg-gray-800/30 p-3 rounded-md border border-gray-200 dark:border-gray-700 mb-4 animate-slideInUp">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Filtro por excepción */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código de Excepción
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary text-sm"
                      value={filterOptions.excepcion}
                      onChange={(e) => setFilterOptions((prev) => ({ ...prev, excepcion: e.target.value }))}
                    >
                      <option value="all">Todas las excepciones</option>
                      {Array.from(availableFilters.excepciones).map((excepcion) => (
                        <option key={excepcion} value={excepcion}>
                          {excepcion} - {excepciones.find((e) => e.id === excepcion)?.name || ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por ubicación */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ubicación</label>
                    <select
                      className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary text-sm"
                      value={filterOptions.ubicacion}
                      onChange={(e) => setFilterOptions((prev) => ({ ...prev, ubicacion: e.target.value }))}
                    >
                      <option value="all">Todas las ubicaciones</option>
                      {Array.from(availableFilters.ubicaciones).map((ubicacion) => (
                        <option key={ubicacion} value={ubicacion}>
                          {ubicacion}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por centro */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Centro</label>
                    <select
                      className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary text-sm"
                      value={filterOptions.centro}
                      onChange={(e) => setFilterOptions((prev) => ({ ...prev, centro: e.target.value }))}
                    >
                      <option value="all">Todos los centros</option>
                      {Array.from(availableFilters.centros).map((centro) => (
                        <option key={centro} value={centro}>
                          {centro}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-3">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-xs transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} />
                    Resetear filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabla de resultados */}
        <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="flex flex-col items-center">
                <Loader2 size={32} className="animate-spin text-primary mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Cargando cases con excepciones...</p>
              </div>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No hay registros</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No se encontraron cases con excepciones con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <>
              {/* Contador de resultados */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando <span className="font-semibold text-primary">{filteredCases.length}</span> cases con
                  excepciones
                </p>
              </div>

              {/* Tabla para pantallas medianas y grandes */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Case</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Material</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Ubicación</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Excepción</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((caseItem) => (
                      <tr
                        key={caseItem.EMBAL}
                        className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                          {removeLeadingZeros(caseItem.EMBAL)}
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                          <div>
                            <p>{caseItem.MATNR}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{caseItem.MAKTX}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{caseItem.ZUBIC}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            {caseItem.ZEXCU_WMS} - {caseItem.ZEXDE_WMS}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                          {formatDate(caseItem.ZFECH, caseItem.ZHORA)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openEditModal(caseItem)}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-primary text-white text-xs rounded-md hover:bg-primary/90 transition-colors"
                          >
                            <Edit2 size={14} className="mr-1" />
                            Cambiar excepción
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista de tarjetas para móviles */}
              <div className="sm:hidden space-y-2 p-2">
                {filteredCases.map((caseItem, index) => (
                  <div
                    key={caseItem.EMBAL}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in-50 zoom-in-90"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-primary" />
                          <p className="font-semibold text-gray-800 dark:text-white text-base">
                            {removeLeadingZeros(caseItem.EMBAL)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {caseItem.MATNR} - {caseItem.MAKTX}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        {caseItem.ZEXCU_WMS}
                      </span>
                    </div>

                    <div className="mt-2">
                      <button
                        onClick={() => toggleCaseExpansion(caseItem.EMBAL)}
                        className="w-full flex items-center justify-between py-1 px-2 bg-gray-50 dark:bg-gray-700 rounded-md text-xs text-gray-700 dark:text-gray-300"
                      >
                        <span>Ver detalles</span>
                        {expandedCase === caseItem.EMBAL ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {expandedCase === caseItem.EMBAL && (
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 animate-slideInUp">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Ubicación:</p>
                            <p className="font-medium text-gray-800 dark:text-white">{caseItem.ZUBIC}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Cantidad:</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {caseItem.MENGE} {caseItem.ERFME}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Excepción:</p>
                            <p className="font-medium text-gray-800 dark:text-white">{caseItem.ZEXDE_WMS}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Fecha:</p>
                            <p className="font-medium text-gray-800 dark:text-white">
                              {formatDate(caseItem.ZFECH, caseItem.ZHORA)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => openEditModal(caseItem)}
                          className="mt-3 w-full bg-primary text-white px-3 py-2 rounded-md text-xs flex items-center justify-center gap-1.5"
                        >
                          <Edit2 size={14} />
                          Cambiar excepción
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal para cambiar excepción */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={closeModal}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-boxdark rounded-lg shadow-lg transform transition-all mx-auto flex flex-col max-h-[90vh] z-[60] animate-scaleIn">
            {/* Header */}
            <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-lg">
              <h2 className="text-lg font-medium text-gray-800 dark:text-white flex items-center gap-2">
                <Edit2 size={18} className="text-primary" />
                <span>Cambiar Excepción</span>
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-grow custom-scrollbar">
              {/* Información del case */}
              <div className="mb-5 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <Package size={12} className="flex-shrink-0" />
                      Case
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {removeLeadingZeros(selectedCase.EMBAL)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <FileText size={12} className="flex-shrink-0" />
                      Ubicación
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedCase.ZUBIC}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <Building2 size={12} className="flex-shrink-0" />
                      Centro
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedCase.WERKS}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                      <Warehouse size={12} className="flex-shrink-0" />
                      Almacén
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedCase.LGORT || "N/A"}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                    <FileText size={12} className="flex-shrink-0" />
                    Material
                  </p>
                  <p className="font-medium text-gray-800 dark:text-white">{selectedCase.MATNR}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedCase.MAKTX}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-1">
                    <AlertCircle size={12} className="flex-shrink-0" />
                    Excepción actual
                  </p>
                  <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-100 dark:border-red-800/30">
                    <p className="font-medium text-red-800 dark:text-red-400 flex items-center gap-1.5">
                      <span className="bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-400 px-1.5 py-0.5 rounded text-xs">
                        {selectedCase.ZEXCU_WMS}
                      </span>
                      <span>{selectedCase.ZEXDE_WMS}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Selección de nueva excepción */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Seleccione la nueva excepción:
                </h3>

                {isLoadingExcepciones ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-primary mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Cargando excepciones...</span>
                  </div>
                ) : excepciones.length === 0 ? (
                  <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                    No hay excepciones disponibles
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                    {excepciones.map((excepcion) => (
                      <div
                        key={excepcion._id}
                        className={`p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                          selectedExcepcion && selectedExcepcion._id === excepcion._id
                            ? "border-primary bg-primary/10 dark:bg-primary/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-primary/30 hover:bg-primary/5"
                        }`}
                        onClick={() => setSelectedExcepcion(excepcion)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full mr-2 ${
                                selectedExcepcion && selectedExcepcion._id === excepcion._id
                                  ? "bg-primary"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            ></div>
                            <span className="font-medium text-gray-800 dark:text-white">{excepcion.name}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Código: {excepcion.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 flex justify-end px-4 sm:px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-b-lg">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateExcepcion}
                  disabled={!selectedExcepcion || isUpdating}
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:hover:shadow-sm flex items-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      <span>Actualizar Excepción</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MantenimientoExcepcionesCase
