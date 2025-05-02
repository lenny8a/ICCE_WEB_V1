"use client"

import React from "react"

import { useState, useEffect } from "react"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import axios from "axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "../hooks/useToast"
import ToastContainer from "../components/ToastContainer"
// Añadir la importación del hook useAuth al inicio del archivo, junto con las otras importaciones
import { useAuth } from "../context/AuthContext"

// Interfaces
interface CaseItem {
  case: string
  ubicacion: string
  cantidad: string
  estado: string
  excepcion: string
  color?: string
  werks?: string
  lgort?: string
  diferencia?: number
}

interface ConteoItem {
  MATNR: string
  MAKTX?: string
  MENGE: string
  MEINS: string
  casesRegistrados: CaseItem[] // Updated with proper type
}

interface ConteoData {
  _id: string
  IBLNR: string
  WERKS: string
  LGORT: string
  BLDAT: string
  USNAM: string
  XBLNI: string
  materiales: ConteoItem[]
  usuarioCreador: string
  fechaCreacion: string
  horaCreacion: string
  usuarioModificador?: string
  fechaModificacion?: string
  horaModificacion?: string
  estado: string
}

interface FilterOptions {
  dateRange: "today" | "week" | "month" | "all"
  status: "pendiente" | "procesado" | "contabilizado" | "enviado" | "all"
  sortBy: "date" | "IBLNR"
  sortOrder: "asc" | "desc"
}

