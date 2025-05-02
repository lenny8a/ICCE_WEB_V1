import mongoose, { Document, Schema, Model } from 'mongoose';

// Interfaces para definir la estructura de datos
export interface IPickingItem {
  material: string;
  materialCode: string;
  materialDesc: string;
  location: string;
  case: string;
  quantity: number;
  werks: string; // Nuevo campo Centro
  lgort: string; // Nuevo campo Almacén
}

export interface IPicking extends Document {
  reserva: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'accounted';
  items: IPickingItem[];
  totalItems: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  mblnr?: string 
  anulado?: boolean // Indicador de anulación
  mblnr_an?: string // Código de anulación
  tipodoc?: string // Tipo de documento
  getTotalQuantity: () => number;
}

// Esquema para los elementos individuales de picking
const PickingItemSchema = new Schema<IPickingItem>({
  material: {
    type: String,
    required: true,
    index: true
  },
  materialCode: {
    type: String,
    required: true,
    index: true
  },
  materialDesc: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  case: {
    type: String,
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  werks: {
    type: String,
  },
  lgort: {
    type: String,
  }
});

// Esquema principal para el documento de picking
const PickingSchema = new Schema<IPicking>({
  reserva: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'accounted'],
    default: 'completed',
    index: true
  },
  items: [PickingItemSchema],
  totalItems: {
    type: Number,
    default: function(this: IPicking) {
      return this.items.length;
    }
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  mblnr: { type: String },
  anulado: { type: Boolean, default: false }, // Indicador de anulación
  mblnr_an: { type: String }, // Código de anulación
  tipodoc: { type: String } // Tipo de documento
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  collection: 'pickings'
});

// Método para calcular la cantidad total de todos los items
PickingSchema.methods.getTotalQuantity = function(this: IPicking): number {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

// Índice compuesto para búsquedas frecuentes
PickingSchema.index({ reserva: 1, createdAt: -1 });

// Crear y exportar el modelo
const Picking: Model<IPicking> = mongoose.model<IPicking>('Picking', PickingSchema);

export default Picking;