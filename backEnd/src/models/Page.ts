import mongoose, { type Document, Schema } from "mongoose"

export interface IPage extends Document {
  name: string
  path: string
  description: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PageSchema = new Schema<IPage>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IPage>("Page", PageSchema)
