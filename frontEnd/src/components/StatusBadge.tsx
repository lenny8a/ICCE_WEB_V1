import type React from "react"

interface StatusBadgeProps {
  status: string
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "procesado":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "contabilizado":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "cancelado":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "completado":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "en proceso":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    const statusLower = status.toLowerCase()

    // Capitalize first letter
    return statusLower.charAt(0).toUpperCase() + statusLower.slice(1)
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(status)}`}
    >
      {getStatusText(status)}
    </span>
  )
}

export default StatusBadge
