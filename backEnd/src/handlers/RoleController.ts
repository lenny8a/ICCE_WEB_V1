import type { Request, Response } from "express"
import Role from "../models/Role"
import User from "../models/Users"
import Permission from "../models/Permission"

// Create a new role
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body

    // Check if role already exists
    const existingRole = await Role.findOne({ name })

    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "El rol ya existe",
      })
    }

    // Create new role
    const role = new Role({
      name,
      description,
    })

    await role.save()

    return res.status(201).json({
      success: true,
      message: "Rol creado exitosamente",
      data: role,
    })
  } catch (error) {
    console.error("Error al crear rol:", error)
    return res.status(500).json({
      success: false,
      message: "Error al crear rol",
      error: (error as Error).message,
    })
  }
}

// Get all roles
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find()

    return res.status(200).json({
      success: true,
      message: "Roles obtenidos exitosamente",
      data: roles,
    })
  } catch (error) {
    console.error("Error al obtener roles:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener roles",
      error: (error as Error).message,
    })
  }
}

// Get role by ID
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const role = await Role.findById(id)

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Rol obtenido exitosamente",
      data: role,
    })
  } catch (error) {
    console.error("Error al obtener rol:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener rol",
      error: (error as Error).message,
    })
  }
}

// Update role
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, description, isActive } = req.body

    // Check if role exists
    const role = await Role.findById(id)

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      })
    }

    // Check if name already exists (if changed)
    if (name !== role.name) {
      const existingRole = await Role.findOne({ name })

      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: "El nombre del rol ya existe",
        })
      }
    }

    // Update role
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        name,
        description,
        isActive: isActive !== undefined ? isActive : role.isActive,
      },
      { new: true },
    )

    return res.status(200).json({
      success: true,
      message: "Rol actualizado exitosamente",
      data: updatedRole,
    })
  } catch (error) {
    console.error("Error al actualizar rol:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar rol",
      error: (error as Error).message,
    })
  }
}

// Delete role (soft delete)
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if role exists
    const role = await Role.findById(id)

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      })
    }

    // Check if role is assigned to any user
    const usersWithRole = await User.countDocuments({ roles: id })

    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar el rol porque está asignado a usuarios",
      })
    }

    // Soft delete (set isActive to false)
    role.isActive = false
    await role.save()

    return res.status(200).json({
      success: true,
      message: "Rol eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar rol:", error)
    return res.status(500).json({
      success: false,
      message: "Error al eliminar rol",
      error: (error as Error).message,
    })
  }
}

// Get role permissions
export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
console.log("ID del rol:", id)
    // Check if role exists
    const role = await Role.findById(id)

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Rol no encontrado",
      })
    }

    // Get permissions for this role
    const permissions = await Permission.find({ role: id }).populate("page")

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
