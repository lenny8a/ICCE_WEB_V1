import React, { useEffect, useRef, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
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
  setSidebarOpen: (arg: boolean) => void
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation()
  const { pathname } = location

  const trigger = useRef<HTMLButtonElement>(null)
  const sidebar = useRef<HTMLElement>(null)

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded")
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true",
  )
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return
      if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return
      setSidebarOpen(false)
    }
    document.addEventListener("click", clickHandler)
    return () => document.removeEventListener("click", clickHandler)
  })

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return
      setSidebarOpen(false)
    }
    document.addEventListener("keydown", keyHandler)
    return () => document.removeEventListener("keydown", keyHandler)
  })

  // Update localStorage and body class when sidebarExpanded changes
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString())
    const body = document.querySelector("body")
    if (body) {
      if (sidebarExpanded) {
        body.classList.add("sidebar-expanded")
      } else {
        body.classList.remove("sidebar-expanded")
      }
    }
  }, [sidebarExpanded])

  // Log cuando cambia el estado del sidebar
  useEffect(() => {
    console.log("Sidebar open state:", sidebarOpen)
  }, [sidebarOpen])

  return (
    <>
      {/* Overlay para dispositivos móviles */}
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
          <NavLink to="/" className="flex items-center">
            <img src={Logo || "/placeholder.svg"} alt="ICCE Logo" className="h-19 block" />
          </NavLink>

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
                  <NavLink
                    to="/"
                    className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
                      pathname === "/" && "bg-graydark dark:bg-meta-4"
                    }`}
                    onClick={() => isMobile && setSidebarOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </NavLink>
                </li>

                {/* Menu Item Procesos de Entrada */}
                <SidebarLinkGroup activeCondition={pathname === "/entrada" || pathname.includes("entrada")}>
                  {(handleClick, open) => {
                    return (
                      <React.Fragment>
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
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
                        </NavLink>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/entrada/visualizar"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <Eye size={16} className="opacity-50" />
                                Visualizar case
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/entrada/reubicar"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <MapPin size={16} className="opacity-50" />
                                Ubicar case
                              </NavLink>
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
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
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
                        </NavLink>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/salida/picking"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <ShoppingCart size={16} className="opacity-50" />
                                Picking
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/salida/sal_merca"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <Truck size={16} className="opacity-50" />
                                Salida de Mercancias
                              </NavLink>
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
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
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
                        </NavLink>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/cont/conteos"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <FileSpreadsheet size={16} className="opacity-50" />
                                Conteos
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/conteo-proceso"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <Clock size={16} className="opacity-50" />
                                Historial de conteos
                              </NavLink>
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
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
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
                        </NavLink>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/mant/excepciones"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <AlertTriangle size={16} className="opacity-50" />
                                Excepciones
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/mant/case"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <CheckSquare size={16} className="opacity-50" />
                                Case excepciones
                              </NavLink>
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
                        <NavLink
                          to="#"
                          className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4 ${
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
                        </NavLink>
                        {/* Dropdown Menu Start */}
                        <div className={`translate transform overflow-hidden ${!open && "hidden"}`}>
                          <ul className="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
                            <li>
                              <NavLink
                                to="/auth/signup"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <User size={16} className="opacity-50" />
                                Crear usuario
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/admin/users"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <Users size={16} className="opacity-50" />
                                Gestión de Usuarios
                              </NavLink>
                            </li>
                            <li>
                              <NavLink
                                to="/admin/roles"
                                className={({ isActive }) =>
                                  "group relative flex items-center gap-2.5 rounded-md px-4 font-medium text-bodydark2 duration-300 ease-in-out hover:text-white " +
                                  (isActive && "!text-white")
                                }
                                onClick={() => isMobile && setSidebarOpen(false)}
                              >
                                <Settings size={16} className="opacity-50" />
                                Gestión de Roles
                              </NavLink>
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
