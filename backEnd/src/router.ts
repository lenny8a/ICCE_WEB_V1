import { Router } from "express"
import { body } from 'express-validator'
import { anulaMigo, createExcepcion, deleteExcepcion, deleteMaterial, excepcion, excepcionCases, getAllConteos, getAllExcepciones, getAllPickings, getConteo, getConteoDB, getConteol, getPickingByReserva, getUbicacionLogs, logUbicacion, migo, procesarConteo, reserva, reubica, saveConteo, savePicking, sendConteoStructure, test, updateExcepcion, updatePickingStatus, viewEmbal } from './handlers'
import { handleInputError } from './middleware/validation'

import { get } from "axios";
import { register, getAllUsers, getUserById, updateUser, updatePassword, deleteUser, getUserPermissions, login } from './handlers/UserController';
import { authMiddleware } from './middleware/AuthMiddleware';
import { createRole, deleteRole, getAllRoles, getRoleById, getRolePermissions, updateRole } from './handlers/RoleController';
import { createPage, deletePage, getAllPages, getPageById, updatePage } from './handlers/PageController';
import { deletePermission, getAllPermissions, getPermissionById, setPermissions } from './handlers/PermissionController';

const router = Router()

/** Autenticacion y registro */
// router.post('/auth/register',
//     body('handle').notEmpty().withMessage('Nombre de usuario requerido'),
//     body('name').notEmpty().withMessage('Nombre requerido'),
//     body('email').isEmail().withMessage('Correo invalido'),
//     body('password').isLength({ min: 8 }).withMessage('El password debe tener al menos 8 caracteres'),
//     handleInputError,
//     createAccount)

// router.post('/auth/login',
//     body('email').isEmail().withMessage('Correo invalido'),
//     body('password').isLength({ min: 8 }).withMessage('El password es requerido'),
//     handleInputError,
//     login
// )

router.post('/entr/view',
    body('embal').isLength({ min: 1 }).withMessage('Número de embalaje es requerido'),
    handleInputError,
    viewEmbal
)

router.post('/entr/reubica',
    body('embal').isLength({ min: 1 }).withMessage('Número de embalaje es requerido'),
    //body('zubic').isLength({ min:1 }).withMessage('Ubicación es requerida'),
    handleInputError,
    reubica
)

router.post('/entr/excepcion',
    body('embal').isLength({ min: 1 }).withMessage('Número de embalaje es requerido'),
    body('zexcu_wms').isLength({ min: 1 }).withMessage('Excepción es requerida'),
    handleInputError,
    excepcion
)

router.get('/entr/caseEx',
    excepcionCases
)

router.post('/salida/reserva',
    body('reserva').isLength({ min: 1 }).withMessage('Número de reserva es requerido'),
    handleInputError,
    reserva
)

router.post('/salida/migo',
    body('reserva').isLength({ min: 1 }).withMessage('Número de reserva es requerido'),
    handleInputError,
    migo
)

router.post('/salida/anular',
    body('mblnr').isLength({ min: 1 }).withMessage('Número documento MIGO es requerido'),
    handleInputError,
    anulaMigo
)

// Rutas para  picking
router.post('/salida/picking', savePicking);
router.get('/salida/picking/:reserva', getPickingByReserva);
router.get('/salida/pickings', getAllPickings);
router.put("/salida/picking/:reserva/status", updatePickingStatus)

// Rutas para el registro de ubicaciones
router.post("/ubicacion-log", logUbicacion)
router.get("/ubicacion-log/:embal", getUbicacionLogs)

// Rutas para Mantenimietnos  excepciones
router.get("/api/excepciones", getAllExcepciones)
router.post("/api/excepciones", createExcepcion)
router.put("/api/excepciones/:id", updateExcepcion)
router.delete("/api/excepciones/:id", deleteExcepcion)

//Rutas para conteos
router.post('/cont/conteo',
    body('conteo').isLength({ min: 1 }).withMessage('Documento de inventario requerido'),
    handleInputError,
    getConteo
)

// Ruta para obtener un conteo por su número de documento
router.post("/cont/conteo", getConteo)

// Ruta para obtener un conteo directamente de la base de datos
router.post("/cont/get-conteo-db", getConteoDB)

// Ruta para obtener un conteo (primero busca en DB, luego en sistema externo)
router.post("/cont/conteo", getConteol)

// Asegúrate de que la ruta getConteo esté correctamente configurada
// Si no existe, agrégala a las rutas
router.post("/cont/getConteo", getConteo)

// Ruta para guardar un conteo
router.post("/cont/save-conteo", saveConteo)

// Ruta para procesar un conteo
router.post("/cont/procesar-conteo", procesarConteo)

// Ruta para eliminar un material de un conteo
router.post("/cont/delete-material", deleteMaterial)

// Ruta para obtener todos los conteos
router.get("/conteos", getAllConteos)
router.post("/cont/procesa-conteo", sendConteoStructure)

// Public routes
router.post("/auth/register", register)
router.post("/auth/login", login)

// Ruta para restablecer contraseña olvidada (sin autenticación, requiere email y nueva contraseña)
router.post(
  "/auth/reset-password", authMiddleware,
  body("email").isEmail().withMessage("Correo electrónico válido requerido"),
  body("newPassword").isLength({ min: 8 }).withMessage("La nueva contraseña debe tener al menos 8 caracteres"),
  handleInputError,
  require("./handlers/UserController").resetPassword
)

// Protected routes
router.get("/user/", authMiddleware, getAllUsers)
router.get("/user/:id", authMiddleware, getUserById)
router.put("/user/:id", authMiddleware, updateUser)
router.put("/user/:id/password", authMiddleware, updatePassword)
router.delete("/user/:id", authMiddleware, deleteUser)
router.get("/user/:id/permissions", authMiddleware, getUserPermissions)

router.post("/role/", authMiddleware, createRole)
router.get("/role/", authMiddleware, getAllRoles)
router.get("/role/:id", authMiddleware, getRoleById)
router.put("/role/:id", authMiddleware, updateRole)
router.delete("role/:id", authMiddleware, deleteRole)
router.get("/role/:id/permissions", authMiddleware, getRolePermissions)

router.post("/page/", authMiddleware, createPage)
router.get("/page/", authMiddleware, getAllPages)
router.get("/page/:id", authMiddleware, getPageById)
router.put("/page/:id", authMiddleware, updatePage)
router.delete("/page/:id", authMiddleware, deletePage)

router.post("/permis/", authMiddleware, setPermissions)
router.get("/permis/", authMiddleware, getAllPermissions)
router.get("/permis/:id", authMiddleware, getPermissionById)
router.delete("/permis/:id", authMiddleware, deletePermission)


export default router