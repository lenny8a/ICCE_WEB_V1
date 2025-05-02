import Toast, { type ToastProps } from "./Toast"

interface ToastContainerProps {
  toasts: ToastProps[]
  removeToast: (id: string) => void
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center"
}

const ToastContainer = ({ toasts, removeToast, position = "top-right" }: ToastContainerProps) => {
  // Determinar las clases de posición
  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-16 right-4 ml-0 lg:ml-72.5"
      case "top-left":
        return "top-16 left-4"
      case "bottom-right":
        return "bottom-4 right-4 ml-0 lg:ml-72.5"
      case "bottom-left":
        return "bottom-4 left-4"
      case "top-center":
        return "top-16 left-1/2 transform -translate-x-1/2"
      case "bottom-center":
        return "bottom-4 left-1/2 transform -translate-x-1/2"
      default:
        return "top-16 right-4 ml-0 lg:ml-72.5"
    }
  }

  if (toasts.length === 0) return null

  return (
    <div
      className={`fixed z-[9999] flex flex-col gap-2 ${getPositionClasses()}`}
      style={{ minWidth: "250px", maxWidth: "90vw" }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  )
}

export default ToastContainer

