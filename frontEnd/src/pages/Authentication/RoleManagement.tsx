"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import {
  FileText,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  RefreshCw,
  Search,
  AlertCircle,
  X,
  Link,
  FileCode,
  Grid,
  List,
  Settings,
  HelpCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useToast } from "../../hooks/useToast"
import ToastContainer from "../../components/ToastContainer"
import { useMobile } from "../../hooks/use-mobile"

// Definición de colores personalizados
const colors = {
  primary: "rgb(59, 130, 246)",
  success: "rgb(34, 197, 94)",
  danger: "rgb(239, 68, 68)",
  warning: "rgb(234, 179, 8)",
  info: "rgb(6, 182, 212)",
}

interface Role {
  _id: string
  name: string
  description: string
  isActive: boolean
}

interface Page {
  _id: string
  name: string
  path: string
  description: string
  isActive: boolean
}

interface Permission {
  _id: string
  role: Role | string
  page: Page | string
  actions: ActionType[]
}

enum ActionType {
  VIEW = "visualizar",
  MODIFY = "modificar",
  DELETE = "borrar",
  ACCOUNT = "contabilizar",
  CANCEL = "anular",
}

// Mapa de iconos para cada tipo de acción
const actionIcons: Record<ActionType, React.ReactNode> = {
  [ActionType.VIEW]: <Eye size={14} />,
  [ActionType.MODIFY]: <Edit size={14} />,
  [ActionType.DELETE]: <Trash2 size={14} />,
  [ActionType.ACCOUNT]: <CheckCircle size={14} />,
  [ActionType.CANCEL]: <XCircle size={14} />,
}

