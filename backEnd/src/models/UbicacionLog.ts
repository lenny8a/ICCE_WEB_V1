import mongoose, { Schema, type Document } from "mongoose"

export interface IUbicacionLog extends Document {
  embal: string
  ubicacionAnterior: string
  ubicacionNueva: string
  usuario: string
  fecha: Date
  matnr?: string
  maktx?: string
}

const UbicacionLogSchema = new Schema(
  {
    embal: { type: String, required: true, index: true },
    ubicacionAnterior: { type: String, default: "" },
    ubicacionNueva: { type: String, required: true },
    usuario: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    matnr: { type: String },
    maktx: { type: String },
  },
  { timestamps: true },
)

// Crear índices para mejorar el rendimiento de las consultas
UbicacionLogSchema.index({ embal: 1, fecha: -1 })

const UbicacionLog = mongoose.model<IUbicacionLog>("UbicacionLog", UbicacionLogSchema)

export default UbicacionLog

