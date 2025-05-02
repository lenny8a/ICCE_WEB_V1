import type React from "react"

import { useState, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import { useToast } from "../hooks/useToast"
import { User, Shield, Edit3, Save, X, Mail, Phone, MapPin, Lock, Eye, EyeOff, LogOut } from "lucide-react"
import ToastContainer from "../components/ToastContainer"

const getInitials = (name: string, lastName: string) => {
  if (!name && !lastName) return "U";
  return `${name?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

const UserProfile = () => {
  const { user, logout } = useAuth()
  const { toasts, removeToast, success, error } = useToast()
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: (user && 'phone' in user && typeof user.phone === 'string') ? user.phone : "",
    position: (user && 'position' in user && typeof user.position === 'string') ? user.position : "",
    location: (user && 'location' in user && typeof user.location === 'string') ? user.location : "",
    bio: (user && 'bio' in user && typeof user.bio === 'string') ? user.bio : "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTimeout(() => {
      success("Perfil actualizado correctamente")
      setIsEditing(false)
    }, 800)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Intentando actualizar contraseña"); // Debug: Verifica si el submit funciona

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error("Las contraseñas no coinciden");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        error("No está autorizado");
        return;
      }
      if (!user || !user._id) {
        error("No se encontró el usuario actual");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/${user._id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        success("Contraseña actualizada correctamente");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        error(data.message || "Error al actualizar la contraseña");
      }
    } catch (err) {
      error("Error de red al actualizar la contraseña");
    }
  }

  const handleLogout = () => {
    logout()
    success("Sesión cerrada correctamente")
  }

  const initials = useMemo(() => getInitials(user?.firstName ?? '', user?.lastName ?? user?.username ?? ''), [user]);

  return (
    <>
      <Breadcrumb pageName="Mi Perfil" />

      {/* Profile Header Mejorado */}
      <div className="mb-8 rounded-xl border border-stroke bg-gradient-to-r from-primary/10 via-white to-primary/10 p-8 shadow-lg dark:border-strokedark dark:bg-gradient-to-r dark:from-boxdark dark:via-gray-900 dark:to-boxdark">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white shadow-lg border-4 border-white dark:border-boxdark">
              {initials}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-black dark:text-white">
                {user?.firstName} {user?.lastName || user?.username}
              </h3>
              <p className="mt-1 text-base font-semibold text-primary">{formData.position || "Usuario"}</p>
              {user?.roles && user.roles.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.roles.map((role: any, index: number) => (
                    <span
                      key={index}
                      className="inline-flex rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary shadow"
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-base font-semibold text-white shadow transition hover:bg-opacity-90 hover:scale-105"
            >
              <Edit3 className="h-5 w-5" />
              Editar Perfil
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation Mejorado */}
      <div className="mb-8 rounded-xl border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
        <div className="flex border-b border-stroke px-8 py-4 dark:border-strokedark">
          <button
            className={`mr-8 flex items-center gap-2 pb-3 text-base font-semibold transition-colors duration-200 ${
              activeTab === "personal"
                ? "border-b-4 border-primary text-primary scale-105"
                : "text-gray-600 dark:text-gray-300 hover:text-primary"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            <User className="h-5 w-5" />
            Información Personal
          </button>
          <button
            className={`flex items-center gap-2 pb-3 text-base font-semibold transition-colors duration-200 ${
              activeTab === "security"
                ? "border-b-4 border-primary text-primary scale-105"
                : "text-gray-600 dark:text-gray-300 hover:text-primary"
            }`}
            onClick={() => setActiveTab("security")}
          >
            <Shield className="h-5 w-5" />
            Seguridad
          </button>
        </div>
      </div>

      {/* Personal Information Tab */}
      {activeTab === "personal" && (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {!isEditing ? (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="text-xl font-semibold text-black dark:text-white">Información Personal</h4>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <h5 className="text-sm font-medium text-black dark:text-white">Nombre Completo</h5>
                    </div>
                    <p className="text-base font-medium">
                      {formData.firstName || "No especificado"} {formData.lastName || ""}
                    </p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <h5 className="text-sm font-medium text-black dark:text-white">Correo Electrónico</h5>
                    </div>
                    <p className="text-base font-medium">{formData.email || "No especificado"}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      <h5 className="text-sm font-medium text-black dark:text-white">Teléfono</h5>
                    </div>
                    <p className="text-base font-medium">{formData.phone || "No especificado"}</p>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h5 className="text-sm font-medium text-black dark:text-white">Ubicación</h5>
                    </div>
                    <p className="text-base font-medium">{formData.location || "No especificado"}</p>
                  </div>
                </div>
              </div>

              {formData.bio && (
                <div className="mt-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    <h5 className="text-sm font-medium text-black dark:text-white">Biografía</h5>
                  </div>
                  <p className="text-base font-medium">{formData.bio}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="text-xl font-semibold text-black dark:text-white">Editar Información Personal</h4>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="mb-4">
                    <label className="mb-2.5 block text-sm font-medium text-black dark:text-white" htmlFor="firstName">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2.5 block text-sm font-medium text-black dark:text-white" htmlFor="lastName">
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2.5 block text-sm font-medium text-black dark:text-white" htmlFor="email">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2.5 block text-sm font-medium text-black dark:text-white" htmlFor="phone">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="mb-2.5 block text-sm font-medium text-black dark:text-white" htmlFor="location">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white" htmlFor="bio">
                    Biografía
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  ></textarea>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
                  >
                    <Save className="h-5 w-5" />
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-stroke px-6 py-3 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                  >
                    <X className="h-5 w-5" />
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Cambiar Contraseña</h4>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-5">
                <label
                  className="mb-2.5 block text-sm font-medium text-black dark:text-white"
                  htmlFor="currentPassword"
                >
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-body" /> : <Eye className="h-5 w-5 text-body" />}
                  </button>
                </div>
              </div>
              <div className="mb-5">
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white" htmlFor="newPassword">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>
              </div>
              <div className="mb-5">
                <label
                  className="mb-2.5 block text-sm font-medium text-black dark:text-white"
                  htmlFor="confirmPassword"
                >
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90"
              >
                <Lock className="h-5 w-5" />
                Actualizar Contraseña
              </button>
            </form>
          </div>

          <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">Seguridad de la Cuenta</h4>
            <div className="space-y-4">
              <div className="rounded-md bg-gray-50 p-4 dark:bg-boxdark-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mantén tu cuenta segura utilizando una contraseña fuerte y única. Te recomendamos cambiarla
                  periódicamente.
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-danger px-6 py-3 font-medium text-white hover:bg-opacity-90"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

export default UserProfile
