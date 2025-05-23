import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from 'react-hot-toast'

import StepIndicator from '../../components/SignUp/StepIndicator'
import SignUpStep1 from '../../components/SignUp/SignUpStep1'
import SignUpStep2 from '../../components/SignUp/SignUpStep2'
import SignUpStep3 from '../../components/SignUp/SignUpStep3'
import SignUpStep4 from '../../components/SignUp/SignUpStep4'

interface Role {
  _id: string
  name: string
  description: string
}

const SignUp: React.FC = () => {
  const navigate = useNavigate()

  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const searchRoleRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    firstName: "",
    lastName: "",
    roles: [] as string[],
  })

  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingRoles, setFetchingRoles] = useState(true)
  const [error, setError] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [searchRole, setSearchRole] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      switch (currentStep) {
        case 1:
          usernameRef.current?.focus()
          break
        case 2:
          passwordRef.current?.focus()
          break
        case 3:
          firstNameRef.current?.focus()
          break
        case 4:
          searchRoleRef.current?.focus()
          break
      }
    }, 50)
    return () => clearTimeout(timer)
  }, [currentStep])

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setFetchingRoles(true)
        const token = localStorage.getItem("token")
        if (!token) {
          setError("No está autorizado para registrar usuarios")
          return
        }
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/role`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (response.data.success) {
          setRoles(response.data.data)
        }
      } catch (error) {
        console.error("Error al cargar roles:", error)
        setError("Error al cargar roles. Por favor, intente nuevamente.")
      } finally {
        setFetchingRoles(false)
      }
    }
    fetchRoles()
  }, [])

  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0)
      return
    }
    let strength = 0
    if (formData.password.length >= 8) strength += 1
    if (/\d/.test(formData.password)) strength += 1
    if (/[a-z]/.test(formData.password)) strength += 1
    if (/[A-Z]/.test(formData.password)) strength += 1
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1
    setPasswordStrength(strength)
  }, [formData.password])

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {}
    if (step === 1) {
      if (formData.username.length < 3) errors.username = "El nombre de usuario debe tener al menos 3 caracteres"
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) errors.email = "Ingrese un correo electrónico válido"
    } else if (step === 2) {
      if (formData.password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres"
      if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden"
    } else if (step === 3) {
      if (!formData.firstName.trim()) errors.firstName = "El nombre es requerido"
      if (!formData.lastName.trim()) errors.lastName = "El apellido es requerido"
    } else if (step === 4) {
      if (formData.roles.length === 0) errors.roles = "Debe seleccionar al menos un rol"
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (formData.username.length < 3) errors.username = "El nombre de usuario debe tener al menos 3 caracteres"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) errors.email = "Ingrese un correo electrónico válido"
    if (formData.password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres"
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Las contraseñas no coinciden"
    if (!formData.firstName.trim()) errors.firstName = "El nombre es requerido"
    if (!formData.lastName.trim()) errors.lastName = "El apellido es requerido"
    if (formData.roles.length === 0) errors.roles = "Debe seleccionar al menos un rol"
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (validationErrors[name]) setValidationErrors({ ...validationErrors, [name]: "" })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextFieldName?: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (currentStep < 4 && !nextFieldName) {
        if (validateStep(currentStep)) nextStep()
      } else if (nextFieldName) {
        const nextField = document.querySelector(`input[name="${nextFieldName}"]`) as HTMLInputElement
        if (nextField) nextField.focus()
      }
    }
  }

  const handleRoleToggle = (roleId: string) => {
    setFormData({
      ...formData,
      roles: formData.roles.includes(roleId)
        ? formData.roles.filter((id) => id !== roleId)
        : [...formData.roles, roleId],
    })
    if (validationErrors.roles) setValidationErrors({ ...validationErrors, roles: "" })
  }

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!validateForm()) return

    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      if (!token) {
        setError("No está autorizado para registrar usuarios")
        return
      }
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      if (response.data.success) {
        toast.success("Usuario registrado exitosamente")
        setFormData({
          username: "", password: "", confirmPassword: "", email: "",
          firstName: "", lastName: "", roles: [],
        })
        setCurrentStep(1)
      }
    } catch (error: any) {
      console.error("Error al registrar usuario:", error)
      const errorMessage = error.response?.data?.message || "Error al registrar usuario"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Muy débil"
    if (passwordStrength === 1) return "Débil"
    if (passwordStrength === 2) return "Moderada"
    if (passwordStrength === 3) return "Buena"
    if (passwordStrength === 4) return "Fuerte"
    return "Muy fuerte"
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-red-500"
    if (passwordStrength === 1) return "bg-red-400"
    if (passwordStrength === 2) return "bg-yellow-500"
    if (passwordStrength === 3) return "bg-yellow-400"
    if (passwordStrength === 4) return "bg-green-400"
    return "bg-green-500"
  }

  const filteredRoles = roles.filter(
    (role) => role.name.toLowerCase().includes(searchRole.toLowerCase()) || searchRole === "",
  )

  const renderStepTitle = () => {
    switch (currentStep) {
      case 1: return "Información de Cuenta"
      case 2: return "Seguridad"
      case 3: return "Información Personal"
      case 4: return "Asignación de Roles"
      default: return ""
    }
  }

  const renderCurrentStepContent = () => {
    switch (currentStep) {
      case 1:
        return <SignUpStep1
          formData={formData}
          handleChange={handleChange}
          validationErrors={validationErrors}
          handleKeyDown={handleKeyDown}
          usernameRef={usernameRef}
        />
      case 2:
        return <SignUpStep2
          formData={formData}
          handleChange={handleChange}
          validationErrors={validationErrors}
          handleKeyDown={handleKeyDown}
          passwordRef={passwordRef}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          passwordStrength={passwordStrength}
          getPasswordStrengthText={getPasswordStrengthText}
          getPasswordStrengthColor={getPasswordStrengthColor}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />
      case 3:
        return <SignUpStep3
          formData={formData}
          handleChange={handleChange}
          validationErrors={validationErrors}
          handleKeyDown={handleKeyDown}
          firstNameRef={firstNameRef}
        />
      case 4:
        return <SignUpStep4
          formDataRoles={formData.roles}
          roles={roles}
          fetchingRoles={fetchingRoles}
          searchRole={searchRole}
          setSearchRole={setSearchRole}
          filteredRoles={filteredRoles}
          handleRoleToggle={handleRoleToggle}
          validationErrorRoles={validationErrors.roles}
          searchRoleRef={searchRoleRef}
        />
      default:
        return null
    }
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark min-h-screen flex flex-col">
      <div className="flex justify-center pt-10 px-4 pb-4">
        <div className="w-full max-w-md rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
          <div className="mb-4 flex flex-col items-center pt-6 px-6">
            <h2 className="text-xl font-semibold text-black dark:text-white">Registro de Usuario</h2>
            <p className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">Sistema de Gestión WMS</p>
          </div>

          <div className="px-6 pb-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-500 p-3 text-white text-sm">
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <StepIndicator currentStep={currentStep} totalSteps={4} />
            <h3 className="text-sm font-medium text-black dark:text-white mb-4 text-center">{renderStepTitle()}</h3>

            <form onSubmit={handleSubmit}>
              {renderCurrentStepContent()}
              <div className="flex justify-between mt-6">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 rounded-md border border-stroke dark:border-strokedark text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Anterior
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 rounded-md bg-warning text-white text-sm hover:bg-warning/90 transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || fetchingRoles}
                    className="px-4 py-2 rounded-md bg-warning text-white text-sm hover:bg-warning/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Registrando...
                      </span>
                    ) : (
                      "Registrar Usuario"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp;
