import React from "react"
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useToast } from "../../hooks/useToast"
import ToastContainer from "../../components/ToastContainer"
import type { FC } from "react"

interface Role {
  _id: string
  name: string
  description: string
}

const SignUp: FC = () => {
  const navigate = useNavigate()
  const { toasts, addToast, removeToast, success: showSuccess, error: showError } = useToast()

  // Referencias para los campos de entrada
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const firstNameRef = useRef<HTMLInputElement>(null)
  const searchRoleRef = useRef<HTMLInputElement>(null)

  // Agregar esta variable de referencia después de las declaraciones de useRef
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
  const [success, setSuccess] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [searchRole, setSearchRole] = useState("")

  // Enfocar el primer campo cuando cambia el paso
  useEffect(() => {
    // Pequeño retraso para asegurar que el DOM se ha actualizado
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

  // Load roles on component mount
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    // Length check
    if (formData.password.length >= 8) strength += 1
    // Contains number
    if (/\d/.test(formData.password)) strength += 1
    // Contains lowercase
    if (/[a-z]/.test(formData.password)) strength += 1
    // Contains uppercase
    if (/[A-Z]/.test(formData.password)) strength += 1
    // Contains special character
    if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1

    setPasswordStrength(strength)
  }, [formData.password])

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {}

    if (step === 1) {
      // Username validation
      if (formData.username.length < 3) {
        errors.username = "El nombre de usuario debe tener al menos 3 caracteres"
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        errors.email = "Ingrese un correo electrónico válido"
      }
    } else if (step === 2) {
      // Password validation
      if (formData.password.length < 6) {
        errors.password = "La contraseña debe tener al menos 6 caracteres"
      }

      // Confirm password validation
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden"
      }
    } else if (step === 3) {
      // First name validation
      if (!formData.firstName.trim()) {
        errors.firstName = "El nombre es requerido"
      }

      // Last name validation
      if (!formData.lastName.trim()) {
        errors.lastName = "El apellido es requerido"
      }
    } else if (step === 4) {
      // Roles validation
      if (formData.roles.length === 0) {
        errors.roles = "Debe seleccionar al menos un rol"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    // Username validation
    if (formData.username.length < 3) {
      errors.username = "El nombre de usuario debe tener al menos 3 caracteres"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.email = "Ingrese un correo electrónico válido"
    }

    // Password validation
    if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }

    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = "El nombre es requerido"
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = "El apellido es requerido"
    }

    // Roles validation
    if (formData.roles.length === 0) {
      errors.roles = "Debe seleccionar al menos un rol"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextFieldName?: string) => {
    if (e.key === "Enter") {
      e.preventDefault()

      if (currentStep < 4 && !nextFieldName) {
        // Si estamos en el último campo de un paso, avanzar al siguiente paso
        if (validateStep(currentStep)) {
          nextStep()
        }
      } else if (nextFieldName) {
        // Enfocar el siguiente campo
        const nextField = document.querySelector(`input[name="${nextFieldName}"]`) as HTMLInputElement
        if (nextField) {
          nextField.focus()
        }
      }
    }
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setFormData({
      ...formData,
      roles: selectedOptions,
    })

    // Clear validation error when user selects roles
    if (validationErrors.roles) {
      setValidationErrors({
        ...validationErrors,
        roles: "",
      })
    }
  }

  const handleRoleToggle = (roleId: string) => {
    setFormData({
      ...formData,
      roles: formData.roles.includes(roleId)
        ? formData.roles.filter((id) => id !== roleId)
        : [...formData.roles, roleId],
    })

    // Clear validation error when user selects roles
    if (validationErrors.roles) {
      setValidationErrors({
        ...validationErrors,
        roles: "",
      })
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate form
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No está autorizado para registrar usuarios")
        return
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          roles: formData.roles,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success) {
        setSuccess("Usuario registrado exitosamente")
        showSuccess("Usuario registrado exitosamente")

        // Reset form
        setFormData({
          username: "",
          password: "",
          confirmPassword: "",
          email: "",
          firstName: "",
          lastName: "",
          roles: [],
        })
        setCurrentStep(1)

        // Limpiar cualquier temporizador existente
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current)
        }

        // Establecer nuevo temporizador y guardarlo en la referencia
        successTimeoutRef.current = setTimeout(() => {
          setSuccess("")
        }, 5000)
      }
    } catch (error: any) {
      console.error("Error al registrar usuario:", error)
      const errorMessage = error.response?.data?.message || "Error al registrar usuario"
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Set dark mode on component mount
  useEffect(() => {
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")

    return () => {
      // Clean up timers
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current)
      }
    }
  }, [])

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

  // Filtrar roles basados en la búsqueda
  const filteredRoles = roles.filter(
    (role) => role.name.toLowerCase().includes(searchRole.toLowerCase()) || searchRole === "",
  )

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border 
                  ${
                    currentStep === step
                      ? "border-warning bg-warning text-white"
                      : currentStep > step
                        ? "border-warning bg-warning/20 text-warning"
                        : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                  }`}
              >
                {currentStep > step ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < 4 && (
                <div
                  className={`w-8 h-0.5 ${currentStep > step ? "bg-warning" : "bg-gray-300 dark:bg-gray-600"}`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  const renderStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Información de Cuenta"
      case 2:
        return "Seguridad"
      case 3:
        return "Información Personal"
      case 4:
        return "Asignación de Roles"
      default:
        return ""
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Nombre de usuario</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  ref={usernameRef}
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ingrese nombre de usuario"
                  className={`w-full rounded-md border ${
                    validationErrors.username ? "border-red-500" : "border-stroke"
                  } bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
                  required
                  onKeyDown={(e) => handleKeyDown(e, "email")}
                />
              </div>
              {validationErrors.username && <p className="mt-1 text-xs text-red-500">{validationErrors.username}</p>}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Correo electrónico</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ingrese correo electrónico"
                  className={`w-full rounded-md border ${
                    validationErrors.email ? "border-red-500" : "border-stroke"
                  } bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
                  required
                  onKeyDown={(e) => handleKeyDown(e)}
                />
              </div>
              {validationErrors.email && <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>}
            </div>
          </>
        )
      case 2:
        return (
          <>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  ref={passwordRef}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingrese contraseña"
                  className={`w-full rounded-md border ${
                    validationErrors.password ? "border-red-500" : "border-stroke"
                  } bg-transparent py-2.5 pl-10 pr-10 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
                  required
                  onKeyDown={(e) => handleKeyDown(e, "confirmPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.password && <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>}

              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Fortaleza: {getPasswordStrengthText()}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{passwordStrength}/5</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full dark:bg-gray-700">
                    <div
                      className={`h-1.5 rounded-full ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Confirmar Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirme contraseña"
                  className={`w-full rounded-md border ${
                    validationErrors.confirmPassword ? "border-red-500" : "border-stroke"
                  } bg-transparent py-2.5 pl-10 pr-10 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
                  required
                  onKeyDown={(e) => handleKeyDown(e)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.confirmPassword}</p>
              )}
            </div>
          </>
        )
      case 3:
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Nombre</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  ref={firstNameRef}
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Ingrese nombre"
                  className={`w-full rounded-md border ${
                    validationErrors.firstName ? "border-red-500" : "border-stroke"
                  } bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
                  required
                  onKeyDown={(e) => handleKeyDown(e, "lastName")}
                />
              </div>
              {validationErrors.firstName && <p className="mt-1 text-xs text-red-500">{validationErrors.firstName}</p>}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">Apellido</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Ingrese apellido"
                  className={`w-full rounded-md border ${
                    validationErrors.lastName ? "border-red-500" : "border-stroke"
                  } bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning`}
                  required
                  onKeyDown={(e) => handleKeyDown(e)}
                />
              </div>
              {validationErrors.lastName && <p className="mt-1 text-xs text-red-500">{validationErrors.lastName}</p>}
            </div>
          </div>
        )
      case 4:
        return (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">Roles</label>
            {validationErrors.roles && <p className="mt-1 mb-2 text-xs text-red-500">{validationErrors.roles}</p>}

            {/* Buscador de roles */}
            <div className="mb-3 relative">
              <input
                ref={searchRoleRef}
                type="text"
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
                placeholder="Buscar roles..."
                className="w-full rounded-md border border-stroke bg-transparent py-2.5 pl-4 pr-4 text-sm text-black outline-none focus:border-warning focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-warning"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                  }
                }}
              />
              {searchRole && (
                <button
                  type="button"
                  onClick={() => setSearchRole("")}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {fetchingRoles ? (
              <div className="flex justify-center items-center py-4">
                <svg
                  className="animate-spin h-5 w-5 text-warning"
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
                <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">Cargando roles...</span>
              </div>
            ) : filteredRoles.length > 0 ? (
              <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
                {filteredRoles.map((role) => (
                  <div
                    key={role._id}
                    className={`p-2 rounded-md border cursor-pointer transition-all ${
                      formData.roles.includes(role._id)
                        ? "border-warning bg-warning/10 dark:bg-warning/20"
                        : "border-stroke dark:border-strokedark hover:border-warning/50"
                    }`}
                    onClick={() => handleRoleToggle(role._id)}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center mr-2 ${
                          formData.roles.includes(role._id)
                            ? "border-warning bg-warning text-white"
                            : "border-gray-400 dark:border-gray-600"
                        }`}
                      >
                        {formData.roles.includes(role._id) && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-black dark:text-white">{role.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-md border border-stroke dark:border-strokedark text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">No hay roles disponibles</p>
              </div>
            )}

            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              <p>Roles seleccionados: {formData.roles.length}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.roles.map((roleId) => {
                  const role = roles.find((r) => r._id === roleId)
                  return role ? (
                    <span
                      key={roleId}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-warning/10 text-warning text-xs"
                    >
                      {role.name}
                      <button
                        type="button"
                        onClick={() => handleRoleToggle(roleId)}
                        className="ml-1 text-warning hover:text-warning/80"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  ) : null
                })}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderStepButtons = () => {
    return (
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
    )
  }

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark min-h-screen flex flex-col">
      <div className="flex justify-center pt-10 px-4 pb-4">
        <div className="w-full max-w-md rounded-lg border border-stroke bg-white shadow-md dark:border-strokedark dark:bg-boxdark">
          {/* Header with Logo */}
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

            {success && (
              <div className="mb-4 rounded-md bg-green-500 p-3 text-white text-sm">
                <div className="flex items-center">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{success}</span>
                </div>
              </div>
            )}

            {renderStepIndicator()}

            <h3 className="text-sm font-medium text-black dark:text-white mb-4 text-center">{renderStepTitle()}</h3>

            <form onSubmit={handleSubmit}>
              {renderStepContent()}
              {renderStepButtons()}
            </form>

          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} position="top-right" />
    </div>
  )
}

export default SignUp
