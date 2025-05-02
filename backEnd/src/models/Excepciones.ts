import mongoose, { Schema, type Document } from "mongoose"

export interface IExcepcion extends Document {
  id: string
  name: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const ExcepcionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
)

// Crear índices para mejorar el rendimiento de las consultas
// ExcepcionSchema.index({ id: 1 })
ExcepcionSchema.index({ active: 1 })

const Excepcion = mongoose.model<IExcepcion>("Excepcion", ExcepcionSchema)

export default Excepcion

