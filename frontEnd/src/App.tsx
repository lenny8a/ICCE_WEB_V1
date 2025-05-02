import { useEffect, useState } from "react"
import { Route, Routes, useLocation } from "react-router-dom"

import Loader from "./common/Loader"
import PageTitle from "./components/PageTitle"
import SignIn from "./pages/Authentication/SignIn"
import SignUp from "./pages/Authentication/SignUp"
import VisEmbal from "./pages/consulEmbal"
import ECommerce from "./pages/Dashboard/ECommerce"
import DefaultLayout from "./layout/DefaultLayout"
import Reubica from "./pages/Reubica"
import Picking from "./pages/Picking"
import PickingHistory from "./pages/Picking-history"
import MantenimientoExcepciones from "./pages/Mantennimientos/mantExcepciones"
import Conteos from "./pages/Conteos"
import MantenimientoExcepcionesCase from "./pages/CaseExcepciones"
import UserManagement from "./pages/Authentication/UserManagement"
import RoleManagement from "./pages/Authentication/RoleManagement"
import { initializeSidebar } from "./components/Utils/sidebar-init"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ConteoHistory from "./pages/conteo-history"
import AccessDenied from "./pages/AccessDenied"
import UserProfile from "./pages/UserProfile"

function App() {
  const [loading, setLoading] = useState<boolean>(true)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)

    // Inicializar el sidebar después de que la aplicación haya cargado
    const cleanup = initializeSidebar()
    return cleanup
  }, [])

  return (
    <AuthProvider>
      {loading ? (
        <Loader />
      ) : (
        <Routes>
          <Route
            index
            element={
              <ProtectedRoute>
                <DefaultLayout>
                  <PageTitle title="ICCE | Pagina principal" />
                  <ECommerce />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="entrada/visualizar"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/entrada/visualizar", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Entrada | Visualizar embalaje" />
                  <VisEmbal />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/entrada/reubicar"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/entrada/reubicar", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Entrada | Reubicar embalaje" />
                  <Reubica />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/salida/picking"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/salida/picking", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Salida | Picking" />
                  <Picking />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/salida/sal_merca"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/salida/sal_merca", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Salida | Contabiliza Picking" />
                  <PickingHistory />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="cont/conteos"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/cont/conteos", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Conteos" />
                  <Conteos />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/conteo-proceso"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/conteo-proceso", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Procesar conteo" />
                  <ConteoHistory />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="mant/case"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/mant/case", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Excepciones case" />
                  <MantenimientoExcepcionesCase />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mant/excepciones"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/mant/excepciones", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Mantenimiento | Excepciones" />
                  <MantenimientoExcepciones />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/admin/users", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Administración | Usuarios" />
                  <UserManagement />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/admin/roles", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="Administración | Roles y Permisos" />
                  <RoleManagement />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auth/signup"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/auth/signup", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="ICCE" />
                  <SignUp />
                </DefaultLayout>
              // </ProtectedRoute>
            }
          />

          <Route
            path="/access-denied"
            element={
              <>
                <PageTitle title="ICCE | Acceso Denegado" />
                <AccessDenied />
              </>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredPermission={{ pagePath: "/profile", action: "visualizar" }}>
                <DefaultLayout>
                  <PageTitle title="ICCE | Mi Perfil" />
                  <UserProfile />
                </DefaultLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auth/signin"
            element={
              <>
                <PageTitle title="ICCE" />
                <SignIn />
              </>
            }
          />
        </Routes>
      )}
    </AuthProvider>
  )
}

export default App