const RoleManagement: React.FC = () => {
  // Check if on mobile
  const isMobile = useMobile()

  // Toast state
  const { addToast, toasts, removeToast } = useToast()

  // State for roles
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [newRole, setNewRole] = useState({ name: "", description: "" })
  const [editRole, setEditRole] = useState<Role | null>(null)

  // State for pages
  const [pages, setPages] = useState<Page[]>([])
  const [newPage, setNewPage] = useState({ name: "", path: "", description: "" })
  const [editPage, setEditPage] = useState<Page | null>(null)

  // State for permissions
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [permissionsMap, setPermissionsMap] = useState<Record<string, Record<string, ActionType[]>>>({})
  const [selectedActions, setSelectedActions] = useState<ActionType[]>([])
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [viewMode, setViewMode] = useState<"matrix" | "list">("list") // Default to list on mobile
  const [showHelp, setShowHelp] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("roles") // 'roles', 'pages', 'permissions'
  const [showRoleForm, setShowRoleForm] = useState(false)
  const [showPageForm, setShowPageForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [showPageInfo, setShowPageInfo] = useState<string | null>(null)
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null)

  // Available actions
  const availableActions = Object.values(ActionType)

  // Set default view mode based on screen size
  useEffect(() => {
    if (isMobile) {
      setViewMode("list")
    }
  }, [isMobile])

  // Fetch roles, pages, and permissions on component mount
  useEffect(() => {
    fetchRoles()
    fetchPages()
    fetchAllPermissions()
  }, [])

  // Update permissions map when permissions change
  useEffect(() => {
    const map: Record<string, Record<string, ActionType[]>> = {}

    permissions.forEach((permission) => {
      const roleId = typeof permission.role === "string" ? permission.role : permission.role._id
      const pageId = typeof permission.page === "string" ? permission.page : permission.page._id

      if (!map[roleId]) {
        map[roleId] = {}
      }

      map[roleId][pageId] = permission.actions
    })

    setPermissionsMap(map)
  }, [permissions])

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/role`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setRoles(response.data.data)
      }
    } catch (error: any) {
      console.error("Error al cargar roles:", error)
      addToast(error.response?.data?.message || "Error al cargar roles", "error")
    } finally {
      setLoading(false)
    }
  }

  // Fetch pages
  const fetchPages = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/page`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setPages(response.data.data)
      }
    } catch (error: any) {
      console.error("Error al cargar páginas:", error)
      addToast(error.response?.data?.message || "Error al cargar páginas", "error")
    } finally {
      setLoading(false)
    }
  }

  // Fetch all permissions
  const fetchAllPermissions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/permis`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setPermissions(response.data.data)
      }
    } catch (error: any) {
      console.error("Error al cargar permisos:", error)
      addToast(error.response?.data?.message || "Error al cargar permisos", "error")
    } finally {
      setLoading(false)
    }
  }

  // Fetch permissions for a role
  const fetchPermissions = async (roleId: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/role/${roleId}/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setPermissions(response.data.data)
      }
    } catch (error: any) {
      console.error("Error al cargar permisos:", error)
      addToast(error.response?.data?.message || "Error al cargar permisos", "error")
    } finally {
      setLoading(false)
    }
  }

  // Create a new role
  const createRole = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/role`, newRole, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        addToast("Rol creado exitosamente", "success")
        setNewRole({ name: "", description: "" })
        fetchRoles()
        setShowRoleForm(false)
      }
    } catch (error: any) {
      console.error("Error al crear rol:", error)
      addToast(error.response?.data?.message || "Error al crear rol", "error")
    } finally {
      setLoading(false)
    }
  }

  // Update a role
  const updateRole = async () => {
    if (!editRole) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/role/${editRole._id}`,
        {
          name: editRole.name,
          description: editRole.description,
          isActive: editRole.isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        addToast("Rol actualizado exitosamente", "success")
        fetchRoles()
        setEditRole(null)
      }
    } catch (error: any) {
      console.error("Error al actualizar rol:", error)
      addToast(error.response?.data?.message || "Error al actualizar rol", "error")
    } finally {
      setLoading(false)
    }
  }

  // Delete a role
  const deleteRole = async (roleId: string) => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/role/${roleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        addToast("Rol eliminado exitosamente", "success")
        setSelectedRole(null)
        fetchRoles()
        fetchAllPermissions()
        setConfirmDelete(null)
      }
    } catch (error: any) {
      console.error("Error al eliminar rol:", error)
      addToast(error.response?.data?.message || "Error al eliminar rol", "error")
    } finally {
      setLoading(false)
    }
  }

  // Create a new page
  const createPage = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/page`, newPage, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        addToast("Página creada exitosamente", "success")
        setNewPage({ name: "", path: "", description: "" })
        fetchPages()
        setShowPageForm(false)
      }
    } catch (error: any) {
      console.error("Error al crear página:", error)
      addToast(error.response?.data?.message || "Error al crear página", "error")
    } finally {
      setLoading(false)
    }
  }

  // Update a page
  const updatePage = async () => {
    if (!editPage) return

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/page/${editPage._id}`,
        {
          name: editPage.name,
          path: editPage.path,
          description: editPage.description,
          isActive: editPage.isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        addToast("Página actualizada exitosamente", "success")
        fetchPages()
        setEditPage(null)
      }
    } catch (error: any) {
      console.error("Error al actualizar página:", error)
      addToast(error.response?.data?.message || "Error al actualizar página", "error")
    } finally {
      setLoading(false)
    }
  }

  // Delete a page
  const deletePage = async (pageId: string) => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/page/${pageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        addToast("Página eliminada exitosamente", "success")
        fetchPages()
        fetchAllPermissions()
        setConfirmDelete(null)
      }
    } catch (error: any) {
      console.error("Error al eliminar página:", error)
      addToast(error.response?.data?.message || "Error al eliminar página", "error")
    } finally {
      setLoading(false)
    }
  }

  // Set permissions for a role and page
  const setPermission = async (roleId: string, pageId: string, actions: ActionType[]) => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const token = localStorage.getItem("token")

      if (!token) {
        addToast("No está autorizado para realizar esta acción", "error")
        return
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/permis`,
        {
          roleId,
          pageId,
          actions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        addToast("Permisos establecidos exitosamente", "success")
        fetchAllPermissions()
      }
    } catch (error: any) {
      console.error("Error al establecer permisos:", error)
      addToast(error.response?.data?.message || "Error al establecer permisos", "error")
    } finally {
      setLoading(false)
    }
  }

  // Toggle permission for a role and page
  const togglePermission = (roleId: string, pageId: string, action: ActionType) => {
    const currentActions = permissionsMap[roleId]?.[pageId] || []
    let newActions: ActionType[]

    if (currentActions.includes(action)) {
      // Remove action
      newActions = currentActions.filter((a) => a !== action)
    } else {
      // Add action
      newActions = [...currentActions, action]
    }

    setPermission(roleId, pageId, newActions)
  }

  // Toggle all permissions for a role and page
  const toggleAllPermissions = (roleId: string, pageId: string) => {
    const currentActions = permissionsMap[roleId]?.[pageId] || []
    let newActions: ActionType[]

    // If all actions are already selected, deselect all
    if (currentActions.length === availableActions.length) {
      newActions = []
    } else {
      // Otherwise, select all actions
      newActions = [...availableActions]
    }

    setPermission(roleId, pageId, newActions)
  }

  // Handle role selection
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setActiveTab("permissions")
    fetchPermissions(role._id)
  }

  // Filter roles based on search term and active filter
  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterActive === null) return matchesSearch
    return matchesSearch && role.isActive === filterActive
  })

  // Filter pages based on search term and active filter
  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterActive === null) return matchesSearch
    return matchesSearch && page.isActive === filterActive
  })

  // Check if a permission exists
  const hasPermission = (roleId: string, pageId: string, action: ActionType): boolean => {
    return permissionsMap[roleId]?.[pageId]?.includes(action) || false
  }

  // Get active roles and pages for matrix view
  const activeRoles = roles.filter((role) => role.isActive)
  const activePages = pages.filter((page) => page.isActive)

  // Redirect to roles tab if permissions tab is active but no role is selected
  useEffect(() => {
    if (activeTab === "permissions" && !selectedRole) {
      setActiveTab("roles")
      addToast("Primero seleccione un rol para gestionar sus permisos", "warning")
    }
  }, [activeTab, selectedRole])

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showActionMenu && !(event.target as Element).closest(".action-menu")) {
        setShowActionMenu(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showActionMenu])

  return (
    <>
      <Breadcrumb pageName="Gestión de Roles y Permisos" />

      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
        <div className="flex flex-col gap-9">
          {/* Tabs */}
          <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6 xl:px-7.5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    activeTab === "roles"
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
                  }`}
                  onClick={() => setActiveTab("roles")}
                >
                  <Shield size={16} />
                  <span className="hidden xs:inline">Roles</span>
                </button>
                <button
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    activeTab === "pages"
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
                  }`}
                  onClick={() => setActiveTab("pages")}
                >
                  <FileText size={16} />
                  <span className="hidden xs:inline">Páginas</span>
                </button>
                <button
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                    activeTab === "permissions"
                      ? "bg-primary text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
                  }`}
                  onClick={() => {
                    if (selectedRole) {
                      setActiveTab("permissions")
                      fetchPermissions(selectedRole._id)
                    } else {
                      addToast("Primero seleccione un rol para gestionar sus permisos", "warning")
                    }
                  }}
                >
                  <Settings size={16} />
                  <span className="hidden xs:inline">Permisos</span>
                  {!selectedRole && (
                    <span className="ml-1 rounded-full bg-danger bg-opacity-10 px-1.5 py-0.5 text-xs text-danger">
                      !
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 xl:p-7.5">
              {/* Search and Filter Bar */}
              {activeTab !== "permissions" && (
                <div className="mb-6 flex flex-col gap-4 rounded-lg border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado:</span>
                    <button
                      onClick={() => setFilterActive(true)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        filterActive === true
                          ? "bg-success bg-opacity-10 text-success"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                      }`}
                    >
                      Activo
                    </button>
                    <button
                      onClick={() => setFilterActive(false)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        filterActive === false
                          ? "bg-danger bg-opacity-10 text-danger"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                      }`}
                    >
                      Inactivo
                    </button>
                    <button
                      onClick={() => setFilterActive(null)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                        filterActive === null
                          ? "bg-primary bg-opacity-10 text-primary"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                      }`}
                    >
                      Todos
                    </button>
                  </div>
                </div>
              )}

              {/* Roles Tab */}
              {activeTab === "roles" && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black dark:text-white">Gestión de Roles</h3>
                    <button
                      onClick={() => setShowRoleForm(!showRoleForm)}
                      className="inline-flex items-center gap-2 rounded-lg bg-success px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-opacity-90"
                    >
                      {showRoleForm ? (
                        <>
                          <X size={16} />
                          <span className="hidden xs:inline">Cancelar</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span className="hidden xs:inline">Nuevo Rol</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Create Role Form */}
                  {showRoleForm && (
                    <div className="mb-6 rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6">
                      <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">Crear Nuevo Rol</h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2.5 block font-medium text-black dark:text-white">Nombre del Rol</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={newRole.name}
                              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                              placeholder="Nombre del rol"
                              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2.5 block font-medium text-black dark:text-white">Descripción</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={newRole.description}
                              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                              placeholder="Descripción del rol"
                              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => setShowRoleForm(false)}
                          className="mr-2 inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                        >
                          <X size={16} />
                          Cancelar
                        </button>
                        <button
                          onClick={createRole}
                          disabled={loading || !newRole.name || !newRole.description}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="animate-spin" size={16} />
                              Creando...
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              Crear Rol
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Edit Role Modal */}
                  {editRole && (
                    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-black dark:text-white">Editar Rol</h4>
                          <button
                            onClick={() => setEditRole(null)}
                            className="rounded-full p-1 text-gray-500 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2.5 block font-medium text-black dark:text-white">
                              Nombre del Rol
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={editRole.name}
                                onChange={(e) => setEditRole({ ...editRole, name: e.target.value })}
                                placeholder="Nombre del rol"
                                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              />
                              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            </div>
                          </div>
                          <div>
                            <label className="mb-2.5 block font-medium text-black dark:text-white">Descripción</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={editRole.description}
                                onChange={(e) => setEditRole({ ...editRole, description: e.target.value })}
                                placeholder="Descripción del rol"
                                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              />
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="mb-2.5 block font-medium text-black dark:text-white">Estado</label>
                          <div className="flex items-center space-x-4">
                            <label className="flex cursor-pointer items-center">
                              <input
                                type="radio"
                                checked={editRole.isActive}
                                onChange={() => setEditRole({ ...editRole, isActive: true })}
                                className="mr-2 h-5 w-5 accent-success"
                              />
                              <span className="text-sm text-black dark:text-white">Activo</span>
                            </label>
                            <label className="flex cursor-pointer items-center">
                              <input
                                type="radio"
                                checked={!editRole.isActive}
                                onChange={() => setEditRole({ ...editRole, isActive: false })}
                                className="mr-2 h-5 w-5 accent-danger"
                              />
                              <span className="text-sm text-black dark:text-white">Inactivo</span>
                            </label>
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setEditRole(null)}
                            className="mr-2 inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                          >
                            <X size={16} />
                            Cancelar
                          </button>
                          <button
                            onClick={updateRole}
                            disabled={loading || !editRole.name || !editRole.description}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="animate-spin" size={16} />
                                Actualizando...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Guardar Cambios
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Delete Modal */}
                  {confirmDelete && (
                    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
                        <div className="mb-2 text-center">
                          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-danger" />
                          <h4 className="text-xl font-semibold text-black dark:text-white">¿Confirmar eliminación?</h4>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar este elemento?
                          </p>
                        </div>
                        <div className="mt-6 flex justify-center space-x-3">
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              if (activeTab === "roles") {
                                deleteRole(confirmDelete)
                              } else if (activeTab === "pages") {
                                deletePage(confirmDelete)
                              }
                            }}
                            className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90"
                          >
                            {loading ? "Eliminando..." : "Sí, eliminar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Roles List - Mobile Optimized */}
                  <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="py-4 px-4 md:px-6 xl:px-7.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-black dark:text-white">Roles Existentes</h4>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary bg-opacity-10 px-3 py-1 text-xs font-medium text-primary">
                            Total: {filteredRoles.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Headers - Hidden on Mobile */}
                    <div className="hidden border-t border-stroke py-4.5 px-4 dark:border-strokedark md:grid md:grid-cols-6 md:px-6 xl:px-7.5">
                      <div className="col-span-2 flex items-center">
                        <p className="font-medium text-black dark:text-white">Nombre</p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <p className="font-medium text-black dark:text-white">Descripción</p>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <p className="font-medium text-black dark:text-white">Estado</p>
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <p className="font-medium text-black dark:text-white">Acciones</p>
                      </div>
                    </div>

                    {filteredRoles.length > 0 ? (
                      <div className="max-h-[600px] overflow-y-auto">
                        {filteredRoles.map((role) => (
                          <div
                            key={role._id}
                            className="border-t border-stroke py-4.5 px-4 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 md:grid md:grid-cols-6 md:px-6 xl:px-7.5"
                          >
                            {/* Mobile View */}
                            <div className="flex flex-col gap-2 md:hidden">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                    <Shield className="text-primary" size={20} />
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-black dark:text-white">{role.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                                  </div>
                                </div>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    role.isActive
                                      ? "bg-success bg-opacity-10 text-success"
                                      : "bg-danger bg-opacity-10 text-danger"
                                  }`}
                                >
                                  {role.isActive ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setActiveTab("permissions")
                                    setSelectedRole(role)
                                  }}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary transition-colors hover:bg-primary hover:text-white"
                                  title="Gestionar permisos"
                                >
                                  <Settings size={16} />
                                </button>
                                <button
                                  onClick={() => setEditRole(role)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 bg-opacity-10 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                                  title="Editar rol"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(role._id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-danger bg-opacity-10 text-danger transition-colors hover:bg-danger hover:text-white"
                                  title="Eliminar rol"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Desktop View */}
                            <div className="col-span-2 hidden items-center md:flex">
                              <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                  <Shield className="text-primary" size={20} />
                                </span>
                                <p className="text-sm font-medium text-black dark:text-white">{role.name}</p>
                              </div>
                            </div>
                            <div className="col-span-2 hidden items-center md:flex">
                              <p className="text-sm text-black dark:text-white">{role.description}</p>
                            </div>
                            <div className="col-span-1 hidden items-center md:flex">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                  role.isActive
                                    ? "bg-success bg-opacity-10 text-success"
                                    : "bg-danger bg-opacity-10 text-danger"
                                }`}
                              >
                                {role.isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                            <div className="col-span-1 hidden items-center justify-end space-x-3.5 md:flex">
                              <button
                                onClick={() => {
                                  setActiveTab("permissions")
                                  setSelectedRole(role)
                                }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary transition-colors hover:bg-primary hover:text-white"
                                title="Gestionar permisos"
                              >
                                <Settings size={18} />
                              </button>
                              <button
                                onClick={() => setEditRole(role)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 bg-opacity-10 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                                title="Editar rol"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(role._id)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-danger bg-opacity-10 text-danger transition-colors hover:bg-danger hover:text-white"
                                title="Eliminar rol"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-t border-stroke py-8 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="mb-3 h-16 w-16 text-gray-400" />
                          <p className="text-center text-lg font-medium text-black dark:text-white">
                            No se encontraron roles
                          </p>
                          <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                            {searchTerm
                              ? "No hay roles que coincidan con tu búsqueda"
                              : "No hay roles disponibles. Crea uno nuevo para comenzar."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pages Tab */}
              {activeTab === "pages" && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">Páginas del Sistema</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                        Gestione las páginas disponibles en la aplicación
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPageForm(!showPageForm)}
                      className="inline-flex items-center gap-2 rounded-lg bg-success px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-opacity-90"
                    >
                      {showPageForm ? (
                        <>
                          <X size={16} />
                          <span className="hidden xs:inline">Cancelar</span>
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          <span className="hidden xs:inline">Nueva Página</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Create Page Form */}
                  {showPageForm && (
                    <div className="mb-6 rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6">
                      <h4 className="mb-4 text-lg font-semibold text-black dark:text-white">Crear Nueva Página</h4>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2.5 block font-medium text-black dark:text-white">
                            Nombre de la Página
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={newPage.name}
                              onChange={(e) => setNewPage({ ...newPage, name: e.target.value })}
                              placeholder="Nombre de la página"
                              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          </div>
                        </div>
                        <div>
                          <label className="mb-2.5 block font-medium text-black dark:text-white">Ruta</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={newPage.path}
                              onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
                              placeholder="/ruta/de/la/pagina"
                              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-2.5 block font-medium text-black dark:text-white">Descripción</label>
                          <div className="relative">
                            <textarea
                              value={newPage.description}
                              onChange={(e) => setNewPage({ ...newPage, description: e.target.value })}
                              placeholder="Descripción de la página"
                              rows={3}
                              className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                            <FileText className="absolute left-3 top-6 text-gray-500" size={18} />
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setShowPageForm(false)}
                            className="mr-2 inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                          >
                            <X size={16} />
                            Cancelar
                          </button>
                          <button
                            onClick={createPage}
                            disabled={loading || !newPage.name || !newPage.path || !newPage.description}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="animate-spin" size={16} />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Crear Página
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit Page Modal */}
                  {editPage && (
                    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40 p-4">
                      <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-lg dark:bg-boxdark sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-black dark:text-white">Editar Página</h4>
                          <button
                            onClick={() => setEditPage(null)}
                            className="rounded-full p-1 text-gray-500 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2.5 block font-medium text-black dark:text-white">
                              Nombre de la Página
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={editPage.name}
                                onChange={(e) => setEditPage({ ...editPage, name: e.target.value })}
                                placeholder="Nombre de la página"
                                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              />
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            </div>
                          </div>
                          <div>
                            <label className="mb-2.5 block font-medium text-black dark:text-white">Ruta</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={editPage.path}
                                onChange={(e) => setEditPage({ ...editPage, path: e.target.value })}
                                placeholder="/ruta/de/la/pagina"
                                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              />
                              <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="mb-2.5 block font-medium text-black dark:text-white">Descripción</label>
                            <div className="relative">
                              <textarea
                                value={editPage.description}
                                onChange={(e) => setEditPage({ ...editPage, description: e.target.value })}
                                placeholder="Descripción de la página"
                                rows={3}
                                className="w-full rounded-lg border border-stroke bg-transparent py-3 pl-10 pr-4 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              />
                              <FileText className="absolute left-3 top-6 text-gray-500" size={18} />
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="mb-2.5 block font-medium text-black dark:text-white">Estado</label>
                          <div className="flex items-center space-x-4">
                            <label className="flex cursor-pointer items-center">
                              <input
                                type="radio"
                                checked={editPage.isActive}
                                onChange={() => setEditPage({ ...editPage, isActive: true })}
                                className="mr-2 h-5 w-5 accent-success"
                              />
                              <span className="text-sm text-black dark:text-white">Activo</span>
                            </label>
                            <label className="flex cursor-pointer items-center">
                              <input
                                type="radio"
                                checked={!editPage.isActive}
                                onChange={() => setEditPage({ ...editPage, isActive: false })}
                                className="mr-2 h-5 w-5 accent-danger"
                              />
                              <span className="text-sm text-black dark:text-white">Inactivo</span>
                            </label>
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setEditPage(null)}
                            className="mr-2 inline-flex items-center gap-2 rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                          >
                            <X size={16} />
                            Cancelar
                          </button>
                          <button
                            onClick={updatePage}
                            disabled={loading || !editPage.name || !editPage.path || !editPage.description}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <RefreshCw className="animate-spin" size={16} />
                                Actualizando...
                              </>
                            ) : (
                              <>
                                <Save size={16} />
                                Guardar Cambios
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Page Info Modal */}
                  {showPageInfo && (
                    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40 p-4">
                      <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-lg dark:bg-boxdark sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-black dark:text-white">Información de la Página</h4>
                          <button
                            onClick={() => setShowPageInfo(null)}
                            className="rounded-full p-1 text-gray-500 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        {pages.find((p) => p._id === showPageInfo) && (
                          <div className="space-y-4">
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</h5>
                              <p className="text-base font-medium text-black dark:text-white">
                                {pages.find((p) => p._id === showPageInfo)?.name}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ruta</h5>
                              <p className="text-base font-medium text-black dark:text-white">
                                {pages.find((p) => p._id === showPageInfo)?.path}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción</h5>
                              <p className="text-base text-black dark:text-white">
                                {pages.find((p) => p._id === showPageInfo)?.description}
                              </p>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado</h5>
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                  pages.find((p) => p._id === showPageInfo)?.isActive
                                    ? "bg-success bg-opacity-10 text-success"
                                    : "bg-danger bg-opacity-10 text-danger"
                                }`}
                              >
                                {pages.find((p) => p._id === showPageInfo)?.isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setShowPageInfo(null)}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90"
                          >
                            Cerrar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Delete Modal */}
                  {confirmDelete && (
                    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40 p-4">
                      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-boxdark">
                        <div className="mb-2 text-center">
                          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-danger" />
                          <h4 className="text-xl font-semibold text-black dark:text-white">¿Confirmar eliminación?</h4>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar esta página?
                          </p>
                        </div>
                        <div className="mt-6 flex justify-center space-x-3">
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => {
                              deletePage(confirmDelete)
                            }}
                            className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90"
                          >
                            {loading ? "Eliminando..." : "Sí, eliminar"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pages List - Mobile Optimized */}
                  <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="py-4 px-4 md:px-6 xl:px-7.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-black dark:text-white">Páginas Disponibles</h4>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary bg-opacity-10 px-3 py-1 text-xs font-medium text-primary">
                            Total: {filteredPages.length}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-success bg-opacity-10 px-3 py-1 text-xs font-medium text-success">
                            Activas: {filteredPages.filter((p) => p.isActive).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Headers - Hidden on Mobile */}
                    <div className="hidden border-t border-stroke py-4.5 px-4 dark:border-strokedark md:grid md:grid-cols-12 md:px-6 xl:px-7.5">
                      <div className="col-span-4 flex items-center">
                        <p className="font-medium text-black dark:text-white">Nombre / Ruta</p>
                      </div>
                      <div className="col-span-5 flex items-center">
                        <p className="font-medium text-black dark:text-white">Descripción</p>
                      </div>
                      <div className="col-span-1 flex items-center">
                        <p className="font-medium text-black dark:text-white">Estado</p>
                      </div>
                      <div className="col-span-2 flex items-center justify-end">
                        <p className="font-medium text-black dark:text-white">Acciones</p>
                      </div>
                    </div>

                    {filteredPages.length > 0 ? (
                      <div className="max-h-[600px] overflow-y-auto">
                        {filteredPages.map((page) => (
                          <div
                            key={page._id}
                            className="border-t border-stroke py-4 px-4 transition-colors hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 md:grid md:grid-cols-12 md:px-6 xl:px-7.5"
                          >
                            {/* Mobile View */}
                            <div className="flex flex-col gap-2 md:hidden">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                    <FileCode className="text-primary" size={20} />
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium text-black dark:text-white">{page.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{page.path}</p>
                                  </div>
                                </div>
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    page.isActive
                                      ? "bg-success bg-opacity-10 text-success"
                                      : "bg-danger bg-opacity-10 text-danger"
                                  }`}
                                >
                                  {page.isActive ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                              <p className="line-clamp-2 text-xs text-gray-600 dark:text-gray-300">
                                {page.description}
                              </p>
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => setShowPageInfo(page._id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary transition-colors hover:bg-primary hover:text-white"
                                  title="Ver detalles"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => setEditPage(page)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 bg-opacity-10 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                                  title="Editar página"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(page._id)}
                                  className="flex h-8 w-8 items-center justify-center rounded-full bg-danger bg-opacity-10 text-danger transition-colors hover:bg-danger hover:text-white"
                                  title="Eliminar página"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>

                            {/* Desktop View */}
                            <div className="col-span-4 hidden items-center md:flex">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                    <FileCode className="text-primary" size={20} />
                                  </span>
                                  <p className="text-sm font-medium text-black dark:text-white">{page.name}</p>
                                </div>
                                <p className="mt-1 ml-13 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="inline-flex items-center gap-1">
                                    <Link size={12} />
                                    {page.path}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="col-span-5 hidden items-center md:flex">
                              <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                                {page.description}
                              </p>
                            </div>
                            <div className="col-span-1 hidden items-center md:flex">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                  page.isActive
                                    ? "bg-success bg-opacity-10 text-success"
                                    : "bg-danger bg-opacity-10 text-danger"
                                }`}
                              >
                                {page.isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                            <div className="col-span-2 hidden items-center justify-end md:flex">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setShowPageInfo(page._id)}
                                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary bg-opacity-10 text-primary transition-colors hover:bg-primary hover:text-white"
                                  title="Ver detalles"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => setEditPage(page)}
                                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 bg-opacity-10 text-blue-500 transition-colors hover:bg-blue-500 hover:text-white"
                                  title="Editar página"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(page._id)}
                                  className="flex h-9 w-9 items-center justify-center rounded-full bg-danger bg-opacity-10 text-danger transition-colors hover:bg-danger hover:text-white"
                                  title="Eliminar página"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border-t border-stroke py-8 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="mb-3 h-16 w-16 text-gray-400" />
                          <p className="text-center text-lg font-medium text-black dark:text-white">
                            No se encontraron páginas
                          </p>
                          <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                            {searchTerm
                              ? "No hay páginas que coincidan con tu búsqueda"
                              : "No hay páginas disponibles. Crea una nueva para comenzar."}
                          </p>
                          {searchTerm && (
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                            >
                              <X size={16} />
                              Limpiar búsqueda
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Permissions Tab (Matrix View) */}
              {activeTab === "permissions" && (
                <div>
                  {/* Help Modal */}
                  {showHelp && (
                    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black bg-opacity-40 p-4">
                      <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg dark:bg-boxdark sm:p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-black dark:text-white">
                            Ayuda: Gestión de Permisos
                          </h4>
                          <button
                            onClick={() => setShowHelp(false)}
                            className="rounded-full p-1 text-gray-500 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-meta-4"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div className="rounded-lg bg-gray-50 p-4 dark:bg-meta-4">
                            <h5 className="mb-2 font-medium text-black dark:text-white">
                              ¿Cómo funciona la matriz de permisos?
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              La matriz de permisos te permite asignar diferentes acciones a cada rol para cada página
                              del sistema. Cada celda representa la intersección entre un rol y una página, donde puedes
                              activar o desactivar permisos específicos.
                            </p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-4 dark:bg-meta-4">
                            <h5 className="mb-2 font-medium text-black dark:text-white">Tipos de acciones</h5>
                            <ul className="ml-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              {availableActions.map((action) => (
                                <li key={action} className="flex items-center gap-2">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success bg-opacity-10">
                                    {actionIcons[action]}
                                  </span>
                                  <span className="font-medium text-black dark:text-white">
                                    {action.charAt(0).toUpperCase() + action.slice(1)}:
                                  </span>{" "}
                                  {action === ActionType.VIEW && "Permite ver la página y su contenido"}
                                  {action === ActionType.MODIFY && "Permite modificar datos en la página"}
                                  {action === ActionType.DELETE && "Permite eliminar elementos en la página"}
                                  {action === ActionType.ACCOUNT && "Permite contabilizar operaciones"}
                                  {action === ActionType.CANCEL && "Permite anular operaciones"}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-4 dark:bg-meta-4">
                            <h5 className="mb-2 font-medium text-black dark:text-white">Consejos</h5>
                            <ul className="ml-4 list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <li>
                                Usa el botón "Marcar Todo" para activar o desactivar todas las acciones de una página
                                para un rol específico.
                              </li>
                              <li>Puedes cambiar entre la vista de matriz y lista según tus preferencias.</li>
                              <li>Los permisos se aplican inmediatamente al hacer clic en los botones de acción.</li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <button
                            onClick={() => setShowHelp(false)}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-all hover:bg-opacity-90"
                          >
                            Entendido
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-black dark:text-white">
                        {selectedRole ? `Permisos para: ${selectedRole.name}` : "Matriz de Permisos"}
                      </h3>
                      {selectedRole && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{selectedRole.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowHelp(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                        title="Ayuda sobre permisos"
                      >
                        <HelpCircle size={16} />
                        <span className="hidden xs:inline">Ayuda</span>
                      </button>
                      {!isMobile && (
                        <>
                          <button
                            onClick={() => setViewMode("matrix")}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                              viewMode === "matrix"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                            }`}
                          >
                            <Grid size={16} />
                            <span className="hidden xs:inline">Matriz</span>
                          </button>
                          <button
                            onClick={() => setViewMode("list")}
                            className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                              viewMode === "list"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                            }`}
                          >
                            <List size={16} />
                            <span className="hidden xs:inline">Lista</span>
                          </button>
                        </>
                      )}
                      {selectedRole && (
                        <button
                          onClick={() => setSelectedRole(null)}
                          className="inline-flex items-center gap-2 rounded-lg border border-stroke px-3 py-1.5 text-sm font-medium text-black transition-all hover:bg-gray-100 dark:border-strokedark dark:text-white dark:hover:bg-meta-4"
                        >
                          <X size={16} />
                          <span className="hidden xs:inline">Limpiar</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Matrix View - Only show on desktop */}
                  {viewMode === "matrix" && !isMobile && (
                    <div className="overflow-x-auto rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <div className="min-w-max">
                        <div className="sticky top-0 z-10 grid grid-cols-[200px_repeat(auto-fill,minmax(120px,1fr))] bg-gray-50 dark:bg-meta-4">
                          <div className="border-b border-r border-stroke p-4 dark:border-strokedark">
                            <p className="font-medium text-black dark:text-white">Páginas / Roles</p>
                          </div>

                          {/* Role Headers */}
                          {(selectedRole ? [selectedRole] : activeRoles).map((role) => (
                            <div key={role._id} className="border-b border-r border-stroke p-4 dark:border-strokedark">
                              <div className="flex flex-col items-center justify-center text-center">
                                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                  <Shield className="text-primary" size={18} />
                                </span>
                                <p className="text-sm font-medium text-black dark:text-white">{role.name}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Page Rows */}
                        {activePages.map((page) => (
                          <div key={page._id} className="grid grid-cols-[200px_repeat(auto-fill,minmax(120px,1fr))]">
                            <div className="border-b border-r border-stroke p-4 dark:border-strokedark">
                              <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                  <FileCode className="text-primary" size={18} />
                                </span>
                                <div>
                                  <p className="text-sm font-medium text-black dark:text-white">{page.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{page.path}</p>
                                </div>
                              </div>
                            </div>

                            {/* Permission Cells */}
                            {(selectedRole ? [selectedRole] : activeRoles).map((role) => (
                              <div
                                key={`${role._id}-${page._id}`}
                                className="border-b border-r border-stroke p-4 dark:border-strokedark"
                              >
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <button
                                    onClick={() => toggleAllPermissions(role._id, page._id)}
                                    className={`mb-2 w-full rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
                                      permissionsMap[role._id]?.[page._id]?.length === availableActions.length
                                        ? "bg-success text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-meta-4 dark:text-gray-300"
                                    }`}
                                    title="Marcar/Desmarcar todas las acciones"
                                  >
                                    {permissionsMap[role._id]?.[page._id]?.length === availableActions.length
                                      ? "Desmarcar Todo"
                                      : "Marcar Todo"}
                                  </button>
                                  <div className="grid grid-cols-3 gap-2">
                                    {availableActions.map((action) => (
                                      <button
                                        key={action}
                                        onClick={() => togglePermission(role._id, page._id, action)}
                                        className={`flex h-8 w-8 items-center justify-center rounded-md transition-all ${
                                          hasPermission(role._id, page._id, action)
                                            ? "bg-success text-white"
                                            : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                                        }`}
                                        title={action.charAt(0).toUpperCase() + action.slice(1)}
                                      >
                                        {actionIcons[action]}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* List View - Default on mobile */}
                  {(viewMode === "list" || isMobile) && (
                    <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <div className="py-4 px-4 md:px-6 xl:px-7.5">
                        <h4 className="text-lg font-semibold text-black dark:text-white">
                          {selectedRole ? `Permisos para ${selectedRole.name}` : "Todos los Permisos"}
                        </h4>
                      </div>

                      <div className="hidden border-t border-stroke py-4.5 px-4 dark:border-strokedark md:grid md:grid-cols-7 md:px-6 xl:px-7.5">
                        <div className="col-span-2 flex items-center">
                          <p className="font-medium text-black dark:text-white">Página</p>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <p className="font-medium text-black dark:text-white">Rol</p>
                        </div>
                        <div className="col-span-3 flex items-center">
                          <p className="font-medium text-black dark:text-white">Acciones Permitidas</p>
                        </div>
                      </div>

                      {permissions
                        .filter(
                          (p) =>
                            !selectedRole ||
                            (typeof p.role === "string"
                              ? p.role === selectedRole._id
                              : p.role._id === selectedRole._id),
                        )
                        .map((permission) => {
                          const roleName =
                            typeof permission.role === "string"
                              ? roles.find((r) => r._id === permission.role)?.name || "Desconocido"
                              : permission.role.name

                          const pageName =
                            typeof permission.page === "string"
                              ? pages.find((p) => p._id === permission.page)?.name || "Desconocida"
                              : permission.page.name

                          const pageId = typeof permission.page === "string" ? permission.page : permission.page._id

                          const roleId = typeof permission.role === "string" ? permission.role : permission.role._id

                          return (
                            <div
                              key={permission._id}
                              className="border-t border-stroke py-4 px-4 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 md:grid md:grid-cols-7 md:px-6 xl:px-7.5"
                            >
                              {/* Mobile View */}
                              <div className="flex flex-col gap-3 md:hidden">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                      <FileCode className="text-primary" size={16} />
                                    </span>
                                    <p className="text-sm font-medium text-black dark:text-white">{pageName}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                      <Shield className="text-primary" size={16} />
                                    </span>
                                    <p className="text-sm font-medium text-black dark:text-white">{roleName}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    onClick={() => toggleAllPermissions(roleId, pageId)}
                                    className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                                      permission.actions.length === availableActions.length
                                        ? "bg-success text-white"
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-meta-4 dark:text-gray-300"
                                    }`}
                                    title="Marcar/Desmarcar todas las acciones"
                                  >
                                    {permission.actions.length === availableActions.length
                                      ? "Desmarcar Todo"
                                      : "Marcar Todo"}
                                  </button>
                                  {availableActions.map((action) => (
                                    <button
                                      key={action}
                                      onClick={() => togglePermission(roleId, pageId, action)}
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                                        permission.actions.includes(action)
                                          ? "bg-success text-white"
                                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                                      }`}
                                    >
                                      {actionIcons[action]}
                                      <span>{action.slice(0, 3).toUpperCase()}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Desktop View */}
                              <div className="col-span-2 hidden items-center md:flex">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                    <FileCode className="text-primary" size={20} />
                                  </span>
                                  <p className="text-sm font-medium text-black dark:text-white">{pageName}</p>
                                </div>
                              </div>
                              <div className="col-span-2 hidden items-center md:flex">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10">
                                    <Shield className="text-primary" size={20} />
                                  </span>
                                  <p className="text-sm font-medium text-black dark:text-white">{roleName}</p>
                                </div>
                              </div>
                              <div className="col-span-3 hidden flex-wrap items-center gap-2 md:flex">
                                <button
                                  onClick={() => toggleAllPermissions(roleId, pageId)}
                                  className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                                    permission.actions.length === availableActions.length
                                      ? "bg-success text-white"
                                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-meta-4 dark:text-gray-300"
                                  }`}
                                  title="Marcar/Desmarcar todas las acciones"
                                >
                                  {permission.actions.length === availableActions.length
                                    ? "Desmarcar Todo"
                                    : "Marcar Todo"}
                                </button>
                                {availableActions.map((action) => (
                                  <button
                                    key={action}
                                    onClick={() => togglePermission(roleId, pageId, action)}
                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${
                                      permission.actions.includes(action)
                                        ? "bg-success text-white"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"
                                    }`}
                                  >
                                    {actionIcons[action]}
                                    <span>{action.slice(0, 3).toUpperCase()}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}

                      {permissions.filter(
                        (p) =>
                          !selectedRole ||
                          (typeof p.role === "string" ? p.role === selectedRole._id : p.role._id === selectedRole._id),
                      ).length === 0 && (
                        <div className="border-t border-stroke py-8 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
                          <div className="flex flex-col items-center justify-center">
                            <AlertCircle className="mb-3 h-16 w-16 text-gray-400" />
                            <p className="text-center text-lg font-medium text-black dark:text-white">
                              No se encontraron permisos
                            </p>
                            <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                              {selectedRole
                                ? `No hay permisos asignados para el rol "${selectedRole.name}"`
                                : "No hay permisos configurados en el sistema"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legend */}
                  <div className="mt-6 rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <h4 className="mb-3 text-sm font-semibold text-black dark:text-white">Leyenda de Acciones</h4>
                    <div className="flex flex-wrap gap-4">
                      {availableActions.map((action) => (
                        <div key={action} className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-success text-white">
                            {actionIcons[action]}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

export default RoleManagement
