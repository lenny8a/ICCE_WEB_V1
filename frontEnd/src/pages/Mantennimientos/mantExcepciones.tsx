"use client"

import { useState, useEffect } from "react"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { useToast } from "../../hooks/useToast"
import ToastContainer from "../../components/ToastContainer"
import axios from "axios"
// Añadir la importación del hook useAuth
import { useAuth } from "../../context/AuthContext"

// Interfaz para los tipos de excepción
interface ExcepcionType {
  id: string
  name: string
  active: boolean
  createdAt?: string
  updatedAt?: string
  _id?: string
}

// Componente Toast
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div
      className="fixed top-16 right-4 z-[9999] ml-0 lg:ml-72.5 shadow-md animate-slideInRight"
      style={{ minWidth: "250px", maxWidth: "90vw" }}
    >
      <div
        className={`px-3 py-2 rounded-md flex items-center justify-between ${
          type === "success"
            ? "bg-green-500/90 text-white border border-green-600"
            : "bg-red-500/90 text-white border border-red-600"
        }`}
      >
        <div className="flex items-center">
          {type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <p className="text-xs">{message}</p>
        </div>
        <button onClick={onClose} className="ml-2 text-white hover:text-gray-200 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Componente de diálogo de confirmación
const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
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
        <div className="relative w-full max-w-sm bg-white dark:bg-boxdark rounded-md shadow-lg transform transition-all mx-auto animate-scaleIn overflow-hidden border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-danger/90 to-danger text-white">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-white"
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
              <h3 className="text-base font-bold text-white">{title}</h3>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 mr-1 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="px-3 py-1.5 bg-danger text-white rounded-md text-xs font-medium hover:bg-danger/90 transition-colors shadow-sm flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente modal para agregar/editar excepciones
const ExcepcionModal = ({
  isOpen,
  onClose,
  onSave,
  excepcion,
  isEditing,
}: {
  isOpen: boolean
  onClose: () => void
  onSave: (excepcion: ExcepcionType) => void
  excepcion: ExcepcionType | null
  isEditing: boolean
}) => {
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [active, setActive] = useState(true)
  const [errors, setErrors] = useState<{ id?: string; name?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (excepcion) {
      setId(excepcion.id)
      setName(excepcion.name)
      setActive(excepcion.active)
    } else {
      setId("")
      setName("")
      setActive(true)
    }
    setErrors({})
  }, [excepcion, isOpen])

  const handleSubmit = () => {
    const newErrors: { id?: string; name?: string } = {}

    // Validaciones
    if (!id.trim()) {
      newErrors.id = "El código es obligatorio"
    } else if (!/^\d+$/.test(id)) {
      newErrors.id = "El código debe contener solo números"
    }

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    // Simular tiempo de procesamiento
    setTimeout(() => {
      onSave({
        id,
        name,
        active,
        _id: excepcion?._id,
      })
      setIsSubmitting(false)
    }, 500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        style={{ userSelect: "none" }}
      ></div>

      <div className="relative z-[60] mx-auto flex max-h-[90vh] w-full max-w-md transform flex-col overflow-hidden rounded-md bg-white shadow-lg transition-all dark:bg-boxdark animate-scaleIn border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent px-4 py-3 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
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
                className="mr-2 text-primary"
              >
                {isEditing ? (
                  <>
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                  </>
                ) : (
                  <>
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </>
                )}
              </svg>
              {isEditing ? "Editar Excepción" : "Nueva Excepción"}
            </div>
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label="Cerrar"
            disabled={isSubmitting}
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
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código
            </label>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={isEditing || isSubmitting}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
              placeholder="Ej: 10"
            />
            {errors.id && <p className="mt-1 text-xs text-danger">{errors.id}</p>}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
              placeholder="Ej: Material dañado"
            />
            {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Activo
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex justify-end border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-boxdark">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1"
            >
              {isSubmitting ? (
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
                  <span>Guardando...</span>
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modificar el componente MantenimientoExcepciones para incluir la verificación de permisos
const MantenimientoExcepciones = () => {
  const [excepciones, setExcepciones] = useState<ExcepcionType[]>([])
  const [filteredExcepciones, setFilteredExcepciones] = useState<ExcepcionType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showInactive, setShowInactive] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExcepcion, setSelectedExcepcion] = useState<ExcepcionType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [excepcionToDelete, setExcepcionToDelete] = useState<ExcepcionType | null>(null)
  const { toasts, removeToast, success, error } = useToast()
  const api_url = import.meta.env.VITE_API_URL || "http://localhost:4000"

  // Añadir el hook useAuth para verificar permisos
  const { checkPermission } = useAuth()

  // Definir los permisos necesarios
  const canView   = checkPermission("/mant/excepciones", "visualizar") 
  const canCreate = checkPermission("/mant/excepciones", "crear") 
  const canEdit   = checkPermission("/mant/excepciones", "modificar") 
  const canDelete = checkPermission("/mant/excepciones", "borrar") 

  // Cargar datos al montar el componente
  useEffect(() => {
    if (canView) {
      fetchExcepciones()
    } else {
      setIsLoading(false)
      error("No tienes permisos para ver los tipos de excepción")
    }
  }, [])

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters()
  }, [excepciones, searchTerm, showInactive])

  // Función para cargar las excepciones
  const fetchExcepciones = async () => {
    try {
      setIsLoading(true)

      // Llamada real a la API
      const response = await axios.get(`${api_url}/api/excepciones`)

      if (response.data.success) {
        setExcepciones(response.data.data || [])
      } else {
        error(response.data.message || "Error al cargar los tipos de excepción")
      }

      setIsLoading(false)
    } catch (err) {
      console.error("Error al cargar excepciones:", err)
      error("Error al cargar los tipos de excepción")
      setIsLoading(false)
    }
  }

  // Función para aplicar filtros
  const applyFilters = () => {
    let result = [...excepciones]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (excepcion) => excepcion.id.toLowerCase().includes(term) || excepcion.name.toLowerCase().includes(term),
      )
    }

    // Filtrar por estado activo/inactivo
    if (!showInactive) {
      result = result.filter((excepcion) => excepcion.active)
    }

    // Ordenar por ID
    result.sort((a, b) => {
      return Number.parseInt(a.id) - Number.parseInt(b.id)
    })

    setFilteredExcepciones(result)
  }

  // Función para abrir el modal de creación
  const openCreateModal = () => {
    if (!canCreate) {
      error("No tienes permisos para crear tipos de excepción")
      return
    }
    setSelectedExcepcion(null)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  // Función para abrir el modal de edición
  const openEditModal = (excepcion: ExcepcionType) => {
    if (!canEdit) {
      error("No tienes permisos para editar tipos de excepción")
      return
    }
    setSelectedExcepcion(excepcion)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // Función para confirmar eliminación
  const confirmDelete = (excepcion: ExcepcionType) => {
    if (!canDelete) {
      error("No tienes permisos para eliminar tipos de excepción")
      return
    }
    setExcepcionToDelete(excepcion)
    setIsConfirmDialogOpen(true)
  }

  // Función para guardar una excepción (crear o editar)
  const handleSaveExcepcion = async (excepcion: ExcepcionType) => {
    try {
      if (isEditing) {
        // Verificar permisos de edición
        if (!canEdit) {
          error("No tienes permisos para editar tipos de excepción")
          return
        }

        // Actualizar excepción existente
        const response = await axios.put(`${api_url}/api/excepciones/${excepcion._id}`, excepcion)

        if (response.data.success) {
          // Actualizar el estado local
          setExcepciones((prev) => prev.map((item) => (item._id === excepcion._id ? response.data.data : item)))
          success("Excepción actualizada correctamente")
        } else {
          error(response.data.message || "Error al actualizar la excepción")
          return
        }
      } else {
        // Verificar permisos de creación
        if (!canCreate) {
          error("No tienes permisos para crear tipos de excepción")
          return
        }

        // Verificar si ya existe una excepción con el mismo ID
        const exists = excepciones.some((item) => item.id === excepcion.id)
        if (exists) {
          error(`Ya existe una excepción con el código ${excepcion.id}`)
          return
        }

        // Crear nueva excepción
        const response = await axios.post(`${api_url}/api/excepciones`, excepcion)

        if (response.data.success) {
          // Actualizar el estado local
          setExcepciones((prev) => [...prev, response.data.data])
          success("Excepción creada correctamente")
        } else {
          error(response.data.message || "Error al crear la excepción")
          return
        }
      }

      // Cerrar el modal
      setIsModalOpen(false)
    } catch (err) {
      console.error("Error al guardar excepción:", err)
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          error(`Ya existe una excepción con el código ${excepcion.id}`)
        } else {
          error(err.response?.data?.message || "Error al guardar la excepción")
        }
      } else {
        error("Error al guardar la excepción")
      }
    }
  }

  // Función para eliminar una excepción
  const handleDeleteExcepcion = async () => {
    if (!excepcionToDelete) return

    // Verificar permisos de eliminación
    if (!canDelete) {
      error("No tienes permisos para eliminar tipos de excepción")
      return
    }

    try {
      // Eliminar excepción
      const response = await axios.delete(`${api_url}/api/excepciones/${excepcionToDelete._id}`)

      if (response.data.success) {
        // Actualizar el estado local
        setExcepciones((prev) => prev.filter((item) => item._id !== excepcionToDelete._id))
        success("Excepción eliminada correctamente")
      } else {
        error(response.data.message || "Error al eliminar la excepción")
      }
    } catch (err) {
      console.error("Error al eliminar excepción:", err)
      if (axios.isAxiosError(err)) {
        error(err.response?.data?.message || "Error al eliminar la excepción")
      } else {
        error("Error al eliminar la excepción")
      }
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
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

  // Si el usuario no tiene permisos para ver, mostrar mensaje de acceso denegado
  if (!canView) {
    return (
      <>
        <Breadcrumb pageName="Mantenimiento de Excepciones" />
        <div className="flex items-center p-6 bg-white dark:bg-boxdark rounded-md shadow-md">
          <div className="w-full">
            <div className="flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 text-danger mb-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h5 className="text-xl font-semibold text-center mb-2 text-danger">Acceso Denegado</h5>
            <p className="text-center text-gray-600 dark:text-gray-400">
              No tienes permisos para acceder a esta sección. Por favor, contacta al administrador si crees que esto es
              un error.
            </p>
          </div>
        </div>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    )
  }

  return (
    <>
      <Breadcrumb pageName="Mantenimiento de Excepciones" />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={() => {
          handleDeleteExcepcion()
          setIsConfirmDialogOpen(false)
        }}
        title="Confirmar eliminación"
        message={`¿Está seguro que desea eliminar la excepción "${excepcionToDelete?.name}"?`}
      />

      {/* Modal para crear/editar excepciones */}
      <ExcepcionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExcepcion}
        excepcion={selectedExcepcion}
        isEditing={isEditing}
      />

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
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Tipos de Excepción</h2>
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
                  placeholder="Buscar por código o nombre"
                  className="w-full rounded-md border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Botón para mostrar/ocultar inactivos */}
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar inactivos</span>
                </label>
              </div>

              {/* Botón para agregar nueva excepción */}
              {canCreate && (
                <button
                  onClick={openCreateModal}
                  className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md"
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
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  <span>Nueva Excepción</span>
                </button>
              )}
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
                <p className="text-gray-600 dark:text-gray-400">Cargando tipos de excepción...</p>
              </div>
            </div>
          ) : filteredExcepciones.length === 0 ? (
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
                No se encontraron tipos de excepción con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <>
              {/* Contador de resultados */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando <span className="font-semibold text-primary">{filteredExcepciones.length}</span> tipos de
                  excepción
                </p>
              </div>

              {/* Tabla para pantallas medianas y grandes */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Código</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Nombre</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Estado</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Fecha creación</th>
                      <th className="py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExcepciones.map((excepcion) => (
                      <tr
                        key={excepcion._id}
                        className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">{excepcion.id}</td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{excepcion.name}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              excepcion.active
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }`}
                          >
                            {excepcion.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                          {formatDate(excepcion.createdAt)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {canEdit && (
                              <button
                                onClick={() => openEditModal(excepcion)}
                                className="inline-flex items-center justify-center p-1.5 bg-amber-400 text-white rounded-md hover:bg-amber-500 transition-colors"
                                title="Editar"
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
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                </svg>
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => confirmDelete(excepcion)}
                                className="inline-flex items-center justify-center p-1.5 bg-danger text-white rounded-md hover:bg-danger/90 transition-colors"
                                title="Eliminar"
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
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
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
                {filteredExcepciones.map((excepcion, index) => (
                  <div
                    key={excepcion._id}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in-50 zoom-in-90"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800 dark:text-white text-base">{excepcion.id}</p>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              excepcion.active
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                            }`}
                          >
                            {excepcion.active ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">{excepcion.name}</p>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(excepcion.createdAt)}</div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      {canEdit && (
                        <button
                          onClick={() => openEditModal(excepcion)}
                          className="bg-amber-400 text-white px-2 py-1.5 rounded-lg text-xs flex-1 hover:bg-amber-500 transition-all duration-300 shadow-sm flex items-center justify-center gap-1"
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
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                          </svg>
                          Editar
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => confirmDelete(excepcion)}
                          className="bg-danger text-white px-2 py-1.5 rounded-lg text-xs flex-1 hover:bg-danger/90 transition-all duration-300 shadow-sm flex items-center justify-center gap-1"
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
                          >
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                          Eliminar
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
    </>
  )
}

export default MantenimientoExcepciones
