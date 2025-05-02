import type { Request, Response, NextFunction } from "express"
import type { ActionType } from "../models/Permission"
import { checkPermission } from "../handlers/PermissionController"

export const hasPermission = (pagePath: string, action: ActionType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Acceso no autorizado. Usuario no autenticado",
        })
      }

      const hasAccess = await checkPermission(req.user._id, pagePath, action)

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado. No tiene permiso para realizar esta acción",
        })
      }

      next()
    } catch (error) {
      console.error("Error al verificar permiso:", error)
      return res.status(500).json({
        success: false,
        message: "Error al verificar permiso",
        error: (error as Error).message,
      })
    }
  }
}
