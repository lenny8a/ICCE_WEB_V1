import { Request, Response } from 'express'
import { validationResult, body } from 'express-validator';
import slug from 'slug'
// import User from '../models/Users'
import Picking, { IPickingItem } from '../models/Picking'
import { chekPassword, hashPassword } from '../utils/auth'
import axios from 'axios'
import { SortOrder } from 'mongoose'
import UbicacionLog from '../models/UbicacionLog';
import Excepcion from '../models/Excepciones';
import Conteo, { ICase, IMaterial } from '../models/Conteo'

// export const createAccount = async (req: Request, res: Response): Promise<any> => {
//   try {

//     const { email, password } = req.body
//     const userExists = await User.findOne({ email })

//     if (userExists) {
//       const error = new Error('Correo ya existe')
//       return res.status(409).json({ message: error.message })
//     }

//     const handle = slug(req.body.handle, '')
//     const handleExists = await User.findOne({ handle })

//     if (handleExists) {
//       const error = new Error('Nombre de usuario no disponible')
//       return res.status(409).json({ message: error.message })
//     }

//     const user = new User(req.body)
//     user.password = await hashPassword(password)
//     user.handle = handle

//     await user.save();
//     res.status(201).json(user)

//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// }

// export const login = async (req: Request, res: Response): Promise<any> => {

//   const { email, password } = req.body
//   const user = await User.findOne({ email })

//   if (!user) {
//     const error = new Error('El usuario no existe')
//     return res.status(404).json({ message: error.message })
//   }

//   if (!await chekPassword(password, user.password)) {
//     const error = new Error('Password incorrecto')
//     return res.status(401).json({ message: error.message })
//   }

//   res.status(200).json(user)

// }

