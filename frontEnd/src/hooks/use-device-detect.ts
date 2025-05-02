"use client"

import { useState, useEffect } from "react"

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isHandheld: boolean
}

export const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isHandheld: false,
  })

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Detectar si es un dispositivo handheld específico (480x800)
      const isHandheld = width <= 480 && height <= 800

      // Detectar si es móvil (menos de 768px)
      const isMobile = width < 768

      // Detectar si es tablet (entre 768px y 1024px)
      const isTablet = width >= 768 && width < 1024

      // Detectar si es desktop (más de 1024px)
      const isDesktop = width >= 1024

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isHandheld,
      })
    }

    // Ejecutar al montar el componente
    handleResize()

    // Agregar listener para cambios de tamaño
    window.addEventListener("resize", handleResize)

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return deviceInfo
}
