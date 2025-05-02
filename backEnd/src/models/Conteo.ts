import mongoose, { Schema, type Document, type Model } from "mongoose"

// Definir la interfaz para el Case
export interface ICase {
  case: string
  ubicacion: string
  cantidad: string
  estado: string
  excepcion: string
  color?: string
  werks?: string
  lgort?: string
  diferencia?: number
}

// Definir la interfaz para el Material
export interface IMaterial {
  MATNR: string
  MAKTX: string
  MENGE: string
  MEINS: string
  casesRegistrados: ICase[]
}

// Definir la interfaz para el documento de Conteo
export interface IConteoDocument extends Document {
  IBLNR: string
  WERKS: string
  LGORT: string
  BLDAT: string
  USNAM: string
  XBLNI: string
  materiales: IMaterial[]
  usuarioCreador: string
  fechaCreacion: Date
  horaCreacion: string
  usuarioModificador: string
  fechaModificacion: Date
  horaModificacion: string
  estado: "pendiente" | "procesado" // Agregar campo de estado
}

// Definir el esquema para el Case
const CaseSchema: Schema = new Schema(
  {
    case: { type: String, required: true },
    ubicacion: { type: String, required: true },
    cantidad: { type: String, required: true },
    estado: { type: String, required: true },
    excepcion: { type: String, required: true },
    color: { type: String },
    werks: { type: String },
    lgort: { type: String },
    diferencia: { type: Number },
  },
  { _id: false },
)

// Definir el esquema para el Material
const MaterialSchema: Schema = new Schema(
  {
    MATNR: { type: String, required: true },
    MAKTX: { type: String, required: true },
    MENGE: { type: String },
    MEINS: { type: String },
    casesRegistrados: [CaseSchema],
  },
  { _id: false },
)

// Definir el esquema para el Conteo
const ConteoSchema: Schema = new Schema({
  IBLNR: { type: String, required: true },
  WERKS: { type: String, required: true },
  LGORT: { type: String, required: true },
  BLDAT: { type: String },
  USNAM: { type: String },
  XBLNI: { type: String },
  materiales: [MaterialSchema],
  usuarioCreador: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  horaCreacion: { type: String, required: true },
  usuarioModificador: { type: String },
  fechaModificacion: { type: Date },
  horaModificacion: { type: String },
  estado: { type: String, enum: ["pendiente", "procesado"], default: "pendiente" }, // Agregar campo de estado con valor por defecto
})

// Crear y exportar el modelo
const ConteoModel: Model<IConteoDocument> = mongoose.model<IConteoDocument>("Conteo", ConteoSchema)
export default ConteoModel
