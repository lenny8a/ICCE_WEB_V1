import mongoose, { type Document, Schema } from "mongoose"

export enum ActionType {
  VIEW = "visualizar",
  MODIFY = "modificar",
  DELETE = "borrar",
  ACCOUNT = "contabilizar",
  CANCEL = "anular",
}

export interface IPermission extends Document {
  role: mongoose.Types.ObjectId
  page: mongoose.Types.ObjectId
  actions: ActionType[]
  createdAt: Date
  updatedAt: Date
}

const PermissionSchema = new Schema<IPermission>(
  {
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    page: {
      type: Schema.Types.ObjectId,
      ref: "Page",
      required: true,
    },
    actions: [
      {
        type: String,
        enum: Object.values(ActionType),
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Compound index to ensure unique role-page combinations
PermissionSchema.index({ role: 1, page: 1 }, { unique: true })

export default mongoose.model<IPermission>("Permission", PermissionSchema)
