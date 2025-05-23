import React, { useState, useEffect } from "react"
import axios from "axios"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import {
  FileText,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  AlertCircle,
  X,
  Link as LinkIcon,
  FileCode,
  Grid,
  List,
  Settings,
  HelpCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import toast from 'react-hot-toast';
import { useMobile } from "../../hooks/use-mobile"

import CreateEditRoleModal from "../../components/RoleManagement/CreateEditRoleModal";
import RolesList from "../../components/RoleManagement/RolesList";
import CreateEditPageModal from "../../components/RoleManagement/CreateEditPageModal";
import PagesList from "../../components/RoleManagement/PagesList";
import PermissionsTabContent from "../../components/RoleManagement/PermissionsTabContent";
import ConfirmDeleteModal from "../../components/RoleManagement/ConfirmDeleteModal";
import PermissionsHelpModal from "../../components/RoleManagement/PermissionsHelpModal";

// Importar tipos desde el archivo centralizado
import {
  Role,
  Page,
  Permission,
  ActionType,
  actionIcons
} from "../../types/roleManagement";


const RoleManagement: React.FC = () => {
  const isMobile = useMobile()

  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [currentEditingRole, setCurrentEditingRole] = useState<Role | null>(null);

  const [pages, setPages] = useState<Page[]>([])
  const [showPageModal, setShowPageModal] = useState(false);
  const [currentEditingPage, setCurrentEditingPage] = useState<Page | null>(null);

  const [permissions, setPermissions] = useState<Permission[]>([])
  const [permissionsMap, setPermissionsMap] = useState<Record<string, Record<string, ActionType[]>>>({})
  const [viewMode, setViewMode] = useState<"matrix" | "list">("list")
  const [showHelp, setShowHelp] = useState(false)

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("roles")
  
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'role' | 'page' } | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActive, setFilterActive] = useState<boolean | null>(null)
  const [showPageInfo, setShowPageInfo] = useState<string | null>(null) 

  const availableActions = Object.values(ActionType)

  useEffect(() => {
    if (isMobile) setViewMode("list")
  }, [isMobile])

  useEffect(() => {
    fetchRoles()
    fetchPages()
    fetchAllPermissions()
  }, [])

  useEffect(() => {
    const map: Record<string, Record<string, ActionType[]>> = {}
    permissions.forEach((permission) => {
      const roleId = typeof permission.role === "string" ? permission.role : permission.role._id
      const pageId = typeof permission.page === "string" ? permission.page : permission.page._id
      if (!map[roleId]) map[roleId] = {}
      map[roleId][pageId] = permission.actions
    })
    setPermissionsMap(map)
  }, [permissions])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado para realizar esta acción")
        return
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/role`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) setRoles(response.data.data)
    } catch (error: any) {
      console.error("Error al cargar roles:", error)
      toast.error(error.response?.data?.message || "Error al cargar roles")
    } finally {
      setLoading(false)
    }
  }

  const fetchPages = async () => {
     try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado para realizar esta acción")
        return
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/page`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) setPages(response.data.data)
    } catch (error: any) {
      console.error("Error al cargar páginas:", error)
      toast.error(error.response?.data?.message || "Error al cargar páginas")
    } finally {
      setLoading(false)
    }
  }

  const fetchAllPermissions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado para realizar esta acción")
        return
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/permis`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) setPermissions(response.data.data)
    } catch (error: any) {
      console.error("Error al cargar permisos:", error)
      toast.error(error.response?.data?.message || "Error al cargar permisos")
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async (roleId: string) => {
     try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado para realizar esta acción")
        return
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/role/${roleId}/permissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) setPermissions(response.data.data)
    } catch (error: any) {
      console.error("Error al cargar permisos:", error)
      toast.error(error.response?.data?.message || "Error al cargar permisos")
    } finally {
      setLoading(false)
    }
  }
  
  const handleOpenCreateRoleModal = () => {
    setCurrentEditingRole(null);
    setShowRoleModal(true);
  };
  const handleOpenEditRoleModal = (role: Role) => {
    setCurrentEditingRole(role);
    setShowRoleModal(true);
  };
  const handleCloseRoleModal = () => {
    setShowRoleModal(false);
    setCurrentEditingRole(null);
  };
  const handleSaveRole = async (roleData: { name: string; description: string; isActive?: boolean; _id?: string }) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No está autorizado para realizar esta acción");
      setLoading(false);
      return;
    }
    try {
      if (roleData._id) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/role/${roleData._id}`,
          { name: roleData.name, description: roleData.description, isActive: roleData.isActive },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success("Rol actualizado exitosamente");
          fetchRoles();
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/role`,
          { name: roleData.name, description: roleData.description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success("Rol creado exitosamente");
          fetchRoles();
        }
      }
      handleCloseRoleModal();
    } catch (error: any) {
      console.error("Error al guardar rol:", error);
      toast.error(error.response?.data?.message || "Error al guardar rol");
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado para realizar esta acción")
        return
      }
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/role/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        toast.success("Rol eliminado exitosamente")
        setSelectedRole(null) 
        fetchRoles()
        fetchAllPermissions() 
      }
    } catch (error: any) {
      console.error("Error al eliminar rol:", error)
      toast.error(error.response?.data?.message || "Error al eliminar rol")
    } finally {
      setLoading(false)
      setConfirmDelete(null) 
    }
  }

  const handleOpenCreatePageModal = () => {
    setCurrentEditingPage(null);
    setShowPageModal(true);
  };
  const handleOpenEditPageModal = (page: Page) => {
    setCurrentEditingPage(page);
    setShowPageModal(true);
  };
  const handleClosePageModal = () => {
    setShowPageModal(false);
    setCurrentEditingPage(null);
  };
  const handleSavePage = async (pageData: { name: string; path: string; description: string; isActive?: boolean; _id?: string }) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No está autorizado para realizar esta acción");
      setLoading(false);
      return;
    }
    try {
      if (pageData._id) {
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/page/${pageData._id}`,
          { name: pageData.name, path: pageData.path, description: pageData.description, isActive: pageData.isActive },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success("Página actualizada exitosamente");
          fetchPages();
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/page`,
          { name: pageData.name, path: pageData.path, description: pageData.description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success("Página creada exitosamente");
          fetchPages();
        }
      }
      handleClosePageModal();
    } catch (error: any) {
      console.error("Error al guardar página:", error);
      toast.error(error.response?.data?.message || "Error al guardar página");
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado para realizar esta acción")
        return
      }
      const response = await axios.delete(`${import.meta.env.VITE_API_URL}/page/${pageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        toast.success("Página eliminada exitosamente")
        fetchPages()
        fetchAllPermissions() 
      }
    } catch (error: any) {
      console.error("Error al eliminar página:", error)
      toast.error(error.response?.data?.message || "Error al eliminar página")
    } finally {
      setLoading(false)
      setConfirmDelete(null)
    }
  }

  const setPermission = async (roleId: string, pageId: string, actions: ActionType[]) => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado para realizar esta acción")
        return
      }
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/permis`,
        { roleId, pageId, actions },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (response.data.success) {
        toast.success("Permisos establecidos exitosamente")
        fetchAllPermissions() 
      }
    } catch (error: any) {
      console.error("Error al establecer permisos:", error)
      toast.error(error.response?.data?.message || "Error al establecer permisos")
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (roleId: string, pageId: string, action: ActionType) => {
    const currentActions = permissionsMap[roleId]?.[pageId] || []
    let newActions: ActionType[]
    if (currentActions.includes(action)) newActions = currentActions.filter((a) => a !== action)
    else newActions = [...currentActions, action]
    setPermission(roleId, pageId, newActions)
  }

  const toggleAllPermissions = (roleId: string, pageId: string) => {
    const currentActions = permissionsMap[roleId]?.[pageId] || []
    let newActions: ActionType[]
    if (currentActions.length === availableActions.length) newActions = []
    else newActions = [...availableActions]
    setPermission(roleId, pageId, newActions)
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setActiveTab("permissions")
    fetchPermissions(role._id) 
  }

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterActive === null) return matchesSearch
    return matchesSearch && role.isActive === filterActive
  })

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterActive === null) return matchesSearch
    return matchesSearch && page.isActive === filterActive
  })

  const hasPermission = (roleId: string, pageId: string, action: ActionType): boolean => {
    return permissionsMap[roleId]?.[pageId]?.includes(action) || false
  }

  const activeRoles = roles.filter((role) => role.isActive)
  const activePages = pages.filter((page) => page.isActive)

  useEffect(() => {
    if (activeTab === "permissions" && !selectedRole) {
      setActiveTab("roles")
      toast.error("Primero seleccione un rol para gestionar sus permisos")
    }
  }, [activeTab, selectedRole])


  return (
    <>
      <Breadcrumb pageName="Gestión de Roles y Permisos" />
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-1">
        <div className="flex flex-col gap-9">
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
                      toast.error("Primero seleccione un rol para gestionar sus permisos")
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

              {activeTab === "roles" && (
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-black dark:text-white">Gestión de Roles</h3>
                    <button
                      onClick={handleOpenCreateRoleModal}
                      className="inline-flex items-center gap-2 rounded-lg bg-success px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-opacity-90"
                    >
                      <Plus size={16} />
                      <span className="hidden xs:inline">Nuevo Rol</span>
                    </button>
                  </div>
                  
                  <CreateEditRoleModal
                    show={showRoleModal}
                    onClose={handleCloseRoleModal}
                    onSave={handleSaveRole}
                    roleToEdit={currentEditingRole}
                    loading={loading}
                  />

                  <RolesList
                    roles={filteredRoles}
                    onEdit={handleOpenEditRoleModal}
                    onDelete={(roleId) => setConfirmDelete({ id: roleId, type: 'role' })}
                    onSelectRoleForPermissions={handleRoleSelect}
                  />
                </div>
              )}

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
                      onClick={handleOpenCreatePageModal}
                      className="inline-flex items-center gap-2 rounded-lg bg-success px-3 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-opacity-90"
                    >
                      <Plus size={16} />
                      <span className="hidden xs:inline">Nueva Página</span>
                    </button>
                  </div>
                
                  <CreateEditPageModal
                    show={showPageModal}
                    onClose={handleClosePageModal}
                    onSave={handleSavePage}
                    pageToEdit={currentEditingPage}
                    loading={loading}
                  />

                  <PagesList
                    pages={filteredPages}
                    onEdit={handleOpenEditPageModal}
                    onDelete={(pageId) => setConfirmDelete({ id: pageId, type: 'page' })}
                    onShowInfo={setShowPageInfo}
                  />

                  {/* Page Info Modal (aún se maneja aquí) */}
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
                </div>
              )}

              {activeTab === "permissions" && (
                 <div>
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

                  {viewMode === "matrix" && !isMobile && (
                    <div className="overflow-x-auto rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <div className="min-w-max">
                        <div className="sticky top-0 z-10 grid grid-cols-[200px_repeat(auto-fill,minmax(120px,1fr))] bg-gray-50 dark:bg-meta-4">
                          <div className="border-b border-r border-stroke p-4 dark:border-strokedark">
                            <p className="font-medium text-black dark:text-white">Páginas / Roles</p>
                          </div>
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
                          const roleName = typeof permission.role === "string" ? roles.find((r) => r._id === permission.role)?.name || "Desconocido" : permission.role.name;
                          const pageName = typeof permission.page === "string" ? pages.find((pg) => pg._id === permission.page)?.name || "Desconocida" : permission.page.name;
                          const pageId = typeof permission.page === "string" ? permission.page : permission.page._id;
                          const roleId = typeof permission.role === "string" ? permission.role : permission.role._id;

                          return (
                            <div
                              key={permission._id}
                              className="border-t border-stroke py-4 px-4 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 md:grid md:grid-cols-7 md:px-6 xl:px-7.5"
                            >
                              <div className="flex flex-col gap-3 md:hidden">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10"><FileCode className="text-primary" size={16} /></span>
                                    <p className="text-sm font-medium text-black dark:text-white">{pageName}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary bg-opacity-10"><Shield className="text-primary" size={16} /></span>
                                    <p className="text-sm font-medium text-black dark:text-white">{roleName}</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <button onClick={() => toggleAllPermissions(roleId, pageId)} className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${ permission.actions.length === availableActions.length ? "bg-success text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-meta-4 dark:text-gray-300"}`} title="Marcar/Desmarcar todas las acciones">
                                    {permission.actions.length === availableActions.length ? "Desmarcar Todo" : "Marcar Todo"}
                                  </button>
                                  {availableActions.map((action) => (
                                    <button key={action} onClick={() => togglePermission(roleId, pageId, action)} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${permission.actions.includes(action) ? "bg-success text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"}`}>
                                      {actionIcons[action]}
                                      <span>{action.slice(0, 3).toUpperCase()}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div className="col-span-2 hidden items-center md:flex">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10"><FileCode className="text-primary" size={20} /></span>
                                  <p className="text-sm font-medium text-black dark:text-white">{pageName}</p>
                                </div>
                              </div>
                              <div className="col-span-2 hidden items-center md:flex">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary bg-opacity-10"><Shield className="text-primary" size={20} /></span>
                                  <p className="text-sm font-medium text-black dark:text-white">{roleName}</p>
                                </div>
                              </div>
                              <div className="col-span-3 hidden flex-wrap items-center gap-2 md:flex">
                                <button onClick={() => toggleAllPermissions(roleId, pageId)} className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${permission.actions.length === availableActions.length ? "bg-success text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-meta-4 dark:text-gray-300"}`} title="Marcar/Desmarcar todas las acciones">
                                  {permission.actions.length === availableActions.length ? "Desmarcar Todo" : "Marcar Todo"}
                                </button>
                                {availableActions.map((action) => (
                                  <button key={action} onClick={() => togglePermission(roleId, pageId, action)} className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all ${permission.actions.includes(action) ? "bg-success text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-400"}`}>
                                    {actionIcons[action]}
                                    <span>{action.slice(0, 3).toUpperCase()}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      {permissions.filter((p) => !selectedRole || (typeof p.role === "string" ? p.role === selectedRole._id : p.role._id === selectedRole._id)).length === 0 && (
                        <div className="border-t border-stroke py-8 px-4 dark:border-strokedark md:px-6 xl:px-7.5">
                          <div className="flex flex-col items-center justify-center">
                            <AlertCircle className="mb-3 h-16 w-16 text-gray-400" />
                            <p className="text-center text-lg font-medium text-black dark:text-white">No se encontraron permisos</p>
                            <p className="mt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                              {selectedRole ? `No hay permisos asignados para el rol "${selectedRole.name}"` : "No hay permisos configurados en el sistema"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-6 rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                    <h4 className="mb-3 text-sm font-semibold text-black dark:text-white">Leyenda de Acciones</h4>
                    <div className="flex flex-wrap gap-4">
                      {availableActions.map((action) => (
                        <div key={action} className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-success text-white">{actionIcons[action]}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{action.charAt(0).toUpperCase() + action.slice(1)}</span>
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
    </>
  )
}

export default RoleManagement;

[end of frontEnd/src/pages/Authentication/RoleManagement.tsx]

[end of frontEnd/src/pages/Authentication/RoleManagement.tsx]
