// frontend/src/types/picking.d.ts

export interface CaseReserva {
  CASE: string
  UBICACION: string
  CANTIDAD: string
  WERKS?: string // Centro
  LGORT?: string // Almacén
}

export interface MaterialReserva {
  MATNR: string
  MAKTX: string
  MENGE: string
  MEINS: string
  CASES: CaseReserva[]
}

export interface ReservaData {
  RESERVA: string
  MATERIALES: MaterialReserva[]
  TIPODOC?: string
  WERKS?: string
  LGORT?: string
}

export interface RegisteredItem {
  id: string
  material: string
  materialDesc?: string
  location: string
  quantity: string
  case: string
  materialCode: string
  werks?: string
  lgort?: string
}

export interface PickingItem {
  material: string
  materialDesc?: string
  materialCode: string
  location: string
  case: string
  quantity: string
  werks?: string
  lgort?: string
}

export interface PickingResponseData { // Renamed from PickingResponse["data"] for clarity
  reserva: string
  items: PickingItem[]
  totalItems: number
  status: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PickingResponse {
  success: boolean
  message: string
  data?: PickingResponseData
}

export interface ExcepcionData {
  _id: string
  id: string
  name: string
  active: boolean
}
