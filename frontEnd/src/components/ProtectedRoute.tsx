import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: {
    pagePath: string
    action: string
  }
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { user, loading, checkPermission } = useAuth()

  // Show loading state
  if (loading) {
    return <div>Cargando...</div>
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/auth/signin" replace />
  }

  // Check if user has required permission
  if (requiredPermission && !checkPermission(requiredPermission.pagePath, requiredPermission.action)) {
    return <Navigate to="/access-denied" replace />
  }

  // Render children if authenticated and has permission
  return <>{children}</>
}

export default ProtectedRoute
