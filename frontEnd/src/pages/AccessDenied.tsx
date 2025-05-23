import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useEffect, useState } from "react"

const AccessDenied: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [countdown, setCountdown] = useState(10)

  // Efecto para el contador de redirección
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/")
      return
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-boxdark-2 to-boxdark p-4">
      <div className="w-full max-w-3xl bg-boxdark rounded-2xl shadow-2xl overflow-hidden">
        <div className="relative">
          {/* Barra superior con degradado */}
          <div className="h-3 bg-gradient-to-r from-red-500 via-amber-500 to-warning"></div>

          <div className="p-6 sm:p-10">
            {/* Icono de acceso denegado */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-red-500/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 sm:w-16 sm:h-16 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Título y mensaje */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Acceso Denegado</h1>
              <div className="h-1 w-20 bg-warning mx-auto mb-6"></div>
              <p className="text-gray-400 text-lg mb-2">No tienes permisos para acceder a esta sección.</p>
              <p className="text-gray-500">
                Si crees que deberías tener acceso, por favor contacta al administrador del sistema.
              </p>
            </div>

            {/* Información del usuario */}
            <div className="bg-black/20 rounded-xl p-4 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-warning"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Usuario actual</p>
                    <p className="text-white font-medium">
                      {user ? `${user.firstName} ${user.lastName}` : "No autenticado"}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                    {user?.roles?.map((role) => role.name).join(", ") || "Sin rol asignado"}
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver atrás
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-lg bg-warning hover:bg-warning/90 text-white font-medium transition-colors flex items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Ir al inicio
              </button>
            </div>

            {/* Contador de redirección */}
            <div className="mt-8 text-center text-gray-500 text-sm">
              Serás redirigido a la página de inicio en <span className="text-warning font-medium">{countdown}</span>{" "}
              segundos
            </div>
          </div>
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[-1] opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-warning/10 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  )
}

export default AccessDenied
