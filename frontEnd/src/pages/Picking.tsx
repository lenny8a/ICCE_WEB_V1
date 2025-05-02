"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import ErrorMessage from "../components/ErrorMessage"
import axios from "axios"
import { useToast } from "../hooks/useToast"
import ToastContainer from "../components/ToastContainer"
import { useDeviceDetect } from "../hooks/use-device-detect"
import { useAuth } from "../context/AuthContext"

const Picking = () => {
  const initialState = {
    reserva: "",
  }

  interface ReservaForm {
    reserva: string
  }

  // Actualizar la interfaz CaseReserva para incluir WERKS y LGORT
  interface CaseReserva {
    CASE: string
    UBICACION: string
    CANTIDAD: string
    WERKS?: string // Centro
    LGORT?: string // Almacén
  }

  interface MaterialReserva {
    MATNR: string
    MAKTX: string
    MENGE: string
    MEINS: string
    CASES: CaseReserva[]
  }

  interface ReservaData {
    RESERVA: string
    MATERIALES: MaterialReserva[]
    TIPODOC?: string // Añadir este campo para identificar si es reserva (01) u orden (02)
    WERKS?: string
    LGORT?: string
  }

  // Actualizar la interfaz RegisteredItem para incluir un ID único
  // Actualizar la interfaz RegisteredItem para incluir WERKS y LGORT
  interface RegisteredItem {
    id: string // ID único para facilitar la eliminación
    material: string
    materialDesc?: string
    location: string
    quantity: string
    case: string
    materialCode: string
    werks?: string // Centro
    lgort?: string // Almacén
  }

  // Interfaz para los items de picking
  interface PickingItem {
    material: string
    materialDesc?: string
    materialCode: string
    location: string
    case: string
    quantity: string
    werks?: string
    lgort?: string
  }

  // Interfaz para la respuesta del picking
  interface PickingResponse {
    success: boolean
    message: string
    data?: {
      reserva: string
      items: PickingItem[]
      totalItems: number
      status: string
      createdBy: string
      createdAt: string
      updatedAt: string
    }
  }

  // Agregar la interfaz para las excepciones después de las otras interfaces
  interface ExcepcionData {
    _id: string
    id: string
    name: string
    active: boolean
  }

  const form = useForm({ defaultValues: initialState })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  const { toasts, removeToast, success, error } = useToast()
  const [reservaData, setReservaData] = useState<ReservaData | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialReserva | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [processingComplete, setProcessingComplete] = useState(false)

  // Estados para los inputs de escaneo
  const [scannedCase, setScannedCase] = useState("")
  const [quantityToRegister, setQuantityToRegister] = useState("")
  const [remainingQuantity, setRemainingQuantity] = useState("")
  const [updatedCases, setUpdatedCases] = useState<CaseReserva[]>([])
  const [registeredItems, setRegisteredItems] = useState<RegisteredItem[]>([])
  // Estado para mantener todos los elementos registrados a nivel de reserva
  const [allRegisteredItems, setAllRegisteredItems] = useState<RegisteredItem[]>([])
  const [scanStep, setScanStep] = useState<"case" | "quantity">("case")
  const [scanError, setScanError] = useState("")
  const [selectedCase, setSelectedCase] = useState<CaseReserva | null>(null)

  // Estados para el modal de modificación
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<RegisteredItem | null>(null)
  const [editQuantity, setEditQuantity] = useState("")
  //const [originalMaterial, setOriginalMaterial] = useState<MaterialReserva | null>(null)
  const [, setOriginalMaterial] = useState<MaterialReserva | null>(null)

  // Agregar un nuevo estado para los mensajes de error del modal de edición
  const [editError, setEditError] = useState("")

  // Agregar estos estados después de los otros estados
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showReserva, setShowReserva] = useState(false)

  // Estado para controlar si la sección de elementos en picking está desplegada
  const [isPickingExpanded, setIsPickingExpanded] = useState(false)

  // Estado para controlar si la sección de elementos registrados en el modal está desplegada
  const [isModalItemsExpanded, setIsModalItemsExpanded] = useState(false)

  // Referencias para los inputs
  //const materialInputRef = useRef<HTMLInputElement>(null)
  // const locationInputRef = useRef<HTMLInputElement>(null)
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const editQuantityInputRef = useRef<HTMLInputElement>(null)
  const caseInputRef = useRef<HTMLInputElement>(null)

  // Agregar después de los otros estados
  //const [casesInLocation, setCasesInLocation] = useState<CaseReserva[]>([])
  //const [showCaseSelector, setShowCaseSelector] = useState(false)

  // Agregar el estado para controlar el procesamiento y los mensajes de notificación
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  // Agregar estos estados después de los otros estados
  const [isReservaProcessed, setIsReservaProcessed] = useState(false)
  const [processedPickingData, setProcessedPickingData] = useState<PickingResponse["data"] | null>(null)

  // Primero, agreguemos los estados necesarios para manejar las excepciones
  // Buscar la sección donde se declaran los estados y agregar estos nuevos estados:

  // Agregar después de los otros estados
  const [excepciones, setExcepciones] = useState<ExcepcionData[]>([])
  const [isLoadingExcepciones, setIsLoadingExcepciones] = useState(false)
  const [isExcepcionModalOpen, setIsExcepcionModalOpen] = useState(false)
  const [selectedExcepcionCase, setSelectedExcepcionCase] = useState<CaseReserva | null>(null)
  const [selectedExcepcion, setSelectedExcepcion] = useState<ExcepcionData | null>(null)

  // Agregar verificación de permisos
  const { checkPermission } = useAuth()
  const canModificar = checkPermission("/salida/picking", "modificar")

  const api_url = import.meta.env.VITE_API_URL

  // Función para eliminar ceros a la izquierda
  const removeLeadingZeros = (value: string): string => {
    return value.replace(/^0+/, "")
  }

  // Now, agreguemos la función para cargar las excepciones
  // Agregar después de las otras funciones de utilidad

  // Función para cargar las excepciones disponibles
  const fetchExcepciones = async () => {
    try {
      setIsLoadingExcepciones(true)
      const response = await axios.get(`${api_url}/api/excepciones`)

      if (response.data.success) {
        // Filtrar solo las excepciones activas
        // const excepcionesActivas = response.data.data.filter((exc: ExcepcionData) => exc.active)
        const excepcionesActivas = response.data.data.filter((exc: ExcepcionData) => exc.active && exc.id !== "00")
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

  // Añadir este useEffect para las animaciones después de las declaraciones de estado
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

  /* Estilos personalizados para la barra de desplazamiento */
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-track {
    background: #1e293b;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #4b5563;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Agregar un useEffect para cargar las excepciones cuando se monta el componente
  // Agregar después de los otros useEffect

  useEffect(() => {
    fetchExcepciones()
  }, [])

  // Función para procesar valores numéricos con ceros a la izquierda
  function processNumericValues(data: any): ReservaData {
    if (!data) return { RESERVA: "", MATERIALES: [] }

    // Asegurarse de que tenemos una estructura válida
    const processedData: ReservaData = {
      RESERVA: data.RESERVA || "",
      MATERIALES: [],
      TIPODOC: data.TIPODOC || "",
      WERKS: data.WERKS || "",
      LGORT: data.LGORT || "",
    }

    // Procesar los materiales solo si existen y son un array
    if (data.MATERIALES && Array.isArray(data.MATERIALES)) {
      processedData.MATERIALES = data.MATERIALES.map(
        (material: {
          MATNR: any
          MAKTX: any
          MENGE: string
          MEINS: any
          CASES: { CASE: any; UBICACION: any; CANTIDAD: string; WERKS?: string; LGORT?: string }[]
        }) => {
          // Crear un objeto material con valores por defecto
          const processedMaterial: MaterialReserva = {
            MATNR: material.MATNR || "",
            MAKTX: material.MAKTX || "",
            MENGE: material.MENGE ? String(Number.parseFloat(material.MENGE) || 0) : "0",
            MEINS: material.MEINS || "",
            CASES: [],
          }

          // Procesar los cases solo si existen y son un array
          if (material.CASES && Array.isArray(material.CASES)) {
            processedMaterial.CASES = material.CASES.map(
              (caseItem: { CASE: any; UBICACION: any; CANTIDAD: string; WERKS?: string; LGORT?: string }) => ({
                CASE: caseItem.CASE || "",
                UBICACION: caseItem.UBICACION || "",
                CANTIDAD: caseItem.CANTIDAD ? String(Number.parseFloat(caseItem.CANTIDAD) || 0) : "0",
                WERKS: caseItem.WERKS || "",
                LGORT: caseItem.LGORT || "",
              }),
            )
          }

          return processedMaterial
        },
      )
    }

    return processedData
  }

  // Modificar la función handleSearch para verificar si la reserva ya ha sido procesada
  async function handleSearch(formData: ReservaForm) {
    try {
      setIsSearching(true)
      setShowReserva(false)
      setIsReservaProcessed(false)
      setProcessedPickingData(null)
      setNotification(null)

      // Realizar la llamada POST al servidor con el número de reserva
      const response = await axios.post(`${api_url}/salida/reserva`, { reserva: formData.reserva })

      // Procesar la respuesta
      let dataToProcess = response.data

      // Si la respuesta es un array, tomar el primer elemento
      if (Array.isArray(dataToProcess) && dataToProcess.length > 0) {
        dataToProcess = dataToProcess[0]
      }

      console.log("Datos de la reserva:", dataToProcess)
      // Procesar los datos para eliminar ceros a la izquierda en valores numéricos
      const processedData = processNumericValues(dataToProcess)

      // Establecer los datos
      setReservaData(processedData)

      // Verificar si la reserva ya ha sido procesada solo después de obtener los datos
      try {
        const pickingStatus = await axios.get(`${api_url}/salida/picking/${formData.reserva}`)

        if (pickingStatus.data.success && pickingStatus.data.data) {
          // La reserva ya ha sido procesada
          const pickingData = pickingStatus.data.data
          setProcessedPickingData(pickingData)

          // Solo marcar como completado si el estado es 'completed' o 'accounted'
          const isCompleted = pickingData.status === "completed" || pickingData.status === "accounted"
          setProcessingComplete(isCompleted)
          setIsReservaProcessed(isCompleted) // Only set as processed if it's completed or accounted

          setNotification({
            type: "success",
            message: isCompleted
              ? `Este ${reservaData?.TIPODOC === "02" ? "orden" : "reserva"} ya ha sido procesado completamente`
              : `Esta ${reservaData?.TIPODOC === "02" ? "orden" : "reserva"} está en estado pendiente. Puede continuar procesándola.`,
          })

          // Si tenemos datos procesados, cargarlos como elementos registrados
          if (pickingData.items) {
            const registeredItems = pickingData.items.map(
              (item: {
                material: any
                materialDesc: any
                location: any
                quantity: any
                case: any
                materialCode: any
                werks: any
                lgort: any
              }) => ({
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                material: item.material,
                materialDesc: item.materialDesc,
                location: item.location,
                quantity: item.quantity,
                case: item.case,
                materialCode: item.materialCode,
                werks: item.werks,
                lgort: item.lgort,
              }),
            )

            setAllRegisteredItems(registeredItems)

            // Actualizar las cantidades restantes en los materiales
            if (processedData && processedData.MATERIALES) {
              const updatedMateriales = [...processedData.MATERIALES]

              // Para cada item registrado, restar la cantidad del material correspondiente
              registeredItems.forEach(
                (item: { materialCode: string; quantity: string; case: string; location: string }) => {
                  const materialIndex = updatedMateriales.findIndex((material) => material.MATNR === item.materialCode)

                  if (materialIndex !== -1) {
                    const material = updatedMateriales[materialIndex]
                    const currentQuantity = Number.parseInt(material.MENGE)
                    const itemQuantity = Number.parseInt(item.quantity)

                    // Actualizar la cantidad restante
                    updatedMateriales[materialIndex] = {
                      ...material,
                      MENGE: Math.max(0, currentQuantity - itemQuantity).toString(),
                    }

                    // También actualizar la cantidad en los cases
                    const caseIndex = material.CASES.findIndex(
                      (c) => c.CASE === item.case && c.UBICACION === item.location,
                    )

                    if (caseIndex !== -1) {
                      const caseItem = material.CASES[caseIndex]
                      const caseQuantity = Number.parseInt(caseItem.CANTIDAD)

                      updatedMateriales[materialIndex].CASES[caseIndex] = {
                        ...caseItem,
                        CANTIDAD: Math.max(0, caseQuantity - itemQuantity).toString(),
                      }
                    }
                  }
                },
              )

              // Actualizar el estado con los materiales actualizados
              setReservaData({
                ...processedData,
                MATERIALES: updatedMateriales,
              })
            }
          }
        } else {
          setProcessingComplete(false)
          setIsReservaProcessed(false)
          // Resetear los elementos registrados al buscar una nueva reserva
          setAllRegisteredItems([])
        }
      } catch (error) {
        // Si hay error en la verificación, asumimos que no está procesada
        setIsReservaProcessed(false)
        setProcessingComplete(false)
        setAllRegisteredItems([])
      }

      // Mostrar la reserva con animación
      setIsSearching(false)
      setShowReserva(true)
    } catch (error_er) {
      // console.log("Error al buscar reserva:", error_er)
      error(`Error al buscar número de documento. Intente nuevamente.`)
      setIsSearching(false)
      reset()
    }
  }

  // Modificar la función handleProcessReserva para usar axios directamente
  // Actualizar la función handleProcessReserva para incluir WERKS y LGORT
  const handleProcessReserva = async () => {
    if (!reservaData || allRegisteredItems.length === 0) return

    try {
      setIsProcessing(true)
      setNotification(null)

      // Determinar el estado basado en si todos los materiales han sido procesados
      const isComplete = reservaData.MATERIALES.every((material) => {
        // Verificar si la cantidad restante es 0
        return Number.parseInt(material.MENGE) === 0
      })

      // Preparar los datos para enviar al backend
      const dataToSave = {
        reserva: reservaData.RESERVA,
        items: allRegisteredItems.map((item) => ({
          material: item.material,
          materialDesc: item.materialDesc,
          materialCode: item.materialCode,
          location: item.location,
          case: item.case,
          quantity: item.quantity,
          werks: item.werks || reservaData.WERKS, // Incluir Centro
          lgort: item.lgort || reservaData.LGORT, // Incluir Almacén
        })),
        status: isComplete ? "completed" : "pending",
        tipodoc: reservaData.TIPODOC,
      }

      console.log("Datos a guardar:", dataToSave)
      // Usar axios directamente para guardar el picking
      const response = await axios.post(`${api_url}/salida/picking`, dataToSave)

      console.log("Respuesta del servidor:", response.data)

      // Mostrar notificación de éxito
      setNotification({
        type: "success",
        message: isComplete
          ? `${reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"} procesada completamente`
          : `${reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"} guardada en estado pendiente. Puede continuar procesándola más tarde.`,
      })

      // Marcar el proceso como completado solo si realmente está completo
      setProcessingComplete(isComplete)
      setIsReservaProcessed(isComplete)

      if (response.data.data) {
        setProcessedPickingData(response.data.data)
      }
    } catch (error) {
      console.error("Error al procesar la reserva:", error)

      // Mostrar notificación de error
      setNotification({
        type: "error",
        message: "Error al procesar la reserva. Intente nuevamente.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const openMaterialModal = (material: MaterialReserva) => {
    // Verificar permisos
    if (!canModificar) {
      error("No tiene permisos para modificar picking")
      return
    }

    // Verificar si el material tiene al menos un case con cantidad disponible
    const hasCasesAvailable = material.CASES.some((caseItem) => Number.parseInt(caseItem.CANTIDAD) > 0)

    if (!hasCasesAvailable) {
      // Mostrar una notificación en lugar de simplemente no abrir el modal
      setNotification({
        type: "error",
        message: "No hay cases disponibles para este material",
      })
      return
    }

    setSelectedMaterial(material)
    setRemainingQuantity(material.MENGE)
    setOriginalMaterial({ ...material })

    // Inicializar los cases actualizados con los valores originales del material
    setUpdatedCases([...material.CASES])

    setRegisteredItems([])
    setScanStep("case")
    setScanError("")
    setScannedCase("")
    setQuantityToRegister("")
    setSelectedCase(null)
    setIsModalOpen(true)

    // Asegurarse de que la sección de elementos registrados esté cerrada por defecto
    setIsModalItemsExpanded(false)

    // Bloquear el scroll del body cuando el modal está abierto
    document.body.style.overflow = "hidden"
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMaterial(null)

    // Restaurar el scroll del body cuando el modal se cierra
    document.body.style.overflow = "auto"
  }

  const handleNewSearch = () => {
    setReservaData(null)
    setShowReserva(false)
    reset()
    setProcessingComplete(false)
    setAllRegisteredItems([])

    // Poner el foco en el input de reserva
    setTimeout(() => {
      const reservaInput = document.getElementById("reserva")
      if (reservaInput) {
        reservaInput.focus()
      }
    }, 100)
  }

  const resetScanProcess = () => {
    setScannedCase("")
    setQuantityToRegister("")
    setScanStep("case")
    setScanError("")
    setSelectedCase(null)
    // setShowCaseSelector(false)

    // Enfocar el input de case
    setTimeout(() => {
      if (caseInputRef.current) {
        caseInputRef.current.focus()
      }
    }, 100)
  }

  // Actualizar la función handleCaseScan para capturar WERKS y LGORT
  const handleCaseScan = () => {
    if (!selectedMaterial) return

    // Eliminar ceros a la izquierda del case escaneado
    const normalizedCase = removeLeadingZeros(scannedCase)

    // Buscar el case escaneado entre los cases disponibles (comparando sin ceros a la izquierda)
    const foundCase = updatedCases.find((caseItem) => removeLeadingZeros(caseItem.CASE) === normalizedCase)

    if (!foundCase) {
      setScanError("El case escaneado no existe en los cases disponibles")
      return
    }

    // Verificar si el case tiene cantidad disponible
    if (Number.parseInt(foundCase.CANTIDAD) <= 0) {
      setScanError("Este case no tiene unidades disponibles")
      return
    }

    // Seleccionar el case directamente
    setSelectedCase(foundCase)
    setScanError("")
    setScanStep("quantity")

    // Enfocar el siguiente input
    setTimeout(() => {
      if (quantityInputRef.current) {
        quantityInputRef.current.focus()
      }
    }, 100)
  }

  // Función para manejar la selección de case
  // const handleCaseSelection = (caseItem: CaseReserva) => {
  //   setSelectedCase(caseItem)
  //   setShowCaseSelector(false)
  //   setScanStep("quantity")

  //   // Enfocar el siguiente input
  //   setTimeout(() => {
  //     if (quantityInputRef.current) {
  //       quantityInputRef.current.focus()
  //     }
  //   }, 100)
  // }

  // Modificar la función handleQuantityRegister para incluir un ID único
  // Actualizar la función handleQuantityRegister para incluir WERKS y LGORT
  const handleQuantityRegister = () => {
    if (!selectedMaterial || !selectedCase) return

    const quantity = Number.parseFloat(quantityToRegister)
    const remaining = Number.parseFloat(remainingQuantity)
    const caseQuantity = Number.parseFloat(selectedCase.CANTIDAD)

    // Validar que la cantidad sea un número válido y positivo
    if (isNaN(quantity) || quantity <= 0) {
      setScanError("Ingrese una cantidad válida mayor a cero")
      return
    }

    // Validar que no exceda la cantidad restante total
    if (quantity > remaining) {
      setScanError(`La cantidad no puede exceder el total restante (${remaining})`)
      return
    }

    // Validar que no exceda la cantidad disponible en el case
    if (quantity > caseQuantity) {
      setScanError(`La cantidad no puede exceder lo disponible en esta ubicación (${caseQuantity})`)
      return
    }

    // Verificar si ya existe un elemento registrado con el mismo case
    const existingItemIndex = registeredItems.findIndex(
      (item) => item.case === selectedCase.CASE && item.location === selectedCase.UBICACION,
    )

    let newRegisteredItems = [...registeredItems]

    if (existingItemIndex !== -1) {
      // Si existe, actualizar la cantidad en lugar de agregar una nueva línea
      const existingItem = registeredItems[existingItemIndex]
      const existingQuantity = Number.parseFloat(existingItem.quantity)
      const newQuantity = existingQuantity + quantity

      newRegisteredItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity.toString(),
      }
    } else {
      // Si no existe, agregar una nueva línea con un ID único
      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Generar un ID único
        material: selectedMaterial.MATNR,
        location: selectedCase.UBICACION,
        quantity: quantityToRegister,
        case: selectedCase.CASE,
        materialCode: selectedMaterial.MATNR,
        werks: selectedCase.WERKS || reservaData?.WERKS, // Capturar Centro del case o de la reserva
        lgort: selectedCase.LGORT || reservaData?.LGORT, // Capturar Almacén del case o de la reserva
      }

      newRegisteredItems = [...registeredItems, newItem]
    }

    // Actualizar la lista de elementos registrados
    setRegisteredItems(newRegisteredItems)

    // Actualizar la cantidad en el case
    const updatedCasesList = updatedCases.map((caseItem) => {
      if (caseItem.CASE === selectedCase.CASE && caseItem.UBICACION === selectedCase.UBICACION) {
        return {
          ...caseItem,
          CANTIDAD: (caseQuantity - quantity).toString(),
        }
      }
      return caseItem
    })

    setUpdatedCases(updatedCasesList)

    // Actualizar la cantidad restante total
    const newRemaining = (remaining - quantity).toString()
    setRemainingQuantity(newRemaining)

    // Resetear para el siguiente escaneo
    setScannedCase("")
    setQuantityToRegister("")
    setSelectedCase(null)
    setScanStep("case")
    setScanError("")

    // Enfocar el input de case para el siguiente escaneo
    setTimeout(() => {
      if (caseInputRef.current) {
        caseInputRef.current.focus()
      }
    }, 100)
  }

  // Agregar función para eliminar un elemento registrado en el modal
  const handleDeleteModalItem = (itemId: string) => {
    // Buscar el elemento a eliminar
    const itemToDelete = registeredItems.find((item) => item.id === itemId)

    if (!itemToDelete) return

    // Actualizar la cantidad restante del material
    const currentRemaining = Number.parseFloat(remainingQuantity)
    const itemQuantity = Number.parseFloat(itemToDelete.quantity)
    const newRemaining = (currentRemaining + itemQuantity).toString()
    setRemainingQuantity(newRemaining)

    // Actualizar la cantidad disponible en el case
    const updatedCasesList = updatedCases.map((caseItem) => {
      if (caseItem.CASE === itemToDelete.case && caseItem.UBICACION === itemToDelete.location) {
        const currentCaseQuantity = Number.parseFloat(caseItem.CANTIDAD)
        return {
          ...caseItem,
          CANTIDAD: (currentCaseQuantity + itemQuantity).toString(),
        }
      }
      return caseItem
    })

    setUpdatedCases(updatedCasesList)

    // Eliminar el elemento de la lista
    const newRegisteredItems = registeredItems.filter((item) => item.id !== itemId)
    setRegisteredItems(newRegisteredItems)

    // Si no quedan elementos, cerrar la sección
    if (newRegisteredItems.length === 0) {
      setIsModalItemsExpanded(false)
    }
  }

  // Agregar función para eliminar un elemento registrado en la pantalla principal
  const handleDeleteMainItem = (itemId: string) => {
    // Verificar permisos
    if (!canModificar) {
      error("No tiene permisos para eliminar elementos")
      return
    }

    // Buscar el elemento a eliminar
    const itemToDelete = allRegisteredItems.find((item) => item.id === itemId)

    if (!itemToDelete || !reservaData) return

    // Buscar el material correspondiente
    const materialIndex = reservaData.MATERIALES.findIndex((material) => material.MATNR === itemToDelete.materialCode)

    if (materialIndex === -1) return

    // Actualizar la cantidad del material
    const material = reservaData.MATERIALES[materialIndex]
    const currentQuantity = Number.parseFloat(material.MENGE)
    const itemQuantity = Number.parseFloat(itemToDelete.quantity)
    const newQuantity = (currentQuantity + itemQuantity).toString()

    // Actualizar la cantidad disponible en el case correspondiente
    const updatedCases = material.CASES.map((caseItem) => {
      if (caseItem.CASE === itemToDelete.case && caseItem.UBICACION === itemToDelete.location) {
        const currentCaseQuantity = Number.parseFloat(caseItem.CANTIDAD)
        return {
          ...caseItem,
          CANTIDAD: (currentCaseQuantity + itemQuantity).toString(),
        }
      }
      return caseItem
    })

    // Crear una copia actualizada de los materiales
    const updatedMateriales = [...reservaData.MATERIALES]
    updatedMateriales[materialIndex] = {
      ...material,
      MENGE: newQuantity,
      CASES: updatedCases,
    }

    // Actualizar los datos de la reserva
    setReservaData({
      ...reservaData,
      MATERIALES: updatedMateriales,
    })

    // Eliminar el elemento de la lista global
    const newAllRegisteredItems = allRegisteredItems.filter((item) => item.id !== itemId)
    setAllRegisteredItems(newAllRegisteredItems)

    // Si no quedan elementos, cerrar la sección
    if (newAllRegisteredItems.length === 0) {
      setIsPickingExpanded(false)
    }
  }

  // Función para abrir el modal de edición
  const openEditModal = (item: RegisteredItem) => {
    // Verificar permisos
    if (!canModificar) {
      error("No tiene permisos para modificar elementos")
      return
    }

    setItemToEdit(item)
    setEditQuantity(item.quantity)
    setIsEditModalOpen(true)

    // Bloquear el scroll del body cuando el modal está abierto
    document.body.style.overflow = "hidden"

    // Enfocar el input de cantidad
    setTimeout(() => {
      if (editQuantityInputRef.current) {
        editQuantityInputRef.current.focus()
      }
    }, 100)
  }

  // Función para cerrar el modal de edición
  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setItemToEdit(null)
    setEditQuantity("")
    setEditError("")

    // Restaurar el scroll del body cuando el modal se cierra
    document.body.style.overflow = "auto"
  }

  // Reemplazar la función handleSaveEdit completa
  const handleSaveEdit = () => {
    if (!itemToEdit || !reservaData) return

    // Limpiar cualquier error previo
    setEditError("")
    setIsEditing(true)

    const newQuantity = Number.parseFloat(editQuantity)
    const oldQuantity = Number.parseFloat(itemToEdit.quantity)

    // Validar que la cantidad sea un número válido y positivo
    if (isNaN(newQuantity)) {
      setEditError("Por favor ingrese una cantidad válida")
      setIsEditing(false)
      return
    }

    // Validar que la cantidad no sea negativa
    if (newQuantity <= 0) {
      setEditError("La cantidad debe ser mayor que cero")
      setIsEditing(false)
      return
    }

    // Calcular la diferencia de cantidad
    const quantityDiff = newQuantity - oldQuantity

    if (quantityDiff === 0) {
      // No hay cambios, cerrar el modal
      setIsEditing(false)
      closeEditModal()
      return
    }

    // Buscar el material correspondiente
    const materialIndex = reservaData.MATERIALES.findIndex((material) => material.MATNR === itemToEdit.materialCode)

    if (materialIndex === -1) {
      setEditError("No se encontró el material correspondiente")
      setIsEditing(false)
      return
    }

    const material = reservaData.MATERIALES[materialIndex]

    // Buscar el case correspondiente para verificar disponibilidad
    const caseIndex = material.CASES.findIndex(
      (caseItem) => caseItem.CASE === itemToEdit.case && caseItem.UBICACION === itemToEdit.location,
    )

    if (caseIndex === -1) {
      setEditError("No se encontró el case correspondiente")
      setIsEditing(false)
      return
    }

    // Si estamos aumentando la cantidad, verificar que haya suficientes unidades disponibles
    if (quantityDiff > 0) {
      const availableQuantity = Number.parseFloat(material.CASES[caseIndex].CANTIDAD)

      if (quantityDiff > availableQuantity) {
        setEditError(`No hay suficientes unidades disponibles. Máximo disponible: ${availableQuantity}`)
        setIsEditing(false)
        return
      }

      // Verificar que la nueva cantidad no exceda la cantidad total solicitada del material
      const totalMaterialQuantity = Number.parseFloat(material.MENGE) + oldQuantity

      if (newQuantity > totalMaterialQuantity) {
        setEditError(`La cantidad no puede exceder la cantidad total solicitada (${totalMaterialQuantity})`)
        setIsEditing(false)
        return
      }
    }

    // Simular un tiempo de procesamiento
    setTimeout(() => {
      // Actualizar la cantidad en allRegisteredItems
      const updatedAllRegisteredItems = allRegisteredItems.map((item) => {
        if (item.id === itemToEdit.id) {
          return {
            ...item,
            quantity: newQuantity.toString(),
          }
        }
        return item
      })

      // Actualizar la cantidad del material
      const currentMaterialQuantity = Number.parseFloat(material.MENGE)
      const newMaterialQuantity = (currentMaterialQuantity - quantityDiff).toString()

      // Actualizar la cantidad disponible en el case
      const updatedCases = [...material.CASES]
      const currentCaseQuantity = Number.parseFloat(updatedCases[caseIndex].CANTIDAD)
      updatedCases[caseIndex] = {
        ...updatedCases[caseIndex],
        CANTIDAD: (currentCaseQuantity - quantityDiff).toString(),
      }

      // Crear una copia actualizada de los materiales
      const updatedMateriales = [...reservaData.MATERIALES]
      updatedMateriales[materialIndex] = {
        ...material,
        MENGE: newMaterialQuantity,
        CASES: updatedCases,
      }

      // Actualizar los estados
      setAllRegisteredItems(updatedAllRegisteredItems)
      setReservaData({
        ...reservaData,
        MATERIALES: updatedMateriales,
      })

      // Cerrar el modal
      setIsEditing(false)
      closeEditModal()
    }, 800)
  }

  // Efecto para enfocar el input de case cuando se abre el modal
  useEffect(() => {
    if (isModalOpen && caseInputRef.current) {
      caseInputRef.current.focus()
    }
  }, [isModalOpen])

  // Efecto para limpiar el estilo de overflow cuando el componente se desmonta
  useEffect(() => {
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  // Función para alternar la expansión de la sección de picking
  const togglePickingExpanded = () => {
    setIsPickingExpanded(!isPickingExpanded)
  }

  // Función para alternar la expansión de la sección de elementos registrados en el modal
  const toggleModalItemsExpanded = () => {
    setIsModalItemsExpanded(!isModalItemsExpanded)
  }

  // Modificar la función handleSave para actualizar la tabla principal
  // Actualizar la función handleSave para incluir WERKS y LGORT
  async function handleSave() {
    try {
      if (!canModificar) {
        error("No tiene permisos para guardar cambios")
        return
      }

      if (!reservaData || !selectedMaterial) return

      setIsSaving(true)

      // Ya no hacemos llamada a la API aquí, solo actualizamos la UI
      console.log("Guardando material:", selectedMaterial.MATNR)
      console.log("Items registrados:", registeredItems)
      console.log("Cases actualizados:", updatedCases)

      // Actualizar solo el material actual en la tabla principal
      const updatedMateriales = reservaData.MATERIALES.map((material) => {
        if (material.MATNR === selectedMaterial.MATNR) {
          return {
            ...material,
            MENGE: remainingQuantity,
            CASES: updatedCases,
          }
        }
        return material
      })

      // Actualizar los datos de la reserva
      setReservaData({
        ...reservaData,
        MATERIALES: updatedMateriales,
      })

      // Agregar los elementos registrados en el modal al registro global
      // Verificar si ya existen elementos con el mismo material, ubicación y case
      const newAllRegisteredItems = [...allRegisteredItems]

      registeredItems.forEach((item) => {
        const existingItemIndex = newAllRegisteredItems.findIndex(
          (existingItem) =>
            existingItem.material === item.material &&
            existingItem.location === item.location &&
            existingItem.case === item.case,
        )

        if (existingItemIndex !== -1) {
          // Si existe, sumar la cantidad
          const existingItem = newAllRegisteredItems[existingItemIndex]
          const existingQuantity = Number.parseInt(existingItem.quantity)
          const newQuantity = existingQuantity + Number.parseInt(item.quantity)

          newAllRegisteredItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity.toString(),
            // Asegurar que se mantengan los campos WERKS y LGORT
            werks: item.werks || existingItem.werks,
            lgort: item.lgort || existingItem.lgort,
          }
        } else {
          // Si no existe, agregar como nuevo
          newAllRegisteredItems.push({
            ...item,
            materialDesc: selectedMaterial.MAKTX,
            materialCode: selectedMaterial.MATNR,
            werks: item.werks || reservaData.WERKS, // Asegurar que se incluya el Centro
            lgort: item.lgort || reservaData.LGORT, // Asegurar que se incluya el Almacén
          })
        }
      })

      setAllRegisteredItems(newAllRegisteredItems)

      // Limpiar los elementos registrados en el modal después de guardar
      setRegisteredItems([])

      setIsSaving(false)

      // Cerrar el modal después de guardar
      closeModal()
    } catch (error) {
      console.error("Error al guardar:", error)
      setIsSaving(false)
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  // Función para abrir el modal de excepciones
  const openExcepcionModal = (caseItem: CaseReserva) => {
    // Verificar permisos
    if (!canModificar) {
      error("No tiene permisos para asignar excepciones")
      return
    }

    setSelectedExcepcionCase(caseItem)
    setSelectedExcepcion(null)
    setIsExcepcionModalOpen(true)
    // Bloquear el scroll del body cuando el modal está abierto
    document.body.style.overflow = "hidden"
  }

  // Función para cerrar el modal de excepciones
  const closeExcepcionModal = () => {
    setIsExcepcionModalOpen(false)
    setSelectedExcepcionCase(null)
    setSelectedExcepcion(null)
    // Restaurar el scroll del body cuando el modal se cierra
    document.body.style.overflow = "auto"
  }

  // Modificar la función handleExcepcionSelect para eliminar el case de la lista después de registrar la excepción
  const handleExcepcionSelect = async (excepcion: ExcepcionData) => {
    if (!selectedExcepcionCase || !selectedMaterial) return

    try {
      setIsLoading(true)

      // Preparar los datos para enviar al backend
      const excepcionData = {
        embal: removeLeadingZeros(selectedExcepcionCase.CASE),
        zexcu_wms: excepcion.id,
        zexde_wms: excepcion.name,
        matnr: selectedMaterial.MATNR,
        maktx: selectedMaterial.MAKTX,
        ubicacion: selectedExcepcionCase.UBICACION,
      }

      // Llamar a la API para registrar la excepción
      const response = await axios.post(`${api_url}/entr/excepcion`, excepcionData)

      if (response.data.CODE) {
        // Actualizar la UI para mostrar que se ha registrado la excepción
        // Eliminar el case de la lista de cases disponibles
        const filteredCases = updatedCases.filter(
          (caseItem) =>
            !(caseItem.CASE === selectedExcepcionCase.CASE && caseItem.UBICACION === selectedExcepcionCase.UBICACION),
        )

        // Actualizar el estado con la nueva lista de cases
        setUpdatedCases(filteredCases)

        if (reservaData) {
          // Crear una copia profunda de reservaData
          const updatedReservaData = { ...reservaData }

          // Encontrar el índice del material seleccionado
          const materialIndex = updatedReservaData.MATERIALES.findIndex(
            (material) => material.MATNR === selectedMaterial.MATNR,
          )

          if (materialIndex !== -1) {
            // Filtrar los cases del material para eliminar el case con excepción
            updatedReservaData.MATERIALES[materialIndex].CASES = updatedReservaData.MATERIALES[
              materialIndex
            ].CASES.filter(
              (caseItem) =>
                !(
                  caseItem.CASE === selectedExcepcionCase.CASE && caseItem.UBICACION === selectedExcepcionCase.UBICACION
                ),
            )

            // Actualizar el estado de reservaData
            setReservaData(updatedReservaData)

            // También actualizar selectedMaterial para mantener la coherencia
            const updatedSelectedMaterial = { ...selectedMaterial }
            updatedSelectedMaterial.CASES = filteredCases
            setSelectedMaterial(updatedSelectedMaterial)
          }
        }

        // Mostrar notificación de éxito
        success(`Excepción "${excepcion.name}" registrada correctamente para el case ${selectedExcepcionCase.CASE}`)
      } else {
        throw new Error(response.data.message || "Error al registrar la excepción")
      }
    } catch (error_try) {
      error("Error al registrar la excepción. Intente nuevamente.")
    } finally {
      setIsLoading(false)
      closeExcepcionModal()
    }
  }

  const { isMobile } = useDeviceDetect()
  const isHandheld = isMobile && window.innerWidth <= 480 && window.innerHeight <= 800

  return (
    <>
      <Breadcrumb pageName="Picking" />

      <div
        className={`container mx-auto p-${isHandheld ? "2" : isMobile ? "3" : "4"} ${isHandheld ? "max-w-full text-sm" : isMobile ? "max-w-full" : "max-w-7xl"}`}
      >
        {/* Formulario de búsqueda - Estandarizado con Reubica */}
        <div className="bg-white dark:bg-boxdark rounded-md shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:shadow-lg animate-in slide-in-from-top-8">
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
              <h2 className="text-base font-semibold text-gray-800 dark:text-white">Buscar Documento</h2>
            </div>

            <form onSubmit={handleSubmit(handleSearch)}>
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
                    id="reserva"
                    type="text"
                    placeholder="Ingrese número de reserva u orden"
                    className="w-full rounded-l-md border border-gray-200 bg-transparent py-2 pl-10 pr-4 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary text-sm"
                    {...register("reserva", { required: "El número de documento es obligatorio" })}
                    disabled={processingComplete}
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-1 rounded-r-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary"
                  disabled={processingComplete || isSearching}
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
                      <span>Buscar</span>
                    </>
                  )}
                </button>
              </div>
              {errors.reserva && <ErrorMessage>{errors.reserva.message}</ErrorMessage>}
            </form>
          </div>
        </div>

        {/* Resultados de la reserva - Rediseñado con estilo más elegante */}
        {reservaData && showReserva && (
          <div className="rounded-xl border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark overflow-hidden transition-all duration-700 animate-scaleIn">
            <div className="bg-gradient-to-r from-primary/10 to-transparent p-1">
              <div className="bg-white dark:bg-boxdark p-5 sm:p-7 rounded-lg">
                {/* Cabecera de la reserva con diseño mejorado */}
                <div
                  className={`flex ${isMobile ? "flex-col" : "flex-row"} justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0`}
                >
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-3 rounded-full mr-4 animate-in spin-in-3 duration-700">
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
                        className="text-primary"
                      >
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                        <path d="m3.3 7 8.7 5 8.7-5"></path>
                        <path d="M12 22V12"></path>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white animate-fadeIn">
                        {reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}
                        {reservaData.RESERVA}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transform motion-safe:animate-fadeIn motion-safe:animate-slideInLeft motion-safe:delay-100">
                        {isReservaProcessed ? (
                          <span className="flex items-center text-green-600 dark:text-green-400">
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
                              className="mr-1"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            Reserva ya procesada
                          </span>
                        ) : (
                          `${reservaData.MATERIALES.length} materiales disponibles`
                        )}
                      </p>
                    </div>
                  </div>
                  {processingComplete ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                      <div className="bg-success/10 text-success px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Procesado correctamente
                      </div>
                      <button
                        onClick={handleNewSearch}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
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
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-9 9z"></path>
                          <path d="M3 12h18"></path>
                          <path d="M12 3v18"></path>
                        </svg>
                        Nueva búsqueda
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          if (!canModificar) {
                            error("No tiene permisos para procesar documentos")
                            return
                          }
                          handleProcessReserva()
                        }}
                        disabled={
                          isProcessing ||
                          allRegisteredItems.length === 0 ||
                          (isReservaProcessed && processedPickingData?.status === "completed") ||
                          !canModificar
                        }
                        className="bg-success text-white px-5 py-3 rounded-lg text-sm w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-success/90 transition-all duration-500 shadow-md hover:shadow-lg hover:translate-y-[-2px] font-medium animate-in fade-in slide-in-from-right-8 disabled:bg-gray-400 disabled:hover:shadow-md disabled:hover:translate-y-0"
                      >
                        {isProcessing ? (
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
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <>
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
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                            <span>
                              {processedPickingData?.status === "pending"
                                ? `Actualizar ${reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}`
                                : `Procesar ${reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}`}
                            </span>
                          </>
                        )}
                      </button>
                      {notification && (
                        <div
                          className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-right-5 duration-300 ${
                            notification.type === "success"
                              ? "bg-success/10 text-success border border-success/30"
                              : "bg-danger/10 text-danger border border-danger/30"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {notification.type === "success" ? (
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
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
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
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" x2="12" y1="8" y2="12"></line>
                                <line x1="12" x2="12.01" y1="16" y2="16"></line>
                              </svg>
                            )}
                            {notification.message}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {!canModificar && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300 text-sm animate-in fade-in slide-in-from-top-5 duration-300">
                      <div className="flex items-center gap-2">
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" x2="12" y1="8" y2="12"></line>
                          <line x1="12" x2="12.01" y1="16" y2="16"></line>
                        </svg>
                        Modo de solo visualización. No tiene permisos para modificar.
                      </div>
                    </div>
                  )}
                </div>

                {/* Mostrar el detalle de la reserva procesada si ya existe */}
                {isReservaProcessed &&
                  processedPickingData &&
                  (processedPickingData.status === "completed" || processedPickingData.status === "accounted") && (
                    <div className="mb-6 bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border-l-4 border-green-500 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
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
                          className="mr-3 text-green-500"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        {reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}{" "}
                        {processedPickingData.status === "accounted" ? "Contabilizada" : "Procesada"}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}:</span>{" "}
                            {processedPickingData.reserva}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Estado:</span>
                            <span
                              className={`ml-1 font-medium ${
                                processedPickingData.status === "completed"
                                  ? "text-green-600 dark:text-green-400"
                                  : processedPickingData.status === "pending"
                                    ? "text-amber-600 dark:text-amber-400"
                                    : processedPickingData.status === "accounted"
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {processedPickingData.status === "completed"
                                ? "Completado"
                                : processedPickingData.status === "pending"
                                  ? "Pendiente"
                                  : processedPickingData.status === "accounted"
                                    ? "Contabilizado"
                                    : processedPickingData.status}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Total de items:</span> {processedPickingData.totalItems}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Procesado por:</span> {processedPickingData.createdBy}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Fecha de procesamiento:</span>{" "}
                            {new Date(processedPickingData.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                          <thead>
                            <tr className="bg-green-100 dark:bg-green-800/30 text-left">
                              <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Material</th>
                              <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Descripción</th>
                              <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Ubicación</th>
                              <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300">Case</th>
                              <th className="py-2 px-3 font-medium text-gray-700 dark:text-gray-300 text-right">
                                Cantidad
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {processedPickingData.items.map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-green-200 dark:border-green-800/30 hover:bg-green-50 dark:hover:bg-green-800/20"
                              >
                                <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{item.material}</td>
                                <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{item.materialDesc}</td>
                                <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{item.location}</td>
                                <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{item.case}</td>
                                <td className="py-2 px-3 text-gray-800 dark:text-gray-200 text-right font-semibold">
                                  {item.quantity}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Mostrar información de reserva pendiente si existe y está pendiente */}
                {processedPickingData && processedPickingData.status === "pending" && (
                  <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border-l-4 border-amber-500 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
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
                        className="mr-3 text-amber-500"
                      >
                        <path d="M12 9v4"></path>
                        <path d="M12 17h.01"></path>
                        <path d="M3.34 17a10 10 0 1 1 17.32 0"></path>
                      </svg>
                      {reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"} en Proceso
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}:</span>{" "}
                          {processedPickingData.reserva}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Estado:</span>
                          <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">Pendiente</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Items registrados:</span> {processedPickingData.totalItems}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Iniciado por:</span> {processedPickingData.createdBy}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Fecha de inicio:</span>{" "}
                          {new Date(processedPickingData.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Última actualización:</span>{" "}
                          {new Date(processedPickingData.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                      <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center">
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" x2="12" y1="8" y2="12"></line>
                          <line x1="12" x2="12.01" y1="16" y2="16"></line>
                        </svg>
                        {`Este ${reservaData?.TIPODOC === "02" ? "orden" : "reserva"} está en proceso. Puede continuar procesándola más tarde.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Sección de materiales con diseño mejorado - Solo mostrar si la reserva no ha sido procesada */}
                {(!isReservaProcessed || (processedPickingData && processedPickingData.status === "pending")) && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border-l-4 border-secondary mb-6 shadow-sm transition-all duration-500 hover:shadow-md animate-fadeIn">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
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
                        className="mr-3 text-secondary"
                      >
                        <path d="M5 8h14"></path>
                        <path d="M5 12h14"></path>
                        <path d="M5 16h14"></path>
                      </svg>
                      Materiales de la {reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"}
                    </h3>

                    {/* Tabla de materiales para pantallas medianas y grandes con diseño mejorado */}
                    <div className="hidden sm:block overflow-x-auto">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                            <th
                              className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 rounded-tl-lg`}
                            >
                              Material
                            </th>
                            <th
                              className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
                            >
                              Descripción
                            </th>
                            <th
                              className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 text-right`}
                            >
                              Cantidad
                            </th>
                            <th
                              className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 text-center rounded-tr-lg`}
                            >
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservaData.MATERIALES.map((material, index) => (
                            <tr
                              key={index}
                              className={`border-b border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 ${
                                processingComplete ? "opacity-70" : ""
                              } animate-slideInRight`}
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <td
                                className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200 font-medium`}
                              >
                                {material.MATNR}
                              </td>
                              <td
                                className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200`}
                              >
                                {material.MAKTX}
                              </td>
                              <td
                                className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200 text-right font-semibold`}
                              >
                                {material.MENGE}{" "}
                                <span className="text-xs text-gray-500 dark:text-gray-400">{material.MEINS}</span>
                              </td>
                              <td className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-center`}>
                                {material.CASES.some((caseItem) => Number.parseInt(caseItem.CANTIDAD) > 0) ? (
                                  <button
                                    onClick={() => openMaterialModal(material)}
                                    className={`bg-primary text-white px-${isMobile ? "2" : "3"} py-${isMobile ? "1" : "2"} rounded-lg text-sm hover:bg-primary/90 transition-all duration-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] flex items-center justify-center gap-2 mx-auto`}
                                    disabled={processingComplete || !canModificar}
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
                                    Ver ubicaciones
                                  </button>
                                ) : (
                                  <div className="text-danger text-xs font-medium bg-danger/10 px-3 py-2 rounded-lg flex items-center justify-center">
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
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <line x1="12" x2="12" y1="8" y2="12"></line>
                                      <line x1="12" x2="12.01" y1="16" y2="16"></line>
                                    </svg>
                                    No cases disponibles
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Vista de tarjetas para móviles con diseño mejorado - Solo mostrar si la reserva no ha sido procesada */}
                {(!isReservaProcessed || (processedPickingData && processedPickingData.status === "pending")) && (
                  <div className="sm:hidden space-y-2 animate-in fade-in duration-1000 delay-300">
                    {reservaData.MATERIALES.map((material, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in-50 slide-in-from-right-10"
                        style={{ animationDelay: `${index * 150}ms` }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-white text-base">{material.MATNR}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                              {material.MAKTX}
                            </p>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            <p className="font-bold text-primary text-sm">
                              {material.MENGE}{" "}
                              <span className="text-xs text-gray-500 dark:text-gray-400">{material.MEINS}</span>
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          {material.CASES.some((caseItem) => Number.parseInt(caseItem.CANTIDAD) > 0) ? (
                            <button
                              onClick={() => openMaterialModal(material)}
                              className="bg-primary text-white px-3 py-1.5 rounded-lg text-xs w-full hover:bg-primary/90 transition-all duration-300 shadow-sm flex items-center justify-center gap-1"
                              disabled={processingComplete}
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
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              Ver ubicaciones
                            </button>
                          ) : (
                            <div className="text-danger text-xs font-medium bg-danger/10 px-3 py-1.5 rounded-lg flex items-center justify-center">
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
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" x2="12" y1="8" y2="12"></line>
                                <line x1="12" x2="12.01" y1="16" y2="16"></line>
                              </svg>
                              No cases disponibles
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Elementos registrados en la pantalla principal con diseño mejorado - DESPLEGABLE - Solo mostrar si la reserva no ha sido procesada o si hay elementos registrados */}
                {(!isReservaProcessed || allRegisteredItems.length > 0) && (
                  <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border-l-4 border-primary shadow-sm transition-all duration-500 hover:shadow-md animate-fadeIn">
                    {/* Cabecera con botón para desplegar/contraer */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
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
                          className="mr-3 text-primary"
                        >
                          <path d="M20 5H8.5L7 7H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"></path>
                          <path d="M9 14v-3"></path>
                          <path d="M12 15v-4"></path>
                          <path d="M15 16v-5"></path>
                        </svg>
                        Elementos en Picking{" "}
                        <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                          {allRegisteredItems.length}
                        </span>
                      </h3>
                      <button
                        onClick={togglePickingExpanded}
                        className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-all duration-300"
                        aria-label={isPickingExpanded ? "Contraer" : "Expandir"}
                      >
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
                          className={`text-primary transition-transform duration-500 ${isPickingExpanded ? "rotate-180" : ""}`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    </div>

                    {/* Contenido desplegable - CORREGIDO PARA MOSTRAR CORRECTAMENTE */}
                    <div
                      className={`transition-all duration-500 ease-in-out ${
                        isPickingExpanded ? "block opacity-100 mt-4" : "hidden opacity-0 mt-0"
                      }`}
                    >
                      {allRegisteredItems.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic animate-in fade-in duration-700">
                          No hay elementos registrados en picking
                        </div>
                      ) : (
                        <>
                          {/* Tabla para pantallas medianas y grandes con diseño mejorado */}
                          <div className="hidden sm:block overflow-x-auto">
                            <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                              <table className="w-full table-auto animate-in fade-in duration-700">
                                <thead>
                                  <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                                    <th
                                      className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
                                    >
                                      Material
                                    </th>
                                    <th
                                      className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
                                    >
                                      Descripción
                                    </th>
                                    <th
                                      className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
                                    >
                                      Ubicación
                                    </th>
                                    <th
                                      className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300`}
                                    >
                                      Case
                                    </th>
                                    <th
                                      className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 text-right`}
                                    >
                                      Cantidad
                                    </th>
                                    <th
                                      className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} font-semibold text-gray-700 dark:text-gray-300 text-center`}
                                    >
                                      Acciones
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {allRegisteredItems.map((item, index) => (
                                    <tr
                                      key={item.id}
                                      className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 animate-in fade-in-50 slide-in-from-bottom-10"
                                      style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                      <td
                                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200 font-medium`}
                                      >
                                        {item.material}
                                      </td>
                                      <td
                                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200`}
                                      >
                                        {item.materialDesc}
                                      </td>
                                      <td
                                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200`}
                                      >
                                        {item.location}
                                      </td>
                                      <td
                                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200`}
                                      >
                                        {item.case}
                                      </td>
                                      <td
                                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-gray-800 dark:text-gray-200 text-right font-semibold`}
                                      >
                                        {item.quantity}
                                      </td>
                                      <td
                                        className={`px-${isMobile ? "2" : "4"} py-${isMobile ? "1" : "2"} text-center`}
                                      >
                                        <div className="flex justify-center gap-2">
                                          <button
                                            onClick={() => openEditModal(item)}
                                            className="bg-amber-400 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-secondary/90 transition-all duration-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] flex items-center gap-1"
                                            title="Modificar"
                                            disabled={!canModificar}
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
                                            Modificar
                                          </button>
                                          <button
                                            onClick={() => handleDeleteMainItem(item.id)}
                                            className="bg-danger text-white px-3 py-1.5 rounded-lg text-xs hover:bg-danger/90 transition-all duration-500 shadow-sm hover:shadow-md hover:translate-y-[-2px] flex items-center gap-1"
                                            title="Eliminar"
                                            disabled={!canModificar}
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
                                              <line x1="10" x2="10" y1="11" y2="17"></line>
                                              <line x1="14" x2="14" y1="11" y2="17"></line>
                                            </svg>
                                            Eliminar
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Vista de tarjetas para móviles con diseño mejorado */}
                          <div className="sm:hidden space-y-2">
                            {allRegisteredItems.map((item, index) => (
                              <div
                                key={item.id}
                                className="border border-gray-200 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-500 animate-in fade-in-50 zoom-in-90"
                                style={{ animationDelay: `${index * 150}ms` }}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold text-gray-800 dark:text-white text-base">
                                      {item.material}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                                      {item.materialDesc}
                                    </p>
                                  </div>
                                  <div className="bg-primary/10 px-2 py-1 rounded-full">
                                    <p className="font-bold text-primary text-sm">{item.quantity}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                  <div>
                                    <p className="text-gray-500 dark:text-gray-400">Ubicación:</p>
                                    <p className="font-medium text-gray-800 dark:text-white">{item.location}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500 dark:text-gray-400">Case:</p>
                                    <p className="font-medium text-gray-800 dark:text-white truncate">{item.case}</p>
                                  </div>
                                </div>

                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="bg-secondary text-white px-2 py-1.5 rounded-lg text-xs flex-1 hover:bg-secondary/90 transition-all duration-300 shadow-sm flex items-center justify-center gap-1"
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
                                    Modificar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMainItem(item.id)}
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
                                      <line x1="10" x2="10" y1="11" y2="17"></line>
                                      <line x1="14" x2="14" y1="11" y2="17"></line>
                                    </svg>
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Modal de ubicaciones con inputs de escaneo - Centrado and responsivo */}
      {isModalOpen && selectedMaterial && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none`}
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={closeModal}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-3xl bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col max-h-[90vh] z-[60] animate-scaleIn">
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
                    <path d="M20 5H8.5L7 7H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"></path>
                    <path d="M9 14v-3"></path>
                    <path d="M12 15v-4"></path>
                    <path d="M15 16v-5"></path>
                  </svg>
                  Registro de Picking
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {reservaData?.TIPODOC === "02" ? "Orden: " : "Reserva: "}
                  {reservaData?.RESERVA} | Material: {selectedMaterial.MATNR}
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
            <div className="p-3 sm:p-5 overflow-y-auto flex-grow">
              {/* Información del material - versión simplificada */}
              <div className="mb-4 sm:mb-5 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4 rounded-xl flex justify-between items-center shadow-sm animate-fadeIn">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Material:{" "}
                    <span className="font-semibold text-gray-800 dark:text-white">{selectedMaterial.MATNR}</span>
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-1">
                    {selectedMaterial.MAKTX}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Cantidad pendiente:</span>
                  <span className="text-lg sm:text-xl font-bold text-primary">
                    {remainingQuantity} <span className="text-xs">{selectedMaterial.MEINS}</span>
                  </span>
                </div>
              </div>

              {/* Lista de cases disponibles - Sección colapsable con búsqueda */}
              <div className="mb-4 sm:mb-5 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-base flex items-center">
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
                      className="mr-2 text-blue-500"
                    >
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                      <path d="m3.3 7 8.7 5 8.7-5"></path>
                      <path d="M12 22V12"></path>
                    </svg>
                    Cases Disponibles
                  </h3>
                  <span className="bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
                    {updatedCases.filter((c) => Number.parseInt(c.CANTIDAD) > 0).length} cases
                  </span>
                </div>

                {/* Campo de búsqueda para filtrar cases */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                        className="text-gray-500 dark:text-gray-400"
                      >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                      </svg>
                    </div>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
                      placeholder="Buscar case o ubicación..."
                      onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase()
                        const filteredCases = document.querySelectorAll("[data-case-row]")
                        filteredCases.forEach((row) => {
                          const caseText = row.getAttribute("data-case-text")?.toLowerCase() || ""
                          const locationText = row.getAttribute("data-location-text")?.toLowerCase() || ""
                          if (caseText.includes(searchTerm) || locationText.includes(searchTerm)) {
                            row.classList.remove("hidden")
                          } else {
                            row.classList.add("hidden")
                          }
                        })
                      }}
                    />
                  </div>
                </div>

                {/* Tabla con scroll personalizado */}
                <div className="max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          Case
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          Centro
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          Almacén
                        </th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                          Ubicación
                        </th>
                        <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">
                          Cantidad
                        </th>
                        <th className="py-2 px-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 w-20">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {updatedCases
                        .filter((caseItem) => Number.parseInt(caseItem.CANTIDAD) > 0)
                        .map((caseItem, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                            data-case-row
                            data-case-text={removeLeadingZeros(caseItem.CASE)}
                            data-location-text={caseItem.UBICACION}
                          >
                            <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200 font-medium">
                              {removeLeadingZeros(caseItem.CASE)}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200">{caseItem.WERKS}</td>
                            <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200">{caseItem.LGORT}</td>
                            <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200">{caseItem.UBICACION}</td>
                            <td className="py-2 px-3 text-sm text-gray-800 dark:text-gray-200 text-right font-semibold">
                              {caseItem.CANTIDAD}
                            </td>

                            <td className="py-2 px-3 text-center">
                              <div className="flex justify-center gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedCase(caseItem)
                                    setScanStep("quantity")
                                    setTimeout(() => {
                                      if (quantityInputRef.current) {
                                        quantityInputRef.current.focus()
                                      }
                                    }, 100)
                                  }}
                                  className="inline-flex items-center justify-center p-1 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                                  title="Seleccionar case"
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
                                    <polyline points="9 10 4 15 9 20"></polyline>
                                    <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => openExcepcionModal(caseItem)}
                                  className="inline-flex items-center justify-center p-1 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                                  title="Registrar excepción"
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
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sección de escaneo - más compacta */}
              <div className="mb-5 sm:mb-6 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm animate-fadeIn">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-white text-base flex items-center">
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
                      <path d="M2 9V5c0-1.1.9-2 2-2h4"></path>
                      <path d="M9 2h6"></path>
                      <path d="M20 9V5c0-1.1-.9-2-2-2h-4"></path>
                      <path d="M5 22h14c1.1 0 2-.9 2-2v-7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2z"></path>
                      <path d="M6 18h.01"></path>
                      <path d="M10 18h.01"></path>
                      <path d="M14 18h.01"></path>
                      <path d="M18 18h.01"></path>
                    </svg>
                    Escanear case
                  </h3>
                  <button
                    type="button"
                    onClick={resetScanProcess}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-lg text-xs transition-colors flex items-center gap-1"
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
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                      <path d="M3 3v5h5"></path>
                    </svg>
                    Resetear
                  </button>
                </div>

                {/* Formulario de escaneo */}
                <div className="space-y-4">
                  {/* Input para escanear case */}
                  <div className={`${scanStep !== "case" ? "opacity-50" : ""} transition-opacity duration-300`}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Escanear código de case
                    </label>
                    <div className="flex">
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
                            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                            <path d="m3.3 7 8.7 5 8.7-5"></path>
                            <path d="M12 22V12"></path>
                          </svg>
                        </div>
                        <input
                          ref={caseInputRef}
                          type="text"
                          value={scannedCase}
                          onChange={(e) => setScannedCase(e.target.value)}
                          placeholder="Escanee el código del case"
                          className="w-full rounded-l-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-800 outline-none transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                          disabled={scanStep !== "case"}
                          onKeyDown={(e) => e.key === "Enter" && handleCaseScan()}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleCaseScan}
                        disabled={scanStep !== "case" || !scannedCase}
                        className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 transition-all duration-300 flex items-center gap-1"
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
                          <polyline points="9 10 4 15 9 20"></polyline>
                          <path d="M20 4v7a4 4 0 0 1-4 4H4"></path>
                        </svg>
                        Verificar
                      </button>
                    </div>
                  </div>

                  {/* Input para ingresar cantidad */}
                  <div className={`${scanStep !== "quantity" ? "opacity-50" : ""} transition-opacity duration-300`}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Cantidad a registrar
                    </label>
                    {selectedCase && (
                      <div className="mb-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-md inline-flex items-center">
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
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                        </svg>
                        Case: <span className="font-semibold ml-1">{removeLeadingZeros(selectedCase.CASE)}</span> |
                        Ubicación: <span className="font-semibold ml-1">{selectedCase.UBICACION}</span> | Disponible:{" "}
                        <span className="font-semibold ml-1">{selectedCase.CANTIDAD}</span>
                      </div>
                    )}
                    <div className="flex">
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
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                            <line x1="12" x2="12" y1="8" y2="16"></line>
                            <line x1="8" x2="16" y1="12" y2="12"></line>
                          </svg>
                        </div>
                        <input
                          ref={quantityInputRef}
                          type="number"
                          min="1"
                          value={quantityToRegister}
                          onChange={(e) => setQuantityToRegister(e.target.value)}
                          placeholder="Ingrese la cantidad"
                          className="w-full rounded-l-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                          disabled={scanStep !== "quantity"}
                          onKeyDown={(e) => e.key === "Enter" && handleQuantityRegister()}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleQuantityRegister}
                        disabled={scanStep !== "quantity" || !quantityToRegister}
                        className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 transition-all duration-300 flex items-center gap-1"
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
                          <path d="M5 12h14"></path>
                          <path d="M12 5v14"></path>
                        </svg>
                        Registrar
                      </button>
                    </div>
                  </div>

                  {/* Mensaje de error */}
                  {scanError && (
                    <div className="mt-2 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm animate-in fade-in slide-in-from-top-5 duration-300">
                      <div className="flex items-center gap-2">
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
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" x2="12" y1="8" y2="12"></line>
                          <line x1="12" x2="12.01" y1="16" y2="16"></line>
                        </svg>
                        {scanError}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Elementos registrados en el modal */}
              <div className="mb-5 sm:mb-6 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm animate-fadeIn">
                {/* Cabecera con botón para desplegar/contraer */}
                <div
                  className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900/20 cursor-pointer"
                  onClick={toggleModalItemsExpanded}
                >
                  <h3 className="font-semibold text-gray-800 dark:text-white text-base flex items-center">
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
                      <path d="M20 5H8.5L7 7H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1Z"></path>
                      <path d="M9 14v-3"></path>
                      <path d="M12 15v-4"></path>
                      <path d="M15 16v-5"></path>
                    </svg>
                    Elementos Registrados{" "}
                    <span className="ml-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      {registeredItems.length}
                    </span>
                  </h3>
                  <button
                    type="button"
                    className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-all duration-300"
                    aria-label={isModalItemsExpanded ? "Contraer" : "Expandir"}
                  >
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
                      className={`text-primary transition-transform duration-500 ${isModalItemsExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>

                {/* Contenido desplegable */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    isModalItemsExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  {registeredItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400 italic">
                      No hay elementos registrados
                    </div>
                  ) : (
                    <div className="p-4 space-y-2">
                      {registeredItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 hover:shadow-sm transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-5"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white">{item.material}</p>
                              <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="text-xs text-gray-500 dark:text-gray-500">Ubicación:</span>{" "}
                                  {item.location}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  <span className="text-xs text-gray-500 dark:text-gray-500">Case:</span> {item.case}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/10 px-3 py-1 rounded-full">
                                <p className="font-bold text-primary">{item.quantity}</p>
                              </div>
                              <button
                                onClick={() => handleDeleteModalItem(item.id)}
                                className="text-danger hover:text-danger/80 p-1 rounded-full hover:bg-danger/10 transition-colors"
                                title="Eliminar"
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
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                  <line x1="10" x2="10" y1="11" y2="17"></line>
                                  <line x1="14" x2="14" y1="11" y2="17"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={registeredItems.length === 0 || isSaving || !canModificar}
                  className="px-5 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:hover:shadow-sm flex items-center gap-2"
                >
                  {isSaving ? (
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
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
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
      )}

      {/* Modal de edición */}
      {isEditModalOpen && itemToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={closeEditModal}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col z-[60] animate-scaleIn">
            {/* Header */}
            <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-xl">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white">Modificar Cantidad</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar"
              >
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
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 sm:p-6">
              <div className="mb-5 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Material:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{itemToEdit.material}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{itemToEdit.location}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Case:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{itemToEdit.case}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad actual:</p>
                    <p className="font-bold text-primary">{itemToEdit.quantity}</p>
                  </div>
                </div>
                {reservaData && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Disponible en case:</p>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {(() => {
                        const material = reservaData.MATERIALES.find((m) => m.MATNR === itemToEdit.materialCode)
                        if (!material) return "0"
                        const caseItem = material.CASES.find(
                          (c) => c.CASE === itemToEdit.case && c.UBICACION === itemToEdit.location,
                        )
                        return caseItem ? caseItem.CANTIDAD : "0"
                      })()}
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-5">
                <label
                  htmlFor="editQuantity"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nueva cantidad
                </label>
                <div className="relative">
                  <input
                    ref={editQuantityInputRef}
                    type="number"
                    id="editQuantity"
                    min="1"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary"
                    disabled={isEditing}
                  />
                  {reservaData && itemToEdit && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {(() => {
                        const material = reservaData.MATERIALES.find((m) => m.MATNR === itemToEdit.materialCode)
                        if (!material) return null
                        const caseItem = material.CASES.find(
                          (c) => c.CASE === itemToEdit.case && c.UBICACION === itemToEdit.location,
                        )
                        const availableInCase = caseItem ? Number.parseInt(caseItem.CANTIDAD) : 0
                        const currentQuantity = Number.parseInt(itemToEdit.quantity)
                        const totalMaterialQuantity = Number.parseInt(material.MENGE) + currentQuantity

                        return (
                          <>
                            <span>
                              Máximo disponible en case:{" "}
                              <span className="font-medium text-primary">{availableInCase + currentQuantity}</span>
                            </span>
                            <span className="mx-2">•</span>
                            <span>
                              Máximo solicitado:{" "}
                              <span className="font-medium text-primary">{totalMaterialQuantity}</span>
                            </span>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </div>
                {editError && (
                  <p className="mt-2 text-sm text-danger animate-in fade-in slide-in-from-top-5 duration-300">
                    {editError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  disabled={isEditing}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editQuantity || isEditing || !canModificar}
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:hover:shadow-sm flex items-center gap-2"
                >
                  {isEditing ? (
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
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
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
      )}

      {/* Modal de excepciones */}
      {isExcepcionModalOpen && selectedExcepcionCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4 pt-16 ml-0 lg:ml-72.5 touch-none">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity touch-none backdrop-blur-sm animate-fadeIn"
            onClick={closeExcepcionModal}
            style={{ userSelect: "none" }}
          ></div>

          <div className="relative w-full max-w-md bg-white dark:bg-boxdark rounded-xl shadow-2xl transform transition-all mx-auto flex flex-col z-[60] animate-scaleIn">
            {/* Header */}
            <div className="sticky top-0 z-10 flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-boxdark rounded-t-xl">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
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
                  className="mr-2 text-amber-500"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Registrar Excepción
              </h2>
              <button
                onClick={closeExcepcionModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cerrar"
              >
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
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 sm:p-6">
              <div className="mb-5 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Case:</p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {removeLeadingZeros(selectedExcepcionCase.CASE)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ubicación:</p>
                    <p className="font-medium text-gray-800 dark:text-white">{selectedExcepcionCase.UBICACION}</p>
                  </div>
                </div>
                {selectedMaterial && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Material:</p>
                      <p className="font-medium text-gray-800 dark:text-white">{selectedMaterial.MATNR}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cantidad disponible:</p>
                      <p className="font-bold text-primary">{selectedExcepcionCase.CANTIDAD}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-5">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Seleccione el tipo de excepción:
                </h3>

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
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Cargando excepciones...</span>
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
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-900/10"
                        }`}
                        onClick={() => setSelectedExcepcion(excepcion)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full mr-2 ${
                                selectedExcepcion && selectedExcepcion._id === excepcion._id
                                  ? "bg-amber-500"
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

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeExcepcionModal}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => selectedExcepcion && handleExcepcionSelect(selectedExcepcion)}
                  disabled={!selectedExcepcion || isLoading}
                  className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:hover:shadow-sm flex items-center gap-2"
                >
                  {isLoading ? (
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
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
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
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      <span>Registrar Excepción</span>
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

export default Picking
