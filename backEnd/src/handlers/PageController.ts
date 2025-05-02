import type { Request, Response } from "express"
import Page from "../models/Page"
import Permission from "../models/Permission"

// Create a new page
export const createPage = async (req: Request, res: Response) => {
  try {
    const { name, path, description } = req.body

    // Check if page already exists
    const existingPage = await Page.findOne({
      $or: [{ name }, { path }],
    })

    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: "La página ya existe",
      })
    }

    // Create new page
    const page = new Page({
      name,
      path,
      description,
    })

    await page.save()

    return res.status(201).json({
      success: true,
      message: "Página creada exitosamente",
      data: page,
    })
  } catch (error) {
    console.error("Error al crear página:", error)
    return res.status(500).json({
      success: false,
      message: "Error al crear página",
      error: (error as Error).message,
    })
  }
}

// Get all pages
export const getAllPages = async (req: Request, res: Response) => {
  try {
    const pages = await Page.find()

    return res.status(200).json({
      success: true,
      message: "Páginas obtenidas exitosamente",
      data: pages,
    })
  } catch (error) {
    console.error("Error al obtener páginas:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener páginas",
      error: (error as Error).message,
    })
  }
}

// Get page by ID
export const getPageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const page = await Page.findById(id)

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Página no encontrada",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Página obtenida exitosamente",
      data: page,
    })
  } catch (error) {
    console.error("Error al obtener página:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener página",
      error: (error as Error).message,
    })
  }
}

// Update page
export const updatePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { name, path, description, isActive } = req.body

    // Check if page exists
    const page = await Page.findById(id)

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Página no encontrada",
      })
    }

    // Check if name or path already exists (if changed)
    if (name !== page.name || path !== page.path) {
      const existingPage = await Page.findOne({
        $or: [
          { name, _id: { $ne: id } },
          { path, _id: { $ne: id } },
        ],
      })

      if (existingPage) {
        return res.status(400).json({
          success: false,
          message: "El nombre o ruta de la página ya existe",
        })
      }
    }

    // Update page
    const updatedPage = await Page.findByIdAndUpdate(
      id,
      {
        name,
        path,
        description,
        isActive: isActive !== undefined ? isActive : page.isActive,
      },
      { new: true },
    )

    return res.status(200).json({
      success: true,
      message: "Página actualizada exitosamente",
      data: updatedPage,
    })
  } catch (error) {
    console.error("Error al actualizar página:", error)
    return res.status(500).json({
      success: false,
      message: "Error al actualizar página",
      error: (error as Error).message,
    })
  }
}

// Delete page (soft delete)
export const deletePage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Check if page exists
    const page = await Page.findById(id)

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Página no encontrada",
      })
    }

    // Check if page is used in any permission
    const permissionsWithPage = await Permission.countDocuments({ page: id })

    if (permissionsWithPage > 0) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar la página porque está asignada a permisos",
      })
    }

    // Soft delete (set isActive to false)
    page.isActive = false
    await page.save()

    return res.status(200).json({
      success: true,
      message: "Página eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error al eliminar página:", error)
    return res.status(500).json({
      success: false,
      message: "Error al eliminar página",
      error: (error as Error).message,
    })
  }
}
