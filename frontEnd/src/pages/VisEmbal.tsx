import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import { useForm } from "react-hook-form"
import ErrorMessage from "../components/ErrorMessage"
import type { viewEmbalForm } from "../types" // Asumiendo que este tipo es necesario
import axios from "axios"
import { useEffect, useState } from "react"
import toast from 'react-hot-toast'; // Importar react-hot-toast
import { useMobile } from "../hooks/use-mobile"

const VisEmbal: React.FC = () => { // Renombrado y tipado como React.FC
  const initialState = {
    embal: "",
  }

  interface Data {
    EMBAL: string
    MBLNR: string
    ERFME: string
    POSNR: string
    MATNR: string
    MAKTX: string
    MENGE: string
    ZSTAT: string
    ZUSER: string
    ZFECH: string
    ZHORA: string
    PSPNR: string
    WERKS: string
    LGORT: string
    ZUBIC: string
    ZCONF: string
    ZFECH_WMS: string
    ZHORA_WMS: string
    ZUSER_WMS: string
    ZEXCU_WMS: string
    ZEXDE_WMS: string
  }

  // Interfaz para los logs de ubicación
  interface UbicacionLog {
    _id: string
    embal: string
    ubicacionAnterior: string
    ubicacionNueva: string
    usuario: string
    fecha: string
    matnr?: string
    maktx?: string
    createdAt: string
  }

  const data1: Data = {
    EMBAL: "",
    MBLNR: "",
    POSNR: "",
    MATNR: "",
    MAKTX: "",
    MENGE: "",
    ERFME: "",
    ZSTAT: "",
    ZUSER: "",
    ZFECH: "",
    ZHORA: "",
    PSPNR: "",
    WERKS: "",
    LGORT: "",
    ZUBIC: "",
    ZCONF: "",
    ZFECH_WMS: "",
    ZHORA_WMS: "",
    ZUSER_WMS: "",
    ZEXCU_WMS: "",
    ZEXDE_WMS: "",
  }

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: initialState })
  const [count, setCount] = useState(data1)
  const api_url = import.meta.env.VITE_API_URL
  // const { toasts, removeToast, success, error } = useToast() // Eliminado
  const [isLoading, setIsLoading] = useState(false)

  // Usar el hook useMobile para detectar si estamos en un dispositivo móvil
  const isMobile = useMobile()

  // Detectar específicamente dispositivos Zebra (podemos usar User-Agent o resolución)
  const [isZebra, setIsZebra] = useState(false)

  // Combinar las detecciones para determinar si mostramos la versión handheld
  const isHandheld = isMobile || isZebra

  // Estados para el historial y el modal
  const [ubicacionLogs, setUbicacionLogs] = useState<UbicacionLog[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [hasHistorial, setHasHistorial] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("basic")

  // Agregar estos estados para los filtros después de los estados existentes
  const [filteredLogs, setFilteredLogs] = useState<UbicacionLog[]>([])
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Detectar dispositivos Zebra basado en User-Agent y resolución
  useEffect(() => {
    const detectZebra = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isZebraDevice =
        userAgent.includes("zebra") ||
        userAgent.includes("tc") ||
        userAgent.includes("mc") ||
        (window.innerWidth === 480 && window.innerHeight === 800) ||
        (window.innerWidth === 800 && window.innerHeight === 480)

      setIsZebra(isZebraDevice)
    }

    detectZebra()

    // También detectar cambios de orientación
    window.addEventListener("resize", detectZebra)

    return () => {
      window.removeEventListener("resize", detectZebra)
    }
  }, [])

  // Optimizaciones para Chrome en dispositivos handheld
  useEffect(() => {
    if (isHandheld && "chrome" in window) {
      document.documentElement.style.overscrollBehavior = "none"
      document.addEventListener("touchstart", () => {}, { passive: true })
    }

    return () => {
      if ("chrome" in window) {
        document.documentElement.style.removeProperty("overscroll-behavior")
      }
    }
  }, [isHandheld])

  useEffect(() => {
    setFocus("embal")
  }, [setFocus])

  // Función para abrir el modal
  const openHistorialModal = () => {
    setIsModalOpen(true)
    // Bloquear el scroll del body cuando el modal está abierto
    document.body.style.overflow = "hidden"
  }

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false)
    // Restaurar el scroll del body cuando el modal se cierra
    document.body.style.overflow = "auto"
  }

  // Efecto para limpiar el estilo de overflow cuando el componente se desmonta
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (error) {
      return dateString
    }
  }

  // Función para aplicar filtros a los logs
  const applyFilters = () => {
    let result = [...ubicacionLogs]

    // Filtrar por fecha
    if (dateFilter !== "all") {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
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
          startDate = new Date(0)
      }

      result = result.filter((log) => new Date(log.fecha) >= startDate)
    }

    // Ordenar por fecha
    result.sort((a, b) => {
      const dateA = new Date(a.fecha).getTime()
      const dateB = new Date(b.fecha).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

    setFilteredLogs(result)
  }

  // Aplicar filtros cuando cambian los criterios o los logs
  useEffect(() => {
    if (ubicacionLogs.length > 0) {
      applyFilters()
    } else {
      setFilteredLogs([])
    }
  }, [ubicacionLogs, dateFilter, sortOrder])

  // Modificar la función handleview para asegurar que hasHistorial se establezca correctamente
  async function handleview(formData: viewEmbalForm) {
    try {
      setIsLoading(true)
      setCount({ ...data1 })
      setUbicacionLogs([]) // Limpiar logs anteriores
      setHasHistorial(false) // Reiniciar el estado del historial

      const Response = await axios.post(`${api_url}/entr/view`, formData)

      if (!Response.data.EMBALAJE || !Response.data.EMBALAJE.EMBAL) {
        toast.error(`No se encontró el case ${formData.embal}`)
        reset()
        setIsLoading(false)
        return
      }

      setCount(Response.data.EMBALAJE)
      toast.success(`Case ${formData.embal} encontrado`)

      // Cargar el historial de ubicaciones
      try {
        setIsLoadingLogs(true)
        const logsResponse = await axios.get(`${api_url}/ubicacion-log/${formData.embal}`)

        if (logsResponse.data && logsResponse.data.data) {
          const logs = logsResponse.data.data || []
          setUbicacionLogs(logs)

          // Indicar si hay historial disponible
          const hasLogs = Array.isArray(logs) && logs.length > 0
          setHasHistorial(hasLogs)

          // Inicializar los filtros
          setFilteredLogs(logs)
          setDateFilter("all")
          setSortOrder("desc")
        } else {
          setUbicacionLogs([])
          setHasHistorial(false)
        }
      } catch (err) {
        console.error("Error al cargar historial de ubicaciones:", err)
        setUbicacionLogs([])
        setHasHistorial(false)
      } finally {
        setIsLoadingLogs(false)
      }

      reset()
      setIsLoading(false)
      // Establecer la pestaña activa a "basic" cuando se carga un nuevo case
      setActiveTab("basic")
    } catch (err) {
      console.error("Error al buscar el case:", err) // Mantener para debugging de API
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          toast.error(`No se encontró el case ${formData.embal}. Verifique el número e intente nuevamente.`)
        } else {
          toast.error(`Error al buscar el case: ${err.response?.data?.message || "Error desconocido"}`)
        }
      } else {
        toast.error(`Error al buscar el case ${formData.embal}. Verifique su conexión e intente nuevamente.`)
      }
      reset()
      setIsLoading(false)
    }
  }

  // Agrupar los datos en secciones para mejor organización en móvil
  const dataGroups = [
    {
      id: "basic",
      title: "Información básica",
      icon: (
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
          className="text-primary mr-2"
        >
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
          <path d="m3.3 7 8.7 5 8.7-5"></path>
          <path d="M12 22V12"></path>
        </svg>
      ),
      items: [
        { label: "Case", value: count.EMBAL },
        { label: "Material", value: count.MATNR },
        { label: "Descripción", value: count.MAKTX },
        { label: "Estado", value: count.ZSTAT },
        { label: "Unidad de medida", value: count.ERFME },
        { label: "Cantidad", value: count.MENGE },
      ],
    },
    {
      id: "location",
      title: "Ubicación",
      icon: (
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
          className="text-blue-500 mr-2"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      ),
      items: [
        { label: "Centro", value: count.WERKS },
        { label: "Almacén", value: count.LGORT },
        { label: "Ubicación", value: count.ZUBIC },
      ],
    },
    {
      id: "creation",
      title: "Información de creación",
      icon: (
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
          className="text-green-500 mr-2"
        >
          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
          <path d="M3 9h18"></path>
          <path d="M9 21V9"></path>
        </svg>
      ),
      items: [
        { label: "Fecha ingreso", value: count.ZFECH },
        { label: "Doc. Material", value: count.MBLNR },
        { label: "Usuario creador", value: count.ZUSER },
        { label: "Proyecto", value: count.PSPNR },
      ],
    },
    {
      id: "wms",
      title: "Información WMS",
      icon: (
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
          className="text-purple-500 mr-2"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
      items: [
        { label: "Usuario Ubicador", value: count.ZUSER_WMS },
        { label: "Fecha WMS", value: count.ZFECH_WMS },
        { label: "Hora WMS", value: count.ZHORA_WMS },
      ],
    },
    {
      id: "exceptions",
      title: "Excepciones",
      icon: (
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
          className="text-danger mr-2"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
      items: [
        { label: "Cod. excepción", value: count.ZEXCU_WMS },
        { label: "Des. excepcion", value: count.ZEXDE_WMS },
      ],
    },
  ]

  // Renderizar la versión para dispositivos handheld
  const renderHandheldVersion = () => {
    return (
      <div className="p-2">
        {/* ToastContainer eliminado */}

        <div className="grid grid-cols-1 gap-3">
          {/* Título para dispositivos handheld */}
          <div className="bg-primary text-white py-2 px-3 rounded-t-md flex items-center justify-between">
            <h1 className="text-lg font-bold">Visualizar Case</h1>
          </div>

          {/* Sección de búsqueda optimizada para handheld */}
          <div className="bg-white dark:bg-boxdark rounded-md shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-3 pb-2">
              <form id="form1" onSubmit={handleSubmit(handleview)}>
                <div className="flex flex-col">
                  <div className="flex items-center mb-2">
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
                      className="text-primary mr-2"
                    >
                      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                      <path d="M18 14h-8"></path>
                      <path d="M15 18h-5"></path>
                      <path d="M10 6h8v4h-8V6Z"></path>
                    </svg>
                    <label htmlFor="embal" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Número de case:
                    </label>
                  </div>

                  <div className="flex items-center">
                    <div className="relative flex-grow">
                      <input
                        id="embal"
                        type="text"
                        placeholder="Escanee o ingrese el case"
                        className="w-full rounded-l-md border border-gray-200 bg-transparent py-2.5 pl-3 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary text-base touch-manipulation"
                        {...register("embal", { required: "El número de case es obligatorio" })}
                        disabled={isLoading}
                        autoComplete="off"
                        inputMode="text"
                        enterKeyHint="search"
                      />
                    </div>
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-1 rounded-r-md bg-primary px-4 py-2.5 font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary text-base"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <svg
                          className="h-5 w-5 animate-spin"
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
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.3-4.3"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.embal && <ErrorMessage>{errors.embal.message}</ErrorMessage>}
                </div>
              </form>
            </div>
          </div>

          {/* Información del case - Mostrar solo si hay datos */}
          {count.EMBAL && (
            <div className="bg-white dark:bg-boxdark rounded-md shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              {/* Encabezado con información principal */}
              <div className="p-3 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
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
                      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                      <path d="M18 14h-8"></path>
                      <path d="M15 18h-5"></path>
                      <path d="M10 6h8v4h-8V6Z"></path>
                    </svg>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">{count.EMBAL}</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-1">
                        {count.MATNR} - {count.MAKTX}
                      </p>
                    </div>
                  </div>

                  {/* Botón para ver historial - Solo habilitado si hay historial */}
                  {hasHistorial && (
                    <button
                      onClick={openHistorialModal}
                      disabled={!hasHistorial || isLoadingLogs}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                        hasHistorial && !isLoadingLogs
                          ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      title={hasHistorial ? "Ver historial de ubicaciones" : "No hay historial disponible"}
                    >
                      {isLoadingLogs ? (
                        <>
                          <svg
                            className="animate-spin h-3.5 w-3.5"
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
                          <span>Cargando...</span>
                        </>
                      ) : (
                        <>
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
                          >
                            <path d="M12 8v4l3 3"></path>
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                          <span>Historial</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Pestañas para dispositivos handheld */}
              <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                {dataGroups.map((group) => {
                  // Filtrar para mostrar solo grupos con al menos un valor
                  const hasValues = group.items.some((item) => item.value)
                  if (!hasValues) return null

                  return (
                    <button
                      key={group.id}
                      className={`flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === group.id
                          ? "border-primary text-primary"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      }`}
                      onClick={() => setActiveTab(group.id)}
                    >
                      {group.title}
                    </button>
                  )
                })}
              </div>

              {/* Secciones de datos agrupados */}
              <div className="p-3">
                {dataGroups.map((group) => {
                  // Filtrar para mostrar solo grupos con al menos un valor
                  const hasValues = group.items.some((item) => item.value)
                  if (!hasValues || activeTab !== group.id) return null

                  return (
                    <div key={group.id} className="space-y-2">
                      {group.items.map(
                        (item, itemIndex) =>
                          item.value && (
                            <div
                              key={itemIndex}
                              className="flex flex-col border-b border-gray-100 dark:border-gray-700 pb-2 last:border-0 last:pb-0"
                            >
                              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                {item.label}:
                              </span>
                              <span className="text-base font-medium text-gray-800 dark:text-white break-words">
                                {item.value}
                              </span>
                            </div>
                          ),
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Botones de acción para handheld */}
              {hasHistorial && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={openHistorialModal}
                    disabled={!hasHistorial || isLoadingLogs}
                    className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-md font-medium text-base hover:bg-blue-600 transition-colors"
                  >
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
                    >
                      <path d="M12 8v4l3 3"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    Ver Historial de Ubicaciones
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal para mostrar el historial de ubicaciones - Optimizado para handheld */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-0 touch-none"
            style={{
              willChange: "transform",
              backfaceVisibility: "hidden",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm"
              onClick={closeModal}
              style={{ userSelect: "none" }}
            ></div>

            <div className="relative w-full h-full bg-white dark:bg-boxdark flex flex-col z-[60]">
              {/* Header */}
              <div className="sticky top-0 z-10 flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate flex items-center">
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
                      className="mr-2 text-blue-500"
                    >
                      <path d="M12 8v4l3 3"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    Historial de Ubicaciones
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">Case: {count.EMBAL}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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

              {/* Filtros simplificados para handheld */}
              <div className="bg-white dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
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
                      className="mr-2 text-primary"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    Filtros
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    {filteredLogs.length} registros
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Filtro por fecha */}
                  <div>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "week" | "month")}
                      className="w-full rounded-md border border-gray-200 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary text-sm"
                    >
                      <option value="all">Todos</option>
                      <option value="today">Hoy</option>
                      <option value="week">Semana</option>
                      <option value="month">Mes</option>
                    </select>
                  </div>

                  {/* Ordenar por */}
                  <div>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                      className="w-full rounded-md border border-gray-200 bg-transparent py-2 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary text-sm"
                    >
                      <option value="desc">Reciente primero</option>
                      <option value="asc">Antiguo primero</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contenido con scroll */}
              <div
                className="overflow-y-auto flex-grow"
                style={{
                  contain: "content",
                  contentVisibility: "auto",
                }}
              >
                {/* Lista de historial optimizada para handheld */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {ubicacionLogs.length === 0
                        ? "No hay registros de cambios de ubicación para este case."
                        : "No se encontraron registros que coincidan con los filtros aplicados."}
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div key={log._id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
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
                              className="text-blue-500 mr-2"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {log.ubicacionNueva || <span className="text-gray-400 italic">Sin ubicación</span>}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(log.fecha)}</span>
                        </div>
                        <div className="ml-6 text-xs text-gray-500 dark:text-gray-400">
                          Ubicación anterior: {log.ubicacionAnterior || <span className="italic">Sin ubicación</span>}
                        </div>
                        <div className="ml-6 text-xs text-gray-500 dark:text-gray-400">Usuario: {log.usuario}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer con botón de cerrar */}
              <div className="sticky bottom-0 z-10 p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark">
                <button
                  onClick={closeModal}
                  className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md transition-colors text-base font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Renderizar la versión para pantallas normales
  const renderDesktopVersion = () => {
    return (
      <>
        <Breadcrumb pageName="Visualizar case" />
        {/* ToastContainer eliminado */}

        <div className="grid grid-cols-1 gap-4">
          {/* Sección de búsqueda mejorada */}
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
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                  <path d="M18 14h-8"></path>
                  <path d="M15 18h-5"></path>
                  <path d="M10 6h8v4h-8V6Z"></path>
                </svg>
                <h2 className="text-base font-semibold text-gray-800 dark:text-white">Consultar Case</h2>
              </div>

              <form id="form1" onSubmit={handleSubmit(handleview)}>
                <div className="flex items-center">
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
                      id="embal"
                      type="text"
                      placeholder="Número de case"
                      className="w-full rounded-l-md border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary text-sm"
                      {...register("embal", { required: "El número de case es obligatorio" })}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 rounded-r-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg
                        className="h-4 w-4 animate-spin"
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
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                    )}
                    <span>Buscar</span>
                  </button>
                </div>
                {errors.embal && <ErrorMessage>{errors.embal.message}</ErrorMessage>}
              </form>
            </div>
          </div>

          {/* Información del case - Mostrar solo si hay datos */}
          {count.EMBAL && (
            <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-scaleIn">
              <div className="p-4">
                {/* Encabezado con información principal */}
                <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-md border-l-4 border-primary">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
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
                        className="text-primary mr-3"
                      >
                        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                        <path d="M18 14h-8"></path>
                        <path d="M15 18h-5"></path>
                        <path d="M10 6h8v4h-8V6Z"></path>
                      </svg>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Case: {count.EMBAL}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {count.MATNR} - {count.MAKTX}
                        </p>
                      </div>
                    </div>

                    {/* Botón para ver historial - Solo habilitado si hay historial */}
                    <button
                      onClick={openHistorialModal}
                      disabled={!hasHistorial || isLoadingLogs}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                        hasHistorial && !isLoadingLogs
                          ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow-md"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      title={hasHistorial ? "Ver historial de ubicaciones" : "No hay historial disponible"}
                    >
                      {isLoadingLogs ? (
                        <>
                          <svg
                            className="animate-spin h-3.5 w-3.5"
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
                          <span>Cargando...</span>
                        </>
                      ) : (
                        <>
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
                          >
                            <path d="M12 8v4l3 3"></path>
                            <circle cx="12" cy="12" r="10"></circle>
                          </svg>
                          <span>{hasHistorial ? "Ver historial" : "Sin historial"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Secciones de datos agrupados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dataGroups.map((group, groupIndex) => {
                    // Filtrar para mostrar solo grupos con al menos un valor
                    const hasValues = group.items.some((item) => item.value)
                    if (!hasValues) return null

                    return (
                      <div
                        key={groupIndex}
                        className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-center">
                          {group.icon}
                          <h4 className="font-semibold text-gray-800 dark:text-white">{group.title}</h4>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          {group.items.map((item, itemIndex) =>
                            item.value ? (
                              <div key={itemIndex} className="px-4 py-2.5 flex flex-col sm:flex-row sm:justify-between">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                  {item.label}:
                                </span>
                                <span className="text-sm font-medium text-gray-800 dark:text-white break-words">
                                  {item.value}
                                </span>
                              </div>
                            ) : null,
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal para mostrar el historial de ubicaciones */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
              onClick={closeModal}
              style={{ userSelect: "none" }}
            ></div>

            <div className="relative w-full max-w-4xl bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col max-h-[90vh] z-[60] animate-scaleIn">
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
                      className="mr-2 text-blue-500"
                    >
                      <path d="M12 8v4l3 3"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    Historial de Ubicaciones
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                    Case: {count.EMBAL} | {count.MATNR} - {count.MAKTX}
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
                {/* Información del historial */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 flex items-center justify-between">
                  <div className="flex items-center">
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
                      className="text-blue-500 mr-2"
                    >
                      <path d="M12 8v4l3 3"></path>
                      <circle cx="12" cy="12" r="10"></circle>
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Historial de cambios de ubicación para este case
                    </span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    {filteredLogs.length} de {ubicacionLogs.length} registros
                  </span>
                </div>

                {/* Sección de filtros simplificada */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
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
                        className="mr-2 text-primary"
                      >
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                      </svg>
                      Filtros
                    </h3>
                    <button
                      onClick={() => {
                        setDateFilter("all")
                        setSortOrder("desc")
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                        <path d="M3 3v5h5"></path>
                      </svg>
                      Restablecer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Filtro por fecha */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Período</label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "week" | "month")}
                        className="w-full rounded-md border border-gray-200 bg-transparent py-1.5 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary text-xs"
                      >
                        <option value="all">Todos los períodos</option>
                        <option value="today">Hoy</option>
                        <option value="week">Última semana</option>
                        <option value="month">Último mes</option>
                      </select>
                    </div>

                    {/* Ordenar por */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Ordenar por fecha
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                        className="w-full rounded-md border border-gray-200 bg-transparent py-1.5 px-3 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary text-xs"
                      >
                        <option value="desc">Más reciente primero</option>
                        <option value="asc">Más antiguo primero</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tabla de historial */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Fecha
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Ubicación Anterior
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Ubicación Nueva
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Usuario
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {formatDate(log.fecha)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {log.ubicacionAnterior || <span className="text-gray-400 italic">Sin ubicación</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                            {log.ubicacionNueva || <span className="text-gray-400 italic">Sin ubicación</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {log.usuario}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mensaje si no hay registros */}
                {filteredLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {ubicacionLogs.length === 0
                      ? "No hay registros de cambios de ubicación para este case."
                      : "No se encontraron registros que coincidan con los filtros aplicados."}
                  </div>
                )}
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
      </>
    )
  }

  return isHandheld ? renderHandheldVersion() : renderDesktopVersion()
}

export default VisEmbal; // Exportar con el nuevo nombre
