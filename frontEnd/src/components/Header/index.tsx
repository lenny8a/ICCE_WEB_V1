import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Menu, Moon, Sun } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  isMobile: boolean
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode")
    return saved ? JSON.parse(saved) : false
  })
  const { user, logout } = useAuth()

  // Reloj que se actualiza cada segundo
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatDate = (d: Date) =>
    new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d)
  const formatTime = (d: Date) =>
    new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(d)

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
  }, [darkMode])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isDropdownOpen && !target.closest(".user-dropdown")) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [isDropdownOpen])

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-boxdark border-b border-gray-200 dark:border-gray-700 shadow-sm h-14 flex items-center">
      <div className="flex items-center justify-between w-full px-4 lg:px-6">
        {/* Toggle sidebar en móvil */}
        {isMobile && (
          <button
            onClick={handleSidebarToggle}
            className="p-1.5 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={sidebarOpen ? "Cerrar menú" : "Abrir menú"}
            type="button"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        )}
        {isMobile && (
          <Link to="/" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary mr-2"
            >
              <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
              <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"></path>
              <path d="M9 14h6"></path>
            </svg>
            <span className="text-lg font-bold text-gray-800 dark:text-white">WMS</span>
          </Link>
        )}

        {/* Fecha y hora */}
        <div className="hidden sm:flex items-center text-gray-600 dark:text-gray-300 text-sm">
          <span className="mr-2">{formatDate(currentTime)}</span>
          <span className="mr-4">{formatTime(currentTime)}</span>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* Dark mode */}
          <button
            onClick={() => setDarkMode((dm: any) => !dm)}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            type="button"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Dropdown de usuario */}
          <div className="relative user-dropdown">
            <button
              onClick={() => setIsDropdownOpen(o => !o)}
              className="flex items-center gap-2 rounded-lg py-1.5 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              type="button"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {user?.firstName || user?.username || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.roles?.[0]?.name || "Operador WMS"}
                </p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-500 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg dark:bg-boxdark border border-gray-200 dark:border-gray-700 py-1 z-50">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Mi Perfil
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-800"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header