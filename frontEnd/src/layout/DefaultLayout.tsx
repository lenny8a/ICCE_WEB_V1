// components/DefaultLayout.tsx
"use client"

import React, { useState, useEffect, ReactNode } from "react"
import Header from "../components/Header/index"
import Sidebar from "../components/Sidebar/index"

interface DefaultLayoutProps {
  children: ReactNode
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  // Abierto por defecto en desktop, cerrado en móvil
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024)

  // Ajustar estado al redimensionar
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      setSidebarOpen(!mobile)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
          />
          <main className="p-4 md:p-6 2xl:p-10">{children}</main>
        </div>
      </div>
    </div>
  )
}

export default DefaultLayout