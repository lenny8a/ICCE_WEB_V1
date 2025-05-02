"use client"

import { useState, useEffect } from "react"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import axios from "axios"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useAuth } from "../context/AuthContext"

// Interfaces
interface PickingItem {
  material: string
  materialDesc?: string
  materialCode: string
  location: string
  case: string
  quantity: string
  werks: string
  lgort: string
}

// Actualizar la interfaz PickingData para incluir el campo tipodoc
interface PickingData {
  _id: string
  reserva: string
  items: PickingItem[]
  totalItems: number
  status: string
  createdBy: string
  createdAt: string
  updatedAt: string
  contabilizado?: boolean
  mblnr?: string // Código MIGO
  anulado?: boolean // Indicador de anulación
  mblnr_an?: string // Código de anulación
  tipodoc?: string // Añadir este campo para identificar si es reserva (01) u orden (02)
}

// Modificar la interfaz FilterOptions para incluir "cancelled" como opción de estado
interface FilterOptions {
  dateRange: "today" | "week" | "month" | "all"
  status: "completed" | "accounted" | "pending" | "cancelled" | "all"
  sortBy: "date" | "reserva"
  sortOrder: "asc" | "desc"
}

// Primero, actualicemos la interfaz PickingResponse para incluir el campo MBLNR
// Buscar la interfaz PickingResponse y modificarla para incluir el campo MBLNR
// interface PickingResponse {
//   success: boolean
//   message: string
//   data?: {
//     reserva: string
//     items: PickingItem[]
//     totalItems: number
//     status: string
//     createdBy: string
//     createdAt: string
//     updatedAt: string
//     mblnr?: string // Código de contabilización
//     anulado?: boolean // Indicador de anulación
//     mblnr_anul?: string // Código de anulación
//   }
// }

