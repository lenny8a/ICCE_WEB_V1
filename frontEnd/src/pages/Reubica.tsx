"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import ErrorMessage from "../components/ErrorMessage"
import type { viewEmbalForm } from "../types"
import { useToast } from "../hooks/useToast"
import ToastContainer from "../components/ToastContainer"
import { useMobile } from "../hooks/use-mobile"

// Componente de diálogo de confirmación más compacto
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isMobile,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  isMobile?: boolean
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto ml-0 lg:ml-72.5 pt-16">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay con animación de fade */}
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity animate-fadeIn"
          onClick={onClose}
        ></div>

        {/* Contenedor principal con animación de entrada */}
        <div
          className={`relative w-full ${isMobile ? "max-w-[90%]" : "max-w-sm"} bg-white dark:bg-boxdark rounded-md shadow-lg transform transition-all mx-auto animate-scaleIn overflow-hidden border border-gray-100 dark:border-gray-700`}
        >
          {/* Header */}
          <div className="px-3 py-2 bg-gradient-to-r from-primary/90 to-primary text-white">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${isMobile ? "h-4 w-4 mr-1.5" : "h-5 w-5 mr-2"} text-white`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className={`${isMobile ? "text-sm" : "text-base"} font-bold text-white`}>{title}</h3>
            </div>
          </div>

          {/* Content */}
          <div className={`${isMobile ? "p-3" : "p-4"}`}>
            <p className={`${isMobile ? "text-xs" : "text-sm"} text-gray-700 dark:text-gray-300`}>{message}</p>
          </div>

          {/* Footer */}
          <div className={`${isMobile ? "px-3 py-2" : "px-4 py-3"} bg-gray-50 dark:bg-gray-800 flex justify-end gap-2`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md ${isMobile ? "text-xs" : "text-sm"} font-medium hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${isMobile ? "h-3 w-3 mr-0.5" : "h-3.5 w-3.5 mr-1"} text-gray-500`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              No
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`px-3 py-1.5 bg-primary text-white rounded-md ${isMobile ? "text-xs" : "text-sm"} font-medium hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${isMobile ? "h-3 w-3 mr-0.5" : "h-3.5 w-3.5 mr-1"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Sí
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Reubica = () => {
  const initialState = {
    embal: "",
    zubic: "",
  }

  interface Data {
    EMBAL: string
    MBLNR: string
    POSNR: string
    MATNR: string
    MAKTX: string
    MENGE: string
    ERFME: string
    ZUBIC: string
  }

  interface ExcepcionData {
    _id: string
    id: string
    name: string
    active: boolean
  }

  // Detectar si estamos en un dispositivo móvil
  const isMobile = useMobile()
  // Estado para pantallas muy pequeñas (480x800)
  const [isSmallScreen, setIsSmallScreen] = useState(false)

  // Función para eliminar ceros a la izquierda
  const removeLeadingZeros = (value: string): string => {
    return value.replace(/^0+/, "")
  }

  const data1: Data = {
    EMBAL: "",
    MBLNR: "",
    POSNR: "",
    MATNR: "",
    MAKTX: "",
    MENGE: "",
    ERFME: "",
    ZUBIC: "",
  }

  const form1 = useForm({ defaultValues: initialState })
  const form2 = useForm({ defaultValues: initialState })
  const { toasts, removeToast, success, error } = useToast()
  const api_url = import.meta.env.VITE_API_URL
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<viewEmbalForm | null>(null)

  // Datos de ejemplo para las excepciones
  const [excepciones, setExcepciones] = useState<ExcepcionData[]>([])
  const [isLoadingExcepciones, setIsLoadingExcepciones] = useState(false)

  const {
    register: registerForm1,
    handleSubmit: handleSubmitForm1,
    setFocus,
    reset: resetForm1,
    formState: { errors: errorsForm1 },
  } = form1

  const {
    register: registerForm2,
    handleSubmit: handleSubmitForm2,
    reset: resetForm2,
    formState: { errors: errorsForm2 },
    watch: watchForm2,
  } = form2

  // Observar el campo zubic para detectar cuando está vacío
  const zubicValue = watchForm2("zubic")

  const [count, setCount] = useState(data1)

  useEffect(() => {
    setFocus("embal")
  }, [setFocus])

  // Detectar pantallas muy pequeñas (480x800)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 480)
    }

    // Comprobar al cargar
    checkScreenSize()

    // Comprobar al cambiar el tamaño de la ventana
    window.addEventListener("resize", checkScreenSize)

    return () => {
      window.removeEventListener("resize", checkScreenSize)
    }
  }, [])

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
        // Si hay un error, establecer al menos la excepción por defecto
        setExcepciones([{ _id: "default", id: "00", name: "Sin problemas", active: true }])
      }
    } catch (error) {
      console.error("Error al cargar excepciones:", error)
      // En caso de error, establecer al menos la excepción por defecto
      setExcepciones([{ _id: "default", id: "00", name: "Sin problemas", active: true }])
    } finally {
      setIsLoadingExcepciones(false)
    }
  }

  useEffect(() => {
    fetchExcepciones()
  }, [])

  async function handleview(formData: viewEmbalForm) {
    try {
      setIsLoading(true)
      resetForm2()
      resetForm1()
      setCount({ ...data1 })
      const Response = await axios.post(`${api_url}/entr/view`, formData)

      console.log(Response.data)

      if (Response.data.CODE !== "OK") {
        let descript = ""

        if (Response.data.CODE === "RET") {
          descript = "Case en estado retenido, no es posible reubicar"
        }

        if (Response.data.CODE === "DEL") {
          descript = "Case en estado eliminado, no es posible reubicar"
        }

        error(`${descript}`)
        setIsLoading(false)
        return
      }

      if (!Response.data.EMBALAJE || !Response.data.EMBALAJE.EMBAL) {
        error(`No se encontró el case ${formData.embal}`)
        setIsLoading(false)
        return
      }

      setCount(Response.data.EMBALAJE)
      success(`Case ${formData.embal} encontrado`)
      setIsLoading(false)
    } catch (err) {
      console.error("Error al buscar el case:", err)
      resetForm1()

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          error(`No se encontró el case ${formData.embal}. Verifique el número e intente nuevamente.`)
        } else {
          error(`Error al buscar el case: ${err.response?.data?.message || "Error desconocido"}`)
        }
      } else {
        error(`Error al buscar el case ${formData.embal}. Verifique su conexión e intente nuevamente.`)
      }
      setIsLoading(false)
    }
  }

  // Función para manejar el envío del formulario
  const handleFormSubmit = (formData: viewEmbalForm) => {
    // Si la ubicación está vacía, mostrar diálogo de confirmación
    if (!formData.zubic || formData.zubic.trim() === "") {
      setPendingFormData(formData)
      setIsConfirmDialogOpen(true)
      return
    }

    // Si hay ubicación, proceder normalmente
    handleReubica(formData)
  }

  async function handleReubica(formData: viewEmbalForm) {
    try {
      setIsLoading(true)

      // Limpiar ceros a la izquierda del case
      formData.embal = removeLeadingZeros(count.EMBAL)

      // Guardar la ubicación anterior para el log
      const ubicacionAnterior = count.ZUBIC || ""

      // Versión segura que evita el error
      formData.zubic = formData.zubic ? String(formData.zubic).toUpperCase() : ""

      // Realizar la reubicación
      const Response = await axios.post(`${api_url}/entr/reubica`, formData)

      // Si la reubicación fue exitosa, registrar el log
      if (Response.data) {
        try {
          // Crear el objeto de log
          const logData = {
            embal: removeLeadingZeros(count.EMBAL), // Limpiar ceros a la izquierda
            ubicacionAnterior: ubicacionAnterior,
            ubicacionNueva: formData.zubic,
            usuario: "usuario_actual", // Idealmente, obtener el usuario actual del sistema
            matnr: count.MATNR,
            maktx: count.MAKTX,
          }

          // Enviar el log a la API
          await axios.post(`${api_url}/ubicacion-log`, logData)
          console.log("Log de ubicación registrado correctamente")
        } catch (logErr) {
          console.error("Error al registrar log de ubicación:", logErr)
          // No interrumpimos el flujo principal si falla el registro del log
        }
      }

      success(`Case ${count.EMBAL} reubicado correctamente a: ${formData.zubic || "Sin ubicación"}`)

      count.ZUBIC = formData.zubic
      resetForm2()
      setFocus("embal")
      setIsLoading(false)
    } catch (err) {
      console.error("Error al actualizar la ubicación:", err)
      resetForm2()

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          error(`No se encontró el case para reubicar. Verifique el número e intente nuevamente.`)
        } else {
          error(`Error al actualizar la ubicación: ${err.response?.data?.message || "Error desconocido"}`)
        }
      } else {
        error("Error al actualizar la ubicación. Intente nuevamente.")
      }
      setIsLoading(false)
    }
  }

  async function handleExcepcion(excepcion: ExcepcionData) {
    try {
      setIsLoading(true)

      const excepcionData = {
        embal: removeLeadingZeros(count.EMBAL), // Limpiar ceros a la izquierda
        zexcu_wms: excepcion.id,
        zexde_wms: excepcion.name,
      }

      const response = await axios.post(`${api_url}/entr/excepcion`, excepcionData)
      setIsModalOpen(false)
      success(`Excepción "${excepcion.name}" registrada correctamente para el case ${count.EMBAL}`)

      resetForm2()
      resetForm1()
      setCount({ ...data1 })
      setFocus("embal")
    } catch (err) {
      console.error("Error al registrar la excepción:", err)

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          error(`No se encontró el case para registrar la excepción.`)
        } else {
          error(`Error al registrar la excepción: ${err.response?.data?.message || "Error desconocido"}`)
        }
      } else {
        error("Error al registrar la excepción. Intente nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    // Crear un elemento de estilo
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes scaleIn {
        from { 
          opacity: 0; 
          transform: scale(0.95);
        }
        to { 
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out forwards;
      }

      .animate-scaleIn {
        animation: scaleIn 0.3s ease-out forwards;
      }

      .animate-slideInRight {
        animation: slideInRight 0.3s ease-out forwards;
      }
    `

    // Añadir al head
    document.head.appendChild(styleElement)

    // Limpiar al desmontar
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Renderizado para dispositivos móviles
  if (isMobile) {
    return (
      <>
        <Breadcrumb pageName="Ubicar Case" />

        <ToastContainer toasts={toasts} removeToast={removeToast} />

        {/* Diálogo de confirmación */}
        <ConfirmDialog
          isOpen={isConfirmDialogOpen}
          onClose={() => setIsConfirmDialogOpen(false)}
          onConfirm={() => {
            if (pendingFormData) {
              handleReubica(pendingFormData)
              setPendingFormData(null)
            }
          }}
          title="Confirmar acción"
          message="¿Está seguro que desea borrar la ubicación?"
          isMobile={isSmallScreen}
        />

        <div className="grid grid-cols-1 gap-1.5">
          {/* Sección de búsqueda - Versión móvil optimizada para 480x800 */}
          <div className="bg-white dark:bg-boxdark rounded-md shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className={`${isSmallScreen ? "p-2" : "p-3"}`}>
              <form id="form1" onSubmit={handleSubmitForm1(handleview)}>
                <div className="flex flex-col space-y-1.5">
                  <label
                    className={`${isSmallScreen ? "text-[10px]" : "text-xs"} font-medium text-gray-700 dark:text-gray-300`}
                  >
                    Escanear Case
                  </label>
                  <div className="flex">
                    <input
                      id="embal"
                      type="text"
                      placeholder="Número de case"
                      className={`w-full rounded-l-md border border-gray-200 bg-transparent ${isSmallScreen ? "py-2 px-2 text-sm" : "py-2.5 px-3 text-base"} text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary`}
                      {...registerForm1("embal", { required: "El número de case es obligatorio" })}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      className={`flex items-center justify-center gap-1 rounded-r-md bg-primary ${isSmallScreen ? "px-3 py-2" : "px-4 py-2.5"} text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <svg
                          className={`${isSmallScreen ? "h-4 w-4" : "h-5 w-5"} animate-spin`}
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
                          width={isSmallScreen ? "18" : "20"}
                          height={isSmallScreen ? "18" : "20"}
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
                  {errorsForm1.embal && <ErrorMessage>{errorsForm1.embal.message}</ErrorMessage>}
                </div>
              </form>
            </div>
          </div>

          {/* Sección de información del case - Versión móvil optimizada para 480x800 */}
          {count?.EMBAL && (
            <div className="bg-white dark:bg-boxdark rounded-md shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 animate-scaleIn">
              <div className={`${isSmallScreen ? "p-2" : "p-3"}`}>
                {/* Encabezado con información del case */}
                <div
                  className={`flex justify-between items-center ${isSmallScreen ? "mb-1.5 pb-1.5" : "mb-2 pb-2"} border-b border-gray-200 dark:border-gray-700`}
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={isSmallScreen ? "16" : "18"}
                      height={isSmallScreen ? "16" : "18"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-primary ${isSmallScreen ? "mr-1" : "mr-1.5"}`}
                    >
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                      <path d="m3.3 7 8.7 5 8.7-5"></path>
                      <path d="M12 22V12"></path>
                    </svg>
                    <h2
                      className={`${isSmallScreen ? "text-xs" : "text-sm"} font-semibold text-gray-800 dark:text-white`}
                    >
                      Case: {count.EMBAL}
                    </h2>
                  </div>
                </div>

                <form id="form2" onSubmit={handleSubmitForm2(handleFormSubmit)}>
                  {/* Información del material en una sola carta - Versión móvil optimizada para 480x800 */}
                  <div
                    className={`bg-gray-50 dark:bg-gray-800/50 rounded-md ${isSmallScreen ? "p-1.5" : "p-2"} border border-gray-100 dark:border-gray-700 ${isSmallScreen ? "mb-2" : "mb-3"}`}
                  >
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div>
                        <p
                          className={`font-medium text-gray-500 dark:text-gray-400 ${isSmallScreen ? "text-[10px]" : "text-xs"}`}
                        >
                          Material:
                        </p>
                        <p
                          className={`font-semibold text-gray-800 dark:text-white ${isSmallScreen ? "text-[11px]" : "text-xs"}`}
                        >
                          {count.MATNR}
                        </p>
                      </div>

                      <div>
                        <p
                          className={`font-medium text-gray-500 dark:text-gray-400 ${isSmallScreen ? "text-[10px]" : "text-xs"}`}
                        >
                          Cantidad:
                        </p>
                        <div className="flex items-center">
                          <p
                            className={`font-semibold text-primary dark:text-primary ${isSmallScreen ? "text-[11px]" : "text-xs"}`}
                          >
                            {count.MENGE}
                          </p>
                          <span
                            className={`ml-1 text-gray-500 dark:text-gray-400 ${isSmallScreen ? "text-[10px]" : "text-xs"}`}
                          >
                            {count.ERFME}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <p
                          className={`font-medium text-gray-500 dark:text-gray-400 ${isSmallScreen ? "text-[10px]" : "text-xs"}`}
                        >
                          Descripción:
                        </p>
                        <p
                          className={`text-gray-800 dark:text-white truncate ${isSmallScreen ? "text-[11px]" : "text-xs"}`}
                        >
                          {count.MAKTX}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <p
                          className={`font-medium text-gray-500 dark:text-gray-400 ${isSmallScreen ? "text-[10px]" : "text-xs"}`}
                        >
                          Ubicación actual:
                        </p>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`${isSmallScreen ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-0.5"} text-blue-500`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span
                            className={`font-medium text-gray-800 dark:text-white ${isSmallScreen ? "text-[11px]" : "text-xs"}`}
                          >
                            {count.ZUBIC || "Sin ubicación"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campo de ubicación destino - Versión móvil optimizada para 480x800 */}
                  <div className={`${isSmallScreen ? "mb-2" : "mb-3"}`}>
                    <label
                      className={`block ${isSmallScreen ? "text-[10px] mb-0.5" : "text-xs mb-1"} font-medium text-gray-700 dark:text-white`}
                    >
                      Ubicación Destino
                    </label>
                    <input
                      type="text"
                      id="ubi"
                      autoFocus
                      className={`w-full rounded-md border border-gray-200 bg-transparent ${isSmallScreen ? "py-2 px-2 text-sm" : "py-3 px-3 text-base"} text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary uppercase`}
                      placeholder="Ingresar ubicación"
                      {...registerForm2("zubic", {
                        setValueAs: (value: string) => (value ? value.toUpperCase() : ""),
                      })}
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement
                        input.value = input.value.toUpperCase()
                      }}
                      disabled={isLoading}
                    />
                    {errorsForm2.zubic && <ErrorMessage>{errorsForm2.zubic.message}</ErrorMessage>}
                  </div>

                  {/* Botones de acción - Versión móvil optimizada para 480x800 */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="submit"
                      className={`flex items-center justify-center gap-1 rounded-md bg-primary ${isSmallScreen ? "px-2 py-2.5 text-xs" : "px-3 py-3 text-sm"} font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className={`${isSmallScreen ? "h-3.5 w-3.5" : "h-4 w-4"} animate-spin`}
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
                          <span>{isSmallScreen ? "Procesando" : "Procesando..."}</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={isSmallScreen ? "16" : "18"}
                            height={isSmallScreen ? "16" : "18"}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                          <span>Guardar</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`flex items-center justify-center gap-1 rounded-md bg-danger ${isSmallScreen ? "px-2 py-2.5 text-xs" : "px-3 py-3 text-sm"} font-medium text-white shadow-sm transition-all duration-300 hover:bg-danger/90 hover:shadow-md`}
                      onClick={(e) => {
                        e.preventDefault()
                        setIsModalOpen(true)
                      }}
                      disabled={isLoading}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={isSmallScreen ? "16" : "18"}
                        height={isSmallScreen ? "16" : "18"}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <span>Excepción</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de excepciones - Versión móvil optimizada para 480x800 */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-2 touch-none">
              <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
                onClick={closeModal}
                style={{ userSelect: "none" }}
              ></div>

              <div
                className={`relative z-[60] mx-auto flex max-h-[90vh] w-full ${isSmallScreen ? "max-w-[95%]" : "max-w-md"} transform flex-col overflow-hidden rounded-md bg-white shadow-lg transition-all dark:bg-boxdark animate-scaleIn border border-gray-100 dark:border-gray-700`}
              >
                {/* Header */}
                <div
                  className={`sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-danger/20 via-danger/10 to-transparent ${isSmallScreen ? "px-2 py-1.5" : "px-3 py-2"} dark:border-gray-700`}
                >
                  <h2
                    className={`${isSmallScreen ? "text-xs" : "text-sm"} font-semibold text-gray-800 dark:text-white`}
                  >
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={isSmallScreen ? "14" : "16"}
                        height={isSmallScreen ? "14" : "16"}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`${isSmallScreen ? "mr-1" : "mr-1.5"} text-danger`}
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      Excepción case: {count.EMBAL || "N/A"}
                    </div>
                  </h2>
                  <button
                    onClick={closeModal}
                    className="flex-shrink-0 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Cerrar"
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={isSmallScreen ? "14" : "16"}
                      height={isSmallScreen ? "14" : "16"}
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

                {/* Contenido con scroll si es necesario */}
                <div className={`max-h-[60vh] overflow-y-auto ${isSmallScreen ? "p-2 space-y-2" : "p-3 space-y-3"}`}>
                  <div
                    className={`rounded-md bg-gray-50 ${isSmallScreen ? "p-1.5" : "p-2"} dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700`}
                  >
                    <div className={`flex flex-col ${isSmallScreen ? "space-y-1" : "space-y-1.5"}`}>
                      <div>
                        <span
                          className={`block ${isSmallScreen ? "text-[10px]" : "text-xs"} font-medium text-gray-700 dark:text-gray-300`}
                        >
                          Material:
                        </span>
                        <p
                          className={`${isSmallScreen ? "mt-0.5 text-[10px]" : "mt-0.5 text-xs"} break-words font-semibold text-gray-800 dark:text-white`}
                        >
                          {count.MATNR || "N/A"}
                        </p>
                      </div>
                      <div
                        className={`${isSmallScreen ? "pt-0.5" : "pt-1"} border-t border-gray-200 dark:border-gray-700`}
                      >
                        <span
                          className={`block ${isSmallScreen ? "text-[10px]" : "text-xs"} font-medium text-gray-700 dark:text-gray-300`}
                        >
                          Descripción:
                        </span>
                        <p
                          className={`${isSmallScreen ? "mt-0.5 text-[10px]" : "mt-0.5 text-xs"} break-words text-gray-800 dark:text-white`}
                        >
                          {count.MAKTX || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sección de Códigos de Excepción */}
                  <div className="rounded-md bg-white shadow-sm dark:bg-boxdark border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div
                      className={`border-b border-gray-200 ${isSmallScreen ? "px-2 py-1.5" : "px-3 py-2"} dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}
                    >
                      <h3
                        className={`${isSmallScreen ? "text-[10px]" : "text-xs"} font-semibold text-gray-800 dark:text-white`}
                      >
                        Seleccione el tipo de excepción:
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {isLoadingExcepciones ? (
                        <div className="flex items-center justify-center py-4">
                          <svg
                            className={`animate-spin ${isSmallScreen ? "h-4 w-4" : "h-5 w-5"} text-primary`}
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
                          <span
                            className={`ml-2 ${isSmallScreen ? "text-[10px]" : "text-xs"} text-gray-600 dark:text-gray-400`}
                          >
                            Cargando excepciones...
                          </span>
                        </div>
                      ) : excepciones.length === 0 ? (
                        <div
                          className={`text-center py-4 ${isSmallScreen ? "text-[10px]" : "text-xs"} text-gray-500 dark:text-gray-400`}
                        >
                          No hay excepciones disponibles
                        </div>
                      ) : (
                        excepciones.map((excepcion, index) => (
                          <div
                            key={excepcion._id || index}
                            className={`flex flex-row items-center justify-between gap-2 ${isSmallScreen ? "px-2 py-1.5" : "px-3 py-2"} transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800`}
                          >
                            <span
                              className={`${isSmallScreen ? "text-[10px]" : "text-xs"} font-medium text-gray-800 dark:text-white`}
                            >
                              {excepcion.name}
                            </span>
                            <button
                              type="button"
                              className={`flex-shrink-0 whitespace-nowrap rounded-md bg-primary ${isSmallScreen ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"} text-white transition-all duration-300 hover:bg-primary/90 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                              onClick={() => handleExcepcion(excepcion)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <span className="flex items-center">
                                  <svg
                                    className={`animate-spin ${isSmallScreen ? "-ml-0.5 mr-0.5 h-2.5 w-2.5" : "-ml-1 mr-1 h-3 w-3"} text-white`}
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
                                  {isSmallScreen ? "Procesando" : "Procesando..."}
                                </span>
                              ) : (
                                "Seleccionar"
                              )}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className={`sticky bottom-0 z-10 flex justify-end border-t border-gray-200 bg-white ${isSmallScreen ? "px-2 py-1.5" : "px-3 py-2"} dark:border-gray-700 dark:bg-boxdark`}
                >
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`flex items-center justify-center gap-1 rounded-md bg-gray-200 ${isSmallScreen ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-xs"} font-medium text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={isSmallScreen ? "12" : "14"}
                      height={isSmallScreen ? "12" : "14"}
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
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  // Renderizado para escritorio (mantiene el diseño original)
  return (
    <>
      <Breadcrumb pageName="Ubicar Case" />

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={() => {
          if (pendingFormData) {
            handleReubica(pendingFormData)
            setPendingFormData(null)
          }
        }}
        title="Confirmar acción"
        message="¿Está seguro que desea borrar la ubicación?"
        isMobile={isSmallScreen}
      />

      <div className="grid grid-cols-1 gap-4">
        {/* Sección de búsqueda */}
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
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Escanear Case</h2>
            </div>

            <form id="form1" onSubmit={handleSubmitForm1(handleview)}>
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
                    {...registerForm1("embal", { required: "El número de case es obligatorio" })}
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
              {errorsForm1.embal && <ErrorMessage>{errorsForm1.embal.message}</ErrorMessage>}
            </form>
          </div>
        </div>

        {/* Sección de información del case */}
        {count?.EMBAL && (
          <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 animate-scaleIn">
            <div className="p-4">
              {/* Encabezado con información del case */}
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
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
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                    <path d="m3.3 7 8.7 5 8.7-5"></path>
                    <path d="M12 22V12"></path>
                  </svg>
                  <h2 className="text-base font-semibold text-gray-800 dark:text-white">Case: {count.EMBAL}</h2>
                </div>
              </div>

              <form id="form2" onSubmit={handleSubmitForm2(handleFormSubmit)}>
                {/* Información del material en una sola carta */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-3 border border-gray-100 dark:border-gray-700 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Material:</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">{count.MATNR}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cantidad:</p>
                      <div className="flex items-center">
                        <p className="text-sm font-semibold text-primary dark:text-primary">{count.MENGE}</p>
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{count.ERFME}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción:</p>
                      <p className="text-sm text-gray-800 dark:text-white truncate">{count.MAKTX}</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ubicación actual:</p>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3 mr-0.5 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {count.ZUBIC || "Sin ubicación"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campo de ubicación destino */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 dark:text-white mb-1">
                    Ubicación Destino
                  </label>
                  <div className="relative">
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
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="ubi"
                      autoFocus
                      className="w-full rounded-md border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary uppercase text-sm"
                      placeholder="Ingresar ubicación"
                      {...registerForm2("zubic", {
                        setValueAs: (value: string) => (value ? value.toUpperCase() : ""),
                      })}
                      onInput={(e) => {
                        const input = e.target as HTMLInputElement
                        input.value = input.value.toUpperCase()
                      }}
                      disabled={isLoading}
                    />
                  </div>
                  {errorsForm2.zubic && <ErrorMessage>{errorsForm2.zubic.message}</ErrorMessage>}
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary"
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
                      <>
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
                          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                          <polyline points="17 21 17 13 7 13 7 21"></polyline>
                          <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        <span>Guardar</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-1 rounded-md bg-danger px-3 py-2 text-xs font-medium text-white shadow-sm transition-all duration-300 hover:bg-danger/90 hover:shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                      setIsModalOpen(true)
                    }}
                    disabled={isLoading}
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
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>Excepción</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de excepciones */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>

            <div className="relative bg-white dark:bg-boxdark w-full max-w-md rounded-md shadow-lg overflow-hidden transform transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-danger/20 via-danger/10 to-transparent p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-base font-semibold text-gray-800 dark:text-white">
                  <div className="flex items-center">
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
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    Excepción case: {count.EMBAL || "N/A"}
                  </div>
                </h2>
                <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
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
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>

              {/* Contenido */}
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Material:</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{count.MATNR || "N/A"}</p>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción:</p>
                  <p className="text-sm text-gray-800 dark:text-white">{count.MAKTX || "N/A"}</p>
                </div>

                {/* Sección de Códigos de Excepción */}
                <div className="rounded-md bg-white shadow-sm dark:bg-boxdark border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                    <h3 className="text-xs font-semibold text-gray-800 dark:text-white">
                      Seleccione el tipo de excepción:
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {isLoadingExcepciones ? (
                      <div className="flex items-center justify-center py-4">
                        <svg
                          className="animate-spin h-5 w-5 text-primary"
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
                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">Cargando excepciones...</span>
                      </div>
                    ) : excepciones.length === 0 ? (
                      <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
                        No hay excepciones disponibles
                      </div>
                    ) : (
                      excepciones.map((excepcion, index) => (
                        <div
                          key={excepcion._id || index}
                          className="flex flex-row items-center justify-between gap-2 px-3 py-2 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <span className="text-xs font-medium text-gray-800 dark:text-white">{excepcion.name}</span>
                          <button
                            type="button"
                            className="flex-shrink-0 whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs text-white transition-all duration-300 hover:bg-primary/90 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleExcepcion(excepcion)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                              </span>
                            ) : (
                              "Seleccionar"
                            )}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end bg-white dark:bg-boxdark p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
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
                  >
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Reubica