export const viewEmbal = async (req: Request, res: Response): Promise<any> => {

  const usuario = process.env.SAP_USER;
  const contrasena = process.env.SAP_PASS;

  // Codificar credenciales en Base64
  const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

  try {
    const Response = await axios.post(`${process.env.SAP_API_URL}/zapi/getembal`, req.body, {
      headers: {
        'Authorization': `Basic ${credenciales}`,
        'Accept': 'application/json'
      }
    });
    res.status(200).json(Response.data);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const reubica = async (req: Request, res: Response): Promise<any> => {

  const usuario = process.env.SAP_USER;
  const contrasena = process.env.SAP_PASS;

  // Codificar credenciales en Base64
  const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

  try {
    const Response = await axios.post(`${process.env.SAP_API_URL}/zapi/reubica`, req.body, {
      headers: {
        'Authorization': `Basic ${credenciales}`,
        'Accept': 'application/json'
      }
    });
    res.status(200).json(Response.data);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const excepcion = async (req: Request, res: Response): Promise<any> => {

  const usuario = process.env.SAP_USER;
  const contrasena = process.env.SAP_PASS;

  // Codificar credenciales en Base64
  const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

  try {
    const Response = await axios.post(`${process.env.SAP_API_URL}/zapi/excepcion`, req.body, {
      headers: {
        'Authorization': `Basic ${credenciales}`,
        'Accept': 'application/json'
      }
    });
    res.status(200).json(Response.data);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const excepcionCases = async (req: Request, res: Response): Promise<any> => {

  const usuario = process.env.SAP_USER;
  const contrasena = process.env.SAP_PASS;
  console.log("req.body", req.body)
  // Codificar credenciales en Base64
  const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

  try {
    const Response = await axios.get(`${process.env.SAP_API_URL}/zapi/excepcion`, {
      params: req.body,
      auth: {
        username: usuario,
        password: contrasena
      },
      headers: {
        Accept: "application/json"
      }
    });
    console.log("Response", Response.data)
    res.status(200).json(Response.data);
  } catch (error) {
    console.error("Error en excepcionCases:", error)
    res.status(500).json({ message: error.message })
  }
}

export const reserva = async (req: Request, res: Response): Promise<any> => {

  const usuario = process.env.SAP_USER;
  const contrasena = process.env.SAP_PASS;

  // Codificar credenciales en Base64
  const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

  try {
    const Response = await axios.post(`${process.env.SAP_API_URL}/zapi/reserva`, req.body, {
      headers: {
        'Authorization': `Basic ${credenciales}`,
        'Accept': 'application/json'
      }
    });
    res.status(200).json(Response.data);
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const migo = async (req: Request, res: Response): Promise<any> => {

  const usuario = process.env.SAP_USER;
  const contrasena = process.env.SAP_PASS;

  // Codificar credenciales en Base64
  const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

  try {
    const Response = await axios.post(`${process.env.SAP_API_URL}/zapi/migo`, req.body, {
      headers: {
        'Authorization': `Basic ${credenciales}`,
        'Accept': 'application/json'
      }
    });

    res.status(200).json(Response.data);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const anulaMigo = async (req: Request, res: Response): Promise<any> => {

  const usuario = process.env.SAP_USER;
  const contrasena = process.env.SAP_PASS;

  // Codificar credenciales en Base64
  const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

  try {

    const Response = await axios.post(`${process.env.SAP_API_URL}/zapi/anula_migo`, req.body, {
      headers: {
        'Authorization': `Basic ${credenciales}`,
        'Accept': 'application/json'
      }
    });

    res.status(200).json(Response.data);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}


// Interfaces for requests
interface SavePickingRequest extends Request {
  body: {
    reserva: string
    items: IPickingItem[]
    status?: "pending" | "processing" | "completed" | "cancelled"
    tipodoc: string
  }
  user?: {
    username: string
  }
}

interface GetPickingRequest extends Request {
  params: {
    reserva: string
  }
}

interface ListPickingsRequest extends Request {
  query: {
    page?: string
    limit?: string
    status?: "pending" | "processing" | "completed" | "cancelled" | "accounted"
  }
}

interface UpdatePickingStatusRequest extends Request {
  params: {
    reserva: string
  }
  body: {
    status: "pending" | "processing" | "completed" | "cancelled" | "accounted",
    mblnr?: string
    anulado?: boolean
    mblnr_an?: string
  }
}

// Controller to save a new picking or update an existing one
export const savePicking = async (req: SavePickingRequest, res: Response): Promise<void> => {
  try {
    console.log("req.body", req.body)
    const { reserva, items, status = "pending", tipodoc } = req.body

    // Verificar si ya existe un picking para esta reserva
    const existingPicking = await Picking.findOne({ reserva })

    if (existingPicking) {
      // Actualizar el picking existente
      existingPicking.items = items
      existingPicking.totalItems = items.length

      // Solo actualizar el estado si se proporciona explícitamente o si está actualmente en 'pending'
      if (status === "completed" || existingPicking.status === "pending") {
        existingPicking.status = status
      }

      existingPicking.updatedAt = new Date()

      await existingPicking.save()

      res.status(200).json({
        success: true,
        message: "Picking actualizado correctamente",
        data: existingPicking,
      })
      return
    }


    console.log("recibe en picking", req)
    // Crear un nuevo documento de picking
    const newPicking = new Picking({
      reserva,
      items,
      totalItems: items.length,
      status, // Usar el estado proporcionado o el valor predeterminado 'pending'
      createdBy: req.user?.username || "system",
      tipodoc,
    })


    console.log("Nuevo picking:", newPicking)
    // Guardar en la base de datos
    await newPicking.save()

    res.status(201).json({
      success: true,
      message: "Picking guardado correctamente",
      data: newPicking,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// Controller to get a picking by reservation number
export const getPickingByReserva = async (req: GetPickingRequest, res: Response): Promise<void> => {
  try {
    const { reserva } = req.params

    const picking = await Picking.findOne({ reserva })

    if (!picking) {
      res.status(404).json({
        success: false,
        message: "No se encontró picking para esta reserva",
      })
      return
    }

    res.status(200).json({
      success: true,
      data: picking,
    })
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// Controller to update the status of a picking
export const updatePickingStatus = async (req: UpdatePickingStatusRequest, res: Response): Promise<void> => {
  try {
    const { reserva } = req.params
    const { status, mblnr, anulado, mblnr_an } = req.body

    const picking = await Picking.findOne({ reserva })

    if (!picking) {
      res.status(404).json({
        success: false,
        message: "No se encontró picking para esta reserva",
      })
      return
    }

    // Update status
    picking.status = status
    picking.updatedAt = new Date()

    // Si se proporciona un MBLNR, actualizarlo
    if (mblnr) {
      picking.mblnr = mblnr
    }

    // Si se indica anulación, actualizar los campos correspondientes
    if (anulado !== undefined) {
      picking.anulado = anulado
    }

    // Si se proporciona un código de anulación, actualizarlo
    if (req.body.mblnr_an) {
      picking.mblnr_an = req.body.mblnr_an
    }

    await picking.save()

    res.status(200).json({
      success: true,
      message: `Estado del picking actualizado a '${status}'${mblnr ? ` con código MBLNR: ${mblnr}` : ""}${mblnr_an ? ` y código de anulación: ${mblnr_an}` : ""}`,
      data: picking,
    })
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// Controller to list all pickings (with pagination)
export const getAllPickings = async (req: ListPickingsRequest, res: Response): Promise<void> => {
  try {
    const { page = "1", limit = "10", status } = req.query

    const query: { status?: string } = {}
    if (status) query.status = status

    const options = {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      sort: { createdAt: -1 } as { [key: string]: SortOrder },
    }

    const pickings = await Picking.find(query)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit)
      .sort(options.sort)

    const total = await Picking.countDocuments(query)

    res.status(200).json({
      success: true,
      data: pickings,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        pages: Math.ceil(total / options.limit),
      },
    })
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// Controller to check if a reservation has a picking and its status
export const checkReservaStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reserva } = req.query

    if (!reserva) {
      res.status(400).json({
        success: false,
        message: "Se requiere el número de reserva",
      })
      return
    }

    const picking = await Picking.findOne({ reserva: reserva.toString() })

    if (!picking) {
      res.status(404).json({
        success: false,
        message: "No se encontró picking para esta reserva",
      })
      return
    }

    res.status(200).json({
      success: true,
      message: "Picking encontrado",
      data: {
        reserva: picking.reserva,
        status: picking.status,
        totalItems: picking.totalItems,
        items: picking.items,
        createdAt: picking.createdAt,
        updatedAt: picking.updatedAt,
        createdBy: picking.createdBy,
      },
    })
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}


interface LogUbicacionRequest extends Request {
  body: {
    embal: string
    ubicacionAnterior: string
    ubicacionNueva: string
    usuario: string
    matnr?: string
    maktx?: string
  }
}

interface GetLogsRequest extends Request {
  params: {
    embal: string
  }
  query: {
    limit?: string
  }
}

// Controlador para registrar un cambio de ubicación
export const logUbicacion = async (req: LogUbicacionRequest, res: Response): Promise<void> => {
  try {
    const { embal, ubicacionAnterior, ubicacionNueva, usuario, matnr, maktx } = req.body

    if (!embal || !ubicacionNueva) {
      res.status(400).json({
        success: false,
        message: "Datos incompletos para el registro de ubicación",
      })
      return
    }

    // Crear un nuevo registro de log
    const newLog = new UbicacionLog({
      embal,
      ubicacionAnterior: ubicacionAnterior || "",
      ubicacionNueva,
      usuario: usuario || "sistema",
      fecha: new Date(),
      matnr,
      maktx,
    })

    // Guardar en la base de datos
    await newLog.save()

    res.status(201).json({
      success: true,
      message: "Cambio de ubicación registrado correctamente",
      data: newLog,
    })
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// Controlador para obtener el historial de ubicaciones de un case
export const getUbicacionLogs = async (req: GetLogsRequest, res: Response): Promise<void> => {
  try {
    const { embal } = req.params
    const { limit = "10" } = req.query

    if (!embal) {
      res.status(400).json({
        success: false,
        message: "Se requiere el número de case",
      })
      return
    }

    // Buscar los logs de ubicación para el case especificado
    const logs = await UbicacionLog.find({ embal })
      .sort({ fecha: -1 }) // Ordenar por fecha descendente (más reciente primero)
      .limit(Number.parseInt(limit))

    res.status(200).json({
      success: true,
      data: logs,
      count: logs.length,
    })
  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}


export const test = async (req: Request, res: Response): Promise<any> => {

  res.send('Hola mundo')
}


// Interfaces para las solicitudes
interface CreateExcepcionRequest extends Request {
  body: {
    id: string
    name: string
    active: boolean
  }
}

interface UpdateExcepcionRequest extends Request {
  params: {
    id: string
  }
  body: {
    name?: string
    active?: boolean
  }
}

// Controlador para obtener todas las excepciones
export const getAllExcepciones = async (_req: Request, res: Response): Promise<void> => {
  try {
    const excepciones = await Excepcion.find().sort({ id: 1 })

    res.status(200).json({
      success: true,
      data: excepciones,
    })
  } catch (error) {
    console.error("Error al obtener excepciones:", error)
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// Controlador para crear una nueva excepción
export const createExcepcion = async (req: CreateExcepcionRequest, res: Response): Promise<void> => {
  try {
    const { id, name, active } = req.body

    // Verificar si ya existe una excepción con el mismo ID
    const existingExcepcion = await Excepcion.findOne({ id })
    if (existingExcepcion) {
      res.status(409).json({
        success: false,
        message: `Ya existe una excepción con el código ${id}`,
      })
      return
    }

    // Crear nueva excepción
    const newExcepcion = new Excepcion({
      id,
      name,
      active: active !== undefined ? active : true,
    })

    // Guardar en la base de datos
    await newExcepcion.save()

    res.status(201).json({
      success: true,
      message: "Excepción creada correctamente",
      data: newExcepcion,
    })
  } catch (error) {
    console.error("Error al crear excepción:", error)
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// Controlador para actualizar una excepción existente
export const updateExcepcion = async (req: UpdateExcepcionRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { name, active } = req.body

    // Buscar la excepción por ID de MongoDB
    const excepcion = await Excepcion.findById(id)

    if (!excepcion) {
      res.status(404).json({
        success: false,
        message: "Excepción no encontrada",
      })
      return
    }

    // Actualizar los campos proporcionados
    if (name !== undefined) excepcion.name = name
    if (active !== undefined) excepcion.active = active

    // Guardar los cambios
    await excepcion.save()

    res.status(200).json({
      success: true,
      message: "Excepción actualizada correctamente",
      data: excepcion,
    })
  } catch (error) {
    console.error("Error al actualizar excepción:", error)
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// Controlador para eliminar una excepción
export const deleteExcepcion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Buscar y eliminar la excepción por ID de MongoDB
    const excepcion = await Excepcion.findByIdAndDelete(id)

    if (!excepcion) {
      res.status(404).json({
        success: false,
        message: "Excepción no encontrada",
      })
      return
    }

    res.status(200).json({
      success: true,
      message: "Excepción eliminada correctamente",
    })
  } catch (error) {
    console.error("Error al eliminar excepción:", error)
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

// Consultar conteo
export const getConteo = async (req: Request, res: Response): Promise<any> => {

  const usuario = process.env.SAP_USER;
  const contrasena = process.env.SAP_PASS;

  // Codificar credenciales en Base64
  const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

  try {

    const Response = await axios.post(`${process.env.SAP_API_URL}/zapi/conteo`, req.body, {
      headers: {
        'Authorization': `Basic ${credenciales}`,
        'Accept': 'application/json' 
      }
    });

    res.status(200).json(Response.data);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
// Función para obtener la hora actual en formato HH:MM:SS
const getCurrentTime = (): string => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`
}

// Función para normalizar el IBLNR (quitar ceros a la izquierda y espacios)
const normalizeIBLNR = (iblnr: string): string => {
  // Primero eliminar espacios
  const trimmed = iblnr.trim()
  // Luego eliminar ceros a la izquierda
  return trimmed.replace(/^0+/, "")
}

// Añadir esta nueva función para obtener el conteo directamente de la base de datos
export const getConteoDB = async (req: Request, res: Response) => {
  try {
    const { conteo } = req.body

    if (!conteo) {
      return res.status(400).json({ message: "El número de conteo es requerido" })
    }
    
    // Normalizar el IBLNR para la búsqueda
    const normalizedConteo = normalizeIBLNR(conteo.toString())
    console.log("Buscando conteo en DB (normalizado):", normalizedConteo)

    // Buscar en la base de datos usando una expresión regular para hacer la búsqueda insensible a ceros y espacios
    const conteoExistente = await Conteo.findOne({
      $or: [
        { IBLNR: normalizedConteo },
        { IBLNR: conteo.toString() },
        { IBLNR: { $regex: new RegExp(`^0*${normalizedConteo}\\s*$`) } },
      ],
    })

    console.log("conteoExistente", conteoExistente)

    if (conteoExistente) {
      return res.status(200).json(conteoExistente)
    } else {
      return res.status(404).json({ message: "Conteo no encontrado en la base de datos" })
    }
  } catch (error) {
    console.error("Error al obtener conteo de la base de datos:", error)
    return res.status(500).json({ message: "Error al obtener conteo", error: error.message })
  }
}

// Modificar la función getConteo para siempre obtener los materiales originales
export const getConteol = async (req: Request, res: Response) => {
  try {
    const { conteo } = req.body

    if (!conteo) {
      return res.status(400).json({ message: "El número de conteo es requerido" })
    }

    // Normalizar el IBLNR para la búsqueda
    const normalizedConteo = normalizeIBLNR(conteo.toString())
    console.log("Buscando conteo (normalizado):", normalizedConteo)

    // Variable para almacenar los materiales originales
    let materialesOriginales = null

    // Siempre intentar obtener los materiales originales del sistema externo primero
    try {
  
      const usuario = process.env.SAP_USER;
      const contrasena = process.env.SAP_PASS;
      const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');
      const apiUrl = process.env.API_URL || ""

      const originalResponse = await axios.post(`${process.env.SAP_API_URL}/zapi/conteo`, {conteo}, {
        headers: {
          'Authorization': `Basic ${credenciales}`,
          'Accept': 'application/json' 
        }
      });
      console.log("Respuesta de materiales originales:", originalResponse.data)
      if (originalResponse.data.len) {
        console.log("Materiales originales obtenidos:", originalResponse.data.MATERIALES.length)
        materialesOriginales = originalResponse.data
      } else {
        console.log("No se encontraron materiales originales en la respuesta")
      }
    } catch (error) {
      console.error("Error al obtener materiales originales:", error)
      // Si falla, continuamos con el flujo normal
    }

    // Si no se pudieron obtener los materiales originales, intentar con el endpoint principal
    if (!materialesOriginales) {
      try {
        const apiUrl = process.env.API_URL || ""
        console.log("Intentando obtener desde endpoint principal:", `${apiUrl}/cont/conteo`)
        const mainResponse = await axios.post(`${apiUrl}/cont/conteo`, { conteo })

        if (mainResponse.data) {
          console.log("Datos obtenidos del endpoint principal")
          materialesOriginales = mainResponse.data
        }
      } catch (error) {
        console.error("Error al obtener desde endpoint principal:", error)
        // Si falla, continuamos con el flujo normal
      }
    }

    // Buscar en nuestra base de datos usando una expresión regular para hacer la búsqueda insensible a ceros y espacios
    const conteoExistente = await Conteo.findOne({
      $or: [
        { IBLNR: normalizedConteo },
        { IBLNR: conteo.toString() },
        { IBLNR: { $regex: new RegExp(`^0*${normalizedConteo}\\s*$`) } },
      ],
    })

    console.log("conteoExistente en DB:", conteoExistente ? conteoExistente.IBLNR : "No encontrado")

    // Si existe en nuestra base de datos
    if (conteoExistente) {
      // Convertir a objeto plano para poder modificarlo
      const conteoData = conteoExistente.toObject()

      // Asegurar que el estado estépresente
      conteoData.estado = conteoData.estado || "pendiente"

      // Si tenemos materiales originales, actualizar la información en el conteo existente
      if (materialesOriginales && materialesOriginales.MATERIALES) {
        conteoData.materiales = materialesOriginales.MATERIALES
        console.log("Materiales actualizados con datos originales")
      } else if (!conteoData.materiales || conteoData.materiales.length === 0) {
        // Si no hay materiales en el conteo existente y no pudimos obtener originales, intentar una vez más
        try {
          const apiUrl = process.env.API_URL || ""
          const lastAttemptResponse = await axios.post(`${apiUrl}/cont/conteo-original`, { conteo })

          if (lastAttemptResponse.data && lastAttemptResponse.data.MATERIALES) {
            conteoData.materiales = lastAttemptResponse.data.MATERIALES
            console.log("Materiales obtenidos en último intento")
          }
        } catch (error) {
          console.error("Error en último intento de obtener materiales:", error)
        }
      }

      return res.status(200).json(conteoData)
    }

    // Si no existe en nuestra base de datos y tenemos materiales originales
    if (materialesOriginales) {
      return res.status(200).json({
        ...materialesOriginales,
        estado: "nuevo", // Marcar como nuevo si viene del sistema externo
      })
    }

    // Si llegamos aquí, no pudimos obtener datos de ninguna fuente
    return res.status(404).json({ message: "Conteo no encontrado en ninguna fuente" })
  } catch (error) {
    console.error("Error al obtener conteo:", error)
    return res.status(500).json({ message: "Error al obtener conteo", error: error.message })
  }
}

// Modificar la función saveConteo para incluir el estado y normalizar el IBLNR
export const saveConteo = async (req: Request, res: Response) => {
  try {
    const { conteoData, materialCasesMap, usuarioCreador } = req.body

    if (!conteoData || !materialCasesMap || !usuarioCreador) {
      return res.status(400).json({ message: "Datos incompletos para guardar el conteo" })
    }

    // Normalizar el IBLNR antes de guardar
    const normalizedIBLNR = normalizeIBLNR(conteoData.IBLNR.toString())
    console.log("Guardando conteo con IBLNR normalizado:", normalizedIBLNR)

    // Verificar si ya existe un conteo con ese número (usando la búsqueda flexible)
    const conteoExistente = await Conteo.findOne({
      $or: [
        { IBLNR: normalizedIBLNR },
        { IBLNR: conteoData.IBLNR.toString() },
        { IBLNR: { $regex: new RegExp(`^0*${normalizedIBLNR}\\s*$`) } },
      ],
    })

    // Preparar los materiales con sus cases registrados
    const materialesActualizados: IMaterial[] = []

    // Recorrer el mapa de cases por material
    for (const [matnr, cases] of Object.entries(materialCasesMap)) {
      // Buscar el material original en los datos del conteo
      const materialOriginal = conteoData.MATERIALES.find((m: any) => m.MATNR === matnr)

      if (materialOriginal) {
        // Crear el objeto de material para guardar
        const material: IMaterial = {
          MATNR: materialOriginal.MATNR,
          MAKTX: materialOriginal.MAKTX,
          MENGE: materialOriginal.MENGE || "",
          MEINS: materialOriginal.MEINS || "",
          casesRegistrados: cases as ICase[],
        }

        materialesActualizados.push(material)
      }
    }

    const horaActual = getCurrentTime()

    if (conteoExistente) {
      // Si existe, actualizar
      conteoExistente.materiales = materialesActualizados
      conteoExistente.usuarioModificador = usuarioCreador
      conteoExistente.fechaModificacion = new Date()
      conteoExistente.horaModificacion = horaActual
      conteoExistente.estado = "pendiente" // Establecer estado como pendiente

      await conteoExistente.save()
      return res.status(200).json({ message: "Conteo actualizado correctamente", conteo: conteoExistente })
    } else {
      // Si no existe, crear nuevo
      const nuevoConteo = new Conteo({
        IBLNR: normalizedIBLNR, // Guardar el IBLNR normalizado
        WERKS: conteoData.WERKS,
        LGORT: conteoData.LGORT,
        BLDAT: conteoData.BLDAT,
        USNAM: conteoData.USNAM,
        XBLNI: conteoData.XBLNI,
        materiales: materialesActualizados,
        usuarioCreador,
        fechaCreacion: new Date(),
        horaCreacion: horaActual,
        estado: "pendiente", // Establecer estado como pendiente
      })

      await nuevoConteo.save()
      return res.status(201).json({ message: "Conteo guardado correctamente", conteo: nuevoConteo })
    }
  } catch (error) {
    console.error("Error al guardar conteo:", error)
    return res.status(500).json({ message: "Error al guardar conteo", error: error.message })
  }
}

// Modificar la función procesarConteo para actualizar el estado
export const procesarConteo = async (req: Request, res: Response) => {
  try {
    const { conteoId, usuarioProcesador } = req.body

    if (!conteoId || !usuarioProcesador) {
      return res.status(400).json({ message: "ID de conteo y usuario procesador son requeridos" })
    }

    const conteo = await Conteo.findById(conteoId)

    if (!conteo) {
      return res.status(404).json({ message: "Conteo no encontrado" })
    }

    // Aquí iría la lógica para procesar el conteo en el sistema externo
    // Por ahora, solo actualizamos el estado en nuestra base de datos

    conteo.usuarioModificador = usuarioProcesador
    conteo.fechaModificacion = new Date()
    conteo.horaModificacion = getCurrentTime()
    conteo.estado = "procesado" // Actualizar el estado a procesado

    await conteo.save()

    return res.status(200).json({ message: "Conteo procesado correctamente", conteo })
  } catch (error) {
    console.error("Error al procesar conteo:", error)
    return res.status(500).json({ message: "Error al procesar conteo", error: error.message })
  }
}

// Función para eliminar un material de un conteo
export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { conteoData, materialMATNR, usuarioEliminador } = req.body

    if (!conteoData || !materialMATNR || !usuarioEliminador) {
      return res.status(400).json({ message: "Datos incompletos para eliminar el material" })
    }

    // Normalizar el IBLNR para la búsqueda
    const normalizedIBLNR = normalizeIBLNR(conteoData.IBLNR.toString())

    // Buscar el conteo en la base de datos usando la búsqueda flexible
    const conteo = await Conteo.findOne({
      $or: [
        { IBLNR: normalizedIBLNR },
        { IBLNR: conteoData.IBLNR.toString() },
        { IBLNR: { $regex: new RegExp(`^0*${normalizedIBLNR}\\s*$`) } },
      ],
    })

    if (!conteo) {
      return res.status(404).json({ message: "Conteo no encontrado" })
    }

    // Filtrar el material a eliminar
    conteo.materiales = conteo.materiales.filter((material) => material.MATNR !== materialMATNR)

    // Actualizar información de modificación
    conteo.usuarioModificador = usuarioEliminador
    conteo.fechaModificacion = new Date()
    conteo.horaModificacion = getCurrentTime()

    await conteo.save()

    return res.status(200).json({ message: "Material eliminado correctamente", conteo })
  } catch (error) {
    console.error("Error al eliminar material:", error)
    return res.status(500).json({ message: "Error al eliminar material", error: error.message })
  }
}

// Función para obtener todos los conteos de la base de datos
export const getAllConteos = async (req: Request, res: Response) => {
  try {
    const { estado } = req.query

    // Construir el filtro basado en los parámetros de consulta
    const filter: any = {}

    // Si se proporciona un estado, filtrar por él
    if (estado && estado !== "all") {
      filter.estado = estado
    }

    // Obtener los conteos de la base de datos con el filtro aplicado
    const conteos = await Conteo.find(filter)
      .sort({ fechaCreacion: -1 }) // Ordenar por fecha de creación descendente
      .lean() // Convertir a objetos planos para mejor rendimiento

    return res.status(200).json({
      success: true,
      message: "Conteos obtenidos correctamente",
      data: conteos,
      count: conteos.length,
    })
  } catch (error) {
    console.error("Error al obtener conteos:", error)
    return res.status(500).json({
      success: false,
      message: "Error al obtener conteos",
      error: error.message,
    })
  }
}

// Modificar esta función para enviar la estructura completa del conteo a un sistema externo
export const sendConteoStructure = async (req: Request, res: Response) => {
  try {
    const { conteoId } = req.body

    console.log("Conteo ID recibido:", conteoId)

    if (!conteoId) {
      return res.status(400).json({
        success: false,
        message: "El ID del conteo es requerido",
      })
    }

    console.log("Buscando conteo en la base de datos...")
    // Buscar el conteo en la base de datos
    const conteo = await Conteo.findById(conteoId).lean()

    if (!conteo) {
      return res.status(404).json({
        success: false,
        message: "Conteo no encontrado",
      })
    }

    // Preparar la estructura completa del conteo para enviar
    // Incluir ABSOLUTAMENTE TODOS los datos disponibles
    const conteoStructure = {
      // Datos básicos del conteo
      IBLNR: conteo.IBLNR,
      WERKS: conteo.WERKS,
      LGORT: conteo.LGORT,
      BLDAT: conteo.BLDAT,
      USNAM: conteo.USNAM,
      XBLNI: conteo.XBLNI,

      // Materiales con todos sus detalles y cases
      materiales: conteo.materiales.map((material) => ({
        MATNR: material.MATNR,
        MAKTX: material.MAKTX,
        MENGE: material.MENGE,
        MEINS: material.MEINS,
        casesRegistrados: material.casesRegistrados.map((caseItem) => ({
          case: caseItem.case,
          ubicacion: caseItem.ubicacion,
          cantidad: caseItem.cantidad,
          estado: caseItem.estado,
          excepcion: caseItem.excepcion,
          color: caseItem.color,
          werks: caseItem.werks,
          lgort: caseItem.lgort,
          diferencia: caseItem.diferencia,
          // Incluir cualquier otro campo que pueda estar presente en los cases
          ...caseItem,
        })),
        // Incluir cualquier otro campo que pueda estar presente en los materiales
        ...material,
      })),

      // Incluir cualquier otro campo que pueda estar presente en el conteo
      ...conteo,
    }

    // Enviar la estructura completa del conteo al sistema externo
    try {

      const usuario = process.env.SAP_USER;
      const contrasena = process.env.SAP_PASS;
      const credenciales = Buffer.from(`${usuario}:${contrasena}`).toString('base64');

      console.log("Enviando conteo a sistema externo...", conteo)
      const response = await axios.post(`${process.env.SAP_API_URL}/zapi/procesa-conteo`, conteo, {
        headers: {
          'Authorization': `Basic ${credenciales}`,
          'Accept': 'application/json' 
        }
      });

      console.log("Respuesta del sistema externo:", response.data)
      // Actualizar el estado del conteo a "enviado" si la respuesta es exitosa
      console.log("Estado de la respuesta:", response.data.success)
      if (response.data.SUCCESS) {
        console.log("Conteo enviado correctamente al sistema externo")
        await Conteo.findByIdAndUpdate(conteoId, {
          estado: "enviado",
          usuarioModificador: conteo.usuarioModificador || conteo.usuarioCreador,
          fechaModificacion: new Date(),
          horaModificacion: getCurrentTime(),
        })

        return res.status(200).json({
          success: true,
          message: response.data.MESSAGE || "Conteo enviado correctamente",
          data: response.data,
        })
      } else {
        return res.status(400).json({
          success: false,
          message: response.data.MESSAGE || "Error al enviar el conteo",
          error: response.data,
        })
      }
    } catch (error) {
      console.error("Error al enviar estructura del conteo al sistema externo:", error)
      return res.status(500).json({
        success: false,
        message: "Error al enviar estructura del conteo al sistema externo",
        error: error.message,
      })
    }
  } catch (error) {
    console.error("Error al procesar la estructura del conteo:", error)
    return res.status(500).json({
      success: false,
      message: "Error al procesar la estructura del conteo",
      error: error.message,
    })
  }
}