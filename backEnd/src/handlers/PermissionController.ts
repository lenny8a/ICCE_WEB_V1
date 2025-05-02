import type { Request, Response } from "express"
import Permission, { ActionType } from "../models/Permission"
import Role from "../models/Role"
import Page from "../models/Page"
import User from "../models/Users"

// Set permissions for a role and page
export const setPermissions = async (req: Request, res: Response) => {
  try {
    const { roleId, pageId, actions } = req.body

    // Validate role
    const role = await Role.findById(roleId)
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      })
    }

    // Validate page
    const page = await Page.findById(pageId)
    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Página no encontrada",
      })
    }

    // Validate actions
    const validActions = Object.values(ActionType)
    const invalidActions = actions.filter((action: string) => !validActions.includes(action as ActionType))

    if (invalidActions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Acciones inválidas: ${invalidActions.join(", ")}`,
      })
    }

    // Find existing permission or create new one
    let permission = await Permission.findOne({ role: roleId, page: pageId })

    if (permission) {
      // Update existing permission
      permission.actions = actions
      await permission.save()
    } else {
      // Create new permission
      permission = new Permission({
        role: roleId,
        page: pageId,
        actions,
      })
      await permission.save()
    }

    return res.status(200).json({
      success: true,
      message: "Permisos establecidos exitosamente",
      data: permission,
    })
  } catch (error) {
    console.error("Error al establecer permisos:", error)
    return res.status(500).json({
      success: false,
      message: "Error al establecer permisos",
      error: (error as Error).message,
    })
  }
}

// Get all permissions
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await Permission.find().populate("role").populate("page")

    return res.status(200).json({
      success: true,
      message: "Permisos obtenidos exitosamente",
      data: permissions,
    })
  } catch (error) {
    console.error("Error al obtener permisos:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener permisos",
      error: (error as Error).message,
    })
  }
}

// Get permission by ID
export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const permission = await Permission.findById(id).populate("role").populate("page")

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permiso no encontrado",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Permiso obtenido exitosamente",
      data: permission,
    })
  } catch (error) {
    console.error("Error al obtener permiso:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener permiso",
      error: (error as Error).message,
    })
  }
}

// Delete permission
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if permission exists
    const permission = await Permission.findById(id)

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: "Permiso no encontrado",
      })
    }

    // Delete permission
    await Permission.findByIdAndDelete(id)

    return res.status(200).json({
      success: true,
      message: "Permiso eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar permiso:", error)
    return res.status(500).json({
      success: false,
      message: "Error al eliminar permiso",
      error: (error as Error).message,
    })
  }
}

// Check if user has permission
export const checkPermission = async (userId: string, pagePath: string, action: ActionType): Promise<boolean> => {
  try {
    // Get user with roles
    const user = await User.findById(userId).populate("roles")

    if (!user || !user.isActive) {
      return false
    }

    // Get role IDs
    const roleIds = user.roles.map((role) => role._id)

    // Get page by path
    const page = await Page.findOne({ path: pagePath })

    if (!page || !page.isActive) {
      return false
    }

    // Check permissions
    const permission = await Permission.findOne({
      role: { $in: roleIds },
      page: page._id,
      actions: action,
    })

    return !!permission
  } catch (error) {
    console.error("Error al verificar permiso:", error)
    return false
  }
}