const PickingHistory = () => {
  const [pickings, setPickings] = useState<PickingData[]>([])
  const [filteredPickings, setFilteredPickings] = useState<PickingData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPicking, setSelectedPicking] = useState<PickingData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "all",
    status: "completed", // Por defecto muestra las completadas
    sortBy: "date",
    sortOrder: "desc",
  })

  const [isContabilizing, setIsContabilizing] = useState<string | null>(null)
  const [isAnulando, setIsAnulando] = useState<string | null>(null)

  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
    visible: boolean
  } | null>(null)

  // Add these state variables after the existing state declarations (around line 100)
  const [isConfirmingContabilizar, setIsConfirmingContabilizar] = useState(false)
  const [isConfirmingAnular, setIsConfirmingAnular] = useState(false)
  const [showContabilizarConfirm, setShowContabilizarConfirm] = useState<string | null>(null)
  const [showAnularConfirm, setShowAnularConfirm] = useState<string | null>(null)
  const { checkPermission } = useAuth()

  const canView    = checkPermission("/salida/sal_merca", "visualizar")
  const canProcess = checkPermission("/salida/sal_merca", "contabilizar")
  const canAnular  = checkPermission("/salida/sal_merca", "anular")

  // Verificar permisos al cargar el componente
  useEffect(() => {
    if (!canView) {
  
      // Aquí podrías redirigir al usuario a otra página si lo deseas
    }
  }, [canView])

  const api_url = import.meta.env.VITE_API_URL

  // Cargar los datos al montar el componente
  useEffect(() => {
    fetchPickings()
  }, [filters.status]) // Refetch cuando cambia el filtro de estado

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters()
  }, [pickings, filters, searchTerm])

  // Modificar la función fetchPickings para manejar correctamente el filtro "all"
  const fetchPickings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Determinar qué estado buscar basado en los filtros
      let statusQuery = ""

      if (filters.status === "completed") {
        statusQuery = "status=completed"
      } else if (filters.status === "accounted") {
        statusQuery = "status=accounted"
      } else if (filters.status === "pending") {
        statusQuery = "status=pending"
      } else if (filters.status === "cancelled") {
        statusQuery = "status=cancelled"
      } else {
        // Si es "all", no aplicamos filtro de estado para traer todas las reservas
        statusQuery = ""
      }

      // Construir la URL de la API
      const apiUrl = statusQuery ? `${api_url}/salida/pickings?${statusQuery}` : `${api_url}/salida/pickings`

      // Obtener los pickings según el filtro de estado
      const response = await axios.get(apiUrl)

      if (response.data.success) {
        setPickings(response.data.data || [])
      } else {
        setError("Error al cargar los datos: " + response.data.message)
      }
    } catch (error) {
      console.error("Error al obtener pickings:", error)
      setError("Error al conectar con el servidor. Intente nuevamente más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para aplicar filtros
  const applyFilters = () => {
    let result = [...pickings]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (picking) =>
          picking.reserva.toLowerCase().includes(term) ||
          picking.createdBy.toLowerCase().includes(term) ||
          (picking.mblnr && picking.mblnr.toLowerCase().includes(term)) || // Buscar por código MIGO
          (picking.mblnr_an && picking.mblnr_an.toLowerCase().includes(term)) || // Buscar por código de anulación
          picking.items.some(
            (item) =>
              item.material.toLowerCase().includes(term) ||
              (item.materialDesc && item.materialDesc.toLowerCase().includes(term)),
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

      result = result.filter((picking) => new Date(picking.createdAt) >= startDate)
    }

    // Filtrar por estado (ya no es necesario aquí porque lo hacemos en la API)
    // Pero mantenemos la lógica por si queremos filtrar más específicamente en el cliente

    // Ordenar resultados
    result.sort((a, b) => {
      let comparison = 0

      if (filters.sortBy === "date") {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (filters.sortBy === "reserva") {
        comparison = a.reserva.localeCompare(b.reserva)
      }

      return filters.sortOrder === "asc" ? comparison : -comparison
    })

    setFilteredPickings(result)
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

  // Función para abrir el modal con los detalles
  const openPickingDetails = (picking: PickingData) => {
    setSelectedPicking(picking)
    setIsModalOpen(true)
    // Bloquear scroll del body
    document.body.style.overflow = "hidden"
  }

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPicking(null)
    // Restaurar scroll del body
    document.body.style.overflow = "auto"
  }

  // Función para actualizar los filtros
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Función para refrescar los datos
  const refreshData = () => {
    fetchPickings()
  }

  // Replace the existing handleContabilizar function with this version that uses the confirmation popup
  const handleContabilizarClick = (pickingId: string) => {
    if (!canProcess) {

      return
    }
    setShowContabilizarConfirm(pickingId)
  }

  // Replace the existing handleAnular function with this version that uses the confirmation popup
  const handleAnularClick = (pickingId: string) => {
    if (!canAnular) {

      return
    }
    setShowAnularConfirm(pickingId)
  }

  // Add these functions to handle the confirmation actions
  const confirmContabilizar = async () => {
    if (showContabilizarConfirm && !isConfirmingContabilizar) {
      setIsConfirmingContabilizar(true)
      try {
        await handleContabilizar(showContabilizarConfirm)
      } finally {
        setIsConfirmingContabilizar(false)
        setShowContabilizarConfirm(null)
      }
    }
  }

  const confirmAnular = async () => {
    if (showAnularConfirm && !isConfirmingAnular) {
      setIsConfirmingAnular(true)
      try {
        await handleAnular(showAnularConfirm)
      } finally {
        setIsConfirmingAnular(false)
        setShowAnularConfirm(null)
      }
    }
  }

  // Add these functions to cancel the confirmation
  const cancelContabilizar = () => {
    setShowContabilizarConfirm(null)
  }

  const cancelAnular = () => {
    setShowAnularConfirm(null)
  }

  // Ahora, modificar la función handleContabilizar para llamar a la API /salida/migo
  // Reemplazar la función handleContabilizar completa con esta nueva versión:

  const handleContabilizar = async (pickingId: string) => {
    if (!canProcess) {

      return
    }

    try {
      setIsContabilizing(pickingId)

      // Encontrar la reserva correspondiente al ID del picking
      const picking = pickings.find((p) => p._id === pickingId)
      if (!picking) {
        throw new Error("Picking no encontrado")
      }

      // Preparar los datos para enviar a la API /salida/migo
      const migoData = {
        reserva: picking.reserva,
        tipodoc: picking.tipodoc,
        materiales: picking.items.map((item) => ({
          matnr: item.material,
          maktx: item.materialDesc,
          menge: item.quantity,
          zubic: item.location,
          cases: item.case,
          werks: item.werks,
          lgort: item.lgort,
        })),
      }

      // Llamar a la API /salida/migo
      const migoResponse = await axios.post(`${api_url}/salida/migo`, migoData)
      console.log("Respuesta de MIGO:", migoResponse.data)
      if (migoResponse.data.MBLNR) {
        // Obtener el código MBLNR de la respuesta
        const mblnr = migoResponse.data.MBLNR || migoResponse.data.data?.MBLNR

        if (!mblnr) {
          throw new Error(migoResponse.data.MESSA)
        }

        // Actualizar el estado a "accounted" y guardar el código MBLNR
        const response = await axios.put(`${api_url}/salida/picking/${picking.reserva}/status`, {
          status: "accounted",
          mblnr: mblnr,
        })

        if (response.data.success) {
          // Actualizar el estado local
          setPickings((prevPickings) =>
            prevPickings.map((p) =>
              p._id === pickingId
                ? {
                    ...p,
                    contabilizado: true,
                    status: "accounted",
                    mblnr: mblnr,
                  }
                : p,
            ),
          )

          // También actualizar los pickings filtrados
          setFilteredPickings((prevPickings) =>
            prevPickings.map((p) =>
              p._id === pickingId
                ? {
                    ...p,
                    contabilizado: true,
                    status: "accounted",
                    mblnr: mblnr,
                  }
                : p,
            ),
          )

          // Mostrar notificación de éxito
          setNotification({
            type: "success",
            message: `${getDocumentType(picking.tipodoc)} ${picking.reserva} contabilizado correctamente. Código MIGO: ${mblnr}`,
            visible: true,
          })

          // Ocultar la notificación después de 5 segundos
          setTimeout(() => {
            setNotification(null)
          }, 10000)
        } else {
          throw new Error(response.data.MESSAGE || "Error al actualizar el estado del picking")
        }
      } else {
        throw new Error(migoResponse.data.MESSAGE || "Error en la contabilización MIGO")
      }
    } catch (error) {
      console.error("Error al contabilizar:", error)

      // Mostrar notificación de error
      setNotification({
        type: "error",
        message: `Error al contabilizar el picking: ${error instanceof Error ? error.message : "Error desconocido"}`,
        visible: true,
      })

      // Ocultar la notificación después de 5 segundos
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } finally {
      setIsContabilizing(null)
    }
  }

  // Nueva función para anular un picking contabilizado
  const handleAnular = async (pickingId: string) => {
    if (!canAnular) {
      return
    }

    try {
      setIsAnulando(pickingId)

      // Encontrar la reserva correspondiente al ID del picking
      const picking = pickings.find((p) => p._id === pickingId)
      if (!picking) {
        throw new Error("Picking no encontrado")
      }

      // Preparar los datos para enviar a la API /salida/anular
      const anulaData = {
        reserva: picking.reserva,
        mblnr: picking.mblnr,
        tipodoc: picking.tipodoc,
        materiales: picking.items.map((item) => ({
          matnr: item.material,
          maktx: item.materialDesc,
          menge: item.quantity,
          zubic: item.location,
          cases: item.case,
        })),
      }

      // Llamar a la API /salida/anular
      const anulaResponse = await axios.post(`${api_url}/salida/anular`, anulaData)
      if (anulaResponse.data.MBLNR_AN) {
        // En la función handleAnular, reemplazar:
        // const mblnr_anul = anulaResponse.data.mblnr_anul || anulaResponse.data.mblnr_an ||
        //                   anulaResponse.data.data?.mblnr_anul || anulaResponse.data.data?.mblnr_an;

        // Por:
        const mblnr_an = anulaResponse.data.MBLNR_AN || anulaResponse.data.data?.MBLNR_AN

        // Y luego reemplazar todas las referencias a mblnr_anul en esta función por mblnr_an:
        if (!mblnr_an) {
          console.warn("No se recibió código de anulación")
        }

        // Actualizar el estado a "completed" y marcar como anulado
        const response = await axios.put(`${api_url}/salida/picking/${picking.reserva}/status`, {
          status: "cancelled", // Volvemos al estado cancelled
          anulado: true,
          mblnr_an: mblnr_an, // Guardar el código de anulación
        })

        if (response.data.success) {
          // Actualizar el estado local
          setPickings((prevPickings) =>
            prevPickings.map((p) =>
              p._id === pickingId
                ? {
                    ...p,
                    contabilizado: false,
                    status: "cancelled",
                    anulado: true,
                    mblnr_an: mblnr_an,
                  }
                : p,
            ),
          )

          // También actualizar los pickings filtrados
          setFilteredPickings((prevPickings) =>
            prevPickings.map((p) =>
              p._id === pickingId
                ? {
                    ...p,
                    contabilizado: false,
                    status: "cancelled",
                    anulado: true,
                    mblnr_an: mblnr_an,
                  }
                : p,
            ),
          )

          // Y en el mensaje de notificación:
          setNotification({
            type: "success",
            message: `${getDocumentType(picking.tipodoc)} ${picking.reserva} anulado correctamente${mblnr_an ? `. Código de anulación: ${mblnr_an}` : ""}`,
            visible: true,
          })

          // Ocultar la notificación después de 5 segundos
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        } else {
          throw new Error(response.data.message || "Error al actualizar el estado del picking")
        }
      } else {
        throw new Error(anulaResponse.data.message || "Error en la anulación del picking")
      }
    } catch (error) {
      console.error("Error al anular:", error)

      // Mostrar notificación de error
      setNotification({
        type: "error",
        message: `Error al anular el picking: ${error instanceof Error ? error.message : "Error desconocido"}`,
        visible: true,
      })

      // Ocultar la notificación después de 5 segundos
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } finally {
      setIsAnulando(null)
    }
  }

  // Actualizar el componente para mostrar el tipo de documento en la tabla
  // Buscar la función getStatusText y añadir una función para obtener el tipo de documento
  const getDocumentType = (tipodoc?: string) => {
    return tipodoc === "02" ? "Entrega" : "Reserva"
  }

  // Función para obtener el texto de estado según el valor
  const getStatusText = (status: string, contabilizado?: boolean, anulado?: boolean) => {
    if (status === "cancelled" || anulado) {
      return "Anulado"
    } else if (status === "accounted" || contabilizado) {
      return "Contabilizado"
    } else if (status === "pending") {
      return "Pendiente"
    } else if (status === "completed") {
      return "Completado"
    } else {
      return status
    }
  }

  // Función para obtener la clase de estilo según el estado
  const getStatusClass = (status: string, contabilizado?: boolean, anulado?: boolean) => {
    if (status === "cancelled" || anulado) {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    } else if (status === "accounted" || contabilizado) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    } else if (status === "pending") {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    } else if (status === "completed") {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    } else {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  // Función para verificar si un picking puede ser contabilizado
  const canBeContabilized = (picking: PickingData) => {
    // Solo se puede contabilizar si:
    // 1. El usuario tiene permisos para contabilizar
    // 2. El estado es "completed" (no "accounted")
    // 3. No está marcado como contabilizado
    // 4. No tiene un código MBLNR asignado
    // 5. No está anulado
    return canProcess && picking.status === "completed" && !picking.contabilizado && !picking.mblnr && !picking.anulado
  }

  // Función para verificar si un picking puede ser anulado
  const canBeAnulado = (picking: PickingData) => {
    // Solo se puede anular si:
    // 1. El usuario tiene permisos para anular
    // 2. El estado es "accounted" o está contabilizado
    // 3. Tiene un código MBLNR asignado
    // 4. No está ya anulado
    return canAnular && (picking.status === "accounted" || picking.contabilizado) && picking.mblnr && !picking.anulado
  }

  return (
    <>
      {/* Actualizar el título de la página */}
      <Breadcrumb pageName="Salida de Mercancias" />
      {notification && notification.visible && (
        <div className="fixed top-16 right-4 z-[9999] ml-0 lg:ml-72.5 animate-slideInRight">
          <div
            className={
              notification.type === "success"
                ? "bg-green-500/95 text-white border border-green-600 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between"
                : "bg-red-500/95 text-white border border-red-600 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between"
            }
          >
            <div className="flex items-center">
              {notification.type === "success" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-white hover:text-gray-200 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

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
              {/* Actualizar el título de la sección de búsqueda */}
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Salida de Mercancias</h2>
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
                {/* Actualizar el placeholder del input de búsqueda */}
                <input
                  type="text"
                  placeholder="Buscar por reserva, entrega, material, código MIGO o usuario"
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
                {/* Modificar el selector de estados para incluir la opción "cancelled" */}
                <select
                  className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary text-sm"
                  value={filters.status}
                  onChange={(e) => updateFilter("status", e.target.value)}
                >
                  <option value="completed">Completados</option>
                  <option value="accounted">Contabilizados</option>
                  <option value="pending">Pendientes</option>
                  <option value="cancelled">Anulados</option>
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
                  <option value="reserva">Reserva</option>
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600 dark:text-gray-400">Cargando historial de picking...</p>
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
          ) : filteredPickings.length === 0 ? (
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
                No se encontraron pickings con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <>
              {/* Contador de resultados */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando <span className="font-semibold text-primary">{filteredPickings.length}</span> resultados
                </p>
              </div>

              {/* Tabla para pantallas medianas y grandes */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                      {/* Actualizar la tabla para mostrar el tipo de documento */}
                      {/* Buscar la sección donde se muestra la tabla y modificar la columna "Reserva" por "Documento" */}
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Documento</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Código MIGO</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Items</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Usuario</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPickings.map((picking) => (
                      <tr
                        key={picking._id}
                        className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        {/* Y en la celda correspondiente: */}
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                          {getDocumentType(picking.tipodoc)}: {picking.reserva}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(picking.status, picking.contabilizado, picking.anulado)}`}
                          >
                            {getStatusText(picking.status, picking.contabilizado, picking.anulado)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                          {/* En la tabla para pantallas medianas y grandes: */}
                          {picking.anulado && picking.mblnr_an ? (
                            <span className="font-medium text-red-600 dark:text-red-400">{picking.mblnr_an}</span>
                          ) : picking.mblnr ? (
                            <span className="font-medium text-blue-600 dark:text-blue-400">{picking.mblnr}</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs italic">Sin código</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{picking.totalItems}</td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{picking.createdBy}</td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{formatDate(picking.createdAt)}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openPickingDetails(picking)}
                              className="inline-flex items-center justify-center px-3 py-1.5 bg-primary text-white text-xs rounded-md hover:bg-primary/90 transition-colors w-28"
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

                            {canBeContabilized(picking) ? (
                              <button
                                onClick={() => handleContabilizarClick(picking._id)}
                                disabled={isContabilizing === picking._id}
                                className="inline-flex items-center justify-center px-3 py-1.5 bg-success text-white text-xs rounded-md hover:bg-success/90 transition-colors disabled:bg-gray-400 w-28"
                              >
                                {isContabilizing === picking._id ? (
                                  <svg
                                    className="animate-spin h-3 w-3 mr-1"
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
                                    <path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path>
                                    <polyline points="8 10 12 14 16 10"></polyline>
                                  </svg>
                                )}
                                Contabilizar
                              </button>
                            ) : canBeAnulado(picking) ? (
                              <button
                                onClick={() => handleAnularClick(picking._id)}
                                disabled={isAnulando === picking._id}
                                className="inline-flex items-center justify-center px-3 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400 w-28"
                              >
                                {isAnulando === picking._id ? (
                                  <svg
                                    className="animate-spin h-3 w-3 mr-1"
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
                                    <path d="M3 6h18"></path>
                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                )}
                                Anular
                              </button>
                            ) : (
                              <span className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-md w-28">
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
                                  className="mr-1 text-success"
                                >
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                {picking.anulado
                                  ? "Anulado"
                                  : picking.contabilizado || picking.mblnr
                                    ? "Contabilizado"
                                    : "No disponible"}
                              </span>
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
                {filteredPickings.map((picking, index) => (
                  <div
                    key={picking._id}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in-50 zoom-in-90"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-base">{picking.reserva}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {formatDate(picking.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(picking.status, picking.contabilizado, picking.anulado)}`}
                      >
                        {getStatusText(picking.status, picking.contabilizado, picking.anulado)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Items:</p>
                        <p className="font-medium text-gray-800 dark:text-white">{picking.totalItems}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Usuario:</p>
                        <p className="font-medium text-gray-800 dark:text-white">{picking.createdBy}</p>
                      </div>
                    </div>

                    {/* En la vista de tarjetas para móviles: */}
                    {(picking.mblnr || (picking.anulado && picking.mblnr_an)) && (
                      <div
                        className={`mt-2 ${picking.anulado ? "bg-red-50 dark:bg-red-900/20" : "bg-blue-50 dark:bg-blue-900/20"} p-2 rounded-md`}
                      >
                        <p className="text-xs flex items-center">
                          <span className="text-gray-500 dark:text-gray-400 mr-1">
                            {picking.anulado ? "Código de anulación:" : "Código MIGO:"}
                          </span>
                          <span
                            className={`font-semibold ${picking.anulado ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}
                          >
                            {picking.anulado ? picking.mblnr_an : picking.mblnr}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex flex-wrap items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 gap-2">
                      <button
                        onClick={() => openPickingDetails(picking)}
                        className="inline-flex items-center justify-center px-3 py-1.5 bg-primary text-white text-xs rounded-md hover:bg-primary/90 transition-colors min-w-20"
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
                        Ver
                      </button>

                      {canBeContabilized(picking) ? (
                        <button
                          onClick={() => handleContabilizarClick(picking._id)}
                          disabled={isContabilizing === picking._id}
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-success text-white text-xs rounded-md hover:bg-success/90 transition-colors disabled:bg-gray-400 min-w-20"
                        >
                          {isContabilizing === picking._id ? (
                            <svg
                              className="animate-spin h-3 w-3 mr-1"
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
                              <path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path>
                              <polyline points="8 10 12 14 16 10"></polyline>
                            </svg>
                          )}
                          Contabilizar
                        </button>
                      ) : canBeAnulado(picking) ? (
                        <button
                          onClick={() => handleAnularClick(picking._id)}
                          disabled={isAnulando === picking._id}
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400 min-w-20"
                        >
                          {isAnulando === picking._id ? (
                            <svg
                              className="animate-spin h-3 w-3 mr-1"
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
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          )}
                          Anular
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-md min-w-20">
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
                            className="mr-1 text-success"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          {picking.anulado
                            ? "Anulado"
                            : picking.contabilizado || picking.mblnr
                              ? "Contabilizado"
                              : "No disponible"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {isModalOpen && selectedPicking && (
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
                {/* Actualizar el título del modal de detalles */}
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
                  Detalles del Picking
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {getDocumentType(selectedPicking.tipodoc)}: {selectedPicking.reserva}
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
                    {/* Actualizar la información general en el modal de detalles */}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Documento:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {getDocumentType(selectedPicking.tipodoc)}: {selectedPicking.reserva}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span
                        className={`font-semibold ${
                          selectedPicking.anulado
                            ? "text-red-600 dark:text-red-400"
                            : selectedPicking.status === "accounted" || selectedPicking.contabilizado
                              ? "text-blue-600 dark:text-blue-400"
                              : selectedPicking.status === "pending"
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {getStatusText(selectedPicking.status, selectedPicking.contabilizado, selectedPicking.anulado)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total de Items:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">{selectedPicking.totalItems}</span>
                    </div>
                    {/* Mostrar MIGO si existe */}
                    {selectedPicking.mblnr && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Código MIGO:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedPicking.mblnr}</span>
                      </div>
                    )}
                    {/* Mostrar código de anulación si existe */}
                    {selectedPicking.anulado && selectedPicking.mblnr_an && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Código Anulación:</span>
                        <span className="font-semibold text-red-600 dark:text-red-400">{selectedPicking.mblnr_an}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Información de Proceso
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Creado por:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">{selectedPicking.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fecha de creación:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {formatDate(selectedPicking.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Última actualización:</span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {formatDate(selectedPicking.updatedAt)}
                      </span>
                    </div>
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
                  Items Procesados
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
                          Ubicación
                        </th>
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
                          Centro
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Almacen
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Cantidad
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedPicking.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.material}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                            {item.materialDesc || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.location}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.case}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.werks}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.lgort}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer con botón de cerrar */}
            <div className="sticky bottom-0 z-10 flex justify-end px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-b-xl">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Popup for Contabilizar */}
      {showContabilizarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={cancelContabilizar}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col z-[60] animate-scaleIn">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
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
                    className="text-blue-600 dark:text-blue-400"
                  >
                    <path d="M4 3h16a2 2 0 0 1 2 2v6a10 10 0 0 1-10 10A10 10 0 0 1 2 11V5a2 2 0 0 1 2-2z"></path>
                    <polyline points="8 10 12 14 16 10"></polyline>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirmar Contabilización</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  ¿Está seguro que desea contabilizar este documento? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={cancelContabilizar}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmContabilizar}
                    disabled={isConfirmingContabilizar}
                    className="flex-1 px-4 py-2 bg-success hover:bg-success/90 text-white rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isConfirmingContabilizar ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 mr-2"
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
        </div>
      )}

      {/* Confirmation Popup for Anular */}
      {showAnularConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={cancelAnular}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col z-[60] animate-scaleIn">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
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
                    className="text-red-600 dark:text-red-400"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirmar Anulación</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  ¿Está seguro que desea anular este documento contabilizado? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={cancelAnular}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmAnular}
                    disabled={isConfirmingAnular}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isConfirmingAnular ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 mr-2"
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
        </div>
      )}
    </>
  )
}

export default PickingHistory
