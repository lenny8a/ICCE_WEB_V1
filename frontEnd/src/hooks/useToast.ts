"use client"

// Asegúrate de que la importación de React sea correcta
import { useState, useCallback } from "react"
import { ToastProps } from "../components/Toast"


type ToastType = "success" | "error" | "warning" | "info"

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  // Función para añadir un toast
  const addToast = useCallback((message: string, type: ToastType = "info", duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newToast: ToastProps = {
      id,
      message,
      type,
      duration,
      onClose: removeToast,
    }
    setToasts((prevToasts) => [...prevToasts, newToast])
    return id
  }, [])

  // Función para eliminar un toast
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  // Funciones de conveniencia para diferentes tipos de toast
  const success = useCallback(
    (message: string, duration?: number) => addToast(message, "success", duration),
    [addToast],
  )

  const error = useCallback((message: string, duration?: number) => addToast(message, "error", duration), [addToast])

  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, "warning", duration),
    [addToast],
  )

  const info = useCallback((message: string, duration?: number) => addToast(message, "info", duration), [addToast])

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }
}

