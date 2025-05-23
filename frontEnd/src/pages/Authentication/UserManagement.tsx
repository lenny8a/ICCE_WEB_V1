import React, { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Link } from "react-router-dom"
import toast from 'react-hot-toast'
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb"
import { useMobile } from "../../hooks/use-mobile"

// Importar componentes de UserManagement
import UserFilters from "../../components/UserManagement/UserFilters"
import UsersTable from "../../components/UserManagement/UsersTable"
import UserPagination from "../../components/UserManagement/UserPagination"
import ConfirmActionModal from "../../components/UserManagement/ConfirmActionModal"
import EditUserModal from "../../components/UserManagement/EditUserModal"
import ChangePasswordModal from "../../components/UserManagement/ChangePasswordModal"
import UserDetailsModal from "../../components/UserManagement/UserDetailsModal"

import {
  UserPlus,
  Filter,
  RefreshCw,
  UserCog,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

// Definición de Interfaces (pueden moverse a un archivo types.ts más tarde)
export interface UserInterface {
  _id: string
  username: string
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  roles: Role[]
}

export interface Role {
  _id: string
  name: string
  description: string
}

interface FilterState {
  search: string
  status: string
  role: string
}

export interface UserFormData {
  firstName: string
  lastName: string
  email: string
  username: string
  roles: string[]
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
// Fin Definición de Interfaces

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserInterface[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserInterface[]>([])
  const [loading, setLoading] = useState(false)
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

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMobile = useMobile()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, filters, sortConfig]) // Añadir sortConfig a las dependencias

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/role`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) setAllRoles(response.data.data)
    } catch (error) {
      console.error("Error al cargar roles:", error)
      toast.error("Error al cargar roles")
    }
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado")
        setLoading(false)
        return
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        setUsers(response.data.data)
        // setFilteredUsers(response.data.data); // No establecer aquí, dejar que applyFilters lo haga
      }
    } catch (error: any) {
      console.error("Error al cargar usuarios:", error)
      toast.error(error.response?.data?.message || "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...users]
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
    if (filters.status !== "all") {
      const isActive = filters.status === "active"
      result = result.filter((user) => user.isActive === isActive)
    }
    if (filters.role !== "all") {
      result = result.filter((user) => user.roles.some((role) => role._id === filters.role))
    }

    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof UserInterface];
        let bValue: any = b[sortConfig.key as keyof UserInterface];

        if (sortConfig.key === 'name') {
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
        }
        if (typeof bValue === 'string') {
            bValue = bValue.toLowerCase();
        }
        if (sortConfig.key === 'status') {
            aValue = a.isActive ? 1 : 0;
            bValue = b.isActive ? 1 : 0;
        }


        if (aValue < bValue) return sortConfig.direction === "ascending" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "ascending" ? 1 : -1
        return 0
      })
    }
    setFilteredUsers(result)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }))
    }, 300)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  const getSortDirectionIndicator = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return null
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="inline ml-1 h-4 w-4" />
    ) : (
      <ChevronDown className="inline ml-1 h-4 w-4" />
    )
  }

  const showConfirmation = (userId: string, isActive: boolean, username: string) => {
    setConfirmAction({ show: true, userId, isActive, username })
  }

  const cancelConfirmation = () => setConfirmAction(null)

  const toggleUserStatus = async (userId: string, isActive: boolean, username: string) => {
    try {
      setLoading(true)
      setConfirmAction(null)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado")
        setLoading(false)
        return
      }
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/${userId}`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (response.data.success) {
        toast.success(`Usuario ${username} ${isActive ? "desactivado" : "activado"} exitosamente`)
        fetchUsers()
      }
    } catch (error: any) {
      console.error("Error al cambiar estado del usuario:", error)
      toast.error(error.response?.data?.message || "Error al cambiar estado del usuario")
    } finally {
      setLoading(false)
    }
  }

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

  const openPasswordModal = (user: UserInterface) => {
    setSelectedUser(user)
    setPasswordFormData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setFormErrors({})
    setShowPasswordModal(true)
  }

  const openDetailsModal = (user: UserInterface) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "roles") {
      const select = e.target as HTMLSelectElement
      const selectedOptions = Array.from(select.selectedOptions).map((option) => option.value)
      setUserFormData((prev) => ({ ...prev, roles: selectedOptions }))
    } else {
      setUserFormData((prev) => ({ ...prev, [name]: value }))
    }
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const validateUserForm = () => {
    const errors: Record<string, string> = {}
    if (!userFormData.firstName.trim()) errors.firstName = "El nombre es requerido"
    if (!userFormData.lastName.trim()) errors.lastName = "El apellido es requerido"
    if (!userFormData.email.trim()) errors.email = "El correo es requerido"
    else if (!/\S+@\S+\.\S+/.test(userFormData.email)) errors.email = "El correo no es válido"
    if (!userFormData.username.trim()) errors.username = "El nombre de usuario es requerido"
    if (userFormData.roles.length === 0) errors.roles = "Debe seleccionar al menos un rol"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {}
    if (!passwordFormData.currentPassword) errors.currentPassword = "La contraseña actual es requerida"
    if (!passwordFormData.newPassword) errors.newPassword = "La nueva contraseña es requerida"
    else if (passwordFormData.newPassword.length < 8) errors.newPassword = "La contraseña debe tener al menos 8 caracteres"
    if (!passwordFormData.confirmPassword) errors.confirmPassword = "Debe confirmar la nueva contraseña"
    else if (passwordFormData.newPassword !== passwordFormData.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden"
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleUserFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateUserForm() || !selectedUser) return
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado")
        setLoading(false)
        return
      }
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/user/${selectedUser._id}`, userFormData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.success) {
        toast.success("Usuario actualizado exitosamente")
        setShowEditModal(false)
        fetchUsers()
      }
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error)
      toast.error(error.response?.data?.message || "Error al actualizar usuario")
      if (error.response?.data?.errors) setFormErrors(error.response.data.errors)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePasswordForm() || !selectedUser) return
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No está autorizado")
        setLoading(false)
        return
      }
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/${selectedUser._id}/password`,
        { currentPassword: passwordFormData.currentPassword, newPassword: passwordFormData.newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (response.data.success) {
        toast.success("Contraseña actualizada exitosamente")
        setShowPasswordModal(false)
      } else {
        toast.error(response.data.message || "Error al actualizar contraseña")
        if (response.data.errors) setFormErrors(response.data.errors)
      }
    } catch (error: any) {
      console.error("Error de red al actualizar la contraseña:", error)
      toast.error(error.response?.data?.message || "Error de red al actualizar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setFilters({ search: "", status: "all", role: "all" })
    const searchInput = document.getElementById("search") as HTMLInputElement
    if (searchInput) searchInput.value = ""
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1) }
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1) }

  return (
    <>
      <Breadcrumb pageName="Gestión de Usuarios" />
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark overflow-hidden">
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

            <UserFilters
              filters={filters}
              handleSearchChange={handleSearchChange}
              handleFilterChange={handleFilterChange}
              resetFilters={resetFilters}
              allRoles={allRoles}
              showFilters={showFilters}
              isMobile={isMobile}
            />
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
              </div>
            ) : currentItems.length > 0 ? (
              <>
                <UsersTable
                  users={currentItems}
                  requestSort={requestSort}
                  getSortDirectionIndicator={getSortDirectionIndicator}
                  openEditModal={openEditModal}
                  openPasswordModal={openPasswordModal}
                  openDetailsModal={openDetailsModal}
                  showConfirmation={showConfirmation}
                  isMobile={isMobile}
                />
                <UserPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  paginate={paginate}
                  nextPage={nextPage}
                  prevPage={prevPage}
                  isMobile={isMobile}
                  indexOfFirstItem={indexOfFirstItem}
                  indexOfLastItem={indexOfLastItem}
                  totalFilteredUsers={filteredUsers.length}
                />
              </>
            ) : (
              <div className="flex justify-center items-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {confirmAction && (
        <ConfirmActionModal
          show={confirmAction.show}
          username={confirmAction.username}
          isActive={confirmAction.isActive}
          onConfirm={() => toggleUserStatus(confirmAction.userId, confirmAction.isActive, confirmAction.username)}
          onCancel={cancelConfirmation}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          selectedUser={selectedUser}
          userFormData={userFormData}
          handleUserFormChange={handleUserFormChange}
          handleUserFormSubmit={handleUserFormSubmit}
          formErrors={formErrors}
          allRoles={allRoles}
          loading={loading}
          openPasswordModal={openPasswordModal}
        />
      )}

      {showPasswordModal && selectedUser && (
        <ChangePasswordModal
          show={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          selectedUser={selectedUser}
          passwordFormData={passwordFormData}
          handlePasswordFormChange={handlePasswordFormChange}
          handlePasswordFormSubmit={handlePasswordFormSubmit}
          formErrors={formErrors}
          loading={loading}
        />
      )}

      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          show={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          selectedUser={selectedUser}
          openEditModal={openEditModal}
        />
      )}
    </>
  )
}

export default UserManagement;