// Modificar el componente ConteoHistory para incluir la verificación de permisos
const ConteoHistory = () => {
  // Añadir el hook useAuth para obtener el contexto de autenticación
  const { checkPermission } = useAuth()

  // Definir los permisos necesarios para las diferentes acciones
  const canView = checkPermission("/conteo-proceso", "visualizar")
  const canModify = checkPermission("/conteo-proceso", "modificar")
  const canContabilizar = checkPermission("/conteo-proceso", "contabilizar")
  const canAnular = checkPermission("/conteo-proceso", "anular")

  // Resto del código existente...
  const [conteos, setConteos] = useState<ConteoData[]>([])
  const [filteredConteos, setFilteredConteos] = useState<ConteoData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedConteo, setSelectedConteo] = useState<ConteoData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "all",
    status: "procesado",
    sortBy: "date",
    sortOrder: "desc",
  })
  // New state for expanded material and cases modal
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<ConteoItem | null>(null)
  const [isCasesModalOpen, setIsCasesModalOpen] = useState(false)
  // Estados para el popup de confirmación de contabilizar
  const [isConfirmingContabilizar, setIsConfirmingContabilizar] = useState(false)
  const [showContabilizarConfirm, setShowContabilizarConfirm] = useState<string | null>(null)
  // New state for contabilizar loading
  const [isContabilizando, setIsContabilizando] = useState(false)
  const [contabilizandoId, setContabilizandoId] = useState<string | null>(null)

  const { toasts, removeToast, success, error: showError } = useToast()
  const api_url = import.meta.env.VITE_API_URL

  // Cargar los datos al montar el componente
  useEffect(() => {
    // Verificar si el usuario tiene permiso para ver los conteos
    if (!canView) {
      setError("No tienes permiso para ver el historial de conteos")
      showError("No tienes permiso para ver el historial de conteos")
      setIsLoading(false)
      return
    }

    fetchConteos()
  }, [filters.status, canView]) // Refetch cuando cambia el filtro de estado o los permisos

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters()
  }, [conteos, filters, searchTerm])

  // Modificar la función fetchConteos para incluir verificación de permisos
  const fetchConteos = async () => {
    try {
      // Verificar si el usuario tiene permiso para ver los conteos
      if (!canView) {
        setError("No tienes permiso para ver el historial de conteos")
        showError("No tienes permiso para ver el historial de conteos")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      let statusQuery = ""
      if (filters.status !== "all") {
        statusQuery = `estado=${filters.status}`
      }

      const apiUrl = statusQuery ? `${api_url}/conteos?${statusQuery}` : `${api_url}/conteos`

      const response = await axios.get(apiUrl)

      if (response.data.success) {
        setConteos(response.data.data || [])
        setFilteredConteos(response.data.data || [])
      } else {
        setError("Error al cargar los datos: " + response.data.message)
        showError("Error al cargar los datos: " + response.data.message)
      }
    } catch (error) {
      console.error("Error al obtener conteos:", error)
      setError("Error al conectar con el servidor. Intente nuevamente más tarde.")
      showError("Error al conectar con el servidor. Intente nuevamente más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para aplicar filtros
  const applyFilters = () => {
    let result = [...conteos]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (conteo) =>
          conteo.IBLNR.toLowerCase().includes(term) ||
          conteo.usuarioCreador.toLowerCase().includes(term) ||
          conteo.materiales.some(
            (item) =>
              item.MATNR.toLowerCase().includes(term) || (item.MAKTX && item.MAKTX.toLowerCase().includes(term)),
          ),
      )
    }

    // Filtrar por rango de fecha
    if (filters.dateRange !== "all") {
      const now = new Date()
      let startDate: Date

      switch (filters.dateRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "week":
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 7)
          break
        case "month":
          startDate = new Date(now)
          startDate.setMonth(now.getMonth() - 1)
          break
        default:
          startDate = new Date(0) // Desde el inicio de los tiempos
      }

      result = result.filter((conteo) => new Date(conteo.fechaCreacion) >= startDate)
    }

    // Ordenar resultados
    result.sort((a, b) => {
      let comparison = 0

      if (filters.sortBy === "date") {
        comparison = new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime()
      } else if (filters.sortBy === "IBLNR") {
        comparison = a.IBLNR.localeCompare(b.IBLNR)
      }

      return filters.sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredConteos(result)
  }

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy HH:mm", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  // Modificar la función openConteoDetails para incluir verificación de permisos
  const openConteoDetails = (conteo: ConteoData) => {
    // Verificar si el usuario tiene permiso para ver los detalles
    if (!canView) {
      showError("No tienes permiso para ver los detalles del conteo")
      return
    }

    setSelectedConteo(conteo)
    setIsModalOpen(true)
    // Bloquear scroll del body
    document.body.style.overflow = "hidden"
  }

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedConteo(null)
    setExpandedMaterial(null)
    // Restaurar scroll del body
    document.body.style.overflow = "auto"
  }

  // Función para actualizar los filtros
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Función para refrescar los datos
  const refreshData = () => {
    fetchConteos()
    success("Datos actualizados correctamente")
  }

  // Función para obtener el texto de estado según el valor
  const getStatusText = (status: string) => {
    if (status === "pendiente") {
      return "Pendiente"
    } else if (status === "procesado") {
      return "Procesado"
    } else if (status === "contabilizado") {
      return "Contabilizado"
    } else if (status === "enviado") {
      return "Enviado"
    } else {
      return status
    }
  }

  // Función para obtener la clase de estilo según el estado
  const getStatusClass = (status: string) => {
    if (status === "pendiente") {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    } else if (status === "procesado") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    } else if (status === "contabilizado") {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    } else if (status === "enviado") {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
    } else {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  // Función para obtener la clase de estilo según el color del case
  const getCaseColorClass = (color?: string) => {
    if (color === "red") {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    } else if (color === "green") {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    } else {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  // Función para alternar la expansión de un material
  const toggleMaterialExpansion = (materialId: string) => {
    if (expandedMaterial === materialId) {
      setExpandedMaterial(null)
    } else {
      setExpandedMaterial(materialId)
    }
  }

  // Función para abrir el modal de cases
  const openCasesModal = (material: ConteoItem) => {
    setSelectedMaterial(material)
    setIsCasesModalOpen(true)
    // Bloquear scroll del body
    document.body.style.overflow = "hidden"
  }

  // Función para cerrar el modal de cases
  const closeCasesModal = () => {
    setIsCasesModalOpen(false)
    setSelectedMaterial(null)
    // Restaurar scroll del body si el modal principal no está abierto
    if (!isModalOpen) {
      document.body.style.overflow = "auto"
    }
  }

  // Modificar la función handleContabilizarClick para incluir verificación de permisos
  const handleContabilizarClick = (conteoId: string) => {
    // Verificar si el usuario tiene permiso para contabilizar
    if (!canContabilizar) {
      showError("No tienes permiso para contabilizar conteos")
      return
    }

    setShowContabilizarConfirm(conteoId)
  }

  // Modificar la función confirmContabilizar para incluir verificación de permisos
  const confirmContabilizar = async () => {
    // Verificar si el usuario tiene permiso para contabilizar
    if (!canContabilizar) {
      showError("No tienes permiso para contabilizar conteos")
      setShowContabilizarConfirm(null)
      return
    }

    if (showContabilizarConfirm && !isConfirmingContabilizar) {
      setIsConfirmingContabilizar(true)
      try {
        // Encontrar el conteo completo en nuestro estado local
        const conteoToSend = conteos.find((conteo) => conteo._id === showContabilizarConfirm)

        if (!conteoToSend) {
          showError("No se encontró el conteo seleccionado")
          return
        }

        await handleContabilizar(showContabilizarConfirm)
      } finally {
        setIsConfirmingContabilizar(false)
        setShowContabilizarConfirm(null)
      }
    }
  }

  // Modificar la función handleContabilizar para incluir verificación de permisos
  const handleContabilizar = async (conteoId: string) => {
    // Verificar si el usuario tiene permiso para contabilizar
    if (!canContabilizar) {
      showError("No tienes permiso para contabilizar conteos")
      return
    }

    try {
      setIsLoading(true)
      setIsContabilizando(true)
      setContabilizandoId(conteoId)

      // Encontrar el conteo completo en nuestro estado local
      const conteoToSend = conteos.find((conteo) => conteo._id === conteoId)

      if (!conteoToSend) {
        showError("No se encontró el conteo seleccionado")
        return
      }

      console.log("Enviando conteo completo para contabilizar:", conteoToSend._id)

      // Llamar al endpoint enviando el objeto completo del conteo
      const response = await axios.post(`${api_url}/cont/procesa-conteo`, { conteoId: conteoToSend._id })

      console.log("Respuesta de contabilización:", response.data)

      if (response.data && response.data.success) {
        // Actualizar el estado del conteo en la interfaz
        setConteos((prevConteos) =>
          prevConteos.map((conteo) => (conteo._id === conteoId ? { ...conteo, estado: "enviado" } : conteo)),
        )

        // Si el conteo seleccionado es el que se acaba de contabilizar, actualizar también
        if (selectedConteo && selectedConteo._id === conteoId) {
          setSelectedConteo({ ...selectedConteo, estado: "enviado" })
        }

        // Mostrar mensaje de éxito
        success("Conteo contabilizado correctamente")
      } else {
        // Mostrar mensaje de error
        showError(`Error al contabilizar: ${response.data?.message || "Error desconocido"}`)
      }
    } catch (error_) {
      console.error("Error al contabilizar conteo:", error_)
      const errorMessage = (error_ as any)?.response?.data?.message || (error_ as any)?.message || "Error desconocido"
      showError(`Error al contabilizar: ${errorMessage}`)
    } finally {
      setIsLoading(false)
      setIsContabilizando(false)
      setContabilizandoId(null)
    }
  }

  // Modificar la función canContabilizar para incluir verificación de permisos
  const canContabilizarConteo = (conteo: ConteoData) => {
    return conteo.estado === "procesado" && canContabilizar
  }

  return (
    <>
      <Breadcrumb pageName="Historial de Conteos" />

      {/* Notification Toast */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Mostrar mensaje de error si el usuario no tiene permiso para ver los conteos */}
      {!canView && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error de permisos:</strong>
          <span className="block sm:inline"> No tienes permiso para ver el historial de conteos.</span>
        </div>
      )}

      {canView && (
        <div className="grid grid-cols-1 gap-4">
          {/* Sección de filtros y búsqueda */}
          <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary mr-2"
                >
                  <path d="M3 3v18h18"></path>
                  <path d="M18.4 8.79a4 4 0 1 0-7.29 3.21"></path>
                  <path d="M7 19h10"></path>
                  <path d="M7 15h2"></path>
                  <path d="M15 15h2"></path>
                </svg>
                <h2 className="text-base font-semibold text-gray-800 dark:text-white">Historial de Conteos</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Búsqueda */}
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                      className="text-gray-500 dark:text-gray-400"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por número de conteo, material o usuario"
                    className="w-full rounded-md border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Botón de refrescar */}
                <button
                  onClick={refreshData}
                  className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
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
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                    </svg>
                  )}
                  <span>{isLoading ? "Cargando..." : "Refrescar"}</span>
                </button>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Filtro por fecha */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rango de fecha
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary text-sm"
                    value={filters.dateRange}
                    onChange={(e) => updateFilter("dateRange", e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="today">Hoy</option>
                    <option value="week">Última semana</option>
                    <option value="month">Último mes</option>
                  </select>
                </div>

                {/* Filtro por estado */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                  <select
                    className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary text-sm"
                    value={filters.status}
                    onChange={(e) => updateFilter("status", e.target.value)}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="procesado">Procesado</option>
                    <option value="contabilizado">Contabilizado</option>
                    <option value="enviado">Enviado</option>
                    <option value="all">Todos</option>
                  </select>
                </div>

                {/* Ordenar por */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Ordenar por</label>
                  <select
                    className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary text-sm"
                    value={filters.sortBy}
                    onChange={(e) => updateFilter("sortBy", e.target.value)}
                  >
                    <option value="date">Fecha</option>
                    <option value="IBLNR">Número de Conteo</option>
                  </select>
                </div>

                {/* Orden */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Orden</label>
                  <select
                    className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary text-sm"
                    value={filters.sortOrder}
                    onChange={(e) => updateFilter("sortOrder", e.target.value)}
                  >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de resultados */}
          <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex flex-col items-center">
                  <svg
                    className="animate-spin h-8 w-8 text-primary mb-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">Cargando historial de conteos...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" x2="12" y1="8" y2="12"></line>
                    <line x1="12" x2="12.01" y1="16" y2="16"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error al cargar datos</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <button
                  onClick={refreshData}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
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
                    className="mr-2"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                  </svg>
                  Reintentar
                </button>
              </div>
            ) : filteredConteos.length === 0 ? (
              <div className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                    <line x1="8" x2="16" y1="12" y2="12"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No hay registros</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontraron conteos con los filtros seleccionados.
                </p>
              </div>
            ) : (
              <>
                {/* Contador de resultados */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando <span className="font-semibold text-primary">{filteredConteos.length}</span> resultados
                  </p>
                </div>

                {/* Tabla para pantallas medianas y grandes */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                        <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Número de Conteo</th>
                        <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                        <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Centro</th>
                        <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Almacén</th>
                        <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Usuario</th>
                        <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                        <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConteos.map((conteo) => (
                        <tr
                          key={conteo._id}
                          className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                        >
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">{conteo.IBLNR}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(conteo.estado)}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full mr-1.5 ${
                                  conteo.estado === "pendiente"
                                    ? "bg-yellow-500"
                                    : conteo.estado === "procesado"
                                      ? "bg-blue-500"
                                      : conteo.estado === "contabilizado"
                                        ? "bg-green-500"
                                        : conteo.estado === "enviado"
                                          ? "bg-purple-500"
                                          : "bg-gray-500"
                                }`}
                              ></span>
                              {getStatusText(conteo.estado)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{conteo.WERKS}</td>
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{conteo.LGORT}</td>
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{conteo.usuarioCreador}</td>
                          <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                            {formatDate(conteo.fechaCreacion)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openConteoDetails(conteo)}
                                className="inline-flex items-center justify-center px-3 py-1.5 bg-primary text-white text-xs rounded-md hover:bg-primary/90 transition-colors"
                                disabled={!canView}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="mr-1"
                                >
                                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                Ver detalles
                              </button>

                              {/* Botón de Contabilizar - Solo visible si el estado es "procesado" y el usuario tiene permiso */}
                              {canContabilizarConteo(conteo) && (
                                <button
                                  onClick={() => handleContabilizarClick(conteo._id)}
                                  disabled={isContabilizando && contabilizandoId === conteo._id}
                                  className="inline-flex items-center justify-center px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isContabilizando && contabilizandoId === conteo._id ? (
                                    <svg
                                      className="animate-spin h-4 w-4 text-white mr-1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      ></circle>
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      ></path>
                                    </svg>
                                  ) : (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="14"
                                      height="14"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      className="mr-1"
                                    >
                                      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1"></path>
                                      <path d="M17 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1"></path>
                                      <path d="M12 12v9"></path>
                                      <path d="m8 17 4 4 4-4"></path>
                                      <path d="M12 12V3"></path>
                                    </svg>
                                  )}
                                  {isContabilizando && contabilizandoId === conteo._id
                                    ? "Procesando..."
                                    : "Contabilizar"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vista de tarjetas para móviles */}
                <div className="sm:hidden space-y-2 p-2">
                  {filteredConteos.map((conteo, index) => (
                    <div
                      key={conteo._id}
                      className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-boxdark shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in-50 zoom-in-90"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white text-base">{conteo.IBLNR}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                            {formatDate(conteo.fechaCreacion)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(conteo.estado)}`}
                        >
                          {getStatusText(conteo.estado)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Centro:</p>
                          <p className="font-medium text-gray-800 dark:text-white">{conteo.WERKS}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Almacén:</p>
                          <p className="font-medium text-gray-800 dark:text-white">{conteo.LGORT}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Usuario:</p>
                          <p className="font-medium text-gray-800 dark:text-white">{conteo.usuarioCreador}</p>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex flex-wrap items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 gap-2">
                        <button
                          onClick={() => openConteoDetails(conteo)}
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-primary text-white text-xs rounded-md hover:bg-primary/90 transition-colors min-w-20"
                          disabled={!canView}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          Ver detalles
                        </button>

                        {/* Botón de Contabilizar para móviles - Solo visible si el estado es "procesado" y el usuario tiene permiso */}
                        {canContabilizarConteo(conteo) && (
                          <button
                            onClick={() => handleContabilizarClick(conteo._id)}
                            disabled={isContabilizando && contabilizandoId === conteo._id}
                            className="inline-flex items-center justify-center px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-20"
                          >
                            {isContabilizando && contabilizandoId === conteo._id ? (
                              <svg
                                className="animate-spin h-4 w-4 text-white mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-1"
                              >
                                <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1"></path>
                                <path d="M17 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1"></path>
                                <path d="M12 12v9"></path>
                                <path d="m8 17 4 4 4-4"></path>
                                <path d="M12 12V3"></path>
                              </svg>
                            )}
                            {isContabilizando && contabilizandoId === conteo._id ? "..." : "Contabilizar"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {isModalOpen && selectedConteo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={closeModal}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-3xl bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col max-h-[90vh] z-[60] animate-scaleIn">
            {/* Header */}
            <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-xl">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-primary"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Detalles del Conteo
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  Número de Conteo: {selectedConteo.IBLNR}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Información General</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Número de Conteo:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">{selectedConteo.IBLNR}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span className={`font-semibold ${getStatusClass(selectedConteo.estado)}`}>
                        {getStatusText(selectedConteo.estado)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Centro:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">{selectedConteo.WERKS}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Almacén:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">{selectedConteo.LGORT}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Información de Proceso
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Creado por:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {selectedConteo.usuarioCreador}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fecha de creación:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {formatDate(selectedConteo.fechaCreacion)}
                      </span>
                    </div>
                    {selectedConteo.usuarioModificador && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Modificado por:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {selectedConteo.usuarioModificador}
                        </span>
                      </div>
                    )}
                    {selectedConteo.fechaModificacion && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Fecha de modificación:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {formatDate(selectedConteo.fechaModificacion)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lista de items */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-primary"
                  >
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                    <rect width="6" height="4" x="9" y="3" rx="1"></rect>
                    <path d="M10 14h4"></path>
                    <path d="M12 12v4"></path>
                  </svg>
                  Materiales
                </h3>

                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Material
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Descripción
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Cantidad
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Unidad
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Cases
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedConteo.materiales.map((item, index) => (
                        <React.Fragment key={index}>
                          <tr
                            className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${expandedMaterial === item.MATNR ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                          >
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.MATNR}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.MAKTX || "-"}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.MENGE}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.MEINS}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {item.casesRegistrados.length}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => toggleMaterialExpansion(item.MATNR)}
                                  className="inline-flex items-center justify-center p-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  title={expandedMaterial === item.MATNR ? "Ocultar cases" : "Ver cases"}
                                >
                                  {expandedMaterial === item.MATNR ? (
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
                                      <path d="m18 15-6-6-6 6" />
                                    </svg>
                                  ) : (
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
                                      <path d="m6 9 6 6 6-6" />
                                    </svg>
                                  )}
                                </button>
                                <button
                                  onClick={() => openCasesModal(item)}
                                  className="inline-flex items-center justify-center p-1 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                                  title="Ver detalles de cases"
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
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {expandedMaterial === item.MATNR && (
                            <tr>
                              <td colSpan={6} className="px-0 py-0 border-t-0">
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 animate-fadeIn">
                                  {item.casesRegistrados.length > 0 ? (
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <thead className="bg-gray-100 dark:bg-gray-700">
                                          <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                              Case
                                            </th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                              Ubicación
                                            </th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                              Cantidad
                                            </th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                              Estado
                                            </th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                              Diferencia
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                          {item.casesRegistrados.map((caseItem, caseIndex) => (
                                            <tr key={caseIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                              <td className="px-3 py-2 text-xs text-gray-800 dark:text-gray-200">
                                                {caseItem.case}
                                              </td>
                                              <td className="px-3 py-2 text-xs text-gray-800 dark:text-gray-200">
                                                {caseItem.ubicacion}
                                              </td>
                                              <td className="px-3 py-2 text-xs text-gray-800 dark:text-gray-200 text-right">
                                                {caseItem.cantidad}
                                              </td>
                                              <td className="px-3 py-2 text-xs text-center">
                                                <span
                                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCaseColorClass(caseItem.color)}`}
                                                >
                                                  {caseItem.estado}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2 text-xs text-center">
                                                {caseItem.diferencia !== undefined ? (
                                                  <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                      caseItem.diferencia > 0
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                        : caseItem.diferencia < 0
                                                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                                                    }`}
                                                  >
                                                    {caseItem.diferencia > 0 ? "+" : ""}
                                                    {caseItem.diferencia}
                                                  </span>
                                                ) : (
                                                  "-"
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4">
                                      <p className="text-gray-500 dark:text-gray-400">
                                        No hay cases registrados para este material
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer con botón de cerrar y contabilizar */}
            <div className="sticky bottom-0 z-10 flex justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-b-xl">
              {/* Botón de Contabilizar - Solo visible si el estado es "procesado" y el usuario tiene permiso */}
              {canContabilizarConteo(selectedConteo) && (
                <button
                  onClick={() => handleContabilizarClick(selectedConteo._id)}
                  disabled={isContabilizando && contabilizandoId === selectedConteo._id}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isContabilizando && contabilizandoId === selectedConteo._id ? (
                    <svg
                      className="animate-spin h-4 w-4 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
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
                      className="mr-2"
                    >
                      <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1"></path>
                      <path d="M17 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1"></path>
                      <path d="M12 12v9"></path>
                      <path d="m8 17 4 4 4-4"></path>
                      <path d="M12 12V3"></path>
                    </svg>
                  )}
                  {isContabilizando && contabilizandoId === selectedConteo._id ? "Procesando..." : "Contabilizar"}
                </button>
              )}

              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors ml-auto"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cases */}
      {isCasesModalOpen && selectedMaterial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={closeCasesModal}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-2xl bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col max-h-[90vh] z-[70] animate-scaleIn">
            {/* Header */}
            <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-xl">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-primary"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.29 7 12 12 20.71 7"></polyline>
                    <line x1="12" y1="22" x2="12" y2="12"></line>
                  </svg>
                  Detalles de Cases
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  Material: {selectedMaterial.MATNR} - {selectedMaterial.MAKTX || "Sin descripción"}
                </p>
              </div>
              <button
                onClick={closeCasesModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
              {/* Información del material */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Información del Material
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Material:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedMaterial.MATNR}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Descripción:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedMaterial.MAKTX || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedMaterial.MENGE}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Unidad:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedMaterial.MEINS}</p>
                  </div>
                </div>
              </div>

              {/* Lista de cases */}
              <div className="mb-4">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 text-primary"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.29 7 12 12 20.71 7"></polyline>
                    <line x1="12" y1="22" x2="12" y2="12"></line>
                  </svg>
                  Cases Registrados
                </h3>

                {selectedMaterial.casesRegistrados.length > 0 ? (
                  <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Case
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Ubicación
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Cantidad
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Estado
                          </th>
                          <th
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                          >
                            Diferencia
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedMaterial.casesRegistrados.map((caseItem, caseIndex) => (
                          <tr key={caseIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{caseItem.case}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{caseItem.ubicacion}</td>
                            <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 text-right">
                              {caseItem.cantidad}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCaseColorClass(
                                  caseItem.color,
                                )}`}
                              >
                                {caseItem.estado}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              {caseItem.diferencia !== undefined ? (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    caseItem.diferencia > 0
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : caseItem.diferencia < 0
                                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                                  }`}
                                >
                                  {caseItem.diferencia > 0 ? "+" : ""}
                                  {caseItem.diferencia}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto text-gray-400 mb-3"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                      <line x1="8" x2="16" y1="12" y2="12"></line>
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">No hay cases registrados para este material</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer con botón de cerrar */}
            <div className="sticky bottom-0 z-10 flex justify-end px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-b-xl">
              <button
                onClick={closeCasesModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para contabilizar */}
      {showContabilizarConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden p-4 ml-0 lg:ml-72.5 touch-none">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={cancelContabilizar}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col z-[90] animate-scaleIn">
            {/* Header */}
            <div className="p-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1"></path>
                  <path d="M17 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1"></path>
                  <path d="M12 12v9"></path>
                  <path d="m8 17 4 4 4-4"></path>
                  <path d="M12 12V3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Confirmar Contabilización</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                ¿Está seguro que desea contabilizar este conteo? Esta acción enviará la estructura completa al sistema
                externo.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={cancelContabilizar}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmContabilizar}
                  disabled={isConfirmingContabilizar}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isConfirmingContabilizar ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    "Confirmar"
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

export default ConteoHistory
