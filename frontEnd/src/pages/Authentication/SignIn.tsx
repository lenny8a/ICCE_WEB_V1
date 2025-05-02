import type React from "react"
import { Link } from "react-router-dom"
import Logo from "../../images/logo/ICCE_LogoOriginal.svg"
import { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"

const SignIn: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading: authLoading, error: authError } = useAuth()

  // Set dark mode by default
  useEffect(() => {
    document.documentElement.classList.add("dark")
    localStorage.setItem("darkMode", JSON.stringify(true))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(username, password)
  }

  return (
    <div className="bg-gradient-to-br from-boxdark-2 to-boxdark min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Branding - With improved ICCE WMS legend */}
          <div className="bg-gradient-to-br from-amber-500 to-warning w-full md:w-1/2 py-6 px-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>

            {/* Decorative circles - Adjusted for mobile */}
            <div className="absolute -top-10 -left-10 sm:-top-20 sm:-left-20 w-40 sm:w-64 h-40 sm:h-64 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-10 -right-10 sm:-bottom-20 sm:-right-20 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-white/10"></div>

            <div className="relative z-10 text-center">
              <Link to="/" className="inline-block mb-4 sm:mb-8 transform transition-transform hover:scale-105">
                {/* Logo with enhanced shadow for better contrast */}
                <div className="relative">
                  <img
                    src={Logo || "/placeholder.svg"}
                    alt="ICCE Logo"
                    className="w-52 sm:w-72 mx-auto drop-shadow-[0_0_12px_rgba(0,0,0,0.7)] filter-none"
                    style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
                  />
                </div>
              </Link>

              {/* Enhanced ICCE WMS legend */}
              <div className="hidden sm:block mb-6">
                <div className="inline-flex items-center bg-black/15 backdrop-blur-sm rounded-xl p-1 shadow-lg">
                  <div className="px-4 py-2">
                    <span className="text-white text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                      ICCE
                    </span>
                  </div>

                  <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-lg">
                    <span className="text-amber-300 text-2xl sm:text-3xl font-bold tracking-widest drop-shadow-lg">
                      WMS
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-white/90 text-base sm:text-lg mb-4 sm:mb-6 hidden sm:block drop-shadow-sm">
                Líderes en Servicios Electromecánicos
              </p>

              <div className="w-12 sm:w-16 h-1 bg-white/50 mx-auto mb-4 sm:mb-6 hidden sm:block"></div>

              {/* Hide this on very small screens */}
              <p className="text-white/80 italic text-sm sm:text-base hidden sm:block drop-shadow-sm">
                "Innovación y excelencia en cada proyecto"
              </p>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="bg-boxdark w-full md:w-1/2 p-6 sm:p-8 md:p-12">
            <div className="max-w-md mx-auto">
              {/* Hide welcome text on mobile */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 hidden sm:block">¡Bienvenidos!</h2>
              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">
                Ingresa tus credenciales para acceder al sistema
              </p>

              {authError && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 sm:mb-2" htmlFor="username">
                    Usuario
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      type="text"
                      placeholder="nombre.apellido"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-600 bg-form-input text-white transition-colors focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/30 text-sm sm:text-base"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <span className="absolute right-3 top-2.5 sm:top-3 text-gray-400">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        ></path>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between mb-1.5 sm:mb-2">
                    <label className="block text-sm font-medium text-gray-300" htmlFor="password">
                      Contraseña
                    </label>
                    <a href="#" className="text-xs sm:text-sm text-warning hover:underline mt-1 xs:mt-0">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-gray-600 bg-form-input text-white transition-colors focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/30 text-sm sm:text-base"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="absolute right-3 top-2.5 sm:top-3 text-gray-400">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        ></path>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="mb-5 sm:mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-600 text-warning focus:ring-warning"
                    />
                    <span className="ml-2 text-xs sm:text-sm text-gray-400">Mantener sesión iniciada</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 sm:py-3 px-4 rounded-lg bg-warning text-white font-medium transition-all hover:bg-warning/90 focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  {authLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </button>
              </form>

              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-xs sm:text-sm text-gray-400">
                  ¿Problemas para iniciar sesión? Contacta a
                  <a href="#" className="text-warning hover:underline ml-1">
                    soporte técnico
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background pattern */}
      <style>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        /* Custom breakpoint for extra small screens */
        @media (min-width: 480px) {
          .xs\\:block {
            display: block;
          }
          .xs\\:flex-row {
            flex-direction: row;
          }
          .xs\\:items-center {
            align-items: center;
          }
          .xs\\:justify-between {
            justify-content: space-between;
          }
          .xs\\:mt-0 {
            margin-top: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default SignIn
