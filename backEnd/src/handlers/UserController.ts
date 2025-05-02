import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import User from "../models/Users"
import Role from "../models/Role"
import Permission from "../models/Permission"

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email, firstName, lastName, roles } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El usuario o correo ya existe",
      })
    }

    // Validate roles if provided
    if (roles && roles.length > 0) {
      const validRoles = await Role.find({ _id: { $in: roles } })
      if (validRoles.length !== roles.length) {
        return res.status(400).json({
          success: false,
          message: "Uno o más roles no existen",
        })
      }
    }

    // Create new user
    const user = new User({
      username,
      password,
      email,
      firstName,
      lastName,
      roles: roles || [],
    })

    await user.save()

    // Return success without password
    const userResponse = user.toObject() as { password?: string; [key: string]: any }
    delete userResponse.password

    return res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: userResponse,
    })
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return res.status(500).json({
      success: false,
      message: "Error al registrar usuario",
      error: (error as Error).message,
    })
  }
}

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    console.log("Login request body:", req.body) // Log the request body for debugging
    const { username, password } = req.body

    // Find user
    const user = await User.findOne({ username }).populate("roles")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Usuario desactivado",
      })
    }

    // Verify password
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "8h" })

    // Return user info and token
    const userResponse = user.toObject()
    delete userResponse.password

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: {
        user: userResponse,
        token,
      },
    })
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error: (error as Error).message,
    })
  }
}

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password").populate("roles")

    return res.status(200).json({
      success: true,
      message: "Usuarios obtenidos exitosamente",
      data: users,
    })
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener usuarios",
      error: (error as Error).message,
    })
  }
}

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const user = await User.findById(id).select("-password").populate("roles")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Usuario obtenido exitosamente",
      data: user,
    })
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener usuario",
      error: (error as Error).message,
    })
  }
}

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { username, email, firstName, lastName, roles, isActive } = req.body

    // Check if user exists
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Check if username or email already exists (if changed)
    if (username !== user.username || email !== user.email) {
      const existingUser = await User.findOne({
        $or: [
          { username, _id: { $ne: id } },
          { email, _id: { $ne: id } },
        ],
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "El usuario o correo ya existe",
        })
      }
    }

    // Validate roles if provided
    if (roles && roles.length > 0) {
      const validRoles = await Role.find({ _id: { $in: roles } })
      if (validRoles.length !== roles.length) {
        return res.status(400).json({
          success: false,
          message: "Uno o más roles no existen",
        })
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        username,
        email,
        firstName,
        lastName,
        roles: roles || user.roles,
        isActive: isActive !== undefined ? isActive : user.isActive,
      },
      { new: true },
    )
      .select("-password")
      .populate("roles")

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: updatedUser,
    })
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar usuario",
      error: (error as Error).message,
    })
  }
}

// Update user password
export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { currentPassword, newPassword } = req.body

    // Check if user exists
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error al actualizar contraseña:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar contraseña",
      error: (error as Error).message,
    })
  }
}

// Delete user (soft delete)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if user exists
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Soft delete (set isActive to false)
    user.isActive = false
    await user.save()

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    return res.status(500).json({
      success: false,
      message: "Error al eliminar usuario",
      error: (error as Error).message,
    })
  }
}

// Get user permissions
export const getUserPermissions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if user exists
    const user = await User.findById(id).populate("roles")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Get role IDs
    const roleIds = user.roles.map((role) => role._id)

    // Get permissions for these roles
    const permissions = await Permission.find({ role: { $in: roleIds } })
      .populate("role")
      .populate("page")

    // Format permissions by page
    const formattedPermissions: Record<string, any> = {}

    permissions.forEach((permission) => {
      const page = permission.page as any

      if (!formattedPermissions[page.path]) {
        formattedPermissions[page.path] = {
          name: page.name,
          path: page.path,
          description: page.description,
          actions: [],
        }
      }

      // Add unique actions
      permission.actions.forEach((action) => {
        if (!formattedPermissions[page.path].actions.includes(action)) {
          formattedPermissions[page.path].actions.push(action)
        }
      })
    })

    return res.status(200).json({
      success: true,
      message: "Permisos obtenidos exitosamente",
      data: Object.values(formattedPermissions),
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

// Reset password without authentication (forgot password)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email y nueva contraseña son requeridos",
      });
    }
    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado con ese correo",
      });
    }
    user.password = newPassword; // El hash se realiza en el modelo
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    return res.status(500).json({
      success: false,
      message: "Error al restablecer contraseña",
      error: (error as Error).message,
    });
  }
};
