"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import ErrorMessage from "../components/ErrorMessage"
import axios from "axios"
import { useToast } from "../hooks/useToast"
import ToastContainer from "../components/ToastContainer"
import { useAuth } from "../context/AuthContext"
import {
  Search,
  Save,
  Trash2,
  Edit,
  Plus,
  Check,
  X,
  AlertTriangle,
  Package,
  List,
  Eye,
  CheckCircle,
  Loader2,
  AlertCircle,
  MapPin,
  CornerDownRight,
  Box,
  FileText,
  Clipboard,
  XCircle,
  CheckSquare,
} from "lucide-react"

const PickingMobile = () => {
  const initialState = {
    reserva: "",
  }

  interface ReservaForm {
    reserva: string
  }

  interface CaseReserva {
    CASE: string
    UBICACION: string
    CANTIDAD: string
    WERKS?: string
    LGORT?: string
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
    TIPODOC?: string
    WERKS?: string
    LGORT?: string
  }

  interface RegisteredItem {
    id: string
    material: string
    materialDesc?: string
    location: string
    quantity: string
    case: string
    materialCode: string
    werks?: string
    lgort?: string
  }

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

  interface ExcepcionData {
    _id: string
    id: string
    name: string
    active: boolean
  }

  // Estados principales
  const [activeTab, setActiveTab] = useState<"search" | "materials" | "processed">("search")
  const [reservaData, setReservaData] = useState<ReservaData | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialReserva | null>(null)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [allRegisteredItems, setAllRegisteredItems] = useState<RegisteredItem[]>([])
  const [isReservaProcessed, setIsReservaProcessed] = useState(false)
  const [processedPickingData, setProcessedPickingData] = useState<PickingResponse["data"] | null>(null)
  const [isPickingModalOpen, setIsPickingModalOpen] = useState(false)

  // Estados de UI
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [filterText, setFilterText] = useState("")

  // Estados para el escaneo
  const [scannedCase, setScannedCase] = useState("")
  const [quantityToRegister, setQuantityToRegister] = useState("")
  const [remainingQuantity, setRemainingQuantity] = useState("")
  const [updatedCases, setUpdatedCases] = useState<CaseReserva[]>([])
  const [registeredItems, setRegisteredItems] = useState<RegisteredItem[]>([])
  const [scanStep, setScanStep] = useState<"case" | "quantity">("case")
  const [scanError, setScanError] = useState("")
  const [selectedCase, setSelectedCase] = useState<CaseReserva | null>(null)

  // Estados para edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<RegisteredItem | null>(null)
  const [editQuantity, setEditQuantity] = useState("")
  const [editError, setEditError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Estados para excepciones
  const [excepciones, setExcepciones] = useState<ExcepcionData[]>([])
  const [isLoadingExcepciones, setIsLoadingExcepciones] = useState(false)
  const [isExcepcionModalOpen, setIsExcepcionModalOpen] = useState(false)
  const [selectedExcepcionCase, setSelectedExcepcionCase] = useState<CaseReserva | null>(null)
  const [selectedExcepcion, setSelectedExcepcion] = useState<ExcepcionData | null>(null)

  // Referencias
  const quantityInputRef = useRef<HTMLInputElement>(null)
  const editQuantityInputRef = useRef<HTMLInputElement>(null)
  const caseInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Formulario
  const form = useForm({ defaultValues: initialState })
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  // Hooks
  const { toasts, removeToast, success, error } = useToast()
  const { checkPermission } = useAuth()
  const canModificar = checkPermission("/salida/picking", "modificar")

  const api_url = import.meta.env.VITE_API_URL

  // Funciones de utilidad
  const removeLeadingZeros = (value: string): string => {
    return value.replace(/^0+/, "")
  }

  // Inicialización de estilos
  useEffect(() => {
    const styleElement = document.createElement("style")
    styleElement.textContent = `
      /* Estilos optimizados para pantallas muy pequeñas (320x552) */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
      }
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      .animate-fadeIn {
        animation: fadeIn 0.2s ease-out forwards;
      }
      .animate-slideUp {
        animation: slideUp 0.3s ease-out forwards;
      }
      .animate-slideIn {
        animation: slideIn 0.3s ease-out forwards;
      }
      .animate-slideOut {
        animation: slideOut 0.3s ease-out forwards;
      }
      .animate-pulse {
        animation: pulse 1.5s infinite;
      }
      .scrollbar-tiny::-webkit-scrollbar {
        width: 3px;
      }
      .scrollbar-tiny::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      .dark .scrollbar-tiny::-webkit-scrollbar-track {
        background: #1e293b;
      }
      .scrollbar-tiny::-webkit-scrollbar-thumb {
        background: #888;
      }
      .dark .scrollbar-tiny::-webkit-scrollbar-thumb {
        background: #4b5563;
      }
      .ultra-tiny-text {
        font-size: 0.65rem !important;
        line-height: 0.9rem !important;
      }
      .tiny-text {
        font-size: 0.7rem !important;
        line-height: 1rem !important;
      }
      .micro-text {
        font-size: 0.75rem !important;
        line-height: 1.1rem !important;
      }
      .nano-text {
        font-size: 0.8rem !important;
        line-height: 1.2rem !important;
      }
      .tiny-p {
        padding: 0.15rem !important;
      }
      .tiny-m {
        margin: 0.15rem !important;
      }
      .tiny-px {
        padding-left: 0.15rem !important;
        padding-right: 0.15rem !important;
      }
      .tiny-py {
        padding-top: 0.15rem !important;
        padding-bottom: 0.15rem !important;
      }
      .tiny-mx {
        margin-left: 0.15rem !important;
        margin-right: 0.15rem !important;
      }
      .tiny-my {
        margin-top: 0.15rem !important;
        margin-bottom: 0.15rem !important;
      }
      .tiny-gap {
        gap: 0.15rem !important;
      }
      .tiny-rounded {
        border-radius: 0.15rem !important;
      }
      .tiny-h {
        height: 1.3rem !important;
      }
      .tiny-w {
        width: 1.3rem !important;
      }
      .tiny-icon {
        width: 0.9rem !important;
        height: 0.9rem !important;
      }
      .compact-btn {
        padding: 0.3rem 0.5rem !important;
        font-size: 0.7rem !important;
        line-height: 1rem !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 1.5rem !important;
        gap: 0.25rem !important;
        border-radius: 0.25rem !important;
        transition: all 0.2s ease-in-out !important;
      }
      .compact-btn:active {
        transform: scale(0.97);
      }
      .compact-input {
        padding: 0.3rem 0.5rem !important;
        font-size: 0.75rem !important;
        line-height: 1.1rem !important;
        height: 1.8rem !important;
        border-radius: 0.25rem !important;
      }
      .compact-card {
        padding: 0.5rem !important;
        margin-bottom: 0.5rem !important;
        border-radius: 0.25rem !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
      }
      .compact-list {
        max-height: calc(100vh - 180px) !important;
        overflow-y: auto;
      }
      .compact-list-item {
        padding: 0.3rem 0.5rem !important;
        margin-bottom: 0.3rem !important;
        font-size: 0.7rem !important;
      }
      .step-indicator {
        display: flex;
        justify-content: center;
        margin-bottom: 0.5rem;
        padding: 0.5rem 0;
      }
      .step-dot {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background-color: #e5e7eb;
        margin: 0 0.25rem;
        transition: all 0.3s ease;
      }
      .step-dot.active {
        background-color: #3b82f6;
        transform: scale(1.2);
      }
      .step-title {
        font-size: 0.85rem;
        font-weight: 600;
        text-align: center;
        margin-bottom: 0.5rem;
        color: #1f2937;
      }
      .dark .step-title {
        color: #f3f4f6;
      }
      .progress-bar {
        height: 0.25rem;
        background-color: #e5e7eb;
        border-radius: 0.25rem;
        margin-bottom: 0.5rem;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background-color: #3b82f6;
        transition: width 0.3s ease;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 0.1rem 0.3rem;
        border-radius: 0.25rem;
        font-size: 0.65rem;
        font-weight: 500;
        gap: 0.15rem;
      }
      .badge-primary {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
      .badge-success {
        background-color: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }
      .badge-warning {
        background-color: rgba(234, 179, 8, 0.1);
        color: #eab308;
      }
      .badge-danger {
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
      .action-bar {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem;
        border-top: 1px solid #e5e7eb;
        margin-top: 0.5rem;
      }
      .action-bar-fixed {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: white;
        border-top: 1px solid #e5e7eb;
        padding: 0.5rem;
        z-index: 40;
        box-shadow: 0 -2px 5px rgba(0,0,0,0.05);
      }
      .dark .action-bar-fixed {
        background-color: #1e293b;
        border-top: 1px solid #374151;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.3rem;
      }
      .info-label {
        font-size: 0.65rem;
        color: #6b7280;
      }
      .info-value {
        font-size: 0.7rem;
        font-weight: 500;
      }
      .tab-bar {
        display: flex;
        border-bottom: 1px solid #e5e7eb;
        margin-bottom: 0.5rem;
      }
      .tab {
        padding: 0.3rem 0.5rem;
        font-size: 0.7rem;
        border-bottom: 2px solid transparent;
        cursor: pointer;
      }
      .tab.active {
        border-bottom-color: #3b82f6;
        color: #3b82f6;
        font-weight: 500;
      }
      .search-bar {
        position: relative;
        margin-bottom: 0.5rem;
      }
      .search-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        z-index: 20;
        pointer-events: none;
      }
      .search-input {
        padding-left: 2.25rem !important;
      }
      .case-card {
        display: flex;
        justify-content: space-between;
        padding: 0.3rem 0.4rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.25rem;
        margin-bottom: 0.2rem;
        background-color: white;
        transition: all 0.2s ease;
      }

      .case-card:after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: #3b82f6;
        border-top-left-radius: 0.25rem;
        border-bottom-left-radius: 0.25rem;
      }
      .dark .case-card {
        background-color: #1e293b;
        border-color: #374151;
      }
      .case-card:active {
        background-color: #f9fafb;
      }
      .dark .case-card:active {
        background-color: #263449;
      }
      .case-info {
        display: flex;
        flex-direction: column;
      }
      .case-actions {
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }
      .case-action-btn {
        width: 1.5rem !important;
        height: 1.5rem !important;
        padding: 0.2rem !important;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .material-card {
        border: 1px solid #e5e7eb;
        border-radius: 0.25rem;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        background-color: white;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .dark .material-card {
        background-color: #1e293b;
        border-color: #374151;
      }
      .material-card:active {
        background-color: #f9fafb;
      }
      .dark .material-card:active {
        background-color: #263449;
      }
      .material-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.3rem;
      }
      .material-body {
        font-size: 0.7rem;
      }
      .material-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.3rem;
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        z-index: 50;
        animation: fadeIn 0.2s ease-out;
      }
      .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: calc(100% - 32px);
        max-width: 320px;
        background-color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        z-index: 60;
        animation: slideUp 0.3s ease-out;
      }
      .dark .modal {
        background-color: #1e293b;
      }
      .modal-header {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .modal-body {
        padding: 0.75rem;
        max-height: 60vh;
        overflow-y: auto;
      }
      .modal-footer {
        padding: 0.75rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
      }
      .dark .modal-header,
      .dark .modal-footer {
        border-color: #374151;
      }
      .wizard-step {
        display: none;
      }
      .wizard-step.active {
        display: block;
        animation: fadeIn 0.3s ease-out forwards;
      }
      .floating-action-button {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        background-color: #3b82f6;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 40;
      }
      /* Ajustes específicos para pantallas muy pequeñas */
      .mini-container {
        max-width: 100%;
        margin: 0 auto;
        padding: 0.5rem;
      }
      .mini-breadcrumb {
        font-size: 0.75rem;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        background-color: white;
        border-radius: 0.375rem;
        border: 1px solid #e5e7eb;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }
      .dark .mini-breadcrumb {
        background-color: #1e293b;
        border-color: #374151;
      }
      .mini-breadcrumb-left {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .mini-breadcrumb-right {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .mini-breadcrumb-text {
        font-size: 0.75rem;
      }
      .mini-breadcrumb-badge {
        font-size: 0.65rem;
        padding: 0.1rem 0.3rem;
        border-radius: 0.25rem;
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }
      .mini-btn-group {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      .mini-btn-group .compact-btn {
        flex: 1;
        min-width: 80px;
      }
      .mini-modal {
        max-width: 320px;
      }
      .mini-notification {
        font-size: 0.7rem;
        padding: 0.5rem;
        border-radius: 0.25rem;
      }
      .mini-icon-only {
        padding: 0.3rem !important;
        width: 1.8rem !important;
        height: 1.8rem !important;
        border-radius: 0.25rem !important;
      }
      .mini-label {
        font-size: 0.65rem;
        margin-bottom: 0.2rem;
        display: block;
        color: #4b5563;
      }
      .dark .mini-label {
        color: #9ca3af;
      }
      .mini-input-group {
        display: flex;
        gap: 0.3rem;
      }
      .mini-input-group .compact-input {
        flex: 1;
      }
      .mini-input-group .compact-btn {
        flex-shrink: 0;
      }
      .mini-tabs {
        display: flex;
        overflow-x: auto;
        scrollbar-width: none;
        margin-bottom: 0.5rem;
      }
      .mini-tabs::-webkit-scrollbar {
        display: none;
      }
      .mini-tab {
        flex: 0 0 auto;
        padding: 0.3rem 0.5rem;
        font-size: 0.7rem;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
      }
      .mini-tab.active {
        border-bottom-color: #3b82f6;
        color: #3b82f6;
      }
      .mini-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 0.3rem;
      }
      .mini-card {
        padding: 0.3rem;
        border-radius: 0.25rem;
        border: 1px solid #e5e7eb;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .mini-card-title {
        font-size: 0.65rem;
        font-weight: 500;
        text-align: center;
        margin-bottom: 0.2rem;
      }
      .mini-card-body {
        font-size: 0.6rem;
        text-align: center;
      }
      .mini-card-footer {
        margin-top: 0.3rem;
        display: flex;
        justify-content: center;
      }
      .nav-buttons {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: white;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-around;
        align-items: center;
        z-index: 40;
        box-shadow: 0 -2px 5px rgba(0,0,0,0.05);
        height: 3rem;
        padding: 0.25rem 0;
      }
      .dark .nav-buttons {
        background-color: #1e293b;
        border-top: 1px solid #374151;
      }
      .nav-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        background-color: transparent;
        color: #6b7280;
        transition: all 0.2s ease;
        flex: 1;
        height: 100%;
        max-width: 100px;
        margin: 0 0.25rem;
      }
      .nav-button.active {
        color: #3b82f6;
        background-color: rgba(59, 130, 246, 0.1);
      }
      .nav-button-text {
        font-size: 0.6rem;
        margin-top: 0.15rem;
        text-align: center;
      }
      .focus-ring:focus {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
      .dark .focus-ring:focus {
        outline-color: #60a5fa;
      }
      .tap-highlight {
        -webkit-tap-highlight-color: rgba(59, 130, 246, 0.2);
      }
      .no-tap-highlight {
        -webkit-tap-highlight-color: transparent;
      }
      .pb-safe {
        padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0));
      }
      .mb-safe {
        margin-bottom: calc(2.5rem + env(safe-area-inset-bottom, 0));
      }
      .fullscreen-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: white;
        z-index: 100;
        display: flex;
        flex-direction: column;
        animation: slideIn 0.3s ease-out;
        overflow-y: auto;
      }
      .dark .fullscreen-modal {
        background-color: #1e293b;
      }
      .fullscreen-modal-header {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        background-color: white;
        z-index: 10;
      }
      .dark .fullscreen-modal-header {
        background-color: #1e293b;
        border-color: #374151;
      }
      .fullscreen-modal-body {
        flex: 1;
        padding: 0.75rem;
        overflow-y: auto;
      }
      .fullscreen-modal-footer {
        padding: 0.75rem;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        position: sticky;
        bottom: 0;
        background-color: white;
        z-index: 10;
      }
      .dark .fullscreen-modal-footer {
        background-color: #1e293b;
        border-color: #374151;
      }
      .tab-content {
        display: none;
        animation: fadeIn 0.3s ease-out;
      }
      .tab-content.active {
        display: block;
      }
      .tabs-container {
        display: flex;
        border-bottom: 1px solid #e5e7eb;
        background-color: white;
        position: sticky;
        top: 0;
        z-index: 30;
        padding: 0;
      }
      .dark .tabs-container {
        background-color: #1e293b;
        border-color: #374151;
      }
      .tab-button {
        flex: 1;
        text-align: center;
        padding: 0.4rem 0.25rem;
        font-size: 0.65rem;
        color: #6b7280;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }
      .tab-button.active {
        color: #3b82f6;
        border-bottom-color: #3b82f6;
        font-weight: 500;
      }
      .tab-button-icon {
        margin-bottom: 0.05rem;
        height: 0.9rem;
        width: 0.9rem;
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem 1rem;
        text-align: center;
        color: #6b7280;
      }
      .empty-state-icon {
        margin-bottom: 0.5rem;
        color: #9ca3af;
      }
      .empty-state-text {
        font-size: 0.8rem;
      }
      .case-group {
        margin-bottom: 0.5rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.25rem;
        overflow: hidden;
      }
      .case-group-header {
        background-color: #f3f4f6;
        padding: 0.3rem 0.5rem;
        font-size: 0.7rem;
        font-weight: 500;
        display: flex;
        align-items: center;
      }
      .dark .case-group-header {
        background-color: #374151;
      }
      .case-group-items {
        display: flex;
        flex-direction: column;
      }
      .case-group .case-card {
        border-left: none;
        border-right: none;
        border-radius: 0;
        border-bottom: none;
        margin-bottom: 0;
      }
      .case-group .case-card:last-child {
        border-bottom: none;
      }
      .case-count-badge {
        background-color: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
        font-size: 0.65rem;
        padding: 0.1rem 0.3rem;
        border-radius: 0.25rem;
        margin-left: auto;
      }
      .case-card-selected {
        background-color: rgba(59, 130, 246, 0.05);
        border-left: 3px solid #3b82f6;
      }
      .material-stats {
        display: flex;
        justify-content: space-between;
        padding: 0.3rem;
        background-color: #f9fafb;
        border-radius: 0.25rem;
        margin-top: 0.3rem;
        font-size: 0.65rem;
      }
      .dark .material-stats {
        background-color: #1f2937;
      }
      .material-stats-item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .material-stats-value {
        font-weight: 500;
        font-size: 0.7rem;
      }
      .material-stats-label {
        color: #6b7280;
        font-size: 0.6rem;
      }
      .grid-cases {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 0.25rem;
      }
      .case-compact {
        padding: 0.25rem;
        border-radius: 0.25rem;
        border: 1px solid #e5e7eb;
        background-color: white;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
      }
      .dark .case-compact {
        background-color: #1e293b;
        border-color: #374151;
      }
      .case-compact:active {
        background-color: #f9fafb;
      }
      .dark .case-compact:active {
        background-color: #263449;
      }
      .case-compact-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .case-compact-footer {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.15rem;
      }
      .micro-badge {
        font-size: 0.6rem;
        padding: 0.05rem 0.2rem;
        border-radius: 0.15rem;
      }
      .micro-icon {
        width: 0.7rem !important;
        height: 0.7rem !important;
      }
      .location-header {
        padding: 0.15rem 0.3rem;
        font-size: 0.65rem;
        font-weight: 500;
        background-color: #f3f4f6;
        border-radius: 0.25rem 0.25rem 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.15rem;
      }
      .dark .location-header {
        background-color: #374151;
      }
      .inline-info {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
        -ms-overflow-style: none;
        padding-bottom: 0.25rem;
      }
      .inline-info::-webkit-scrollbar {
        display: none;
      }
      .inline-info-item {
        display: flex;
        align-items: center;
        gap: 0.15rem;
      }
      .nested-modal-backdrop {
        z-index: 200;
      }
      .nested-modal {
        z-index: 201;
      }
    `
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Cargar excepciones
  useEffect(() => {
    fetchExcepciones()
  }, [])

  const fetchExcepciones = async () => {
    try {
      setIsLoadingExcepciones(true)
      const response = await axios.get(`${api_url}/api/excepciones`)

      if (response.data.success) {
        const excepcionesActivas = response.data.data.filter((exc: ExcepcionData) => exc.active && exc.id !== "00")
        setExcepciones(excepcionesActivas)
      } else {
        console.error("Error al cargar excepciones:", response.data.message)
        setExcepciones([{ _id: "default", id: "00", name: "Sin problemas", active: true }])
      }
    } catch (error) {
      console.error("Error al cargar excepciones:", error)
      setExcepciones([{ _id: "default", id: "00", name: "Sin problemas", active: true }])
    } finally {
      setIsLoadingExcepciones(false)
    }
  }

  function processNumericValues(data: any): ReservaData {
    if (!data) return { RESERVA: "", MATERIALES: [] }

    const processedData: ReservaData = {
      RESERVA: data.RESERVA || "",
      MATERIALES: [],
      TIPODOC: data.TIPODOC || "",
      WERKS: data.WERKS || "",
      LGORT: data.LGORT || "",
    }

    if (data.MATERIALES && Array.isArray(data.MATERIALES)) {
      processedData.MATERIALES = data.MATERIALES.map(
        (material: {
          MATNR: any
          MAKTX: any
          MENGE: string
          MEINS: any
          CASES: { CASE: any; UBICACION: any; CANTIDAD: string; WERKS?: string; LGORT?: string }[]
        }) => {
          const processedMaterial: MaterialReserva = {
            MATNR: material.MATNR || "",
            MAKTX: material.MAKTX || "",
            MENGE: material.MENGE ? String(Number.parseFloat(material.MENGE) || 0) : "0",
            MEINS: material.MEINS || "",
            CASES: [],
          }

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

  async function handleSearch(formData: ReservaForm) {
    try {
      setIsSearching(true)
      setIsReservaProcessed(false)
      setProcessedPickingData(null)
      setNotification(null)

      const response = await axios.post(`${api_url}/salida/reserva`, { reserva: formData.reserva })

      let dataToProcess = response.data

      if (Array.isArray(dataToProcess) && dataToProcess.length > 0) {
        dataToProcess = dataToProcess[0]
      }

      const processedData = processNumericValues(dataToProcess)

      setReservaData(processedData)

      try {
        const pickingStatus = await axios.get(`${api_url}/salida/picking/${formData.reserva}`)

        if (pickingStatus.data.success && pickingStatus.data.data) {
          const pickingData = pickingStatus.data.data
          setProcessedPickingData(pickingData)

          const isCompleted = pickingData.status === "completed" || pickingData.status === "accounted"
          setProcessingComplete(isCompleted)
          setIsReservaProcessed(isCompleted)

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

            if (processedData && processedData.MATERIALES) {
              const updatedMateriales = [...processedData.MATERIALES]

              registeredItems.forEach(
                (item: { materialCode: string; quantity: string; case: string; location: string }) => {
                  const materialIndex = updatedMateriales.findIndex((material) => material.MATNR === item.materialCode)

                  if (materialIndex !== -1) {
                    const material = updatedMateriales[materialIndex]
                    const currentQuantity = Number.parseFloat(material.MENGE)
                    const itemQuantity = Number.parseFloat(item.quantity)

                    updatedMateriales[materialIndex] = {
                      ...material,
                      MENGE: Math.max(0, currentQuantity - itemQuantity).toString(),
                    }

                    const caseIndex = material.CASES.findIndex(
                      (c) => c.CASE === item.case && c.UBICACION === item.location,
                    )

                    if (caseIndex !== -1) {
                      const caseItem = material.CASES[caseIndex]
                      const caseQuantity = Number.parseFloat(caseItem.CANTIDAD)

                      updatedMateriales[materialIndex].CASES[caseIndex] = {
                        ...caseItem,
                        CANTIDAD: Math.max(0, caseQuantity - itemQuantity).toString(),
                      }
                    }
                  }
                },
              )

              setReservaData({
                ...processedData,
                MATERIALES: updatedMateriales,
              })
            }
          }
        } else {
          setProcessingComplete(false)
          setIsReservaProcessed(false)
          setAllRegisteredItems([])
        }
      } catch (error) {
        setIsReservaProcessed(false)
        setProcessingComplete(false)
        setAllRegisteredItems([])
      }

      setIsSearching(false)
      // Mantener en la pestaña de búsqueda pero mostrar los datos básicos
      setActiveTab("search")
    } catch (error_er) {
      error(`Error al buscar documento. Intente nuevamente.`)
      setIsSearching(false)
      reset()
    }
  }

  const handleProcessReserva = async () => {
    if (!reservaData || allRegisteredItems.length === 0) return

    try {
      setIsProcessing(true)
      setNotification(null)

      const isComplete = reservaData.MATERIALES.every((material) => {
        return Number.parseFloat(material.MENGE) === 0
      })

      const dataToSave = {
        reserva: reservaData.RESERVA,
        items: allRegisteredItems.map((item) => ({
          material: item.material,
          materialDesc: item.materialDesc,
          materialCode: item.materialCode,
          location: item.location,
          case: item.case,
          quantity: item.quantity,
          werks: item.werks || reservaData.WERKS,
          lgort: item.lgort || reservaData.LGORT,
        })),
        status: isComplete ? "completed" : "pending",
        tipodoc: reservaData.TIPODOC,
      }

      const response = await axios.post(`${api_url}/salida/picking`, dataToSave)

      setNotification({
        type: "success",
        message: isComplete
          ? `${reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"} procesada`
          : `${reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"} guardada`,
      })

      setProcessingComplete(isComplete)
      setIsReservaProcessed(isComplete)

      if (response.data.data) {
        setProcessedPickingData(response.data.data)
      }

      // Volver a la pantalla de búsqueda después de procesar
      if (isComplete) {
        setTimeout(() => {
          setActiveTab("search")
          success("Documento procesado correctamente")
        }, 1500)
      }
    } catch (error) {
      console.error("Error al procesar la reserva:", error)

      setNotification({
        type: "error",
        message: "Error al procesar. Reintente.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const selectMaterial = (material: MaterialReserva) => {
    if (!canModificar) {
      error("No tiene permisos para modificar picking")
      return
    }

    const hasCasesAvailable = material.CASES.some((caseItem) => Number.parseInt(caseItem.CANTIDAD) > 0)

    if (!hasCasesAvailable) {
      setNotification({
        type: "error",
        message: "No hay cases disponibles",
      })
      return
    }

    setSelectedMaterial(material)
    setRemainingQuantity(material.MENGE)
    setUpdatedCases([...material.CASES])
    setRegisteredItems([])
    setScanStep("case")
    setScanError("")
    setScannedCase("")
    setQuantityToRegister("")
    setSelectedCase(null)
    setIsPickingModalOpen(true)

    // Establecer el foco en el input del case después de que se abra el modal
    setTimeout(() => {
      if (caseInputRef.current) {
        caseInputRef.current.focus()
      }
    }, 100)
  }

  const handleNewSearch = () => {
    setReservaData(null)
    reset()
    setProcessingComplete(false)
    setAllRegisteredItems([])
    setActiveTab("search")

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

    setTimeout(() => {
      if (caseInputRef.current) {
        caseInputRef.current.focus()
      }
    }, 100)
  }

  const handleCaseScan = () => {
    if (!selectedMaterial) return

    const normalizedCase = removeLeadingZeros(scannedCase)
    const foundCase = updatedCases.find((caseItem) => removeLeadingZeros(caseItem.CASE) === normalizedCase)

    if (!foundCase) {
      setScanError("Case no existe")
      return
    }

    if (Number.parseInt(foundCase.CANTIDAD) <= 0) {
      setScanError("Case sin unidades")
      return
    }

    setSelectedCase(foundCase)
    setScanError("")
    setScanStep("quantity")

    setTimeout(() => {
      if (quantityInputRef.current) {
        quantityInputRef.current.focus()
      }
    }, 100)
  }

  const handleQuantityRegister = () => {
    if (!selectedMaterial || !selectedCase) return

    const quantity = Number.parseFloat(quantityToRegister)
    const remaining = Number.parseFloat(remainingQuantity)
    const caseQuantity = Number.parseFloat(selectedCase.CANTIDAD)

    if (isNaN(quantity) || quantity <= 0) {
      setScanError("Cantidad inválida")
      return
    }

    if (quantity > remaining) {
      setScanError(`Excede total (${remaining})`)
      return
    }

    if (quantity > caseQuantity) {
      setScanError(`Excede case (${caseQuantity})`)
      return
    }

    const existingItemIndex = registeredItems.findIndex(
      (item) => item.case === selectedCase.CASE && item.location === selectedCase.UBICACION,
    )

    let newRegisteredItems = [...registeredItems]

    if (existingItemIndex !== -1) {
      const existingItem = registeredItems[existingItemIndex]
      const existingQuantity = Number.parseFloat(existingItem.quantity)
      const newQuantity = existingQuantity + quantity

      newRegisteredItems[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity.toString(),
      }
    } else {
      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        material: selectedMaterial.MATNR,
        location: selectedCase.UBICACION,
        quantity: quantityToRegister,
        case: selectedCase.CASE,
        materialCode: selectedMaterial.MATNR,
        werks: selectedCase.WERKS || reservaData?.WERKS,
        lgort: selectedCase.LGORT || reservaData?.LGORT,
      }

      newRegisteredItems = [...registeredItems, newItem]
    }

    setRegisteredItems(newRegisteredItems)

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

    const newRemaining = (remaining - quantity).toString()
    setRemainingQuantity(newRemaining)

    setScannedCase("")
    setQuantityToRegister("")
    setSelectedCase(null)
    setScanStep("case")
    setScanError("")

    // Mostrar notificación de éxito
    success(`Registrado: ${quantity} unidades`)

    setTimeout(() => {
      if (caseInputRef.current) {
        caseInputRef.current.focus()
      }
    }, 100)
  }

  const handleDeleteRegisteredItem = (itemId: string) => {
    const itemToDelete = registeredItems.find((item) => item.id === itemId)

    if (!itemToDelete) return

    const currentRemaining = Number.parseFloat(remainingQuantity)
    const itemQuantity = Number.parseFloat(itemToDelete.quantity)
    const newRemaining = (currentRemaining + itemQuantity).toString()
    setRemainingQuantity(newRemaining)

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

    const newRegisteredItems = registeredItems.filter((item) => item.id !== itemId)
    setRegisteredItems(newRegisteredItems)
  }

  const handleDeleteMainItem = (itemId: string) => {
    if (!canModificar) {
      error("No tiene permisos para eliminar")
      return
    }

    const itemToDelete = allRegisteredItems.find((item) => item.id === itemId)

    if (!itemToDelete || !reservaData) return

    const materialIndex = reservaData.MATERIALES.findIndex((material) => material.MATNR === itemToDelete.materialCode)

    if (materialIndex === -1) return

    const material = reservaData.MATERIALES[materialIndex]
    const currentQuantity = Number.parseFloat(material.MENGE)
    const itemQuantity = Number.parseFloat(itemToDelete.quantity)
    const newQuantity = (currentQuantity + itemQuantity).toString()

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

    const updatedMateriales = [...reservaData.MATERIALES]
    updatedMateriales[materialIndex] = {
      ...material,
      MENGE: newQuantity,
      CASES: updatedCases,
    }

    setReservaData({
      ...reservaData,
      MATERIALES: updatedMateriales,
    })

    const newAllRegisteredItems = allRegisteredItems.filter((item) => item.id !== itemId)
    setAllRegisteredItems(newAllRegisteredItems)

    // Mostrar notificación
    success("Elemento eliminado correctamente")
  }

  const openEditModal = (item: RegisteredItem) => {
    if (!canModificar) {
      error("No tiene permisos para modificar")
      return
    }

    setItemToEdit(item)
    setEditQuantity(item.quantity)
    setIsEditModalOpen(true)

    setTimeout(() => {
      if (editQuantityInputRef.current) {
        editQuantityInputRef.current.focus()
      }
    }, 100)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setItemToEdit(null)
    setEditQuantity("")
    setEditError("")
  }

  const handleSaveEdit = () => {
    if (!itemToEdit || !reservaData) return

    setEditError("")
    setIsEditing(true)

    const newQuantity = Number.parseFloat(editQuantity)
    const oldQuantity = Number.parseFloat(itemToEdit.quantity)

    if (isNaN(newQuantity)) {
      setEditError("Cantidad inválida")
      setIsEditing(false)
      return
    }

    if (newQuantity <= 0) {
      setEditError("Cantidad debe ser mayor a cero")
      setIsEditing(false)
      return
    }

    const quantityDiff = newQuantity - oldQuantity

    if (quantityDiff === 0) {
      setIsEditing(false)
      closeEditModal()
      return
    }

    const materialIndex = reservaData.MATERIALES.findIndex((material) => material.MATNR === itemToEdit.materialCode)

    if (materialIndex === -1) {
      setEditError("Material no encontrado")
      setIsEditing(false)
      return
    }

    const material = reservaData.MATERIALES[materialIndex]

    const caseIndex = material.CASES.findIndex(
      (caseItem) => caseItem.CASE === itemToEdit.case && itemToEdit.location === itemToEdit.location,
    )

    if (caseIndex === -1) {
      setEditError("Case no encontrado")
      setIsEditing(false)
      return
    }

    if (quantityDiff > 0) {
      const availableQuantity = Number.parseFloat(material.CASES[caseIndex].CANTIDAD)

      if (quantityDiff > availableQuantity) {
        setEditError(`No hay suficientes unidades (${availableQuantity})`)
        setIsEditing(false)
        return
      }

      const totalMaterialQuantity = Number.parseFloat(material.MENGE) + oldQuantity

      if (newQuantity > totalMaterialQuantity) {
        setEditError(`Excede cantidad total (${totalMaterialQuantity})`)
        setIsEditing(false)
        return
      }
    }

    setTimeout(() => {
      const updatedAllRegisteredItems = allRegisteredItems.map((item) => {
        if (item.id === itemToEdit.id) {
          return {
            ...item,
            quantity: newQuantity.toString(),
          }
        }
        return item
      })

      const currentMaterialQuantity = Number.parseFloat(material.MENGE)
      const newMaterialQuantity = (currentMaterialQuantity - quantityDiff).toString()

      const updatedCases = [...material.CASES]
      const currentCaseQuantity = Number.parseFloat(updatedCases[caseIndex].CANTIDAD)
      updatedCases[caseIndex] = {
        ...updatedCases[caseIndex],
        CANTIDAD: (currentCaseQuantity - quantityDiff).toString(),
      }

      const updatedMateriales = [...reservaData.MATERIALES]
      updatedMateriales[materialIndex] = {
        ...material,
        MENGE: newMaterialQuantity,
        CASES: updatedCases,
      }

      setAllRegisteredItems(updatedAllRegisteredItems)
      setReservaData({
        ...reservaData,
        MATERIALES: updatedMateriales,
      })

      setIsEditing(false)
      closeEditModal()
      success("Cantidad actualizada correctamente")
    }, 500)
  }

  const handleSaveRegisteredItems = () => {
    try {
      if (!canModificar) {
        error("No tiene permisos para guardar")
        return
      }

      if (!reservaData || !selectedMaterial) return

      setIsSaving(true)

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

      setReservaData({
        ...reservaData,
        MATERIALES: updatedMateriales,
      })

      const newAllRegisteredItems = [...allRegisteredItems]

      registeredItems.forEach((item) => {
        const existingItemIndex = newAllRegisteredItems.findIndex(
          (existingItem) =>
            existingItem.material === item.material &&
            existingItem.location === item.location &&
            existingItem.case === item.case,
        )

        if (existingItemIndex !== -1) {
          const existingItem = newAllRegisteredItems[existingItemIndex]
          const existingQuantity = Number.parseInt(existingItem.quantity)
          const newQuantity = existingQuantity + Number.parseInt(item.quantity)

          newAllRegisteredItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity.toString(),
            werks: item.werks || existingItem.werks,
            lgort: item.lgort || existingItem.lgort,
          }
        } else {
          newAllRegisteredItems.push({
            ...item,
            materialDesc: selectedMaterial.MAKTX,
            materialCode: selectedMaterial.MATNR,
            werks: item.werks || reservaData.WERKS,
            lgort: item.lgort || reservaData.LGORT,
          })
        }
      })

      setAllRegisteredItems(newAllRegisteredItems)
      setRegisteredItems([])
      setIsSaving(false)

      // Cerrar el modal de picking y volver a la pestaña de materiales
      setIsPickingModalOpen(false)
      setActiveTab("materials")
      success("Items guardados correctamente")
    } catch (error_) {
      console.error("Error al guardar:", error_)
      setIsSaving(false)
      error("Error al guardar los items")
    }
  }

  const openExcepcionModal = (caseItem: CaseReserva) => {
    if (!canModificar) {
      error("No tiene permisos para excepciones")
      return
    }

    setSelectedExcepcionCase(caseItem)
    setSelectedExcepcion(null)
    setIsExcepcionModalOpen(true)
  }

  const closeExcepcionModal = () => {
    setIsExcepcionModalOpen(false)
    setSelectedExcepcionCase(null)
    setSelectedExcepcion(null)
  }

  const handleExcepcionSelect = async (excepcion: ExcepcionData) => {
    if (!selectedExcepcionCase || !selectedMaterial) return

    try {
      setIsLoading(true)

      const excepcionData = {
        embal: removeLeadingZeros(selectedExcepcionCase.CASE),
        zexcu_wms: excepcion.id,
        zexde_wms: excepcion.name,
        matnr: selectedMaterial.MATNR,
        maktx: selectedMaterial.MAKTX,
        ubicacion: selectedExcepcionCase.UBICACION,
      }

      const response = await axios.post(`${api_url}/entr/excepcion`, excepcionData)

      if (response.data.CODE) {
        const filteredCases = updatedCases.filter(
          (caseItem) =>
            !(caseItem.CASE === selectedExcepcionCase.CASE && caseItem.UBICACION === selectedExcepcionCase.UBICACION),
        )

        setUpdatedCases(filteredCases)

        if (reservaData) {
          const updatedReservaData = { ...reservaData }

          const materialIndex = updatedReservaData.MATERIALES.findIndex(
            (material) => material.MATNR === selectedMaterial.MATNR,
          )

          if (materialIndex !== -1) {
            updatedReservaData.MATERIALES[materialIndex].CASES = updatedReservaData.MATERIALES[
              materialIndex
            ].CASES.filter(
              (caseItem) =>
                !(
                  caseItem.CASE === selectedExcepcionCase.CASE && caseItem.UBICACION === selectedExcepcionCase.UBICACION
                ),
            )

            setReservaData(updatedReservaData)

            const updatedSelectedMaterial = { ...selectedMaterial }
            updatedSelectedMaterial.CASES = filteredCases
            setSelectedMaterial(updatedSelectedMaterial)
          }
        }

        success(`Excepción registrada: ${excepcion.name}`)
      } else {
        throw new Error(response.data.message || "Error al registrar excepción")
      }
    } catch (error_try) {
      error("Error al registrar excepción")
    } finally {
      setIsLoading(false)
      closeExcepcionModal()
    }
  }

  // Establecer el foco en el input del case cuando se abre el modal
  useEffect(() => {
    if (isPickingModalOpen && scanStep === "case") {
      setTimeout(() => {
        if (caseInputRef.current) {
          caseInputRef.current.focus()
        }
      }, 100)
    }
  }, [isPickingModalOpen, scanStep])

  // Función para filtrar y agrupar cases por texto y ubicación
  const getFilteredCases = () => {
    if (!selectedMaterial) return []

    const filteredCases = updatedCases
      .filter((caseItem) => Number.parseInt(caseItem.CANTIDAD) > 0)
      .filter((caseItem) => {
        if (!filterText) return true

        const caseText = removeLeadingZeros(caseItem.CASE).toLowerCase()
        const locationText = caseItem.UBICACION.toLowerCase()
        const searchText = filterText.toLowerCase()

        return caseText.includes(searchText) || locationText.includes(searchText)
      })

    // Ordenar por ubicación para mejor organización
    return filteredCases.sort((a, b) => a.UBICACION.localeCompare(b.UBICACION))
  }

  // Renderizado de la pestaña de búsqueda
  const renderSearchTab = () => {
    return (
      <div className="tab-content active animate-fadeIn">
        <div className="compact-card bg-white dark:bg-boxdark rounded-sm shadow-sm border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit(handleSearch)}>
            <div className="mini-input-group">
              <div className="relative flex-grow">
                <div className="search-icon">
                  <Search className="tiny-icon" />
                </div>
                <input
                  id="reserva"
                  type="text"
                  placeholder="Nº reserva/orden"
                  className="w-full rounded-md border border-gray-200 bg-transparent py-2 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary tiny-text compact-input search-input focus-ring"
                  {...register("reserva", { required: "Documento obligatorio" })}
                  disabled={processingComplete || isSearching}
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-1 rounded-md bg-primary px-3 py-2 tiny-text font-medium text-white shadow-sm transition-all duration-300 hover:bg-primary/90 hover:shadow-md disabled:bg-opacity-70 border border-primary compact-btn"
                disabled={processingComplete || isSearching}
                aria-label="Buscar documento"
              >
                {isSearching ? <Loader2 className="animate-spin tiny-icon" /> : <Search className="tiny-icon" />}
              </button>
            </div>
            {errors.reserva && <ErrorMessage>{errors.reserva.message}</ErrorMessage>}
          </form>
        </div>

        {/* Información del documento si ya existe */}
        {reservaData && (
          <div className="mt-3 compact-card bg-white dark:bg-boxdark rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="info-row">
              <div>
                <div className="info-label">Documento:</div>
                <div className="info-value">
                  {reservaData.TIPODOC === "02" ? "Entrega" : "Reserva"} {reservaData.RESERVA}
                </div>
              </div>
              <div>
                <div className="info-label">Estado:</div>
                <div className="info-value">
                  <span className={`badge ${isReservaProcessed ? "badge-success" : "badge-warning"}`}>
                    {isReservaProcessed ? (
                      <>
                        <CheckCircle className="tiny-icon" />
                        Procesado
                      </>
                    ) : (
                      <>
                        <AlertCircle className="tiny-icon" />
                        Pendiente
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-row">
              <div>
                <div className="info-label">Materiales:</div>
                <div className="info-value">{reservaData.MATERIALES.length}</div>
              </div>
              <div>
                <div className="info-label">Items:</div>
                <div className="info-value">{allRegisteredItems.length}</div>
              </div>
            </div>

            <div className="mini-btn-group mt-3">
              <button
                onClick={() => setActiveTab("materials")}
                className="compact-btn bg-primary text-white rounded-md hover:bg-primary/90"
                aria-label="Ver materiales"
              >
                <List className="tiny-icon" />
                <span>Materiales</span>
              </button>

              {allRegisteredItems.length > 0 && (
                <button
                  onClick={() => handleProcessReserva()}
                  disabled={isProcessing || !canModificar}
                  className="compact-btn bg-success text-white rounded-md hover:bg-success/90 disabled:bg-gray-400"
                  aria-label="Procesar documento"
                >
                  {isProcessing ? <Loader2 className="animate-spin tiny-icon" /> : <Check className="tiny-icon" />}
                  <span>Procesar</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Renderizado de la pestaña de materiales
  const renderMaterialsTab = () => {
    if (!reservaData) {
      return (
        <div className="tab-content active animate-fadeIn">
          <div className="empty-state">
            <FileText className="empty-state-icon h-10 w-10" />
            <div className="empty-state-text">Busque un documento primero</div>
          </div>
        </div>
      )
    }

    return (
      <div className="tab-content active animate-fadeIn">
        {/* Información adicional si es necesaria */}
        {reservaData?.MATERIALES.length > 0 && (
          <div className="info-row mb-2">
            <div className="info-label">Total materiales:</div>
            <div className="info-value">{reservaData.MATERIALES.length}</div>
          </div>
        )}

        {/* Lista de materiales */}
        <div className="compact-list scrollbar-tiny">
          {reservaData?.MATERIALES.map((material, index) => (
            <div key={index} className="material-card">
              <div className="material-header">
                <div className="tiny-text font-semibold">{material.MATNR}</div>
                <div className="badge badge-primary">
                  {material.MENGE} {material.MEINS}
                </div>
              </div>
              <div className="material-body line-clamp-1 tiny-text">{material.MAKTX}</div>
              <div className="material-footer">
                <button
                  onClick={() => selectMaterial(material)}
                  disabled={!material.CASES.some((c) => Number.parseInt(c.CANTIDAD) > 0)}
                  className="compact-btn bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400"
                  aria-label="Ver cases"
                >
                  <Eye className="tiny-icon" />
                  <span>Procesar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Renderizado de la pestaña de procesados
  const renderProcessedTab = () => {
    if (!reservaData || allRegisteredItems.length === 0) {
      return (
        <div className="tab-content active animate-fadeIn">
          <div className="empty-state">
            <Clipboard className="empty-state-icon h-10 w-10" />
            <div className="empty-state-text">No hay items procesados</div>
          </div>
        </div>
      )
    }

    return (
      <div className="tab-content active animate-fadeIn">
        {/* Información del documento */}
        <div className="compact-card bg-white dark:bg-boxdark rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="info-row">
            <div className="info-label">Documento:</div>
            <div className="info-value">
              {reservaData?.TIPODOC === "02" ? "Entrega" : "Reserva"} {reservaData?.RESERVA}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Items:</div>
            <div className="info-value">
              <span className="badge badge-success">
                <Check className="tiny-icon" />
                {allRegisteredItems.length}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de items registrados */}
        <div className="compact-list scrollbar-tiny">
          {allRegisteredItems.map((item) => (
            <div key={item.id} className="material-card">
              <div className="material-header">
                <div className="tiny-text font-semibold">{item.material}</div>
                <div className="badge badge-primary">{item.quantity}</div>
              </div>
              <div className="flex items-center space-x-1 overflow-hidden mt-1">
                <Box className="tiny-icon inline text-gray-500 flex-shrink-0" />
                <span className="tiny-text">{item.case}</span>
                <span className="text-gray-500">|</span>
                <MapPin className="tiny-icon inline text-gray-500 flex-shrink-0" />
                <span className="tiny-text">{item.location}</span>
                <span className="text-gray-500">|</span>
                <span className="text-[0.6rem] text-gray-500">C:</span>
                <span className="text-[0.6rem]">{item.werks || "-"}</span>
                <span className="text-[0.6rem] text-gray-500">/</span>
                <span className="text-[0.6rem] text-gray-500">A:</span>
                <span className="text-[0.6rem]">{item.lgort || "-"}</span>
              </div>
              <div className="material-footer">
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="mini-icon-only bg-amber-500 text-white rounded-md hover:bg-amber-600"
                    title="Modificar"
                    aria-label="Modificar item"
                    disabled={!canModificar}
                  >
                    <Edit className="tiny-icon" />
                  </button>
                  <button
                    onClick={() => handleDeleteMainItem(item.id)}
                    className="mini-icon-only bg-danger text-white rounded-md hover:bg-danger/90"
                    title="Eliminar"
                    aria-label="Eliminar item"
                    disabled={!canModificar}
                  >
                    <Trash2 className="tiny-icon" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón para procesar documento */}
        <div className="mini-btn-group mt-3">
          <button
            onClick={() => handleProcessReserva()}
            disabled={isProcessing || !canModificar}
            className="compact-btn bg-success text-white rounded-md hover:bg-success/90 disabled:bg-gray-400 w-full"
            aria-label="Procesar documento"
          >
            {isProcessing ? <Loader2 className="animate-spin tiny-icon" /> : <Check className="tiny-icon" />}
            <span>Procesar Documento</span>
          </button>
        </div>
      </div>
    )
  }

  // Renderizado del modal de picking a pantalla completa
  const renderPickingModal = () => {
    if (!isPickingModalOpen || !selectedMaterial) return null

    return (
      <div className="fullscreen-modal">
        <div className="fullscreen-modal-header">
          <div className="flex items-center">
            <button
              onClick={() => setIsPickingModalOpen(false)}
              className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Cerrar"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <h2 className="text-sm font-semibold">Picking de Material</h2>
          </div>
          <div className="badge badge-primary">
            {remainingQuantity} {selectedMaterial.MEINS}
          </div>
        </div>

        <div className="fullscreen-modal-body">
          {/* Información del material */}
          <div className="compact-card bg-white dark:bg-boxdark rounded-md shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="info-row">
              <div className="info-label">Material:</div>
              <div className="info-value tiny-text">{selectedMaterial.MATNR}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Descripción:</div>
              <div className="info-value tiny-text line-clamp-1">{selectedMaterial.MAKTX}</div>
            </div>
          </div>

          {/* Buscador de cases */}
          <div className="search-bar">
            <div className="search-icon">
              <Search className="tiny-icon" />
            </div>
            <input
              type="text"
              placeholder="Buscar case o ubicación"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-transparent py-2 text-gray-800 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800/30 dark:text-white dark:focus:border-primary tiny-text compact-input search-input focus-ring"
            />
          </div>

          {/* Sección de escaneo */}
          <div className="compact-card bg-white dark:bg-boxdark rounded-md shadow-sm border border-gray-100 dark:border-gray-700 mt-3">
            <div className="info-row">
              <div className="info-label">Modo:</div>
              <div className="info-value">
                <span className="badge badge-primary">
                  {scanStep === "case" ? (
                    <>
                      <Package className="tiny-icon" />
                      Escanear Case
                    </>
                  ) : (
                    <>
                      <Plus className="tiny-icon" />
                      Ingresar Cantidad
                    </>
                  )}
                </span>
              </div>
            </div>

            {scanStep === "case" ? (
              <div className="mt-3">
                <input
                  ref={caseInputRef}
                  type="text"
                  value={scannedCase}
                  onChange={(e) => setScannedCase(e.target.value)}
                  placeholder="Escanee el código del case"
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-800 outline-none transition-all duration-300 focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary tiny-text compact-input focus-ring"
                  onKeyDown={(e) => e.key === "Enter" && handleCaseScan()}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCaseScan}
                    disabled={!scannedCase}
                    className="compact-btn bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400"
                    aria-label="Escanear case"
                  >
                    <CornerDownRight className="tiny-icon" />
                    <span>Escanear</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                {
                  // Modificar la visualización del case seleccionado para mostrar toda la información en una sola línea. Reemplazar el código del case seleccionado con:
                }
                {selectedCase && (
                  <div className="mb-2 tiny-text bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 overflow-hidden">
                        <Box className="tiny-icon mr-1 flex-shrink-0" />
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {removeLeadingZeros(selectedCase.CASE)}
                        </span>
                        <span className="text-gray-500">|</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">{selectedCase.CANTIDAD}</span>
                        <span className="text-gray-500">|</span>
                        <span className="text-gray-500">C:</span>
                        <span className="text-green-600 dark:text-green-400">{selectedCase.WERKS || "-"}</span>
                        <span className="text-gray-500">/</span>
                        <span className="text-gray-500">A:</span>
                        <span className="text-green-600 dark:text-green-400">{selectedCase.LGORT || "-"}</span>
                      </div>
                      <button
                        onClick={() => {
                          setScanStep("case")
                          setScannedCase("")
                          setTimeout(() => {
                            if (caseInputRef.current) {
                              caseInputRef.current.focus()
                            }
                          }, 100)
                        }}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-xs flex items-center flex-shrink-0"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Cambiar
                      </button>
                    </div>
                  </div>
                )}
                <input
                  ref={quantityInputRef}
                  type="number"
                  min="1"
                  value={quantityToRegister}
                  onChange={(e) => setQuantityToRegister(e.target.value)}
                  placeholder="Ingrese la cantidad"
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary tiny-text compact-input focus-ring"
                  onKeyDown={(e) => e.key === "Enter" && handleQuantityRegister()}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleQuantityRegister}
                    disabled={!quantityToRegister}
                    className="compact-btn bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400"
                    aria-label="Registrar cantidad"
                  >
                    <Plus className="tiny-icon" />
                    <span>Registrar</span>
                  </button>
                </div>
              </div>
            )}

            {scanError && (
              <div className="mt-2 p-2 bg-danger/10 border border-danger/30 rounded-md text-danger tiny-text">
                <div className="flex items-center gap-1">
                  <AlertTriangle className="tiny-icon" />
                  {scanError}
                </div>
              </div>
            )}
          </div>

          {/* Lista de cases */}
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1">
              <div className="info-label">Cases disponibles:</div>
              <div className="badge badge-primary">{getFilteredCases().length} cases</div>
            </div>

            {getFilteredCases().length === 0 ? (
              <div className="p-3 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
                No hay cases disponibles {filterText ? "con ese filtro" : ""}
              </div>
            ) : (
              <div className="compact-list scrollbar-tiny">
                {/* Agrupar cases por ubicación */}
                {(() => {
                  // Agrupar cases por ubicación
                  const casesByLocation = getFilteredCases().reduce(
                    (acc, caseItem) => {
                      if (!acc[caseItem.UBICACION]) {
                        acc[caseItem.UBICACION] = []
                      }
                      acc[caseItem.UBICACION].push(caseItem)
                      return acc
                    },
                    {} as Record<string, CaseReserva[]>,
                  )

                  return Object.entries(casesByLocation).map(([location, cases]) => (
                    <div key={location} className="mb-1">
                      <div className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="h-2.5 w-2.5 mr-1" />
                          <span className="truncate max-w-[150px]">{location}</span>
                        </div>
                        <span className="text-xs text-gray-500">{cases.length}</span>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-b-sm">
                        <div className="grid grid-cols-1 gap-0.5 p-0.5">
                          {
                            // Modificar la visualización de los cases en la lista para mostrar toda la información en una sola línea. Reemplazar el código de la sección de cases (dentro de la función que agrupa por ubicación) con:
                          }
                          {cases.map((caseItem, idx) => (
                            <div
                              key={idx}
                              className="border border-gray-200 dark:border-gray-600 rounded-sm p-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => {
                                setSelectedCase(caseItem)
                                setScanStep("quantity")
                                setTimeout(() => {
                                  if (quantityInputRef.current) {
                                    quantityInputRef.current.focus()
                                  }
                                }, 100)
                              }}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-1 overflow-hidden">
                                  <span className="tiny-text font-semibold truncate">
                                    {removeLeadingZeros(caseItem.CASE)}
                                  </span>
                                  <span className="text-[0.6rem] text-gray-500">|</span>
                                  <span className="badge badge-primary text-[0.6rem] py-0 px-1">
                                    {caseItem.CANTIDAD}
                                  </span>
                                  <span className="text-[0.6rem] text-gray-500">|</span>
                                  <span className="text-[0.6rem]">{caseItem.WERKS || "-"}</span>
                                  <span className="text-[0.6rem] text-gray-500">/</span>
                                  <span className="text-[0.6rem]">{caseItem.LGORT || "-"}</span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openExcepcionModal(caseItem)
                                  }}
                                  className="case-action-btn bg-amber-500 text-white rounded-md hover:bg-amber-600 h-4 w-4 flex items-center justify-center ml-1 flex-shrink-0"
                                  title="Excepción"
                                  aria-label="Registrar excepción"
                                >
                                  <AlertTriangle className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>

          {/* Items registrados */}
          {registeredItems.length > 0 && (
            <div className="compact-card bg-white dark:bg-boxdark rounded-md shadow-sm border border-gray-100 dark:border-gray-700 mt-3">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Check className="tiny-icon text-success mr-1" />
                  <div className="info-label">Items registrados:</div>
                </div>
                <div className="badge badge-success">{registeredItems.length}</div>
              </div>

              <div className="compact-list scrollbar-tiny mt-2">
                {registeredItems.map((item) => (
                  <div key={item.id} className="case-card">
                    <div className="flex items-center space-x-1 overflow-hidden">
                      <Box className="tiny-icon text-primary flex-shrink-0" />
                      <div className="tiny-text font-medium">{item.case}</div>
                      <span className="text-gray-500">|</span>
                      <div className="badge badge-primary">{item.quantity}</div>
                      <span className="text-gray-500">|</span>
                      <span className="text-[0.6rem] text-gray-500">C:</span>
                      <span className="text-[0.6rem]">{item.werks || "-"}</span>
                      <span className="text-[0.6rem] text-gray-500">/</span>
                      <span className="text-[0.6rem] text-gray-500">A:</span>
                      <span className="text-[0.6rem]">{item.lgort || "-"}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteRegisteredItem(item.id)}
                      className="case-action-btn bg-danger text-white rounded-md hover:bg-danger/90 flex-shrink-0"
                      title="Eliminar"
                      aria-label="Eliminar item"
                    >
                      <Trash2 className="tiny-icon" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="fullscreen-modal-footer">
          <button
            onClick={() => setIsPickingModalOpen(false)}
            className="compact-btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            aria-label="Cancelar"
          >
            <X className="tiny-icon" />
            <span>Cancelar</span>
          </button>

          {registeredItems.length > 0 && (
            <button
              onClick={handleSaveRegisteredItems}
              disabled={isSaving}
              className="compact-btn bg-success text-white rounded-md hover:bg-success/90 disabled:bg-gray-400"
              aria-label="Guardar items"
            >
              {isSaving ? <Loader2 className="animate-spin tiny-icon" /> : <Save className="tiny-icon" />}
              <span>Guardar</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Renderizado principal
  return (
    <>
      <div className="mini-container mb-safe">
        {activeTab === "search" && renderSearchTab()}
        {activeTab === "materials" && renderMaterialsTab()}
        {activeTab === "processed" && renderProcessedTab()}

        {/* Notificación */}
        {notification && (
          <div
            className={`fixed bottom-16 left-2 right-2 p-2 rounded-md shadow-md z-50 animate-fadeIn mini-notification ${
              notification.type === "success"
                ? "bg-success/10 border border-success text-success"
                : "bg-danger/10 border border-danger text-danger"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {notification.type === "success" ? (
                  <CheckCircle className="mr-2 tiny-icon" />
                ) : (
                  <AlertCircle className="mr-2 tiny-icon" />
                )}
                <span className="tiny-text">{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-gray-500 hover:text-gray-700">
                <X className="tiny-icon" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de picking a pantalla completa */}
      {renderPickingModal()}

      {/* Modal de edición */}
      {isEditModalOpen && itemToEdit && (
        <div className="modal-backdrop">
          <div className="modal mini-modal">
            <div className="modal-header">
              <h2 className="tiny-text font-bold text-gray-800 dark:text-white">Modificar Cantidad</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Cerrar modal"
              >
                <X className="tiny-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="compact-card bg-gray-50 dark:bg-gray-800">
                <div className="info-row">
                  <div className="info-label">Material:</div>
                  <div className="info-value tiny-text">{itemToEdit.material}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Case:</div>
                  <div className="info-value tiny-text">{itemToEdit.case}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Ubicación:</div>
                  <div className="info-value tiny-text">{itemToEdit.location}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Centro/Almacén:</div>
                  <div className="info-value tiny-text">
                    {itemToEdit.werks || "-"}/{itemToEdit.lgort || "-"}
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Cantidad actual:</div>
                  <div className="info-value text-primary font-semibold">{itemToEdit.quantity}</div>
                </div>
              </div>

              <div className="mt-3">
                <label className="block tiny-text font-medium text-gray-700 dark:text-gray-300 mb-1 mini-label">
                  Nueva cantidad
                </label>
                <input
                  ref={editQuantityInputRef}
                  type="number"
                  min="1"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-gray-800 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-primary tiny-text compact-input focus-ring"
                  disabled={isEditing}
                />
                {editError && <p className="mt-2 tiny-text text-danger">{editError}</p>}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={closeEditModal}
                className="compact-btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={isEditing}
                aria-label="Cancelar"
              >
                <X className="tiny-icon" />
                <span>Cancelar</span>
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editQuantity || isEditing || !canModificar}
                className="compact-btn bg-primary text-white rounded-md hover:bg-primary/90 disabled:bg-gray-400"
                aria-label="Guardar cambios"
              >
                {isEditing ? <Loader2 className="animate-spin tiny-icon mr-1" /> : <Save className="tiny-icon mr-1" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de excepciones */}
      {isExcepcionModalOpen && selectedExcepcionCase && (
        <div className="modal-backdrop" style={{ zIndex: 200 }}>
          <div className="modal mini-modal" style={{ zIndex: 201 }}>
            <div className="modal-header">
              <h2 className="tiny-text font-bold text-gray-800 dark:text-white">Registrar Excepción</h2>
              <button
                onClick={closeExcepcionModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Cerrar modal"
              >
                <X className="tiny-icon" />
              </button>
            </div>
            <div className="modal-body">
              <div className="compact-card bg-gray-50 dark:bg-gray-800">
                <div className="info-row">
                  <div className="info-label">Case:</div>
                  <div className="info-value tiny-text">{removeLeadingZeros(selectedExcepcionCase.CASE)}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Ubicación:</div>
                  <div className="info-value tiny-text">{selectedExcepcionCase.UBICACION}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Centro/Almacén:</div>
                  <div className="info-value tiny-text">
                    {selectedExcepcionCase.WERKS || "-"}/{selectedExcepcionCase.LGORT || "-"}
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Cantidad:</div>
                  <div className="info-value text-primary font-semibold">{selectedExcepcionCase.CANTIDAD}</div>
                </div>
              </div>

              <div className="mt-3">
                <label className="block tiny-text font-medium text-gray-700 dark:text-gray-300 mb-1 mini-label">
                  Seleccione el tipo de excepción
                </label>
                <div className="compact-list scrollbar-tiny mt-2">
                  {isLoadingExcepciones ? (
                    <div className="flex justify-center items-center p-3">
                      <Loader2 className="animate-spin h-5 w-5 text-primary" />
                    </div>
                  ) : (
                    excepciones.map((excepcion) => (
                      <button
                        key={excepcion._id}
                        onClick={() => handleExcepcionSelect(excepcion)}
                        disabled={isLoading}
                        className="w-full text-left p-2 mb-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 tiny-text"
                      >
                        <div className="font-medium">{excepcion.name}</div>
                        <div className="text-gray-500 dark:text-gray-400">Código: {excepcion.id}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={closeExcepcionModal}
                className="compact-btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                disabled={isLoading}
                aria-label="Cancelar"
              >
                <X className="tiny-icon" />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Barra de navegación inferior mejorada */}
      <div className="nav-buttons pb-safe">
        <button
          onClick={() => setActiveTab("search")}
          className={`nav-button ${activeTab === "search" ? "active" : ""}`}
          aria-label="Ir a búsqueda"
        >
          <Search className="h-5 w-5" />
          <span className="nav-button-text">Buscar</span>
        </button>

        <button
          onClick={() => reservaData && setActiveTab("materials")}
          className={`nav-button ${activeTab === "materials" ? "active" : ""}`}
          disabled={!reservaData}
          aria-label="Ir a materiales"
        >
          <Package className="h-5 w-5" />
          <span className="nav-button-text">Materiales</span>
        </button>

        <button
          onClick={() => setActiveTab("processed")}
          className={`nav-button ${activeTab === "processed" ? "active" : ""}`}
          disabled={!reservaData || allRegisteredItems.length === 0}
          aria-label="Ir a procesados"
        >
          <CheckSquare className="h-5 w-5" />
          <span className="nav-button-text">Procesados</span>
        </button>
      </div>
    </>
  )
}

export default PickingMobile
