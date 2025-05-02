import type React from "react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import { useToast } from "../../hooks/useToast"
import ToastContainer from "../../components/ToastContainer"
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import StatusBadge from "../../components/StatusBadge"
import {
  UserPlus,
  Search,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  Lock,
  UserCog,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Mail,
  User,
  Users,
  Shield,
  Key,
} from "lucide-react"

// Importar el hook useMobile
import { useMobile } from "../../hooks/use-mobile"

interface UserInterface {
  _id: string
  username: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  roles: Role[]
}

interface Role {
  _id: string
  name: string
  description: string
}

interface FilterState {
  search: string
  status: string
  role: string
}

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  username: string
  roles: string[]
}

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserInterface[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserInterface[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean
    userId: string
    isActive: boolean
    username: string
  } | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    role: "all",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>(null)
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [showFilters, setShowFilters] = useState(true)

  // User edit state
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [userFormData, setUserFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    roles: [],
  })
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Toast system
  const { toasts, success: showSuccess, error: showError, removeToast } = useToast()

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Añadir el hook dentro del componente UserManagement, justo después de las declaraciones de estado
  const isMobile = useMobile()

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
    fetchRoles()

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    }
  }, [])

  // Apply filters when users or filter state changes
  useEffect(() => {
    applyFilters()
  }, [users, filters])

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/role`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setAllRoles(response.data.data)
      }
    } catch (error) {
      console.error("Error al cargar roles:", error)
      showError("Error al cargar roles")
    }
  }

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No está autorizado")
        showError("No está autorizado")
        return
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setUsers(response.data.data)
        setFilteredUsers(response.data.data)
      }
    } catch (error: any) {
      console.error("Error al cargar usuarios:", error)
      const errorMsg = error.response?.data?.message || "Error al cargar usuarios"
      setError(errorMsg)
      showError(errorMsg)

      // Clear error message after 5 seconds
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = setTimeout(() => setError(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters to users
  const applyFilters = () => {
    let result = [...users]

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower),
      )
    }

    // Apply status filter
    if (filters.status !== "all") {
      const isActive = filters.status === "active"
      result = result.filter((user) => user.isActive === isActive)
    }

    // Apply role filter
    if (filters.role !== "all") {
      result = result.filter((user) => user.roles.some((role) => role._id === filters.role))
    }

    // Apply sorting if configured
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue, bValue

        switch (sortConfig.key) {
          case "username":
            aValue = a.username.toLowerCase()
            bValue = b.username.toLowerCase()
            break
          case "name":
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase()
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase()
            break
          case "email":
            aValue = a.email.toLowerCase()
            bValue = b.email.toLowerCase()
            break
          case "status":
            aValue = a.isActive ? 1 : 0
            bValue = b.isActive ? 1 : 0
            break
          default:
            aValue = a[sortConfig.key as keyof UserInterface]
            bValue = b[sortConfig.key as keyof UserInterface]
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    setFilteredUsers(result)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }))
    }, 300)
  }

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  // Handle column sorting
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }

    setSortConfig({ key, direction })
  }

  // Get sort direction indicator
  const getSortDirectionIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null
    }

    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="inline ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="inline ml-1 h-4 w-4" />
    )
  }

  // Show confirmation dialog
  const showConfirmation = (userId: string, isActive: boolean, username: string) => {
    setConfirmAction({
      show: true,
      userId,
      isActive,
      username,
    })
  }

  // Cancel confirmation
  const cancelConfirmation = () => {
    setConfirmAction(null)
  }

  // Activate/Deactivate user
  const toggleUserStatus = async (userId: string, isActive: boolean, username: string) => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")
      setConfirmAction(null)

      const token = localStorage.getItem("token")

      if (!token) {
        setError("No está autorizado")
        showError("No está autorizado")
        return
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/${userId}`,
        {
          isActive: !isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        const successMsg = `Usuario ${username} ${isActive ? "desactivado" : "activado"} exitosamente`
        setSuccess(successMsg)
        showSuccess(successMsg)

        // Clear success message after 5 seconds
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
        successTimeoutRef.current = setTimeout(() => setSuccess(""), 5000)

        fetchUsers()
      }
    } catch (error: any) {
      console.error("Error al cambiar estado del usuario:", error)
      const errorMsg = error.response?.data?.message || "Error al cambiar estado del usuario"
      setError(errorMsg)
      showError(errorMsg)

      // Clear error message after 5 seconds
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      errorTimeoutRef.current = setTimeout(() => setError(""), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Open edit user modal
  const openEditModal = (user: UserInterface) => {
    setSelectedUser(user)
    setUserFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      roles: user.roles.map((role) => role._id),
    })
    setFormErrors({})
    setShowEditModal(true)
  }

  // Open password modal
  const openPasswordModal = (user: UserInterface) => {
    setSelectedUser(user)
    setPasswordFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
    setFormErrors({})
    setShowPasswordModal(true)
  }

  // Add a new function to open the details modal
  const openDetailsModal = (user: UserInterface) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  // Handle user form input changes
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name === "roles") {
      const select = e.target as HTMLSelectElement
      const selectedOptions = Array.from(select.selectedOptions).map((option) => option.value)
      setUserFormData((prev) => ({
        ...prev,
        roles: selectedOptions,
      }))
    } else {
      setUserFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Handle password form input changes
  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate user form
  const validateUserForm = () => {
    const errors: Record<string, string> = {}

    if (!userFormData.firstName.trim()) {
      errors.firstName = "El nombre es requerido"
    }

    if (!userFormData.lastName.trim()) {
      errors.lastName = "El apellido es requerido"
    }

    if (!userFormData.email.trim()) {
      errors.email = "El correo es requerido"
    } else if (!/\S+@\S+\.\S+/.test(userFormData.email)) {
      errors.email = "El correo no es válido"
    }

    if (!userFormData.username.trim()) {
      errors.username = "El nombre de usuario es requerido"
    }

    if (userFormData.roles.length === 0) {
      errors.roles = "Debe seleccionar al menos un rol"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validate password form
  const validatePasswordForm = () => {
    const errors: Record<string, string> = {}

    if (!passwordFormData.currentPassword) {
      errors.currentPassword = "La contraseña actual es requerida"
    }

    if (!passwordFormData.newPassword) {
      errors.newPassword = "La nueva contraseña es requerida"
    } else if (passwordFormData.newPassword.length < 8) {
      errors.newPassword = "La contraseña debe tener al menos 8 caracteres"
    }

    if (!passwordFormData.confirmPassword) {
      errors.confirmPassword = "Debe confirmar la nueva contraseña"
    } else if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submit user form
  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateUserForm() || !selectedUser) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        showError("No está autorizado")
        return
      }

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/user/${selectedUser._id}`, userFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        showSuccess("Usuario actualizado exitosamente")
        setShowEditModal(false)
        fetchUsers()
      }
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error)
      const errorMsg = error.response?.data?.message || "Error al actualizar usuario"
      showError(errorMsg)

      // If there are validation errors from the server
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors)
      }
    } finally {
      setLoading(false)
    }
  }

  // Submit password form
  const handlePasswordFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm() || !selectedUser) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        showError("No está autorizado")
        return
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/${selectedUser._id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordFormData.currentPassword,
            newPassword: passwordFormData.newPassword,
          }),
        }
      )

      const data = await response.json()

      if (data.success) {
        showSuccess("Contraseña actualizada exitosamente")
        setShowPasswordModal(false)
      } else {
        showError(data.message || "Error al actualizar contraseña")
        if (data.errors) {
          setFormErrors(data.errors)
        }
      }
    } catch (error) {
      showError("Error de red al actualizar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      role: "all",
    })
    // Reset any input fields
    const searchInput = document.getElementById("search") as HTMLInputElement
    if (searchInput) searchInput.value = ""
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  return (
    <>
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} position="top-right" />

      <Breadcrumb pageName="Gestión de Usuarios" />

      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col gap-6">
          {/* Users List */}
          <div className="rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark overflow-hidden">
            {/* Modificar la sección de encabezado para hacerla responsiva */}
            <div className="py-6 px-4 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stroke dark:border-strokedark">
              <h4 className="text-xl font-semibold text-black dark:text-white flex items-center">
                <UserCog className="mr-2 h-6 w-6" />
                Usuarios del Sistema
              </h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center justify-center rounded-md bg-gray-100 py-2 px-4 text-center font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  <Filter className="mr-2 h-5 w-5" />
                  {isMobile ? "" : showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
                </button>
                <button
                  onClick={fetchUsers}
                  className="inline-flex items-center justify-center rounded-md bg-blue-100 py-2 px-4 text-center font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-all"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  {isMobile ? "" : "Actualizar"}
                </button>
                <Link
                  to="/auth/signup"
                  className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 transition-all shadow-sm"
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  {isMobile ? "" : "Nuevo Usuario"}
                </Link>
              </div>
            </div>

            {error && (
              <div className="mx-6 mt-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mx-6 mt-4 rounded-lg bg-green-100 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Modificar la sección de filtros para hacerla responsiva */}
            {showFilters && (
              <div className="m-4 md:m-6 p-4 md:p-5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-stroke dark:border-strokedark">
                <div className="flex flex-col md:flex-row flex-wrap gap-4 items-start md:items-end">
                  <div className="w-full md:flex-1 md:min-w-[200px]">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Buscar
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="search"
                        placeholder="Buscar por nombre, usuario o email..."
                        onChange={handleSearchChange}
                        className="w-full rounded-lg border border-stroke bg-white py-3 pl-11 pr-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="w-full md:w-48">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full rounded-lg border border-stroke bg-white py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary appearance-none"
                    >
                      <option value="all">Todos</option>
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                    </select>
                  </div>

                  <div className="w-full md:w-48">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rol
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={filters.role}
                      onChange={handleFilterChange}
                      className="w-full rounded-lg border border-stroke bg-white py-3 px-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary appearance-none"
                    >
                      <option value="all">Todos</option>
                      {allRoles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={resetFilters}
                    className="w-full md:w-auto py-3 px-4 rounded-lg border border-stroke bg-white text-gray-500 hover:bg-gray-50 dark:border-form-strokedark dark:bg-form-input dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}

            {/* Modificar la sección de la tabla para hacerla responsiva */}
            <div className="hidden md:grid md:grid-cols-12 border-t border-stroke py-4.5 px-4 md:px-6 dark:border-strokedark text-sm font-medium bg-gray-50 dark:bg-gray-800">
              <div className="col-span-2 flex items-center cursor-pointer" onClick={() => requestSort("username")}>
                <p className="font-medium">Usuario {getSortDirectionIndicator("username")}</p>
              </div>
              <div className="col-span-3 flex items-center cursor-pointer" onClick={() => requestSort("name")}>
                <p className="font-medium">Nombre Completo {getSortDirectionIndicator("name")}</p>
              </div>
              <div className="col-span-3 flex items-center cursor-pointer" onClick={() => requestSort("email")}>
                <p className="font-medium">Correo {getSortDirectionIndicator("email")}</p>
              </div>
              <div className="col-span-2 flex items-center cursor-pointer" onClick={() => requestSort("status")}>
                <p className="font-medium">Estado {getSortDirectionIndicator("status")}</p>
              </div>
              <div className="col-span-2 flex items-center">
                <p className="font-medium">Acciones</p>
              </div>
            </div>

            {/* Confirmation Modal */}
            {/* Para el modal de confirmación: */}
            {confirmAction && confirmAction.show && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-boxdark shadow-xl">
                  <div className="flex items-center mb-4">
                    {confirmAction.isActive ? (
                      <XCircle className="h-8 w-8 text-red-500 mr-3" />
                    ) : (
                      <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
                    )}
                    <h3 className="text-xl font-semibold text-black dark:text-white">Confirmar acción</h3>
                  </div>
                  <p className="mb-6 text-gray-600 dark:text-gray-300">
                    ¿Estás seguro que deseas {confirmAction.isActive ? "desactivar" : "activar"} al usuario{" "}
                    <span className="font-semibold text-black dark:text-white">{confirmAction.username}</span>?
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={cancelConfirmation}
                      className="rounded-md bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() =>
                        toggleUserStatus(confirmAction.userId, confirmAction.isActive, confirmAction.username)
                      }
                      className={`rounded-md py-2 px-4 text-sm font-medium text-white transition-all ${
                        confirmAction.isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {/* Modificar los modales para hacerlos responsivos */}
            {showEditModal && selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
                <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-boxdark shadow-2xl max-h-[90vh] overflow-y-auto my-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-t-xl p-6 border-b border-stroke dark:border-strokedark">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-black dark:text-white flex items-center">
                        <Edit className="h-5 w-5 mr-2 text-primary" />
                        Editar Usuario
                      </h3>
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Modificando información de:{" "}
                      <span className="font-medium text-primary">{selectedUser.username}</span>
                    </p>
                  </div>

                  <form onSubmit={handleUserFormSubmit} className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          <User className="h-4 w-4 inline mr-1" /> Nombre
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={userFormData.firstName}
                          onChange={handleUserFormChange}
                          placeholder="Nombre"
                          className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        {formErrors.firstName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" /> {formErrors.firstName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          <User className="h-4 w-4 inline mr-1" /> Apellido
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={userFormData.lastName}
                          onChange={handleUserFormChange}
                          placeholder="Apellido"
                          className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        {formErrors.lastName && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" /> {formErrors.lastName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="username"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          <UserCog className="h-4 w-4 inline mr-1" /> Nombre de Usuario
                        </label>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={userFormData.username}
                          onChange={handleUserFormChange}
                          placeholder="Nombre de usuario"
                          className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        {formErrors.username && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" /> {formErrors.username}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Mail className="h-4 w-4 inline mr-1" /> Correo Electrónico
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={userFormData.email}
                          onChange={handleUserFormChange}
                          placeholder="Correo electrónico"
                          className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                        {formErrors.email && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" /> {formErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label htmlFor="roles" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          <Shield className="h-4 w-4 inline mr-1" /> Roles
                        </label>
                        <select
                          id="roles"
                          name="roles"
                          multiple
                          value={userFormData.roles}
                          onChange={handleUserFormChange}
                          className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                          size={4}
                        >
                          {allRoles.map((role) => (
                            <option key={role._id} value={role._id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-500">
                          <Users className="h-4 w-4 inline mr-1" /> Mantén presionado Ctrl (o Cmd en Mac) para
                          seleccionar múltiples roles
                        </p>
                        {formErrors.roles && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" /> {formErrors.roles}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-stroke dark:border-strokedark">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="rounded-lg bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false)
                          openPasswordModal(selectedUser)
                        }}
                        className="rounded-lg bg-amber-500 py-2 px-4 text-sm font-medium text-white hover:bg-amber-600 transition-all flex items-center"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70 transition-all flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Guardando..." : "Guardar Cambios"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Password Modal */}
            {/* Modificar los modales para hacerlos responsivos */}
            {showPasswordModal && selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="w-full max-w-md rounded-xl bg-white dark:bg-boxdark shadow-2xl">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-t-xl p-6 border-b border-stroke dark:border-strokedark">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-black dark:text-white flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-amber-500" />
                        Cambiar Contraseña
                      </h3>
                      <button
                        onClick={() => setShowPasswordModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                      Usuario: <span className="font-medium text-primary">{selectedUser.username}</span>
                    </p>
                  </div>

                  <form onSubmit={handlePasswordFormSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <Key className="h-4 w-4 inline mr-1" /> Contraseña Actual
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordFormData.currentPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="Ingresa la contraseña actual"
                        className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      {formErrors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> {formErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <Key className="h-4 w-4 inline mr-1" /> Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordFormData.newPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="Ingresa la nueva contraseña"
                        className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      {formErrors.newPassword && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> {formErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        <Key className="h-4 w-4 inline mr-1" /> Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordFormData.confirmPassword}
                        onChange={handlePasswordFormChange}
                        placeholder="Confirma la nueva contraseña"
                        className="w-full rounded-lg border border-stroke bg-white py-3 px-4 text-black outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                      {formErrors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <XCircle className="h-4 w-4 mr-1" /> {formErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-stroke dark:border-strokedark">
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(false)}
                        className="rounded-lg bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-70 transition-all flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Actualizando..." : "Actualizar Contraseña"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* User Details Modal */}
            {/* Modificar los modales para hacerlos responsivos */}
            {showDetailsModal && selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="w-full max-w-2xl rounded-xl bg-white dark:bg-boxdark shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-t-xl p-4 sm:p-6 border-b border-stroke dark:border-strokedark">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-semibold text-black dark:text-white flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-indigo-500" />
                        Detalles del Usuario
                      </h3>
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <X className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    {/* Contenido principal - Diseño responsive */}
                    <div className="flex flex-col gap-6">
                      {/* Sección superior - Avatar y estado */}
                      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2 sm:mb-0">
                          <User className="h-12 w-12 sm:h-14 sm:w-14 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="flex flex-col items-center sm:items-start gap-2">
                          <h4 className="text-xl font-semibold text-black dark:text-white text-center sm:text-left">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </h4>
                          <p className="text-gray-500 dark:text-gray-400 text-center sm:text-left">
                            @{selectedUser.username}
                          </p>
                          <StatusBadge status={selectedUser.isActive ? "Activo" : "Inactivo"} />
                        </div>
                      </div>

                      {/* Línea divisoria */}
                      <div className="border-t border-stroke dark:border-strokedark my-1"></div>

                      {/* Información del usuario - Grid responsive */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre de Usuario</p>
                          <p className="text-sm font-medium text-black dark:text-white flex items-center">
                            <UserCog className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                            <span className="truncate">{selectedUser.username}</span>
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Correo Electrónico</p>
                          <p className="text-sm font-medium text-black dark:text-white flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                            <span className="truncate">{selectedUser.email}</span>
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre Completo</p>
                          <p className="text-sm font-medium text-black dark:text-white flex items-center">
                            <User className="h-4 w-4 mr-2 text-primary flex-shrink-0" />
                            <span className="truncate">
                              {selectedUser.firstName} {selectedUser.lastName}
                            </span>
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">ID de Usuario</p>
                          <p className="text-sm font-medium text-black dark:text-white flex items-center">
                            <span className="truncate">{selectedUser._id}</span>
                          </p>
                        </div>
                      </div>

                      {/* Roles */}
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Roles Asignados</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.roles.length > 0 ? (
                            selectedUser.roles.map((role) => (
                              <span
                                key={role._id}
                                className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium dark:bg-indigo-900/30 dark:text-indigo-300 flex items-center"
                              >
                                <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                                {role.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-sm">No tiene roles asignados</span>
                          )}
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
                        <button
                          type="button"
                          onClick={() => setShowDetailsModal(false)}
                          className="rounded-lg bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-all flex items-center justify-center"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cerrar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDetailsModal(false)
                            openEditModal(selectedUser)
                          }}
                          className="rounded-lg bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 transition-all flex items-center justify-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Usuario
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Table Body */}
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
              </div>
            ) : currentItems.length > 0 ? (
              <>
                {/* Reemplazar cada fila de usuario con esta versión responsiva: */}
                {currentItems.map((user) => (
                  <div
                    key={user._id}
                    className="border-t border-stroke py-4 px-4 md:px-6 hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4 transition-colors"
                  >
                    {/* Vista móvil - Tarjeta */}
                    <div className="md:hidden flex flex-col space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-black dark:text-white">{user.username}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                        <StatusBadge status={user.isActive ? "Activo" : "Inactivo"} />
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </p>

                      <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => showConfirmation(user._id, user.isActive, user.username)}
                          className={`p-2 rounded-md ${
                            user.isActive
                              ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                          } transition-colors`}
                          title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {user.isActive ? <Trash2 className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="p-2 rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Cambiar contraseña"
                        >
                          <Lock className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDetailsModal(user)}
                          className="p-2 rounded-md text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Vista desktop - Grid */}
                    <div className="hidden md:grid md:grid-cols-12">
                      <div className="col-span-2 flex items-center">
                        <p className="text-sm text-black dark:text-white">{user.username}</p>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <p className="text-sm text-black dark:text-white">
                          {user.firstName} {user.lastName}
                        </p>
                      </div>
                      <div className="col-span-3 flex items-center">
                        <p className="text-sm text-black dark:text-white">{user.email}</p>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <StatusBadge status={user.isActive ? "Activo" : "Inactivo"} />
                      </div>
                      <div className="col-span-2 flex items-center space-x-3">
                        <button
                          onClick={() => showConfirmation(user._id, user.isActive, user.username)}
                          className={`p-1.5 rounded-md ${
                            user.isActive
                              ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                          } transition-colors`}
                          title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                        >
                          {user.isActive ? <Trash2 className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Editar usuario"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="p-1.5 rounded-md text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                          title="Cambiar contraseña"
                        >
                          <Lock className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDetailsModal(user)}
                          className="p-1.5 rounded-md text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Modificar la paginación para hacerla responsiva */}
                <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between border-t border-stroke py-4 px-4 md:px-6 dark:border-strokedark">
                  <div className="mb-4 md:mb-0 flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {isMobile
                        ? `${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredUsers.length)}/${filteredUsers.length}`
                        : `Mostrando ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredUsers.length)} de ${filteredUsers.length} usuarios`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${
                        currentPage === 1
                          ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* Page Numbers - Simplified for mobile */}
                    {isMobile ? (
                      <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-primary text-white">
                        {currentPage}
                      </span>
                    ) : (
                      Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
                        // Show first page, last page, current page, and pages around current page
                        if (
                          number === 1 ||
                          number === totalPages ||
                          (number >= currentPage - 1 && number <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                                currentPage === number
                                  ? "bg-primary text-white"
                                  : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                              }`}
                            >
                              {number}
                            </button>
                          )
                        }

                        // Show ellipsis
                        if (
                          (number === 2 && currentPage > 3) ||
                          (number === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                          return (
                            <span
                              key={number}
                              className="flex h-8 w-8 items-center justify-center text-gray-600 dark:text-gray-300"
                            >
                              ...
                            </span>
                          )
                        }

                        return null
                      })
                    )}

                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`flex h-8 w-8 items-center justify-center rounded-md ${
                        currentPage === totalPages
                          ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default UserManagement
