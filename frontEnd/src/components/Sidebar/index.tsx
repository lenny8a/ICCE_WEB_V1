"use client"

import React, { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import SidebarLinkGroup from "./SidebarLinkGroup"
import Logo from "../../images/logo/ICCE_LogoOriginal.svg"

// Import icons from Lucide React for consistency
import {
  LayoutDashboard,
  ClipboardList,
  Settings,
  Users,
  ChevronDown,
  ChevronLeft,
  Eye,
  MapPin,
  CheckSquare,
  ShoppingCart,
  Truck,
  FileSpreadsheet,
  AlertTriangle,
  PenToolIcon as Tool,
  Clock,
  PackagePlus,
  PackageMinus,
  User,
} from "lucide-react"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { pathname } = useLocation()
  const trigger = useRef<HTMLButtonElement>(null)
  const sidebar = useRef<HTMLElement>(null)
  const stored = localStorage.getItem("sidebar-expanded")
  const [sidebarExpanded, setSidebarExpanded] = useState(stored === "true")
  const navigate = useNavigate()
  // Overlay en móvil
  const isMobile = window.innerWidth < 1024

  // Click fuera (fase capture)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!sidebarOpen) return
      const t = e.target as Node
      if (sidebar.current?.contains(t) || trigger.current?.contains(t)) return
      setSidebarOpen(false)
    }
    document.addEventListener("mousedown", handler, true)
    return () => document.removeEventListener("mousedown", handler, true)
  }, [sidebarOpen, setSidebarOpen])

  // Cerrar con Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [sidebarOpen, setSidebarOpen])

  // Persistir expandido
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString())
    document.body.classList.toggle("sidebar-expanded", sidebarExpanded)
  }, [sidebarExpanded])

 // Función para manejar la navegación
 const handleNavigation = (path: string) => {
  // En dispositivos móviles, cerrar el sidebar
  if (isMobile) {
    setSidebarOpen(false)
  }
  navigate(path)
}

  return (
    <>
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-[998] bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        ref={sidebar}
        className={`fixed left-0 top-0 z-[999] flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="flex items-center justify-between gap-2 px-6 py-5 lg:py-6">
          <div className="flex items-center cursor-pointer">
            <img src={Logo || "/placeholder.svg"} alt="ICCE Logo" className="h-19 block" />
          </div>

          <button
            ref={trigger}
            onClick={() => setSidebarOpen(false)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
            className="block lg:hidden text-white hover:text-gray-400 transition-colors"
            type="button"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        {/* SIDEBAR HEADER */}

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* Sidebar Menu */}
          <nav className="mt-5 py-1 px-4 lg:mt-2 lg:px-6">
            {/* Menu Group */}
            <div>
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">MENÚ</h3>

              <ul className="mb-6 flex flex-col gap-1.5">
                {/* Menu Item Dashboard */}
                <li>
                  <div
                    className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 cursor-pointer ${
                      pathname === "/" && "bg-graydark dark:bg-meta-4"
                    }`}
                    onClick={() => handleNavigation("/")}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </div>
                </li>

                {/* Menu Item Procesos de Entrada */}
                <SidebarLinkGroup activeCondition={pathname === "/entrada" || pathname.includes("entrada")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <div
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 cursor-pointer ${
                            (pathname === "/entrada" || pathname.includes("entrada")) && "bg-graydark dark:bg-meta-4"
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            sidebarExpanded ? handleClick() : setSidebarExpanded(true)
                          }}
                        >
                          <PackagePlus size={18} />
                          Procesos de Entrada
                          <ChevronDown
                            className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && "rotate-180"}`}
                            size={18}
                          />
                        </div>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/entrada/visualizar" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/entrada/visualizar")}
                              >
                                <Eye size={16} className="opacity-50" />
                                Visualizar case
                              </div>
                            </li>
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/entrada/reubicar" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/entrada/reubicar")}
                              >
                                <MapPin size={16} className="opacity-50" />
                                Ubicar case
                              </div>
                            </li>
                          </ul>
                        </div>
                        {/* Dropdown Menu End */}
                      </React.Fragment>
                    )
                  }}
                </SidebarLinkGroup>

                {/* Menu Item Procesos de Salida */}
                <SidebarLinkGroup activeCondition={pathname === "/salida" || pathname.includes("salida")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <div
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 cursor-pointer ${
                            (pathname === "/salida" || pathname.includes("salida")) && "bg-graydark dark:bg-meta-4"
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            sidebarExpanded ? handleClick() : setSidebarExpanded(true)
                          }}
                        >
                          <PackageMinus size={18} />
                          Procesos de Salida
                          <ChevronDown
                            className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && "rotate-180"}`}
                            size={18}
                          />
                        </div>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/salida/picking" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/salida/picking")}
                              >
                                <ShoppingCart size={16} className="opacity-50" />
                                Picking
                              </div>
                            </li>
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/salida/sal_merca" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/salida/sal_merca")}
                              >
                                <Truck size={16} className="opacity-50" />
                                Salida de Mercancias
                              </div>
                            </li>
                          </ul>
                        </div>
                        {/* Dropdown Menu End */}
                      </React.Fragment>
                    )
                  }}
                </SidebarLinkGroup>

                {/* Menu Item Procesos Conteo */}
                <SidebarLinkGroup activeCondition={pathname === "/cont" || pathname.includes("cont")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <div
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 cursor-pointer ${
                            (pathname === "/cont" || pathname.includes("cont")) && "bg-graydark dark:bg-meta-4"
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            sidebarExpanded ? handleClick() : setSidebarExpanded(true)
                          }}
                        >
                          <ClipboardList size={18} />
                          Procesos Conteo
                          <ChevronDown
                            className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && "rotate-180"}`}
                            size={18}
                          />
                        </div>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/cont/conteos" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/cont/conteos")}
                              >
                                <FileSpreadsheet size={16} className="opacity-50" />
                                Conteos
                              </div>
                            </li>
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/conteo-proceso" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/conteo-proceso")}
                              >
                                <Clock size={16} className="opacity-50" />
                                Historial de conteos
                              </div>
                            </li>
                          </ul>
                        </div>
                        {/* Dropdown Menu End */}
                      </React.Fragment>
                    )
                  }}
                </SidebarLinkGroup>

                {/* Menu Item Mantenimientos */}
                <SidebarLinkGroup activeCondition={pathname === "/mant" || pathname.includes("mant")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <div
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 cursor-pointer ${
                            (pathname === "/mant" || pathname.includes("mant")) && "bg-graydark dark:bg-meta-4"
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            sidebarExpanded ? handleClick() : setSidebarExpanded(true)
                          }}
                        >
                          <Tool size={18} />
                          Mantenimientos
                          <ChevronDown
                            className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && "rotate-180"}`}
                            size={18}
                          />
                        </div>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/mant/excepciones" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/mant/excepciones")}
                              >
                                <AlertTriangle size={16} className="opacity-50" />
                                Excepciones
                              </div>
                            </li>
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/mant/case" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/mant/case")}
                              >
                                <CheckSquare size={16} className="opacity-50" />
                                Case excepciones
                              </div>
                            </li>
                          </ul>
                        </div>
                        {/* Dropdown Menu End */}
                      </React.Fragment>
                    )
                  }}
                </SidebarLinkGroup>

                {/* Menu Item Administración */}
                <SidebarLinkGroup activeCondition={pathname === "/auth" || pathname.includes("auth")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <div
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 cursor-pointer ${
                            (pathname === "/auth" || pathname.includes("auth")) && "bg-graydark dark:bg-meta-4"
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            sidebarExpanded ? handleClick() : setSidebarExpanded(true)
                          }}
                        >
                          <Settings size={18} />
                          Administración
                          <ChevronDown
                            className={`absolute right-4 top-1/2 -translate-y-1/2 fill-current ${open && "rotate-180"}`}
                            size={18}
                          />
                        </div>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/auth/signup" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/auth/signup")}
                              >
                                <User size={16} className="opacity-50" />
                                Crear usuario
                              </div>
                            </li>
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/admin/users" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/admin/users")}
                              >
                                <Users size={16} className="opacity-50" />
                                Gestión de Usuarios
                              </div>
                            </li>
                            <li>
                              <div
                                className={`group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white cursor-pointer ${
                                  pathname === "/admin/roles" && "!text-white"
                                }`}
                                onClick={() => handleNavigation("/admin/roles")}
                              >
                                <Settings size={16} className="opacity-50" />
                                Gestión de Roles
                              </div>
                            </li>
                          </ul>
                        </div>
                        {/* Dropdown Menu End */}
                      </React.Fragment>
                    )
                  }}
                </SidebarLinkGroup>
              </ul>
            </div>
          </nav>
          {/* Sidebar Menu */}
        </div>
      </aside>
    </>
  )
}

export default Sidebar
