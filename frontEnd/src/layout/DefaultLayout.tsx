"use client"

import type React from "react"
import { useState, useEffect, useCallback, type ReactNode } from "react"
import Header from "../components/Header"
import Sidebar from "../components/Sidebar"
import { initializeSidebar } from "../components/Utils/sidebar-init"

interface DefaultLayoutProps {
  children: ReactNode
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  // Inicializar sidebarOpen basado en el tamaño de la pantalla
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // En el primer render, verificamos si estamos en móvil o desktop
    return window.innerWidth >= 1024
  })
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)

  // Inicializar el script de sidebar
  useEffect(() => {
    const cleanup = initializeSidebar()
    return cleanup
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 1024
      setIsMobile(newIsMobile)

      // Si cambiamos de móvil a desktop, abrimos el sidebar
      if (!newIsMobile && isMobile) {
        setSidebarOpen(true)
      }

      // Si cambiamos de desktop a móvil, cerramos el sidebar
      if (newIsMobile && !isMobile) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobile])

  // Función para manejar el toggle del sidebar
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [sidebarOpen])

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Start ===== --> */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={handleSidebarToggle} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">{children}</div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </div>
  )
}

export default DefaultLayout
