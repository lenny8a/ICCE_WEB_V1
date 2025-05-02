import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User from "../models/Users"

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Acceso no autorizado. Token no proporcionado",
      })
    }

    const token = authHeader.split(" ")[1]

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if user exists
    const user = await User.findById(decoded.id).select("-password")

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Acceso no autorizado. Usuario no válido",
      })
    }

    // Attach user to request
    req.user = user

    next()
  } catch (error) {
    console.error("Error de autenticación:", error)
    return res.status(401).json({
      success: false,
      message: "Acceso no autorizado. Token inválido",
    })
  }
}

// Permission middleware
export const hasPermission = (pagePath: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Import here to avoid circular dependency
      const { checkPermission } = require("../controllers/permissionController")

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
