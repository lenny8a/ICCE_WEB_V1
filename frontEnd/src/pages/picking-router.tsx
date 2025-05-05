"use client"

import { useEffect, useState } from "react"
import PickingComplete from "./Picking"
import PickingMobile from "./picking-complete-mobile"
import useDeviceDetect from "../hooks/use-device-detect"

const PickingRouter = () => {
  const { isSmallMobile } = useDeviceDetect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Durante SSR o antes de montar, devolver null o un indicador de carga
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Después de montar, renderizar el componente apropiado según el tamaño de la pantalla
  return isSmallMobile ? <PickingMobile /> : <PickingComplete />
}

export default PickingRouter
