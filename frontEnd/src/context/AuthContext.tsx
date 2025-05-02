"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { jwtDecode } from "jwt-decode";


interface User {
  _id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: any[]
}

interface TokenPayload {
  id: string
  username: string
  iat: number
  exp: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  checkPermission: (pagePath: string, action: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Recuperar el token del localStorage al inicio
  const storedToken = localStorage.getItem("token")
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(storedToken)
  const [permissions, setPermissions] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Configurar el token en axios cuando cambie
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [token])

  // Cargar datos del usuario cuando hay un token
  useEffect(() => {
    const loadUserData = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        console.log("Cargando datos del usuario con token:", token.substring(0, 15) + "...")

        // Asegurar que el token esté configurado en axios
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        // Decodificar el token para obtener el ID del usuario
        let userId: string
        try {
          const decoded = jwtDecode<TokenPayload>(token)
          userId = decoded.id
          console.log("ID de usuario obtenido del token:", userId)
        } catch (decodeError) {
          console.error("Error al decodificar el token:", decodeError)
          // Si no podemos decodificar el token, lo consideramos inválido
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
          delete axios.defaults.headers.common["Authorization"]
          if (window.location.pathname !== "/auth/signin") {
            navigate("/auth/signin")
          }
          setLoading(false)
          return
        }

        // Obtener datos del usuario usando la ruta correcta
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/${userId}`)

        if (response.data.success) {
          console.log("Datos del usuario cargados correctamente:", response.data.data.username)
          setUser(response.data.data)

          // Cargar permisos del usuario
          try {
            const permissionsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/user/${userId}/permissions`)

            if (permissionsResponse.data.success) {
              const formattedPermissions: Record<string, string[]> = {}

              permissionsResponse.data.data.forEach((permission: any) => {
                formattedPermissions[permission.path] = permission.actions
              })

              setPermissions(formattedPermissions)
            }
          } catch (permError) {
            console.error("Error al cargar permisos:", permError)
          }
        } else {
          console.error("Token inválido o expirado")
          // Token inválido
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
          delete axios.defaults.headers.common["Authorization"]

          // Redirigir a login si no estamos ya en la página de login
          if (window.location.pathname !== "/auth/signin") {
            navigate("/auth/signin")
          }
        }
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error)
        localStorage.removeItem("token")
        setToken(null)
        setUser(null)
        delete axios.defaults.headers.common["Authorization"]

        // Redirigir a login si no estamos ya en la página de login
        if (window.location.pathname !== "/auth/signin") {
          navigate("/auth/signin")
        }
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [token, navigate])

  // Función de login
  const login = async (username: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      console.log("Intentando iniciar sesión con:", username)

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
        username,
        password,
      })

      if (response.data.success) {
        const { token: newToken, user: userData } = response.data.data

        console.log("Login exitoso, guardando token:", newToken.substring(0, 15) + "...")

        // Guardar token en localStorage
        localStorage.setItem("token", newToken)

        // Actualizar estado
        setToken(newToken)
        setUser(userData)

        // Configurar header de autorización
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

        // Cargar permisos del usuario
        try {
          const permissionsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/user/${userData._id}/permissions`)

          if (permissionsResponse.data.success) {
            const formattedPermissions: Record<string, string[]> = {}

            permissionsResponse.data.data.forEach((permission: any) => {
              formattedPermissions[permission.path] = permission.actions
            })

            setPermissions(formattedPermissions)
          }
        } catch (permError) {
          console.error("Error al cargar permisos:", permError)
        }

        // Redirigir al dashboard
        navigate("/")
      } else {
        setError(response.data.message || "Credenciales inválidas")
      }
    } catch (error: any) {
      console.error("Error de login:", error)
      setError(error.response?.data?.message || "Error al iniciar sesión. Verifica tus credenciales.")
    } finally {
      setLoading(false)
    }
  }

  // Función de logout
  const logout = () => {
    console.log("Cerrando sesión, eliminando token")
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    setPermissions({})
    delete axios.defaults.headers.common["Authorization"]
    navigate("/auth/signin")
  }

  // Verificar si el usuario tiene permiso
  const checkPermission = (pagePath: string, action: string): boolean => {
    if (!user) return false

    // Verificar si el usuario tiene permiso para esta página y acción
    return permissions[pagePath]?.includes(action) || false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider")
  }

  return context
}
