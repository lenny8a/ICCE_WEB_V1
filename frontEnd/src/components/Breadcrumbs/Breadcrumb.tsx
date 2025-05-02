"use client"

import type React from "react"
import { useMobile } from "../../hooks/use-mobile"

interface BreadcrumbProps {
  pageName: string
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ pageName }) => {
  const isMobile = useMobile()

  // Versión móvil
  if (isMobile) {
    return (
      <div className="mb-1 flex items-center">
        <h3 className="text-sm font-medium dark:text-white truncate max-w-[200px] bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
          {pageName}
        </h3>
      </div>
    )
  }

  // Versión de escritorio - exactamente igual al original
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold text-black dark:text-white">
        {pageName}
      </h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
              Dashboard /
          </li>
          <li className="font-medium text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  )
}

export default Breadcrumb