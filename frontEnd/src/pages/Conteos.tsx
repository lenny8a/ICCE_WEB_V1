"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { useToast } from "../hooks/useToast"
import ToastContainer from "../components/ToastContainer"
import ErrorMessage from "../components/ErrorMessage"
import { useForm } from "react-hook-form"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import { useDeviceDetect } from "../hooks/use-device-detect"

// First, make sure we have all the necessary Lucide React imports at the top
// Keep the existing imports and add any missing ones
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  Clipboard,
  ClipboardCheck,
  Clock,
  Edit2,
  Eye,
  FileText,
  Filter,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
  BarChart4,
  Calendar,
  Building2,
  FileSpreadsheet,
  User,
  Store,
  MapPin,
} from "lucide-react"

// Importar useAuth para acceder al contexto de autenticación
// Añadir esta importación junto con las otras importaciones al inicio del archivo
import { useAuth } from "../context/AuthContext"

// Definimos los estilos CSS directamente en un componente
const ResponsiveStyles: React.FC = () => {
  useEffect(() => {
    // Crear un elemento de estilo
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      /* Estilos para pantallas extra pequeñas */
      @media (min-width: 475px}) {
        .xs\\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      
      /* Estilos para animaciones */
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

      /* Additional animations */
      @keyframes slideInUp {
        from {
          transform: translateY(10px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .animate-slideInUp {
        animation: slideInUp 0.3s ease-out forwards;
      }

      /* Improved scrollbar styles */
      .custom-scrollbar::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      .dark .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4b5563;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      /* Badge styles */
      .badge-red {
        @apply bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400;
      }
      
      .badge-green {
        @apply bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400;
      }
      
      .badge-blue {
        @apply bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400;
      }
      
      .badge-yellow {
        @apply bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400;
      }

      /* Card hover effect */
      .hover-card {
        transition: all 0.2s ease-in-out;
      }
      
      .hover-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
      
      /* Estilos para la barra de desplazamiento */
      .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
      }

      .scrollbar-thin::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
      }

      .dark .scrollbar-thin::-webkit-scrollbar-track {
        background: #1e293b;
      }

      .scrollbar-thin::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }

      .dark .scrollbar-thin::-webkit-scrollbar-thumb {
        background: #4b5563;
      }

      .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
        background: #6b7280;
      }

      /* Estilos para el modal de advertencia oscuro */
      .modal-dark {
        background-color: #1e293b;
        border-radius: 0.5rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .modal-dark-button-cancel {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
        transition: all 0.2s;
      }

      .modal-dark-button-cancel:hover {
        background-color: rgba(255, 255, 255, 0.15);
      }

      .modal-dark-button-confirm {
        background-color: #10b981;
        color: #fff;
        transition: all 0.2s;
      }

      .modal-dark-button-confirm:hover {
        background-color: #059669;
      }

      .shield-icon-container {
        background-color: #3b82f6;
        width: 48px;
        height: 48px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        margin-bottom: 1rem;
      }

      /* Specific styles for handheld devices (480x800) */
      @media (max-width: 480px) {
        .handheld-container {
          padding: 0.5rem !important;
          margin: 0.25rem !important;
        }
        
        .handheld-text-sm {
          font-size: 0.75rem !important;
        }
        
        .handheld-text-base {
          font-size: 0.875rem !important;
        }
        
        .handheld-p-2 {
          padding: 0.5rem !important;
        }
        
        .handheld-my-1 {
          margin-top: 0.25rem !important;
          margin-bottom: 0.25rem !important;
        }
        
        .handheld-compact-form input,
        .handheld-compact-form button {
          height: 2.5rem;
        }
        
        .handheld-compact-table th,
        .handheld-compact-table td {
          padding: 0.5rem 0.25rem !important;
          font-size: 0.75rem !important;
        }
        
        .handheld-grid-cols-1 {
          grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
        }
        
        .handheld-w-full {
          width: 100% !important;
        }
        
        .handheld-flex-col {
          flex-direction: column !important;
        }
        
        .handheld-gap-1 {
          gap: 0.25rem !important;
        }
        
        .handheld-text-xs {
          font-size: 0.7rem !important;
        }
        
        .handheld-py-1 {
          padding-top: 0.25rem !important;
          padding-bottom: 0.25rem !important;
        }
        
        .handheld-px-2 {
          padding-left: 0.5rem !important;
          padding-right: 0.5rem !important;
        }
        
        .handheld-modal {
          width: 95% !important;
          max-height: 85vh !important;
          margin: 0 auto !important;
        }
        
        .handheld-modal-content {
          padding: 0.5rem !important;
        }
        
        .handheld-modal-header {
          padding: 0.5rem !important;
        }
        
        .handheld-modal-footer {
          padding: 0.5rem !important;
        }
        
        .handheld-max-h-60vh {
          max-height: 60vh !important;
        }
      }
    `
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  return null
}

export interface Case {
  CASE: string
  WERKS: string
  LGORT: string
  UBICACION: string
  CANTIDAD: string
  EXCEP: string
}

export interface Material {
  MATNR: string
  MAKTX: string
  MENGE: string
  MEINS: string
  CASES: Case[]
}

export interface Conteo {
  IBLNR: string
  WERKS: string
  LGORT: string
  BLDAT: string
  USNAM: string
  XBLNI: string
  MATERIALES: Material[]
  estado?: string
}

// Update the ConteoCase interface to include a new field for quantity difference
interface ConteoCase {
  case: string
  ubicacion: string
  cantidad: string
  estado: "pendiente" | "registrado"
  excepcion: string
  color?: "red" | "green"
  werks?: string
  lgort?: string
  diferencia?: number // Add this field to store the quantity difference
}

interface ConteoMaterial {
  ubicacion: string
  case: string
  cantidad: string
  excepcion: string
  casesRegistrados: ConteoCase[]
  casesPendientes: ConteoCase[]
}

// Add this CSS class at the beginning of your component
const ConteosScreen: React.FC = () => {
  const { isHandheld } = useDeviceDetect()
  // Add this line to define a responsive utility class
  const initialState = {
    conteo: "",
  }

  interface ConteoForm {
    conteo: string
  }

  const form = useForm({ defaultValues: initialState })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  const conteoModalForm = useForm({
    defaultValues: {
      ubicacion: "",
      case: "",
      cantidad: "",
      excepcion: "00",
    },
  })

  const {
    register: registerConteo,
    handleSubmit: handleSubmitConteo,
    reset: resetConteo,
    getValues: getValuesConteo,
    setValue: setValueConteo,
    watch: watchConteo,
    formState: { errors: errorsConteo },
  } = conteoModalForm

  // Set up the refs for the form fields
  const registerWithRef = (name: string, options: any, ref: React.RefObject<HTMLInputElement>) => {
    return {
      ...registerConteo(name, options),
      ref: (e: HTMLInputElement) => {
        // Register the input with react-hook-form
        registerConteo(name).ref(e)
        // Also set our own ref
        if (ref.current !== e) {
          ref.current = e
        }
      },
    }
  }

  const [isSearching, setIsSearching] = useState(false)
  const [conteoData, setConteoData] = useState<Conteo | null>(null)
  const [procesados, setProcesados] = useState<Material[]>([])
  const [showConteo, setShowConteo] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [conteoMaterial, setConteoMaterial] = useState<ConteoMaterial>({
    ubicacion: "",
    case: "",
    cantidad: "",
    excepcion: "00",
    casesRegistrados: [],
    casesPendientes: [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingGlobal, setIsSavingGlobal] = useState(false)
  const [] = useState(false)
  const { toasts, removeToast, success, error } = useToast()

  // Añadir después de la línea: const { toasts, removeToast, success, error } = useToast()
  const { checkPermission } = useAuth()

  // Agregar un nuevo estado para almacenar los cases procesados por material
  const [materialCasesMap, setMaterialCasesMap] = useState<Record<string, ConteoCase[]>>({})
  const [viewingProcessedCases, setViewingProcessedCases] = useState<Material | null>(null)
  const [isProcessedCasesModalOpen, setIsProcessedCasesModalOpen] = useState(false)

  const ubicacionRef = useRef<HTMLInputElement>(null)
  const caseRef = useRef<HTMLInputElement>(null)
  const cantidadRef = useRef<HTMLInputElement>(null)

  // Agregar nuevos estados para los mensajes de error específicos
  const [ubicacionError, setUbicacionError] = useState<string | null>(null)
  const [caseError, setCaseError] = useState<string | null>(null)
  const [combinationError, setCombinationError] = useState<string | null>(null)

  // Agregar un nuevo estado para el modo de edición
  const [editingCase, setEditingCase] = useState<ConteoCase | null>(null)

  // Después de la definición de los estados, agregar un nuevo estado para controlar las pestañas
  const [activeTab, setActiveTab] = useState<"pending" | "processed">("pending")

  // Agregar estos estados después de los otros estados
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPendingMaterials, setFilteredPendingMaterials] = useState<Material[]>([])
  const [filteredProcessedMaterials, setFilteredProcessedMaterials] = useState<Material[]>([])

  // Agregar estos nuevos estados después de los estados existentes
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Add a new state for the tooltip message
  const [tooltipInfo, setTooltipInfo] = useState<{
    visible: boolean
    message: string
    position: { top: number; left: number }
  }>({
    visible: false,
    message: "",
    position: { top: 0, left: 0 },
  })

  // Watch for changes in ubicacion and case fields
  const ubicacionValue = watchConteo("ubicacion")
  const caseValue = watchConteo("case")

  // Effect to validate the combination when either field changes
  useEffect(() => {
    // Only validate if both fields have values and we're not in edit mode
    if (ubicacionValue && caseValue && !editingCase) {
      validateCaseUbicacionCombination(caseValue, ubicacionValue)
    }
  }, [ubicacionValue, caseValue, editingCase])

  // Añadir después de todas las declaraciones de estado:
  // Definir los permisos necesarios
  const canView = checkPermission("/cont/conteos", "visualizar")
  const canModify = checkPermission("/cont/conteos", "modificar")
  const canProcess = checkPermission("/cont/conteos", "contabilizar")

  // Agregar este useEffect para filtrar los materiales cuando cambia el término de búsqueda o los datos
  useEffect(() => {
    if (!conteoData) return

    // Filtrar materiales pendientes
    const pendingMaterials = conteoData.MATERIALES
      ? conteoData.MATERIALES.filter((m) => !procesados.some((p) => p.MATNR === m.MATNR))
      : []

    if (searchTerm.trim() === "") {
      setFilteredPendingMaterials(pendingMaterials)
      setFilteredProcessedMaterials(procesados)
    } else {
      const term = searchTerm.toLowerCase()

      // Filtrar materiales pendientes
      setFilteredPendingMaterials(
        pendingMaterials.filter((m) => m.MATNR.toLowerCase().includes(term) || m.MAKTX.toLowerCase().includes(term)),
      )

      // Filtrar materiales procesados
      setFilteredProcessedMaterials(
        procesados.filter((m) => m.MATNR.toLowerCase().includes(term) || m.MAKTX.toLowerCase().includes(term)),
      )
    }
  }, [conteoData, procesados, searchTerm])

  // Añadir verificación de acceso inicial después de todos los useEffect
  useEffect(() => {
    if (!canView) {
      error("No tienes permisos para acceder a esta página")
    }
  }, [canView, error])

  // Function to validate if ubicacion exists - Modificada para usar estados de error
  const validateUbicacion = (ubicacion: string): boolean => {
    if (!selectedMaterial) return false

    const ubicacionExists = selectedMaterial.CASES.some((c) => c.UBICACION === ubicacion)
    if (!ubicacionExists) {
      setUbicacionError(`La ubicación ${ubicacion} no existe para este material`)
      return false
    }
    setUbicacionError(null)
    return true
  }

  // Modificar la función validateCase para ignorar ceros a la izquierda de manera consistente
  const validateCase = (caseValue: string): boolean => {
    if (!selectedMaterial) return false

    // Si el valor está vacío, mostrar error
    if (!caseValue || caseValue.trim() === "") {
      setCaseError("El case no puede estar vacío")
      return false
    }

    // Normalizar el case eliminando ceros a la izquierda
    const normalizedCase = caseValue.replace(/^0+/, "")

    const foundCase = selectedMaterial.CASES.find((c) => {
      // Normalizar el CASE de los datos eliminando ceros a la izquierda
      const normalizedDataCase = c.CASE.replace(/^0+/, "")
      return normalizedDataCase === normalizedCase
    })

    if (!foundCase) {
      setCaseError(`El case ${caseValue} no existe para este material`)
      return false
    }

    // Si encontramos el case, establecemos su valor de excepción en el formulario
    if (foundCase.EXCEP) {
      setValueConteo("excepcion", foundCase.EXCEP)
    }

    setCaseError(null)
    return true
  }

  // Modificar la función validateCaseUbicacionCombination para ignorar ceros a la izquierda
  const validateCaseUbicacionCombination = (caseValue: string, ubicacionValue: string): boolean => {
    if (!selectedMaterial || !caseValue || !ubicacionValue) return false

    // Normalizar el case eliminando ceros a la izquierda
    const normalizedCase = caseValue.replace(/^0+/, "")

    // Encontrar el case en el array CASES del material
    const foundCase = selectedMaterial.CASES.find((c) => {
      // Normalizar el CASE de los datos eliminando ceros a la izquierda
      const normalizedDataCase = c.CASE.replace(/^0+/, "")
      return normalizedDataCase === normalizedCase
    })

    // Si el case no existe, no validar la combinación (la validación del case manejará este error)
    if (!foundCase) {
      setCombinationError(null)
      return false
    }

    // Verificar si la ubicación coincide con la ubicación del case
    if (foundCase.UBICACION !== ubicacionValue) {
      setCombinationError(
        `El case ${caseValue} no corresponde a la ubicación ${ubicacionValue}. La ubicación correcta es ${foundCase.UBICACION}`,
      )
      return false
    }

    // Si llegamos aquí, la combinación es válida
    setCombinationError(null)
    return true
  }

  // Modificar la función handleSearch para inicializar los estados de filtrado
  // Reemplazar el inicio de la función handleSearch:
  const handleSearch = async (formData: ConteoForm) => {
    if (!canView) {
      error("No tienes permisos para ver documentos de inventario")
      return
    }

    try {
      setIsSearching(true)
      setShowConteo(false)

      // PASO 1: Primero consultar el sistema externo para obtener todos los materiales
      let externalData = null
      try {
        console.log("Consultando sistema externo:", formData.conteo)
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/cont/conteo`, { conteo: formData.conteo })

        let dataToProcess = response.data

        // Si la respuesta es un array, tomar el primer elemento
        if (Array.isArray(dataToProcess) && dataToProcess.length > 0) {
          dataToProcess = dataToProcess[0]
        }

        if (dataToProcess) {
          // Asegurarse de que MATERIALES existe y es un array
          if (!dataToProcess.MATERIALES) {
            dataToProcess.MATERIALES = []
          }
          externalData = dataToProcess
          console.log("Datos obtenidos del sistema externo:", externalData.MATERIALES.length, "materiales")
        } else {
          error(`No se encontró el documento de inventario en el sistema externo.`)
          setIsSearching(false)
          return
        }
      } catch (externalError) {
        console.error("Error al consultar sistema externo:", externalError)
        error(`Error al consultar sistema externo. Intente nuevamente.`)
        setIsSearching(false)
        reset()
        return
      }

      // PASO 2: Si encontramos datos en el sistema externo, consultar la base de datos
      let dbData = null
      try {
        console.log("Consultando base de datos:", formData.conteo)
        const dbResponse = await axios.post(`${import.meta.env.VITE_API_URL}/cont/get-conteo-db`, {
          conteo: formData.conteo,
        })

        if (dbResponse.data && dbResponse.status === 200) {
          dbData = dbResponse.data
          console.log("Datos encontrados en la base de datos:", dbData.materiales?.length || 0, "materiales procesados")
        }
      } catch (dbError) {
        console.log("No se encontró el conteo en la base de datos", dbError)
        // Si no se encuentra en la base de datos, continuamos con solo los datos externos
      }

      // PASO 3: Establecer los datos del conteo con los datos del sistema externo
      // Si hay datos en la base de datos, asignar el estado del conteo
      if (dbData && dbData.estado) {
        // Combinar los datos externos con el estado de la base de datos
        setConteoData({
          ...externalData,
          estado: dbData.estado,
        })
        console.log("Estado del conteo cargado desde la base de datos:", dbData.estado)
      } else {
        setConteoData(externalData)
      }

      // PASO 4: Procesar los materiales
      const materialesProcesados: Material[] = []
      const casesMap: Record<string, ConteoCase[]> = {}

      // Si tenemos datos de la base de datos, procesar los materiales ya procesados
      if (dbData && dbData.materiales && dbData.materiales.length > 0) {
        console.log("Procesando materiales de la base de datos")

        // Procesar cada material del conteo existente en la base de datos
        dbData.materiales.forEach((material: any) => {
          // Buscar el material correspondiente en los datos externos
          const materialOriginal = externalData.MATERIALES.find((m: Material) => m.MATNR === material.MATNR)

          if (materialOriginal) {
            console.log(`Material encontrado en ambas fuentes: ${material.MATNR}`)

            // Agregar el material a la lista de procesados
            materialesProcesados.push(materialOriginal)

            // Procesar los cases registrados para este material
            if (material.casesRegistrados && material.casesRegistrados.length > 0) {
              // Convertir los cases registrados al formato ConteoCase
              const casesProcesados: ConteoCase[] = material.casesRegistrados.map((c: any) => {
                // Determinar el color basado en la diferencia si está disponible
                const color = c.diferencia === 0 ? "green" : "red"

                return {
                  case: c.case,
                  ubicacion: c.ubicacion,
                  cantidad: c.cantidad,
                  estado: "registrado",
                  excepcion: c.excepcion || "00",
                  color: c.color || color,
                  werks: c.werks || externalData.WERKS,
                  lgort: c.lgort || externalData.LGORT,
                  diferencia: c.diferencia,
                }
              })

              // Guardar los cases procesados en el mapa
              casesMap[material.MATNR] = casesProcesados

              console.log(`Cargados ${casesProcesados.length} cases para el material ${material.MATNR}`)
            } else {
              console.log(`No se encontraron cases registrados para el material ${material.MATNR}`)
              casesMap[material.MATNR] = []
            }
          } else {
            console.warn(`Material ${material.MATNR} no encontrado en los datos externos`)
          }
        })
      }

      // PASO 5: Actualizar los estados
      setProcesados(materialesProcesados)
      setMaterialCasesMap(casesMap)

      // PASO 6: Calcular los materiales pendientes (los que están en el sistema externo pero no en procesados)
      const materialesPendientes = externalData.MATERIALES.filter(
        (m: Material) => !materialesProcesados.some((mp) => mp.MATNR === m.MATNR),
      )

      console.log("Materiales pendientes:", materialesPendientes.length)
      console.log("Materiales procesados:", materialesProcesados.length)

      // PASO 7: Inicializar los estados de filtrado
      setSearchTerm("")
      setFilteredPendingMaterials(materialesPendientes)
      setFilteredProcessedMaterials(materialesProcesados)

      // PASO 8: Establecer la pestaña activa según si hay materiales procesados o no
      if (materialesProcesados.length > 0) {
        setActiveTab("processed")
      } else {
        setActiveTab("pending")
      }

      // PASO 9: Mostrar el conteo con animación
      setIsSearching(false)
      setShowConteo(true)

      // PASO 10: Mostrar mensaje de éxito
      if (materialesProcesados.length > 0) {
        success(`Conteo cargado con ${materialesProcesados.length} materiales ya procesados`)
      } else {
        success("Conteo cargado correctamente")
      }
    } catch (error_er) {
      console.error("Error al buscar documento de inventario:", error_er)
      error(`Error al buscar documento de inventario. Intente nuevamente.`)
      setIsSearching(false)
      reset()
    }
  }

  // Modificar la función openConteoModal para verificar permisos
  // Reemplazar el inicio de la función openConteoModal:
  const openConteoModal = (material: Material, loadProcessedCases = false) => {
    // Verificar si el conteo está procesado o contabilizado
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") {
      error(`No se pueden realizar modificaciones. El conteo está en estado: ${conteoData.estado}`)
      return
    }

    // Verificar permisos
    if (!canModify) {
      error("No tienes permisos para modificar documentos de inventario")
      return
    }

    setSelectedMaterial(material)
    // Resetear los errores al abrir el modal
    setUbicacionError(null)
    setCaseError(null)
    setCombinationError(null)

    // Inicializar el estado del conteo para este material
    let casesRegistrados: ConteoCase[] = []

    // Si se solicita cargar los cases procesados, obtenerlos del mapa
    if (loadProcessedCases && materialCasesMap[material.MATNR]) {
      casesRegistrados = [...materialCasesMap[material.MATNR]]
    }

    // Crear la lista de cases pendientes (todos los cases del material que no están en casesRegistrados)
    const casesPendientes: ConteoCase[] = material.CASES.filter(
      (c) =>
        !casesRegistrados.some((rc) => {
          const normalizedRC = rc.case.replace(/^0+/, "")
          const normalizedC = c.CASE.replace(/^0+/, "")
          return normalizedRC === normalizedC
        }),
    ).map((c) => ({
      case: c.CASE,
      ubicacion: c.UBICACION,
      cantidad: "",
      estado: "pendiente",
      excepcion: c.EXCEP || "00", // Usar el valor EXCEP de la API o "00" por defecto
      werks: conteoData?.WERKS || "",
      lgort: conteoData?.LGORT || "",
    }))

    setConteoMaterial({
      ubicacion: "",
      case: "",
      cantidad: "",
      excepcion: "00",
      casesRegistrados,
      casesPendientes,
    })

    resetConteo({
      ubicacion: "",
      case: "",
      cantidad: "",
      excepcion: "00",
    })

    setIsModalOpen(true)

    // Bloquear scroll del body
    document.body.style.overflow = "hidden"

    // Set focus on ubicacion field after modal is open
    setTimeout(() => {
      if (ubicacionRef.current) {
        ubicacionRef.current.focus()
      }
    }, 100)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMaterial(null)

    // Restaurar scroll del body
    document.body.style.overflow = "auto"
  }

  // Modificar la función handleConteoSubmit para normalizar el case de manera consistente
  const handleConteoSubmit = (data: any) => {
    console.log("Form data submitted:", data)

    // Verificar si el case está vacío
    if (!data.case || data.case.trim() === "") {
      setCaseError("El case no puede estar vacío")
      return
    }

    // Normalizar el case eliminando ceros a la izquierda
    const normalizedCase = data.case.replace(/^0+/, "")
    data.case = normalizedCase // Actualizar el valor en data para usarlo consistentemente

    // Validar si el case existe en el array CASES del material
    if (!validateCase(data.case)) {
      return
    }

    // Validar si la ubicación existe en cualquiera de los CASES del material
    if (!validateUbicacion(data.ubicacion)) {
      return
    }

    // Validar la combinación de case y ubicación
    if (!validateCaseUbicacionCombination(data.case, data.ubicacion)) {
      return
    }

    // Verificar si el case ya está registrado (solo si no estamos en modo edición)
    if (!editingCase) {
      const caseAlreadyRegistered = conteoMaterial.casesRegistrados.some((c) => {
        const normalizedRegisteredCase = c.case.replace(/^0+/, "")
        return normalizedRegisteredCase === normalizedCase
      })

      if (caseAlreadyRegistered) {
        setCaseError(`El case ${data.case} ya ha sido registrado. No puede registrarse dos veces.`)
        return
      }
    }

    // Encontrar el case en los datos originales para obtener el EXCEP y la cantidad original
    const originalCase = selectedMaterial?.CASES.find((c) => {
      const normalizedDataCase = c.CASE.replace(/^0+/, "")
      return normalizedDataCase === normalizedCase
    })

    // Si la validación falla, no registrar el case
    if (!originalCase) {
      error(`El case ${data.case} no corresponde a la ubicación ${data.ubicacion}`)
      return
    }

    // Comparar cantidades para determinar el color
    const enteredQuantity = Number.parseFloat(data.cantidad)
    const originalQuantity = originalCase ? Number.parseFloat(originalCase.CANTIDAD.trim()) : 0
    const quantityDifference = enteredQuantity - originalQuantity
    const stateColor = enteredQuantity === originalQuantity ? "green" : "red"

    // Crear el objeto de case con los datos del formulario
    const newRegisteredCase: ConteoCase = {
      case: data.case,
      ubicacion: data.ubicacion,
      cantidad: data.cantidad,
      estado: "registrado",
      excepcion: data.excepcion || originalCase?.EXCEP || "00",
      color: stateColor,
      werks: conteoData?.WERKS || "",
      lgort: conteoData?.LGORT || "",
      diferencia: quantityDifference,
    }

    setConteoMaterial((prev) => {
      if (editingCase) {
        // Si estamos editando, actualizar el case existente
        return {
          ...prev,
          casesRegistrados: prev.casesRegistrados.map((c) => (c.case === editingCase.case ? newRegisteredCase : c)),
        }
      } else {
        // Si estamos creando, agregar el nuevo case y quitar de pendientes
        return {
          ...prev,
          casesRegistrados: [...prev.casesRegistrados, newRegisteredCase],
          casesPendientes: prev.casesPendientes.filter((c) => {
            // Normalizar ambos cases eliminando ceros a la izquierda
            const normalizedPendingCase = c.case.replace(/^0+/, "")
            return normalizedPendingCase !== normalizedCase
          }),
        }
      }
    })

    // Limpiar los errores
    setUbicacionError(null)
    setCaseError(null)
    setCombinationError(null)

    // Mostrar mensaje de éxito
    if (editingCase) {
      success(`Case ${data.case} actualizado correctamente`)
    } else {
      success(`Case ${data.case} registrado correctamente`)
    }

    // Salir del modo edición
    setEditingCase(null)

    // Reset form with empty values for all fields
    resetConteo({
      ubicacion: "",
      case: "",
      cantidad: "",
      excepcion: "00",
    })

    // Set focus back to ubicacion field
    setTimeout(() => {
      if (ubicacionRef.current) {
        ubicacionRef.current.focus()
      }
    }, 100)
  }

  // Agregar función para seleccionar un case para editar
  const handleEditCase = (caseItem: ConteoCase) => {
    setEditingCase(caseItem)

    // Limpiar errores al entrar en modo edición
    setUbicacionError(null)
    setCaseError(null)
    setCombinationError(null)

    // Cargar los datos del case en el formulario
    resetConteo({
      ubicacion: caseItem.ubicacion,
      case: caseItem.case,
      cantidad: caseItem.cantidad,
      excepcion: caseItem.excepcion,
    })

    // Enfocar el campo de ubicación
    setTimeout(() => {
      if (ubicacionRef.current) {
        ubicacionRef.current.focus()
      }
    }, 100)
  }

  // Agregar función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingCase(null)

    // Limpiar el formulario
    resetConteo({
      ubicacion: "",
      case: "",
      cantidad: "",
      excepcion: "00",
    })

    // Limpiar errores
    setUbicacionError(null)
    setCaseError(null)
    setCombinationError(null)
  }

  // Función para eliminar un case registrado
  // Modificar la función handleDeleteCase para verificar permisos
  // Reemplazar el inicio de la función handleDeleteCase:
  const handleDeleteCase = (caseItem: ConteoCase) => {
    // Verificar permisos
    if (!canModify) {
      error("No tienes permisos para eliminar cases de documentos de inventario")
      return
    }

    // Encontrar el case original en los datos del material
    const originalCase = selectedMaterial?.CASES.find((c) => {
      const normalizedDataCase = c.CASE.replace(/^0+/, "")
      const normalizedItemCase = caseItem.case.replace(/^0+/, "")
      return normalizedDataCase === normalizedItemCase
    })

    if (!originalCase) {
      error(`No se pudo encontrar el case original para ${caseItem.case}`)
      return
    }

    // Crear un nuevo case pendiente a partir del original
    const newPendingCase: ConteoCase = {
      case: originalCase.CASE,
      ubicacion: originalCase.UBICACION,
      cantidad: "",
      estado: "pendiente",
      excepcion: originalCase.EXCEP || "00",
      werks: conteoData?.WERKS || "",
      lgort: conteoData?.LGORT || "",
    }

    // Actualizar el estado
    setConteoMaterial((prev) => ({
      ...prev,
      casesRegistrados: prev.casesRegistrados.filter((c) => c.case !== caseItem.case),
      casesPendientes: [...prev.casesPendientes, newPendingCase],
    }))

    // Mostrar mensaje de éxito
    success(`Case ${caseItem.case} eliminado correctamente`)
  }

  // Modificar la función handleEditProcessedCase para verificar permisos
  // Reemplazar el inicio de la función handleEditProcessedCase:
  const handleEditProcessedCase = (caseItem: ConteoCase, material: Material | null) => {
    if (!material) return

    // Verificar si el conteo está procesado o contabilizado
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") {
      error(`No se pueden realizar modificaciones. El conteo está en estado: ${conteoData.estado}`)
      return
    }

    // Verificar permisos
    if (!canModify) {
      error("No tienes permisos para modificar documentos de inventario")
      return
    }

    // Cerrar el modal de cases procesados
    closeProcessedCasesModal()

    // Abrir el modal de conteo para el material
    setSelectedMaterial(material)

    // Resetear los errores
    setUbicacionError(null)
    setCaseError(null)
    setCombinationError(null)

    // Preparar los datos para el modal
    // Obtener los cases registrados actuales para este material
    const currentRegisteredCases = materialCasesMap[material.MATNR] || []

    // Filtrar el case que estamos editando
    const otherRegisteredCases = currentRegisteredCases.filter((c) => c.case !== caseItem.case)

    // Crear la lista de cases pendientes (todos los cases del material que no están en otherRegisteredCases)
    const pendingCases: ConteoCase[] = material.CASES.filter(
      (c) =>
        !otherRegisteredCases.some((rc) => {
          const normalizedRC = rc.case.replace(/^0+/, "")
          const normalizedC = c.CASE.replace(/^0+/, "")
          return normalizedRC === normalizedC
        }),
    ).map((c) => ({
      case: c.CASE,
      ubicacion: c.UBICACION,
      cantidad: "",
      estado: "pendiente",
      excepcion: c.EXCEP || "00",
      werks: conteoData?.WERKS || "",
      lgort: conteoData?.LGORT || "",
    }))

    // Establecer el estado del conteo
    setConteoMaterial({
      ubicacion: "",
      case: "",
      cantidad: "",
      excepcion: "00",
      casesRegistrados: otherRegisteredCases,
      casesPendientes: pendingCases,
    })

    // Establecer el case en modo edición
    setEditingCase(caseItem)

    // Cargar los datos del case en el formulario
    resetConteo({
      ubicacion: caseItem.ubicacion,
      case: caseItem.case,
      cantidad: caseItem.cantidad,
      excepcion: caseItem.excepcion,
    })

    // Abrir el modal
    setIsModalOpen(true)

    // Bloquear scroll del body
    document.body.style.overflow = "hidden"

    // Enfocar el campo de ubicación
    setTimeout(() => {
      if (ubicacionRef.current) {
        ubicacionRef.current.focus()
      }
    }, 100)
  }

  // Modificar la función handleCaseChange para normalizar el case de manera consistente
  const handleCaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const caseValue = e.target.value

    if (!selectedMaterial || !caseValue) return

    // Normalizar el case eliminando ceros a la izquierda
    const normalizedCase = caseValue.replace(/^0+/, "")

    // Encontrar el case en el array CASES del material
    const foundCase = selectedMaterial.CASES.find((c) => {
      // Normalizar el CASE de los datos eliminando ceros a la izquierda
      const normalizedDataCase = c.CASE.replace(/^0+/, "")
      return normalizedDataCase === normalizedCase
    })

    if (foundCase) {
      // Auto-rellenar el campo de ubicación con la ubicación del case
      //setValueConteo("ubicacion", foundCase.UBICACION)

      // Establecer el valor de excepción
      if (foundCase.EXCEP) {
        setValueConteo("excepcion", foundCase.EXCEP)
      }

      // Limpiar cualquier error de case
      setCaseError(null)
      setCombinationError(null)
    }
  }

  // Actualizar la función procesarConteo para verificar si hay materiales procesados y si el conteo ya está procesado
  // Buscar la función procesarConteo y reemplazarla con:

  // Reemplazar la función procesarConteo existente con esta nueva implementación
  // Modificar la función procesarConteo para verificar permisos
  // Reemplazar el inicio de la función procesarConteo:
  const procesarConteo = () => {
    // Verificar si hay materiales procesados
    if (procesados.length === 0) {
      error("No hay materiales procesados para procesar")
      return
    }

    // Verificar si el conteo ya está procesado
    if (conteoData?.estado === "procesado") {
      error("Este conteo ya ha sido procesado y no se puede modificar")
      return
    }

    // Verificar permisos
    if (!canProcess) {
      error("No tienes permisos para procesar documentos de inventario")
      return
    }

    // Mostrar el modal de confirmación
    setIsProcessModalOpen(true)
  }

  // Actualizar la función handleConfirmProcess para asegurar que crea o actualiza los datos del conteo
  // Buscar la función handleConfirmProcess y reemplazarla con:

  // Modificar la función handleConfirmProcess para asegurar que se guarde el estado como "procesado"
  // Modificar la función handleConfirmProcess para verificar permisos
  // Reemplazar el inicio de la función handleConfirmProcess:
  const handleConfirmProcess = async () => {
    if (!canProcess) {
      error("No tienes permisos para procesar documentos de inventario")
      setIsProcessModalOpen(false)
      return
    }

    setIsProcessing(true)

    try {
      // Verificar si hay materiales procesados
      if (procesados.length === 0) {
        error("No hay materiales procesados para procesar")
        setIsProcessModalOpen(false)
        setIsProcessing(false)
        return
      }

      // PASO 1: Primero guardar los datos actuales del conteo con estado "procesado"
      // Preparar los datos para enviar al servidor
      const dataToSave = {
        conteoData,
        materialCasesMap,
        usuarioCreador: "usuario_actual", // Aquí deberías obtener el usuario actual del sistema
        estado: "procesado", // Establecer el estado como "procesado" directamente
      }

      // Enviar los datos al servidor para guardar y procesar
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cont/save-conteo`, dataToSave)

      if (response.status === 200 || response.status === 201) {
        // PASO 2: Ahora llamar específicamente al endpoint de procesamiento para asegurar que se actualice el estado
        const conteoId = response.data.conteo?._id || response.data.conteo?.id

        if (conteoId) {
          // Llamar al endpoint específico para procesar el conteo
          const processResponse = await axios.post(`${import.meta.env.VITE_API_URL}/cont/procesar-conteo`, {
            conteoId,
            usuarioProcesador: "usuario_actual", // Aquí deberías obtener el usuario actual del sistema
          })

          if (processResponse.status === 200) {
            console.log("Conteo procesado correctamente en el servidor")
          } else {
            console.warn("El conteo se guardó pero hubo un problema al procesarlo")
          }
        }

        // Actualizar el estado del conteo a "procesado" en la interfaz
        setConteoData((prevData) => {
          if (!prevData) return null
          return {
            ...prevData,
            estado: "procesado",
          }
        })

        // Mostrar mensaje de éxito
        success("Conteo procesado correctamente. Estado: procesado")
      } else {
        error("Error al procesar el conteo")
      }
    } catch (err) {
      console.error("Error al procesar conteo:", err)
      error("Error al procesar el conteo: " + err)
    } finally {
      setIsProcessing(false)
      setIsProcessModalOpen(false)
    }
  }

  // Agregar esta función para cerrar el modal de procesamiento
  const closeProcessModal = () => {
    setIsProcessModalOpen(false)
  }

  // Modificar la función handleProcessConteo para guardar los cases procesados

  // Agregar función para ver los cases procesados
  const viewProcessedCases = (material: Material) => {
    console.log("Viendo cases procesados para material:", material.MATNR)
    console.log("Material completo:", JSON.stringify(material))

    // Verificar si hay cases para este material
    const casesList = materialCasesMap[material.MATNR]
    console.log("Cases disponibles para este material:", casesList)

    if (!casesList || casesList.length === 0) {
      console.error(`No hay cases registrados para el material ${material.MATNR}`)
      error(`No hay cases registrados para el material ${material.MATNR}`)
    } else {
      console.log(`Encontrados ${casesList.length} cases para mostrar`)
    }

    setViewingProcessedCases(material)
    setIsProcessedCasesModalOpen(true)
    // Bloquear scroll del body
    document.body.style.overflow = "hidden"
  }

  // Agregar función para cerrar el modal de cases procesados
  const closeProcessedCasesModal = () => {
    setIsProcessedCasesModalOpen(false)
    setViewingProcessedCases(null)
    // Restaurar scroll del body
    document.body.style.overflow = "auto"
  }

  // Modificar la función deleteMaterialProcessing para verificar permisos
  // Reemplazar el inicio de la función deleteMaterialProcessing:
  const deleteMaterialProcessing = (material: Material) => {
    // Verificar si el conteo está procesado o contabilizado
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") {
      error(`No se pueden realizar modificaciones. El conteo está en estado: ${conteoData.estado}`)
      return
    }

    // Verificar permisos
    if (!canModify) {
      error("No tienes permisos para eliminar materiales de documentos de inventario")
      return
    }

    // Eliminar el material de la lista de procesados
    setProcesados((prev) => prev.filter((m) => m.MATNR !== material.MATNR))

    // Eliminar los cases procesados para este material
    setMaterialCasesMap((prev) => {
      const newMap = { ...prev }
      delete newMap[material.MATNR]
      return newMap
    })

    success(`Material ${material.MATNR} eliminado de procesados`)
  }

  // Modificar la función handleSaveConteo para verificar permisos
  // Reemplazar el inicio de la función handleSaveConteo:
  const handleSaveConteo = () => {
    if (!canModify) {
      error("No tienes permisos para guardar documentos de inventario")
      return
    }

    setIsSaving(true)

    try {
      if (selectedMaterial) {
        // Si el material no está en procesados, agregarlo
        if (!procesados.some((m) => m.MATNR === selectedMaterial.MATNR)) {
          setProcesados((prev) => [...prev, selectedMaterial])
        }

        // Guardar los cases procesados para este material
        const updatedCases = [...conteoMaterial.casesRegistrados]

        // Actualizar el mapa de cases
        setMaterialCasesMap((prev) => {
          const newMap = { ...prev }
          newMap[selectedMaterial.MATNR] = updatedCases

          // Log para depuración
          console.log(
            `Guardando ${updatedCases.length} cases para el material ${selectedMaterial.MATNR}:`,
            updatedCases,
          )
          console.log("Mapa de cases actualizado:", newMap)

          return newMap
        })

        // Mostrar mensaje de éxito
        success("Conteo guardado correctamente")

        // Cerrar el modal después de un breve retraso
        setTimeout(() => {
          setIsSaving(false)
          closeModal()
        }, 500)
      } else {
        setIsSaving(false)
        error("No se pudo guardar: Material no seleccionado")
      }
    } catch (err) {
      console.error("Error al guardar conteo:", err)
      error("Error al guardar el conteo")
      setIsSaving(false)
    }
  }

  // Modificar la función handleSaveAllToDB para verificar permisos
  // Reemplazar el inicio de la función handleSaveAllToDB:
  const handleSaveAllToDB = async () => {
    // Verificar si hay materiales procesados
    if (procesados.length === 0) {
      error("No hay materiales procesados para guardar")
      return
    }

    // Verificar si el conteo está procesado o contabilizado
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") {
      error(`No se pueden realizar modificaciones. El conteo está en estado: ${conteoData.estado}`)
      return
    }

    // Verificar permisos
    if (!canModify) {
      error("No tienes permisos para guardar documentos de inventario")
      return
    }

    setIsSavingGlobal(true)

    try {
      // Preparar los datos para enviar al servidor
      const dataToSave = {
        conteoData,
        materialCasesMap,
        usuarioCreador: "usuario_actual", // Aquí deberías obtener el usuario actual del sistema
      }

      // Enviar los datos al servidor
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/cont/save-conteo`, dataToSave)

      if (response.status === 200 || response.status === 201) {
        // Siempre establecer el estado como "pendiente" después de guardar exitosamente
        setConteoData((prevData) => {
          if (!prevData) return null
          return {
            ...prevData,
            estado: "pendiente",
          }
        })

        // Mostrar mensaje de éxito con el estado
        success("Conteo guardado correctamente. Estado: pendiente")
      } else {
        error("Error al guardar el conteo")
      }
    } catch (err) {
      console.error("Error al guardar conteo:", err)
      error("Error al guardar el conteo: " + err)
    } finally {
      setIsSavingGlobal(false)
    }
  }

  const handleNewSearch = () => {
    setConteoData(null)
    setShowConteo(false)
    reset()
    setProcesados([])

    // Poner el foco en el input de conteo
    setTimeout(() => {
      const conteoInput = document.getElementById("conteo")
      if (conteoInput) {
        conteoInput.focus()
      }
    }, 100)
  }

  // Handle key down in ubicacion field - Modificado para limpiar errores al escribir
  const handleUbicacionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const ubicacion = getValuesConteo("ubicacion")
      if (validateUbicacion(ubicacion)) {
        caseRef.current?.focus()
      } else {
        // Keep focus on ubicacion field if validation fails
        ubicacionRef.current?.focus()
      }
    } else {
      // Limpiar el error cuando el usuario comienza a escribir
      setUbicacionError(null)
      setCombinationError(null)
    }
  }

  // Handle key down in case field - Modificado para asegurar que el valor se capture correctamente
  const handleCaseKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      // Asegurarse de que el valor del case se capture correctamente
      const caseValue = e.currentTarget.value

      // Actualizar el valor en el formulario para asegurar que esté disponible
      setValueConteo("case", caseValue)

      if (validateCase(caseValue)) {
        cantidadRef.current?.focus()
      } else {
        // Keep focus on case field if validation fails
        caseRef.current?.focus()
      }
    } else {
      // Limpiar el error cuando el usuario comienza a escribir
      setCaseError(null)
      setCombinationError(null)
    }
  }

  // Add a function to handle clicking on the state indicator
  const handleStateClick = (e: React.MouseEvent, caseItem: ConteoCase) => {
    e.stopPropagation()

    if (caseItem.diferencia === undefined) return

    let message = ""
    if (caseItem.diferencia === 0) {
      message = "La cantidad ingresada coincide con la cantidad original."
    } else if (caseItem.diferencia > 0) {
      message = `La cantidad ingresada es mayor por ${caseItem.diferencia} unidades.`
    } else {
      message = `La cantidad ingresada es menor por ${Math.abs(caseItem.diferencia)} unidades.`
    }

    // Calculate position for the tooltip
    const rect = e.currentTarget.getBoundingClientRect()
    const position = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    }

    setTooltipInfo({
      visible: true,
      message,
      position,
    })

    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setTooltipInfo((prev) => ({ ...prev, visible: false }))
    }, 3000)
  }

  // Modificar la función handleModifyMaterial para verificar permisos
  // Reemplazar el inicio de la función handleModifyMaterial:
  const handleModifyMaterial = (material: Material) => {
    // Verificar si el conteo está procesado o contabilizado
    if (conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado") {
      error(`No se pueden realizar modificaciones. El conteo está en estado: ${conteoData.estado}`)
      return
    }

    // Verificar permisos
    if (!canModify) {
      error("No tienes permisos para modificar documentos de inventario")
      return
    }

    // Abrir el modal de conteo con los cases ya registrados
    openConteoModal(material, true)
  }

  // Add a new state for the active tab within the modal
  const [activeModalTab, setActiveModalTab] = useState<"available" | "processed">("available")

  // Agregar esta función para renderizar el estado del conteo
  const renderConteoStatus = (estado: string) => {
    switch (estado) {
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

  return (
    <>
      <ResponsiveStyles />
      <Breadcrumb pageName="Documentos de Inventario" />
      <div className="grid grid-cols-1 gap-4 mt-4">
        {/* Formulario de búsqueda - Mantenido exactamente igual */}
        <div
          className={`bg-white dark:bg-boxdark rounded-md shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md ${isHandheld ? "handheld-container" : ""}`}
        >
          <div className={`p-4 ${isHandheld ? "handheld-p-2" : ""}`}>
            <div className="flex items-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={isHandheld ? "16" : "20"}
                height={isHandheld ? "16" : "20"}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary mr-2"
              >
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <path d="m9 14 2 2 4-4" />
              </svg>
              <h2
                className={`text-base font-semibold text-gray-800 dark:text-white ${isHandheld ? "handheld-text-sm" : ""}`}
              >
                Buscar Documento de Inventario
              </h2>
            </div>

            <form onSubmit={handleSubmit(handleSearch)} className={isHandheld ? "handheld-compact-form" : ""}>
              <div
                className={`flex ${isHandheld ? "handheld-flex-col handheld-gap-1" : "flex-col sm:flex-row"} items-center`}
              >
                <div className="relative flex-grow w-full mb-2 sm:mb-0">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={isHandheld ? "14" : "16"}
                      height={isHandheld ? "14" : "16"}
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
                    id="conteo"
                    type="text"
                    placeholder="Ingrese número de documento de inventario"
                    className={`w-full rounded-md ${isHandheld ? "sm:rounded-md handheld-text-sm" : "sm:rounded-l-md sm:rounded-r-none"} border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white text-sm`}
                    {...register("conteo", { required: "El número de documento de inventario es obligatorio" })}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full sm:w-auto flex items-center justify-center gap-1 rounded-md ${isHandheld ? "sm:rounded-md handheld-text-xs" : "sm:rounded-l-none sm:rounded-r-md"} bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary`}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={isHandheld ? "14" : "16"}
                        height={isHandheld ? "14" : "16"}
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
                      <span>Buscar</span>
                    </>
                  )}
                </button>
              </div>
              {errors.conteo && <ErrorMessage>{errors.conteo.message}</ErrorMessage>}
            </form>
          </div>
        </div>

        {/* Update the main conteos screen section - Replace the existing results section with this improved version */}
        {/* Find the section that starts with: {conteoData && showConteo && ( */}
        {/* And replace it with: */}

        {conteoData && showConteo && (
          <div
            className={`rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-boxdark overflow-hidden transition-all duration-300 animate-fadeIn ${isHandheld ? "handheld-container" : ""}`}
          >
            <div className={`${isHandheld ? "p-2 sm:p-3" : "p-4 sm:p-6"}`}>
              {/* Cabecera del conteo - Mejorada */}
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
                      {conteoData.estado && (
                        <div className="ml-2 animate-fadeIn">{renderConteoStatus(conteoData.estado)}</div>
                      )}
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
                <div
                  className={`flex ${isHandheld ? "flex-col handheld-flex-col gap-1 handheld-gap-1" : "flex-col sm:flex-row"} items-start sm:items-center gap-2 w-full sm:w-auto`}
                >
                  <button
                    onClick={handleSaveAllToDB}
                    disabled={
                      isSavingGlobal ||
                      procesados.length === 0 ||
                      conteoData?.estado === "procesado" ||
                      conteoData?.estado === "contabilizado" ||
                      !canModify
                    }
                    className={`bg-blue-500 text-white ${isHandheld ? "px-3 py-1.5 handheld-py-1 handheld-px-2 handheld-text-xs" : "px-4 py-2"} rounded-md text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-blue-600 transition-all duration-300 font-medium disabled:opacity-70 disabled:cursor-not-allowed`}
                  >
                    {isSavingGlobal ? (
                      <>
                        <Loader2 size={isHandheld ? 14 : 16} className="animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save size={isHandheld ? 14 : 16} />
                        <span>Guardar</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={procesarConteo}
                    disabled={
                      conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado" || !canProcess
                    }
                    className={`bg-success text-white ${isHandheld ? "px-3 py-1.5 handheld-py-1 handheld-px-2 handheld-text-xs" : "px-4 py-2"} rounded-md text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-success/90 transition-all duration-300 font-medium ${
                      conteoData?.estado === "procesado" || conteoData?.estado === "contabilizado" || !canProcess
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <BarChart4 size={isHandheld ? 14 : 16} />
                    <span>Procesar</span>
                  </button>
                  <button
                    onClick={handleNewSearch}
                    className={`bg-primary text-white ${isHandheld ? "px-3 py-1.5 handheld-py-1 handheld-px-2 handheld-text-xs" : "px-4 py-2"} rounded-md text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-300 font-medium`}
                  >
                    <RefreshCw size={isHandheld ? 14 : 16} />
                    <span>Nueva búsqueda</span>
                  </button>
                </div>
              </div>

              {/* Información del conteo - Mejorada */}
              {/* Información del conteo - Versión compacta */}
              <div
                className={`mb-4 bg-gray-50 dark:bg-gray-800/30 ${isHandheld ? "p-2 handheld-p-2" : "p-3"} rounded-lg border border-gray-100 dark:border-gray-700`}
              >
                <div
                  className={`grid ${isHandheld ? "grid-cols-2 handheld-grid-cols-1 gap-2 handheld-gap-1" : "grid-cols-2 xs:grid-cols-3 md:grid-cols-5 gap-3"}`}
                >
                  <div className="flex items-center gap-1.5">
                    <User size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}
                      >
                        Creado por
                      </p>
                      <p
                        className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}
                      >
                        {conteoData.USNAM}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}
                      >
                        Fecha
                      </p>
                      <p
                        className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}
                      >
                        {conteoData.BLDAT}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}
                      >
                        Centro
                      </p>
                      <p
                        className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}
                      >
                        {conteoData.WERKS}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Store size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}
                      >
                        Almacén
                      </p>
                      <p
                        className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}
                      >
                        {conteoData.LGORT}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText size={isHandheld ? 16 : 18} className="text-gray-400 flex-shrink-0" />
                    <div>
                      <p
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-xs"} font-medium text-gray-500 dark:text-gray-400 leading-tight`}
                      >
                        Referencia
                      </p>
                      <p
                        className={`font-medium text-gray-800 dark:text-white ${isHandheld ? "text-xs handheld-text-xs" : "text-sm"}`}
                      >
                        {conteoData.XBLNI}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {conteoData.estado && (
                <div
                  className="mb-4 p-3 rounded-lg border animate-fadeIn"
                  style={{
                    backgroundColor:
                      conteoData.estado === "contabilizado"
                        ? "rgba(34, 197, 94, 0.1)"
                        : conteoData.estado === "procesado"
                          ? "rgba(59, 130, 246, 0.1)"
                          : "rgba(234, 179, 8, 0.1)",
                    borderColor:
                      conteoData.estado === "contabilizado"
                        ? "rgba(34, 197, 94, 0.3)"
                        : conteoData.estado === "procesado"
                          ? "rgba(59, 130, 246, 0.3)"
                          : "rgba(234, 179, 8, 0.3)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {conteoData.estado === "contabilizado" ? (
                        <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                      ) : conteoData.estado === "procesado" ? (
                        <Check size={24} className="text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-white">
                        Estado del documento:{" "}
                        <span className="font-semibold">
                          {conteoData.estado.charAt(0).toUpperCase() + conteoData.estado.slice(1)}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {conteoData.estado === "contabilizado"
                          ? "Este documento ha sido contabilizado completamente."
                          : conteoData.estado === "procesado"
                            ? "Este documento ha sido procesado y está pendiente de contabilización."
                            : "Este documento está pendiente de procesamiento."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sistema de pestañas para materiales - Mejorado */}
              <div className={`mb-8 ${isHandheld ? "mb-4" : ""}`}>
                <div
                  className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 ${isHandheld ? "mb-2 gap-2" : ""}`}
                >
                  <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveTab("pending")}
                      className={`${isHandheld ? "py-1.5 px-3 handheld-py-1 handheld-px-2 handheld-text-xs" : "py-2 px-4"} text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                        activeTab === "pending"
                          ? "bg-white dark:bg-boxdark border-b-2 border-primary text-primary"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <Clipboard size={isHandheld ? 14 : 16} />
                      Por Procesar
                      <span
                        className={`inline-flex items-center justify-center ${isHandheld ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"} font-medium rounded-full bg-gray-100 dark:bg-gray-700`}
                      >
                        {conteoData.MATERIALES.length - procesados.length}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("processed")}
                      className={`${isHandheld ? "py-1.5 px-3 handheld-py-1 handheld-px-2 handheld-text-xs" : "py-2 px-4"} text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                        activeTab === "processed"
                          ? "bg-white dark:bg-boxdark border-b-2 border-primary text-primary"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      <ClipboardCheck size={isHandheld ? 14 : 16} />
                      Procesados
                      <span
                        className={`inline-flex items-center justify-center ${isHandheld ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"} font-medium rounded-full bg-gray-100 dark:bg-gray-700`}
                      >
                        {procesados.length}
                      </span>
                    </button>
                  </div>

                  <div className={`relative ${isHandheld ? "w-full" : "w-full sm:w-64"}`}>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search size={isHandheld ? 14 : 16} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar material..."
                      className={`w-full rounded-md border border-gray-200 bg-transparent ${isHandheld ? "py-1.5 handheld-py-1 handheld-text-xs" : "py-2"} pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white text-sm`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Contenido de la pestaña activa - Mejorado */}
                {activeTab === "pending" ? (
                  <div
                    className={`space-y-2 ${isHandheld ? "max-h-[50vh] handheld-max-h-60vh" : "max-h-[60vh]"} overflow-y-auto custom-scrollbar pr-1`}
                  >
                    {filteredPendingMaterials.length === 0 ? (
                      <div
                        className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700 flex flex-col items-center
        justify-center"
                      >
                        <Clipboard size={isHandheld ? 20 : 24} className="text-gray-400 mb-2" />
                        <p
                          className={`text-gray-500 dark:text-gray-400 ${isHandheld ? "text-xs handheld-text-xs" : ""}`}
                        >
                          {searchTerm
                            ? "No se encontraron materiales con ese término"
                            : "No hay materiales pendientes por procesar"}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`grid grid-cols-1 ${isHandheld ? "md:grid-cols-1 handheld-grid-cols-1 gap-1 handheld-gap-1" : "md:grid-cols-2 gap-2"}`}
                      >
                        {filteredPendingMaterials.map((material, index) => (
                          <div
                            key={material.MATNR}
                            className={`bg-white dark:bg-boxdark border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-md animate-slideInRight hover-card ${isHandheld ? "handheld-p-2" : ""}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div
                              className={`${isHandheld ? "p-2 handheld-p-2" : "p-3"} flex flex-col sm:flex-row justify-between items-start sm:items-center`}
                            >
                              <div className="flex items-start mb-3 sm:mb-0 gap-3">
                                <div
                                  className={`flex items-center justify-center ${isHandheld ? "w-6 h-6" : "w-8 h-8"} rounded-full bg-primary/10 text-primary flex-shrink-0`}
                                >
                                  <Package size={isHandheld ? 12 : 16} />
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
                              <button
                                onClick={() => openConteoModal(material)}
                                className={`bg-primary hover:bg-primary/90 text-white ${isHandheld ? "py-1 px-2 handheld-py-1 handheld-px-2 text-xs handheld-text-xs" : "py-1.5 px-3 text-sm"} rounded-md transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-start`}
                              >
                                <Plus size={isHandheld ? 12 : 14} />
                                Realizar Conteo
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`space-y-2 ${isHandheld ? "max-h-[50vh] handheld-max-h-60vh" : "max-h-[60vh]"} overflow-y-auto custom-scrollbar pr-1`}
                  >
                    {filteredProcessedMaterials.length === 0 ? (
                      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                        <ClipboardCheck size={isHandheld ? 20 : 24} className="text-gray-400 mb-2" />
                        <p
                          className={`text-gray-500 dark:text-gray-400 ${isHandheld ? "text-xs handheld-text-xs" : ""}`}
                        >
                          {searchTerm ? "No se encontraron materiales con ese término" : "No hay materiales procesados"}
                        </p>
                      </div>
                    ) : (
                      <div
                        className={`grid grid-cols-1 ${isHandheld ? "md:grid-cols-1 handheld-grid-cols-1 gap-1 handheld-gap-1" : "md:grid-cols-2 gap-2"}`}
                      >
                        {filteredProcessedMaterials.map((material, index) => (
                          <div
                            key={material.MATNR}
                            className={`bg-white dark:bg-boxdark border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:border-green-300 hover:shadow-md animate-slideInRight hover-card ${isHandheld ? "handheld-p-2" : ""}`}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div
                              className={`${isHandheld ? "p-2 handheld-p-2" : "p-3"} flex flex-col sm:flex-row justify-between items-start sm:items-center border-l-2 border-green-500`}
                            >
                              <div className="flex items-start mb-3 sm:mb-0 gap-3">
                                <div
                                  className={`flex items-center justify-center ${isHandheld ? "w-6 h-6" : "w-8 h-8"} rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0`}
                                >
                                  <Check size={isHandheld ? 12 : 16} />
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
                              <div
                                className={`flex flex-wrap gap-2 w-full sm:w-auto ${isHandheld ? "mt-1 handheld-gap-1" : ""}`}
                              >
                                <button
                                  onClick={() => handleModifyMaterial(material)}
                                  disabled={
                                    conteoData?.estado === "procesado" ||
                                    conteoData?.estado === "contabilizado" ||
                                    !canModify
                                  }
                                  className={`bg-yellow-500 hover:bg-yellow-600 text-white ${isHandheld ? "px-2 py-0.5 text-[10px] handheld-text-xs" : "px-2 py-1 text-xs"} rounded transition-colors flex items-center gap-1 ${
                                    conteoData?.estado === "procesado" ||
                                    conteoData?.estado === "contabilizado" ||
                                    !canModify
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <Edit2 size={isHandheld ? 10 : 12} />
                                  Modificar
                                </button>
                                <button
                                  onClick={() => viewProcessedCases(material)}
                                  className={`bg-blue-500 hover:bg-blue-600 text-white ${isHandheld ? "px-2 py-0.5 text-[10px] handheld-text-xs" : "px-2 py-1 text-xs"} rounded transition-colors flex items-center gap-1`}
                                >
                                  <Eye size={isHandheld ? 10 : 12} />
                                  Ver Cases
                                </button>
                                <button
                                  onClick={() => deleteMaterialProcessing(material)}
                                  disabled={
                                    conteoData?.estado === "procesado" ||
                                    conteoData?.estado === "contabilizado" ||
                                    !canModify
                                  }
                                  className={`bg-red-500 hover:bg-red-600 text-white ${isHandheld ? "px-2 py-0.5 text-[10px] handheld-text-xs" : "px-2 py-1 text-xs"} rounded transition-colors flex items-center gap-1 ${
                                    conteoData?.estado === "procesado" ||
                                    conteoData?.estado === "contabilizado" ||
                                    !canModify
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                >
                                  <Trash2 size={isHandheld ? 10 : 12} />
                                  Borrar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Conteo - Rediseñado y Minimalista */}
      {isModalOpen && selectedMaterial && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${isHandheld ? "p-1" : "p-2 sm:p-4"} pt-16 ml-0 lg:ml-72.5 touch-none`}
        >
          <div
            className="fixed inset-0 bg-black/50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={closeModal}
            style={{ userSelect: "none" }}
          ></div>

          <div
            className={`relative w-full ${isHandheld ? "max-w-full handheld-modal" : "max-w-3xl"} bg-white dark:bg-boxdark rounded-lg shadow-lg transform transition-all mx-auto flex flex-col max-h-[90vh] z-[60] animate-scaleIn`}
          >
            {/* Header - Minimalista con iconos */}
            <div
              className={`sticky top-0 z-10 flex justify-between items-center ${isHandheld ? "px-3 py-2 handheld-modal-header" : "px-4 sm:px-6 py-3"} border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-lg`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center ${isHandheld ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-primary/10 text-primary`}
                >
                  <Package size={isHandheld ? 16 : 18} />
                </div>
                <div>
                  <h2
                    className={`${isHandheld ? "text-base handheld-text-base" : "text-lg"} font-medium text-gray-800 dark:text-white flex items-center gap-2`}
                  >
                    <span>Registrar Conteo</span>
                    <span
                      className={`${isHandheld ? "text-[10px] handheld-text-xs px-1.5 py-0.5" : "text-xs px-2 py-0.5"} bg-primary/10 text-primary rounded-full`}
                    >
                      {conteoData?.IBLNR}
                    </span>
                  </h2>
                  <p
                    className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-500 dark:text-gray-400 truncate max-w-[250px] sm:max-w-[400px]`}
                  >
                    {selectedMaterial.MATNR} - {selectedMaterial.MAKTX}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar"
              >
                <X size={isHandheld ? 16 : 18} />
              </button>
            </div>

            {/* Contenido con scroll - Minimalista */}
            <div
              className={`${isHandheld ? "p-3 handheld-modal-content" : "p-4 sm:p-6"} overflow-y-auto flex-grow custom-scrollbar`}
            >
              {/* Tabs for Available and Processed Cases */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                  onClick={() => setActiveModalTab("available")}
                  className={`${isHandheld ? "py-1.5 px-3 text-xs handheld-text-xs" : "py-2 px-4 text-sm"} font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                    activeModalTab === "available"
                      ? "bg-white dark:bg-boxdark border-b-2 border-primary text-primary"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Clipboard size={isHandheld ? 14 : 16} />
                  Cases Disponibles
                  <span
                    className={`inline-flex items-center justify-center ${isHandheld ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"} font-medium rounded-full bg-gray-100 dark:bg-gray-700`}
                  >
                    {conteoMaterial.casesPendientes.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveModalTab("processed")}
                  className={`${isHandheld ? "py-1.5 px-3 text-xs handheld-text-xs" : "py-2 px-4 text-sm"} font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                    activeModalTab === "processed"
                      ? "bg-white dark:bg-boxdark border-b-2 border-primary text-primary"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <ClipboardCheck size={isHandheld ? 14 : 16} />
                  Cases Registrados
                  <span
                    className={`inline-flex items-center justify-center ${isHandheld ? "w-4 h-4 text-[10px]" : "w-5 h-5 text-xs"} font-medium rounded-full bg-gray-100 dark:bg-gray-700`}
                  >
                    {conteoMaterial.casesRegistrados.length}
                  </span>
                </button>
              </div>

              {/* Formulario de conteo - Enhanced form styling */}
              <div
                className={`mb-6 bg-gray-50 dark:bg-gray-800/30 ${isHandheld ? "p-3 handheld-p-2" : "p-5"} rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm`}
              >
                <h3
                  className={`${isHandheld ? "text-sm handheld-text-sm" : "text-base"} font-medium text-gray-800 dark:text-white mb-4 flex items-center gap-2`}
                >
                  {editingCase ? <Edit2 size={isHandheld ? 14 : 16} /> : <Plus size={isHandheld ? 14 : 16} />}
                  {editingCase ? "Editar Case" : "Registrar Nuevo Case"}
                </h3>
                <form
                  onSubmit={handleSubmitConteo(handleConteoSubmit)}
                  className={`mb-2 ${isHandheld ? "handheld-compact-form" : ""}`}
                >
                  <div
                    className={`grid grid-cols-1 ${isHandheld ? "sm:grid-cols-1 gap-3 handheld-gap-1" : "sm:grid-cols-2 gap-4"} mb-4`}
                  >
                    <div>
                      <label
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-700 dark:text-white mb-3 flex items-center gap-1`}
                      >
                        <MapPin size={isHandheld ? 12 : 14} />
                        Ubicación
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full rounded-md border ${ubicacionError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary focus:ring-primary"} bg-white ${isHandheld ? "py-1.5 handheld-py-1 text-sm handheld-text-xs" : "py-2"} px-3 text-gray-800 outline-none transition focus:ring-1 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white`}
                          placeholder="Ingrese ubicación"
                          {...registerWithRef("ubicacion", { required: "La ubicación es obligatoria" }, ubicacionRef)}
                          onKeyDown={handleUbicacionKeyDown}
                        />
                      </div>
                      {ubicacionError && (
                        <p
                          className={`mt-1 ${isHandheld ? "text-[10px] handheld-text-xs" : "text-xs"} text-red-500 flex items-center gap-1`}
                        >
                          <AlertCircle size={isHandheld ? 10 : 12} />
                          {ubicacionError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-700 dark:text-white mb-3 flex items-center gap-1`}
                      >
                        <Package size={isHandheld ? 12 : 14} />
                        Case
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full rounded-md border ${caseError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary focus:ring-primary"} bg-white ${isHandheld ? "py-1.5 handheld-py-1 text-sm handheld-text-xs" : "py-2"} px-3 text-gray-800 outline-none transition focus:ring-1 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white`}
                          placeholder="Ingrese case"
                          {...registerWithRef("case", { required: "El case es obligatorio" }, caseRef)}
                          onKeyDown={handleCaseKeyDown}
                          onChange={handleCaseChange}
                        />
                      </div>
                      {caseError && (
                        <p
                          className={`mt-1 ${isHandheld ? "text-[10px] handheld-text-xs" : "text-xs"} text-red-500 flex items-center gap-1`}
                        >
                          <AlertCircle size={isHandheld ? 10 : 12} />
                          {caseError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Mostrar error de combinación si existe */}
                  {combinationError && (
                    <div className="mb-4">
                      <p
                        className={`${isHandheld ? "text-xs handheld-text-xs p-2" : "text-sm p-3"} text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800 flex items-start gap-2`}
                      >
                        <AlertCircle size={isHandheld ? 14 : 16} className="mt-0.5 flex-shrink-0" />
                        <span>{combinationError}</span>
                      </p>
                    </div>
                  )}

                  <div
                    className={`grid grid-cols-1 ${isHandheld ? "sm:grid-cols-1 gap-3 handheld-gap-1" : "sm:grid-cols-2 gap-4"} mb-4`}
                  >
                    <div>
                      <label
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-700 dark:text-white mb-3 flex items-center gap-1`}
                      >
                        <Filter size={isHandheld ? 12 : 14} />
                        Cantidad
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full rounded-md border border-gray-300 bg-white ${isHandheld ? "py-1.5 handheld-py-1 text-sm handheld-text-xs" : "py-2"} px-3 text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/50 dark:text-white`}
                          placeholder="Ingrese cantidad"
                          {...registerWithRef("cantidad", { required: "La cantidad es obligatoria" }, cantidadRef)}
                        />
                      </div>
                      {errorsConteo.cantidad && (
                        <p
                          className={`mt-1 ${isHandheld ? "text-[10px] handheld-text-xs" : "text-xs"} text-red-500 flex items-center gap-1`}
                        >
                          <AlertCircle size={isHandheld ? 10 : 12} />
                          {errorsConteo.cantidad.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-700 dark:text-white mb-3 flex items-center gap-1`}
                      >
                        <AlertCircle size={isHandheld ? 12 : 14} />
                        Excepción
                      </label>
                      <input
                        type="text"
                        className={`w-full rounded-md border border-gray-300 bg-gray-100 ${isHandheld ? "py-1.5 handheld-py-1 text-sm handheld-text-xs" : "py-2"} px-3 text-gray-800 outline-none transition disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                        placeholder="Código de excepción"
                        {...registerConteo("excepcion")}
                        defaultValue="00"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className={`flex gap-3 ${isHandheld ? "mt-3" : "mt-5"}`}>
                    {editingCase && (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white ${isHandheld ? "py-1.5 handheld-py-1 text-xs handheld-text-xs" : "py-2"} px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 font-medium`}
                      >
                        <X size={isHandheld ? 14 : 16} />
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`${editingCase ? "flex-1" : "w-full"} ${editingCase ? "bg-yellow-500 hover:bg-yellow-600" : "bg-primary hover:bg-primary/90"} text-white ${isHandheld ? "py-1.5 handheld-py-1 text-xs handheld-text-xs" : "py-2"} px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 font-medium`}
                    >
                      {editingCase ? <Edit2 size={isHandheld ? 14 : 16} /> : <Plus size={isHandheld ? 14 : 16} />}
                      {editingCase ? "Actualizar" : "Registrar"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Display Cases Based on Active Tab */}
              {activeModalTab === "available" ? (
                <div className="mb-6">
                  <h3
                    className={`${isHandheld ? "text-sm handheld-text-sm" : "text-base"} font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2`}
                  >
                    <Clipboard size={isHandheld ? 14 : 16} />
                    Cases Disponibles
                  </h3>
                  {conteoMaterial.casesPendientes.length > 0 ? (
                    <div
                      className={`grid grid-cols-1 ${isHandheld ? "sm:grid-cols-1 gap-3 handheld-gap-1" : "sm:grid-cols-2 gap-2"} max-h-[30vh] overflow-y-auto custom-scrollbar pr-1`}
                    >
                      {conteoMaterial.casesPendientes.map((caseItem, index) => (
                        <div
                          key={caseItem.case}
                          className={`bg-white dark:bg-boxdark border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm p-3 transition-all duration-300 hover:border-primary/30 hover-card animate-fadeIn`}
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p
                                className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5`}
                              >
                                <Package size={isHandheld ? 12 : 14} className="text-primary" />
                                <span>Case: {caseItem.case}</span>
                              </p>
                              <p
                                className={`${isHandheld ? "text-[10px] handheld-text-xs" : "text-xs"} text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-1`}
                              >
                                <MapPin size={isHandheld ? 10 : 12} />
                                <span>Ubicación: {caseItem.ubicacion}</span>
                              </p>
                            </div>
                            {caseItem.excepcion !== "00" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium badge-yellow">
                                Exc: {caseItem.excepcion}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
                      <Clipboard size={isHandheld ? 20 : 24} className="text-gray-400 mb-2" />
                      <p
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-500 dark:text-gray-400`}
                      >
                        No hay cases disponibles para este material
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-6">
                  <h3
                    className={`${isHandheld ? "text-sm handheld-text-sm" : "text-base"} font-medium text-gray-800 dark:text-white mb-3 flex items-center gap-2`}
                  >
                    <ClipboardCheck size={isHandheld ? 14 : 16} />
                    Cases Registrados
                  </h3>
                  {conteoMaterial.casesRegistrados.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table
                        className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${isHandheld ? "handheld-compact-table" : ""}`}
                      >
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Case
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Ubicación
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>

                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {conteoMaterial.casesRegistrados.map((caseItem, index) => (
                            <tr
                              key={index}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                              onClick={() => handleEditCase(caseItem)}
                            >
                              <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-800 dark:text-white">
                                <div className="flex items-center gap-1.5">
                                  <Package size={isHandheld ? 12 : 14} className="text-primary" />
                                  {caseItem.case}
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-1.5">
                                  <FileText size={isHandheld ? 12 : 14} className="text-gray-400" />
                                  {caseItem.ubicacion}
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-right">
                                <span className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded">
                                  {caseItem.cantidad}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-center">
                                <div className="flex justify-center items-center gap-2">
                                  <div
                                    onClick={(e) => handleStateClick(e, caseItem)}
                                    title="Click para ver diferencia"
                                    className={`w-5 h-5 rounded-full flex items-center justify-center ${caseItem.color === "red" ? "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400"} cursor-pointer hover:ring-1 hover:ring-offset-1 hover:ring-gray-300 transition-all`}
                                  >
                                    {caseItem.color === "red" ? <AlertCircle size={12} /> : <Check size={12} />}
                                  </div>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteCase(caseItem)
                                    }}
                                    title="Eliminar case"
                                    className="w-5 h-5 rounded-full bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400 cursor-pointer hover:bg-red-200 dark:hover:bg-red-800/50 transition-all flex items-center justify-center"
                                  >
                                    <Trash2 size={12} />
                                  </div>
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
                      <p
                        className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-500 dark:text-gray-400`}
                      >
                        No hay cases registrados para este material
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Minimalista */}
            <div
              className={`sticky bottom-0 z-10 flex justify-between ${isHandheld ? "px-3 py-2 handheld-modal-footer" : "px-4 sm:px-6 py-3"} border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-b-lg`}
            >
              <button
                onClick={closeModal}
                className={`px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md transition-colors flex items-center gap-2 text-sm`}
              >
                <ArrowLeft size={16} />
                Volver
              </button>
              <button
                onClick={handleSaveConteo}
                disabled={isSaving || conteoMaterial.casesRegistrados.length === 0 || !canModify}
                className={`px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors flex items-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed text-sm`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver cases procesados - Rediseñado */}
      {isProcessedCasesModalOpen && viewingProcessedCases && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden ${isHandheld ? "p-1" : "p-2 sm:p-4"} pt-16 ml-0 lg:ml-72.5 touch-none`}
        >
          <div
            className="fixed inset-0 bg-black/50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={closeProcessedCasesModal}
            style={{ userSelect: "none" }}
          ></div>

          <div
            className={`relative w-full ${isHandheld ? "max-w-full handheld-modal" : "max-w-2xl"} bg-white dark:bg-boxdark rounded-lg shadow-lg transform transition-all mx-auto flex flex-col max-h-[90vh] z-[60] animate-scaleIn`}
          >
            {/* Header - Minimalista */}
            <div
              className={`sticky top-0 z-10 flex justify-between items-center ${isHandheld ? "px-3 py-2 handheld-modal-header" : "px-4 sm:px-6 py-3"} border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-lg`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center ${isHandheld ? "w-8 h-8" : "w-10 h-10"} rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400`}
                >
                  <ClipboardCheck size={isHandheld ? 16 : 18} />
                </div>
                <div>
                  <h2
                    className={`${isHandheld ? "text-base handheld-text-base" : "text-lg"} font-medium text-gray-800 dark:text-white`}
                  >
                    Cases Procesados
                  </h2>
                  <p
                    className={`${isHandheld ? "text-xs handheld-text-xs" : "text-sm"} text-gray-500 dark:text-gray-400 truncate max-w-[250px] sm:max-w-[400px]`}
                  >
                    {viewingProcessedCases.MATNR} - {viewingProcessedCases.MAKTX}
                  </p>
                </div>
              </div>
              <button
                onClick={closeProcessedCasesModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar"
              >
                <X size={isHandheld ? 16 : 18} />
              </button>
            </div>

            {/* Contenido con scroll - Minimalista */}
            <div
              className={`${isHandheld ? "p-3 handheld-modal-content" : "p-4 sm:p-6"} overflow-y-auto flex-grow custom-scrollbar`}
            >
              {viewingProcessedCases &&
              materialCasesMap &&
              materialCasesMap[viewingProcessedCases.MATNR] &&
              materialCasesMap[viewingProcessedCases.MATNR].length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                  <table
                    className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${isHandheld ? "handheld-compact-table" : ""}`}
                  >
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Case
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {materialCasesMap[viewingProcessedCases.MATNR].map((caseItem, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 animate-slideInUp"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-800 dark:text-white">
                            <div className="flex items-center gap-1.5">
                              <Package size={isHandheld ? 12 : 14} className="text-primary" />
                              {caseItem.case}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1.5">
                              <FileText size={isHandheld ? 12 : 14} className="text-gray-400" />
                              {caseItem.ubicacion}
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-right">
                            <span className="bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded">{caseItem.cantidad}</span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-xs sm:text-sm text-center">
                            <div className="flex justify-center items-center gap-2">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center ${caseItem.color === "red" ? "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400" : "bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400"} cursor-pointer hover:ring-1 hover:ring-offset-1 hover:ring-gray-300 transition-all`}
                                onClick={(e) => handleStateClick(e, caseItem)}
                                title="Click para ver diferencia"
                              >
                                {caseItem.color === "red" ? <AlertCircle size={12} /> : <Check size={12} />}
                              </div>
                              <div
                                onClick={() => handleEditProcessedCase(caseItem, viewingProcessedCases)}
                                title="Editar case"
                                className="w-5 h-5 rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-all flex items-center justify-center"
                              >
                                <Edit2 size={12} />
                              </div>
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
                  <p className={`text-gray-500 dark:text-gray-400 ${isHandheld ? "text-xs handheld-text-xs" : ""}`}>
                    No hay cases procesados para este material
                  </p>
                </div>
              )}
            </div>

            {/* Footer - Minimalista */}
            <div
              className={`sticky bottom-0 z-10 flex justify-end ${isHandheld ? "px-3 py-2 handheld-modal-footer" : "px-4 sm:px-6 py-3"} border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-b-lg`}
            >
              <button
                onClick={closeProcessedCasesModal}
                className={`${isHandheld ? "px-3 py-1.5 text-xs handheld-text-xs" : "px-4 py-2 text-sm"} bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white rounded-md transition-colors font-medium flex items-center gap-2`}
              >
                <X size={isHandheld ? 14 : 16} />
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltipInfo.visible && (
        <div
          className="fixed z-[9999] bg-gray-800 text-white px-3 py-2 rounded-md shadow-lg text-xs max-w-[250px] animate-fadeIn"
          style={{
            top: `${tooltipInfo.position.top}px`,
            left: `${tooltipInfo.position.left}px`,
            transform: "translateX(-50%)",
          }}
        >
          {tooltipInfo.message}
        </div>
      )}

      {/* Modal de confirmación para procesar conteo */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-2 sm:p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
          <div
            className="fixed inset-0 bg-black/70 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={closeProcessModal}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-md modal-dark transform transition-all mx-auto flex flex-col z-[60] animate-scaleIn p-6">
            <div className="shield-icon-container">
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
                className="text-white"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>

            <h3 className="text-xl font-medium text-white text-center mb-2">Confirmar Procesamiento</h3>

            <p className="text-gray-300 text-center mb-6">
              ¿Está seguro que desea procesar este documento?
              <br />
              Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={closeProcessModal}
                className="flex-1 py-2.5 px-4 rounded-md text-sm transition-all modal-dark-button-cancel"
                disabled={isProcessing}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmProcess}
                disabled={isProcessing || !canProcess}
                className="flex-1 py-2.5 px-4 rounded-md text-sm transition-all modal-dark-button-confirm flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

export default ConteosScreen
