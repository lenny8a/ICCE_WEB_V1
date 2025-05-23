import { useEffect, useState, lazy, Suspense } from "react"
import { Route, Routes, useLocation } from "react-router-dom"

import Loader from "./common/Loader"
import PageTitle from "./components/PageTitle"
import DefaultLayout from "./layout/DefaultLayout"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import { Toaster } from "react-hot-toast"

// Lazy loaded components
const SignIn = lazy(() => import("./pages/Authentication/SignIn"))
const SignUp = lazy(() => import("./pages/Authentication/SignUp"))
const VisEmbal = lazy(() => import("./pages/consulEmbal"))
const ECommerce = lazy(() => import("./pages/Dashboard/ECommerce"))
const Reubica = lazy(() => import("./pages/Reubica"))
const PickingHistory = lazy(() => import("./pages/Picking-history"))
const MantenimientoExcepciones = lazy(() => import("./pages/Mantennimientos/mantExcepciones"))
const Conteos = lazy(() => import("./pages/Conteos"))
const MantenimientoExcepcionesCase = lazy(() => import("./pages/CaseExcepciones"))
const UserManagement = lazy(() => import("./pages/Authentication/UserManagement"))
const RoleManagement = lazy(() => import("./pages/Authentication/RoleManagement"))
const ConteoHistory = lazy(() => import("./pages/conteo-history"))
const AccessDenied = lazy(() => import("./pages/AccessDenied"))
const UserProfile = lazy(() => import("./pages/UserProfile"))
const PickingRouter = lazy(() => import("./pages/picking-router"))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
  const [loading, setLoading] = useState<boolean>(true)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)

  }, [])

  return (
    <AuthProvider>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Toaster position="top-right" />
          <Suspense fallback={<Loader />}>
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
                  <PickingRouter />
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
              </ProtectedRoute>
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

            {/* Ruta para 404 Not Found */}
            <Route
              path="*"
              element={
                <>
                  <PageTitle title="404 - Página No Encontrada" />
                  <NotFoundPage />
                </>
              }
            />
            </Routes>
          </Suspense>
        </>
      )}
    </AuthProvider>
  )
}

export default App